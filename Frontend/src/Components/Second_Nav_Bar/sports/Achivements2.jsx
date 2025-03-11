import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import styles from "./Achievements1.module.css";


const Achievements1 = ({data}) => {
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

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  return (
    <div className={`${styles.achievementsContainer}`}>
      <h2 className={styles.sportscoordinator}>
        Anna University Zone {data?.zone}
      </h2>
      <p className={styles.coordinatordes}>Co-ordinating Centre {data?.year}</p>
      <Slider
        {...settings}
        className=" [&_.slick-prev]:text-xs [&_.slick-next]:text-xs [&_.slick-prev]:w-6 [&_.slick-next]:w-6"
      >
        {data?.image?.map((item) => (
          <div key={item.id} className={styles.slide}>
            <img src={UrlParser(item)} alt="Achievement" className={styles.image} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Achievements1;
