'use client'
import { useState, useMemo } from 'react'
import Nav from '@/components/Nav'
import { useTasks, CATEGORIES, fmtDuration } from '@/hooks/useData'
import { showToast } from '@/components/Toast'

const VIEWS = [
  { id: 'all',     label: 'All tasks' },
  { id: 'today',   label: "Today's plan" },
  { id: 'daily',   label: 'Daily tasks' },
  { id: 'done',    label: 'Completed' },
]

function AddTaskModal({ onAdd, onClose }) {
  const [title, setTitle]     = useState('')
  const [cat, setCat]         = useState('focus')
  const [est, setEst]         = useState('')
  const [isDaily, setIsDaily] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    onAdd(title.trim(), {
      category: cat,
      estimate: est ? parseInt(est) * 60 : null,
      isDaily,
    })
    onClose()
    showToast('Task added')
  }

  return (
    <div className="modal-overlay show" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">New task</div>
        <div className="modal-sub">Add a task with an estimate to unlock accuracy tracking.</div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>Task</label>
            <input
              className="input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>Category</label>
              <select className="input" value={cat} onChange={e => setCat(e.target.value)} style={{ cursor: 'pointer' }}>
                {Object.entries(CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>Estimate (mins)</label>
              <input
                className="input"
                type="number"
                value={est}
                onChange={e => setEst(e.target.value)}
                placeholder="e.g. 30"
                min="1"
              />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text2)' }}>
            <input
              type="checkbox"
              className="checkbox"
              checked={isDaily}
              onChange={e => setIsDaily(e.target.checked)}
            />
            Repeat daily (resets every midnight)
          </label>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-gold">Add task</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState(task.title)
  const cat = CATEGORIES[task.category] || CATEGORIES.focus

  const saveEdit = () => {
    if (editVal.trim()) onEdit(task.id, { title: editVal.trim() })
    setEditing(false)
  }

  return (
    <div className={`task-item ${task.completed ? 'done' : ''}`}>
      <input
        type="checkbox"
        className="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
      />

      {editing ? (
        <div className="task-edit-row">
          <input
            className="input"
            value={editVal}
            onChange={e => setEditVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false) }}
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            autoFocus
          />
          <button className="btn btn-gold btn-sm" onClick={saveEdit}>Save</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>×</button>
        </div>
      ) : (
        <>
          <span className="task-title">{task.title}</span>
          <span className={`tag ${cat.tagClass}`}>{cat.label}</span>
          {task.estimate && (
            <span className="task-meta">
              {task.actualTime
                ? <span style={{ color: Math.abs(task.actualTime - task.estimate) / task.estimate < 0.2 ? 'var(--green)' : 'var(--rose)' }}>
                    {fmtDuration(task.actualTime)} / {fmtDuration(task.estimate)}
                  </span>
                : <span>{fmtDuration(task.estimate)}</span>
              }
            </span>
          )}
          {task.isDaily && <span style={{ fontSize: '0.65rem', color: 'var(--text4)' }}>↻</span>}
          <div className="task-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>
            <button className="btn btn-danger-ghost" onClick={() => { onDelete(task.id); showToast('Task deleted') }}>Delete</button>
          </div>
        </>
      )}
    </div>
  )
}

export default function TasksPage() {
  const { tasks, addTask, toggleTask, deleteTask, editTask, clearCompleted } = useTasks()
  const [view, setView]       = useState('all')
  const [catFilter, setCat]   = useState('all')
  const [showAdd, setShowAdd] = useState(false)

  const today = new Date().toDateString()

  const filtered = useMemo(() => {
    let list = tasks
    if (view === 'today')  list = list.filter(t => !t.isDaily && !t.completed && (t.dueDate ? new Date(t.dueDate).toDateString() === today : true))
    if (view === 'daily')  list = list.filter(t => t.isDaily)
    if (view === 'done')   list = list.filter(t => t.completed)
    if (view === 'all')    list = list.filter(t => !t.completed)
    if (catFilter !== 'all') list = list.filter(t => t.category === catFilter)
    return list
  }, [tasks, view, catFilter, today])

  const counts = useMemo(() => ({
    all:   tasks.filter(t => !t.completed).length,
    today: tasks.filter(t => !t.completed && !t.isDaily).length,
    daily: tasks.filter(t => t.isDaily).length,
    done:  tasks.filter(t => t.completed).length,
  }), [tasks])

  const completedToday = tasks.filter(t => t.completedAt && new Date(t.completedAt).toDateString() === today).length

  return (
    <>
      <Nav />
      {showAdd && <AddTaskModal onAdd={addTask} onClose={() => setShowAdd(false)} />}

      <div className="page tasks-layout">
        {/* Sidebar */}
        <div className="tasks-sidebar">
          <div style={{ marginBottom: '0.5rem' }}>
            <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowAdd(true)}>
              + New task
            </button>
          </div>

          <div className="tasks-sidebar-label">Views</div>
          {VIEWS.map(v => (
            <div
              key={v.id}
              className={`tasks-sidebar-item ${view === v.id ? 'active' : ''}`}
              onClick={() => setView(v.id)}
            >
              {v.label}
              <span className="badge">{counts[v.id]}</span>
            </div>
          ))}

          <div className="tasks-sidebar-label" style={{ marginTop: '0.5rem' }}>Filter by</div>
          <div
            className={`tasks-sidebar-item ${catFilter === 'all' ? 'active' : ''}`}
            onClick={() => setCat('all')}
          >
            <span className="dot" style={{ background: 'var(--text3)' }} />
            All categories
          </div>
          {Object.entries(CATEGORIES).map(([k, v]) => (
            <div
              key={k}
              className={`tasks-sidebar-item ${catFilter === k ? 'active' : ''}`}
              onClick={() => setCat(k)}
            >
              <span className="dot" style={{ background: v.color }} />
              {v.label}
            </div>
          ))}

          {tasks.filter(t => t.completed).length > 0 && (
            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
              <button className="btn btn-ghost" style={{ width: '100%', fontSize: '0.74rem', color: 'var(--text4)' }} onClick={() => { clearCompleted(); showToast('Cleared completed tasks') }}>
                Clear all completed
              </button>
            </div>
          )}
        </div>

        {/* Main */}
        <div className="tasks-main">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--text)', lineHeight: 1.1 }}>
                {VIEWS.find(v => v.id === view)?.label}
              </h1>
              <p style={{ fontSize: '0.76rem', color: 'var(--text3)', marginTop: '0.25rem' }}>
                {completedToday > 0 && `${completedToday} completed today · `}
                {filtered.length} {filtered.length === 1 ? 'task' : 'tasks'}
              </p>
            </div>
            <button className="btn btn-gold" onClick={() => setShowAdd(true)}>+ Add task</button>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">✓</div>
              <h3>{view === 'done' ? 'Nothing completed yet' : 'All clear'}</h3>
              <p>{view === 'done' ? 'Complete tasks to see them here.' : 'Add a task to get started.'}</p>
            </div>
          ) : (
            <div className="task-list">
              {filtered.map(t => (
                <TaskItem key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} onEdit={editTask} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
