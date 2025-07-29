import React, { useState, useEffect } from "react";
import axios from 'axios';
import LoadComp from "../../../LoadComp";

const AlumniSlider = ({ data1 }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const handlePrev = () => {
    setActiveIndex(
      (prevIndex) =>
        (prevIndex - 1 + data1?.carousal_title?.length) %
        data1?.carousal_title?.length
    );
  };

  const handleNext = () => {
    setActiveIndex(
      (prevIndex) => (prevIndex + 1) % data1?.carousal_title?.length
    );
  };

  return (
<>
    {data1 ? (
      
      <div
      className="relative w-full max-w-4xl mx-auto mt-5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      >
      <div className="relative overflow-hidden rounded-lg shadow-lg">
      <div
      className="flex transition-transform duration-700 ease-in-out"
      style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
      {data1?.carousal_title?.map((description, index) => (
        <div
        key={index}
        className="flex-shrink-0 w-full transition-opacity duration-500 ease-in-out"
        style={{
          opacity: activeIndex === index ? 1 : 0.5,
          transition: "opacity 0.5s ease-in-out",
        }}
        >
              <img
                src={UrlParser(data1?.carousal_images[index])}
                alt="Distinguished Alumni"
                className="w-full h-80 object-contain rounded-t-lg"
                />
              <div className="p-4 text-center rounded-b-lg">
                <p className="text-lg font-semibold text-text dark:text-drkt font-bold">
                  {description}
                </p>
                <p className="text-text dark:text-drkt">{data1?.carousal_description[index]}</p>
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
        {data1?.carousal_title?.map((_, index) => (
          <button
          key={index}
          className={`w-2.5 h-2.5 rounded-full ${
            activeIndex === index ? "bg-blue-500" : "bg-gray-300"
            } transition-all`}
            onClick={() => setActiveIndex(index)}
            />
          ))}
          </div>
          </div>
        ) : (
          <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
        </div>
        )}
       </>
        
      );
    };
      
    export default AlumniSlider;
    