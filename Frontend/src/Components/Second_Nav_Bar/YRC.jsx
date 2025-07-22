import React, { useEffect, useState, useRef } from "react";
import Slider from "react-slick";
import Banner from "../Banner";
import "slick-carousel/slick/slick.scss";
import "slick-carousel/slick/slick-theme.scss";
import "./YRC.css";
import axios from "axios";
import SideNav from "./SideNav";
import "swiper/css";
import "swiper/css/navigation";
import LoadComp from "../LoadComp"

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

function YRCAbout() {
  return (
    <div className="YRC-about mt-4">
      <div className="YRC-Aboutus border-l-4 border-secd dark:border-drks dark:bg-drkb">
        <h2 class="YRC-heading text-brwn dark:text-drkt">
          ABOUT US
        </h2>

        <p className="YRC-content">
          The Youth Red Cross (YRC) is an integral part of the Indian Red Cross Society, dedicated to fostering humanitarian
          values among young individuals.
        </p>
      </div>
    </div>
  );
}

const CarouselYRC = ({ data }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const intervalRef = useRef(null);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  // Auto slide effect
  useEffect(() => {
    if (isAutoPlay && data?.image_path?.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) =>
          prev === data.image_path.length - 1 ? 0 : prev + 1
        );
      }, 3000);

      return () => clearInterval(intervalRef.current);
    }
  }, [currentIndex, isAutoPlay, data]);

  // Handle edge case: No data
  if (!data?.image_path || data.image_path.length === 0) {
    return <div className="nss-carousel-loading text-text dark:text-drkt">No event data available.</div>;
  }

  // Handlers
  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? data.image_path.length - 1 : prev - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev === data.image_path.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <>
      {data ? (
      <div className="nss-carousel-wrap">
        <div
          className="nss-carousel-container"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            display: "flex",
            transition: "transform 0.5s ease",
          }}
        >
          {data.image_path.map((image, index) => (
          <div className="nss-carousel-slide" key={index}>
            <img
              src={UrlParser(image)}
              alt={data?.title?.[index]}
              className="nss-carousel-image"
            />
      
            {/* Overlay Text at Bottom */}
            <div className="nss-carousel-overlay">
              <div className="nss-carousel-overlay-left">
                <h3>{data?.title?.[index]}</h3>
                <p>{data?.des?.[index]}</p>
              </div>
              <div className="nss-carousel-overlay-right">
                {data?.date?.[index]}
              </div>
            </div>
          </div>
        ))}


        </div>

        {/* Navigation Buttons */}
        <button
          className="nss-carousel-btn nss-carousel-btn-left"
          onClick={prevSlide}
        >
          &#10094;
        </button>
        <button
          className="nss-carousel-btn nss-carousel-btn-right"
          onClick={nextSlide}
        >
          &#10095;
        </button>

        {/* Dots Indicator */}
        <div className="nss-carousel-dots">
          {data.image_path.map((_, index) => (
            <span
              key={index}
              className={`nss-dot ${index === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(index)}
            ></span>
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

const Awardsnss = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // ⏱️ Auto-slide effect
  useEffect(() => {
    if (isHovered || data?.title?.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex(
        (prevIndex) => (prevIndex + 1) % data?.title?.length
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovered, data?.title?.length]);

  const handlePrev = () => {
    setActiveIndex(
      (prevIndex) =>
        (prevIndex - 1 + data?.title?.length) % data?.title?.length
    );
  };

  const handleNext = () => {
    setActiveIndex(
      (prevIndex) => (prevIndex + 1) % data?.title?.length
    );
  };

  return (
    <>
      {data ? (
      <div
        className="relative w-full max-w-4xl mx-auto mt-5 mb-3"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative overflow-hidden rounded-lg shadow-lg">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {data?.title?.map((title, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-full transition-opacity duration-500 ease-in-out"
                style={{
                  opacity: activeIndex === index ? 1 : 0.5,
                }}
              >
                <img
                  src={UrlParser(data?.image_path[index])}
                  alt={title}
                  className="w-full h-80 object-contain rounded-t-lg"
                />
                <div className="p-4 text-center rounded-b-lg text-justify">
                  <p className="text-lg font-semibold text-text dark:text-drkt">
                    {title}
                  </p>
                  {data?.des[index] && (
                    <p className="text-sm text-text dark:text-drkt mt-2 text-justify">
                      {data?.des[index]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
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

        {/* Pagination dots */}
        <div className="flex justify-center space-x-2 mt-4">
          {data?.title.map((_, index) => (
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

  function YRCCoord({ student, coor }) {
    const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
      return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };
    return (
      <>
        {student && coor ? (
        <div className="yrc-coordinators-container flex justify-items-center">
          <h2 className="yrc-h2 text-brwn dark:text-drkt">
            FACULTY COORDINATOR
            <div className="yrc-underline2"></div>
          </h2>
          
          <div className="yrc-member-card-1 dark:bg-text">
            <img
              src={UrlParser(coor?.image_path)}
              alt="Officer"
              className="yrc-member-image1"
            />

            <div className="yrc-member-info1 w-500px">
              <h3 className="text-text dark:text-drkt">{coor?.name}</h3>
              <span className="yrc-platoon text-brwn dark:text-drka">{coor?.designation}</span>
            </div>
          </div>

          <h2 className="yrc-h3 text-brwn dark:text-drkt">
            STUDENT COORDINATORS
            <div className="yrc-underline3"></div>
          </h2>
          <div className="yrc-members-grid grid grid-cols-4 gap-6 auto-rows-auto  justify-items-center justify-content-center align-items-center">
          {student?.name?.map((name,i) => (
            <div key={i} className="yrc-member-card dark:bg-text">
              <img
                src={UrlParser(student?.image_path[i])}
                alt={name}
                className="yrc-member-image"
              />
              <div className="yrc-member-info">   
                <h3 className="text-text dark:text-drkt">{name}</h3>
                <span className="yrc-platoon text-brwn dark:text-drka">{student?.designation[i]}</span>
                {/* <p className="yrc-department"><b>Register Number:</b> {student?.reg_no[i]}</p> */}
                <p className="yrc-year text-brwn dark:text-drka"><b>Year</b> {student?.year[i]}</p>
              </div>
            </div>
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
  }
const YRC = () => {
  const [yrcEvent, setYrcEvent] = useState(null);
  const [yrcData, setYrcData] = useState(null);
  const [yrc, setYrc] = useState("About YRC")
  
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/yrc"); // Ensure correct API route
        const data = response.data;
        console.log(data[0]);
        setYrcData(data[0])
          } catch (err) {
            console.error("Error Fetching Data:", err.message);
          }
        };
        
        fetchData();
      }, []);
      
      
      // Carousel Settings
      const carouselSettings = {
        dots: true,
        infinite: true,
        speed: 1000,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
      };
      
      const NotificationBox1 = () => {
        const marqueeRef = useRef(null);
        const news = yrcData?.news?.updates;
        
        
        return (
          <div className="YRC-notification-container">
        <div className="YRC-news-updates">
          Bringing you the latest news & updates
        </div>
        <div className="YRC-notification-box">
          <div className="YRC-notification-header">Recent Updates</div>
          <div className="YRC-notification-content">
            <marquee
              ref={marqueeRef}
              behavior="scroll"
              direction="up"
              scrollamount="3"
              onMouseOver={() => marqueeRef.current && marqueeRef.current.stop()}
              onMouseOut={() => marqueeRef.current && marqueeRef.current.start()}
              >
              {news?.length > 0 ? (
                news?.map((update, index) => (
                  <p key={index}>{update}</p>
                  ))
                  ) : (
                    <p>No updates available.</p>
                    )}
            </marquee>
          </div>
        </div>
      </div>
    );
  };
  
  function YRCActs() {
    return (       <div><h2 className="YRC-heading">YRC ACTIVITIES</h2>
        <div className="YRC-carousel-container">
          <Slider {...carouselSettings}>
            {yrcEvent?.image_path?.map((img, index) => (
              <div key={index} className="YRC-carousel-slide">
                <img src={UrlParser(img)} alt={yrcEvent.image_content[index]} className="YRC-carousel-image" />
                <p className="YRC-carousel-text">{yrcEvent.image_content[index]}</p>
              </div>
            ))}
          </Slider>
        </div></div>);
}

const navData = {
  "About YRC": <YRCAbout/>,
  "News & Updates": <NotificationBox1 />,
  "Recent Events": <CarouselYRC data={yrcData?.events}/>,
  "Team & Coordinators": <YRCCoord student={yrcData?.members} coor={yrcData?.coordinater}/>,
  "Awards & Recognition": <Awardsnss data={yrcData?.awards} />
};

const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (!isOnline) {
        return (
          <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
            <LoadComp txt={"You are offline"} />
          </div>
        );
    }

return (
  <div>
      <Banner
      backgroundImage="./Banners/YRC.webp"
        headerText="Youth Red Cross (YRC)"
        subHeaderText="Fostering excellence in social service and community well-being."
        />
        {yrcData ? (
          <SideNav sts={yrc} setSts={setYrc} navData={navData} cls={"w-screen"} />
        ) : (
          <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
            <LoadComp />
          </div>
        )}

    </div>
  );
};

export default YRC;
