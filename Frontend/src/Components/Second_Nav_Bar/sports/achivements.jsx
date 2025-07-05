import React, { useState, useEffect } from "react";
import styles from "./Achievements.module.css";
import LoadComp from "../../LoadComp";

const Achievements = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [achievements, setAchievements] = useState([]);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    if (!data || !data.image_path || !data.title) {
      setAchievements([]); // Ensure `achievements` is always an array
      return;
    }

    const formattedData = data.image_path.map((image, index) => ({
      id: index + 1,
      text: data.title?.[index] || "No Title", // Fallback for undefined values
      image: UrlParser(image),
    }));

    setAchievements(formattedData);
  }, [data]);

  useEffect(() => {
    if (isHovered || achievements.length === 0) return; // Prevent errors when achievements is empty

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % achievements.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered, achievements]);

  const handlePrev = () => {
    if (achievements.length === 0) return; // Avoid calculations on an empty array
    setActiveIndex(
      (prevIndex) => (prevIndex - 1 + achievements.length) % achievements.length
    );
  };

  const handleNext = () => {
    if (achievements.length === 0) return; // Avoid calculations on an empty array
    setActiveIndex((prevIndex) => (prevIndex + 1) % achievements.length);
  };

  return (

  <>
    {data ? (
      <div className="relative w-full max-w-4xl mx-auto ">
        <h2 className="text-center text-accn text-4xl font-bold mb-4">
          Achievements
        </h2>

        {achievements.length > 0 ? (
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="relative overflow-hidden rounded-lg shadow-lg">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              >
                {achievements.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex-shrink-0 w-full transition-opacity duration-500 ease-in-out"
                    style={{ opacity: activeIndex === index ? 1 : 0.5 }}
                  >
                    <img
                      src={item.image}
                      alt="Achievement"
                      className="w-full h-80 object-contain bg-gray-100 rounded-t-lg"
                    />
                    <div className="p-4 text-center bg-white rounded-b-lg">
                      <p className="text-lg font-semibold text-gray-800">
                        {item.text}
                      </p>
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
              {achievements.map((_, index) => (
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
          <p className="text-center text-gray-500">No achievements available</p>
        )}
      </div>
    ): (
      <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
        <LoadComp />
      </div>
    )}  
  </>
  );
};

export default Achievements;
