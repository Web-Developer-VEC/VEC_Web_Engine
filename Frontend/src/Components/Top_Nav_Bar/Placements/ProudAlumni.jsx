import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./DynamicPhotoText.css";
import Banner from "../../Banner";

const ProudAlumni = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
  return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

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

    <div>
      <Banner 
          backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
          headerText="OUR PROUD ALUMNI"
          subHeaderText="Enrich Your Knowledge"
        />
    <div className="proud-alumni">
      <div className="dept">
        {data.map((department, index) => (
          <div key={index} className="dynamic-container">
            <h1 className="department-title">{department.alumni.department_name}</h1>
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
                    src={UrlParser(department.alumni.students[currentIndex].photo)}
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
    </div>
  );
};

export default ProudAlumni;
