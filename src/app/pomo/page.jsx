"use client"

import Image from 'next/image'
import { useEffect, useRef, useState} from 'react'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faStopwatch, faHourglass } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css'; // import the styles
import { library } from '@fortawesome/fontawesome-svg-core';
import { faStopwatch, faHourglass } from '@fortawesome/free-solid-svg-icons';
library.add(faStopwatch);
library.add(faHourglass);
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// config.autoAddCss = false; // disable automatic styles injection

const Page = () => {

  const [time, setTime] = useState(0)
  const [time1, setTime1] = useState(0)
  const [running, setRunning] = useState(false)
  const [running1, setRunning1] = useState(false)
  const [isclicked, setisclicked] = useState(false)
  const [isclicked1, setisclicked1] = useState(true)
  const [inputtime, setinputime] = useState("")
  const Images = [
    "/assets/MainFlower.png",
    "/assets/Petal1.png",
    "/assets/Petal1.png",
    "/assets/Petal2.png",
    "/assets/Petal2.png",
    "/assets/Petal3.png",
    "/assets/Petal3.png",
    "/assets/Petal4.png",
    "/assets/Petal4.png",
    "/assets/Petal5.png",
    "/assets/Petal5.png",
    "/assets/Petal6.png",
    "/assets/Petal6.png",
    "/assets/Petal7.png",
    "/assets/Petal7.png",
    "/assets/Petal8.png",
    "/assets/Petal8.png",

  ]

  const [ImageIndex, SetImageIndex] = useState(0);


  const handleClick = () => {
    setisclicked(!isclicked)
  }
  const handleClick1 = () => {
    setisclicked1(!isclicked1)
  }

  const startStopwatch = () => {
    handleClick()
    handleClick1()
  }

  const startTimer = () => {
    handleClick()
    handleClick1()
  }

  const handlStart = () => {
    if (!running && inputtime > 0) {
      setRunning(true)
      setTime(inputtime)
    }
  }
  const handlStart1 = () => {
    setRunning1((prevState) => !prevState);
  };

  const ResetStopwatch = () => {
    setTime1(0)
    SetImageIndex(0)
  }

  const timer = useRef()
  const stopwatch = useRef()
  
  useEffect(() => {
    if (running1) {
      const intervalId = setInterval(() => {
        setTime1((prevTime) => {
          if ((prevTime + 1) % 60 === 0) {
            SetImageIndex((prevIndex) => (prevIndex+1) % Images.length);
          }
          return prevTime + 1;
        });
      }, 1000);
  
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [running1, Images]);
    

  useEffect(() => {
    
    if (running) {
      timer.current = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime > 0) {
            return prevTime - 1;
          } else {
            setRunning(false);
            clearInterval(timer.current);
            return 0;
          }
        });
      }, 1000);
    } else {
      clearInterval(timer.current);
    }
  
    return () => clearInterval(timer.current);
  }, [running, running1]);

  
  return (
    <div className="pomodoro">
        <h1 className="heading-pomodoro">Pomodoro</h1>
        <div className="icon-container">
        <FontAwesomeIcon icon={faStopwatch} className="stopwatch"  onClick={startStopwatch}/>
      <FontAwesomeIcon icon={faHourglass} className="timer" onClick={startTimer}/>
      </div>
     
      
      
      {isclicked &&  
      <>
         <input
              type="number"
              value={inputtime}
              onChange={(e) => setinputime(e.target.value)}
              placeholder="Enter time in seconds"
              className='input-timer'
            />
            <button className="btn start" onClick={handlStart}>
              Start Timer
            </button>
            <div className="circle1">
      <h3 className="timer1">{format1(time)}</h3>
      </div>
      <div className="control-panel contim">
      <button className="btn restart" onClick={() => setTime(0)}>Restart</button>
      <button className="btn stop" onClick={() => {
        if (running) clearInterval(timer.current)
        setRunning(!running)
      }}>{running ?'Stop' : 'Start'}</button>
      
      </div>
      </>}

      {isclicked1 && (
        <div>
          <Image src={Images[ImageIndex]}
          alt="stopwacth"
          width={1000}
          height={500}
          className={`circle ${running1 ? 'rotate' : ''}`}
          >
          
          </Image>
            
          
          <h3 className="stopwatch-display">{format(time1)}</h3>
          <div className="control-panel stopwatch-control">
            <button className="btn restart" onClick={ResetStopwatch}>
              Restart
            </button>
            <button
              className="btn stop"
            onClick={handlStart1}
            >
              {running1 ? "Stop" : "Start"}
            </button>
          </div>
        </div>
      )}
   

      
    </div>
  );
}

const format = (time) => {
  let hour = Math.floor(time/60/60%24)
  let minutes = Math.floor(time/60 % 60)
  let second = Math.floor(time%60)

  hour = hour < 10 ? '0' + hour : hour
  minutes = minutes < 10 ? '0' + minutes : minutes
  second = second < 10 ? '0' + second : second

  return hour + ":" + minutes + ":" + second
}

const format1 = (time1) => {
  const minutes = Math.floor(time1 / 60);
  const seconds = time1 % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export default Page