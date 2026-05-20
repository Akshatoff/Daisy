'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useStreak } from '@/hooks/useData'

export default function Nav() {
  const path = usePathname()
  const { streak } = useStreak()

  const links = [
    { href: '/',         label: 'Home'      },
    { href: '/tasks',   label: 'Tasks'     },
    { href: '/focus',   label: 'Focus'     },
    { href: '/notes',   label: 'Notes'     },
    { href: '/clarity', label: 'Clarity'   },
  ]

  return (
    <nav className="nav">
      <Link href="/" className="nav-logo">Daisy</Link>
      <ul className="nav-links">
        {links.map(l => (
          <li key={l.href}>
            <Link
              href={l.href}
              className={`nav-link ${path === l.href ? 'active' : ''}`}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="nav-right">
        {streak > 0 && (
          <span className="streak-pill">
            🔥 {streak} day streak
          </span>
        )}
      </div>
    </nav>
  )
}
