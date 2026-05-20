'use client'
import { useRef, useState, useEffect, useCallback } from 'react'
import Nav from '@/components/Nav'
import { useNotes, CATEGORIES } from '@/hooks/useData'
import { showToast } from '@/components/Toast'

const COLORS = [
  { hex: '#ddd6c4', label: 'Cream' },
  { hex: '#c9a84c', label: 'Gold' },
  { hex: '#52b882', label: 'Green' },
  { hex: '#5b95cc', label: 'Blue' },
  { hex: '#c46b7a', label: 'Rose' },
  { hex: '#c4826b', label: 'Coral' },
  { hex: '#f0e870', label: 'Yellow' },
]
const SIZES = [2, 4, 8, 16]

// ── Canvas drawing ───────────────────────────────────────────
function CanvasNote({ note, onSave, onBack }) {
  const canvasRef = useRef(null)
  const [color, setColor]   = useState(COLORS[0].hex)
  const [size, setSize]     = useState(4)
  const [erasing, setErasing] = useState(false)
  const drawing = useRef(false)
  const lastPos = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const { width, height } = canvas.parentElement.getBoundingClientRect()
      const saved = canvas.toDataURL()
      canvas.width = width
      canvas.height = height
      if (note?.canvasData || saved) {
        const img = new Image()
        img.onload = () => canvas.getContext('2d').drawImage(img, 0, 0)
        img.src = note?.canvasData || saved
      }
    }
    if (note?.canvasData) {
      const img = new Image()
      img.onload = () => {
        const { width, height } = canvas.parentElement.getBoundingClientRect()
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0)
      }
      img.src = note.canvasData
    } else {
      resize()
    }
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [note])

  const getPos = (e) => {
    const r = canvasRef.current.getBoundingClientRect()
    if (e.touches) return { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top }
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  const startDraw = (e) => {
    e.preventDefault()
    drawing.current = true
    const pos = getPos(e)
    lastPos.current = pos
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, (erasing ? size * 2 : size) / 2, 0, Math.PI * 2)
    ctx.fillStyle = erasing ? '#0b1410' : color
    ctx.fill()
  }

  const draw = useCallback((e) => {
    e.preventDefault()
    if (!drawing.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e)
    const prev = lastPos.current || pos
    ctx.beginPath()
    ctx.moveTo(prev.x, prev.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = erasing ? '#0b1410' : color
    ctx.lineWidth = erasing ? size * 3 : size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    lastPos.current = pos
  }, [color, size, erasing])

  const stopDraw = () => { drawing.current = false; lastPos.current = null }

  const clear = () => {
    const c = canvasRef.current
    c.getContext('2d').clearRect(0, 0, c.width, c.height)
  }

  const save = () => {
    const data = canvasRef.current.toDataURL()
    onSave({ canvasData: data, title: note?.title || 'Untitled sketch', type: 'canvas' })
    showToast('Canvas saved')
  }

  const download = () => {
    const link = document.createElement('a')
    link.download = `${note?.title || 'daisy-note'}.png`
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  return (
    <>
      <div className="note-toolbar">
        <button className="tool-btn" onClick={onBack}>← Back</button>
        <div className="note-toolbar-sep" />
        <span className="note-toolbar-label">Color</span>
        {COLORS.map(c => (
          <div
            key={c.hex}
            className={`color-swatch ${color === c.hex && !erasing ? 'active' : ''}`}
            style={{ background: c.hex }}
            title={c.label}
            onClick={() => { setColor(c.hex); setErasing(false) }}
          />
        ))}
        <div className="note-toolbar-sep" />
        <span className="note-toolbar-label">Size</span>
        {SIZES.map(s => (
          <button key={s} className={`tool-btn ${size === s ? 'active' : ''}`} onClick={() => setSize(s)}>
            <span style={{ display: 'inline-block', width: Math.max(s * 1.5, 6), height: Math.max(s * 1.5, 6), borderRadius: '50%', background: 'currentColor', verticalAlign: 'middle' }} />
          </button>
        ))}
        <div className="note-toolbar-sep" />
        <button className={`tool-btn ${!erasing ? 'active' : ''}`} onClick={() => setErasing(false)}>✏ Draw</button>
        <button className={`tool-btn ${erasing ? 'active' : ''}`} onClick={() => setErasing(true)}>◻ Erase</button>
        <div className="note-toolbar-sep" />
        <button className="tool-btn" onClick={clear}>Clear</button>
        <button className="tool-btn" onClick={download}>Download</button>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-gold btn-sm" onClick={save}>Save</button>
        </div>
      </div>
      <div className="note-canvas-area">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', cursor: erasing ? 'cell' : 'crosshair' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      </div>
    </>
  )
}

// ── Text note editor ─────────────────────────────────────────
function TextNote({ note, onSave, onBack }) {
  const [title, setTitle]   = useState(note?.title || '')
  const [body, setBody]     = useState(note?.body || '')
  const [category, setCat]  = useState(note?.category || 'focus')

  const save = () => {
    if (!title.trim() && !body.trim()) return
    onSave({ title: title.trim() || 'Untitled', body, category, type: 'text' })
    showToast('Note saved')
  }

  return (
    <>
      <div className="note-toolbar">
        <button className="tool-btn" onClick={onBack}>← Back</button>
        <div className="note-toolbar-sep" />
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Note title…"
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.9rem',
            fontWeight: 500, width: '220px',
          }}
        />
        <div className="note-toolbar-sep" />
        <span className="note-toolbar-label">Category</span>
        <select
          value={category}
          onChange={e => setCat(e.target.value)}
          style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: '5px', color: 'var(--text2)', fontSize: '0.76rem', padding: '0.25rem 0.5rem', fontFamily: 'var(--font-body)' }}
        >
          {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-gold btn-sm" onClick={save}>Save</button>
        </div>
      </div>
      <div className="text-note-area">
        <textarea
          className="text-note-editor"
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Start writing…"
        />
      </div>
    </>
  )
}

