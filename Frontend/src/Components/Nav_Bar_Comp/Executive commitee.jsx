import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUniversity, faBuilding, faUsers, faChartLine, faCogs, faLaptop, faGraduationCap, 
  faHandHoldingUsd, faHandshake, faMicrochip, faShieldAlt, faLock, faUsersCog, faTransgender } from "@fortawesome/free-solid-svg-icons";
import "./Executive commitee.css"; 
import Banner from "../Banner";

// Button Component
const CommitteeButton = ({ name, onClick, icon }) => (
  <div className="committee-button" onClick={onClick}>
    <FontAwesomeIcon icon={icon} style={{ marginRight: "10px" }} />
    {name}
  </div>
);

// Modal Component
const PdfModal = ({ pdfUrl, onClose }) => (
  <div className="pdf-modal">
    <div className="pdf-modal-content">
      <button className="pdf-modal-close" onClick={onClose}>
        Close
      </button>
      <iframe src={pdfUrl} title="PDF Viewer" width="100%" height="600px" />
    </div>
  </div>
);

const ExecutiveCommittee = () => {
  const [selectedPdf, setSelectedPdf] = useState(null);

  // Committee data with unique icons
  const committees = [
    { name: "Academic Council", pdfUrl: "/pdfs/academic-council.pdf", icon: faUniversity },
    { name: "Governing Body", pdfUrl: "/pdfs/governing-body.pdf", icon: faBuilding },
    { name: "Finance Committee", pdfUrl: "/pdfs/finance-committee.pdf", icon: faHandHoldingUsd },
    { name: "Research Committee", pdfUrl: "/pdfs/research-committee.pdf", icon: faChartLine },
    { name: "Internal Quality Assurance Cell", pdfUrl: "/pdfs/iqac.pdf", icon: faShieldAlt },
    { name: "Planning and Monitoring Committee", pdfUrl: "/pdfs/planning-monitoring.pdf", icon: faLaptop },
    { name: "Anti-Ragging Committee", pdfUrl: "/pdfs/anti-ragging.pdf", icon: faUsersCog },
    { name: "Anti-Ragging Squad", pdfUrl: "/pdfs/anti-ragging-squad.pdf", icon: faUsersCog },
    { name: "Discipline and Welfare Committee", pdfUrl: "/pdfs/discipline-welfare.pdf", icon: faUsers },
    { name: "Grievance Redressal Committee", pdfUrl: "/pdfs/grievance-redressal.pdf", icon: faHandshake },
    { name: "SC/ST Committee", pdfUrl: "/pdfs/sc-st.pdf", icon: faUsers },
    { name: "Internal Complaint Committee", pdfUrl: "/pdfs/internal-complaint.pdf", icon: faLock },
    { name: "Gender Issues Committee", pdfUrl: "/pdfs/gender-issues.pdf", icon: faTransgender },
    { name: "Institute Industry Interaction Cell", pdfUrl: "/pdfs/3i-cell.pdf", icon: faBuilding },
    { name: "NIRF Innovation Cell", pdfUrl: "/pdfs/nirf.pdf", icon: faMicrochip },
    { name: "Institution's Innovation Council", pdfUrl: "/pdfs/innovation-council.pdf", icon: faGraduationCap },
    { name: "Social Media Cell", pdfUrl: "/pdfs/social-media.pdf", icon: faUsers },
    { name: "LEMON IVY – VEC Entrepreneurship Cell", pdfUrl: "/pdfs/entrepreneurship.pdf", icon: faLaptop },
    { name: "Women Entrepreneurship Cell", pdfUrl: "/pdfs/women-entrepreneurship.pdf", icon: faUsers },
    { name: "Intellectual Property Rights Cell", pdfUrl: "/pdfs/ipr.pdf", icon: faMicrochip },
    { name: "Innovation Cell", pdfUrl: "/pdfs/innovation.pdf", icon: faChartLine },
    { name: "Start-Up Cell", pdfUrl: "/pdfs/startup.pdf", icon: faBuilding },
    { name: "Technology Transfer Cell", pdfUrl: "/pdfs/tech-transfer.pdf", icon: faMicrochip },
    { name: "Internship Cell", pdfUrl: "/pdfs/internship.pdf", icon: faUsers },
  ];

  const handlePdfClick = (pdfUrl) => {
    setSelectedPdf(pdfUrl);
  };

  const closeModal = () => {
    setSelectedPdf(null);
  };

  return (
    <>
 <Banner
  backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
  headerText="Executive Committees"
  subHeaderText="Leading the way to success with visionary strategies, collaborative efforts, and decisive action."
/>


    <div className="executive-committee-page">
      {/* Intro Section */}
      <div className="executive-committee-intro">
      </div>

      {/* Committees Buttons */}
      <div className="committee-buttons-grid">
        {committees.map(({ name, pdfUrl, icon }) => (
          <CommitteeButton key={name} name={name} icon={icon} onClick={() => handlePdfClick(pdfUrl)} />
        ))}
      </div>

      {/* PDF Modal */}
      {selectedPdf && <PdfModal pdfUrl={selectedPdf} onClose={closeModal} />}
    </div>
    </>
  );
};

export default ExecutiveCommittee;
