import React, { useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import "./Activities.css";
import collegeImage from "../../Assets/college.jpeg";

const Activities = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const events = [
    {
      date: "05/03/2024",
      name: "Seminar on Career Opportunity in Data Science with Table and Power BI",
      coordinator: "Mrs. M. Priya",
      image: collegeImage,
      details: {
        resourcePerson:
          "Mr. Ahamed Khalid, Head - Academic Alliances, Imarticus Learning, IIM, Bangalore",
        beneficiaries: "II- and III-YEAR students",
        relevantPO_PSO: "PSO1, PSO2, PO3, PO6, PO9, PO10, PO11, PSO1",
      },
    },
    {
      date: "05/03/2024",
      name: "Seminar on Career Opportunity in Data Science with Table and Power BI",
      coordinator: "Mrs. M. Priya",
      image: collegeImage,
      details: {
        resourcePerson:
          "Mr. Ahamed Khalid, Head - Academic Alliances, Imarticus Learning, IIM, Bangalore",
        beneficiaries: "II- and III-YEAR students",
        relevantPO_PSO: "PSO1, PSO2, PO3, PO6, PO9, PO10, PO11, PSO1",
      },
    },
    {
      date: "05/03/2024",
      name: "Seminar on Career Opportunity in Data Science with Table and Power BI",
      coordinator: "Mrs. M. Priya",
      image: collegeImage,
      details: {
        resourcePerson:
          "Mr. Ahamed Khalid, Head - Academic Alliances, Imarticus Learning, IIM, Bangalore",
        beneficiaries: "II- and III-YEAR students",
        relevantPO_PSO: "PSO1, PSO2, PO3, PO6, PO9, PO10, PO11, PSO1",
      },
    },
    {
      date: "05/03/2024",
      name: "Seminar on Career Opportunity in Data Science with Table and Power BI",
      coordinator: "Mrs. M. Priya",
      image: collegeImage,
      details: {
        resourcePerson:
          "Mr. Ahamed Khalid, Head - Academic Alliances, Imarticus Learning, IIM, Bangalore",
        beneficiaries: "II- and III-YEAR students",
        relevantPO_PSO: "PSO1, PSO2, PO3, PO6, PO9, PO10, PO11, PSO1",
      },
    },

    {
      date: "05/03/2024",
      name: "Seminar on Career Opportunity in Data Science with Table and Power BI",
      coordinator: "Mrs. M. Priya",
      image: collegeImage,
      details: {
        resourcePerson:
          "Mr. Ahamed Khalid, Head - Academic Alliances, Imarticus Learning, IIM, Bangalore",
        beneficiaries: "II- and III-YEAR students",
        relevantPO_PSO: "PSO1, PSO2, PO3, PO6, PO9, PO10, PO11, PSO1",
      },
    },
    {
      date: "05/03/2024",
      name: "Seminar on Career Opportunity in Data Science with Table and Power BI",
      coordinator: "Mrs. M. Priya",
      image: collegeImage,
      details: {
        resourcePerson:
          "Mr. Ahamed Khalid, Head - Academic Alliances, Imarticus Learning, IIM, Bangalore",
        beneficiaries: "II- and III-YEAR students",
        relevantPO_PSO: "PSO1, PSO2, PO3, PO6, PO9, PO10, PO11, PSO1",
      },
    },
    {
      date: "05/03/2024",
      name: "Seminar on Career Opportunity in Data Science with Table and Power BI",
      coordinator: "Mrs. M. Priya",
      image: collegeImage,
      details: {
        resourcePerson:
          "Mr. Ahamed Khalid, Head - Academic Alliances, Imarticus Learning, IIM, Bangalore",
        beneficiaries: "II- and III-YEAR students",
        relevantPO_PSO: "PSO1, PSO2, PO3, PO6, PO9, PO10, PO11, PSO1",
      },
    },
    {
      date: "05/03/2024",
      name: "Seminar on Career Opportunity in Data Science with Table and Power BI",
      coordinator: "Mrs. M. Priya",
      image: collegeImage,
      details: {
        resourcePerson:
          "Mr. Ahamed Khalid, Head - Academic Alliances, Imarticus Learning, IIM, Bangalore",
        beneficiaries: "II- and III-YEAR students",
        relevantPO_PSO: "PSO1, PSO2, PO3, PO6, PO9, PO10, PO11, PSO1",
      },
    },

    {
      date: "05/03/2024",
      name: "Seminar on Career Opportunity in Data Science with Table and Power BI",
      coordinator: "Mrs. M. Priya",
      image: collegeImage,
      details: {
        resourcePerson:
          "Mr. Ahamed Khalid, Head - Academic Alliances, Imarticus Learning, IIM, Bangalore",
        beneficiaries: "II- and III-YEAR students",
        relevantPO_PSO: "PSO1, PSO2, PO3, PO6, PO9, PO10, PO11, PSO1",
      },
    },
  ];

  const handleViewMore = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="activities-container">
      {events.map((event, index) => (
        <AnimatedCard
          key={index}
          event={event}
          handleViewMore={handleViewMore}
        />
      ))}

      {isModalOpen && (
        <div className={`modal ${isModalOpen ? "open" : ""}`}>
          <div className="modal-content">
            <span className="close-btn" onClick={closeModal}>
              &times;
            </span>
            <img
              src={selectedEvent.image}
              alt="Event"
              className="modal-image"
            />
            <h2>{selectedEvent.name}</h2>
            <p>
              <strong>Date: </strong>
              {selectedEvent.date}
            </p>
            <p>
              <strong>Coordinator: </strong>
              {selectedEvent.coordinator}
            </p>
            <p>
              <strong>Resource Person: </strong>
              {selectedEvent.details.resourcePerson}
            </p>
            <p>
              <strong>Beneficiaries: </strong>
              {selectedEvent.details.beneficiaries}
            </p>
            <p>
              <strong>Relevant PO, PSO: </strong>
              {selectedEvent.details.relevantPO_PSO}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const AnimatedCard = ({ event, handleViewMore }) => {
  const controls = useAnimation();
  const { ref, inView } = useInView({
    threshold: 0.2, // Trigger animation when 20% of the card is in view
    triggerOnce: true, // Trigger only once
  });

  React.useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      ref={ref}
      className="card_act"
      variants={cardVariants}
      initial="hidden"
      animate={controls}
    >
      <img src={event.image} alt="Event" className="card-image" />
      <div className="card-details">
        <p className="card-date">{event.date}</p>
        <h3 className="card-title">{event.name}</h3>
        <p className="card-coordinator">Coordinator: {event.coordinator}</p>
        <button onClick={() => handleViewMore(event)} className="view-more-btn">
          View More
        </button>
      </div>
    </motion.div>
  );
};

export default Activities;
