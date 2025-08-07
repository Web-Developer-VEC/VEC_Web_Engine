import React, { useRef, useState } from "react";
import "slick-carousel/slick/slick.scss";
import "slick-carousel/slick/slick-theme.scss";
import styles from "./Achievements1.module.css";
import ZonalResults from "./ZonalResults";
import WinnerSlider from "./winners_sld";
import Achievements from "./achivements";
import Others from "./others";

import Slider from "react-slick";


import LoadComp from "../../LoadComp";

const Achievements1 = ({ data }) => {
  const [showZone, setShowZone] = useState("");
  const sectionRef = useRef(null);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };


  const settings = {
  dots: true,
  infinite: true,
  speed: 600,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3500,
  arrows: true,
};



  const handleZoneClick = (zoneType) => {
    setShowZone(zoneType);
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // ✅ Separate categories
  const zonalTableData = data?.find((item) => item.category === "zonal_table")?.content || [];
  const zoneWinnerData = data?.find((item) => item.category === "zone_winner")?.content || [];
  const interZonalData = data?.find((item) => item.category === "interzonal_achievements")?.content || [];
  const othersData = data?.find((item) => item.category === "others")?.content || [];

  const coordinator = data?.find((item) => item.category === "coordinator")?.content;

  return (
    <>
      {data ? (
        <>

          {coordinator && (
            <div className={`${styles.achievementsContainer}`}>
              <h2 className={styles.sportscoordinator}>Anna University Zone {coordinator?.zone}</h2>
              <p className={styles.coordinatordes}>Co-ordinating Centre {coordinator?.year}</p>

              <Slider
                {...settings}
                className="[&_.slick-prev]:text-xs [&_.slick-next]:text-xs [&_.slick-prev]:w-6 [&_.slick-next]:w-6"
              >
                {coordinator?.image_path?.map((item, index) => (
                  <div key={index} className={styles.slide}>
                    <img src={UrlParser(item)} alt={`Coordinator ${index + 1}`} className={"m-auto"} />
                  </div>
                ))}
              </Slider>
            </div>
          )}

          <div className={styles.sportsAchievementsclass}>
            <button
              className={`${styles.sportsAchievementsbutton} ${showZone === "zone" ? styles.active : ""}`}
              onClick={() => handleZoneClick("zone")}
            >
              Zone
            </button>
            <button
              className={`${styles.sportsAchievementsbutton} ${showZone === "interzone" ? styles.active : ""}`}
              onClick={() => handleZoneClick("interzone")}
            >
              Inter Zone
            </button>
            <button
              className={`${styles.sportsAchievementsbutton} ${showZone === "others" ? styles.active : ""}`}
              onClick={() => handleZoneClick("others")}
            >
              Others
            </button>
          </div>

          <div ref={sectionRef}>
            {showZone === "zone" ? (
              <div className="sport-zone-container mb-10">
                <ZonalResults data={zonalTableData} />
                <WinnerSlider data={zoneWinnerData} />
              </div>
            ) : showZone === "interzone" ? (
              <div className="sport-zone-container mb-10">
                <Achievements data={interZonalData} />
              </div>
            ) : showZone === "others" ? (
              <div className="sport-zone-container mb-10">
                <Others data={othersData} />
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp />
        </div>
      )}
    </>
  );
};

export default Achievements1;