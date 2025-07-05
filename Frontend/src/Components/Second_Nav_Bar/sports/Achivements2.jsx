import React, { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.scss";
import "slick-carousel/slick/slick-theme.scss";
import styles from "./Achievements1.module.css";
import ZonalResults from "./ZonalResults";
import WinnerSlider from "./winners_sld";
import Achievements from "./achivements";
import Others from "./others";
import LoadComp from "../../LoadComp"

const Achievements1 = ({ zonaltable , zonewinner , interzone , others , coordinator }) => {
  const [showZone, setShowZone] = useState("");

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    prevArrow: <div className={styles["slick-prev"]} />,
    nextArrow: <div className={styles["slick-next"]} />,
  };

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  return (
    <>
    {(zonaltable && zonewinner && interzone && others && coordinator) ? (
      <>
        <div className={`${styles.achievementsContainer}`}>
          <h2 className={styles.sportscoordinator}>Anna University Zone {coordinator?.zone}</h2>
          <p className={styles.coordinatordes}>Co-ordinating Centre {coordinator?.year}</p>

          <Slider {...settings} className=" [&_.slick-prev]:text-xs [&_.slick-next]:text-xs [&_.slick-prev]:w-6 [&_.slick-next]:w-6">
            {coordinator?.image?.map((item) => (
              <div key={item.id} className={styles.slide}>
                <img src={UrlParser(item)} alt="Achievement" className={styles.image} />
              </div>
            ))}
          </Slider>
        </div>

        <div className={styles.sportsAchievementsclass}>
          <button
            className={`${styles.sportsAchievementsbutton} ${showZone === "zone" ? styles.active : ""}`}
            onClick={() => setShowZone("zone")}
          >
            Zone
          </button>
          <button
            className={`${styles.sportsAchievementsbutton} ${showZone === "interzone" ? styles.active : ""}`}
            onClick={() => setShowZone("interzone")}
          >
            Inter Zone
          </button>
          <button
            className={`${styles.sportsAchievementsbutton} ${showZone === "others" ? styles.active : ""}`}
            onClick={() => setShowZone("others")}
          >
            Others
          </button>
        </div>


        {showZone === "zone" ? (
          <div className="sport-zone-container mb-10">
            <ZonalResults data={zonaltable} />
            <WinnerSlider data={zonewinner} />
          </div>
        ) : showZone === "interzone" ? (
          <div className="sport-zone-container mb-10">
            <Achievements data={interzone} />
          </div>
        ) : showZone === "others" ? (
          <div className="sport-zone-container mb-10">
            <Others data={others} />
          </div>
        ) : null}
      </>
    ) : (
        <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
        </div>
    )}
    </>
  );
};

export default Achievements1;
