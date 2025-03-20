import React, { useEffect, useState } from "react";
import './Orgainzation_chart.css'; // Ensure the CSS file includes necessary styles
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";

const CollegeOrgChart = ({theme, toggle}) => {

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
          backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
          headerText="Organization Chart"
          subHeaderText="A clear framework for success, aligning teams and leaders toward shared goals and growth."
        />

        <div className="org-chart-container">
          <img
            src={UrlParser('static/images/orgchart/chart.jpg')} 
            alt="Organization Chart"
            className="org-chart-image"
          />
        </div>
      </>
    );
};

export default CollegeOrgChart;
