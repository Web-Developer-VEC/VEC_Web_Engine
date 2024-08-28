import React, { useState, useEffect } from "react";
import "./announcements.css";
import img1 from "./Assets/hostel.jpg";

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
        setCurrentIndex((prevIndex) => (prevIndex + 1) % ance.length);
      }, 12700); // Update index every 12700 ms
    }

    // Clean up intervals on hover state change or component unmount
    return () => {
      clearInterval(flipInterval);
      clearInterval(indexUpdateInterval);
    };
  }, [hovered, ance.length]); // Dependency array

  return (
      <section className="news">
      <div className="head">News</div>
      <div className="announcement">
        <div className="img">
          <img src={img1} alt="college" />
        </div>
        <div className="main">
          <h2>{main[0].head}</h2>
          <p>{main[1].content}</p>
          <ul>
            {main[2].awards.map((item, index) => (
              <li key={index}>{item.ttle}</li>
            ))}
          </ul>
          <button>Apply Now</button>
        </div>

        <div className="tiles">
          <div
            className="card"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <div className={`card-inner ${flipped ? "flipped" : ""}`}>
              <div className="card-front">
                <h2>Announcements</h2>
                <div className="content">
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
                </div>
              </div>
              <div className="card-back">
                <h2>Announcements</h2>
                <div className="content">
                  <h4>
                  <a> <i class="fa-solid fa-right-to-bracket"></i> </a>
                    {ance[(currentIndex + 3) % ance.length].ttle}{" "}
                  </h4>
                  <h4>
                  <a> <i class="fa-solid fa-right-to-bracket"></i> </a>
                    {ance[(currentIndex + 4) % ance.length].ttle}{" "}
                  </h4>
                  <h4>
                  <a> <i class="fa-solid fa-right-to-bracket"></i> </a>
                    {ance[(currentIndex + 5) % ance.length].ttle}{" "}
                  </h4>
                  {/* You can add more detailed content here if needed */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Announcements1;
