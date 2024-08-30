import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import "./Events1.css";
// Array of events
const events = [
  {
    eventName: "HIGH-END WORKSHOP ON CIVIL SOFTWARE APPLICATION E-tabs & Ansys Fluent",
    departmentName: "Civil Engineering",
    description: "nrugeuirgbuiebrvuibaeryufuierbiuegrueioriugerguiberiogbeuirgienrguieruigfiegrbiuerguieriogneoiruiebrigbeiurguiergbeuirbb",
    duration: "21 AUG - 23 AUG, 2024",
    eventDate: "21 AUG",
    brochureLink: "https://example.com/brochure1",
    websiteLink: "https://example.com/website1",
    light_color: "#5e84a0",
    dark_color: "#3e5c70",
    tex_col: "white"
  },
  {
    eventName: "MEPEXPO'24",
    departmentName: "Mechanical Engineering",
    description: "nrugeuirgbuiebrvuibaeryufuierbiuegrueioriuerguiberiogbeuirgienrguieruigfiegrbiuerguieriogneoiruiebrigbeiurguiergbeuirbb",
    duration: "29 AUG - 30 AUG, 2024",
    eventDate: "29 AUG",
    brochureLink: "https://example.com/brochure2",
    websiteLink: "https://example.com/website2",
    light_color: "#896a21",
    dark_color: "#5e4a14 ",
    tex_col: "white"
  },
  {
    eventName: "INTERNATIONAL CONFERENCE ON ARTIFICIAL INTELLIGENCE",
    departmentName: "Computer Science Engineering",
    description: "Detailed description of the AI conference event.",
    duration: "5 SEP - 7 SEP, 2024",
    eventDate: "5 SEP",
    brochureLink: "https://example.com/brochure3",
    websiteLink: "https://example.com/website3",
    light_color: "#01a302",
    dark_color: "#014900",
    tex_col: "white"   
  },
  {
    eventName: "ADVANCED ROBOTICS WORKSHOP",
    departmentName: "AI & DS",
    description: "Insights into the advanced robotics workshop.",
    duration: "10 SEP - 12 SEP, 2024",
    eventDate: "10 SEP",
    brochureLink: "https://example.com/brochure4",
    websiteLink: "https://example.com/website4",
    light_color: "#be3531",
    dark_color: "#5f1214",
    tex_col: "white"
  },
  {
    eventName: "HIGH-END WORKSHOP ON CIVIL SOFTWARE APPLICATION E-tabs & Ansys Fluent",
    departmentName: "Information Technology",
    description: "nrugeuirgbuiebrvuibaeryufuierbiuegrueioriugerguiberiogbeuirgienrguieruigfiegrbiuerguieriogneoiruiebrigbeiurguiergbeuirbb",
    duration: "21 AUG - 23 AUG, 2024",
    eventDate: "21 AUG",
    brochureLink: "https://example.com/brochure1",
    websiteLink: "https://example.com/website1",
    light_color: "#a982b4",
    dark_color: "#643d6e",
    tex_col: "white"
  },
  {
    eventName: "SUSTAINABILITY IN ENGINEERING SEMINAR",
    departmentName: "Electronics and Communicataion Engineering",
    description: "A seminar focusing on sustainability in engineering.",
    duration: "15 SEP - 17 SEP, 2024",
    eventDate: "15 SEP",
    brochureLink: "https://example.com/brochure5",
    websiteLink: "https://example.com/website5",
    light_color: "#0226c4",
    dark_color: "#012267",
    tex_col: "white"
  },
];
function EventBox({ event, onMouseEnter, onMouseLeave }) {
  return (
    <motion.div
      className="cro-item"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      whileHover={{ scale: 1.05 }} // Hover effect
    >
      <motion.div
        className="evnt-box"
        whileHover={{ boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.15)" }} // Hover shadow effect
      >
        <div className="evnt-header">
          <div className="evnt-date">
            <div className="circle" style={{background: `${event.dark_color}`}}>
              {event.eventDate}</div>
          </div>
          <div className="evnt-name">{event.eventName}</div>
        </div>
        <div className="evnt-details">
          <div className="evnt-row department-name backdrop-blur-[4px]" 
            style={{background: `linear-gradient(to right, ${event.dark_color} -20%, ${event.light_color} 50%, ${event.dark_color} 120%)`,
              color:`${event.tex_col}`}}>
            {event.departmentName}
          </div>
          <div className="evnt-row description">
            {event.description}
          </div>
          <div className="evnt-footer">
            <div className="evnt-row duration">
              <i className="fas fa-calendar-alt"></i> {event.duration}
            </div>
            <div className="evnt-row links">
              <a href={event.brochureLink} target="_blank" rel="noopener noreferrer">
                Brochure
              </a>
              <a href={event.websiteLink} target="_blank" rel="noopener noreferrer">
                Website
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Event1() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const controls = useAnimation();
  const [isPaused, setIsPaused] = useState(false);
  const eventList = useRef([...events, ...events, ...events]);
  const ref = useRef(null);
  const isInView = useInView(ref, { threshold: 0.1 });

  useEffect(() => {
    if (!isPaused && isInView) {
      const interval = setInterval(() => {
        controls.start({
          x: `-${(currentIndex + 1) * (625 + 40)}px`,
          transition: { duration: 1, ease: "linear" }
        });
        setCurrentIndex((prevIndex) => (prevIndex + 1) % (events.length * 5));
      }, 6000); // Slide every 3 seconds
      return () => clearInterval(interval);
    }
  }, [currentIndex, controls, isPaused, isInView]);

  const handleMouseEnter = () => {
    controls.stop();
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <div className="cro-container font-popp" ref={ref}>
      <motion.div
        className={`cro-content ${isPaused ? "paused" : ""}`}
        animate={controls}
        initial={{ x: 0 }}
      >
        {eventList.current.map((event, index) => (
          <EventBox
            key={index}
            event={event}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        ))}
      </motion.div>
    </div>
  );
}

export default Event1;