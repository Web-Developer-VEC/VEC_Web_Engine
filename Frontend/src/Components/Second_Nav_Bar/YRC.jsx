import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import Banner from "../Banner";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import "./YRC.css";
import axios from "axios";

const YRC = () => {
  const [staffCoordinator, setStaffCoordinator] = useState(null);
  const [studentCoordinators, setStudentCoordinators] = useState([]);
  const [yrcEvent, setYrcEvent] = useState(null);

  console.log("Ajit",studentCoordinators);
  console.log("Ajay",yrcEvent);
  
  

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/yrc"); // Ensure correct API route
        const data = response.data;

        if (data.length >= 3) {
          setStaffCoordinator(data[0]); // Staff Coordinator
          setStudentCoordinators({
            names: data[1].name,
            roles: data[1].designation,
            images: data[1].image_path,
          });
          setYrcEvent(data[2]); // Event Data (Carousel)
        }
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

  return (
    <div>
      <Banner
        backgroundImage="https://kristujayanti.edu.in/studentlife/images/youth-red-cross-banner.jpg"
        headerText="Youth Red Cross (YRC)"
        subHeaderText="Fostering excellence in social service and community well-being."
      />

      <div className="YRC-container">
        {/* ABOUT US */}
        <div className="YRC-Aboutus">
          <h2 className="YRC-heading">ABOUT US</h2>
          <p className="YRC-content">
            The Youth Red Cross (YRC) is an integral part of the Indian Red Cross Society, dedicated to fostering humanitarian values among young individuals.
          </p>
        </div>

        {/* COORDINATORS SECTION */}
        <div className="YRC-coordinators-section">
          <h2 className="YRC-section-heading">COORDINATORS</h2>

          {/* Staff Coordinator */}
          {staffCoordinator && (
            <div className="YRC-faculty-coordinator">
              <div className="YRC-id-card">
                <img src={UrlParser(staffCoordinator.image_path)} alt={staffCoordinator.name} className="YRC-profile-pic" />
                <h4 className="YRC-name">{staffCoordinator.name}</h4>
                <p className="YRC-role">{staffCoordinator.designation}</p>
              </div>
            </div>
          )}

          {/* Student Coordinators */}
          <h3 className="YRC-subheading">Student Coordinators</h3>
          <div className="YRC-student-coordinators">
            {studentCoordinators.names &&
              studentCoordinators.names.map((name, index) => (
                <div key={index} className="YRC-id-card">
                  <img src={UrlParser(studentCoordinators.images[index])} alt={name} className="YRC-profile-pic" />
                  <h4 className="YRC-name">{name}</h4>
                  <p className="YRC-role">{studentCoordinators.roles[index]}</p>
                  
                </div>
              ))}
          </div>
        </div>

        {/* CAROUSEL SECTION */}
        <h2 className="YRC-heading">YRC ACTIVITIES</h2>
        <div className="YRC-carousel-container">
          <Slider {...carouselSettings}>
            {yrcEvent?.image_path?.map((img, index) => (
              <div key={index} className="YRC-carousel-slide">
                <img src={UrlParser(img)} alt={yrcEvent.image_content[index]} className="YRC-carousel-image" />
                <p className="YRC-carousel-text">{yrcEvent.image_content[index]}</p>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default YRC;
