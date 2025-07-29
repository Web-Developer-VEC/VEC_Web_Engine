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
const YRC = () => {
  // const [yrcEvent, setYrcEvent] = useState(null);
  const [yrcData, setYrcData] = useState(null);
  const [yrc, setYrc] = useState("About YRC")
  
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };
  const navData = {
    "About YRC": <YRCAbout data={yrcData}/>,
    "News & Updates": <NotificationBox1 data={yrcData}/>,
    "Recent Events": <CarouselYRC data={yrcData}/>,
    "Team & Coordinators": <YRCCoord data={yrcData}/>,
    "Awards & Recognition": <Awardsnss data={yrcData} />
  };
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(()=>{
    const typeMatch = {
        "About YRC": "about",
        "News & Updates": "news_updates",
        "Recent Events": "events",
        "Team & Coordinators": "team",
        "Awards & Recognition" : "awards"
    }
    const fetchData = async () => {
        try {
            const response = await axios.post('/api/main-backend/yrc',
                {
                    type: typeMatch[yrc]
                }
            )
            setYrcData(response.data.data)
            console.log("yrc",response.data.data)
        } catch (error) {
            console.error("Error fetching data:", error.message)
        }
    }
    fetchData()
  }, [yrc]);
  
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
function YRCAbout({data}) {
  return (
    <div className="YRC-about mt-4">
      <div className="YRC-Aboutus border-l-4 border-secd dark:border-drks dark:bg-drkb">
        <h2 class="YRC-heading text-brwn dark:text-drkt">
          ABOUT US
        </h2>

        <p className="YRC-content">
          {data[0]?.about_us}
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
  if (isAutoPlay && data?.length > 0) {
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === data.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(intervalRef.current);
  }
}, [currentIndex, isAutoPlay, data]);


  // Handle edge case: No data
  if (!data[0]?.image_path || data[0]?.image_path?.length === 0) {
    return <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
        </div>
  }

  // Handlers
 const prevSlide = () => {
  setCurrentIndex((prev) =>
    prev === 0 ? data.length - 1 : prev - 1
  );
};

