import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import "./Activities.css";

const Activities = ({ data }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filterOption, setFilterOption] = useState("Recent"); // Default: Recent

  console.log("Activities", data);
  const activitiesArray = Object.values(data); // Convert object to array

  useEffect(() => {
    filterEvents();
  }, [filterOption, data]);

  // 🔹 Function to filter events based on date
  const filterEvents = () => {
    const currentDate = new Date();
    let sixMonthsAgo = new Date();
    let filtered = activitiesArray;

    if (filterOption === "Recent") {
      let foundEvents = [];

      for (let months = 6; months <= 12; months += 3) {
        sixMonthsAgo.setMonth(currentDate.getMonth() - months);
        foundEvents = activitiesArray.filter(event => {
          const eventDate = new Date(event.date);
          return !isNaN(eventDate) && eventDate >= sixMonthsAgo && eventDate <= currentDate;
        });

        if (foundEvents.length >= 5) break; // Stop if we have enough events
      }

      filtered = foundEvents.length > 0 ? foundEvents : activitiesArray; // Show all if still empty
    }

    setFilteredEvents(filtered);
  };

  const handleFilterChange = (e) => {
    setFilterOption(e.target.value);
  };

  const handleViewMore = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* 🔹 Dropdown Filter */}
      <div className="activities-filter-bar">
        <select name="filter" className="filter-select" onChange={handleFilterChange}>
          <option value="Recent">Recent</option>
          <option value="Overall">Overall</option>
        </select>
      </div>

      {/* 🔹 Events Display */}
      <div className="activities-container">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event, index) => (
            <AnimatedCard key={index} event={event} handleViewMore={handleViewMore} />
          ))
        ) : (
          <p>No events available.</p>
        )}
      </div>

      {/* 🔹 Modal for Event Details */}
      {isModalOpen && (
        <div className={`modal ${isModalOpen ? "open" : ""}`}>
          <div className="modal-content">
            <span className="close-btn" onClick={closeModal}>&times;</span>
            <img src={selectedEvent.image_path} alt="Event" className="modal-image" />
            <h2>{selectedEvent.name_of_event}</h2>
            <p><strong>Date: </strong>{selectedEvent.date}</p>
            <p><strong>Coordinator: </strong>{selectedEvent.coordinator}</p>
            <p><strong>Resource Person: </strong>{selectedEvent.resource_person}</p>
            <p><strong>Beneficiaries: </strong>{selectedEvent.beneficiaries}</p>
            <p><strong>Relevant PO, PSO: </strong>{selectedEvent.relevant_PO_PSO}</p>
          </div>
        </div>
      )}
    </>
  );
};

// 🔹 Animated Card Component
const AnimatedCard = ({ event, handleViewMore }) => {
  const controls = useAnimation();
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div ref={ref} className="card_act" variants={cardVariants} initial="hidden" animate={controls}>
      <img src={event.image_path} alt="Event" className="card-image" />
      <div className="card-details">
        <p className="card-date">{event.date}</p>
        <h3 className="card-title">{event.name_of_event}</h3>
        <p className="card-coordinator">Coordinator: {event.coordinator}</p>
        <button onClick={() => handleViewMore(event)} className="activities-view-more-btn mt-3">
          View More
        </button>
      </div>
    </motion.div>
  );
};

export default Activities;
