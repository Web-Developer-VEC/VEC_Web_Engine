import React, { useEffect, useState } from "react";
import "./naac.css";
import axios from "axios";
import Banner from "../Banner";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { motion } from "framer-motion";

const Naac = ({ toggle, theme }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [openSection, setOpenSection] = useState(null);
  const [naacData, setNaacData] = useState(null);

  const toggleSection = (index) => {
    setOpenSection(openSection === index ? null : index);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/naac`);
        setNaacData(response.data[0].sections)
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
        headerText="NAAC"
        subHeaderText="NATIONAL ASSESSMENT AND ACCREDITATION COUNCIL (NAAC)"
      />

      <div className="nnaac-page">
        {isLoading && (
          <div className="loading-screen">
            <div className="spinner"></div>
            Loading...
          </div>
        )}

        <div className="nabout-section">
          <div className="naac-info-panel">
            <h2>About NAAC</h2>
            <p>
              The NAAC conducts assessment and accreditation of Higher
              Educational Institutions (HEI) such as colleges, universities, or
              other recognised institutions to derive an understanding of the
              ‘Quality Status’ of the institution...
            </p>
          </div>
        </div>
      </div>

      {/* Dropdown Sections */}
      <div className="max-w-4xl mx-auto space-y-6 mb-6 px-4">
        {naacData?.map((section, index) => (
          <div
            key={index}
            className="dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] rounded-2xl shadow-lg"
          >
            <button
              onClick={() => toggleSection(index)}
              className={`w-full flex justify-between items-center px-6 py-4 text-xl font-semibold
            transition-all rounded-2xl text-white dark:text-drkp mb-4
            ${
              openSection === index
                ? "bg-[#2E8B57]" // Active: Sea Green
                : "bg-accn dark:bg-drks"
            }`}
            >
              {section.title}
              {openSection === index ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {openSection === index && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 py-4"
              >
                <ul className="list-disc pl-5 space-y-2">
                  {section.content.map((item, i) => (
                    <li key={i}>
                      <a
                        href={item.link}
                        className="text-blue-500 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default Naac;
