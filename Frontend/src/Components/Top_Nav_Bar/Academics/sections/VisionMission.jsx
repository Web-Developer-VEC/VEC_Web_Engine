import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Eye, Target } from "lucide-react"; 
import "./VisionMission.css";
import LoadComp from "../../../LoadComp";

const VisionMission = ({ data }) => {

  const [activePO, setActivePO] = useState(null); 
  const [activePOS, setActivePOS] = useState(null);
  const [activePOE, setActivePOE] = useState(null);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const togglePO = (id) => {
    setActivePO((prev) => (prev === id ? null : id)); // Toggle the active PO
  };
  const togglePOS = (id) => {
    setActivePOS((prev) => (prev === id ? null : id)); // Toggle the active PO
  };
  const togglePOE = (id) => {
    setActivePOE((prev) => (prev === id ? null : id)); // Toggle the active PO
  };

  if(!data) return <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
    <LoadComp />
  </div>

  return (
    <div className="main-content">
      {/* About the Department Section */}
      <section className="about-department">
        <div className="ABT_container">
          <div className="row">
            <div className="col-md-6">
              <div className="about-department-text">
                <h2 className="text-brwn dark:text-prim border-b-2 border-secd dark:border-drks pb-1">About the Department</h2>
                <p>{data?.about_department}</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="about-department-image">
                <img
                  src={UrlParser(data?.department_image)}
                  alt={data?.department_name}
                  className="img-fluid rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="row g-6">
        {/* Vision Section */}
        <div className="d-flex align-items-stretch mb-3">
          <div
            className="section-card
            bg-white
            border-l-4 border-secd dark:border-drks
            dark:bg-[linear-gradient(135deg,theme(colors.drkb),color-mix(in_srgb,theme(colors.drkb)_85%,white))]
            p-3 shadow rounded"
          >
            <div className="d-flex align-items-center mb-3">
              {/* <Eye size={32} className="me-3" />  */}
              <h2 className="text-brwn dark:text-drkt border-b-2 border-[#FFD700] dark:border-drks w-fit pb-2">Department Vision</h2>
            </div>
            <p className="text-text dark:text-drkt">{data?.vision}</p>
            <blockquote className="text-text dark:text-drkt border-l-4 border-[#FFD700] dark:border-drks rounded-lg">
              {data?.department_quotes}
            </blockquote>
          </div>
        </div>

        {/* Mission Section */}
        <div className="d-flex align-items-stretch mb-3">
          <div
            className="section-card
            border-l-4 border-secd dark:border-drks
            bg-white
            dark:bg-[linear-gradient(135deg,theme(colors.drkb),color-mix(in_srgb,theme(colors.drkb)_85%,white))]
            p-3 shadow rounded w-100"
          >
            <div className="d-flex align-items-center mb-3">
              {/* <Target size={32} className="me-3" />  */}
              <h2 className="text-brwn dark:text-drkt border-b-2 border-[#FFD700] dark:border-drks w-fit">Department Mission</h2>
            </div>
            <ul>
              {data?.mission?.map((item, index) => (
                <li key={index} className="text-text dark:text-drkt">{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {/* Program Specific Outcomes (PSOs) */}

      {data?.program_educational_outcomes?.headings?.length > 0 && (
          <div className="psos-section mt-5">
            <h2 className="text-brwn dark:text-drkt border-b-2 border-[#FFD700] dark:border-drks w-fit pb-2">Programme Educational Objectives</h2>
            <div className="accordion" id="psosAccordion">
              
              {data?.program_educational_outcomes?.headings?.map((heading, index) => (
                <div className="POE accordion-item-cir bg-prim dark:bg-drkts border-l-4 border-secd dark:border-drks rounded-lg"key={index}>
                  <h2 className="accordion-header text-left p-4" id={`psosHeading${index}`}>
                      {heading}
                  </h2>
                  <div className={`accordion-body show`}>
                    {data?.program_educational_outcomes?.content[index]}
                  </div>
                </div>
              ))}
            </div>  
          </div>
      )}
      {/* <div className="dual-outcomes"> */}

      {/* </div> */}

        {/* Right Column: Program Outcomes */}
        {data?.program_outcomes?.headings?.length > 0 && (
          <div className="col-md-6 mt-10 w-full">
            <div className="pos-section">
              <h2 className="text-brwn dark:text-drkt border-b-2 border-[#FFD700] dark:border-drks w-fit pb-2">Program Outcomes</h2>
              <div className="accordion grid-container">
                {data?.program_outcomes?.headings?.map((heading, index) => (
                  <div className="accordion-item-cir text-text dark:text-drkt bg-prim dark:bg-drkts border-l-4 border-secd dark:border-drks rounded-lg" key={index}>
                    <h2 className="accordion-header text-left p-4">
                        {heading}
                    </h2>
                    <div className={`accordion-body text-text dark:text-drkt show`}>
                      {data?.program_outcomes?.content[index]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {data?.program_specific_outcomes?.headings?.length > 0 && (
          <div className="psos-section mt-5">
            <h2 className="text-brwn dark:text-drkt border-b-2 border-[#FFD700] dark:border-drks w-fit pb-2">Program Specific Outcomes</h2>
            <div className="accordion" id="psosAccordion">
              {data?.program_specific_outcomes?.headings?.map((heading, index) => (
                <div className="POE accordion-item-cir bg-prim dark:bg-drkts border-l-4 border-secd dark:border-drks rounded-lg" key={index}>
                  <h2 className="accordion-header text-left p-4" id={`psosHeading${index}`}>
                      {heading}
                  </h2>
                  <div className={`accordion-body show`}>
                    {data?.program_specific_outcomes.content[index]}
                  </div>
                </div>
              ))}
            </div>  
          </div>
        )}
    </div>
  );
};

export default VisionMission;