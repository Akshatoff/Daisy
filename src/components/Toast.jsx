'use client'
import { useEffect, useState } from 'react'

let _show = null
export function showToast(msg, type = '') {
  if (_show) _show(msg, type)
}

export default function Toast() {
  const [toast, setToast] = useState(null)

  useEffect(() => {
    _show = (msg, type) => {
      setToast({ msg, type })
      setTimeout(() => setToast(null), 3000)
    }
    return () => { _show = null }
  }, [])

  if (!toast) return null

  return (
    <div className={`toast ${toast.type}`}>
      {toast.type === 'gold' ? '✦' : '✓'} {toast.msg}
    </div>
  )
}
