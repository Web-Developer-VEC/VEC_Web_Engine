import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Student_activities.css';
import { div } from 'framer-motion/client';
import {
  img1,
  img2,
  img3,
  img4,
  img5,
  img6,
  img7,
  img8,
  img9,
  img10,
  img11
}from "../../Assets/imsges"
const carouselData = [
  {
    imageUrl:img1,
    title: "AI&DS Department Paper Presentation (2nd Prize)",
    description: "III year students of the AI&DS department won second prize in the paper presentation held at Saveetha Engineering College on 23.08.24. Paper Title: 'Are Women Safe in India?'"
  },
  {
    imageUrl: img2,
    title: "AI&DS Department Paper Presentation (2nd Prize)",
    description: "III year students of our department won second prize in the paper presentation held at Saveetha Engineering College on 23.08.24. Paper Title: 'Preventing Fake Social Media Profiles and Reporting'."
  },
  {
    imageUrl: img3,
    title: "AI&DS Department Paper Presentation (1st Prize)",
    description: "III year students, Vasantha Raja and Roshan Varghese, won 1st prize in the Paper Presentation held at Saveetha Engineering College on 27/8/2024. They were awarded a trophy and a cash prize of Rs.1000."
  },
  {
    imageUrl: img4,
    title: "AI&DS Department IPL Auction Event",
    description: "II year student Tharun. M participated in the IPL Auction event conducted by the Mechanical Department of Velammal Engineering College and won First place with a prize of Rs.1500."
  },
  {
    imageUrl: img5,
    title: "Technoxian World Cup Participation",
    description: "AI&DS Department student T. Vishal Raj of Final year participated in the Maze Solver Challenge of Technoxian World Cup 2024, held at Noida Stadium Complex, Noida from 24th-27th August 2024."
  },
  {
    imageUrl: img6,
    title: "AI&DS Department Football Tournament",
    description: "AI&DS Department student Lokharajan of III year won third place in the football tournament conducted by Velammal Institute of Technology."
  },
  {
    imageUrl: img7,
    title: "CM Trophy Basketball Match",
    description: "AI&DS Department student Mugunthan Balaji from II year achieved Runner-up in the CM Trophy basketball match conducted at __________________."
  },
  {
    imageUrl: img8,
    title: "INNOTHON-24 Hackathon",
    description: "AI&DS Department students Pranesh Kumar, Siddarth, Sriram, Arjun, and Mohammed Yasir won First Place in the Hackathon (INNOTHON-24) conducted by KCG College of Engineering and won a cash prize of Rs.25000 on 21-9-2024."
  },
  {
    imageUrl: img9,
    title: "Zonal Level Volleyball Tournament",
    description: "AI&DS Department II year student Thamizhvendhan won 3rd place in the Zonal level volleyball tournament conducted by RMK Engineering College on 26-9-2024."
  },
  {
    imageUrl: img10,
    title: "Zonal Level Basketball Tournament",
    description: "AI&DS Department II year student Mugunthan Balaji won 2nd place in the Zonal level basketball tournament conducted by RMK Engineering College on 26-9-2024."
  },
  {
    imageUrl: img11,
    title: "Tamil Nadu Powerlifting Championship",
    description: "AI&DS Department student Mr. Dhiyaneshwar won 1st place in the Tamil Nadu Powerlifting Championship conducted by the Thiruvarur District Powerlifting Association on 27-9-2024."
  }
];


const ImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === carouselData.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? carouselData.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (

      <div className="carousel-container">
      <div className="carousel-container">
      <div className="intro-section">
        <h1 className="intro-title">
          <i className="inline-block mr-2 mb-1" /> Capture Nature's Beauty
        </h1>
        <p className="intro-text">
          Embark on a visual journey through some of Earth's most breathtaking landscapes. Our carefully curated collection showcases the raw beauty of nature, from majestic mountain ranges to serene beaches and mystical forests. Each image tells its own story, inviting you to pause and appreciate the wonderful diversity of our natural world. Scroll through these stunning photographs and let yourself be transported to these remarkable destinations.
        </p>
      </div>
        <div className="carousel-wrapper">
          <div 
            className="carousel-slides"
            style={{ transform: `translateX(-${currentIndex * 100}%)`,display: 'flex', // Ensure items are aligned horizontally
            transition: 'transform 0.3s ease',}}
          >
            {carouselData.map((item, index) => (
              <div
                key={index}
                className="carousel-slide"
                style={{ left: `${index * 100}%` }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="carousel-image"
                />
              </div>
            ))}
          </div>

          <button
            onClick={prevSlide}
            className="nav-button prev-button"
          >
            <ChevronLeft className="nav-icon" />
          </button>
          <button
            onClick={nextSlide}
            className="nav-button next-button"
          >
            <ChevronRight className="nav-icon" />
          </button>

          <div className="dots-container">
            {carouselData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`dot ${index === currentIndex ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>

        <div className="description-box">
          <h2 className="description-title">
            {carouselData[currentIndex].title}
          </h2>
          <p className="description-text">
            {carouselData[currentIndex].description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;
