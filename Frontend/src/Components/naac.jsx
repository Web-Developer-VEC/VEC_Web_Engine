import React, { useState } from 'react';
import "./naac.css"; // Create a CSS file for styling specific to this component
import banner from "./Assets/banner image.jpg";
const Nirf = () => {
  const [selectedYear, setSelectedYear] = useState("IQAC MoM");
  const [selectedAction, setSelectedAction] = useState(null); // Track the selected action for PDF display

  // Buttons for each year and their associated PDF links for different actions
  const yearButtons = {
   "IQAC MoM": {
      actions: {
        "Odd sem 2020-21": "/pdfs/IQAC-MoM-Odd-Sem-2020-21.pdf",
        "Even sem 2020-21": "/pdfs/IQAC-MoM-Even-Sem-2020-21.pdf",
      }
      },
    "AQAR": {
      actions: {
        "AQAR 2018-19": "/pdfs/AQAR-Report-2018-19.pdf",
        "AQAR 2019-20": "/pdfs/AQAR-2019-20.pdf",
        "AQAR 2020-21": "/pdfs/AQAR-2020-2021.pdf",
        "AQAR 2021-22": "/pdfs/AQAR_2021-22.pdf",
        "AQAR 2022-23": "/pdfs/AQAR_2022-23.pdf",
      },
    },
    "Best Practices": {
      actions: {
        "2019-20": "/pdfs/VEC-Best-Practices-final 2019-20.pdf",
        "2020-21": "/pdfs/7.2.1---Best-practices-20-21.pdf",
        "2021-22": "/pdfs/7.2.1-best-practice-2021-22.pdf",
        "2022-23": "/pdfs/best-practice-2022-2023_final.pdf",
        "2023-24": "/pdfs/best_practice_23-24.pdf",
      },
    },
    "Institutional Distinctives": {
      actions: {
        "2019-20": "/pdfs/VEC-Institutional-Distinctivenss 19-20.pdf",
        "2020-21": "/pdfs/7.3.1-VEC-Institutional-Distinctivenss-2020-21.pdf",
        "2021-22": "/pdfs/distinctiveness-2021-22.pdf",
        "2022-23": "/pdfs/Distinctiveness-22-23_final.pdf",
        "2023-24": "/pdfs/distinctiveness_23-24.pdf",
      },
    },
    "Code of ethics ": {
      actions: {
        "View here": "/pdfs/CODE-OF-ETHICS.pdf",
       
      },
    },
    // "2w": {
    //   actions: {
    //     "Overall": "/pdfs/NIRF-2021.pdf",
    //   },
    // },
    // "a": {
    //   actions: {
    //     "Overall": "/pdfs/NIRF-2020.pdf",
    //   },
    // },
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
        {/* <h1 >NATIONAL INSTITUTIONAL RANKING FRAMEWORK (NIRF)</h1> */}
        <h1 className="nirf-header">About IQAC</h1>
      <div className="para">
        <p>
        The Internal Quality Assurance Cell (IQAC) is an institutional mechanism established to ensure quality enhancement and sustenance in higher education institutions. It was recommended by the National Assessment and Accreditation Council (NAAC) as a post-accreditation quality sustenance measure. The IQAC aims to promote a consistent and catalytic improvement in academic and administrative performance by institutionalizing best practices.
        </p>
        <h3>Objectives</h3>
        <ol>
        <li>1. <b> Quality Enhancement:</b> To develop a system for conscious, consistent, and catalytic improvement in institutional performance.</li>
         <li> 2. <b> Promoting Best Practices:</b> To encourage and institutionalize innovative and effective practices.</li>
        <li>3. <b>Stakeholder Engagement: </b> To ensure active participation of all stakeholders in the quality assurance process.</li>
        <li>4. <b>Documentation and Reporting:</b>  To document institutional processes and communicate quality achievements effectively.</li>
        </ol>
        </div>
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
