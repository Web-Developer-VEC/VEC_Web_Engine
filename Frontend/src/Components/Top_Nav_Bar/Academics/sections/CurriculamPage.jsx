import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faDownload, faTimes } from "@fortawesome/free-solid-svg-icons";
import './CurriculumPage.css';
import LoadComp from '../../../LoadComp';

const CurriculumPage = ({ data }) => {
  const [selectedRegulation, setSelectedRegulation] = useState(null);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const handleViewClick = (regulation,year) => {
    setSelectedRegulation([regulation,year]);
  };

  const closeModal = () => {
    setSelectedRegulation(null);
  };

  if(!data) return <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
    <LoadComp />
  </div>

  return (
    <div className="containers mt-5">
      {data?.regulation?.year?.length > 0 ? (
        <>       
          <div className="row">
            {/* Left Column: Curriculum and PSOs */}
            <div className="col-md-6">
              <div className="content-section bg-prim dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]">
                <h2 className="text-start">Curriculum & Syllabus</h2>
    
                {/* Regulation Rows */}
                {data?.regulation?.year?.map((year, index) => (
                  <div className="row-item rounded-lg dark:bg-drkp border-0 dark:hover:bg-drks" key={year}>
                    <p>
                      R - {year}
                      <div className="options-container">
                        <button 
                        className="options-btn text-text bg-secd dark:text-drkt dark:bg-drks hover:bg-accn hover:text-prim
                          dark:hover:bg-drka"
                        onClick={() => handleViewClick(data.regulation.pdf_path[index],year)}
                        >
                          <FontAwesomeIcon icon={faEye} style={{ marginRight: "5px" }} />
    
                          View
                        
                        </button>
                      </div>
                    </p>
                  </div>
                ))}
              </div>
    
            </div>
          </div>
          {selectedRegulation && (
            <div className="REG-modal">
              <div className="REG-modal-content bg-prim dark:bg-drkp">
                <button className="REG-close-button bg-secd text-text dark:bg-drks dark:text-drkt hover:bg-accn hover:dark:bg-drka"
                        onClick={closeModal}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
                <h2 className="mb-4">Regulation {selectedRegulation[1]}</h2>
                <iframe
                  src={UrlParser(selectedRegulation[0])}
                  title={selectedRegulation[1]}
                  className="REG-iframe"
                ></iframe>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
        </div>
      )}
    </div>
  );
};

export default CurriculumPage;
