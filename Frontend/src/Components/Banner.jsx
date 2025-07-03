import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import "./Banner.css";
import Sun from "./Assets/sun.png";
import Moon from "./Assets/moon.png";
import Toggle from "./Toggle";

const Banner = ({ backgroundImage, headerText, subHeaderText, toggle, theme }) => {
  const { scrollY } = useScroll();
  const parallax = useTransform(scrollY, [0, 300], [0, 150]);
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.5]);

  return (
      <div className="banner bottom-2 pt-12">
          {/* Parallax Background */}
          <motion.div
              className="banner-background"
              style={{
                  backgroundImage: `url(${backgroundImage})`,
                  y: parallax,
              }}
          ></motion.div>

          {/* Overlay */}
          <div className="banner-overlay z-[500] right-1 pt-[1.25em] lg:pt-0">
              {/* <Toggle attr="float-right lg:-top-[0%] mr-24" toggle={toggle} theme={theme} /> */}
          </div>

          {/* Content with unique layout */}
          <div className="banner-content">
              {/* Header with scroll effect */}
              <motion.h1
                  className="banner-header"
                  style={{opacity: headerOpacity}}
                  initial={{opacity: 0, x: -50}}
                  animate={{opacity: 1, x: 0}}
                  transition={{duration: 1, ease: "easeOut"}}
              >
                  {headerText}
              </motion.h1>

              {/* Underline animation */}
              <motion.div
                  className="banner-underline"
                  initial={{scaleX: 0}}
                  animate={{scaleX: 1}}
                  transition={{duration: 0.8, ease: "easeOut", delay: 0.2}}
              ></motion.div>

              {/* Subheader with fade-in and upward slide */}
              <motion.p
                  className="banner-subheader"
                  initial={{opacity: 0, y: 50}}
                  animate={{opacity: 1, y: 0}}
                  transition={{duration: 1, ease: "easeOut", delay: 0.4}}
              >
                  {subHeaderText}
              </motion.p>

              {/* Add additional animations for visual impact */}
              <motion.div
                  className="banner-hover-effect"
                  initial={{scale: 1}}
                  whileHover={{scale: 1.05}}
                  transition={{duration: 0.3}}
              ></motion.div>
          </div>
      </div>
  );
};

export default Banner;
