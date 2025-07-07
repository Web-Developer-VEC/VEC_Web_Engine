import React, { useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { FaRegCircleLeft, FaRegCircleRight } from "react-icons/fa6";
import "./Couroselnss.css";
import LoadComp from "../../LoadComp"

const CarouselNSS = ({ data }) => {
  const swiperRef = useRef(null);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.swiper.navigation.init();
      swiperRef.current.swiper.navigation.update();
    }
  }, []);

  const images = data?.image_path || [];
  const titles = data?.title || [];
  const dates = data?.date || [];

  if (!images.length) {
    return (
      <div className="text-center text-gray-600 mt-10">
        <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
        </div>
      </div>
    );
  }

  return (
    <div className="carouselnss-container">
      {/* Title with underline */}
      <h2 className="events-title uppercase text-brwn dark:text-drkt">Events</h2>
      <div className="w-[100px] h-0.5 bg-[#eab308] mx-auto mb-10 mt-1 rounded"></div>

      <Swiper
        ref={swiperRef}
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={4}
        loop={true}
        navigation={{
          nextEl: ".custom-next",
          prevEl: ".custom-prev",
        }}
        breakpoints={{
          1024: { slidesPerView: 4 },
          768: { slidesPerView: 3 },
          600: { slidesPerView: 2 },
          0: { slidesPerView: 1 },
        }}
      >
        {images.map((img, index) => (
          <SwiperSlide key={index}>
            <div className="carouselnss-card">
              <img
                src={UrlParser(img)}
                alt={titles[index] || "NSS Event"}
                className="carouselnss-image"
              />
              <div className="carouselnss-content">
                <h3>{titles[index]}</h3>
                <p className="carouselnss-location text-brwn dark:text-drka">NSS VEC</p>
                <span className="carouselnss-date">{dates[index]}</span>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      <button className="swiper-button-prev custom-prev">
        <FaRegCircleLeft />
      </button>
      <button className="swiper-button-next custom-next">
        <FaRegCircleRight />
      </button>
    </div>
  );
};

export default CarouselNSS;
