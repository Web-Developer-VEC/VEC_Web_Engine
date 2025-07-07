import React, { useState, useEffect } from "react";
import "./NSSCarousel.css"; // Import the CSS file

const NSSCarousel = ({ data }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const images = data?.image_path || [];
  const titles = data?.title || [];
  const dates = data?.date || [];

  // Auto slide
  useEffect(() => {
    if (isAutoPlay) {
      const interval = setInterval(() => {
        nextSlide();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [currentIndex, isAutoPlay]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!images.length) {
    return <p className="text-center text-gray-500">No event data available.</p>;
  }

  return (
    <div className="nss-carousel-wrap relative overflow-hidden">
      <div
        className="nss-carousel-container flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)`, width: `${images.length * 100}%` }}
      >
        {images.map((image, index) => (
          <div className="nss-carousel-slide w-full flex-shrink-0 text-center" key={index}>
            <img
              src={UrlParser(image)}
              alt={titles[index]}
              className="w-full h-64 object-cover"
            />
            <div className="nss-carousel-text mt-4">
              <h3 className="text-xl font-bold">{titles[index]}</h3>
              <p className="text-gray-600">{dates[index]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/40 text-white px-3 py-1 rounded-full"
        onClick={prevSlide}
      >
        &#10094;
      </button>
      <button
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/40 text-white px-3 py-1 rounded-full"
        onClick={nextSlide}
      >
        &#10095;
      </button>

      {/* Dots Indicator */}
      <div className="nss-carousel-dots flex justify-center mt-4">
        {images.map((_, index) => (
          <span
            key={index}
            className={`h-3 w-3 mx-1 rounded-full cursor-pointer ${
              index === currentIndex ? "bg-black" : "bg-gray-400"
            }`}
            onClick={() => setCurrentIndex(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default NSSCarousel;

