import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/solid'
import "./Courses.css";

const CourseCarousel = ({ courses }) => {
  // Declare hooks at the top level
  const [pos, setPos] = useState(3)
  const [leftIndex, setLeftIndex] = useState(0);
  const [middleIndex, setMiddleIndex] = useState(1);
  const [rightIndex, setRightIndex] = useState(2);
  const [dragStartX, setDragStartX] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const carouselRef = useRef(null);

  const crs = [{name: "ded"}, {name: "dod"}, {name: "dud"}, {name: "did"}, {name: "dad"}]
  const rdb = [
    {name: "CSE", clr: "#01a302",},
    {name: "AIDS", clr: "#be3531"},
    {name: "IT", clr: "#a982b4",},
    {name: "Mech", clr: "#896a21",},
    {name: "Civil", clr: "#5e84a0",},
    {name: "CSec", clr: "#114738"},
    {name: "ECE", clr: "#0226c4"},
    {name: "EEE", clr: "#ce8143"},
    {name: "EIE", clr: "#ca4121"},
    {name: "MBA", clr: "#14254f"},
    {name: "Auto", clr: "#f6a664"}
  ]

  const pos_hdl = (pvl) => {
    if (pvl !== 0 && pvl <= courses.length) {
      setPos(pvl)
    }
  }

  // Handle next and previous slide actions
  const handleNext = useCallback(() => {
    setRightIndex(middleIndex);
    setMiddleIndex(leftIndex);
    setLeftIndex((leftIndex - 1 + courses.length) % courses.length);
  }, [leftIndex, middleIndex, courses.length]);
    

  const handlePrev = useCallback(() => {
    setLeftIndex(middleIndex);
    setMiddleIndex(rightIndex);
    setRightIndex((rightIndex + 1) % courses.length);
  }, [middleIndex, rightIndex, courses.length]);
    

  // Handle dragging
  const handleDragStart = (e) => {
    setDragStartX(e.clientX);
    setIsDragging(true);
    e.preventDefault();
  };

  const handleDrag = (e) => {
    if (!isDragging || dragStartX === null) return;
    const dragDistance = dragStartX - e.clientX;
    if (dragDistance > 100) {
      handlePrev();
      setDragStartX(null);
      setIsDragging(false);
    } else if (dragDistance < -100) {
      handleNext();
      setDragStartX(null);
      setIsDragging(false);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragStartX(null);
  };

  useEffect(() => {
    const interval = setInterval(handleNext, 10000);
    return () => clearInterval(interval);
  }, [handleNext]);

  // Handle invalid courses prop
  if (!courses || !Array.isArray(courses) || courses.length === 0) {
    console.error("Courses prop is not provided, not an array, or empty");
    return <div>No courses available</div>;
  }

  return (
    // <div
    //   className="carousel-container"
    //   ref={carouselRef}
    //   onMouseDown={handleDragStart}
    //   onMouseMove={handleDrag}
    //   onMouseUp={handleDragEnd}
    //   onDragStart={(e) => e.preventDefault()}
    // >
    //   <h1 className="head font-rome" style={{color:"orange", fontSize:"1.5rem", marginBottom:"2%"}}>EXPLORE COURSES</h1>
    //   <button className="nav-button left" onClick={handlePrev}>
    //     &#60;
    //   </button>
    //   <div className="carousel-boxes">
    //     <div
    //       className="carousel-box left-box"
    //       onClick={() => window.location.href = courses[leftIndex].link}
    //     >
    //       <img
    //         src={courses[leftIndex].image}
    //         alt={courses[leftIndex].name}
    //         className="course-image"
    //       />
    //     </div>
    //     <div
    //       className="carousel-box middle-box"
    //       onClick={() => window.location.href = courses[middleIndex].link}
    //     >
    //       <img
    //         src={courses[middleIndex].image}
    //         alt={courses[middleIndex].name}
    //         className="course-image"
    //       />
    //     </div>
    //     <div
    //       className="carousel-box right-box"
    //       onClick={() => window.location.href = courses[rightIndex].link}
    //     >
    //       <img
    //         src={courses[rightIndex].image}
    //         alt={courses[rightIndex].name}
    //         className="course-image"
    //       />
    //     </div>
    //   </div>
    //   <button className="nav-button right" onClick={handleNext}>
    //     &#62;
    //   </button>
    // </div>
    <div className="-mt-[17vmax] font-popp">
      <div className="grid w-full relative h-fit border border-black z-10 p-10">
        <button className="rounded-full absolute top-[35%] left-4 w-[3vmax] outline outline-offset-2 outline-amber-500 pr-2 h-[3vmax] bg-amber-600"
          onClick={() => pos_hdl(pos - 1)}>
          <ChevronLeftIcon className="size-max text-white"></ChevronLeftIcon>
        </button>
        <button className="rounded-full absolute top-[35%] right-4 w-[3vmax] outline outline-offset-2 outline-amber-500 pl-2 h-[3vmax] bg-amber-600"
          onClick={() => pos_hdl(pos + 1)}>
          <ChevronRightIcon className="size-max text-white"></ChevronRightIcon>
        </button>
        <div className="font-popp row-[1/2] col-[1/8] w-screen z-[1] h-[300px] flex items-center justify-center pointer-events-none mb-10 -ml-10"
          style={{transformStyle: 'preserve-3d', perspective: '600px'}}>
          {courses.map((cur, i) => (
            <div className={`text-center bg-white absolute w-[30vmax] h-[20vmax] transition-all duration-[0.25s] ease-linear bg-cover bg-center 
              ${(pos === i + 1) ? 'focs': ''} rounded-[20px] overflow-y-hidden group`} onClick={() => setPos(i + 1)}
              style={{transform: `rotateY(${-10 * (pos - (i + 1))}deg) translateX(${-450 * (pos - (i + 1))}px)`, backgroundImage: `url('${cur.image}')`,
                zIndex: `${Math.max(((pos - (i + 1)) * -1), (pos - (i + 1))) + 100}`}}>
              <div className={`${(pos <= i + 2 && pos >= i) ? "hidden": "block"} w-full h-full bg-[#0000001a] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-[5px]`}></div>  
              <div className="grid content-end w-full h-full text-white text-[2vmax]
                translate-y-[20vmax] delay-200 group-[.focs]:translate-y-0 duration-300 ease transition-all p-2"
                style={{background: `linear-gradient(to top, ${cur.clr}, ${cur.clr}00 55%)`}}>
                {cur.name}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-3 w-[100vw]">
          {rdb.map((btn , i) => (
            <button className={`text-white p-2 rounded-xl min-w-[5vmax]`} style={{backgroundColor: btn.clr}} 
              type="button" name="pos" onClick={() => {pos_hdl(i + 1)}}>{btn.name} Engg</button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseCarousel;
