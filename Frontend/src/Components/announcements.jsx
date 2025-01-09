import React, { useState, useEffect } from "react";
import "./announcements.css";
import img1 from "./Assets/hostel.png";
import star from "./Assets/championship.gif";

const Announcements1 = () => {
  const main = [
    { head: "Nominations are invited from alumni for the year 2024" },
    {
      content:
        "Brain; be agile, where they will be appreciated. We recognize ourgreat minds cultivated by Velammal who leaps above and beyond in theirdomain and inspire the young hearts to grow agile by awarding them inthese following categories.",
    },
    {
      awards: [
        { ttle: "Placement Icon Award" },
        { ttle: "Emerging Entrepreneur Award" },
        { ttle: "Path Breakers Award" },
        { ttle: "Optimal pursuer Award" },
        { ttle: "Humanitarian Award" },
      ],
    },
  ];

  const ance = [
    { ttle: "B.E / B.Tech Admissions open for 1st years" },
    { ttle: "MBA Admissions open" },
    { ttle: "B.E / B.Tech Admissions open for Lateral Entry" },
    { ttle: "SEE results for 3rd year" },
    { ttle: "SEE results for 2nd year" },
    { ttle: "Revaluation Application for 2nd years" },
    { ttle: "Revaluation Application for 3rd years" },
    { ttle: "Revaluation Application for MBA" },
    { ttle: "Culturals" },
  ];

  const [flipped, setFlipped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Automatically flip the card every 3 seconds, unless hovered
  useEffect(() => {
    let flipInterval;
    let indexUpdateInterval;

    if (!hovered) {
      flipInterval = setInterval(() => {
        setFlipped((prev) => !prev);
      }, 6250); // Flip every 6250 ms

      indexUpdateInterval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 8) % ance.length);
      }, 12700); // Update index every 12700 ms
    }

    // Clean up intervals on hover state change or component unmount
    return () => {
      clearInterval(flipInterval);
      clearInterval(indexUpdateInterval);
    };
  }, [hovered, ance.length]); // Dependency array

  return (
      <div className="news font-popp">
      <div className="head"><p className="text-[3.5lvh]">News</p></div>
      <div className="announcement flex flex-row max-h-[60lvh]">
          <div className="relative min-w-[35%]">
            <div className="cont w-[105%] absolute h-full"></div>
            <img className="img bottom-0 absolute w-[73.5%] h-auto min-h-[90%] " src={img1} alt="college" />
            {/* <div className="contain grid border-4 border-pink-700 w-[100%] h-full"></div> */} 
          </div>
          <div className="main w-[40%]">
            <h2 className="text-[3  lvh]">{main[0].head}</h2>
            <p className="text-[2lvh]">{main[1].content}</p>
            <ul>
              {main[2].awards.map((item, index) => (
                <li className="text-[2lvh] mb-2" key={index}>
                  <img className="inline h-10 w-10 mr-2" src={star} alt="Trophy" />{item.ttle}</li>
              ))}
            </ul>
            <button className="hover:animate-[AnimationName_3s_linear_infinite]">Apply Now</button>
          </div>
        <div className="tiles">
          <div
            className="card right-[10%]"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <div className={`card-inner ${flipped ? "flipped" : ""}`}>
              <div className="card-front">
                <p className="text-[3lvh]">Announcements</p>
                <div className="contentAnn">
                  <h4>
                  <a> <i class="fa-solid fa-right-to-bracket"></i> </a>
                    {ance[currentIndex % ance.length].ttle}{" "}
                  </h4>
                  <h4>
                  <a> <i class="fa-solid fa-right-to-bracket"></i> </a>
                    {ance[(currentIndex + 1) % ance.length].ttle}{" "}
                  </h4>
                  <h4>
                  <a> <i class="fa-solid fa-right-to-bracket"></i> </a>
                    {ance[(currentIndex + 2) % ance.length].ttle}{" "}
                  </h4>
                  <h4>
                  <a> <i class="fa-solid fa-right-to-bracket"></i> </a>
                    {ance[(currentIndex + 3) % ance.length].ttle}{" "}
                  </h4><h4>
                  <a> <i class="fa-solid fa-right-to-bracket"></i> </a>
                    {ance[(currentIndex + 4) % ance.length].ttle}{" "}
                  </h4>
                </div>
              </div>
              <div className="card-back">
                <h2>Announcements</h2>
                <div className="contentAnn">
                  <h4>
                  <a> <i class="fa-solid fa-right-to-bracket"></i> </a>
                    {ance[(currentIndex + 5) % ance.length].ttle}{" "}
                  </h4>
                  <h4>
                  <a> <i class="fa-solid fa-right-to-bracket"></i> </a>
                    {ance[(currentIndex + 6) % ance.length].ttle}{" "}
                  </h4>
                  <h4>
                  <a> <i class="fa-solid fa-right-to-bracket"></i> </a>
                    {ance[(currentIndex + 7) % ance.length].ttle}{" "}
                  </h4>
                  <h4>
                  <a> <i class="fa-solid fa-right-to-bracket"></i> </a>
                    {ance[(currentIndex + 8) % ance.length].ttle}{" "}
                  </h4><h4>
                  <a> <i class="fa-solid fa-right-to-bracket"></i> </a>
                    {ance[(currentIndex + 9) % ance.length].ttle}{" "}
                  </h4>
                  {/* You can add more detailed content here if needed */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Announcements1;
