'use client'
import { useState, useMemo } from 'react'
import Nav from '@/components/Nav'
import { useSessions, useTasks, useAnalytics, fmtDuration, CATEGORIES } from '@/hooks/useData'

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function getLastNDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.now() - (n - 1 - i) * 86_400_000)
    return { date: d, key: d.toDateString(), label: DAYS[d.getDay()] }
  })
}

function getInsights({ byDay, byCategory, avgSessionLen, peakHour, moodCounts, weekSessions, tasks }) {
  const insights = []

  // Peak hour
  if (peakHour !== undefined) {
    const h = parseInt(peakHour)
    const timeStr = h >= 12 ? `${h > 12 ? h - 12 : 12}pm` : `${h === 0 ? 12 : h}am`
    insights.push({
      type: 'green',
      icon: '◎',
      text: `<strong>Peak focus window:</strong> You do the most sessions around ${timeStr}. Try to protect that time for your hardest tasks.`,
    })
  }

  // Estimation accuracy
  const tasksWithBoth = tasks.filter(t => t.estimate && t.actualTime && t.actualTime > 0)
  if (tasksWithBoth.length >= 2) {
    const totalEst = tasksWithBoth.reduce((a, t) => a + t.estimate, 0)
    const totalAct = tasksWithBoth.reduce((a, t) => a + t.actualTime, 0)
    const ratio = totalAct / totalEst
    const pct = Math.round(Math.abs(ratio - 1) * 100)
    if (ratio > 1.1) {
      insights.push({
        type: 'gold',
        icon: '⏱',
        text: `<strong>You're underestimating by ${pct}%.</strong> Your tasks are taking longer than planned. Add a ${pct}% buffer when estimating deep work.`,
      })
    } else if (ratio < 0.9) {
      insights.push({
        type: 'blue',
        icon: '↑',
        text: `<strong>Estimation accuracy improved.</strong> You're finishing ${pct}% faster than estimated — great sign you're getting better at scoping.`,
      })
    } else {
      insights.push({
        type: 'green',
        icon: '✓',
        text: `<strong>Solid estimation accuracy.</strong> Your time estimates are within 10% of actuals. You know your pace well.`,
      })
    }
  }

  // Dead days
  const days = Object.entries(byDay)
  const deadDays = days.filter(([, v]) => v === 0).length
  if (deadDays >= 2) {
    insights.push({
      type: 'rose',
      icon: '⚠',
      text: `<strong>${deadDays} days this week had zero focus logged.</strong> Consider protecting at least a 25-minute block each morning, even on busy days.`,
    })
  }

  // Mood
  const flowCount = moodCounts['flow'] || 0
  if (flowCount >= 3) {
    insights.push({
      type: 'gold',
      icon: '🔥',
      text: `<strong>${flowCount} flow sessions this week</strong> — you're in a great rhythm. Keep doing whatever you did on your best days.`,
    })
  }

  // Session length
  if (avgSessionLen > 0) {
    if (avgSessionLen < 15) {
      insights.push({
        type: 'rose',
        icon: '◎',
        text: `<strong>Sessions averaging only ${avgSessionLen} minutes.</strong> Very short sessions suggest interruptions. Try a longer timer — even 20 minutes of uninterrupted work changes outcomes.`,
      })
    } else if (avgSessionLen >= 45) {
      insights.push({
        type: 'green',
        icon: '✦',
        text: `<strong>Averaging ${avgSessionLen}-minute sessions.</strong> Long, sustained focus periods. This is where real progress happens.`,
      })
    }
  }

  // Category imbalance
  const catTotal = Object.values(byCategory).reduce((a, b) => a + b, 0)
  if (catTotal > 0) {
    const adminPct = Math.round(((byCategory['admin'] || 0) / catTotal) * 100)
    if (adminPct > 50) {
      insights.push({
        type: 'rose',
        icon: '↕',
        text: `<strong>${adminPct}% of your time went to Admin.</strong> Deep work and learning got crowded out. Try time-boxing admin to afternoons only.`,
      })
    }
  }

  return insights.slice(0, 4)
}

