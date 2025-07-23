import React, { useState, useEffect } from 'react';
import './ScrollUp.css';
import { FaArrowUp } from 'react-icons/fa';

const ScrollUp = () => {
  const [visible, setVisible] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const toggleVisibility = () => {
    if (window.scrollY > 200) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (showPopup) {
      // create script
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src = "https://widgets.in6.nopaperforms.com/emwgts.js";
      document.body.appendChild(script);

      // optional cleanup
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [showPopup]);
  

  return (
    <>
      <a href="https://admission.velammal.edu.in/" target="_blank" rel="noopener noreferrer" className="appluBtn appluBtn_right vertcalview-1"> APPLY NOW </a>

      <button id="enquireNowBtn" className="enquire-now-btns vertcalview" onClick={() => setShowPopup(true)}>Enquire Now !</button>

      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-container">
            <div className="popup-form overflow-y-hidden" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setShowPopup(false)}>×</button>
              <h3>Enquiry Form</h3>
              
              {/* Meritto widget */}
              <div
                className="npf_wgts"
                data-height="600px"
                data-w="d02ddb01842d3a68af775b7317d66f21"
              ></div>
            </div>
          </div>
        </div>
      )}

      {visible && (
        <button className="scroll-up-btn" onClick={scrollToTop}>
          <FaArrowUp />
        </button>
      )}
    </>
  );
};

export default ScrollUp;