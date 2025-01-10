import React from "react";
import "./Aboutplacement.css";

const Aboutplacement = () => {
  return (
    <div>
      {/* Vision and Mission Section */}
      <div className="AP-vision-and-mission">
        <h1>VISION AND MISSION</h1>
        <div className="AP-vision">
          <h2>VISION</h2>
          <p>
            Department of Training & Placement aims to educate, advise, and connect students to opportunities for their career growth in order to foster their intellectual, social, and personal transformations.
          </p>
        </div>
        <div className="AP-mission">
          <h2>MISSION</h2>
          <p>
            The department focuses on bringing the most relevant professional opportunities for the learners through various initiatives and activities.
          </p>
        </div>
      </div>
      <div className="AP-tr">
        <h1>Training & Placement Department</h1>
        <p>Our faculties are true professionals who have the capacity to raise incisive, difficult and sometimes uncomfortable questions that become potential GAME CHANGER. Our Faculty members consider teaching and training of new generation of graduate students as their highest calling.</p>
      </div>

      {/* Visiting Card Section */}
      <div className="AP-dynamic-card">
        <div className="AP-card-banner">
          <div className="AP-organization-logo"><strong>Placement contact</strong></div>
        </div>
        <div className="AP-card-content">
          <div className="AP-name">Arun Ramaswami A</div>
          <div className="AP-title">Head of Placement and Training</div>
          <div className="AP-contact-info">
            <div>
              <strong>Email:</strong> placement@velammal.edu.in
            </div>
            <div>
              <strong>Phone:</strong> 9940127839 / 9444008233
            </div>
            <div>
        
            </div>
          </div>
         
        </div>
      </div>
    </div>
  );
};

export default Aboutplacement;
