import React, { useState, useEffect, useCallback, useRef } from "react";
import "./Courses.css";

const CourseCarousel = ({ courses }) => {
  // Declare hooks at the top level
  const [leftIndex, setLeftIndex] = useState(0);
  const [middleIndex, setMiddleIndex] = useState(1);
  const [rightIndex, setRightIndex] = useState(2);
  const [dragStartX, setDragStartX] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const carouselRef = useRef(null);

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
    <div
      className="carousel-container"
      ref={carouselRef}
      onMouseDown={handleDragStart}
      onMouseMove={handleDrag}
      onMouseUp={handleDragEnd}
      onDragStart={(e) => e.preventDefault()}
    >
      <h1 className="head font-rome" style={{color:"orange", fontSize:"1.5rem", marginBottom:"2%"}}>EXPLORE COURSES</h1>
      <button className="nav-button left" onClick={handlePrev}>
        &#60;
      </button>
      <div className="carousel-boxes">
        <div
          className="carousel-box left-box"
          onClick={() => window.location.href = courses[leftIndex].link}
        >
          <img
            src={courses[leftIndex].image}
            alt={courses[leftIndex].name}
            className="course-image"
          />
        </div>
        <div
          className="carousel-box middle-box"
          onClick={() => window.location.href = courses[middleIndex].link}
        >
          <img
            src={courses[middleIndex].image}
            alt={courses[middleIndex].name}
            className="course-image"
          />
        </div>
        <div
          className="carousel-box right-box"
          onClick={() => window.location.href = courses[rightIndex].link}
        >
          <img
            src={courses[rightIndex].image}
            alt={courses[rightIndex].name}
            className="course-image"
          />
        </div>
      </div>
      <button className="nav-button right" onClick={handleNext}>
        &#62;
      </button>
    </div>
  );
};

export default CourseCarousel;
