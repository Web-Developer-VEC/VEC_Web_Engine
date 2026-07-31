import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './sideButton.css';

const SideButton = () => {  // Changed from sideButton to SideButton
  const [showPopup, setShowPopup] = useState(false);
  const [sideButtons, setSideButtons] = useState({});
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responce = await axios.post('/api/main-backend/landing_page_data',
          {
            type: "side_buttons"
          }
        );

        setSideButtons(responce.data.data[0] || {});

      } catch (error) {
        console.error("Error fetching the landing page Data", error);
        if (error.response && error.response.data.status === 429) {
          navigate('/ratelimit', { state: { msg: error.response.data.message } })
        }
      }
    }

    fetchData();
  }, [navigate]);

  return (
    <>
    {sideButtons?.apply_button && (
      <a href="https://admission.velammal.edu.in/" target="_blank" rel="noopener noreferrer" className="appluBtn appluBtn_right vertcalview-1 no-underline"> APPLY NOW </a>
    )}

    {sideButtons?.enquire_button && (
      <button id="enquireNowBtn" className="enquire-now-btns vertcalview no-underline" onClick={() => setShowPopup(true)}>Enquire Now !</button>
    )}
  
    {showPopup && (
      <div className="popup-overlay" onClick={() => setShowPopup(false)}>
        <div className="popup-container mr-[20px] md:mr-[40px]">
          <div className="popup-form bg-prim dark:bg-drkp overflow-y-hidden" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn bg-prim dark:bg-drkb dark:text-drks" onClick={() => setShowPopup(false)}>×</button>
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
    </>
  );
};

export default SideButton;