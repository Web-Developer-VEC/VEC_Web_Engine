import React from "react";
import "./Aboutplacement.css";
import Banner from "../../Banner";

const Aboutplacement = ({ theme, toggle }) => {
  return (
    <>
      <Banner
        theme={theme}
        toggle={toggle}
        backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
        headerText="Placement Department"
        subHeaderText="Empowering students’ career success by connecting talent with industry leaders and opportunities."
      />

      <div className="AP-main-container">

        {/* Vision and Mission Section */}
        <section className="AP-grid">
          <div className="AP-card">
            <h2 className="AP-card-title">Our Vision</h2>
            <p className="AP-card-text">
              Department of Training & Placement aims to educate, advise, and connect students to opportunities for their career growth in order to foster their intellectual, social, and personal transformations.
            </p>
          </div>
          <div className="AP-card">
            <h2 className="AP-card-title">Our Mission</h2>
            <p className="AP-card-text">
              The department focuses on bringing the most relevant professional opportunities for the learners through various initiatives and activities.
            </p>
          </div>
        </section>

        {/* Training & Placement and Contact Section */}
        <section className="AP-grid">
          <div className="AP-card">
            <h2 className="AP-card-title">Training & Placement Department</h2>
            <p className="AP-card-text">
              Our faculties are true professionals who have the capacity to raise incisive, difficult, and sometimes uncomfortable questions that become potential GAME CHANGER. Our Faculty members consider teaching and training of new generation of graduate students as their highest calling.
            </p>
          </div>
          <div className="AP-card">
            <h2 className="AP-card-title">Contact Placement Cell</h2>
            <h3 className="AP-contact-name ">Head of Placement and Training</h3>
            <p><strong>✉️Email:</strong> placement@velammal.edu.in</p>
            <p><strong>📞Phone:</strong> 9940127839 / 9444008233</p>
          </div>
        </section>

      </div>
    </>
  );
};

export default Aboutplacement;