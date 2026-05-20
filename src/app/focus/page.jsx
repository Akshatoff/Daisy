'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Nav from '@/components/Nav'
import { useTasks, useSessions, useSettings, useStreak, fmtTime, fmtDuration, CATEGORIES } from '@/hooks/useData'
import { showToast } from '@/components/Toast'

const MOODS = [
  { id: 'struggling', label: 'Struggling', emoji: '😩' },
  { id: 'distracted', label: 'Distracted', emoji: '😐' },
  { id: 'focused',    label: 'Focused',    emoji: '😤' },
  { id: 'flow',       label: 'In flow',    emoji: '🔥' },
]

const CIRCUMFERENCE = 2 * Math.PI * 100 // r=100 in a 220x220 viewBox

function RingTimer({ value, max, color = 'var(--gold)' }) {
  const offset = CIRCUMFERENCE - (value / max) * CIRCUMFERENCE
  return (
    <svg className="timer-ring-svg" viewBox="0 0 220 220" width="220" height="220">
      <circle className="timer-ring-bg" cx="110" cy="110" r="100" />
      <circle
        className="timer-ring-fill"
        cx="110" cy="110" r="100"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        style={{ stroke: color, transition: 'stroke-dashoffset 1s linear' }}
      />
    </svg>
  )
}

