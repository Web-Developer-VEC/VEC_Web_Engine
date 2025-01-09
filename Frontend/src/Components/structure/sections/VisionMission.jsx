import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import college from "../../Assets/OIP.jpeg";
import "./VisionMission.css";

const VisionMission = () => {
  return (
    <div className="main-content">
      {/* About the Department Section */}
      <section className="about-department">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="about-department-text">
                <h2>About the Department</h2>
                <p>
                  The Department of Artificial Intelligence aims to produce
                  computing graduates with high potency, applying, designing, and
                  developing systems that pertain and integrate both software and
                  hardware devices. The department utilizes modern approaches in
                  programming and problem-solving techniques.
                </p>
                <p>
                  The Department was established in the year 2020 with the main
                  objective of providing quality education in the field of
                  Engineering and Technology. It is recognized as a nodal center
                  under Anna University.
                </p>
                <p>
                  The Department has proved to be a center of excellence in
                  academic, sponsored research, and continuing education
                  programs.
                </p>
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
              To achieve value-based education and bring idealistic, ethical
              engineers to meet the thriving trends and technology in the field
              of Artificial Intelligence and Data Science.
            </p>
            <blockquote className="vision-quote">
              "Empowering students with a vision for a better future in AI and Data Science."
            </blockquote>
          </div>
        </div>

        {/* Mission Section */}
        <div className="col-md-6 d-flex align-items-stretch">
          <div className="section-card">
            <h2>Department Mission</h2>
            <ul>
              <li>
                To engage students with the core competence to solve real-world
                problems using Artificial Intelligence.
              </li>
              <li>
                To enlighten students into technically proficient engineers
                through innovation in Data Science.
              </li>
              <li>
                To involve students with industry collaboration, career
                guidance, and leadership skills.
              </li>
              <li>
                To mould students as ethical professionals to bring morals to
                individuals and society.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisionMission;
