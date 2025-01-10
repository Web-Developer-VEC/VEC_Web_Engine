import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./collegevisionmission.module.css";

const Collegevisionmission = () => {
  return (
    <div className="clg-vision-card">
      <div className="row g-4">
        {/* Vision Section */}
        <div className="col-md-6 d-flex align-items-stretch">
          <div className="section-card">
            <h2>Institute Vision</h2>
            <p>
            To educate the student community both by theory and practice to fit in with the society and to conquer tomorrow’s technology at global level with human values through our dedicated team.
            </p>
            
          </div>
        </div>

        {/* Mission Section */}
        <div className="col-md-6 d-flex align-items-stretch">
          <div className="section-card">
            <h2>Institute Mission</h2>
            <ul>
              <p>
              To provide world class education in engineering, technology and management, to foster research & development, to encourage creativity and promote innovation, to build leadership, intrapreneurship and entrepreneurship and to nurture teamwork and achieve stakeholders’ delight.
              </p>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collegevisionmission;
