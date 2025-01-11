import React, { useRef } from "react";
import "./Forms.css";

const Forms = () => {
  const studentTailRef = useRef(null);

  const studentResources = [
    { name: "NPTEL Course Registration form for credit transfer", url: "/pdfs/application.pdf" },
    { name: "Application Form- NPTEL Credit Transfer", url: "/pdfs/Application_for_CGPA_to_Percentage_conversion.pdf" },
    { name: "Application form-CGPA to percentage Conversion", url: "/pdfs/Application-form_Duplicate-Grade-Sheet-LossDamage.pdf" },
    { name: "Application form -Review after Revaluation", url: "" },
    { name: "Application form-Revaluation(After obtaining Photocopy)", url: "/pdfs/" },
    { name: "Application form -Photocopy", url: "/pdfs/" },
    { name: "Evaluation Form for Photocopy of answer scripts B.E tech", url: "/pdfs/" },
    { name: "B.E & M.E -evaluation form for photocopy of answer script", url: "/pdfs/" },
    { name: "Project Report Format", url: "/pdfs.Application-Form-Revaluation-After-obtaining-Photocopy.pdf" },
    { name: "Project Report Specimen", url: "/pdfs/Application_for_CGPA_to_Percentage_conversion.pdf" },
    { name: "Application Form-Name Correction", url: "/pdfs/Application-for-Transcripts_VEC_UPDATED_03-07-2023.pdf" },
    { name: "Application form -Duplicate Certificate", url: "/pdfs/Application-Form-for-Withdrawal.pdf" },
    { name: "Application Form - Duplicate Hall Ticket", url: "/pdfs/Application-form_Duplicate-Grade-Sheet-LossDamage.pdf" },
    { name: "Application Form - Withdrawal", url: "/pdfs/Application-Form-for-Withdrawal.pdf" },
    { name: "Application Form - Transcript Certificate", url: "/pdfs/Application-for-Transcripts_VEC_UPDATED_03-07-2023.pdf" },
  ];

  const facultyResources = [
    { name: "SEE_QP_feedback_R2023", url: "/pdfs/SEE_QP_Feedback_R2023.pdf" },
    { name: "SEE_QP_Feedback_R2019", url: "/pdfs/SEE_QP_Feedback_R2019.pdf" },
    { name: "Self declaration form (Children/spouse pursuing UG/PG degree in VEC)", url: "/pdfs/Declaration_from_Staff(Children_Spouse_doing_UG_PG_degree_in_VEC).pdf" },
    { name: "Exam Duty Alteration Format (for Faculty)", url: "/pdfs/Duty_alteration_Format_Faculty_Final.pdf" },
    { name: "Registration Form - Ph.D. Course Work", url: "/pdfs/Registration-Form-Ph.D.-Coursework-updated-19-04-2023.pdf" },
  ];

  const renderResourceLinks = (resources) => {
    return resources.map((resource, index) => (
      <div
        key={index}
        className="resource-item"
        onClick={() => window.open(resource.url, "_blank")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && window.open(resource.url, "_blank")}
      >
        {resource.name}
      </div>
    ));
  };

  return (
    <div className="tails-container">
      <div className="tail student-tail" ref={studentTailRef}>
        <div className="tail-content">
          <h2>Student Resources</h2>
          <div className="download-links-container">
            {renderResourceLinks(studentResources)}
          </div>
        </div>
      </div>

      <div className="tail faculty-tail">
        <div className="tail-content">
          <h2>Faculty Resources</h2>
          <div className="download-links-container">
            {renderResourceLinks(facultyResources)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forms;
