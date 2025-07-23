import React, { useEffect, useState } from "react";
import "./naac.css";
import axios from "axios";
import Banner from "../../Banner";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { motion } from "framer-motion";
import LoadComp from "../../LoadComp";


const Naac = ({ toggle, theme }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [openSection, setOpenSection] = useState(null);
  const [naacData, setNaacData] = useState(null);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const toggleSection = (index) => {
    setOpenSection(openSection === index ? null : index);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/naac`);
        setNaacData(response.data[0].sections)
        
      } catch (error) {
        console.error("Error fetching data:", error.message);
    
      }
    };
    fetchData();
  }, []);
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

    if (!isOnline) {
        return (
          <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
            <LoadComp txt={"You are offline"} />
          </div>
        );
    }

  return (
    <>
    
    {!naacData ? (

      <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
        </div>
    ):(

      <div>
    
      <div className="nnaac-page">
       
        <div className="nabout-section">
          <div className="naac-info-panel border-l-4 border-secd dark:border-drks rounded-lg dark:bg-drkb">
            <h2 className="text-brwn dark:text-drkt">ABOUT NAAC</h2>
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
      <div className="max-w-4xl mx-auto space-y-6 mb-6 px-4 font-poppi">
        {naacData?.map((section, index) => (
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
                      <a
                        href={`${UrlParser(item.pdfs_path)}#toolbar=0`}
                        className="dark:text-drka hover:underline"
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
     </div>
  )}
    </>
  );
};

export default Naac;
