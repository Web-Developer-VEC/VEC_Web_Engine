import React from "react";
import "./NSSManuel.css"; // Import the CSS file

const NSSManual = () => {
  return (
    <div className="NSS-manual-section">
      <h2 className="NSS-section-heading">NSS MANUAL</h2>

      {/* Random Image */}
      <div className="NSS-image-container">
        <img src="https://picsum.photos/seed/picsum/200/300" alt="NSS Manual" className="NSS-manual-image" />
      </div>

      {/* Random PDF Download */}
      <div className="NSS-pdf-container">
        <p>Download the NSS Manual:</p>
        <a href="./manualNss.pdf" className="NSS-pdf-link" target="_blank" rel="noopener noreferrer">
          <button className="NSS-download-btn">Download PDF</button>
        </a>
      </div>
    </div>
  );
};

export default NSSManual;
