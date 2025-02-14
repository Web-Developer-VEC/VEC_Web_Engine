import React from "react";
import "./NSSCotent.css"; // Import the CSS file

const NSSContent = () => {
  return (
    <div className="nss-container">
      <div className="nss-content">
        {/* Left Section - NSS Introduction */}
        <div className="nss-box">
          <h2 className="nss-title">Welcome to the National Service Scheme</h2>
          <p className="nss-text">
            The National Service Scheme (NSS) is an Indian government-sponsored
            public service program conducted by the Ministry of Youth Affairs
            and Sports of the Government of India.
          </p>
          <p className="nss-text">
            Popularly known as NSS, the scheme was launched in Gandhiji's
            Centenary year, 1969. Aimed at developing students' personality
            through community service.{" "}
            <strong className="nss-highlight">
              The motto of NSS is "Not Me, But You".
            </strong>
          </p>
        </div>

        {/* Right Section - Objectives */}
        <div className="nss-box">
          <h2 className="nss-title">Our Objectives</h2>
          <ul className="nss-list">
            <li>To understand the community in which they work.</li>
            <li>To understand themselves in relation to their community.</li>
            <li>
              To identify the needs and problems of the community and involve
              them in problem-solving.
            </li>
            <li>
              To develop among themselves a sense of social and civic
              responsibility.
            </li>
            <li>
              To utilize their knowledge in finding practical solutions to
              community problems.
            </li>
            <li>To gain skills in mobilizing community participation.</li>
            <li>To acquire leadership qualities and democratic attitudes.</li>
            <li>
              To develop the capacity to meet emergencies and natural disasters.
            </li>
            <li>To practice national integration and social harmony.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NSSContent;
