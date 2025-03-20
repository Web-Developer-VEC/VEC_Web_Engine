import React, { useState } from "react";
import { motion } from "framer-motion";
import "./NCC_MAIN.css"; // Import the separate CSS file
import Banner from "../../Banner";
import NCC_ARMY from "./NCC_ARMY";
import NCC_NAVY from "./NCC_NAVY";
import Army from "../../Assets/NccArmy.png";

const NCCMAIN = ({ toggle, theme }) => {
  const [activePage, setActivePage] = useState("buttons");

  return (
    <div>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="https://kpriet.ac.in/asset/frontend/images/community-services/ncc/header.jpg"
        headerText="National Cadet Corps (NCC)"
        subHeaderText="Fostering excellence in sports, fitness, and holistic development for students."
      />

      <div className="NCC-main-container">
        {/* Buttons Page */}
        {activePage === "buttons" && (
          <motion.div
            className="NCC-main-buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Centered NCC Army Logo */}
            <img src={Army} alt="NCC Army" className="NCC-main-logo" />

            {/* Vertical Line Below Logo */}
            <div className="NCC-main-vertical-line"></div>

            {/* Horizontal & Split Vertical Lines */}
            <div className="NCC-main-horizontal-container">
              <div className="NCC-main-horizontal-line"></div>
            </div>

            <div className="NCC-main-split-container">
              <div className="NCC-main-split-line"></div>
              <div className="NCC-main-split-line"></div>
            </div>

            {/* Buttons for NCC Army & Navy */}
            <div className="NCC-main-button-group">
              <button
                className="NCC-main-button"
                onClick={() => setActivePage("army")}
              >
                VEC NCC ARMY <br />
                [TN] SIG COY NCC
              </button>

              <button
                className="NCC-main-button"
                onClick={() => setActivePage("navy")}
              >
                VEC NCC NAVY <br />
                [TN] NAVAL TECH UNIT, NCC
              </button>
            </div>
          </motion.div>
        )}

        {/* NCC Army Page (Left to Right Transition) */}
        {/* NCC Army Page (Left to Right Transition) */}
        {activePage === "army" && (
          <motion.div
            className="NCC-main-page"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5 }}
          >
            <button
              className="fixed z-[500] top-auto bottom-2 right-2 lg:left-auto lg:right-2 bg-slate-500 p-2 rounded-lg hover:bg-secd dark:hover:bg-drks"
              onClick={() => setActivePage("buttons")}
            >
              Back ➡
            </button>
            <NCC_ARMY />
          </motion.div>
        )}

        {/* NCC Navy Page (Right to Left Transition) */}
        {activePage === "navy" && (
          <motion.div
            className="NCC-main-page"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.5 }}
          >
            <button
              className="fixed z-[500] top-auto bottom-2 left-2 bg-slate-500 p-2 rounded-lg hover:bg-secd dark:hover:bg-drks"
              onClick={() => setActivePage("buttons")}
            >
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
