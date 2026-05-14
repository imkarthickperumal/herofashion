import { useEffect, useState } from "react";
import { getRemainingSeconds } from "../utils/breakTime";

import lunchImg from "../assets/Gemini_Generated_Image_ws8gi9ws8gi9ws8g.png";
import teaImg from "../assets/Gemini_Generated_Image_5u9yp05u9yp05u9y.png";

const formatTime = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export default function BreakOverlay({ breakInfo }) {
  const [remaining, setRemaining] = useState(
    getRemainingSeconds(breakInfo)
  );  

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getRemainingSeconds(breakInfo));
    }, 1000);

    return () => clearInterval(interval);
  }, [breakInfo]);

  const image =
    breakInfo.name.toLowerCase().includes("lunch")
      ? lunchImg
      : teaImg;

  const bgColor = breakInfo.name.toLowerCase().includes("lunch")
  ? "bg-[#7fc9c4]"   
  : "bg-[#85ccca]"; 

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto backdrop-blur-md ${bgColor}`}>
      
      {/* IMAGE CONTAINER */}
      <div className="relative w-[650px] max-w-full">
        
        {/* IMAGE */}
        <img
          src={image}
          alt="Break Time"
          className="w-full object-contain"
        />

        {/* TEXT OVER IMAGE */}
        <div className="absolute bottom-4 left-0 right-0 text-center text-blue-950">
          
          <p className="text-md font-bold tracking-widest uppercase">
            Minutes Remaining <br />
            <span className="text-3xl font-extrabold tracking-wider">{formatTime(remaining)}</span>
          </p>

        </div>
      </div>
    </div>
  );
}
