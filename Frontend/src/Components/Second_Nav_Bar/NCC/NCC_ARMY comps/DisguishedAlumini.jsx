import React, { useState, useEffect } from "react";

const predefinedData = {
  title: [
    "Distinguished Alumni 1",
    "Distinguished Alumni 2",
    "Distinguished Alumni 3",
    "Distinguished Alumni 4",
    "Distinguished Alumni 5",
  ],
  image_path: [
    "https://via.placeholder.com/400x300?text=Alumni+1",
    "https://via.placeholder.com/400x300?text=Alumni+2",
    "https://via.placeholder.com/400x300?text=Alumni+3",
    "https://via.placeholder.com/400x300?text=Alumni+4",
    "https://via.placeholder.com/400x300?text=Alumni+5",
  ],
};

const AlumniSlider = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return; // Stop auto-slide when hovered
    const interval = setInterval(() => {
      setActiveIndex(
        (prevIndex) => (prevIndex + 1) % predefinedData.title.length
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovered]);

  const handlePrev = () => {
    setActiveIndex(
      (prevIndex) =>
        (prevIndex - 1 + predefinedData.title.length) %
        predefinedData.title.length
    );
  };

  const handleNext = () => {
    setActiveIndex(
      (prevIndex) => (prevIndex + 1) % predefinedData.title.length
    );
  };

  return (
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
          {predefinedData.title.map((description, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full transition-opacity duration-500 ease-in-out"
              style={{
                opacity: activeIndex === index ? 1 : 0.5,
                transition: "opacity 0.5s ease-in-out",
              }}
            >
              <img
                src={predefinedData.image_path[index]}
                alt="Distinguished Alumni"
                className="w-full h-80 object-contain bg-gray-100 rounded-t-lg"
              />
              <div className="p-4 text-center bg-white rounded-b-lg">
                <p className="text-lg font-semibold text-gray-800">
                  {description}
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
        {predefinedData.title.map((_, index) => (
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
  );
};

export default AlumniSlider;
