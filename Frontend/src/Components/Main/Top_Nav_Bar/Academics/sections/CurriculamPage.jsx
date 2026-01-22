import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import "./CurriculumPage.css";
import LoadComp from "../../../LoadComp";

const CurriculumPage = ({ data }) => {
  const [openYear, setOpenYear] = useState(null);

  const curriculam =
    data?.find((item) => item.category === "curriculum")?.content || [];

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
      {curriculam.length > 0 ? (
        <div className="row">
          <div className="col-md-6">
            {curriculam.map((req, i) => (
              <div
                className="content-section bg-prim dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]"
                key={i}
              >
                <h2 className="text-bold text-[24px] text-brwn dark:text-drkt mb-8">
                  {req?.heading}
                </h2>

                {req?.syllabus?.filter(s=> s.year.includes("R - 2023"))?.map((item, index) => {
                  const isOpen = openYear === index;

                  return (
                    <div
                      key={index}
                      className="row-item dark:bg-drkp border-0 dark:hover:bg-drks flex flex-col"
                    >
                      {/* Year Button */}
                      <button
                        className="R-years  self-start "
                        onClick={() =>
                          setOpenYear(isOpen ? null : index)
                        }
                      >
                        {item?.year}
                      </button>

                      {/* Accordion Content */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out w-[90%] mx-auto grid grid-cols-3  gap-8 flex-wrap text-center  ${
                          isOpen
                            ? "max-h-[500px] opacity-100 mt-4"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                    
                       {item?.docs.map((icon,value)=>{
                        return(
                            <a href={UrlParser(icon.pdf_path)} target="_blank" rel="noopener noreferrer" className="no-underline text-inherit  bg-secd hover:bg-brwn text-text hover:text-prim  px-2 py-2 rounded  self-center w-[18rem] ">{icon.name}</a>
                          )
                        })}
                     
                      </div>
                    </div>
                  );
                })}
                <div></div>
               {req?.syllabus?.filter(s=> !s.year.includes("R - 2023")).map((data, index) => (
                  <div
                    className="row-item rounded-lg dark:bg-drkp border-0 dark:hover:bg-drks flex flex-row justify-between my-auto mt-12 "
                    key={index}
                  >
                   
                      <div className="R-years">{data?.year}</div>
                    
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
