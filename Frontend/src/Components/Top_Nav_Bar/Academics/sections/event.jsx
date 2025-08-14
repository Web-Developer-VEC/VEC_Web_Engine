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
import "./event.css";
import LoadComp from "../../../LoadComp";

const EventOrg = ({ data }) => {
  const [yearData, setYearData] = useState([]);
  const department_eventorg = data?.find((item) => item.category === "department_event")?.content || [];

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const [selectedYear, setSelectedYear] = useState(department_eventorg?.[0]?.year);

  useEffect(() => {
    if (data && selectedYear) {
      const filteredData = department_eventorg?.find(item => item.year === selectedYear);
      setYearData(filteredData);
    }
  }, [selectedYear]);

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
      <div className="deptevent-intro flex justify-center">
        <h1 className="deptevent-header text-brwn dark:text-drkt">Department Activities</h1>
      </div>

      {/* Year Buttons */}
      <div className="deptevent-years-horizontal">
        {department_eventorg?.map((res,i) => (
          <button
            key={i}
            className={`deptevent-year-button ${selectedYear === res?.year
              ? "active bg-accn text-prim dark:bg-brwn"
              : "bg-secd text-text dark:bg-drks"
              }`}
            onClick={() => handleYearClick(res?.year)}
          >
            {res?.year}
          </button>
        ))}
      </div>

      <div className="deptevent-content">
        <div className="deptevent-details">
          <div className="deptevent-year-actions">
            {Array.isArray(yearData?.research) && yearData?.research?.map((item, index) => (
              <div
                key={index}
                className="deptevent-action-button"
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

export default EventOrg;