'use client'
import { useState, useEffect, useCallback } from 'react'

// ─── Helpers ────────────────────────────────────────────────
function load(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch { return fallback }
}

function save(key, value) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

// ─── Tasks ──────────────────────────────────────────────────
export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setTasks(load('daisy_tasks', []))
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) save('daisy_tasks', tasks)
  }, [tasks, loaded])

  const addTask = useCallback((title, { category = 'focus', estimate = null, dueDate = null, isDaily = false } = {}) => {
    const task = {
      id: crypto.randomUUID(),
      title,
      category,
      estimate,
      dueDate,
      isDaily,
      completed: false,
      actualTime: null,
      createdAt: Date.now(),
      completedAt: null,
    }
    setTasks(t => [task, ...t])
    return task.id
  }, [])

  const toggleTask = useCallback((id) => {
    setTasks(t => t.map(x => x.id === id
      ? { ...x, completed: !x.completed, completedAt: !x.completed ? Date.now() : null }
      : x
    ))
  }, [])

  const deleteTask = useCallback((id) => {
    setTasks(t => t.filter(x => x.id !== id))
  }, [])

  const editTask = useCallback((id, updates) => {
    setTasks(t => t.map(x => x.id === id ? { ...x, ...updates } : x))
  }, [])

  const clearCompleted = useCallback(() => {
    setTasks(t => t.filter(x => !x.completed))
  }, [])

  // Reset daily tasks at midnight
  useEffect(() => {
    const check = () => {
      const last = load('daisy_daily_reset', null)
      const today = new Date().toDateString()
      if (last !== today) {
        setTasks(t => t.map(x => x.isDaily ? { ...x, completed: false, completedAt: null } : x))
        save('daisy_daily_reset', today)
      }
    }
    check()
    const id = setInterval(check, 60_000)
    return () => clearInterval(id)
  }, [])

  return { tasks, addTask, toggleTask, deleteTask, editTask, clearCompleted }
}

// ─── Sessions (focus log) ────────────────────────────────────
export function useSessions() {
  const [sessions, setSessions] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setSessions(load('daisy_sessions', []))
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) save('daisy_sessions', sessions)
  }, [sessions, loaded])

  const addSession = useCallback((session) => {
    setSessions(s => [{ id: crypto.randomUUID(), ...session, at: Date.now() }, ...s])
  }, [])

  const deleteSession = useCallback((id) => {
    setSessions(s => s.filter(x => x.id !== id))
  }, [])

  return { sessions, addSession, deleteSession }
}

// ─── Notes ───────────────────────────────────────────────────
export function useNotes() {
  const [notes, setNotes] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setNotes(load('daisy_notes', []))
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) save('daisy_notes', notes)
  }, [notes, loaded])

  const addNote = useCallback((note) => {
    const n = { id: crypto.randomUUID(), ...note, createdAt: Date.now(), updatedAt: Date.now() }
    setNotes(ns => [n, ...ns])
    return n.id
  }, [])

  const updateNote = useCallback((id, updates) => {
    setNotes(ns => ns.map(n => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n))
  }, [])

  const deleteNote = useCallback((id) => {
    setNotes(ns => ns.filter(n => n.id !== id))
  }, [])

  return { notes, addNote, updateNote, deleteNote }
}

// ─── Streak ─────────────────────────────────────────────────
export function useStreak() {
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    const data = load('daisy_streak', { count: 0, lastDate: null })
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86_400_000).toDateString()

    if (data.lastDate === today) {
      setStreak(data.count)
    } else if (data.lastDate === yesterday) {
      setStreak(data.count) // will increment when session done today
    } else {
      setStreak(0)
    }
  }, [])

  const bumpStreak = useCallback(() => {
    const today = new Date().toDateString()
    const data = load('daisy_streak', { count: 0, lastDate: null })
    if (data.lastDate === today) return
    const yesterday = new Date(Date.now() - 86_400_000).toDateString()
    const newCount = data.lastDate === yesterday ? data.count + 1 : 1
    save('daisy_streak', { count: newCount, lastDate: today })
    setStreak(newCount)
  }, [])

  return { streak, bumpStreak }
}

// ─── Settings ────────────────────────────────────────────────
export function useSettings() {
  const defaults = { focusMins: 25, shortBreakMins: 5, longBreakMins: 15, sessionsBeforeLongBreak: 4, name: 'there' }
  const [settings, setSettings] = useState(defaults)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setSettings({ ...defaults, ...load('daisy_settings', {}) })
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) save('daisy_settings', settings)
  }, [settings, loaded])

  const updateSettings = useCallback((updates) => {
    setSettings(s => ({ ...s, ...updates }))
  }, [])

  return { settings, updateSettings }
}

// ─── Derived analytics ───────────────────────────────────────
export function useAnalytics(sessions) {
  const todaySessions = sessions.filter(s => {
    const d = new Date(s.at)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  })

  const totalFocusToday = todaySessions.reduce((acc, s) => acc + (s.duration || 0), 0)

  const weekSessions = sessions.filter(s => {
    const d = new Date(s.at)
    const weekAgo = Date.now() - 7 * 86_400_000
    return s.at > weekAgo
  })

  const totalFocusWeek = weekSessions.reduce((acc, s) => acc + (s.duration || 0), 0)

  // Sessions by category this week
  const byCategory = weekSessions.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + (s.duration || 0)
    return acc
  }, {})

  // Sessions by day this week (last 7 days)
  const byDay = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000)
    const key = d.toDateString()
    byDay[key] = weekSessions
      .filter(s => new Date(s.at).toDateString() === key)
      .reduce((acc, s) => acc + (s.duration || 0), 0)
  }

  const avgSessionLen = weekSessions.length
    ? Math.round(totalFocusWeek / weekSessions.length / 60)
    : 0

  const peakHour = (() => {
    const counts = {}
    weekSessions.forEach(s => {
      const h = new Date(s.at).getHours()
      counts[h] = (counts[h] || 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0]
  })()

  const moodCounts = weekSessions.reduce((acc, s) => {
    if (s.mood) acc[s.mood] = (acc[s.mood] || 0) + 1
    return acc
  }, {})

  return { totalFocusToday, totalFocusWeek, byCategory, byDay, avgSessionLen, peakHour, moodCounts, todaySessions, weekSessions }
}

// ─── Helpers exported ────────────────────────────────────────
export function fmtDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function fmtTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

export const CATEGORIES = {
  focus: { label: 'Deep work', color: 'var(--green)',  tagClass: 'tag-focus' },
  admin: { label: 'Admin',     color: 'var(--blue)',   tagClass: 'tag-admin' },
  learn: { label: 'Learning',  color: 'var(--gold)',   tagClass: 'tag-learn' },
}
