import Link from "next/link";
import Nav from "@/components/Nav";

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
            Daisy brings your tasks, timers, and notes together in one beautiful space — so you can spend less time organising and more time doing.
          </p>
          <div className="home-cta">
            <Link href="/todo">
              <button className="btn btn-gold">Get started</button>
            </Link>
            <Link href="/about">
              <button className="btn btn-outline">Learn more</button>
            </Link>
          </div>
        </div>

        <div className="home-right">
          <div className="home-deco" />
          <div className="home-cards">
            <Link href="/todo" className="home-card">
              <div className="home-card-icon icon-gold">✓</div>
              <div className="home-card-text">
                <h3>To-Do</h3>
                <p>Capture tasks, mark them done, stay on top of everything.</p>
              </div>
            </Link>
            <Link href="/pomo" className="home-card">
              <div className="home-card-icon icon-green">◷</div>
              <div className="home-card-text">
                <h3>Pomodoro</h3>
                <p>Focus with timed sessions and built-in break reminders.</p>
              </div>
            </Link>
            <Link href="/note" className="home-card">
              <div className="home-card-icon icon-warm">✏</div>
              <div className="home-card-text">
                <h3>Notes</h3>
                <p>A freeform canvas for sketching ideas and diagrams.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
