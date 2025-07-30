import React, { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Toggle from "./Toggle";
import "./Banner.css";

const Banner = ({
  backgroundImage,
  headerText,
  subHeaderText,
  toggle,
  theme,
  isVideo = false, // New prop to determine if background is a video
}) => {
  const { scrollY } = useScroll();
  const parallax = useTransform(scrollY, [0, 300], [0, 150]);
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.5]);
  const videoRef = useRef(null);

  // Optional: Pause video on scroll past 300px
  useEffect(() => {
    const handleScroll = () => {
      if (videoRef.current) {
        if (window.scrollY > 300) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="banner relative h-[200px] overflow-hidden pt-12">
      {/* Background Layer */}
      {isVideo ? (
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={backgroundImage} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <motion.div
          className="absolute top-0 left-0 w-full h-full bg-cover bg-center z-0"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            y: parallax,
          }}
        />
      )}

      {/* Overlay */}
      <div className="banner-overlay absolute z-10 right-1 pt-[60px] lg:pt-4">
        <Toggle attr="float-right lg:-top-[0%] mr-24" toggle={toggle} theme={theme} />
      </div>

      {/* Content */}
      <div className="banner-content absolute z-10 px-4 text-white">
        <motion.h1
          className="banner-header"
          style={{ opacity: headerOpacity }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {headerText}
        </motion.h1>

        <motion.div
          className="banner-underline"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        />

        <motion.p
          className="banner-subheader"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
        >
          {subHeaderText}
        </motion.p>

        <motion.div
          className="banner-hover-effect"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
};

export default Banner;
