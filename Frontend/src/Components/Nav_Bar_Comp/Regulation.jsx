import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faDownload, faTimes } from "@fortawesome/free-solid-svg-icons";
import "./Regulation.css"; // Use your existing CSS
import Banner from "../Banner";


const REGULATION = () => {
  const [selectedRegulation, setSelectedRegulation] = useState(null);

  // Regulation details with PDFs for each regulation
  const regulations = {
    "Regulations - R2023 (B.E./B.Tech.)": "/pdfs/VEC_R_2023_B.E._B.Tech. 31-10-2023.pdf",
    "Regulations - R2023 (M.E.)": "/pdfs/VEC_R_2023-M.E._M.Tech._25-03-2024.pdf",
    "Regulations - R2023 (MBA)": "/pdfs/MBA_REGULATIONS_R-23.pdf",
    "Regulations - R2019 (B.E./B.Tech.)": "/static/media/regulation1.pdf",
    "Regulations - R2019 (M.E.)": "/static/media/regulation1.pdf",
    "Regulations - R2019 (MBA)": "/static/media/regulation1.pdf",
  };

  // Function to handle "View" button click
  const handleViewClick = (regulation) => {
    setSelectedRegulation(regulation); // Set the selected regulation to view
  };

  const handleDownloadClick = (regulation) => {
    const pdfUrl = regulations[regulation];
    if (pdfUrl) {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `${regulation}.pdf`;
      document.body.appendChild(link); // Append the link to the DOM temporarily
      link.click();
      document.body.removeChild(link); // Remove the link after download
    }
  };

  const closeModal = () => {
    setSelectedRegulation(null); // Close the modal by resetting the selected regulation
  };

  return (
    <>
<Banner
  backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
  headerText="Regulations"
  subHeaderText="Establishing clear guidelines to foster transparency, compliance, and organizational integrity."
/>


    <div className="REG-page">
      {/* Intro Section */}
      <div className="REG-intro">
        <h1 className="REG-header">REGULATION DATA</h1>
      </div>
<center>
      {/* Regulation List */}
      <div className="REG-content">
        {Object.keys(regulations).map((regulation) => (
          <div key={regulation} className="REG-regulation">
            <span className="REG-regulation-title">{regulation}</span>
            <div className="REG-buttons">
              {/* View Button */}
              <button
                className="REG-button view-button"
                onClick={() => handleViewClick(regulation)}
              >
                <FontAwesomeIcon icon={faEye} style={{ marginRight: "5px" }} />
                View
              </button>
              {/* Download Button */}
              <button
                className="REG-button download-button"
                onClick={() => handleDownloadClick(regulation)}
              >
                <FontAwesomeIcon icon={faDownload} style={{ marginRight: "5px" }} />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
      </center>

      {/* Modal for PDF Viewer */}
      {selectedRegulation && (
        <div className="REG-modal">
          <div className="REG-modal-content">
            <button className="REG-close-button" onClick={closeModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2>{selectedRegulation}</h2>
            <iframe
              src={regulations[selectedRegulation]}
              title={selectedRegulation}
              className="REG-iframe"
            ></iframe>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default REGULATION;

