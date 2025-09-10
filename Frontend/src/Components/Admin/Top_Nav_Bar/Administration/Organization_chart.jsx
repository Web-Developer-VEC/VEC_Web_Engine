import React, { useEffect, useState } from "react";
import './Orgainzation_chart.css'; // Ensure the CSS file includes necessary styles
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import axios from "axios";
import { useNavigate } from "react-router";


const CollegeOrgChart = ({theme, toggle}) => {
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [orgChart, setOrgData] = useState(null);
  
  const [isOpen,setIsOpen] = useState(false);
  const navigate = useNavigate();
  const handleOpen = () => setIsOpen(true)
  const handleClose = () => setIsOpen(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responce = await axios.post('/api/main-backend/administration',
          {
            type: "organization_chart"
          }
        );
        const data = responce.data.data;
        setOrgData(data.image_path);
      } catch (error) {
        console.error("Error fetching organization chart Linnk",error);
        if (error.response.data.status === 429) {
          navigate('/ratelimit', { state: { msg: error.response.data.message}})
        } 
      }
    }

    fetchData();
  })

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
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
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
        <Banner toggle={toggle} theme={theme}
          backgroundImage="./Banners/administrationbanner.webp"
          headerText="Organization Chart"
          subHeaderText="A clear framework for success, aligning teams and leaders toward shared goals and growth."
        />
        {orgChart ? (
          <>
            <div className="org-chart-container">
              <img
                src={UrlParser(orgChart)} 
                alt="Organization Chart"
                className="org-chart-image"
                onClick={handleOpen}
              />
            </div>
          <div className="zoomable-image">
            {isOpen && (
            <div className="modal-overlay" onClick={handleClose}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={handleClose}>×</button>
                <div
                  className="zoom-container"
                  style={{
                    overflow: 'hidden',
                    touchAction: 'none',
                    width: '100%',
                    height: 'auto',
                    position: 'relative',
                  }}
                >
                  <img
                    src={UrlParser(orgChart)}
                    alt="Organization Chart"
                    className="zoomable-image"
                    style={{
                      width: '300px',
                      height: '230px',
                      touchAction: 'none',
                      transformOrigin: 'center center',
                      position: 'relative',
                      transition: 'transform 0.3s ease',
                    }}
                    onTouchStart={(e) => {
                      const img = e.target;
                      const now = new Date().getTime();
                      const lastTap = parseInt(img.dataset.lastTap || '0', 10);
                      const tapGap = now - lastTap;

                
                      if (tapGap < 300 && parseFloat(img.dataset.scale || '1') > 1) {
                        img.dataset.scale = '1';
                        img.dataset.currentScale = '1';
                        img.dataset.translateX = '0';
                        img.dataset.translateY = '0';
                        img.dataset.lastTranslateX = '0';
                        img.dataset.lastTranslateY = '0';
                        img.style.transform = `scale(1) translate(0px, 0px)`;
                        img.dataset.lastTap = now.toString();
                        return;
                      } else {
                        img.dataset.lastTap = now.toString();
                      }

                      // ✅ Handle pinch start
                      if (e.touches.length === 2) {
                        const dist = Math.hypot(
                          e.touches[1].pageX - e.touches[0].pageX,
                          e.touches[1].pageY - e.touches[0].pageY
                        );
                        img.dataset.startDist = dist.toString();
                        img.dataset.scale = parseFloat(img.dataset.scale || '1').toString();
                      }

                      // ✅ Handle pan start
                      else if (e.touches.length === 1 && parseFloat(img.dataset.scale || '1') > 1) {
                        img.dataset.startX = e.touches[0].pageX;
                        img.dataset.startY = e.touches[0].pageY;
                        img.dataset.lastTranslateX = img.dataset.lastTranslateX || '0';
                        img.dataset.lastTranslateY = img.dataset.lastTranslateY || '0';
                      }
                    }}

                    onTouchMove={(e) => {
                      const img = e.target;
                      if (e.touches.length === 2 && img.dataset.startDist) {
                        e.preventDefault();
                        const newDist = Math.hypot(
                          e.touches[1].pageX - e.touches[0].pageX,
                          e.touches[1].pageY - e.touches[0].pageY
                        );
                        const scale = Math.min(
                          3,
                          Math.max(1, (newDist / parseFloat(img.dataset.startDist)) * parseFloat(img.dataset.scale || '1'))
                        );
                        img.dataset.currentScale = scale.toString();
                        img.style.transform = `scale(${scale}) translate(${img.dataset.lastTranslateX || 0}px, ${img.dataset.lastTranslateY || 0}px)`;
                      } else if (e.touches.length === 1 && parseFloat(img.dataset.currentScale || img.dataset.scale || '1') > 1) {
                        e.preventDefault();
                        const currentX = e.touches[0].pageX;
                        const currentY = e.touches[0].pageY;
                        const startX = parseFloat(img.dataset.startX || currentX);
                        const startY = parseFloat(img.dataset.startY || currentY);
                        const deltaX = currentX - startX;
                        const deltaY = currentY - startY;
                        const sensitivity = 0.5;

                        const translateX = parseFloat(img.dataset.lastTranslateX || '0') + deltaX * sensitivity;
                        const translateY = parseFloat(img.dataset.lastTranslateY || '0') + deltaY * sensitivity;

                        img.dataset.translateX = translateX.toString();
                        img.dataset.translateY = translateY.toString();

                        const scale = parseFloat(img.dataset.currentScale || img.dataset.scale || '1');
                        img.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
                      }
                    }}

                    onTouchEnd={(e) => {
                      const img = e.target;
                      if (img.dataset.currentScale) {
                        img.dataset.scale = img.dataset.currentScale;
                      }
                      if (img.dataset.translateX && img.dataset.translateY) {
                        img.dataset.lastTranslateX = img.dataset.translateX;
                        img.dataset.lastTranslateY = img.dataset.translateY;
                      }
                      img.dataset.startDist = null;
                      img.dataset.startX = null;
                      img.dataset.startY = null;
                    }}
                  />
                </div>
              </div>
            </div>
            )}
          </div>
          </>
        ) : (
          <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
            <LoadComp txt={""} />
          </div>
        )}

       
      </>
    );
};


export default CollegeOrgChart;
