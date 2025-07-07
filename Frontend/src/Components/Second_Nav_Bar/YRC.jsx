import React, { useEffect, useState, useRef } from "react";
import Slider from "react-slick";
import Banner from "../Banner";
import "slick-carousel/slick/slick.scss";
import "slick-carousel/slick/slick-theme.scss";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import "./YRC.css";
import axios from "axios";
import NCCNCarousel from "./NCC/NCC_NAvY comps/NCCNCarousel";
import NCCNtable from "./NCC/NCC_NAvY comps/NCCNtable";
import SideNav from "./SideNav";
import NSSContent from "./NSS/NSSContent";
import NSSManual from "./NSS/NSSManual";
import Coordinators from "./NSS/NSSCoordinatiors";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { FaRegCircleLeft, FaRegCircleRight } from "react-icons/fa6";
const BASE_URL = "http://localhost:5000/";

function YRCAbout() {
  return (
    <div className="YRC-about">
    <div className="YRC-Aboutus">
    <h2 class="YRC-heading">
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


const carouselItems = [
  {
    title: "NSS Volunteers in Action",
    desc: "Engaging in community service and making a difference.",
    image: "./nssphoto2.jpg",
},
{
    title: "Ethinic Day Celebration",
    desc: "Promoting Cultural Diversity and Unity.",
    image: "./nssphoto3.jpg",
},
{
    title: "Republic Day Celebration",
    desc: "Patriotic fervor and national pride on display.",
    image: "./nssphoto4.jpg",
},
{
    title: "Meet up with the police",
    desc: "Interacting with law enforcement and understanding their role.",
    image: "./nssphoto5.jpg",
},
{
    title: "Educational Programs",
    desc: "Spreading awareness and knowledge among the underprivileged.",
    image: "./nssphoto6.jpg",
},
{
    title: "Blood Donation Camp",
    desc: "Encouraging students to donate blood and save lives.",
    image: "./nssphoto7.jpg",
},
{
    title:"Eye check up camp",
    desc: "Promoting eye health and awareness.",
    image: "./nssphoto8.jpg",
},
{
    title: "eye check up program",
    desc: "Promoting eye health and awareness.",
    image: "./nssphoto9.jpg",
},
{
    title: "Blood Donation Camp",
    desc: "Encouraging students to donate blood and save lives.",
    image: "./nssphoto10.jpg",
},
  // {
  //   image: "https://via.placeholder.com/300",
  //   title: "EBSB DRDO Camp",
  //   location: "Annai Violet Arts and Science ...",
  //   date: "May 9, 2023",
  // },
  // {
  //   image: "https://via.placeholder.com/300",
  //   title: "Annual Sports Day",
  //   location: "Anna University, Chennai",
  //   date: "May 9, 2023",
  // },
  // {
  //   image: "https://via.placeholder.com/300",
  //   title: "Group Photo Session",
  //   location: "Anna University, Chennai",
  //   date: "May 7, 2023",
  // },
  // {
  //   image: "https://via.placeholder.com/300",
  //   title: "CATC cum IGC Firing Sel...",
  //   location: "3 (TN) Bn NCC Campus, Kancheep",
  //   date: "Apr 8, 2023",
  // },
  // {
  //   image: "https://via.placeholder.com/300",
  //   title: "National NCC Camp",
  //   location: "Delhi, India",
  //   date: "Mar 20, 2023",
  // },
  // {
  //   image: "https://via.placeholder.com/300",
  //   title: "Republic Day Parade",
  //   location: "Rajpath, New Delhi",
  //   date: "Jan 26, 2023",
  // },
  // {
  //   image: "https://via.placeholder.com/300",
  //   title: "Drill Practice Session",
  //   location: "Anna University, Chennai",
  //   date: "Feb 10, 2023",
  // },
  // {
  //   image: "https://via.placeholder.com/300",
  //   title: "NCC Trekking Camp",
  //   location: "Himalayas, India",
  //   date: "Dec 15, 2022",
  // },
];

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
    return <div className="nss-carousel-loading">No event data available.</div>;
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
  );
};

