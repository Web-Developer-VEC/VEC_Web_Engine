import React from "react";
import "./NSSCoordinators.css"; // Import the CSS file

const Coordinators = ({faculty, students}) => {

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };
  return (
    <div className="NSS-coordinators-section">
      <h2 className="NSS-section-heading">COORDINATORS</h2>

      {/* Staff Coordinator (Centered) */}
      <h3 className="NSS-subheading">Staff Coordinator</h3>
      <div className="NSS-staff-container">
        <div className="NSS-id-card">
          <img
            src={UrlParser(faculty?.image_path)}
            alt="Staff Coordinator"
            className="NSS-profile-pic"
          />
          <h4 className="NSS-name">{faculty?.name}</h4>
          <p className="NSS-role">{faculty?.designation}</p>
          
        </div>
      </div>

      {/* Student Coordinators */}
      <h3 className="NSS-subheading">Student Coordinators</h3>
      <div className="NSS-student-coordinators">
        {students?.name?.map((name, index) => (
          <div key={index} className="NSS-id-card">
            <img src={UrlParser(students?.image_path[index])} alt={name} className="NSS-profile-pic" />
            <h4 className="NSS-name">{name}</h4>
            <p className="NSS-role">{students?.designation[index]}</p>
            {/* <div className="NSS-social-icons">
              <a href={"#"} className="NSS-social-link">
                <i className="fab fa-facebook"></i>
              </a>
              <a href={"#"} className="NSS-social-link">
                <i className="fab fa-instagram"></i>
              </a>
              <a href={"#"} className="NSS-social-link">
                <i className="fab fa-linkedin"></i>
              </a>
            </div> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Coordinators;
