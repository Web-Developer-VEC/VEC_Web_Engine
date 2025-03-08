import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Eye, Target } from "lucide-react"; // Importing icons
import "./VisionMission.css";

const VisionMission = ({ data }) => {

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

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
                  alt="Department of AI"
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
    </div>
  );
};

export default VisionMission;
