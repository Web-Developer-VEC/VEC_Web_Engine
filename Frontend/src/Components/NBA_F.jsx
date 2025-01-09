import React, { useState } from 'react';
import "./NBA_F.css"; // Create a CSS file for styling specific to this component
import banner from "./Assets/banner image.jpg";

const NBA_F = () => {
  const [selectedYear, setSelectedYear] = useState("Civil");

  // Year buttons with associated PDF links
  const yearButtons = {
    "Civil": "/pdfs/Civil_CSE_EEE_ECE_EI.pdf",
    "CSE": "/pdfs/Civil_CSE_EEE_ECE_EI.pdf",
    "EEE": "/pdfs/Civil_CSE_EEE_ECE_EI.pdf",
    "ECE": "/pdfs/Civil_CSE_EEE_ECE_EI.pdf",
    "E&I": "/pdfs/Civil_CSE_EEE_ECE_EI.pdf",
    "IT": "/pdfs/IT_Mech.pdf",
    "Mech": "/pdfs/IT_Mech.pdf",
    // Add more departments as needed
  };

  const handleYearClick = (year) => {
    setSelectedYear(year); // Update the selected year to show the PDF
  };

  return (
    <div className="nba-page">
      <div className="nba-banner">
        <img
          src={banner} // Replace with your banner image path
          alt="NBA Banner"
          className="nba-banner-image"
        />
      </div>

      {/* Introductory Text */}
      <div className="nba-intro">
        <h1 className="nba-header">NATIONAL BOARD OF ACCREDITATION (NBA)</h1>
        <p className="nba-about">
          <h3><center><strong>About NBA</strong></center></h3>
          <br /><br />
          The National Board of Accreditation (NBA) is an autonomous body established by the All India Council for Technical Education (AICTE) under the Ministry of Education, Government of India. NBA is responsible for evaluating the quality of technical and professional education programs, including engineering, management, pharmacy, architecture, and others.
          <br /><br />
          <h3><center><strong>Purpose of NBA Accreditation</strong></center></h3>
          <br /><br />
          The primary goal of NBA accreditation is to assess and ensure that academic programs meet predefined quality standards, thereby promoting continuous improvement in educational institutions. It helps students, employers, and other stakeholders identify programs that deliver high-quality education and are aligned with industry and societal needs.
        </p>
      </div>

      {/* Page Content */}
      <div className="nba-content">
        {/* Left Side - Years */}
        <div className="nba-years">
          {Object.keys(yearButtons)
            .map((year) => (
              <button
                key={year}
                className={`nba-year-button ${selectedYear === year ? "active" : ""}`}
                onClick={() => handleYearClick(year)} // Show PDF directly when clicked
              >
                {year}
              </button>
            ))}
        </div>

        {/* Right Side - Display PDF */}
        <div className="nba-details">
          <div className="nba-pdf-container">
            <h3>{`Viewing: ${selectedYear}`}</h3>
            <embed
              className="embed"
              src={yearButtons[selectedYear]} // Display PDF of the selected year
              type="application/pdf"
              width="100%"
              height="600px"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NBA_F;
