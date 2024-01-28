import React from 'react';


const Popup = ({ handleClose, show, children }) => {
  const showHideClassName = show ? 'popup display-block' : 'popup display-none';

  return (
    <div className={showHideClassName}>
      <section className="popup-main">
        
        {children}
        
        
        <button onClick={handleClose} className='close'>Close</button>
      </section>
      
    </div>
  );
};

export default Popup;