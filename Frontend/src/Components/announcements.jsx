import React, { useState, useEffect } from "react";
import axios from "axios";  
import "./announcements.css";
import img1 from "./Assets/hostel.png";
import star from "./Assets/championship.gif";

const Announcements1 = () => {
  const [announcements, setAnnouncements] = useState([false]);
  const [spcannouncements, setSpcAnnouncements] = useState([false]);
  const [flipped, setFlipped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const content = spcannouncements[0]?.list_of_contents || [];
  // console.log(announcements);
  

  // fetching special announcement data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/specialannouncements`);
        // console.log("HI",response.data);

        setSpcAnnouncements(response.data);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      } 
    };
    fetchData();
  });

    // fetching announcement data
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get(`/api/announcements`);
          // console.log("Ann",response.data);
          setAnnouncements(response.data);
        } catch (error) {
          console.error("Error fetching data:", error.message);
        } 
      };
      fetchData();
    });
  
  
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
    
    // Clean up intervals on hover state change or component unmount
    return () => {
      clearInterval(flipInterval);
      clearInterval(indexUpdateInterval);
    };
  }, [hovered, announcements.length]); // Dependency array
  

  // Automatically flip the card every 3 seconds, unless hovered
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
            {spcannouncements.map((item)=>(
              <>
                <h2 className="text-[3  lvh]">{item.title}</h2>
                <p className="text-[2lvh]">{item.content}</p>
              </>
            ))}
            <ul>
              {content?.map((item, index) => (
                <li className="text-[2lvh] mb-2" key={index}>
                  <img className="inline h-10 w-10 mr-2" src={star} alt="Trophy" />{item}</li>
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
                {/* <p className="text-[3lvh]">Announcements</p> */}
                <h2>Announcements</h2>
                <div className="contentAnn">
                  <h4>
                  <a> <i class="fa-solid fa-right-to-bracket"></i> </a>
                    {announcements[currentIndex % announcements.length]?.announcement_name}{" "}
                  </h4>
                  <h4>
                  <a> <i class="fa-solid fa-right-to-bracket"></i> </a>
                  {announcements[(currentIndex +1) % announcements.length]?.announcement_name}{" "}
                  </h4>
                  <h4>
                  <a> <i class="fa-solid fa-right-to-bracket"></i> </a>
                  {announcements[(currentIndex +2) % announcements.length]?.announcement_name}{" "}
                  </h4>
                  <h4>
                  <a> <i class="fa-solid fa-right-to-bracket"></i> </a>
                  {announcements[(currentIndex +3) % announcements.length]?.announcement_name}{" "}
                  </h4><h4>
                  <a> <i class="fa-solid fa-right-to-bracket"></i> </a>
                  {announcements[(currentIndex +4) % announcements.length]?.announcement_name}{" "}
                  </h4>
                </div>
              </div>
              <div className="card-back">
                <h2>Announcements</h2>
                <div className="contentAnn">
                  <h4>
                  <a> <i class="fa-solid fa-right-to-bracket"></i> </a>
                  {announcements[(currentIndex +5) % announcements.length].announcement_name}{" "}
                  </h4>
                  <h4>
                  <a> <i class="fa-solid fa-right-to-bracket"></i> </a>
                  {announcements[(currentIndex +6) % announcements.length].announcement_name}{" "}
                  </h4>
                  <h4>
                  <a> <i class="fa-solid fa-right-to-bracket"></i> </a>
                  {announcements[(currentIndex +7) % announcements.length]?.announcement_name}{" "}
                  </h4>
                  <h4>
                  <a> <i class="fa-solid fa-right-to-bracket"></i> </a>
                  {announcements[(currentIndex +8) % announcements.length]?.announcement_name}{" "}
                  </h4><h4>
                  <a> <i class="fa-solid fa-right-to-bracket"></i> </a>
                  {announcements[(currentIndex +9) % announcements.length]?.announcement_name}{" "}
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
