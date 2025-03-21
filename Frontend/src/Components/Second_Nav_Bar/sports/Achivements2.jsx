import React, { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.scss";
import "slick-carousel/slick/slick-theme.scss";
import styles from "./Achievements1.module.css";
import ZonalResults from "./ZonalResults";
import WinnerSlider from "./winners_sld";
import Achievements from "./achivements";
import Others from "./others";

const Achievements1 = ({ data }) => {
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

  const winner = {
    "Game": [
      "Badminton(M)",
      "Badminton(W)",
      "Chess(M)",
      "Table Tennis(W)",
      "Table Tennis(M)",
      "Basketball(M)",
      "Basketball(W)",
      "HOCKEY(M)",
      "Kho-Kho(M)",
      "FootBall(M)",
      "Kabaddi(M)",
      "Volleyball(M)"
    ],
    "Position": [
      "Third",
      "Runner",
      "Winner",
      "Winner",
      "Winner",
      "Runner",
      "Runner",
      "Third",
      "Runner",
      "Third",
      "Winner",
      "Third"
    ]
  };

  const slide = {
    title: [
      "Anna University Zonal Badminton (M) Third Place Match held at VEC",
      "Anna University Zonal Badminton (W) Runner Match held at VEC",
      "Anna University Zonal Chess (M) Winner Match held at AMS Engg College",
      "Anna University Zonal Table Tennis (W) Winner Match held at SAEC",
      "Anna University Zonal Table Tennis (M) Winner Match held at SAEC",
      "Anna University Zonal Basketball (M) Runner Match held at RMKEC",
      "Anna University Zonal Basketball (W) Runner Match held at RMKEC",
      "Anna University Zonal Hockey (M) Third Place Match held at VEC",
      "Anna University Zonal Kho Kho (M) Runner Match held at PRATHYUSHA",
      "Anna University Zonal Football (M) Third Place Match held at VIT",
      "Anna University Zonal Kabaddi (M) Winner Match held at VEC",
      "Anna University Zonal Volleyball (M) Third Place Match held at RMKEC",
    ],
    image_path: [
      "https://imgs.search.brave.com/QC2EeNRDo0eCWEZmc1P7lzWTr6UHZncFy5UK2yZ08lQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGFy/c3VuZm9sZGVkLmNv/bS93cC1jb250ZW50/L3VwbG9hZHMvMjAy/Mi8xMC9HUC1NdXRo/dS1pbi1CaWdnLUJv/c3MtVGFtaWwtc2Vh/c29uLTYuanBn",
      "https://imgs.search.brave.com/NqQGSP_mKXooMuXRxiJYdn8yANrUNhBZBkJ2t9-YKvA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMuanVzdHdhdGNo/LmNvbS9iYWNrZHJv/cC8zMDg3OTkxNjYv/czY0MC9iZW4tMTA",
      "/static/images/zonal_data/3.jpeg",
      "/static/images/zonal_data/4.jpeg",
      "/static/images/zonal_data/5.jpeg",
      "/static/images/zonal_data/6.jpeg",
      "/static/images/zonal_data/7.jpeg",
      "/static/images/zonal_data/8.jpeg",
      "/static/images/zonal_data/9.jpeg",
      "/static/images/zonal_data/10.jpeg",
      "/static/images/zonal_data/11.jpeg",
      "/static/images/zonal_data/12.jpeg",
    ],
  };

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  return (
    <>
      <div className={`${styles.achievementsContainer}`}>
        <h2 className={styles.sportscoordinator}>Anna University Zone {data?.zone}</h2>
        <p className={styles.coordinatordes}>Co-ordinating Centre {data?.year}</p>

        <Slider {...settings} className=" [&_.slick-prev]:text-xs [&_.slick-next]:text-xs [&_.slick-prev]:w-6 [&_.slick-next]:w-6">
          {data?.image?.map((item) => (
            <div key={item.id} className={styles.slide}>
              <img src={UrlParser(item)} alt="Achievement" className={styles.image} />
            </div>
          ))}
        </Slider>
      </div>

      {/* Three buttons outside the achievementsContainer div */}
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
          <ZonalResults data={winner} />
          <WinnerSlider data={slide} />
        </div>
      ) : showZone === "interzone" ? (
        <div className="sport-zone-container mb-10">
          <Achievements data={slide} />
        </div>
      ) : showZone === "others" ? (
        <div className="sport-zone-container mb-10">
          <Others data={slide} />
        </div>
      ) : null}
    </>
  );
};

export default Achievements1;
