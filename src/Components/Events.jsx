import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import "./Events.css";
// Array of events
const events = [
  {
    eventName: "HIGH-END WORKSHOP ON CIVIL SOFTWARE APPLICATION E-tabs & Ansys Fluent",
    departmentName: "Civil Engineering",
    description: "nrugeuirgbuiebrvuibaeryufuierbiuegrueioriugerguiberiogbeuirgienrguieruigfiegrbiuerguieriogneoiruiebrigbeiurguiergbeuirbb",
    duration: "21 AUG - 23 AUG, 2024",
    eventDate: "21 AUG",
    brochureLink: "https://example.com/brochure1",
    websiteLink: "https://example.com/website1"
  },
  {
    eventName: "MEPEXPO'24",
    departmentName: "Mechanical Engineering",
    description: "nrugeuirgbuiebrvuibaeryufuierbiuegrueioriuerguiberiogbeuirgienrguieruigfiegrbiuerguieriogneoiruiebrigbeiurguiergbeuirbb",
    duration: "29 AUG - 30 AUG, 2024",
    eventDate: "29 AUG",
    brochureLink: "https://example.com/brochure2",
    websiteLink: "https://example.com/website2"
  },
  {
    eventName: "INTERNATIONAL CONFERENCE ON ARTIFICIAL INTELLIGENCE",
    departmentName: "Computer Science",
    description: "Detailed description of the AI conference event.",
    duration: "5 SEP - 7 SEP, 2024",
    eventDate: "05 SEP",
    brochureLink: "https://example.com/brochure3",
    websiteLink: "https://example.com/website3"
  },
  {
    eventName: "ADVANCED ROBOTICS WORKSHOP",
    departmentName: "Robotics Engineering",
    description: "Insights into the advanced robotics workshop.",
    duration: "10 SEP - 12 SEP, 2024",
    eventDate: "10 SEP",
    brochureLink: "https://example.com/brochure4",
    websiteLink: "https://example.com/website4"
  },
  {
    eventName: "SUSTAINABILITY IN ENGINEERING SEMINAR",
    departmentName: "Environmental Engineering",
    description: "A seminar focusing on sustainability in engineering.",
    duration: "15 SEP - 17 SEP, 2024",
    eventDate: "15 SEP",
    brochureLink: "https://example.com/brochure5",
    websiteLink: "https://example.com/website5"
  },
  {
    eventName: "HIGH-END WORKSHOP ON CIVIL SOFTWARE APPLICATION E-tabs & Ansys Fluent",
    departmentName: "Civil Engineering",
    description: "nrugeuirgbuiebrvuibaeryufuierbiuegrueioriugerguiberiogbeuirgienrguieruigfiegrbiuerguieriogneoiruiebrigbeiurguiergbeuirbb",
    duration: "21 AUG - 23 AUG, 2024",
    eventDate: "21 AUG",
    brochureLink: "https://example.com/brochure1",
    websiteLink: "https://example.com/website1"
  },
];
function EventBox({ event, onMouseEnter, onMouseLeave }) {
  return (
    <motion.div
      className="caro-item"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      whileHover={{ scale: 1.05 }} // Hover effect
    >
      <motion.div
        className="event-box"
        whileHover={{ boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.15)" }} // Hover shadow effect
      >
        <div className="event-header">
          <div className="event-date">
            <div className="circle">{event.eventDate}</div>
          </div>
          <div className="event-name">{event.eventName}</div>
        </div>
        <div className="event-details">
          <div className="event-row department-name">
            {event.departmentName}
          </div>
          <div className="event-row description">
            {event.description}
          </div>
          <div className="event-footer">
            <div className="event-row duration">
              <i className="fas fa-calendar-alt"></i> {event.duration}
            </div>
            <div className="event-row links">
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

function Carousel() {
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
          x: `-${(currentIndex + 1) * (425 + 40)}px`,
          transition: { duration: 1, ease: "linear" }
        });
        setCurrentIndex((prevIndex) => (prevIndex + 1) % (events.length * 3));
      }, 3000); // Slide every 3 seconds
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
    <div className="caro-container font-popp" ref={ref}>
      <motion.div
        className={`caro-content ${isPaused ? "paused" : ""}`}
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

export default Carousel;