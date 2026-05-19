"use client"

import { useRef, useState, useEffect, useCallback } from "react";
import Nav from "@/components/Nav";

const COLORS = [
  { hex: "#e8e0d0", label: "Cream" },
  { hex: "#d4a853", label: "Gold" },
  { hex: "#5ec49a", label: "Mint" },
  { hex: "#d46b53", label: "Coral" },
  { hex: "#6b9fd4", label: "Sky" },
  { hex: "#c46b9a", label: "Rose" },
  { hex: "#f0f060", label: "Yellow" },
];

const PEN_SIZES = [2, 5, 10, 18];

const NotePage = () => {
  const canvasRef = useRef(null);
  const [color, setColor] = useState(COLORS[0].hex);
  const [size, setSize] = useState(4);
  const [erasing, setErasing] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const lastPos = useRef(null);

  // Resize canvas to fill container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const { width, height } = canvas.parentElement.getBoundingClientRect();
      // Save image before resize
      const imgData = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").putImageData(imgData, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    setDrawing(true);
    const pos = getPos(e);
    lastPos.current = pos;
    // Dot on click
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, (erasing ? size * 2 : size) / 2, 0, Math.PI * 2);
    ctx.fillStyle = erasing ? "#0e1512" : color;
    ctx.fill();
  };

  const draw = useCallback((e) => {
    e.preventDefault();
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e);
    const prev = lastPos.current || pos;

    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = erasing ? "#0e1512" : color;
    ctx.lineWidth = erasing ? size * 4 : size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  }, [drawing, erasing, color, size]);

  const stopDraw = () => {
    setDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "daisy-note.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <>
      <Nav />
      <div className="note-page">
        {/* Toolbar */}
        <div className="note-toolbar">

          {/* Colors */}
          <div className="note-toolbar-group">
            <span className="note-toolbar-label">Color</span>
            {COLORS.map(c => (
              <div
                key={c.hex}
                className={`color-dot ${color === c.hex && !erasing ? "selected" : ""}`}
                style={{ background: c.hex }}
                title={c.label}
                onClick={() => { setColor(c.hex); setErasing(false); }}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === "Enter" && (setColor(c.hex), setErasing(false))}
                aria-label={c.label}
              />
            ))}
          </div>

          {/* Size */}
          <div className="note-toolbar-group">
            <span className="note-toolbar-label">Size</span>
            {PEN_SIZES.map(s => (
              <button
                key={s}
                className={`tool-btn ${size === s ? "active" : ""}`}
                onClick={() => setSize(s)}
                title={`${s}px`}
              >
                <span style={{
                  display: "inline-block",
                  width: Math.max(s * 1.5, 6),
                  height: Math.max(s * 1.5, 6),
                  borderRadius: "50%",
                  background: "currentColor",
                  verticalAlign: "middle"
                }} />
              </button>
            ))}
          </div>

          {/* Tools */}
          <div className="note-toolbar-group">
            <button
              className={`tool-btn ${!erasing ? "active" : ""}`}
              onClick={() => setErasing(false)}
            >✏ Draw</button>
            <button
              className={`tool-btn ${erasing ? "active" : ""}`}
              onClick={() => setErasing(true)}
            >◻ Erase</button>
          </div>

          {/* Actions */}
          <div className="note-toolbar-group">
            <button className="tool-btn" onClick={clearCanvas}>Clear</button>
            <button className="tool-btn" onClick={downloadCanvas}>Download</button>
          </div>

          {/* Live preview */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span className="note-toolbar-label">{erasing ? "Eraser" : "Pen"}</span>
            <div style={{
              width: Math.max(size * 2, 8),
              height: Math.max(size * 2, 8),
              borderRadius: "50%",
              background: erasing ? "var(--border2)" : color,
              border: "1px solid var(--border2)",
              transition: "all 0.2s"
            }} />
          </div>
        </div>

        {/* Canvas */}
        <div className="note-canvas-wrap">
          <canvas
            ref={canvasRef}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
            style={{ cursor: erasing ? "cell" : "crosshair" }}
          />
        </div>
      </div>
    </>
  );
};

export default NotePage;
