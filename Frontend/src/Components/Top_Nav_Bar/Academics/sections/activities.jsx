import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import "./Activities.css";
import LoadComp from "../../../LoadComp";
import { X } from "lucide-react";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const UrlParser = (path) => {
  if (Array.isArray(path)) path = path[0];
  return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
};

const Activities = ({ data }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");

  const departmentActivities = data?.find(
    (item) => item.category === "department_activities"
  )?.content || [];

  const years = departmentActivities.map((item) => item.year);

  useEffect(() => {
    if (years.length > 0) {
      setSelectedYear(years[0]);
    }
  }, []);

  const selectedYearData = departmentActivities.find(
    (item) => item.year === selectedYear
  );
  const activitiesArray = selectedYearData?.activities || [];

  const handleViewMore = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  if (!departmentActivities.length) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp txt="" />
      </div>
    );
  }

  return (
    <>
      {/* 🔹 Year Filter Buttons */}
      <div className="year-filter flex justify-center gap-3 my-4">
        {years?.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`px-4 py-2 rounded ${
              selectedYear === year
                ? "bg-accn text-prim"
                : "bg-secd text-text dark:bg-drks"
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {/* 🔹 Activities Display */}
      <div className="activities-container">
        {activitiesArray.length > 0 ? (
          activitiesArray.map((event, index) => (
            <AnimatedCard
              key={index}
              event={event}
              handleViewMore={handleViewMore}
            />
          ))
        ) : (
          <p>No events available for {selectedYear}.</p>
        )}
      </div>

      {/* 🔹 Modal */}
      {isModalOpen && (
        <div className={`modal ${isModalOpen ? "open" : ""}`}>
          <div className="bg-prim dark:bg-drkp modal-content-act">
            <span
              className="close-btn text-text bg-secd dark:bg-drks dark:text-drkt
              hover:bg-accn hover:text-prim dark:hover:bg-brwn"
              onClick={closeModal}
            >
              <X />
            </span>
            <img
              src={UrlParser(selectedEvent?.image_path) || "./placeholder.webp"}
              alt="Event"
              className="modal-image"
            />
            {selectedEvent?.name_of_event && (
              <h2 className="text-[18px]">{selectedEvent?.name_of_event}</h2>
            )}
            {selectedEvent?.date && (
              <p><strong>Date:</strong> {selectedEvent?.date}</p>
            )}
            {selectedEvent?.coordinator && (
              <p><strong>Coordinator:</strong> {selectedEvent?.coordinator}</p>
            )}
            {selectedEvent?.resource_person && (
              <p><strong>Resource Person:</strong> {selectedEvent?.resource_person}</p>
            )}
            {selectedEvent?.beneficiaries && (
              <p><strong>Beneficiaries:</strong> {selectedEvent?.beneficiaries}</p>
            )}
            {selectedEvent?.relevant_PO_PSO && (
              <p><strong>Relevant PO, PSO:</strong> {selectedEvent?.relevant_PO_PSO}</p>
            )}
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
    if (inView) controls.start("visible");
  }, [controls, inView]);

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      ref={ref}
      className="card_act bg-prim
      bg-[color-mix(in_srgb,theme(colors.prim)_80%,black)]
      dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]"
      variants={cardVariants}
      initial="hidden"
      animate={controls}
    >
      <img
        src={UrlParser(event.image_path) || "./placeholder.webp"}
        alt="Event"
        className="card-image"
      />
      <div className="card-details">
        <p className="card-date">{event.date}</p>
        <h3 className="my-2 text-xl text-accn dark:text-drka">
          {event.name_of_event}
        </h3>
        {event?.coordinator && (
          <p className="card-coordinator">Coordinator: {event.coordinator}</p>
        )}
        <button
          onClick={() => handleViewMore(event)}
          className="activities-view-more-btn mt-3
          bg-secd text-text dark:text-text dark:bg-drks
          hover:bg-accn hover:text-prim dark:hover:bg-brwn"
        >
          View More
        </button>
      </div>
    </motion.div>
  );
};

export default Activities;
