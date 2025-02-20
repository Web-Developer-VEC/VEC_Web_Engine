import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faDownload, faTimes } from "@fortawesome/free-solid-svg-icons";
import "./Regulation.css"; // Use your existing CSS
import Banner from "../../Banner";

const REGULATION = ({theme, toggle}) => {
  const [selectedRegulation, setSelectedRegulation] = useState(null);
  const [regdata, setRegData] = useState([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/regulation`);
        setRegData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setLoading(true);
      }
    };
    fetchData();
  }, []);

  const handleViewClick = (regulation) => {
    setSelectedRegulation(regulation);
  };

  const handleDownloadClick = (pdfPath, name) => {
    if (pdfPath) {
      const link = document.createElement("a");
      link.href = pdfPath;
      link.download = `${name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const closeModal = () => {
    setSelectedRegulation(null);
  };

  return (
    <>
      <Banner toggle={toggle} theme={theme}
        backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
        headerText="Regulations"
        subHeaderText="Establishing clear guidelines to foster transparency, compliance, and organizational integrity."
      />

      <div className="REG-page">
        <div className="REG-intro">
          <h1 className="REG-header text-secd dark:text-drks">REGULATION DATA</h1>
        </div>
        {isLoading && (
          <div className="loading-screen">
            <div className="spinner"></div>
            Loading...
          </div>
        )}

        <center>
          <div className="REG-content">
             { regdata.map((reg) => (
                <div key={reg._id} className="REG-regulation dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]">
                  <span className="REG-regulation-title">Regulation - {reg.name}</span>
                  <div className="REG-buttons">
                    <button
                      className="REG-button view-button bg-secd text-text dark:bg-drks dark:text-drkt
                        hover:bg-accn hover:text-prim dark:hover:bg-drka"
                      onClick={() => handleViewClick(reg)}
                    >
                      <FontAwesomeIcon icon={faEye} style={{ marginRight: "5px" }} />
                      View
                    </button>
                    <button
                      className="REG-button download-button bg-secd text-text dark:bg-drks dark:text-drkt
                        hover:bg-accn hover:text-prim dark:hover:bg-drka"
                      onClick={() => handleDownloadClick(reg.pdf_path, reg.name)}
                    >
                      <FontAwesomeIcon icon={faDownload} style={{ marginRight: "5px" }} />
                      Download
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </center>

        {selectedRegulation && (
          <div className="REG-modal">
            <div className="REG-modal-content bg-prim dark:bg-drkp">
              <button className="REG-close-button bg-secd text-text dark:bg-drks dark:text-drkt
                        hover:bg-accn hover:text-prim dark:hover:bg-drka" onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
              <h2 className="text-secd dark:text-drks mb-2">{selectedRegulation.name}</h2>
              <iframe
                src={selectedRegulation.pdf_path}
                title={selectedRegulation.name}
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
