import React, { useState  } from "react";
import "./mou.css";

const MOU = ({data}) => {
  const [selectedYear, setSelectedYear] = useState("overall");
  const Data = data.MOUs

  // Find the selected year's data
  const selectedYearData = Data?.find((item) => item.unique_id === selectedYear)?.docs || [];

    return (
      <div className="mou-page">
        <div className="mou-header">
          <h1>Memorandum of Understanding (MOU)</h1>
          <div className="mou-year-buttons">
            {Data?.map((year) => (
              <button
                key={year.unique_id}
                className={`mou-year-button ${selectedYear === year.unique_id ? "active" : ""}`}
                onClick={() => setSelectedYear(year.unique_id)}
              >
                {year.unique_id}
              </button>
            ))}
          </div>
        </div>
        <div className="mou-details">
          {selectedYearData.map((detail, index) => (
            <div key={index} className="mou-detail-box">
              <div className="mou-logo">
                <img src={detail.LOGO_PATH} alt={detail.ORGANISATION_NAME} className="mou-logo-image" />
              </div>
              <h3>{detail.ORGANISATION_NAME}</h3>
              <p><strong>Duration:</strong> {detail.MONTH_AND_YEAR}</p>
              <p><strong>Validity:</strong> {detail.VALIDITY}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default MOU;