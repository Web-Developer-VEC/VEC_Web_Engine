import { useState, useEffect, useCallback } from "react";
import logo from '../../Assets/NEWLOGO.png';
import useExamTimer from "../../Hooks/useExamTimer";
import Swal from "sweetalert2";

const AptitudeHeader = ({ showTimer }) => {
  const [scroll, setScroll] = useState(0);
  const [hdr, setHdr] = useState("");

  
  
  // const remainingSeconds = useExamTimer((data) => {
  //   if (data?.status !== "TIME_UP") return;
    
  //   Swal.fire({
  //     title: "Time Up",
  //     text: "Your exam time has ended.",
  //     icon: "info",
  //     allowOutsideClick: false
  //   }).then(() => {
  //     // submitExam(false);
  //   });
  // });
  
  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const hndlScrll = useCallback(() => {
    const pos = window.scrollY;
    const pos_thresh = 0;
    if (pos > pos_thresh) {
      setHdr("showoff");
    } else {
      setHdr("");
    }
    setScroll(pos);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", hndlScrll, { passive: true });
    return () => window.removeEventListener("scroll", hndlScrll);
  }, [hndlScrll]);

  return (
    <>
      <nav className="fixed z-[100] w-full">
        <div
          className={
            "flex items-center font-popp group bg-white text-slate-200 transition-all ease-in-out duration-300 w-full h-auto h-20"
          }
        >
          <a href="#" className="flex flex-col items-center justify-center select-none ml-4">
            <div className="z-10">
              <img
                src={logo}
                alt="VEC Logo"
                className="w-[2.5rem] md:w-[3.5rem] h-auto object-contain transition-all duration-300 ease-in-out"
              />
            </div>
            <div className="text-center leading-tight mt-1 md:mt-1.5">
              <span className="font-rome text-[0.75rem] md:text-[1.2rem] text-[#4B1E1E] font-thin block">
                VELAMMAL
              </span>
              <span className="font-rome text-[0.45rem] md:text-[0.8rem] text-gray-800 block tracking-wide">
                ENGINEERING COLLEGE
              </span>
              <span className="font-rome text-[0.35rem] md:text-[0.65rem] text-gray-500 italic block">
                The Wheel of Knowledge rolls on!
              </span>
              <span className="font-rome text-[0.35rem] md:text-[0.65rem] text-gray-500 italic block">
                (An Autonomous Institution)
              </span>
            </div>
          </a>

          {/* Title */}
          <div className="flex-grow text-center mr-[180px]">
            <h1 className="text-[1.7vmax] font-semibold text-amber-800 w-[80%] mx-auto">
              Aptitude Examination Portal
            </h1>
          </div>

          {/* Timer */}
          {/* {showTimer && remainingSeconds !== null && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-700 font-bold text-[1.2rem] z-20">
              {formatTime(remainingSeconds)}
            </div>
          )} */}
        </div>
        <div className='hidden lg:flex px-4 pb-1.5 font-popp bg-secd text-text z-10 w-full h-[0.75rem] rounded-b-lg transition-all'></div>
      </nav>
    </>
  );
};

export default AptitudeHeader;
