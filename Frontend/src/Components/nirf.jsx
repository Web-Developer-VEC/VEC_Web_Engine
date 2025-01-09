import React, { useState } from 'react';
import "./nirf.css"; // Create a CSS file for styling specific to this component
import banner from "./Assets/banner image.jpg";
const Nirf = () => {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedAction, setSelectedAction] = useState(null); // Track the selected action for PDF display

  // Buttons for each year and their associated PDF links for different actions
  const yearButtons = {
    "2025": {
      actions: {
        "Overall": "/pdfs/NIRF-2025-Overall.pdf",
        "Engineering": "/pdfs/NIRF-2025-Engineering.pdf",
        "Innovation": "/pdfs/NIRF-2025-Innovation.pdf",
        "STG": "/pdfs/NIRF-2025-STG.pdf",
      },
    },
    "2024": {
      actions: {
        "Overall": "/pdfs/NIRF-2024-Overall.pdf",
        "Engineering": "/pdfs/NIRF-2024-Engineering.pdf",
        "Innovation": "/pdfs/NIRF-2024-Innovation.pdf",
      },
    },
    "2023": {
      actions: {
        "Engineering": "/pdfs/NIRF-2023-Engineering.pdf",
        "Overall": "/pdfs/NIRF-2023-Overall.pdf",
      },
    },
    "2022": {
      actions: {
        "Overall": "/pdfs/NIRF-2022.pdf",
        "NISP VEC": "/pdfs/NISP-VEC-2022.pdf",
      },
    },
    "2021": {
      actions: {
        "Overall": "/pdfs/NIRF-2021.pdf",
      },
    },
    "2020": {
      actions: {
        "Overall": "/pdfs/NIRF-2020.pdf",
      },
    },
  };

  const openPdf = (action) => {
    setSelectedAction(action); // Set the selected action to display the PDF
  };

  const downloadPdf = (action) => {
    const pdfUrl = yearButtons[selectedYear]?.actions[action];
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = action + ".pdf"; // Set the file name for download
      link.click();
    }
  };
  const handleYearClick = (year) => {
    setSelectedYear(year); // Set the selected year
    setSelectedAction(null); // Reset the selected action when changing the year
  };

  return (
    <div className="nirf-page">2
      <div className="nirf-banner">
        <img
          src={banner} // Replace with your banner image path
          alt="NIRF Banner"
          className="nirf-banner-image"
        />
      </div>

      {/* Introductory Text */}
      <div className="nirf-intro">
        <h1 className="nirf-header">NATIONAL INSTITUTIONAL RANKING FRAMEWORK (NIRF)</h1>
        <p>
          <strong>About NIRF</strong>
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The NIRF is a comprehensive ranking system launched by the Ministry of Education, Government of India, in 2015. It provides a structured methodology to rank higher education institutions across India based on various objective and subjective criteria. The ranking is released annually, aiming to promote a competitive spirit among institutions and enhance transparency in education standards.
        </p>
      </div>

      {/* Page Content */}
      <div className="nirf-content">
        {/* Left Side - Years */}
        <div className="nirf-years">
          {Object.keys(yearButtons)
            .sort((a, b) => b - a) // Sort years in descending order
            .map((year) => (
              <button
                key={year}
                className={`nirf-year-button ${selectedYear === year ? "active" : ""}`}
                onClick={() => handleYearClick(year)} // Set selected year when clicked
              >
                {year}
              </button>
            ))}
        </div>

        {/* Right Side - Buttons for Selected Year */}
        <div className="nirf-details">
          
          <div className="nirf-year-actions">
            {Object.keys(yearButtons[selectedYear]?.actions || {}).map((action, index) => (
              <div key={index}>
                <button
                  className="nirf-action-button"
                  onClick={() => openPdf(action)} // Show the PDF for the selected action
                >
                  {action}
                </button>
              </div>
            ))}
          </div>

          {/* Display PDF if an action is selected */}
          {selectedAction && (
            <div className="nirf-pdf-container">
              <h3>{`Viewing: ${selectedAction}`}</h3>
              <embed className='embed'
                src={yearButtons[selectedYear]?.actions[selectedAction]}
                type="application/pdf"
                width="100%"
                height="600px"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Nirf;
