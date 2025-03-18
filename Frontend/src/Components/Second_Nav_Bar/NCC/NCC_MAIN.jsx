import React, { useState } from "react";
import { motion } from "framer-motion";
import "./NCC_MAIN.css"; 
import Banner from "../../Banner";
import NCC_ARMY from "./NCC_ARMY"; // Import NCC Army component
import NCC_NAVY from "./NCC_NAVY";
import Army from "../../Assets/NccArmy.png"// Import NCC Navy component
import Navy from "../../Assets/NccNavy.png"

const NCCMAIN = ({toggle, theme}) => {
  const [activePage, setActivePage] = useState("buttons");

  return (
    <div>
      <Banner toggle={toggle} theme={theme}
        backgroundImage="https://kpriet.ac.in/asset/frontend/images/community-services/ncc/header.jpg"
        headerText="National Cadet Corps (NCC)"
        subHeaderText="Fostering excellence in sports, fitness, and holistic development for students."
      />

      <div className="NCC-container">
        {/* Buttons */}
        {activePage === "buttons" && (
          <motion.div
            className="NCC-buttons min-h-[40vh] transition-transform duration-300 ease-in-out"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button className="text-xl font-bold text-accn dark:text-drka hover:scale-125
                 transition-transform duration-300 ease-in-out"
                    onClick={() => setActivePage("army")}>
              <img src={Army} alt="NCC Army" className="h-[20vh] w-auto" />
              NCC ARMY
            </button>
              <button className="text-xl font-bold text-accn dark:text-drka hover:scale-125
                 transition-transform duration-300 ease-in-out"
                      onClick={() => setActivePage("navy")}>
                  <img src={Navy} alt="NCC Navy" className="h-[20vh] w-auto"/>
                  NCC NAVY
              </button>
          </motion.div>
        )}

          {/* NCC Army Page (Left to Right Transition) */}
          {activePage === "army" && (
              <motion.div
                  className="NCC-page -mt-2"
                  initial={{x: "-100%"}}
                  animate={{x: 0}}
                  exit={{x: "100%"}}
                  transition={{duration: 0.5 }}
          >
            {/*<h2 className="NCC-page-heading">NCC Army</h2>*/}
            <button className="NCC-back-btn-right top-2 right-2 bg-secd dark:bg-drks hover:bg-accn dark:hover:bg-drka hover:text-prim"
                        onClick={() => setActivePage("buttons")}>
              Back ➡
            </button>
            <NCC_ARMY />
          </motion.div>
        )}

        {/* NCC Navy Page (Right to Left Transition) */}
        {activePage === "navy" && (
          <motion.div
            className="NCC-page -mt-2"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.5 }}
          >
            {/*<h2 className="NCC-page-heading">NCC Navy</h2>*/}
            <button className="NCC-back-btn left-2 top-2 bg-secd dark:bg-drks hover:bg-accn dark:hover:bg-drka hover:text-prim"
                    onClick={() => setActivePage("buttons")}>
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