// ── Notes list ───────────────────────────────────────────────
function NoteCard({ note, onClick, onDelete }) {
  const relTime = (ts) => {
    const diff = Date.now() - ts
    const m = Math.floor(diff / 60000)
    const h = Math.floor(m / 60)
    const d = Math.floor(h / 24)
    if (d > 0) return `${d}d ago`
    if (h > 0) return `${h}h ago`
    if (m > 0) return `${m}m ago`
    return 'just now'
  }

  const cat = CATEGORIES[note.category] || null

  return (
    <div
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)', padding: '1.1rem 1.2rem', cursor: 'pointer',
        transition: 'all 0.15s', position: 'relative', overflow: 'hidden',
      }}
      onClick={onClick}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border3)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>{note.type === 'canvas' ? '✏' : '✍'}</span>
          <span style={{ fontWeight: 500, fontSize: '0.88rem', color: 'var(--text)' }}>{note.title || 'Untitled'}</span>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          style={{ opacity: 0.5, fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}
          onClick={e => { e.stopPropagation(); onDelete(note.id); showToast('Note deleted') }}
        >
          ×
        </button>
      </div>
      {note.body && (
        <p style={{ fontSize: '0.76rem', color: 'var(--text3)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {note.body}
        </p>
      )}
      {note.canvasData && (
        <div style={{ height: '60px', background: 'var(--bg)', borderRadius: '6px', overflow: 'hidden', marginBottom: '0.5rem' }}>
          <img src={note.canvasData} alt="sketch" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.7rem' }}>
        <span style={{ fontSize: '0.66rem', color: 'var(--text4)' }}>{relTime(note.updatedAt)}</span>
        {cat && <span className={`tag ${cat.tagClass}`}>{cat.label}</span>}
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────
export default function NotesPage() {
  const { notes, addNote, updateNote, deleteNote } = useNotes()
  const [view, setView]     = useState('list') // 'list' | 'canvas' | 'text'
  const [editing, setEdit]  = useState(null)   // note object or null
  const [tab, setTab]       = useState('all')

  const openNote = (note) => {
    setEdit(note)
    setView(note.type)
  }

  const openNew = (type) => {
    setEdit(null)
    setView(type)
  }

  const handleSave = (data) => {
    if (editing) {
      updateNote(editing.id, data)
    } else {
      addNote(data)
    }
    setView('list')
    setEdit(null)
  }

  const back = () => { setView('list'); setEdit(null) }

  const filtered = notes.filter(n => {
    if (tab === 'canvas') return n.type === 'canvas'
    if (tab === 'text')   return n.type === 'text'
    return true
  })

  if (view === 'canvas') {
    return (
      <div className="note-page">
        <Nav />
        <CanvasNote note={editing} onSave={handleSave} onBack={back} />
      </div>
    )
  }

  if (view === 'text') {
    return (
      <div className="note-page">
        <Nav />
        <TextNote note={editing} onSave={handleSave} onBack={back} />
      </div>
    )
  }

  return (
    <>
      <Nav />
      <div className="page page-inner">
        <div className="section-header">
          <div>
            <h1 className="section-title">Notes</h1>
            <p className="section-sub">{notes.length} note{notes.length !== 1 ? 's' : ''} · canvas and text</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-outline" onClick={() => openNew('text')}>✍ Text note</button>
            <button className="btn btn-gold" onClick={() => openNew('canvas')}>✏ New canvas</button>
          </div>
        </div>

        <div className="tab-row">
          {['all', 'canvas', 'text'].map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✏</div>
            <h3>No notes yet</h3>
            <p>Start with a canvas sketch or a text note.</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button className="btn btn-outline btn-sm" onClick={() => openNew('text')}>Text note</button>
              <button className="btn btn-gold btn-sm" onClick={() => openNew('canvas')}>Canvas</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
            {filtered.map(n => (
              <NoteCard key={n.id} note={n} onClick={() => openNote(n)} onDelete={deleteNote} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
