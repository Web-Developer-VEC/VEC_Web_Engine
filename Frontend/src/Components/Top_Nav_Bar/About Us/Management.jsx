import React from "react";
import './Management.css';
import Banner from "../../Banner";

function Management({ theme, toggle }) {

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

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
              <p>At Velammal Engineering College, we are driven by a singular vision—to cultivate a generation of forward-thinking professionals who are not only adept in their technical expertise but also embody the values of integrity, innovation, and global responsibility. Since our inception in 1995-96, we have remained steadfast in our commitment to academic excellence, fostering an ecosystem where knowledge meets application, and ambition meets opportunity. <br />
                In a rapidly evolving world shaped by technological advancements and dynamic industry landscapes, we prepare our students to excel at the highest levels. Our curriculum is meticulously designed to bridge the gap between academia and industry, ensuring that our graduates emerge as future-ready leaders. Beyond academics, we place immense emphasis on holistic development, encouraging our students to cultivate critical thinking, creativity, and a global perspective. <br />
                As you embark on this transformative journey with us, I invite you to embrace the wealth of opportunities that await you. Together, let us shape a future that is driven by knowledge, guided by values, and defined by excellence. <br />
              </p>
            </div>

            <div className="FCP-image-container">
              <img src={UrlParser('static/images/trust/muthuramalingam.jpg')} alt="Founder's Image" />
            </div>
          </div>
        </div>

        {/* CEO Message Section */}
        <div className="FCP-message-section FCP-ceo-section bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]">
          <h2 className="FCP-section-title">CEO MESSAGE</h2>

          <div className="FCP-content-container">
            <div className="FCP-image-container">
              <img src={UrlParser('static/images/trust/velmurugan.jpg')} alt="CEO's Image" />
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
          <h2 className="FCP-section-title">DEPUTY CEO MESSAGE</h2>

          <div className="FCP-content-container">

            <div className="FCP-text-container">
              <p>
              Dear Students, Faculty, and Visitors,
              It is my pleasure to welcome you to Velammal Engineering College, a hub of innovation, learning, and excellence in engineering education. At Velammal Engineering College, we are committed to nurturing the next generation of engineers by providing a dynamic academic environment, industry-relevant skills, and opportunities for real-world problem-solving. <br />
              In today’s fast-evolving technological landscape, our mission is to equip students with not only technical expertise but also critical thinking, leadership, and adaptability. We collaborate closely with industry leaders to ensure our curriculum remains cutting-edge, offering hands-on experience through internships, research projects, and skill-enhancement programs. <br />
              Our dedicated faculty, state-of-the-art infrastructure, and student-centric approach create an ecosystem where knowledge meets application. Whether you are an aspiring engineer or an academic enthusiast, you will find Velammal Engineering College to be a place that inspires creativity, innovation, and success. <br />
              I invite you to explore our website and learn more about the opportunities we offer. Together, let us build a future where technology serves humanity and engineering drives progress.
              </p>
            </div>
            <div className="FCP-image-container">
              <img src={UrlParser('static/images/trust/deptyceo.jpg')} alt="deputy ceo Image" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Management;
