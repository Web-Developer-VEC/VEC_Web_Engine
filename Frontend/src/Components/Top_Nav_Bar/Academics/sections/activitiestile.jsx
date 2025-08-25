import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCertificate,
  faChalkboardTeacher,
  faComments,
  faFileAlt,
  faHandshake,
  faIndustry,
  faLaptopCode,
  faTools,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import "./activitiestile.css";
import LoadComp from "../../../LoadComp";

const Activitiestile = ({ data }) => {

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const actionIcons = {
    "Guest Lecture": faChalkboardTeacher, 
    "Seminar": faUser,
    "Workshop": faTools,  
    "Industrial Visit/ In-Plant Training": faIndustry,
    "Symposium": faComments,
    "Conference": faHandshake,
    "Internship": faLaptopCode,
    "Value Added Course": faCertificate
  };

  const handlePdfOpen = (pdfPath) => {
    if (pdfPath) window.open(UrlParser(pdfPath), "_blank");
  };

  return data ? (
    <div className="Rd-page mb-10">
      <div className="deptevent-content">
        <div className="deptevent-details">
          <div className="deptevent-year-actions">
            {Array.isArray(data) && data?.map((item, index) => (
              <div
                key={index}
                className="deptevent-action-button"
                onClick={() => handlePdfOpen(item?.pdf_path)}
              >
                <FontAwesomeIcon
                  icon={actionIcons[item?.name] || faFileAlt}
                  style={{ marginRight: "10px" }}
                />
                {item?.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
      <LoadComp />
    </div>
  );
};

export default Activitiestile;