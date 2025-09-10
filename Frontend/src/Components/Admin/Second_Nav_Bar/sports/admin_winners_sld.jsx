import React, { useState, useEffect } from "react";
import LoadComp from "../../LoadComp";

const WinnerSlider = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };
  
  useEffect(() => {
    if (isHovered) return; // Stop auto-slide when hovered
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % data?.title?.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovered, data?.title?.length]);
  
  if (!data) {
    return <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
            <LoadComp />
          </div>;
  }
  const handlePrev = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + data?.length) % data?.length);
  };

  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % data?.length);
  };

  return (
    <div
      className="relative w-full max-w-4xl mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-lg shadow-lg">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {data?.map((description, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full transition-opacity duration-500 ease-in-out"
              style={{
                opacity: activeIndex === index ? 1 : 0.5,
                transition: "opacity 0.5s ease-in-out",
              }}
            >
              <img
                src={UrlParser(description?.image_path)}
                alt="Winner"
                className="w-full h-80 object-contain rounded-t-lg"
              />
              <div className="p-4 text-center rounded-b-lg">
                <p className="text-lg font-semibold text-text dark:text-drkt">{description?.title}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handlePrev}
          className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-all"
        >
          &#10094;
        </button>
        <button
          onClick={handleNext}
          className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-all"
        >
          &#10095;
        </button>
      </div>

      <div className="flex justify-center space-x-2 mt-4">
        {data?.title?.map((_, index) => (
          <button
            key={index}
            className={`w-2.5 h-2.5 rounded-full ${activeIndex === index ? "bg-blue-500" : "bg-gray-300"} transition-all`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default WinnerSlider;
