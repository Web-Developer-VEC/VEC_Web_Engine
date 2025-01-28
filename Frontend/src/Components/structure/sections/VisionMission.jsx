import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import college from "../../Assets/OIP.jpeg";
import "./VisionMission.css";

const VisionMission = ({data}) => {
  return (
    <div className="main-content">
      {/* About the Department Section */}
      <section className="about-department">
        <div className="ABT_container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="about-department-text">
                <h2>About the Department</h2>
                <p>
                 {data.about_department}
                </p>
                {/* <p>
                  The Department was established in the year 2020 with the main
                  objective of providing quality education in the field of
                  Engineering and Technology. It is recognized as a nodal center
                  under Anna University.
                </p>
                <p>
                  The Department has proved to be a center of excellence in
                  academic, sponsored research, and continuing education
                  programs.
                </p> */}
              </div>
            </div>
            <div className="col-md-6">
              <div className="about-department-image">
                <img src={college} alt="Department of AI" className="img-fluid rounded" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="row g-4">
        {/* Vision Section */}
        <div className="col-md-6 d-flex align-items-stretch">
          <div className="section-card">
            <h2>Department Vision</h2>
            <p>
              {data.vision}
            </p>
            <blockquote className="vision-quote">
              {data.department_quotes}
            </blockquote>
          </div>
        </div>

        {/* Mission Section */}
        <div className="col-md-6 d-flex align-items-stretch">
          <div className="section-card">
            <h2>Department Mission</h2>
            <ul>
              {data?.mission?.map((item) => (
              <li>
                {item}
              </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisionMission;
