import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/solid'


const CourseCarousel = ({ courses }) => {
  // Declare hooks at the top level
  const [pos, setPos] = useState(3)
  const [pause, setPause] = useState(false)

  const rdb = [
    {name: "AI&DS", clr: "#be3531"},
    {name: "AUTO", clr: "#f6a664"},
    {name: "CIVIL", clr: "#5e84a0",},
    {name: "CSE", clr: "#01a302"},
    {name: "CSE(CS)", clr: "#114738"},
    {name: "EEE", clr: "#0226c4"},
    {name: "ECE", clr: "#ce8143"},
    {name: "EIE", clr: "#ca4121"},
    {name: "IT", clr: "#a982b4",},
    {name: "MECH", clr: "#896a21",},
    {name: "MBA", clr: "#14254f"},
    
  ]

  const pos_hdl = (pvl) => {
    if (pvl !== 0 && pvl <= courses.length) {
      document.getElementById(`Cor${pos}`).pause()
      setPos(pvl)
      document.getElementById(`Cor${pvl}`).play()
    }
  }

  const handleNext = useCallback(() => {
    if (pos !== courses.length)
      pos_hdl(pos + 1)
    else
      pos_hdl(1)
  });
    
  
  useEffect(() => {
    if (pos === 3) {
      document.getElementById('Cor3').play()
    }
    if (!pause) {
      const interval = setInterval(handleNext, 3000); 
      return () => clearInterval(interval);
    }
  }, [handleNext])

  return (
    <div>
      <div className="grid w-full relative h-fit  border border-black z-10 p-10">
        <button className="rounded-full absolute top-[25%] left-4 w-[3vmax] outline outline-offset-2 outline-amber-500 pr-2 h-[3vmax] bg-amber-600"
          onClick={() => pos_hdl(pos - 1)}>
          <ChevronLeftIcon className="size-max text-white"></ChevronLeftIcon>
        </button>
        <button className="rounded-full absolute top-[35%] right-4 w-[3vmax] outline outline-offset-2 outline-amber-500 pl-2 h-[3vmax] bg-amber-600"
          onClick={() => pos_hdl(pos + 1)}>
          <ChevronRightIcon className="size-max text-white"></ChevronRightIcon>
        </button>
        <div className="font-comf row-[1/2] col-[1/8] w-screen z-[1] h-[300px] flex items-center justify-center mb-10 -ml-10"
          style={{transformStyle: 'preserve-3d', perspective: '600px'}}>
          {courses.map((cur, i) => (
            <div className="group absolute overflow-hidden transition-all duration-[0.25s] ease rounded-xl hover:[transform:rotateY(90deg)]" 
              style={{transform: `rotateY(${-10 * (pos - (i + 1))}deg) translateX(${-500 * (pos - (i + 1))}px)`,
              zIndex: `${Math.max(((pos - (i + 1)) * -1), (pos - (i + 1))) + 100}`}} onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)}>
              <div className={`relative text-center w-[30vmax] h-[17.5vmax] bg-cover bg-center transition-all duration-[2s]
                ${(pos === i + 1) ? 'focs': ''} rounded-[20px] overflow-y-hidden group`} onClick={() => pos_hdl(i + 1)}>
                <div className="absolute bg-black z-[-10] w-[30vmax] h-[17.5vmax] [transform:rotateY(180deg),translateZ(-10px)]">
                  Hehe
                </div>
                <video className="absolute w-full h-fit" id={`Cor${i + 1}`} muted loop>
                  <source src={cur.image}></source>
                </video>
                <div className={`${(pos === i + 1) ? "hidden": "block"} z-[50] w-full h-full bg-[#0000001a] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-[5px]`}></div>  
                <div className="grid content-end w-full h-full z-[40] text-white text-[2vmax] group-hover:[transform:translateZ(500px)]
                  translate-y-[20vmax] delay-200 group-[.focs]:translate-y-0 duration-300 ease transition-all p-2"
                  style={{background: `linear-gradient(to top, ${cur.clr}, ${cur.clr}00 55%)`}}>
                  {cur.name}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 w-[100vw]">
          {rdb.map((btn , i) => (
            <button className={`font-comf text-[1.5vmax] px-2 ${(pos === i + 1)? 'border-b-2': ''}`} style={{color: btn.clr, borderBottomColor: btn.clr}} 
              type="button" name="pos" onClick={() => {pos_hdl(i + 1)}}>{btn.name}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseCarousel;
