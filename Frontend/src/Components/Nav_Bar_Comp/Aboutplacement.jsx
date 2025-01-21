import React from "react";
import "./Aboutplacement.css";

const Aboutplacement = () => {
  return (
    <div className="AP-main-container">
      {/* Top Section with Vision and Mission */}
      <section className="AP-vision-mission">
        <div className="AP-grid">
          <div className="AP-grid-item">
            <div className="AP-card">
              <h2 className="AP-card-title">Our Vision</h2>
              <p className="AP-card-text">
              Department of Training & Placement aims to educate, advise, and connect students to opportunities for their career growth in order to foster their intellectual, social, and personal transformations.
              </p>
            </div>
          </div>
          <div className="AP-grid-item">
            <div className="AP-card">
              <h2 className="AP-card-title">Our Mission</h2>
              <p className="AP-card-text"> The department focuses on bringing the most relevant professional opportunities for the learners through various initiatives and activities.</p></div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="AP-about-section">
        <div className="AP-about-content">
          <div className="AP-about-text">
            <h2 className="AP-about-title">Training & Placement Department</h2>
            <p className="AP-about-paragraph">
        Our faculties are true professionals who have the capacity to raise incisive, difficult and sometimes uncomfortable questions that become potential GAME CHANGER. Our Faculty members consider teaching and training of new generation of graduate students as their highest calling.

            </p>
          </div>

        </div>
      </section>

      {/* Contact Section */}
      <section className="AP-contact-section">
        <div className="AP-contact-wrapper">
          <div className="AP-contact-header">
            <h2>Contact Placement Cell</h2>
          </div>
          <div className="AP-contact-details">
            <div className="AP-contact-info">
              <h3 className="AP-contact-name">Arun Ramaswami A</h3>
              <p>Head of Placement and Training</p>
              <p>
                <strong>Email:</strong> placement@velammal.edu.in
              </p>
              <p>
                <strong>Phone:</strong> 9940127839 / 9444008233
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Aboutplacement;