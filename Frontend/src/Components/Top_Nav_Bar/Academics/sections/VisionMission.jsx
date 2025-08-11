import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./VisionMission.css";
import LoadComp from "../../../LoadComp";

const VisionMission = ({ data }) => {

  console.log(data);
  
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  if(!data) return <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
    <LoadComp />
  </div>

  const about = data?.find((item) => item.category === "about_the_department")?.content || [];
  const vision = data?.find((item) => item.category === "department_vision")?.content || [];
  const mission = data?.find((item) => item.category === "department_mission")?.content || [];
  const peo = data?.find((item) => item.category === "programme_educational_objectives")?.content || [];
  const po = data?.find((item) => item.category === "program_outcomes")?.content || [];
  const pso = data?.find((item) => item.category === "program_specific_outcomes")?.content || [];
  const banner_details = data?.find((item) => item.category === "banner_name_and_image")?.content || [];

  return (
    <div className="main-content">
      {/* About the Department Section */}
      <section className="about-department">
        <div className=" about-desktop flex flex-col md:flex-row items-center  gap-6">

          {/* Text Card on the left */}
          <div className="section-card w-full md:w-1/2 border-l-4 border-[#FFD700] dark:border-drks bg-white dark:bg-[linear-gradient(135deg,theme(colors.drkb),color-mix(in_srgb,theme(colors.drkb)_85%,white))] p-4 shadow rounded-md">
            <div className="about-department-text">
              <h2 className="text-brwn dark:text-prim border-b-2 border-[#FFD700] dark:border-drks w-fit pb-2">
                About the Department
              </h2>
              <p className="text-text dark:text-drkt">{about}</p>
            </div>
          </div>

          {/* Image on the right */}
          <div className="w-full lg:w-1/2 md:w-full flex justify-center">
            <img
              src={UrlParser(banner_details?.[0]?.about_the_department_image_path)}
              alt={banner_details?.[0]?.name}
              className="img-fluid rounded shadow max-w-full h-auto"
            />
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
            {vision?.length > 0 && (
              <ul className="text-text dark:text-drkt list-none">
                {vision?.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            )}
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
            <ul className="list-none text-text dark:text-drkt">
              {mission?.map((item, index) => (
                <li key={index} className="text-text dark:text-drkt">{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {/* Program Specific Outcomes (PSOs) */}

      {peo?.length > 0 && (
          <div className="psos-section mt-5">
            <h2 className="text-brwn dark:text-drkt border-b-2 border-[#FFD700] dark:border-drks w-fit pb-2">Programme Educational Objectives</h2>
            <div className="accordion" id="psosAccordion">

              {peo?.map((item, index) => (
                <div className="POE accordion-item-cir bg-prim dark:bg-drkb border-l-4 border-secd dark:border-drks rounded-lg" key={index}>
                  <h2 className="accordion-header text-left pl-2 pt-4" id={`psosHeading${index}`}>
                      {item?.header}
                  </h2>
                  <div className={`accordion-body show`}>
                    {item?.content}
                  </div>
                </div>
              ))}
            </div>  
          </div>
      )}
      {/* <div className="dual-outcomes"> */}

      {/* </div> */}

        {/* Right Column: Program Outcomes */}
        {po?.length > 0 && (
          <div className="psos-section mt-5">
            <div className="pos-section">
              <h2 className="text-brwn dark:text-drkt border-b-2 border-[#FFD700] dark:border-drks w-fit pb-2">Program Outcomes</h2>
              <div className="accordion">
                {po?.map((item, index) => (
                  <div className="POE accordion-item-cir text-text dark:text-drkt bg-prim dark:bg-drkb border-l-4 border-secd dark:border-drks rounded-lg" key={index}>
                    <h2 className="accordion-header text-left pl-2 pt-4">
                        {item?.header}
                    </h2>
                    <div className={`accordion-body text-text dark:text-drkt show`}>
                      {item?.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {pso?.length > 0 && (
          <div className="psos-section mt-5">
            <h2 className="text-brwn dark:text-drkt border-b-2 border-[#FFD700] dark:border-drks w-fit pb-2">Program Specific Outcomes</h2>
            <div className="accordion" id="psosAccordion">
              {pso?.map((item, index) => (
                <div className="POE accordion-item-cir bg-prim dark:bg-drkb border-l-4 border-secd dark:border-drks rounded-lg" key={index}>
                  <h2 className="accordion-header text-left pl-2 pt-4" id={`psosHeading${index}`}>
                      {item?.header}
                  </h2>
                  <div className={`accordion-body show`}>
                    {item?.content}
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