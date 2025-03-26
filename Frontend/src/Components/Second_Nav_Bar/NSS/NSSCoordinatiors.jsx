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
      <div className="NSS-staff-container">
      <div className="NSS-id-card-staff">
        <img
          src={UrlParser(faculty?.image_path)}
          alt="Staff Coordinator"
          className="NSS-profile-pic-staff"
        />
        <div className="NSS-text-container">
          <h4 className="NSS-name-staff">{faculty?.name}</h4>
          <p className="NSS-role-staff">{faculty?.designation}</p>
          <p className="NSS-staff-msg">{faculty?.msg}This is NSS This is NSS This is NSS This is NSS This is NSS This is NSS This is NSS This is NSS This is NSS This is NSS </p>
      </div>
      </div>
</div>


      {/* Student Coordinators */}
      <h3 className="NSS-subheading">Student Coordinators</h3>
      <div className="NSS-student-coordinators">
        {students?.name?.map((name, index) => (
          <div key={index} className="NSS-id-card">
            <img src={UrlParser(students?.image_path[index])} alt={name} className="NSS-profile-pic" />
            <h4 className="NSS-name">{name}</h4>
            <p className="NSS-rank">RANK</p>
            <p className="regement-no">Regement number</p>
            <p className="NSS-role">{students?.designation[index]}</p>
            <p className="register-no&depr">113223000000/AI&DS</p>
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
