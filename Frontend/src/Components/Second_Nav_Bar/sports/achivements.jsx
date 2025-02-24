import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import styles from "./Achievements.module.css";

const Achievements = ({data}) => {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {

    const formattedData = data?.image_path?.map((image, index) => ({
      id: index + 1,
      text: data?.title[index],
      image: image
    }));

    setAchievements(formattedData);
  }, [data]);

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
      <h2 className={styles.sportsachievement}>Achievements</h2>
      <Slider {...settings}>
        {achievements?.map((item) => (
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