import React, { useState } from "react";
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
import "./RD.css"; // Use your existing CSS

const Research= () => {
  const [selectedYear, setSelectedYear] = useState("2022-2023");

  // Action to Icon Mapping
  const actionIcons = {
    "FUNDED PROPOSALS": faFileAlt,
    "JOURNAL PUBLICATIONS": faBook,
    "PATENT DETAILS": faClipboard,
    "BOOK/BOOK CHAPTERS": faBook,
    "INTERNATIONAL / NATIONAL CONFERENCES": faChartBar,
    "CONSULTANCY": faCogs,
    "INTERNSHIP": faIndustry,
    "PRODUCT DEVELOPMENT": faLightbulb,
    "START-UP / TECHNOLOGY TRANSFER": faCodeBranch,
  };

  // Yearly data with dynamic actions
  const yearDetails = {
    "2022-2023": {
      actions: {
        "FUNDED PROPOSALS": "/funded-proposals",
        "JOURNAL PUBLICATIONS": "/journal-publications",
        "PATENT DETAILS": "/patent-details",
        "BOOK/BOOK CHAPTERS": "/books",
        "INTERNATIONAL / NATIONAL CONFERENCES": "/conferences",
        "CONSULTANCY": "/consultancy",
        "INTERNSHIP": "/internship",
        "PRODUCT DEVELOPMENT": "/product-development",
      },
    },
    "2023-2024": {
      actions: {
        "FUNDED PROPOSALS": "/funded-proposals-2023",
        "JOURNAL PUBLICATIONS": "/journal-publications-2023",
        "PATENT DETAILS": "/patent-details-2023",
        "BOOK/BOOK CHAPTERS": "/books-2023",
        "INTERNATIONAL / NATIONAL CONFERENCES": "/conferences-2023",
        "CONSULTANCY": "/consultancy-2023",
        "INTERNSHIP": "/internship-2023",
        "PRODUCT DEVELOPMENT": "/product-development-2023",
        "START-UP / TECHNOLOGY TRANSFER": "/startups",
      },
    },
    "2024-2025": {
      actions: {
        "FUNDED PROPOSALS": "/funded-proposals-2024",
        "JOURNAL PUBLICATIONS": "/journal-publications-2024",
        "PATENT DETAILS": "/patent-details-2024",
        "BOOK/BOOK CHAPTERS": "/books-2024",
        "INTERNATIONAL / NATIONAL CONFERENCES": "/conferences-2024",
        "CONSULTANCY": "/consultancy-2024",
        "INTERNSHIP": "/internship-2024",
        "PRODUCT DEVELOPMENT": "/product-development-2024",
        "START-UP / TECHNOLOGY TRANSFER": "",
      },
    },
  };

  const handleYearClick = (year) => {
    setSelectedYear(year); // Set the selected year
  };

  const handleActionClick = (link) => {
    window.location.href = link; // Redirect to the specified URL
  };

  return (
    <div className="Rd-page">
      {/* Intro Section */}
      <div className="RD-intro">
        <h1 className="RD-header">RESEARCH DATA</h1>
      </div>

      {/* Year Buttons */}
      <div className="RD-years-horizontal">
        {Object.keys(yearDetails)
          .sort((a, b) => b - a) // Sort years in descending order
          .map((year) => (
            <button
              key={year}
              className={`RD-year-button ${selectedYear === year ? "active" : ""}`}
              onClick={() => handleYearClick(year)} // Set selected year when clicked
            >
              {year}
            </button>
          ))}
      </div>

      {/* Actions Section */}
      <div className="RD-content">
        <div className="RD-details">
          <div className="RD-year-actions">
            {Object.entries(yearDetails[selectedYear]?.actions).map(([action, link]) => (
              <div
                key={action}
                className="RD-action-button"
                onClick={() => handleActionClick(link)} // Redirect on click
              >
                <FontAwesomeIcon icon={actionIcons[action]} style={{ marginRight: "10px" }} />
                {action}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Research;
