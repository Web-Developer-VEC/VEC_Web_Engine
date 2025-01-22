import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./DynamicPhotoText.css";
import "./calen.css";
import t1 from './Assets/thala-1.jpg';
import t2 from './Assets/thala-2.jpg';
import t3 from './Assets/thala-3.jpg';
import t4 from './Assets/thala-4.jpg';

const images = [t1, t2, t3, t4];

const ProudAlumni = () => {

    const [currentPage, setCurrentPage] = useState(0);
    const [isFlipping, setIsFlipping] = useState(false);
    const [flipDirection, setFlipDirection] = useState(null);
    const [showImage, setShowImage] = useState(currentPage); // Image currently displayed
  
    const handleNext = () => {
      if (currentPage < images.length - 1 && !isFlipping) {
        setIsFlipping(true);
        setFlipDirection("right");
  
        // Delay image change until halfway through the flip
        setTimeout(() => {
          setShowImage(currentPage + 1);
        }, 500); // Half of the animation duration (800ms)
  
        // Complete the flip and reset state
        setTimeout(() => {
          setCurrentPage((prev) => prev + 1);
          setIsFlipping(false);
          setFlipDirection(null); // Remove animation class
        }, 500);
      }
    };
  
    const handlePrev = () => {
      if (currentPage > 0 && !isFlipping) {
        setIsFlipping(true);
        setFlipDirection("left");
  
        // Delay image change until halfway through the flip
        setTimeout(() => {
          setShowImage(currentPage - 1);
        }, 500); // Half of the animation duration (800ms)
  
        // Complete the flip and reset state
        setTimeout(() => {
          setCurrentPage((prev) => prev - 1);
          setIsFlipping(false);
          setFlipDirection(null); // Remove animation class
        }, 500);
      }
    };

 // Automatic scrolling logic (Forwards and then reverse scrolling)
 useEffect(() => {
  const autoScroll = setInterval(() => {
    if (!isFlipping) {
      if (currentPage === images.length - 1) {
        // Flip animation when reaching the last page, then go to the first image
        setIsFlipping(true);
        setFlipDirection('right'); // Set the flip direction

        setTimeout(() => {
          setShowImage(0);
          setCurrentPage(0);
          setIsFlipping(false);
          setFlipDirection(null); // Reset flip direction after animation
        }, 1000); // Timing for flip to complete

      } else if (currentPage === 0) {
        // When at first image, continue to next image
        handleNext();
      } else {
        // Continue flipping forward
        handleNext();
      }
    }
  }, 3000); // Scroll every 3 seconds

  return () => clearInterval(autoScroll); // Clear interval when component unmounts
}, [currentPage, isFlipping]); // Dependencies include currentPage and isFlipping


  const studentData = [
    {
      dept: "Computer Science & Engineering",
      time: "3",
      Alumni_1: [
        {
          image: "https://picsum.photos/id/237/200/300",
          title: " Landscape",
          description: "This is a stunning view of nature.",
        },
        {
          image: "https://picsum.photos/seed/picsum/200/300",
          title: " Ocean",
          description: "Feel the calmness of the ocean breeze.",
        },
        {
          image: "https://picsum.photos/200/300?grayscale",
          title: " Mountains",
          description: "Experience the grandeur of the mountains.",
        },
      ],
    },

    {
        dept: "Electronics & Communication Engineering",
        time: "2",
        Alumni_1: [
          {
            image: "https://picsum.photos/id/237/200/300",
            title: "Beautiful Landscape",
            description: "This is a stunning view of nature.",
          },
          {
            image: "https://picsum.photos/seed/picsum/200/300",
            title: "Serene Ocean",
            description: "Feel the calmness of the ocean breeze.",
          },
          {
            image: "https://picsum.photos/200/300?grayscale",
            title: "Majestic Mountains",
            description: "Experience the grandeur of the mountains.",
          },
        ],
      },

      {
        dept: "Artificial Intelligence & Data Science",
        time: 1,
        Alumni_1: [
          {
            image: "https://picsum.photos/id/237/200/300",
            title: "Beautiful Landscape",
            description: "This is a stunning view of nature.",
          },
          {
            image: "https://picsum.photos/seed/picsum/200/300",
            title: "Serene Ocean",
            description: "Feel the calmness of the ocean breeze.",
          },
          {
            image: "https://picsum.photos/200/300?grayscale",
            title: "Majestic Mountains",
            description: "Experience the grandeur of the mountains.",
          },
        ],
      },
];

  const [currentIndex, setCurrentIndex] = useState(0);
  const alumniData_1 = studentData[0].Alumni_1; // Assuming only one department for now

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % alumniData_1.length);
    }, 5000); // Interval set to 5000ms (5 seconds)

    return () => clearInterval(timer);
  }, [alumniData_1.length]);

  return (
    <div className="proud-alumni">
      <div className="app-container">
        
        <div className="text-content">
          <h1>Get</h1>
          <h2 style={{margin: '0 20px'}}>Inspired</h2>
          <h3 style={{margin: '0 40px'}}>by</h3>
          <h1 style={{margin: '0 21px'}}>Our Legacy</h1>
        </div>
        <div className="flipbook">
          <div className="pages">
            <div
              className={`page ${
                flipDirection === "right" ? "flip-right" : ""
              } ${flipDirection === "left" ? "flip-left" : ""}`}
            >
              <img
                src={images[showImage]}
                alt={`Page ${currentPage + 1}`}
                className="image"
              />
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
              disabled={currentPage === images.length - 1 || isFlipping}
              className="button"
            >
              ›
            </button>
          </div>  
        </div>
      </div>

      <div className="dept">
        {studentData.map((data, index) => (
          <div key={index} className="dynamic-container">
            <h1>{data.dept}</h1>
            <div className="dynamic-content">
              <AnimatePresence mode="wait">
                <motion.div
                  key={data.Alumni_1[currentIndex].image}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 1 }}
                  className="dynamic-image-wrapper"
                >
                  <img
                    src={data.Alumni_1[currentIndex].image}
                    alt="Dynamic"
                    className="dynamic-image"
                  />
                </motion.div>
              </AnimatePresence>
              <div className="dynamic-text-container">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={data.Alumni_1[currentIndex].title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="dynamic-text"
                  >
                    <h2 className="dynamic-title">
                      {data.Alumni_1[currentIndex].title}
                    </h2>
                    <p className="dynamic-description">
                      {data.Alumni_1[currentIndex].description}
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
