import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Eye, Target } from "lucide-react"; // Importing icons
import "./VisionMission.css";
import LoadComp from "../../../LoadComp";

const VisionMission = ({ data }) => {

  const [activePO, setActivePO] = useState(null); // Track which PO is active (open)
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
                <h2>About the Department</h2>
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
            border-l-4 border-secd
            dark:bg-[linear-gradient(135deg,theme(colors.drks),color-mix(in_srgb,theme(colors.drks)_85%,white))]
            p-3 shadow rounded"
          >
            <div className="d-flex align-items-center mb-3">
              <Eye size={32} className="me-3" /> {/* Vision Icon */}
              <h2 className="my-auto">Department Vision</h2>
            </div>
            <p>{data?.vision}</p>
            <blockquote className="vision-quote border-l-4 border-accn dark:border-drka text-accn dark:text-drka">
              {data?.department_quotes}
            </blockquote>
          </div>
        </div>

        {/* Mission Section */}
        <div className="d-flex align-items-stretch mb-3">
          <div
            className="section-card
            border-l-4 border-secd
            bg-white
            dark:bg-[linear-gradient(135deg,theme(colors.drks),color-mix(in_srgb,theme(colors.drks)_85%,white))]
            p-3 shadow rounded w-100"
          >
            <div className="d-flex align-items-center mb-3">
              <Target size={32} className="me-3" /> {/* Mission Icon */}
              <h2 className="my-auto">Department Mission</h2>
            </div>
            <ul>
              {data?.mission?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {/* Program Specific Outcomes (PSOs) */}
        <div className="psos-section mt-5">
          <h2>Program Educational Outcomes</h2>
          <div className="accordion" id="psosAccordion">
            {data?.program_educational_outcomes?.headings?.map((heading, index) => (
              <div className="accordion-item-cir bg-prim dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]" key={index}>
                <h2 className="accordion-header" id={`psosHeading${index}`}>
                  <button className="accordion-buttons" onClick={() => togglePOE(index)}>
                    {heading}
                  </button>
                </h2>
                <div className={`accordion-body ${activePOE === index ? 'show' : ''}`}>
                  {data?.program_educational_outcomes?.content[index]}
                </div>
              </div>
            ))}
          </div>  
        </div>
      {/* <div className="dual-outcomes"> */}

      {/* </div> */}

        {/* Right Column: Program Outcomes */}
        <div className="col-md-6 mt-10 w-full">
          <div className="pos-section">
            <h2>Program Outcomes</h2>
            <div className="accordion grid-container">
              {data?.program_outcomes?.headings?.map((heading, index) => (
                <div className="accordion-item-cir bg-prim dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]" key={index}>
                  <h2 className="accordion-header">
                    <button className="accordion-buttons" onClick={() => togglePO(index)}>
                      {heading}
                    </button>
                  </h2>
                  <div className={`accordion-body ${activePO === index ? 'show' : ''}`}>
                    {data?.program_outcomes?.content[index]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="psos-section mt-5">
          <h2>Program Specific Outcomes</h2>
          <div className="accordion" id="psosAccordion">
            {data?.program_specific_outcomes?.headings?.map((heading, index) => (
              <div className="accordion-item-cir bg-prim dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]" key={index}>
                <h2 className="accordion-header" id={`psosHeading${index}`}>
                  <button className="accordion-buttons" onClick={() => togglePOS(index)}>
                    {heading}
                  </button>
                </h2>
                <div className={`accordion-body ${activePOS === index ? 'show' : ''}`}>
                  {data?.program_specific_outcomes.content[index]}
                </div>
              </div>
            ))}
          </div>  
        </div>
    </div>
  );
};

export default VisionMission;
