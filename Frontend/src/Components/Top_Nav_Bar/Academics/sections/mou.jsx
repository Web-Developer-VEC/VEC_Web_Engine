import React, { useState  } from "react";
import "./mou.css";

const MOU = ({data}) => {
  const [selectedYear, setSelectedYear] = useState("overall");

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const Data = data.MOUs

  // Find the selected year's data
  const selectedYearData = Data?.find((item) => item.unique_id === selectedYear)?.docs || [];

    return (
      <div className="mou-page">
        <div className="mou-header">
          <h1 className="text-accn dark:text-drka">Memorandum of Understanding (MOU)</h1>
          <div className="mou-year-buttons">
            {Data?.map((year) => (
              <button
                key={year.unique_id}
                className={`mou-year-button ${selectedYear === year.unique_id ? "active bg-accn text-prim dark:bg-drka" 
                    : "bg-secd dark:bg-drks"}`}
                onClick={() => setSelectedYear(year.unique_id)}
              >
                {year.unique_id}
              </button>
            ))}
          </div>
        </div>
        <div className="mou-details">
          {selectedYearData.map((detail, index) => (
            <div key={index} className="mou-detail-box border-2 border-secd dark:border-drks
                bg-prim dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]">
              <div className="mou-logo bg-prim dark:bg-drkp">
                <img src={UrlParser(detail.LOGO_PATH)} alt={detail.ORGANISATION_NAME} className="mou-logo-image" />
              </div>
              <h3 className="text-accn dark:text-drka">{detail.ORGANISATION_NAME}</h3>
              <p><strong>Duration:</strong> {detail.MONTH_AND_YEAR}</p>
              <p><strong>Validity:</strong> {detail.VALIDITY}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default MOU;