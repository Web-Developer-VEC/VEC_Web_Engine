import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUniversity, faBuilding, faUsers, faChartLine, faCogs, faLaptop, faGraduationCap, 
  faHandHoldingUsd, faHandshake, faMicrochip, faShieldAlt, faLock, faUsersCog, faTransgender } from "@fortawesome/free-solid-svg-icons";
import "./Executive commitee.css"; 
import Banner from "../../Banner";

// Button Component
const CommitteeButton = ({ name, onClick, icon }) => (
  <div className="committee-button bg-prim bg-[color-mix(in_srgb,theme(colors.prim)_88%,black)]
    dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]
    hover:border-2 hover:border-secd dark:hover:border-drks" onClick={onClick}>
    <FontAwesomeIcon className="text-secd dark:text-drks" icon={icon} style={{ marginRight: "10px" }} />
    {name}
  </div>
);

// Modal Component
const PdfModal = ({ pdfUrl, onClose }) => (
  <div className="pdf-modal">
    <div className="pdf-modal-content">
      <button className="pdf-modal-close" onClick={onClose}>
        x
      </button>
      <iframe src={pdfUrl} title="PDF Viewer" width="100%" height="600px" />
    </div>
  </div>
);

const ExecutiveCommittee = ({theme, toggle}) => {
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [committieeData, setCommittieeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Track loading state

  // Mapping committee names to icons
  const iconMapping = {
    academic_council: faUniversity,
    governing_body: faBuilding,
    finance_committee: faHandHoldingUsd,
    research_committee: faChartLine,
    internal_quality_assurance_cell: faShieldAlt,
    planning_and_monitoring_committee: faLaptop,
    anti_ragging_committee: faUsersCog,
    anti_ragging_squad: faUsersCog,
    discipline_and_welfare_committee: faUsers,
    grievance_redressal_committee: faHandshake,
    scst_committee: faUsers,
    internal_complaint_committee: faLock,
    gender_issues_committee: faTransgender,
    institute_industry_interaction_cell: faBuilding,
    nirf_innovation_cell: faMicrochip,
    institution_s_innovation_council: faGraduationCap,
    social_media_cell: faUsers,
    lemonivy_vec_enterpreneurship_cell: faLaptop,
    women_enterpreneurship_cell: faUsers,
    intelluctual_property_rights_cell: faMicrochip,
    innovation_cell: faChartLine,
    start_up_cell: faBuilding,
    technology_transfer_cell: faMicrochip,
    internship_cell: faUsers,
  };

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
  return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/committee`);
        const formattedData = response.data.map((item) => ({
          ...item,
          name: item.name
            .split("_") // Split the name by underscores
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
            .join(" "), // Join the words with spaces
        }));
        setCommittieeData(formattedData);
        setIsLoading(false); // Data has finished loading
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setIsLoading(true); // Even if an error occurs, stop the loading state
      } 
    };
    fetchData();
  },[]);

  const handlePdfClick = (pdfUrl) => {
    setSelectedPdf(pdfUrl);
  };

  const closeModal = () => {
    setSelectedPdf(null);
  };

  return (
    <>
 <Banner toggle={toggle} theme={theme}
  backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
  headerText="Administrative Committees"
  subHeaderText="Leading the way to success with visionary strategies, collaborative efforts, and decisive action."
/>


    <div className="executive-committee-page">
      {/* Committee Page Content */}
      <div className="committee-container">
        {/* Show loading spinner during data fetch */}
        {isLoading && (
          <div className="loading-screen">
            <div className="spinner"></div>
            Loading...
          </div>
        )}

        {/* Committee Content */}
          <div className="committee-buttons-grid">
            {committieeData.map(({ name, pdf_path }) => (
              <CommitteeButton
                key={name}
                name={name}
                icon={iconMapping[name.replace(/[\s'-]/g, "_").toLowerCase()]}
                onClick={() => handlePdfClick(UrlParser(pdf_path))}
              />
            ))}
          </div>
      </div>


      {/* PDF Modal */}
      {selectedPdf && <PdfModal pdfUrl={selectedPdf} onClose={closeModal} />}
    </div>
    </>
  );
};

export default ExecutiveCommittee;
