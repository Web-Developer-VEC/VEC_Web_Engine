import React, { useState } from "react";
import "./mou.css";
import NET from "../../Assets/NET.jpg";
import ArjunVision from "../../Assets/ARJUN_VISION.png";
import Tata from "../../Assets/TATA_ELXSI.png";
import DigiALERT from "../../Assets/MOVATE.png";
import Aristo from "../../Assets/ARISTO.png";
import Cognizant from "../../Assets/COGNIZANT.png";
import Sify from "../../Assets/SIFY.png";
import Hexaware from "../../Assets/HWXAWARE.png";
import Movate from "../../Assets/MOVATE.png";

const MOU = () => {
  const [selectedYear, setSelectedYear] = useState("OVERALL");

    const yearDetails = {
      "OVERALL": [
        { 
          organization: "NET stack Technology Solutions", 
          duration: "22-12-2022", 
          validity: "Till date",
          logo:NET, 
        },
        { 
          organization: "ArjunVision Tech Solutions", 
          duration: "22-02-2023", 
          validity: "Till date",
          logo: ArjunVision, // Path to the logo for Organization B
        },
        { 
          organization: "M/S Tata Elxsi Ltd", 
          duration: "23-02-2022", 
          validity: "Till date",
          logo:Tata
        },
        { 
          organization: "DigiALERT Solutions Private Limited", 
          duration: "2023", 
          validity: "5 Years",
          logo:DigiALERT, // Path to the logo for Organization B
        },
        { 
          organization: "Aristo Creative Technologies", 
          duration: "2022", 
          validity: "Till date",
          logo: Aristo, // Path to the logo for Organization B
        },
        { 
          organization: "Cognizant Technology Solutions India Private Limited", 
          duration: "15-02-2024", 
          validity: "Till date",
          logo:Cognizant, // Path to the logo for Organization B
        },
        { 
          organization: "Sify Technologies", 
          duration: "09-08-2024", 
          validity: "5 Years",
          logo:Sify, // Path to the logo for Organization B
        },
        { 
          organization: "Hexaware Technologies", 
          duration: "12-08-2024", 
          validity: "3 Years",
          logo:Hexaware, // Path to the logo for Organization B
        },
        { 
          organization: "Movate Technologies Private Ltd", 
          duration: "04-11-2024", 
          validity: " 3 Years",
          logo:Movate, // Path to the logo for Organization B
        },
      ],
      "2022-2023": [
        { 
          organization: "NET stack Technology Solutions", 
          duration: "22-12-2022", 
          validity: "Till date",
          logo:NET, 
        },
        { 
          organization: "ArjunVision Tech Solutions", 
          duration: "22-02-2023", 
          validity: "Till date",
          logo: ArjunVision, // Path to the logo for Organization B
        },
        { 
          organization: "M/S Tata Elxsi Ltd", 
          duration: "23-02-2022", 
          validity: "Till date",
          logo:Tata, // Path to the logo for Organization C
        },
        { 
          organization: "DigiALERT Solutions Private Limited", 
          duration: "2023", 
          validity: "5 Years",
          logo: Aristo, // Path to the logo for Organization C
        },
        { 
          organization: "Aristo Creative Technologies", 
          duration: "2022", 
          validity: "Till date",
          logo:Aristo, // Path to the logo for Organization C
        },
      
      
      ],
      "2023-2024": [
        { 
          organization: "Cognizant Technology Solutions India Private Limited", 
          duration: "15-02-2024", 
          validity: "Till date",
          logo:Cognizant, // Path to the logo for Organization E
        },
        { 
          organization: "Sify Technologies", 
          duration: "09-08-2024", 
          validity: "5 Years",
          logo:Sify, // Path to the logo for Organization B
        },
        { 
          organization: "Hexaware Technologies", 
          duration: "12-08-2024", 
          validity: "3 Years",
          logo:Hexaware, // Path to the logo for Organization E
        },
        { 
          organization: "Movate Technologies Private Ltd", 
          duration: "04-11-2024", 
          validity: "3 Years",
          logo:Movate, // Path to the logo for Organization E
        },
      ],
      "2024-2025": [
        { 
          organization: "Sify Technologies", 
          duration: "09-08-2024", 
          validity: "5 Years",
          logo:Sify, // Path to the logo for Organization B
        },
        { 
          organization: "Hexaware Technologies", 
          duration: "12-08-2024", 
          validity: "3 Years",
          logo:Hexaware, // Path to the logo for Organization E
        },
        { 
          organization: "Movate Technologies Private Ltd", 
          duration: "04-11-2024", 
          validity: " 3 Years",
          logo:Movate, // Path to the logo for Organization E
        },
      ],
      
    };

    return (
      <div className="mou-page">
        <div className="mou-header">
          <h1>Memorandum of Understanding (MOU)</h1>
          <div className="mou-year-buttons">
            {Object.keys(yearDetails).map((year) => (
              <button
                key={year}
                className={`mou-year-button ${selectedYear === year ? "active" : ""}`}
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
        <div className="mou-details">
          {yearDetails[selectedYear].map((detail, index) => (
            <div key={index} className="mou-detail-box">
              <div className="mou-logo">
                <img src={detail.logo} alt={detail.organization} className="mou-logo-image" />
              </div>
              <h3>{detail.organization}</h3>
              <p><strong>Duration:</strong> {detail.duration}</p>
              <p><strong>Validity:</strong> {detail.validity}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default MOU;