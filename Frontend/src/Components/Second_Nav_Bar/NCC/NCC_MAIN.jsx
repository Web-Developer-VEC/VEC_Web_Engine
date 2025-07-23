import React, { useState } from "react";
import { motion } from "framer-motion";
import "./NCC_MAIN.css"; // Import the separate CSS file
import Banner from "../../Banner";
import NCC_ARMY from "./NCC_ARMY";
import NCC_NAVY from "./NCC_NAVY";
import Army from "../../Assets/NccArmy.png";
import LoadComp from "../../LoadComp"
import { useEffect } from "react";
import { ArrowBigLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NCCMAIN = ({ toggle, theme }) => {
  const [activePage, setActivePage] = useState("buttons");
  const navigate = useNavigate();

        const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);
  if (!isOnline) {
        return (
          <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
            <LoadComp txt={"You are offline"} />
          </div>
        );
    }

  return (
    <div>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/NCC.webp"
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
                onClick={() => navigate('/nccarmy')}
              >
                VEC NCC ARMY <br />
                [TN] SIG COY NCC
              </button>

              <button
                className="NCC-main-button"
                onClick={() => navigate('/nccnavy')}
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
            <NCC_NAVY />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NCCMAIN;