const nextSlide = () => {
  setCurrentIndex((prev) =>
    prev === data.length - 1 ? 0 : prev + 1
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
          {data?.map((image, index) => (
          <div className="nss-carousel-slide" key={index}>
            <img
              src={UrlParser(image?.image_path)}
              alt={image?.title}
              className="nss-carousel-image"
            />
      
            {/* Overlay Text at Bottom */}
            <div className="nss-carousel-overlay">
              <div className="nss-carousel-overlay-left">
                <h3>{image?.title}</h3>
                <p>{image?.description}</p>
              </div>
              <div className="nss-carousel-overlay-right">
                {image?.date}
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
          {data?.map((_, index) => (
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
    if (isHovered || !data?.length) return;
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % data.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovered, data]);

  const handlePrev = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + data.length) % data.length);
  };

  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % data.length);
  };

  return (
    <>
      {data && data.length > 0 ? (
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
              {data.map((item, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-full transition-opacity duration-500 ease-in-out"
                >
                  <img
                    src={UrlParser(item?.image_path)}
                    alt={item?.title}
                    className="w-full h-80 object-cover rounded-t-lg"
                  />
                  <div className="p-4 text-center rounded-b-lg text-justify">
                    <p className="text-lg font-semibold text-text dark:text-drkt">
                      {item?.title}
                    </p>
                    {item?.description && (
                      <p className="text-sm text-text dark:text-drkt mt-2 text-justify">
                        {item.description}
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
              aria-label="Previous Slide"
            >
              &#10094;
            </button>
            <button
              onClick={handleNext}
              className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-all"
              aria-label="Next Slide"
            >
              &#10095;
            </button>
          </div>

          {/* Pagination dots */}
          <div className="flex justify-center space-x-2 mt-4">
            {data.map((_, index) => (
              <button
                key={index}
                className={`w-2.5 h-2.5 rounded-full ${
                  activeIndex === index ? "bg-blue-500" : "bg-gray-300"
                } transition-all`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp />
        </div>
      )}
    </>
  );
};

  function YRCCoord({ data }) {
    console.log('hello',data)
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  let stud = [];
  let coor = null;

  if (Array.isArray(data) && data.length >= 2) {
    coor = data[0]?.members?.[0] || null;
    stud = Array.isArray(data[1]?.members) ? data[1].members : [];
    console.log("DATA:", data);
    console.log("COORDINATOR:", coor);
    console.log("STUDENTS:", stud);

  }
  return (
    <>
      {coor?.name && Array.isArray(stud) && stud.length > 0 ? (
        <div className="yrc-coordinators-container flex flex-col items-center px-4">
          {/* Faculty Coordinator */}
          <h2 className="yrc-h2 text-brwn dark:text-drkt text-center mt-6">
            FACULTY COORDINATOR
            <div className="yrc-underline2 mx-auto mt-1 w-[300px] h-[2px] bg-yellow-400 rounded"></div>
          </h2>

          <div className="yrc-member-card-1 dark:bg-text flex flex-col md:flex-row items-center gap-6 mt-4">
            <img
              src={UrlParser(coor?.image_path)}
              alt={coor?.name}
              className="yrc-member-image1 w-32 h-32 object-cover rounded border"
            />
            <div className="yrc-member-info1 text-center md:text-left">
              <h3 className="text-text dark:text-drkt text-xl font-semibold">
                {coor?.name}
              </h3>
              <span className="yrc-platoon text-brwn dark:text-drka">
                {coor?.designation}
              </span>
            </div>
          </div>

          {/* Student Coordinators */}
          <h2 className="yrc-h3 text-brwn dark:text-drkt text-center mt-10">
            STUDENT COORDINATORS
            <div className="yrc-underline3 mx-auto mt-1 w-[300px] h-[2px] bg-yellow-400 rounded"></div>
          </h2>

          <div className="yrc-members-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {stud.map((student, i) => (
              <div key={i} className="yrc-member-card dark:bg-text p-4 rounded shadow text-center">
                <img
                  src={UrlParser(student?.image_path)}
                  alt={student?.name}
                  className="yrc-member-image w-24 h-24 object-cover border rounded-full mx-auto mb-3"
                />
                <div className="yrc-member-info">
                  <h3 className="text-text dark:text-drkt font-semibold">{student?.name}</h3>
                  <span className="yrc-platoon text-brwn dark:text-drka block">
                    {student?.designation}
                  </span>
                  <p className="yrc-year text-brwn dark:text-drka">
                    <b>Year:</b> {student?.year}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp />
        </div>
      )}
    </>
  );
}
  
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await axios.get("/api/yrc"); // Ensure correct API route
  //       const data = response.data;
  //       console.log(data[0]);
  //       setYrcData(data[0])
  //         } catch (err) {
  //           console.error("Error Fetching Data:", err.message);
  //         }
  //       };
        
  //       fetchData();
  //     }, []);
      
      
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
      
      const NotificationBox1 = ({ data }) => {
  return (
    <div className="YRC-notification-container">
      <div className="YRC-news-updates">Bringing you the latest news & updates</div>

      <div className="YRC-notification-box">
        <div className="YRC-notification-header">Recent Updates</div>

        <div className="scroll-container">
          <div className="scroll-content">
            {Array.isArray(data) && data.length > 0 ? (
              data.map(
                (update, index) =>
                  typeof update === "string" && (
                    <p key={index} className="news-item">{update}</p>
                  )
              )
            ) : (
              <p className="news-item">No updates available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

  
//   function YRCActs() {
//     return (       <div><h2 className="YRC-heading">YRC ACTIVITIES</h2>
//         <div className="YRC-carousel-container">
//           <Slider {...carouselSettings}>
//             {yrcEvent?.image_path?.map((img, index) => (
//               <div key={index} className="YRC-carousel-slide">
//                 <img src={UrlParser(img)} alt={yrcEvent.image_content[index]} className="YRC-carousel-image" />
//                 <p className="YRC-carousel-text">{yrcEvent.image_content[index]}</p>
//               </div>
//             ))}
//           </Slider>
//         </div></div>);
// }


export default YRC;
