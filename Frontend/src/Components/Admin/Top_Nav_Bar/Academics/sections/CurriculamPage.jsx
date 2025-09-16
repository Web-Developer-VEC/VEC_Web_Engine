import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import './CurriculumPage.css';
import LoadComp from '../../../LoadComp';

const CurriculumPage = ({ data }) => {
  const curriculam = data?.find((item) => item.category === "curriculum")?.content || [];

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const handleViewClick = (pdfUrl) => {
    if (pdfUrl) {
      window.open(UrlParser(pdfUrl), "_blank", "noopener,noreferrer");
    }
  };

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <div className="containers mt-5">
      {curriculam?.length > 0 ? (
        <div className="row">
          {/* Left Column: Curriculum and PSOs */}
          <div className="col-md-6">
            {curriculam?.map((req, i) => (
              <div
                className="content-section bg-prim dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]"
                key={i}
              >
                <h2 className="text-bold text-[24px] text-brwn dark:text-drkt mb-8">
                  {req?.heading}
                </h2>

                {/* Regulation Rows */}
                {req?.syllabus?.map((data, index) => (
                  <div
                    className="row-item rounded-lg dark:bg-drkp border-0 dark:hover:bg-drks"
                    key={index}
                  >
                    <p>
                      <div className="R-years">{data?.year}</div>
                      <div className="options-container">
                        <button
                          className="options-btn text-text bg-secd dark:text-drkt dark:bg-drks hover:bg-accn hover:text-prim
                            dark:hover:bg-brwn"
                          onClick={() => handleViewClick(data?.pdf_path)}
                        >
                          <FontAwesomeIcon
                            icon={faEye}
                            style={{ marginRight: "5px" }}
                          />
                          View
                        </button>
                      </div>
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp />
        </div>
      )}
    </div>
  );
};

export default CurriculumPage;
