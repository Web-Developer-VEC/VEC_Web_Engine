import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Eye, Target } from "lucide-react"; // Importing icons
import "./VisionMission.css";

const VisionMission = ({ data }) => {
  return (
    <div className="main-content">
      {/* About the Department Section */}
      <section className="about-department">
        <div className="ABT_container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="about-department-text">
                <h2>About the Department</h2>
                <p>{data?.about_department}</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="about-department-image">
                <img
                  src={data?.department_image}
                  alt="Department of AI"
                  className="img-fluid rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="row g-4">
        {/* Vision Section */}
        <div className="col-md-6 d-flex align-items-stretch">
          <div className="section-card p-4 shadow rounded">
            <div className="d-flex align-items-center mb-3">
              <Eye size={32} className="me-3" /> {/* Vision Icon */}
              <h2>Department Vision</h2>
            </div>
            <p>{data?.vision}</p>
            <blockquote className="vision-quote">{data?.department_quotes}</blockquote>
          </div>
        </div>

        {/* Mission Section */}
        <div className="col-md-6 d-flex align-items-stretch">
          <div className="section-card p-4 shadow rounded">
            <div className="d-flex align-items-center mb-3">
              <Target size={32} className="me-3" /> {/* Mission Icon */}
              <h2>Department Mission</h2>
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
