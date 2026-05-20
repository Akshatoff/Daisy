import Link from 'next/link'
import Nav from '@/components/Nav'

export default function Home() {
  return (
    <>
      <Nav />
      <div className="home">
        <div className="home-left">
          <p className="home-eyebrow">Your productivity sanctuary</p>
          <h1 className="home-heading">
            Stay focused.<br />
            <em>Stay present.</em>
          </h1>
          <p className="home-sub">
            Daisy connects your tasks, focus sessions, and notes. It tracks how you actually spend your time — and shows you patterns no other app bothers to surface.
          </p>
          <div className="home-cta">
            <Link href="/tasks"><button className="btn btn-gold">Start today</button></Link>
            <Link href="/clarity"><button className="btn btn-outline">See your clarity</button></Link>
          </div>
        </div>

        <div className="home-right">
          <div className="home-features">
            <Link href="/tasks" className="home-feature">
              <div className="home-feature-icon fi-gold">✓</div>
              <div className="home-feature-text">
                <h3>Tasks + time estimates</h3>
                <p>Add tasks with estimates. Daisy learns how accurate you really are.</p>
              </div>
            </Link>
            <Link href="/focus" className="home-feature">
              <div className="home-feature-icon fi-green">◷</div>
              <div className="home-feature-text">
                <h3>Linked Pomodoro timer</h3>
                <p>Every session tags a task. Your time gets logged automatically.</p>
              </div>
            </Link>
            <Link href="/notes" className="home-feature">
              <div className="home-feature-icon fi-blue">✏</div>
              <div className="home-feature-text">
                <h3>Draw & write notes</h3>
                <p>Canvas sketches and text notes, linked to tasks and sessions.</p>
              </div>
            </Link>
            <Link href="/clarity" className="home-feature">
              <div className="home-feature-icon fi-rose">◈</div>
              <div className="home-feature-text">
                <h3>Weekly clarity report</h3>
                <p>See exactly where your time went and how to improve next week.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
