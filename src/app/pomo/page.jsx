"use client"

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Nav from "@/components/Nav";

const format = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
};

const FLOWER_IMAGES = [
  "/assets/MainFlower.png",
  "/assets/Petal1.png","/assets/Petal1.png",
  "/assets/Petal2.png","/assets/Petal2.png",
  "/assets/Petal3.png","/assets/Petal3.png",
  "/assets/Petal4.png","/assets/Petal4.png",
  "/assets/Petal5.png","/assets/Petal5.png",
  "/assets/Petal6.png","/assets/Petal6.png",
  "/assets/Petal7.png","/assets/Petal7.png",
  "/assets/Petal8.png","/assets/Petal8.png",
];

const PomoPage = () => {
  const [mode, setMode] = useState("stopwatch"); // "stopwatch" | "timer"

  // Stopwatch
  const [swTime, setSwTime] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [flowerIdx, setFlowerIdx] = useState(0);

  // Timer
  const [timerInput, setTimerInput] = useState("");
  const [timerTime, setTimerTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSet, setTimerSet] = useState(false);

  const swRef = useRef();
  const timerRef = useRef();

  // Stopwatch effect
  useEffect(() => {
    if (swRunning) {
      swRef.current = setInterval(() => {
        setSwTime(t => {
          if ((t + 1) % 60 === 0) setFlowerIdx(i => (i + 1) % FLOWER_IMAGES.length);
          return t + 1;
        });
      }, 1000);
    } else {
      clearInterval(swRef.current);
    }
    return () => clearInterval(swRef.current);
  }, [swRunning]);

  // Timer effect
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerTime(t => {
          if (t <= 1) {
            setTimerRunning(false);
            clearInterval(timerRef.current);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  const startTimer = () => {
    const secs = parseInt(timerInput, 10);
    if (!secs || secs <= 0) return;
    setTimerTime(secs);
    setTimerSet(true);
    setTimerRunning(true);
  };

  const resetSw = () => { setSwTime(0); setSwRunning(false); setFlowerIdx(0); };
  const resetTimer = () => { setTimerTime(0); setTimerRunning(false); setTimerSet(false); setTimerInput(""); };

  return (
    <>
      <Nav />
      <div className="pomo-page">
        {/* Sidebar */}
        <div className="pomo-sidebar">
          <h2>Pomodoro</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text3)", lineHeight: 1.6, marginBottom: "0.5rem" }}>
            Choose your mode and start a focused session.
          </p>

          <button
            className={`pomo-mode-btn ${mode === "stopwatch" ? "active" : ""}`}
            onClick={() => setMode("stopwatch")}
          >
            <span className="mode-icon">◷</span>
            Stopwatch
          </button>

          <button
            className={`pomo-mode-btn ${mode === "timer" ? "active" : ""}`}
            onClick={() => setMode("timer")}
          >
            <span className="mode-icon">⏳</span>
            Timer
          </button>

          <div style={{ marginTop: "auto", padding: "1rem 0", borderTop: "1px solid var(--border)" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--text3)", lineHeight: 1.7 }}>
              The flower blooms as you work — each minute of focus adds a petal.
            </p>
          </div>
        </div>

        {/* Main area */}
        <div className="pomo-main">
          {mode === "stopwatch" && (
            <>
              <Image
                src={FLOWER_IMAGES[flowerIdx]}
                alt="progress flower"
                width={280}
                height={280}
                className={`pomo-flower ${swRunning ? "rotate" : ""}`}
                style={{ animation: swRunning ? "rotate 4s linear infinite" : "none" }}
              />
              <div className="pomo-display">
                <p className="pomo-label">Elapsed time</p>
                <div className={`pomo-time ${swRunning ? "running" : ""}`}>{format(swTime)}</div>
              </div>
              <div className="pomo-controls">
                <button className="btn btn-outline" onClick={resetSw}>Reset</button>
                <button className="btn btn-gold" onClick={() => setSwRunning(r => !r)}>
                  {swRunning ? "Pause" : "Start"}
                </button>
              </div>
            </>
          )}

          {mode === "timer" && (
            <>
              <div className="pomo-display">
                <p className="pomo-label">{timerRunning ? "Focus time remaining" : "Set your timer"}</p>
                <div className={`pomo-time ${timerRunning ? "running" : ""}`}>
                  {timerSet ? format(timerTime) : "00:00"}
                </div>
              </div>

              {!timerSet && (
                <div className="pomo-timer-setup">
                  <label htmlFor="timerInput">Duration in seconds</label>
                  <input
                    id="timerInput"
                    type="number"
                    className="pomo-input"
                    value={timerInput}
                    onChange={e => setTimerInput(e.target.value)}
                    placeholder="e.g. 1500"
                    min="1"
                  />
                  <button className="btn btn-gold" onClick={startTimer}>Start Timer</button>
                </div>
              )}

              {timerSet && (
                <div className="pomo-controls">
                  <button className="btn btn-outline" onClick={resetTimer}>Reset</button>
                  <button className="btn btn-gold" onClick={() => setTimerRunning(r => !r)}>
                    {timerRunning ? "Pause" : "Resume"}
                  </button>
                </div>
              )}

              {timerTime === 0 && timerSet && (
                <p style={{ color: "var(--gold)", fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontStyle: "italic" }}>
                  Time's up — great work!
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default PomoPage;
