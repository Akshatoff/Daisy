"use client"
import { useRef, useState } from "react";
import Popup from "./popup.jsx"
const DrawingPage = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState("#000");
    const [iserasing, setiserasing] = useState(false);
    const [eraserSize, setEraserSize] = useState(5);


  const startDrawing = (e) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      context.beginPath();
    }
  };

  const draw = (e) => {
    if (!isDrawing && !iserasing) return;

    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      context.lineWidth = iserasing ? eraserSize : 5;
      context.lineCap = "round";

      if (iserasing) {
        context.strokeStyle = "#011C27";
      }
      else {
      context.strokeStyle = currentColor;
      }

      context.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
      context.stroke();
      context.beginPath();
      context.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    }
  };

  const changeColor = (e) => {
    setCurrentColor(e.target.value);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  const erasecanvas = () => {
    setiserasing(true);
  }
   const handleEraserSizeChange = (size) => {
    setEraserSize(size);
  };

  return (
    <div className="note-body">
        <form>
        <label>
        <input
    type="color"
  value={currentColor}
  onChange={changeColor}
  className="color-picker"
  suppressHydrationWarning
/>
</label>
</form>
             <button onClick={clearCanvas} className="btn clear-canvas">Clear </button>
             <button onClick={erasecanvas} className="btn erase-canvas">Erase </button>

      
      <h1 className="heading-note">Notes</h1>
      <canvas
        ref={canvasRef}
        width={1000}
        height={550}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw} 
  style={{border: "2px solid #FDD85D", marginLeft:"3rem"}}
      ></canvas>
      

    </div>
  );
};

export default DrawingPage;