export default function ClarityPage() {
  const { sessions }    = useSessions()
  const { tasks }       = useTasks()
  const analytics       = useAnalytics(sessions)
  const [weekOffset, setWeekOffset] = useState(0) // 0 = this week

  const { byDay, byCategory, avgSessionLen, peakHour, moodCounts, totalFocusWeek, weekSessions } = analytics

  const days7 = useMemo(() => getLastNDays(7), [])

  // Max for bar scaling
  const maxDayFocus = Math.max(...Object.values(byDay), 1)

  const completedThisWeek = tasks.filter(t => {
    if (!t.completedAt) return false
    return t.completedAt > Date.now() - 7 * 86_400_000
  }).length

  const flowSessions = weekSessions.filter(s => s.mood === 'flow').length

  const bestDay = useMemo(() => {
    const sorted = Object.entries(byDay).sort((a, b) => b[1] - a[1])
    if (!sorted[0] || sorted[0][1] === 0) return null
    const d = new Date(sorted[0][0])
    return DAYS[d.getDay()]
  }, [byDay])

  const insights = useMemo(() => getInsights({ byDay, byCategory, avgSessionLen, peakHour, moodCounts, weekSessions, tasks }), [byDay, byCategory, avgSessionLen, peakHour, moodCounts, weekSessions, tasks])

  const catTotal = Object.values(byCategory).reduce((a, b) => a + b, 0)

  return (
    <>
      <Nav />
      <div className="page page-inner">
        <div className="section-header">
          <div>
            <h1 className="section-title">Clarity <em>report</em></h1>
            <p className="section-sub">A weekly picture of where your time actually went</p>
          </div>
          <div className="clarity-week-nav">
            <span style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>This week</span>
          </div>
        </div>

        {weekSessions.length === 0 ? (
          <div className="empty-state" style={{ padding: '5rem 2rem' }}>
            <div className="empty-state-icon" style={{ fontSize: '2.5rem' }}>◈</div>
            <h3>No data yet</h3>
            <p>Complete some focus sessions and tasks to see your weekly clarity report here.</p>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="stats-grid" style={{ marginBottom: '1.25rem' }}>
              <div className="stat-card">
                <div className="stat-label">Total focus</div>
                <div className="stat-val gold">{fmtDuration(totalFocusWeek)}</div>
                <div className="stat-delta">{weekSessions.length} sessions</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Tasks completed</div>
                <div className="stat-val">{completedThisWeek}</div>
                <div className="stat-delta">{tasks.filter(t => !t.completed).length} still open</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Avg session</div>
                <div className="stat-val green">{avgSessionLen}m</div>
                <div className="stat-delta">{bestDay ? `Best day: ${bestDay}` : 'Keep logging'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Flow sessions</div>
                <div className="stat-val">{flowSessions}</div>
                <div className="stat-delta">{flowSessions > 0 ? 'Keep the rhythm' : 'Rate sessions in Focus'}</div>
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
              {/* Daily rhythm */}
              <div className="card">
                <div className="card-title">Daily rhythm</div>
                {days7.map(({ key, label }) => {
                  const secs = byDay[key] || 0
                  const pct  = (secs / maxDayFocus) * 100
                  const daySessions = weekSessions.filter(s => new Date(s.at).toDateString() === key)
                  // Break down by category for this day
                  const catBreakdown = daySessions.reduce((acc, s) => {
                    acc[s.category] = (acc[s.category] || 0) + (s.duration || 0)
                    return acc
                  }, {})
                  const total = Object.values(catBreakdown).reduce((a, b) => a + b, 0)

                  return (
                    <div key={key} className="clarity-day-row">
                      <div className="clarity-day">{label}</div>
                      <div className="clarity-blocks">
                        {total > 0 ? Object.entries(catBreakdown).map(([cat, dur]) => (
                          <div
                            key={cat}
                            className="clarity-block"
                            style={{
                              width: `${(dur / maxDayFocus) * 100}%`,
                              background: CATEGORIES[cat]?.color || 'var(--border3)',
                            }}
                            title={`${CATEGORIES[cat]?.label}: ${fmtDuration(dur)}`}
                          />
                        )) : (
                          <div style={{ height: '18px', flex: 1, background: 'var(--bg3)', borderRadius: '3px', opacity: 0.4 }} />
                        )}
                      </div>
                      <div className="clarity-hrs">{secs > 0 ? fmtDuration(secs) : '—'}</div>
                    </div>
                  )
                })}
              </div>

              {/* Category breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="card">
                  <div className="card-title">Time by category</div>
                  {catTotal > 0 ? Object.entries(byCategory)
                    .filter(([, v]) => v > 0)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, secs]) => {
                      const pct = Math.round((secs / catTotal) * 100)
                      const info = CATEGORIES[cat] || { label: cat, color: 'var(--border3)', tagClass: 'tag-focus' }
                      return (
                        <div key={cat} className="bar-row">
                          <div className="bar-label">{info.label}</div>
                          <div className="bar-track">
                            <div className="bar-fill" style={{ width: `${pct}%`, background: info.color }} />
                          </div>
                          <div className="bar-num">{fmtDuration(secs)}</div>
                        </div>
                      )
                    }) : (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>Tag your sessions with categories to see breakdown.</p>
                  )}
                </div>

                {/* Mood breakdown */}
                {Object.keys(moodCounts).length > 0 && (
                  <div className="card">
                    <div className="card-title">Session quality</div>
                    {[
                      { id: 'flow',       emoji: '🔥', label: 'In flow' },
                      { id: 'focused',    emoji: '😤', label: 'Focused' },
                      { id: 'distracted', emoji: '😐', label: 'Distracted' },
                      { id: 'struggling', emoji: '😩', label: 'Struggling' },
                    ].filter(m => moodCounts[m.id]).map(m => {
                      const count = moodCounts[m.id] || 0
                      const pct = Math.round((count / weekSessions.length) * 100)
                      return (
                        <div key={m.id} className="bar-row">
                          <div className="bar-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <span style={{ fontSize: '0.9rem' }}>{m.emoji}</span>
                            <span style={{ fontSize: '0.68rem' }}>{m.label}</span>
                          </div>
                          <div className="bar-track">
                            <div className="bar-fill" style={{
                              width: `${pct}%`,
                              background: m.id === 'flow' ? 'var(--gold)' : m.id === 'focused' ? 'var(--green)' : m.id === 'distracted' ? 'var(--rose)' : 'var(--text4)',
                            }} />
                          </div>
                          <div className="bar-num">{count}</div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Insights */}
            {insights.length > 0 && (
              <div className="card">
                <div className="card-title">Weekly insights</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {insights.map((ins, i) => (
                    <div key={i} className={`insight ${ins.type}`}>
                      <span className="insight-icon">{ins.icon}</span>
                      <div className="insight-body" dangerouslySetInnerHTML={{ __html: ins.text }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
