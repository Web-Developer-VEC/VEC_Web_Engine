import React, { useEffect, useState } from "react";
import './Management.css';
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";

function Management({ theme, toggle }) {

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
          window.removeEventListener("online", handleOnline);
          window.removeEventListener("offline", handleOffline);
      };
  }, []);

  if (!isOnline) {
      return (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp txt={"You are offline"} />
        </div>
      );
  }

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
              <p>At Velammal Engineering College, our vision is to nurture forward-thinking professionals who excel in technical expertise while embodying integrity, innovation, and global responsibility. Since our establishment in 1995-96, we have remained steadfast in our commitment to academic excellence, bridging the gap between knowledge and real-world application. In an era of rapid technological change, we ensure our students are industry-ready through a curriculum that blends theory with hands-on learning. Beyond academics, we emphasize holistic development, fostering critical thinking, creativity, and a global perspective. As you embark on this transformative journey, embrace the opportunities ahead and strive for excellence in all endeavors.
              </p>
            </div>

            <div className="FCP-image-container">
              <img src={UrlParser('static/images/trust/muthuramalingam.webp')} alt="Founder's Image" className="founder"/>
            </div>
          </div>
        </div>

        {/* CEO Message Section */}
        <div className="FCP-message-section FCP-ceo-section bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]">
          <h2 className="FCP-section-title">CEO MESSAGE</h2>

          <div className="FCP-content-container">
            <div className="FCP-image-container">
              <img src={UrlParser('static/images/trust/velmurugan.webp')} alt="CEO's Image" />
            </div>

            <div className="FCP-text-container">
              <p>
              At Velammal Engineering College, we empower students to innovate, lead, and excel in a dynamic global environment. Our approach integrates academic rigor with practical insights, fostering critical thinking and adaptability. We are committed to continuous learning and technological advancement, shaping professionals who are prepared for the future. Our institution nurtures a culture of resilience, ethics, and innovation, ensuring every individual thrives. With industry collaborations and experiential learning opportunities, we prepare our students to meet the demands of a competitive world. Join us in our pursuit of transformative education and a future driven by excellence.

              </p>
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
              Dear Students, Faculty, and Visitors, <br /><br />
              It is my pleasure to welcome you to Velammal Engineering College, a hub of learning, innovation, and excellence. Our mission is to equip students with technical expertise, leadership skills, and adaptability to excel in today’s evolving technological landscape. Through close industry collaborations, we offer a curriculum that provides hands-on experience, internships, and research opportunities. Our dedicated faculty, state-of-the-art infrastructure, and student-focused approach create an ecosystem where knowledge meets application. Whether you are an aspiring engineer or an academic enthusiast, you will find an environment that fosters creativity and success. Together, let us build a future where technology drives progress and innovation serves humanity.
              </p>
            </div>
            <div className="FCP-image-container">
              <img src={UrlParser('static/images/trust/deptyceo.webp')} alt="deputy ceo Image" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Management;
