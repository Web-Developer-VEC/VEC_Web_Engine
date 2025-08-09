import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./hostelfacilities.css";
import LoadComp from "../../LoadComp";

export default function HostelFacilities({ hostelData }) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return encodeURI(path?.startsWith("http") ? path : `${BASE_URL}${path}`);
  };

  const [expandedId, setExpandedId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [hoveredId, setHoveredId] = useState(null);
  const [loadedImages, setLoadedImages] = useState({});

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setExpandedId(null);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleExpand = (id) => {
    if (isMobile) {
      setExpandedId(expandedId === id ? null : id);
    }
  };

  const handleImageLoad = (index) => {
    setLoadedImages(prev => ({ ...prev, [index]: true }));
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const imageVariants = {
    normal: { scale: 1 },
    hover: { scale: 1.03 },
    expanded: { scale: 1.05 }
  };

  const textVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  return (
    <>
      {hostelData ? (
        <div className="facility ">
          <motion.h2 
            className="hostel-head "
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Our Facilities
          </motion.h2>
          
          <div className="facilities-wrapper">
            <motion.div
              className="hostal-fac-container"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {hostelData?.map((facility, index) => (
                <motion.div
                  key={index}
                  className={`hostel-fac-item ${isMobile && expandedId === index ? "expanded" : ""}`}
                  variants={itemVariants}
                  initial="hidden"
                  animate="show"
                >
                  {/* Image container with hover/click effects */}
                  <motion.div
                    className="image-container"
                    onClick={() => handleExpand(index)}
                    onHoverStart={() => !isMobile && setHoveredId(index)}
                    onHoverEnd={() => !isMobile && setHoveredId(null)}
                    variants={imageVariants}
                    whileHover={!isMobile ? "hover" : {}}
                    animate={
                      isMobile && expandedId === index ? "expanded" : "normal"
                    }
                  >
                    {/* Skeleton / Placeholder */}
<div 
  className="loading-placeholder"
  style={{ opacity: loadedImages[index] ? 0 : 1 }}
/>

{/* Actual Image */}
<img
  className="facility-image"
  src={UrlParser(facility.image_path)}
  alt={facility.title}
  style={{
    objectFit: "cover",
    width: "100%",
    height: "100%",
  }}
/>

                  
                  </motion.div>

                  {/* Stable text content below image */}
                  <motion.div 
                    className="text-content"
                    variants={textVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.3 }}
                  >
                    <h2>{facility.title}</h2>
                    <p>{facility.description}</p>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      ) : (
        <motion.div 
          className="loading-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <LoadComp />
        </motion.div>
      )}
    </>
  );
}