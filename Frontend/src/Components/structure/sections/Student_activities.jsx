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



const ImageCarousel = ({data}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  console.log("Stu",data);
  const images = data?.images || [];
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === data?.images?.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? data?.images?.length - 1 : prevIndex - 1
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
          <i className="inline-block mr-2 mb-1" /> students achievements
        </h1>
        <p className="intro-text"> {data.content}</p>
          
      </div>
        <div className="carousel-wrapper">
          <div 
            className="carousel-slides"
            style={{ transform: `translateX(-${currentIndex * 100}%)`,display: 'flex', // Ensure items are aligned horizontally
            transition: 'transform 0.3s ease',}}
          >
            {data?.images?.map((item, index) => (
              <div
                key={index}
                className="carousel-slide"
                style={{ left: `${index * 100}%` }}
              >
                <img
                  src={item.image_path}
                  alt={item.event_name}        //image title is image_content in db change it to event_name
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
            {data?.images?.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`dot ${index === currentIndex ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>

        <div className="description-box">
          <h2 className="description-title">{images[currentIndex]?.event_name}</h2>    {/*image title is image_content in db change it to event_name*/}
          <p className="description-text">{images[currentIndex]?.image_content}</p>          {/*image content is image_name in db change it to image_content*/}
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;
