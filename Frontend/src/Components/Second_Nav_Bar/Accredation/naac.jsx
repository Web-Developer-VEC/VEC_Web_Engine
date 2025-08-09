import React, { useEffect, useState } from "react";
import "./naac.css";
import axios from "axios";
import Banner from "../../Banner";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { motion } from "framer-motion";
import LoadComp from "../../LoadComp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const Naac = ({ data }) => {
  const [openSection, setOpenSection] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const toggleSection = (index) => {
    setOpenSection(openSection === index ? null : index);
  };

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
  }, []);

  const handlePdfClick = (pdf) => {
    if (window.innerWidth >= 1024) {
      setSelectedPdf({
        url: `${UrlParser(pdf.pdfs_path)}#toolbar=0`,
        name: pdf.name,
      });
    } else {
      window.open(`${UrlParser(pdf.pdfs_path)}#toolbar=0`, "_blank");
    }
  };

  const closeModal = () => {
    setSelectedPdf(null);
  };

  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
  }

  return (
    <>
      {!data ? (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp />
        </div>
      ) : (
        <div>
          <div className="nnaac-page">
            <div className="nabout-section">
              <div className="naac-info-panel border-l-4 border-secd dark:border-drks rounded-lg dark:bg-drkb">
                <h2 className="text-brwn dark:text-drkt">ABOUT NAAC</h2>
                <p>
                  The NAAC conducts assessment and accreditation of Higher
                  Educational Institutions (HEI) such as colleges, universities
                  or other recognised institutions to derive an understanding of
                  the ‘Quality Status’ of the institution...
                </p>
              </div>
            </div>
          </div>

          {/* Dropdown Sections */}
          <div className="max-w-4xl mx-auto space-y-6 mb-6 px-4 font-poppi">
            {data?.map((section, index) => (
              <div
                key={index}
                className="dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] rounded-2xl shadow-lg"
              >
                <button
                  onClick={() => toggleSection(index)}
                  className={`w-full flex justify-between items-center px-6 py-4 text-xl font-semibold
                transition-all rounded-2xl mb-4
                ${
                  openSection === index
                    ? "bg-secd text-text dark:bg-brwn "
                    : "bg-accn dark:bg-drks text-white "
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
                          <button
                            onClick={() => handlePdfClick(item)}
                            className="text-blue-600 dark:text-drka hover:underline cursor-pointer bg-transparent border-none p-0 font-inherit"
                          >
                            {item.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {/* PDF Modal */}
          {selectedPdf && (
            <div className="pdf-modal">
              <div className="pdf-modal-content">
                <button className="pdf-close-button" onClick={closeModal}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
                <h2>{selectedPdf.name}</h2>
                <iframe
                  src={selectedPdf.url}
                  title={selectedPdf.name}
                  className="pdf-iframe"
                ></iframe>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Naac;
