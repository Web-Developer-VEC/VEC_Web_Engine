import React, { useState, useEffect } from "react";

const winners = [
  { description: "Anna University Zonal Badminton (M) Third Place Match held at VEC", imageUrl: "/sports/achive1.png" },
  { description: "Anna University Zonal Badminton (W) Runner Match held at VEC", imageUrl: "/sports/achive2.png" },
  { description: "Anna University Zonal Basketball (W) Runner Match held at RMKEC", imageUrl: "/sports/achive3.png" },
  { description: "Anna University Zonal Volleyball (M) Third Place Match held at RMKEC", imageUrl: "/sports/achive4.png" },
  { description: "Anna University Zonal Basketball (M) Runner Match held at RMKEC", imageUrl: "/sports/achive5.png" },
  { description: "Anna University Zonal Chess (M) Winner Match held at AMS Engg College", imageUrl: "/sports/achive6.png" },
  { description: "Anna University Zonal Football (M) Third Place Match held at VIT", imageUrl: "/sports/achive7.png" },
  { description: "Anna University Zonal Kabaddi (M) Winner Match held at VEC", imageUrl: "/sports/achive8.png" },
  { description: "Anna University Zonal Table Tennis (M) Winner Match held at SAEC", imageUrl: "/sports/achive9.png" },
  { description: "Anna University Zonal Table Tennis (W) Winner Match held at SAEC", imageUrl: "/sports/achive10.png" },
  { description: "Anna University Zonal Hockey (M) Third Place Match held at VEC", imageUrl: "/sports/achive11.png" },
  { description: "Anna University Zonal Kho Kho (M) Runner Match held at PRATHYUSHA", imageUrl: "/sports/achive12.png" },
  { description: "Anna University Inter zone Boxing competition our college student Miss T. Keerthana Lakshmi of II year Civil secure Gold medal", imageUrl: "/sports/achive13.png" },
  { description: "Our College students S.R.Rupak of III year EIE Secure Gold Medal in inter zone Competition", imageUrl: "/sports/achive14.png" },
  { description: "Our Velammal Engg College Dept of AI&DS III YR Student Mr.Diyaneshwar won Silver medal", imageUrl: "/sports/achive15.png" },
  { description: "Our Velammal Engg College Dept of MECH IV YR Student Mr.G.Yashwanth Kumar secured Gold medal", imageUrl: "/sports/achive16.png" },
];

const WinnerSlider = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return; // Stop auto-slide when hovered
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % winners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovered]);

  const handlePrev = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + winners.length) % winners.length);
  };

  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % winners.length);
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
          {winners.map((winner, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full transition-opacity duration-500 ease-in-out"
              style={{
                opacity: activeIndex === index ? 1 : 0.5,
                transition: "opacity 0.5s ease-in-out",
              }}
            >
              <img
                src={winner.imageUrl}
                alt="Winner"
                className="w-full h-80 object-contain bg-gray-100 rounded-t-lg"
              />
              <div className="p-4 text-center bg-white rounded-b-lg">
                <p className="text-lg font-semibold text-gray-800">{winner.description}</p>
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
        {winners.map((_, index) => (
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
