import React, { useState, useEffect, useRef } from "react";
import axios from "axios";  
import { motion, useAnimation, useInView } from "framer-motion";
import "./Events.css";

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
            <div className="circle">{event.start_date}</div>
          </div>
          <div className="event-name">{event.title}</div>
        </div>
        <div className="event-details">
          <div className="event-row department-name">
            {event.department}
          </div>
          <div className="event-row description">
            {event.content}
          </div>
          <div className="event-footer">
            <div className="event-row duration">
              <i className="fas fa-calendar-alt"></i> {event.start_date + " - " + event.end_date}
            </div>
            <div className="event-row links">
              <a href={event.brochure_path} target="_blank" rel="noopener noreferrer">
                Brochure
              </a>
              <a href={event.website_link} target="_blank" rel="noopener noreferrer">
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
  const ref = useRef(null);
  const isInView = useInView(ref, { threshold: 0.1 });
  const [eventsDetail , setEventsData] = useState([false])
  const events = [...eventsDetail, ...eventsDetail, ...eventsDetail]

  useEffect(() => {
    if (!isPaused && isInView) {
      const interval = setInterval(() => {
        controls.start({
          x: `-${(currentIndex + 1) * (425 + 40)}px`,
          transition: { duration: 1, ease: "linear" }
        });
        setCurrentIndex((prevIndex) => (prevIndex + 1) % (eventsDetail.length * 3));
      }, 3000); // Slide every 3 seconds
      return () => clearInterval(interval);
    }
  }, [currentIndex, controls, isPaused, isInView]);

// fetching announcement data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/events`);
        console.log("Ann",response.data);
        setEventsData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      } 
    };
    fetchData();
  },[]);

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
        {events?.map((event, index) => (
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