export default function FocusPage() {
  const { tasks, editTask } = useTasks()
  const { sessions, addSession } = useSessions()
  const { settings } = useSettings()
  const { bumpStreak } = useStreak()

  const [mode, setMode]             = useState('pomodoro') // 'pomodoro' | 'stopwatch'
  const [phase, setPhase]           = useState('focus')    // 'focus' | 'short' | 'long'
  const [sessionCount, setCount]    = useState(0)
  const [timeLeft, setTimeLeft]     = useState(settings.focusMins * 60)
  const [totalSecs, setTotalSecs]   = useState(settings.focusMins * 60)
  const [running, setRunning]       = useState(false)
  const [elapsed, setElapsed]       = useState(0)          // stopwatch
  const [selectedTask, setTask]     = useState(null)
  const [mood, setMood]             = useState(null)

  const timerRef  = useRef(null)
  const sessionStart = useRef(null)

  // Sync timer when settings change
  useEffect(() => {
    if (!running) {
      const s = settings.focusMins * 60
      setTimeLeft(s)
      setTotalSecs(s)
    }
  }, [settings.focusMins])

  const phaseTime = useCallback((p) => {
    if (p === 'short') return settings.shortBreakMins * 60
    if (p === 'long')  return settings.longBreakMins * 60
    return settings.focusMins * 60
  }, [settings])

  const logSession = useCallback((duration) => {
    if (duration < 60) return // don't log < 1 min
    const task = tasks.find(t => t.id === selectedTask)
    addSession({
      taskId:   selectedTask,
      taskName: task?.title || null,
      category: task?.category || 'focus',
      duration,
      mood,
      type: mode,
    })
    if (selectedTask) {
      editTask(selectedTask, { actualTime: (task?.actualTime || 0) + duration })
    }
    bumpStreak()
    showToast(`${fmtDuration(duration)} logged`, 'gold')
  }, [selectedTask, tasks, mood, mode, addSession, editTask, bumpStreak])

  const tick = useCallback(() => {
    if (mode === 'stopwatch') {
      setElapsed(e => e + 1)
      return
    }
    setTimeLeft(t => {
      if (t <= 1) {
        // Phase complete
        setRunning(false)
        clearInterval(timerRef.current)

        if (phase === 'focus') {
          const dur = totalSecs
          logSession(dur)
          const next = sessionCount + 1
          setCount(next)
          const nextPhase = next % settings.sessionsBeforeLongBreak === 0 ? 'long' : 'short'
          setPhase(nextPhase)
          const nextTime = phaseTime(nextPhase)
          setTotalSecs(nextTime)
          return nextTime
        } else {
          setPhase('focus')
          const ft = phaseTime('focus')
          setTotalSecs(ft)
          return ft
        }
      }
      return t - 1
    })
  }, [mode, phase, totalSecs, sessionCount, settings, logSession, phaseTime])

  useEffect(() => {
    if (running) {
      sessionStart.current = sessionStart.current || Date.now()
      timerRef.current = setInterval(tick, 1000)
    } else {
      clearInterval(timerRef.current)
      if (mode === 'stopwatch' && elapsed > 0 && !running) {
        // Will log on stop
      }
    }
    return () => clearInterval(timerRef.current)
  }, [running, tick])

  const startStop = () => {
    if (running) {
      setRunning(false)
      if (mode === 'stopwatch' && elapsed > 60) {
        logSession(elapsed)
        setElapsed(0)
        sessionStart.current = null
      }
    } else {
      setRunning(true)
      sessionStart.current = Date.now()
    }
  }

  const reset = () => {
    setRunning(false)
    clearInterval(timerRef.current)
    sessionStart.current = null
    if (mode === 'stopwatch') {
      setElapsed(0)
    } else {
      const t = phaseTime(phase)
      setTimeLeft(t)
      setTotalSecs(t)
    }
  }

  const switchMode = (m) => {
    reset()
    setMode(m)
    setPhase('focus')
    setCount(0)
    setElapsed(0)
    const t = phaseTime('focus')
    setTimeLeft(t)
    setTotalSecs(t)
  }

  const activeTasks = tasks.filter(t => !t.completed)
  const todaySessions = sessions.filter(s => new Date(s.at).toDateString() === new Date().toDateString())
  const todayFocus = todaySessions.reduce((a, s) => a + (s.duration || 0), 0)

  const phaseLabel = phase === 'focus' ? 'Focus' : phase === 'short' ? 'Short break' : 'Long break'
  const displayTime = mode === 'stopwatch' ? fmtTime(elapsed) : fmtTime(timeLeft)
  const ringValue   = mode === 'stopwatch' ? elapsed % 1500 : timeLeft
  const ringMax     = mode === 'stopwatch' ? 1500 : totalSecs
  const ringColor   = phase === 'focus' ? 'var(--gold)' : 'var(--green)'

  return (
    <>
      <Nav />
      <div className="page page-inner">

        {/* Header */}
        <div className="section-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 className="section-title">Focus</h1>
            <p className="section-sub">
              {todayFocus > 0
                ? `${fmtDuration(todayFocus)} focused today · ${todaySessions.length} sessions`
                : 'Start a session to begin tracking your focus'}
            </p>
          </div>
          <div className="mode-toggle">
            <button className={`mode-toggle-btn ${mode === 'pomodoro' ? 'active' : ''}`} onClick={() => switchMode('pomodoro')}>Pomodoro</button>
            <button className={`mode-toggle-btn ${mode === 'stopwatch' ? 'active' : ''}`} onClick={() => switchMode('stopwatch')}>Stopwatch</button>
          </div>
        </div>

        <div className="focus-layout">
          {/* Timer center */}
          <div className="card focus-center" style={{ minHeight: '420px' }}>
            {mode === 'pomodoro' && (
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                {Array.from({ length: settings.sessionsBeforeLongBreak }).map((_, i) => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < sessionCount % settings.sessionsBeforeLongBreak ? 'var(--gold)' : 'var(--border3)' }} />
                ))}
                <span style={{ fontSize: '0.7rem', color: 'var(--text3)', marginLeft: '0.4rem' }}>{phaseLabel}</span>
              </div>
            )}

            <div className="timer-ring-wrap">
              <RingTimer value={ringValue} max={ringMax} color={ringColor} />
              <div className="timer-inner">
                <div className={`timer-display ${running ? 'running' : ''}`}>{displayTime}</div>
                <div className="timer-label">
                  {mode === 'stopwatch' ? 'elapsed' : `${Math.round((timeLeft / totalSecs) * 100)}% left`}
                </div>
              </div>
            </div>

            <div className="timer-controls">
              <button className="btn btn-outline" onClick={reset}>Reset</button>
              <button className="btn btn-gold" onClick={startStop} style={{ minWidth: '90px', justifyContent: 'center' }}>
                {running ? 'Pause' : (timeLeft < totalSecs || elapsed > 0) ? 'Resume' : 'Start'}
              </button>
            </div>

            {/* Mood */}
            <div>
              <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text3)', marginBottom: '0.5rem', textAlign: 'center' }}>Mood check-in</div>
              <div className="mood-row" style={{ justifyContent: 'center' }}>
                {MOODS.map(m => (
                  <span
                    key={m.id}
                    className={`mood-opt ${mood === m.id ? 'selected' : ''}`}
                    title={m.label}
                    onClick={() => setMood(mood === m.id ? null : m.id)}
                  >
                    {m.emoji}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Task picker */}
            <div className="card">
              <div className="card-title">Working on</div>
              {activeTasks.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>No active tasks — add some in Tasks.</p>
              ) : (
                <div className="focus-task-pick">
                  <div
                    className={`focus-task-opt ${selectedTask === null ? 'selected' : ''}`}
                    onClick={() => setTask(null)}
                  >
                    <span style={{ color: 'var(--text3)', fontSize: '0.75rem' }}>Untagged session</span>
                  </div>
                  {activeTasks.map(t => {
                    const cat = CATEGORIES[t.category] || CATEGORIES.focus
                    return (
                      <div
                        key={t.id}
                        className={`focus-task-opt ${selectedTask === t.id ? 'selected' : ''}`}
                        onClick={() => setTask(t.id)}
                      >
                        <span style={{ flex: 1 }}>{t.title}</span>
                        <span className={`tag ${cat.tagClass}`} style={{ fontSize: '0.6rem' }}>{cat.label}</span>
                        {t.estimate && <span style={{ fontSize: '0.65rem', color: 'var(--text3)' }}>{fmtDuration(t.estimate)}</span>}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Today's log */}
            <div className="card" style={{ flex: 1 }}>
              <div className="card-title">Today's sessions</div>
              {todaySessions.length === 0 ? (
                <div className="empty-state" style={{ padding: '1.5rem' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem', opacity: 0.3 }}>◷</div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>No sessions yet today</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {todaySessions.slice(0, 8).map(s => {
                    const time = new Date(s.at)
                    const hh = String(time.getHours()).padStart(2,'0')
                    const mm = String(time.getMinutes()).padStart(2,'0')
                    const mood = MOODS.find(m => m.id === s.mood)
                    return (
                      <div key={s.id} className="session-log-item">
                        <span className="session-log-time">{hh}:{mm}</span>
                        <span className="session-log-task">{s.taskName || 'Untagged'}</span>
                        {mood && <span title={mood.label} style={{ fontSize: '0.85rem' }}>{mood.emoji}</span>}
                        <span className="session-log-dur">{fmtDuration(s.duration)}</span>
                      </div>
                    )
                  })}
                  {todaySessions.length > 8 && (
                    <p style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: '0.5rem' }}>+{todaySessions.length - 8} more — see Clarity for full history</p>
                  )}
                </div>
              )}
            </div>

            {/* Stats */}
            {todaySessions.length > 0 && (
              <div className="card">
                <div className="card-title">Today's quality</div>
                <div>
                  {Object.entries(
                    todaySessions.reduce((acc, s) => {
                      if (s.mood) acc[s.mood] = (acc[s.mood] || 0) + 1
                      return acc
                    }, {})
                  ).map(([k, v]) => {
                    const m = MOODS.find(x => x.id === k)
                    if (!m) return null
                    const pct = (v / todaySessions.length) * 100
                    return (
                      <div key={k} className="bar-row">
                        <div className="bar-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <span style={{ fontSize: '0.9rem' }}>{m.emoji}</span>
                          <span style={{ fontSize: '0.68rem' }}>{m.label}</span>
                        </div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${pct}%`, background: k === 'flow' ? 'var(--gold)' : k === 'focused' ? 'var(--green)' : k === 'distracted' ? 'var(--rose)' : 'var(--text3)' }} />
                        </div>
                        <div className="bar-num">{v}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
