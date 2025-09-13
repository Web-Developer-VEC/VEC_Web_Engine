import React, { useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { FaRegCircleLeft, FaRegCircleRight } from "react-icons/fa6";
import "./Corouselnavy.css";

const carouselItems = [
  {
    image: "https://via.placeholder.com/300",
    title: "EBSB DRDO Camp",
    location: "Annai Violet Arts and Science ...",
    date: "May 9, 2023",
  },
  {
    image: "https://via.placeholder.com/300",
    title: "Annual Sports Day",
    location: "Anna University, Chennai",
    date: "May 9, 2023",
  },
  {
    image: "https://via.placeholder.com/300",
    title: "Group Photo Session",
    location: "Anna University, Chennai",
    date: "May 7, 2023",
  },
  {
    image: "https://via.placeholder.com/300",
    title: "CATC cum IGC Firing Sel...",
    location: "3 (TN) Bn NCC Campus, Kancheep",
    date: "Apr 8, 2023",
  },
  {
    image: "https://via.placeholder.com/300",
    title: "National NCC Camp",
    location: "Delhi, India",
    date: "Mar 20, 2023",
  },
  {
    image: "https://via.placeholder.com/300",
    title: "Republic Day Parade",
    location: "Rajpath, New Delhi",
    date: "Jan 26, 2023",
  },
  {
    image: "https://via.placeholder.com/300",
    title: "Drill Practice Session",
    location: "Anna University, Chennai",
    date: "Feb 10, 2023",
  },
  {
    image: "https://via.placeholder.com/300",
    title: "NCC Trekking Camp",
    location: "Himalayas, India",
    date: "Dec 15, 2022",
  },
];

const CarouselNavy = () => {
  const swiperRef = useRef(null);

  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.swiper.navigation.init();
      swiperRef.current.swiper.navigation.update();
    }
  }, []);

  return (
    <div className="carouselnavy-container">
      {/* Title with underline */}
      <h2 className="events-title">Events</h2>
      <div className="events-underline"></div>

      <Swiper
        ref={swiperRef}
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={4} // Default for large screens
        loop={true}
        navigation={{
          nextEl: ".custom-next",
          prevEl: ".custom-prev",
        }}
        breakpoints={{
          1024: { slidesPerView: 4 }, // Desktop (4 images)
          768: { slidesPerView: 3 }, // Tablets (3 images)
          600: { slidesPerView: 2 }, // Mobile (2 images)
          0: { slidesPerView: 1 }, // Extra small screens (1 image)
        }}
      >
        {carouselItems.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="carouselnavy-card">
              <img
                src={item.image}
                alt={item.title}
                className="carouselnavy-image"
              />
              <div className="carouselnavy-content">
                <h3>{item.title}</h3>
                <p className="carouselnavy-location">{item.location}</p>
                <span className="carouselnavy-date">{item.date}</span>
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

export default CarouselNavy;
