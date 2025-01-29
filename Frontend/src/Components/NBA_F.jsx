import React, { useState } from 'react';
import "./NBA_F.css"; // Import the CSS file for styling
import banner from "./Assets/banner image.jpg";
import Banner from './Banner';

const NBA_F = () => {
  const [selectedYear, setSelectedYear] = useState(null); // Start with no PDF selected

  const yearButtons = {
    "Civil": "/pdfs/Civil_CSE_EEE_ECE_EI.pdf",
    "CSE": "/pdfs/Civil_CSE_EEE_ECE_EI.pdf",
    "EEE": "/pdfs/Civil_CSE_EEE_ECE_EI.pdf",
    "ECE": "/pdfs/Civil_CSE_EEE_ECE_EI.pdf",
    "E&I": "/pdfs/Civil_CSE_EEE_ECE_EI.pdf",
    "IT": "/pdfs/IT_Mech.pdf",
    "Mech": "/pdfs/IT_Mech.pdf",
    
  };

  const handleYearClick = (year) => {
    setSelectedYear(year); // Set the selected year to display the PDF
  };

  return (
    <>
<Banner
  backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
  headerText="National Board of Accreditation"
  subHeaderText="Promoting academic excellence through accreditation, fostering continuous quality improvement, and empowering institutions to deliver world-class education."
/>

    <div className="nba-page">

      <div className="nba-intro">
        <div className="nba-tiles">
          {/* Tile 1: About NBA */}
          <div className="nba-tile">
            <h3 className="nba-tile-header">About NBA</h3>
            <p className="nba-tile-text">
              The National Board of Accreditation (NBA) is an autonomous body established by the All India Council for Technical Education (AICTE) under the Ministry of Education, Government of India. NBA is responsible for evaluating the quality of technical and professional education programs, including engineering, management, pharmacy, architecture, and others.
            </p>
          </div>

          {/* Tile 2: Purpose of NBA */}
          <div className="nba-tile">
            <h3 className="nba-tile-header">Purpose of NBA Accreditation</h3>
            <p className="nba-tile-text">
              The primary goal of NBA accreditation is to assess and ensure that academic programs meet predefined quality standards, thereby promoting continuous improvement in educational institutions. It helps students, employers, and other stakeholders identify programs that deliver high-quality education and are aligned with industry and societal needs.
            </p>
          </div>
        </div>
      </div>



      {/* Buttons Section */}
      <div className="nba-years">
        {Object.keys(yearButtons).map((year) => (
          <button
            key={year}
            className={`nba-year-button ${selectedYear === year ? "active" : ""}`}
            onClick={() => handleYearClick(year)}
          >
            {year}
          </button>
        ))}
      </div>

      {/* PDF Viewer */}
      {selectedYear && (
        <div className="nba-details">
          <div className="nba-pdf-container">
            <h3>{`Viewing: ${selectedYear}`}</h3>
            <embed
              className="embed"
              src={yearButtons[selectedYear]}
              type="application/pdf"
              width="100%"
              height="600px"
            />
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default NBA_F;