// const predefinedData = {
//   title: [
//     "Awards & Recognition 1",
//     "Awards & Recognition 2",
//     "Awards & Recognition 3",
//     "Awards & Recognition 4",
//     "Awards & Recognition 5",
//   ],
//   image_path: [
//     "https://via.placeholder.com/400x300?text=Alumni+1",
//     "https://via.placeholder.com/400x300?text=Alumni+2",
//     "https://via.placeholder.com/400x300?text=Alumni+3",
//     "https://via.placeholder.com/400x300?text=Alumni+4",
//     "https://via.placeholder.com/400x300?text=Alumni+5",
//   ],
// };

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

  const parseImage = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  return (
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
                src={parseImage(data?.image_path[index])}
                alt={title}
                className="w-full h-80 object-contain bg-gray-100 rounded-t-lg"
              />
              <div className="p-4 text-center bg-white rounded-b-lg text-justify">
                <p className="text-lg font-semibold text-gray-800">
                  {title}
                </p>
                {data?.des[index] && (
                  <p className="text-sm text-gray-600 mt-2 text-justify">
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
  );
};

  const studentCoordinators1 = [
    {
      id: 1,
      name: "Praveen Hari S",
      role: "YRC Chairman",
      department: "Dept. of AI&DS",
      year: "3rd Year",
      image: "https://www.shutterstock.com/image-vector/man-character-face-avatar-glasses-600nw-542759665.jpg", // Replace with actual image path
    },
    {
      id: 2,
      name: "Neena V",
      role: "YRC Vice Chairman",
      department: "Dept. of EEE",
      year: "3rd Year",
      image: "https://www.shutterstock.com/image-vector/man-character-face-avatar-glasses-600nw-542759665.jpg",
    },
    {
      id: 3,
      name: "Aram Valartha Nayaki K",
      role: "YRC Secretary",
      department: "Dept. of ECE",
      year: "3rd Year",
      image: "https://www.shutterstock.com/image-vector/man-character-face-avatar-glasses-600nw-542759665.jpg",
    },
    {
      id: 4,
      name: "Logesh G",
      role: "YRC Treasurer",
      department: "Dept. of ECE",
      year: "3rd Year",
      image: "https://www.shutterstock.com/image-vector/man-character-face-avatar-glasses-600nw-542759665.jpg",
    },
    {
      id: 5,
      name: "Dakshan B",
      role: "YRC Joint Secretary",
      department: "Dept. of AI&DS",
      year: "2nd Year",
      image: "https://www.shutterstock.com/image-vector/man-character-face-avatar-glasses-600nw-542759665.jpg",
    },
    {
      id: 6,
      name: "Akshaya S",
      role: "YRC Joint Secretary",
      department: "Dept. of CSE",
      year: "3rd Year",
      image: "https://imgcdn.stablediffusionweb.com/2024/4/7/76683d35-d0e9-4bf4-a630-99a6cc7da8c2.jpg",
    },
    {
      id:7,
      name: "Siddharth Magesh",
      role: "YRC Technical Head",
      department: "Dept. of AI&DS",
      year: "3rd year",
      image: "https://imgcdn.stablediffusionweb.com/2024/4/7/76683d35-d0e9-4bf4-a630-99a6cc7da8c2.jpg",
    },
    {
      id: 8,
      name: "Tarakeshwaran S",
      role: "YRC Technical Head",
      department: "Dept. of Mechanical Engineering",
      year: "3rd Year",
      image: "https://www.shutterstock.com/image-vector/man-character-face-avatar-glasses-600nw-542759665.jpg",
    },
    {
      id: 9,
      name: "Mithun Raj S",
      role: "YRC Non-Technical Head",
      department: "Dept. of AI&DS",
      year: "3rd Year",
      image: "https://www.shutterstock.com/image-vector/man-character-face-avatar-glasses-600nw-542759665.jpg",
    },
    {
      id: 10,
      name: "Jothi Lakshmi S",
      role: "YRC Non-Technical Head",
      department: "Dept. of Mechanical Engineering",
      year: "3rd Year",
      image: "https://www.shutterstock.com/image-vector/man-character-face-avatar-glasses-600nw-542759665.jpg",
    },
  ];

  function YRCCoord({ student, coor }) {
    // function getStudentCoordinators() {
    //   return Array.from({ length: 10 }, (_, index) => ({
    //     id: index + 1,
    //     name: `Student Coordinator ${index + 1}`,
    //     role: "YRC Student Leader",
    //     image: "https://via.placeholder.com/150",
    //   }));
    // }

    // const studentCoordinators = getStudentCoordinators();

    console.log("Ajay", coor);
    

    return (
      
      <div className="yrc-coordinators-container">
        <h2 className="yrc-h2">
          FACULTY COORDINATOR
          <div className="yrc-underline2"></div>
        </h2>
        
        <div className="yrc-member-card-1">
          <img
            src={coor?.image_path}
            alt="Officer"
            className="yrc-member-image1"
          />

          <div className="yrc-member-info1 w-500px">
            <h3>{coor?.name}</h3>
            <span className="yrc-platoon">{coor?.designation}</span>
          </div>
        </div>

        <h2 className="yrc-h3">
          STUDENT COORDINATORS
          <div className="yrc-underline3"></div>
        </h2>
        <div className="yrc-members-grid">
        {student?.name?.map((name,i) => (
          <div key={i} className="yrc-member-card">
            <img
              src={student?.image_path[i]}
              alt={name}
              className="yrc-member-image"
            />
            <div className="yrc-member-info">
              <h3>{name}</h3>
              <span className="yrc-platoon">{student?.designation[i]}</span>
              {/* <p className="yrc-department"><b>Register Number:</b> {student?.reg_no[i]}</p> */}
              <p className="yrc-year"><b>Year</b> {student?.year[i]}</p>
            </div>
          </div>
        ))}
      </div>

      </div>
    );
  }
const YRC = () => {
  const [staffCoordinator, setStaffCoordinator] = useState(null);
  const [studentCoordinators, setStudentCoordinators] = useState([]);
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
        
        // if (data.length >= 3) {
          //   setStaffCoordinator(data[0]); // Staff Coordinator
          
          //   setStudentCoordinators({
            //     names: data[1].name,
            //     roles: data[1].designation,
            //     images: data[1].image_path,
            //   });
            //   setYrcEvent(data[2]); // Event Data (Carousel)
            
            // }
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

return (
  <div>
      <Banner
        backgroundImage="https://kristujayanti.edu.in/studentlife/images/youth-red-cross-banner.jpg"
        headerText="Youth Red Cross (YRC)"
        subHeaderText="Fostering excellence in social service and community well-being."
        />

      {/*<div className="YRC-container flex flex-wrap mt-2 w-screen">*/}
      {/*  <nav className="basis-full lg:basis-1/5 flex flex-wrap justify-center lg:grid lg:float-left*/}
      {/*        w-screen lg:w-fit lg:max-w-[20vw] text-xl my-8">*/}
      {/*    {Object.keys(navData).map((itm, ind) => (*/}
      {/*        <button className={`px-4 py-2 border-2 border-text dark:border-drkt */}
      {/*            hover:bg-accn/50 dark:hover:bg-drka/50   */}
      {/*            ${(yrc === itm) ? "bg-accn dark:bg-drka text-prim dark:text-drkp font-semibold" : ""}*/}
      {/*          ${(ind + 1 === Object.keys(navData).length) ? "" : "lg:border-b-transparent"}`} key={ind}*/}
      {/*                type={"button"} onClick={() => setYrc(itm)}>{itm}</button>*/}
      {/*    ))}*/}
      {/*  </nav>*/}
      {/*  {navData[yrc]}*/}
      {/*</div>*/}
      <SideNav sts={yrc} setSts={setYrc} navData={navData} cls={"w-screen"} />
    </div>
  );
};

export default YRC;
