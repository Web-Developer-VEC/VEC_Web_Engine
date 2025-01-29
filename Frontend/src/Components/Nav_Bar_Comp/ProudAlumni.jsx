import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./DynamicPhotoText.css";
import "./calen.css";



const ProudAlumni = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch alumni data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/alumni");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching alumni data:", error);
      }
    };
    fetchData();
  }, []);

  const handleNext = () => {
    if (currentPage < data.length - 1 && !isFlipping) {
      setIsFlipping(true);
      setFlipDirection("right");

      setTimeout(() => {
        setCurrentPage((prev) => prev + 1);
        setIsFlipping(false);
        setFlipDirection(null);
        setCurrentIndex(0); // Reset alumni index when changing pages
      }, 500);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0 && !isFlipping) {
      setIsFlipping(true);
      setFlipDirection("left");

      setTimeout(() => {
        setCurrentPage((prev) => prev - 1);
        setIsFlipping(false);
        setFlipDirection(null);
        setCurrentIndex(0); // Reset alumni index when changing pages
      }, 500);
    }
  };

  // Automatically cycle through alumni within the current department
  useEffect(() => {
    const timer = setInterval(() => {
      if (
        data.length > 0 &&
        data[currentPage]?.alumni?.students.length > 0
      ) {
        setCurrentIndex((prevIndex) =>
          (prevIndex + 1) % data[currentPage].alumni.students.length
        );
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [currentPage, data]);

  return (
    <div className="proud-alumni">
      <div className="app-container">
        <div className="text-content">
          <h1>Get</h1>
          <h2 style={{ margin: "0 20px" }}>Inspired</h2>
          <h3 style={{ margin: "0 40px" }}>by</h3>
          <h1 style={{ margin: "0 21px" }}>Our Legacy</h1>
        </div>

        <div className="flipbook">
          <div className="pages">
            <div
              className={`page ${
                flipDirection === "right" ? "flip-right" : ""
              } ${flipDirection === "left" ? "flip-left" : ""}`}
            >
              {data.length > 0 && (
                <div>
                  <h2>{data[currentPage].alumni.department_name}</h2>
                  <img
                    src={data[currentPage].alumni.students[currentIndex].photo}
                    alt={data[currentPage].alumni.students[currentIndex].name}
                    className="image"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="controls">
            <button
              onClick={handlePrev}
              disabled={currentPage === 0 || isFlipping}
              className="button"
            >
              ‹
            </button>
            <button
              onClick={handleNext}
              disabled={currentPage === data.length - 1 || isFlipping}
              className="button"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <div className="dept">
        {data.map((department, index) => (
          <div key={index} className="dynamic-container">
            <h1>{department.alumni.department_name}</h1>
            <div className="dynamic-content">
              <AnimatePresence mode="wait">
                <motion.div
                  key={department.alumni.students[currentIndex].photo}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 1 }}
                  className="dynamic-image-wrapper"
                >
                  <img
                    src={department.alumni.students[currentIndex].photo}
                    alt={department.alumni.students[currentIndex].name}
                    className="dynamic-image"
                  />
                </motion.div>
              </AnimatePresence>
              <div className="dynamic-text-container">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={department.alumni.students[currentIndex].name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="dynamic-text"
                  >
                    <h2 className="dynamic-title">
                      {department.alumni.students[currentIndex].name}
                    </h2>
                    <p className="dynamic-description">
                      Year: {department.alumni.students[currentIndex].year}
                    </p>
                    <p className="dynamic-description">
                      Company: {department.alumni.students[currentIndex].company_name}
                    </p>
                    <p className="dynamic-description">
                      LPA: {department.alumni.students[currentIndex].LPA}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProudAlumni;
