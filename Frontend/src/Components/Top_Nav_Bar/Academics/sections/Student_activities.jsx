import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Student_activities.css';

const ImageCarousel = ({ data }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = data?.images || [];

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  // Reset to first slide when new data arrives
  useEffect(() => {
    if (images.length > 0) {
      setCurrentIndex(0);
    }
  }, [images]);

  // Auto-play functionality
  useEffect(() => {
    if (images.length === 0) return; // Don't start interval if no images

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [images]); // Restart when images change

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  return (
    <div className="carousel-container">
      {images.length > 0 ? (
        <>
          {/* 🔹 Section Heading */}
          <div className="intro-section bg-prim dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]">
            <h1 className="intro-title text-accn dark:text-drka">
              <i className="inline-block mr-2 mb-1" /> Student Achievements
            </h1>
            <p className="intro-text-act text-text dark:text-drkt">{data.content}</p>
          </div>

          {/* 🔹 Carousel Wrapper */}
          <div className="carousel-wrapper">
            <div
              className="carousel-slides"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
                display: 'flex',
                transition: 'transform 0.3s ease',
              }}
            >
              {images.map((item, index) => (
                <div key={index} className="carousel-slide" style={{ left: `${index * 100}%` }}>
                  <img
                    src={UrlParser(item.image_path)}
                    alt={item.event_name} // Changed from image_content to event_name
                    className="carousel-image"
                  />
                </div>
              ))}
            </div>

            {/* 🔹 Navigation Buttons */}
            <button onClick={prevSlide} className="nav-button prev-button">
              <ChevronLeft className="nav-icon" />
            </button>
            <button onClick={nextSlide} className="nav-button next-button">
              <ChevronRight className="nav-icon" />
            </button>

            {/* 🔹 Dots for Navigation */}
            <div className="dots-container">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`dot ${index === currentIndex ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>

          {/* 🔹 Image Description Box */}
          <div className="description-box bg-prim dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]">
            <h2 className="description-title text-accn dark:text-drka">{images[currentIndex]?.event_name || "No Title"}</h2>
            <p className="description-text-act">{images[currentIndex]?.image_content || "No Description"}</p>
          </div>
        </>
      ) : (
        <p className="no-content-message">No student achievements available.</p>
      )}
    </div>
  );
};

export default ImageCarousel;
