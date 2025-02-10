import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import styles from "./Achievements.module.css";

const achievements = [
  { id: 1, text: "Anna University Zonal Badminton (M) Third Place Match held at VEC", image: "/sports/achive1.png" },
  { id: 2, text: "Anna University Zonal Badminton (W) Runner Match held at VEC", image: "/sports/achive2.png" },
  { id: 3, text: "Anna University Zonal Basketball (W) Runner Match held at RMKEC", image: "/sports/achive3.png" },
  { id: 4, text: "Anna University Zonal Volleyball (M) Third Place Match held at RMKEC", image: "/sports/achive4.png" },
  { id: 5, text: "Anna University Zonal Basketball (M) Runner Match held at RMKEC", image: "/sports/achive5.png" },
  { id: 6, text: "Anna University Zonal Chess (M) Winner Match held at AMS Engg College", image: "/sports/achive6.png" },
  { id: 7, text: "Anna University Zonal Football (M) Third Place Match held at VIT", image: "/sports/achive7.png" },
  { id: 8, text: "Anna University Zonal Kabaddi (M) Winner Match held at VEC", image: "/sports/achive8.png" },
  { id: 9, text: "Anna University Zonal Table Tennis (M) Winner Match held at SAEC", image: "/sports/achive9.png" },
  { id: 10, text: "Anna University Zonal Table Tennis (W) Winner Match held at SAEC", image: "/sports/achive10.png" },
  { id: 11, text: "Anna University Zonal Hockey (M) Third Place Match held at VEC", image: "/sports/achive11.png" },
  { id: 12, text: "Anna University Zonal Kho Kho (M) Runner Match held at PRATHYUSHA", image: "/sports/achive12.png" },
  { id: 13, text: "Anna University Inter zone Boxing competition our college student Miss T. Keerthana Lakshmi of II year Civil secure Gold medal", image: "/sports/achive13.png" }
];

const Achievements = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    prevArrow: <div className={styles['slick-prev']} />,  // Custom prev button
    nextArrow: <div className={styles['slick-next']} />   // Custom next button
  };

  return (
    <div className={styles.achievementsContainer}>
      <h2 className="sports_achievement">Achievements</h2>
      <Slider {...settings}>
        {achievements.map((item) => (
          <div key={item.id} className={styles.slide}>
            <img src={item.image} alt="Achievement" className={styles.image} />
            <p className={styles.text}>{item.text}</p>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Achievements;
