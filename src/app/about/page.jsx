import Link from "next/link";
import Nav from "@/components/Nav";

const About = () => {
  return (
    <>
      <Nav />
      <div className="about-page">
        <div className="page-header">
          <p className="page-eyebrow">What we offer</p>
          <h1 className="page-title">Three tools.<br />One flow.</h1>
        </div>

        <div className="cards-grid">
          <div className="feature-card">
            <div className="feature-card-num">01</div>
            <h2>To-Do</h2>
            <p>
              Easily organise your day with tasks you can add, edit, remove, or
              mark complete. Daily repeating tasks reset automatically every 24 hours.
            </p>
            <Link href="/todo">
              <button className="btn btn-gold">Open To-Do</button>
            </Link>
          </div>

          <div className="feature-card">
            <div className="feature-card-num">02</div>
            <h2>Pomodoro</h2>
            <p>
              Stay locked in with a countdown timer or track time with a stopwatch.
              Set custom session lengths to match your ideal focus rhythm.
            </p>
            <Link href="/pomo">
              <button className="btn btn-gold">Open Pomodoro</button>
            </Link>
          </div>

          <div className="feature-card">
            <div className="feature-card-num">03</div>
            <h2>Notes</h2>
            <p>
              A freeform drawing canvas with multiple pen colours and an eraser.
              Great for quick sketches, diagrams, or visual thinking.
            </p>
            <Link href="/note">
              <button className="btn btn-gold">Open Notes</button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
