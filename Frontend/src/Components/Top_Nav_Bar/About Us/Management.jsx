import React from "react";
import './Management.css';
import Banner from "../../Banner";

function Management({ theme, toggle }) {
  return (
    <>
      <Banner 
        toggle={toggle} 
        theme={theme}
        backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
        headerText="Management"
        subHeaderText="Leading with vision, fostering innovation, and inspiring integrity at every step."
      />

      <div className={`FCP-message-container ${theme === 'dark' ? 'dark-theme' : ''}`}>
        {/* Founder Message Section */}
        <div className="FCP-message-section FCP-founder-section">
          <h2 className="FCP-section-title">FOUNDER MESSAGE</h2>

          <div className="FCP-content-container bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]">
            <div className="FCP-text-container">
              <p>
                As Founder - Chairman of the Velammal group of institutions, it is indeed a unique privilege for me to
                communicate to you utilizing our college website. Velammal Engineering College was established in the year
                1995-96 to impart quality education...
              </p>
              <strong className="FCP-vision-text">
                "TO EDUCATE THE STUDENT COMMUNITY BOTH BY THEORY AND PRACTICE TO FIT IN WITH SOCIETY..."
              </strong>
              <p>          Every year, all our institutions maintain the set trend by achieving 100% pass results, and in the process
              secure overall State Ranks, Subject State Rank marks, etc. Our performance in academics is indeed
              praiseworthy, yet we do not tend to overlook co-curricular activities as well. Most of us are aware of the
              vital fact that of late, students are expected to fully equip themselves such that they are able to face
              the rigors of life at the global level. No doubt, the Trust spares no efforts, whatsoever, in this
              particular direction. We ensure that our students are well acquainted with personalities representing
              nearly all walks of life by utilizing their very presence as a motivating factor. In the past and at
              present too, the Trust honors students who excel in academics and sports with free education and suitable
              cash incentives as may be deemed necessary to encourage them to perform better. In a nutshell, I feel
              elated to state that all our students, on completion of their tenure in our group of institutions are
              molded into capable citizens of the morrow thereby, fulfilling the needs of their parents, society, and
              above all, represent their nation at the global level. It is only when they achieve this target do we sit
              back and fondly reminisce over our achievements and beyond doubt also be spurred to perform still better.
              Let me once again welcome you into our fold and hope you will also utilize this prized opportunity to its
              fullest extent to finally emerge as one of the brightest stars on the horizon of success. Wishing you all
              the best and hope you have a pleasant and memorable tenure in our midst.</p>
            </div>

            <div className="FCP-image-container">
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-YO8vr29GtvEkrJ5dSwPaInvJxPl1DDljKThuLGImnq0YPM2yR48hL6deJmg_KiROewk&usqp=CAU" alt="Founder's Image" />
            </div>
          </div>
        </div>

        {/* CEO Message Section */}
        <div className="FCP-message-section FCP-ceo-section bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]">
          <h2 className="FCP-section-title">CEO MESSAGE</h2>

          <div className="FCP-content-container">
            <div className="FCP-image-container">
              <img src="data:image/jpeg;base64,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" alt="CEO's Image" />
            </div>

            <div className="FCP-text-container">
              {/* <p>
                We are committed to providing quality education to enable the student community to achieve academic and
                professional excellence. We endeavor to upgrade the real-time academic competencies of students and
                educators through continual training, motivation, and active involvement.
              </p> */}
              <p>At Velammal Engineering College, we empower students to innovate and lead in a dynamic global environment.</p>
              <p>We blend academic rigor with real-world insights to foster critical thinking and practical skills.</p>
              <p>Our commitment to continuous learning and technological advancement shapes future-ready professionals.</p>
              <p>We nurture a community where every individual thrives through innovation, resilience, and ethical practice.</p>
              <p>Join us in our pursuit of excellence and transformative education.</p>
            </div>
          </div>
        </div>
        {/* Chairman Message */}
        <div className="FCP-message-section FCP-ceo-section bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]">
          <h2 className="FCP-section-title">CHAIRMAN MESSAGE</h2>

          <div className="FCP-content-container">

            <div className="FCP-text-container">
              <p>
              At Velammal Engineering College, we are driven by a singular vision—to cultivate a generation of forward-thinking professionals who are not only adept in their technical expertise but also embody the values of integrity, innovation, and global responsibility. Since our inception in 1995-96, we have remained steadfast in our commitment to academic excellence, fostering an ecosystem where knowledge meets application, and ambition meets opportunity.
              In a rapidly evolving world shaped by technological advancements and dynamic industry landscapes, we prepare our students to excel at the highest levels. Our curriculum is meticulously designed to bridge the gap between academia and industry, ensuring that our graduates emerge as future-ready leaders. Beyond academics, we place immense emphasis on holistic development, encouraging our students to cultivate critical thinking, creativity, and a global perspective.
              As you embark on this transformative journey with us, I invite you to embrace the wealth of opportunities that await you. Together, let us shape a future that is driven by knowledge, guided by values, and defined by excellence.
              </p>
            </div>
            <div className="FCP-image-container">
              <img src="data:image/jpeg;base64,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" alt="Chairman's Image" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Management;
