import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt,
  faBook,
  faClipboard,
  faLightbulb,
  faIndustry,
  faChartBar,
  faCogs,
  faCodeBranch,
} from "@fortawesome/free-solid-svg-icons";
import "./RD.css";
import LoadComp from "../../../LoadComp";

const Research = ({ data }) => {
  const [yearData, setYearData] = useState([]);
  
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };
  
  const years = Object.keys(data || {}).filter(
    (key) => key !== "_id" && key !== "dept_id" && key !== "department_name"
  );
  const [selectedYear, setSelectedYear] = useState(years?.[0]);

  useEffect(() => {
    if (data && selectedYear && data[selectedYear]) {
      setYearData(data[selectedYear]);
    }
  }, [selectedYear, data]);

  const actionIcons = {
    "Book": faBook,
    "Funded Proposal": faFileAlt,
    "Journal Publications": faBook,
    "Patent": faClipboard,
    "International and National Conferences": faChartBar,
    "Consultancy": faCogs,
    "Internship": faIndustry,
    "Product Development": faLightbulb,
    "Startup and Technology Transfer": faCodeBranch,
  };

  const handleYearClick = (year) => {
    setSelectedYear(year);
  };

  const handlePdfOpen = (pdfPath) => {
    if (pdfPath) window.open(UrlParser(pdfPath), "_blank");
  };

  return data ? (
    <div className="Rd-page">
      <div className="RD-intro">
        <h1 className="RD-header text-brwn dark:text-drkt">RESEARCH DATA</h1>
      </div>

      {/* Year Buttons */}
      <div className="RD-years-horizontal">
        {years?.map((year) => (
          <button
            key={year}
            className={`RD-year-button ${selectedYear === year
              ? "active bg-accn text-prim dark:bg-brwn"
              : "bg-secd text-text dark:bg-drks"
              }`}
            onClick={() => handleYearClick(year)}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="RD-content">
        <div className="RD-details">
          <div className="RD-year-actions">
            {Array.isArray(yearData) && yearData?.map((item, index) => (
              <div
                key={index}
                className="RD-action-button"
                onClick={() => handlePdfOpen(item?.pdf_path)}
              >
                <FontAwesomeIcon
                  icon={actionIcons[item?.name] || faFileAlt}
                  style={{ marginRight: "10px" }}
                />
                {item?.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
      <LoadComp />
    </div>
  );
};

export default Research;