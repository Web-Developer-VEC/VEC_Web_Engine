import React, { useState, useEffect } from "react";
import axios from "axios";  
import "./announcements.css";
import img1 from "./Assets/hostel.png";
import star from "./Assets/championship.gif";

const Announcements1 = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [spcannouncements, setSpcAnnouncements] = useState([]);
  const [flipped, setFlipped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const content = spcannouncements[0]?.list_of_contents || [];

  // Fetching Special Announcements
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/specialannouncements`);
        setSpcAnnouncements(response.data);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      } 
    };
    fetchData();
  }, []);

  // Fetching General Announcements
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/announcements`);
        setAnnouncements(response.data);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      } 
    };
    fetchData();
  }, []);
  
  useEffect(() => {
    let flipInterval;
    let indexUpdateInterval;
    
    if (!hovered) {
      flipInterval = setInterval(() => {
        setFlipped((prev) => !prev);
      }, 6250); // Flip every 6250 ms
      
      indexUpdateInterval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 8) % announcements.length);
      }, 12700); // Update index every 12700 ms
    }
    
    return () => {
      clearInterval(flipInterval);
      clearInterval(indexUpdateInterval);
    };
  }, [hovered, announcements.length]); 

  // Manual Flip Function
  const handleManualFlip = () => {
    setFlipped((prev) => !prev);
  };

  return (
    <div className="news font-popp">
      <div className="head"><p className="text-[3.5lvh]">News</p></div>
      <div className="announcement flex flex-row max-h-[60lvh]">
        <div className="relative min-w-[35%]">
          <div className="cont w-[105%] absolute h-full"></div>
          <img className="img bottom-0 absolute w-[73.5%] h-auto min-h-[90%]" src={img1} alt="college" />
        </div>

        <div className="main w-[40%]">
          {spcannouncements.map((item) => (
            <div key={item.title}>
              <h2 className="text-[3lvh]">{item.title}</h2>
              <p className="text-[2lvh]">{item.content}</p>
            </div>
          ))}
          <ul>
            {content?.map((item, index) => (
              <li className="text-[2lvh] mb-2" key={index}>
                <img className="inline h-10 w-10 mr-2" src={star} alt="Trophy" />
                {item}
              </li>
            ))}
          </ul>
          <button className="hover:animate-[AnimationName_3s_linear_infinite]">Apply Now</button>
        </div>

        {/* Announcements Section */}
        <div className="tiles">
          <div
            className="card right-[10%]"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <div className={`card-inner ${flipped ? "flipped" : ""}`}>
              <div className="card-front">
                <h2>Announcements</h2>
                <div className="contentAnn">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <h4 key={i}>
                      <a><i className="fa-solid fa-right-to-bracket"></i></a>
                      {announcements[(currentIndex + i) % announcements.length]?.announcement_name}
                    </h4>
                  ))}
                </div>
              </div>
              <div className="card-back">
                <h2>Announcements</h2>
                <div className="contentAnn">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <h4 key={i + 5}>
                      <a><i className="fa-solid fa-right-to-bracket"></i></a>
                      {announcements[(currentIndex + i + 5) % announcements.length]?.announcement_name}
                    </h4>
                  ))}
                </div>
              </div>
            </div>
            <div className="flip-buttons">
              <button className="flip-btn" onClick={handleManualFlip}> &#8617;</button>
              <button className="flip-btn" onClick={handleManualFlip}> &#8618;</button>
            </div>
          </div>

          {/* Flip Control Buttons */}
        </div>
      </div>
    </div>
  );
};

export default Announcements1;
