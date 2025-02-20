import React, { useEffect, useState } from "react";
import axios from "axios";
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
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import "./RD.css";
import Conference from "./Conference";

const Research = ({ data }) => {
  const [selectedYear, setSelectedYear] = useState("2022-23");
  const [yearData, setYearData] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedActionData, setSelectedActionData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/001/research/${selectedYear}`);
        setYearData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };
    fetchData();
  }, [selectedYear]);

  // Extracting years
  const years = data?.data?.data?.map((entry) => entry.year);

  // Extract available actions
  const availableActions = yearData
    ? yearData.docs.flatMap((doc) => Object.keys(doc))
    : [];

  // Icons for actions
  const actionIcons = {
    FUNDEDPROPOSALS: faFileAlt,
    JOURNALPUBLICATIONS: faBook,
    PATENTDETAILS: faClipboard,
    BOOKBOOKCHAPTERS: faBook,
    INTERNATIONALNATIONALCONFERENCES: faChartBar,
    CONSULTANCY: faCogs,
    INTERNSHIP: faIndustry,
    PRODUCTDEVELOPMENT: faLightbulb,
    STARTUPTECHNOLOGYTRANSFER: faCodeBranch,
  };

  const handleYearClick = (year) => {
    setSelectedYear(year);
    setSelectedAction(null);
    setSelectedActionData(null);
  };

  const handleActionClick = (actionKey) => {
    setSelectedAction(actionKey);
    const actionData = yearData?.docs
      .map((doc) => doc[actionKey])
      .filter(Boolean)
      .flat(); // Merge all matching entries
    setSelectedActionData(actionData || []);
  };

  const handleBack = () => {
    setSelectedAction(null);
    setSelectedActionData(null);
  };

  return (
    <div className="Rd-page">
      <div className="RD-intro">
        <h1 className="RD-header bg-gradient-to-r
        from-secd to-[color-mix(in_srgb,theme(colors.secd)_50%,black)]
        dark:from-drks dark:to-[color-mix(in_srgb,theme(colors.drks)_50%,black)]">RESEARCH DATA</h1>
      </div>

      {selectedAction ? (
        // Show selected component only
        <div className="RD-action-content">
          <button className="RD-back-button" onClick={handleBack}>
            <FontAwesomeIcon icon={faArrowLeft} /> Back
          </button>
          <Conference data={selectedActionData} action={selectedAction} />
        </div>
      ) : (
        // Show year and action selection
        <>
          <div className="RD-years-horizontal">
            {years?.map((year) => (
              <button
                key={year}
                className={`RD-year-button ${selectedYear === year ? "active bg-accn text-prim dark:bg-drka" 
                    : "bg-secd text-text dark:bg-drks"}`}
                onClick={() => handleYearClick(year)}
              >
                {year}
              </button>
            ))}
          </div>

          <div className="RD-content">
            <div className="RD-details">
              <div className="RD-year-actions">
                {availableActions.map((action) => (
                  <div
                    key={action}
                    className={`RD-action-button ${selectedAction === action ? "active" : ""}`}
                    onClick={() => handleActionClick(action)}
                  >
                    <FontAwesomeIcon icon={actionIcons[action.replace(/[_-]/g,'')]} style={{ marginRight: "10px" }} />
                    {action.replace(/_/g, " ")}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Research;
