import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import "./CurriculumPage.css";
import LoadComp from "../../../LoadComp";

const CurriculumPage = ({ data }) => {
  const [openKey, setOpenKey] = useState(null);

  const curriculum =
    data?.find((item) => item.category === "curriculum")?.content || [];

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    if (!path) return "#";
    return path.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const handleViewClick = (pdfUrl) => {
    if (pdfUrl) {
      window.open(UrlParser(pdfUrl), "_blank", "noopener,noreferrer");
    }
  };

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadComp />
      </div>
    );
  }

  return (
    <div className="containers mt-5">
      {curriculum.length > 0 ? (
        <div className="row">
          <div className="col-md-6">
            {curriculum.map((section, sectionIndex) => {
              const isUG = sectionIndex === 0;
              // const isPG = sectionIndex > 0;

              return (
                <div
                  key={sectionIndex}
                  className="content-section bg-prim dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] mb-10"
                >
                  <h2 className="text-bold text-[24px] text-brwn dark:text-drkt mb-8">
                    {section.heading}
                  </h2>

                  {section?.syllabus?.map((item, itemIndex) => {
                    const key = `${sectionIndex}-${itemIndex}`;

                    if (isUG) {
                      const docs = item.docs?.length
                        ? item.docs
                        : [
                            {
                              name: "View",
                              pdf_path: item.pdf_path,
                              isView: true,
                            },
                          ];

                      return (
                        <div
                          key={key}
                          className="row-item dark:bg-drkp border-0 dark:hover:bg-drks flex flex-col mb-4"
                        >
                          <div className="R-years self-start">{item.year}</div>

                          <div className="overflow-hidden w-[90%] mx-auto grid grid-cols-3 gap-6 text-center mt-4">
                            {docs.map((doc, docIndex) => (
                              <a
                                key={docIndex}
                                href={
                                  doc.pdf_path
                                    ? UrlParser(doc.pdf_path)
                                    : undefined
                                }
                                target={doc.pdf_path ? "_blank" : undefined}
                                rel={
                                  doc.pdf_path
                                    ? "noopener noreferrer"
                                    : undefined
                                }
                                onClick={(e) => {
                                  if (!doc.pdf_path) e.preventDefault();
                                }}
                                className={`no-underline text-inherit px-3 py-2 rounded flex items-center justify-center gap-2
    ${
      "bg-secd hover:bg-brwn text-text hover:text-prim cursor-pointer"
       
    }
  `}
                              >
                                {doc.isView && <FontAwesomeIcon icon={faEye} />}
                                {doc.name}
                              </a>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={key}
                        className="row-item rounded-lg dark:bg-drkp border-0 dark:hover:bg-drks flex flex-row justify-between items-center mt-6"
                      >
                        <div className="R-years">{item.year}</div>

                        <button
                          className="options-btn text-text bg-secd dark:text-drkt dark:bg-drks hover:bg-accn hover:text-prim dark:hover:bg-brwn"
                          onClick={() => handleViewClick(item.pdf_path)}
                        >
                          <FontAwesomeIcon
                            icon={faEye}
                            style={{ marginRight: "6px" }}
                          />
                          View
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center">
          <LoadComp />
        </div>
      )}
    </div>
  );
};

export default CurriculumPage;