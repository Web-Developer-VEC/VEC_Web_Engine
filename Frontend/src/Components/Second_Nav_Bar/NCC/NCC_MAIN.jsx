import React, { useState } from "react";
import { motion } from "framer-motion";
import "./NCC_MAIN.css"; 
import Banner from "../../Banner";
import NCC_ARMY from "./NCC_ARMY"; // Import NCC Army component
import NCC_NAVY from "./NCC_NAVY"; // Import NCC Navy component

const NCCMAIN = () => {
  const [activePage, setActivePage] = useState("buttons");

  return (
    <div>
      <Banner
        backgroundImage="https://kpriet.ac.in/asset/frontend/images/community-services/ncc/header.jpg"
        headerText="National Cadet Corps (NCC)"
        subHeaderText="Fostering excellence in sports, fitness, and holistic development for students."
      />

      <div className="NCC-container">
        {/* Buttons */}
        {activePage === "buttons" && (
          <motion.div
            className="NCC-buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button className="NCC-button" onClick={() => setActivePage("army")}>
              <img src="https://alljobsforyou.com/wp-content/uploads/2020/04/Indian-Army-LOGO-New2.gif" alt="NCC Army" className="NCC-logo" />
              NCC ARMY
            </button>
            <button className="NCC-button" onClick={() => setActivePage("navy")}>
              <img src="navy-logo.png" alt="NCC Navy" className="NCC-logo" />
              NCC NAVY
            </button>
          </motion.div>
        )}

        {/* NCC Army Page (Left to Right Transition) */}
        {activePage === "army" && (
          <motion.div
            className="NCC-page"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="NCC-page-heading">NCC Army</h2>
            <button className="NCC-back-btn-right" onClick={() => setActivePage("buttons")}>
              Back ➡
            </button>
            <NCC_ARMY />
          </motion.div>
        )}

        {/* NCC Navy Page (Right to Left Transition) */}
        {activePage === "navy" && (
          <motion.div
            className="NCC-page"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="NCC-page-heading">NCC Navy</h2>
            <button className="NCC-back-btn" onClick={() => setActivePage("buttons")}>
              ⬅ Back
            </button>
            <NCC_NAVY />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NCCMAIN;
