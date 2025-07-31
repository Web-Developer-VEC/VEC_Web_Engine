import React, { useState, useEffect } from "react";
import "./PhdAdmission.css";
import point from "../../Assets/points.png";
import { GiConvergenceTarget } from "react-icons/gi";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";

 


const PhdAdmission = ({theme, toggle}) => {

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

  return (
    <>
      <Banner toggle={toggle} theme={theme}
        backgroundImage="./Banners/admissionbanner.webp"
        headerText="Phd admission"
        subHeaderText="Empowering the next generation of leaders through access to world-class education and opportunities."
      />
      <div class="phd">
        <div className="contain">
          <div className="p-4 left1 border-l-4 border-[#fdcc03] dark:border-drks rounded-xl
            bg-[color-mix(in_srgb,theme(colors.secd)_10%,white)]
            dark:bg-drkb">
            <h1 className="phd-h1 text-brwn dark:text-drkt">
              In Velammal Engineering College the following departments are
              recognized research centers of Anna University, Chennai
            </h1>
            <span className="phd-dep">
              <p>
                <img src={point} alt="" className="phd-logo dark:invert" />
                Computer Science and Engineering
              </p>
              <p>
                <img src={point} alt="" className="phd-logo dark:invert" />
                Information Technology
              </p>
              <p>
                <img src={point} alt="" className="phd-logo dark:invert" />
                Electronics and Communication Engineering
              </p>
              <p>
                <img src={point} alt="" className="phd-logo dark:invert" />
                Electrical and Electronics Engineering
              </p>
              <p>
                <img src={point} alt="" className="phd-logo dark:invert" />
                Mechanical Engineering
              </p>
              <p>
                <img src={point} alt="" className="phd-logo dark:invert" />
                Physics
              </p>
              <p>
            <span className="ml-[8px]">
                  (Visit{" "}
                  <a href="https://cfr.annauniv.edu/research/academics/index.php" target="_blank" className="dark:text-drka">
                  https://cfr.annauniv.edu/research/academics/index.php
                  </a>
                  )
                </span>
                </p>
            </span>
          
          </div>

         
        </div>
       
      </div>
    </>
  );
};

export default PhdAdmission;
