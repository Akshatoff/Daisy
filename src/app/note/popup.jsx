import { useState } from "react";

const EraserSizePopover = ({ onSelectSize }) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleSizeClick = (size) => {
    onSelectSize(size);
    setIsVisible(false);
  };

  return (
    <div className={`eraser-size-popover ${isVisible ? "visible" : ""}`}>
      <button onClick={() => handleSizeClick(5)}>Small</button>
      <button onClick={() => handleSizeClick(10)}>Medium</button>
      <button onClick={() => handleSizeClick(15)}>Large</button>
    </div>
  );
};

export default EraserSizePopover;
