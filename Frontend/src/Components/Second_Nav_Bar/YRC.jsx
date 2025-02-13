import React from "react";
import Slider from "react-slick";
import Banner from "../Banner";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import "./YRC.css";

const YRC = () => {
  // Dummy data for development
  const dummyCoordinators = {
    staffCoordinator: {
      name: "RAMESH KUMAR",
      role: "COORDINATOR",
      photo: "/YRC_STAFF.jpg",
      facebook: "#",
      instagram: "#",
      linkedin: "#",
    },
    studentCoordinators: [
      { name: "PRAVEEN HARI S", role: "CHAIRMAN", photo: "/YRC_s3.jpg", facebook: "#", instagram: "#", linkedin: "#" },
      { name: "NEENA V", role: "Vice-CHAIRMAN", photo: "/YRC_s6.jpg", facebook: "#", instagram: "#", linkedin: "#" },
      { name: "ARAM VALARTHA NAYAKI K", role: "Secretary", photo: "/YRC_s5.jpg", facebook: "#", instagram: "#", linkedin: "#" },
      { name: "LOGESH G", role: "Treasurer", photo: "/YRC_S4.jpg", facebook: "#", instagram: "#", linkedin: "#" },
      { name: "SIDDHARTH M", role: "TECH HEAD", photo: "/YRC_s10.jpg", facebook: "#", instagram: "#", linkedin: "#" },
      { name: "TARAKESHWARAN S", role: "TECH HEAD", photo: "/YRC_s1.jpg", facebook: "#", instagram: "#", linkedin: "#" },
      { name: "MITHUN RAJ S", role: "NON-TECH HEAD", photo: "/YRC_s8.jpg", facebook: "#", instagram: "#", linkedin: "#" },
      { name: "JOTHI LAKSHMI", role: "NON-TECH HEAD", photo: "/YRC_s7.jpg", facebook: "#", instagram: "#", linkedin: "#" },
      { name: "AKSHAYA S", role: "JOINT-SECRETARY", photo: "/YRC_s9.jpg", facebook: "#", instagram: "#", linkedin: "#" },
      { name: "DAKSHAN B", role: "JOINT-SECRETARY", photo: "/YRC_s2.jpg", facebook: "#", instagram: "#", linkedin: "#" },
    ],
  };

  // Carousel Data
  const carouselData = [
    { image: "/YRC_I1.jpg", text: "Lake Cleaning." },
    { image: "/YRC_I2.jpg", text: "Blood Donation Camp." },
    { image: "/YRC_I3.jpg", text: "V Paws." },
    { image: "/YRC_I4.jpg", text: "Heart Awareness Event." },
    { image: "/YRC_I5.jpg", text: "Eye Camp" },
    { image: "/YRC_I6.jpg", text: "old age home." },
  ];

 // Custom Arrow Components
const CustomPrevArrow = ({ onClick }) => (
  <button className="YRC-carousel-arrow YRC-carousel-prev" onClick={onClick}>
    &#10094;
  </button>
);

const CustomNextArrow = ({ onClick }) => (
  <button className="YRC-carousel-arrow YRC-carousel-next" onClick={onClick}>
    &#10095;
  </button>
);

// Updated Carousel Settings
const carouselSettings = {
  dots: true,
  infinite: true,
  speed: 1000,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  prevArrow: <CustomPrevArrow />,
  nextArrow: <CustomNextArrow />,
};

  return (
    <div>
      <Banner
        backgroundImage="https://kristujayanti.edu.in/studentlife/images/youth-red-cross-banner.jpg"
        headerText="Youth Red Cross (YRC)"
        subHeaderText="Fostering excellence in sports, fitness, and holistic development for students."
      />

      <div className="YRC-container">
        {/* About Us */}
        <div className="YRC-Aboutus">
          <h2 className="YRC-heading">
            <img src="/YRC_logo.jpg" alt="YRC Logo" className="YRC-icon" />
            ABOUT US
          </h2>
          <p className="YRC-content">
          The Youth Red Cross (YRC) is an integral part of the Indian Red Cross Society, dedicated to fostering humanitarian values among young individuals aged 18 to 25. As a student-led movement, YRC empowers its members to take charge, elect their own leaders, and actively engage in social service. Our initiatives focus on health care, education, disaster relief, and community welfare, instilling a sense of responsibility and compassion in the youth.  

          </p>
        </div>

        {/* Mission & Vision */}
        <div className="YRC-mission-vision-container">
          <div className="YRC-mission">
            <h2 className="YRC-heading">MISSION</h2>
            <p className="YRC-content">
            Our mission is to serve humanity by promoting health and hygiene, offering aid to the sick and needy, and providing relief during emergencies. Through activities such as blood donation drives, food distribution, and social care projects, we strive to build a society that prioritizes kindness, well-being, and inclusivity.  

            </p>
          </div>
          <div className="YRC-vision">
            <h2 className="YRC-heading">VISION</h2>
            <p className="YRC-content">
            We envision a world where young individuals lead with compassion and actively contribute to the betterment of society. By fostering national and international friendships, enhancing moral and mental capacities, and promoting social responsibility, we aim to create a future where humanity thrives in unity, resilience, and service.
            </p>
          </div>
        </div>

        {/* Coordinators Section */}
        <div className="YRC-coordinators-section">
          <h2 className="YRC-section-heading">COORDINATORS</h2>

          {/* Staff Coordinator */}
          <h3 className="YRC-subheading">Staff Coordinator</h3>
          <div className="YRC-faculty-coordinator">
            <div className="YRC-id-card">
              <img src={dummyCoordinators.staffCoordinator.photo} alt="Staff Coordinator" className="YRC-profile-pic" />
              <h4 className="YRC-name">{dummyCoordinators.staffCoordinator.name}</h4>
              <p className="YRC-role">{dummyCoordinators.staffCoordinator.role}</p>
            </div>
          </div>

          {/* Student Coordinators */}
          <h3 className="YRC-subheading">Student Coordinators</h3>
          <div className="YRC-student-coordinators">
            {dummyCoordinators.studentCoordinators.map((student, index) => (
              <div key={index} className="YRC-id-card">
                <img src={student.photo} alt={student.name} className="YRC-profile-pic" />
                <h4 className="YRC-name">{student.name}</h4>
                <p className="YRC-role">{student.role}</p>
                <div className="YRC-social-icons">
                  <a href={student.facebook} className="YRC-social-link"><FaFacebook /></a>
                  <a href={student.instagram} className="YRC-social-link"><FaInstagram /></a>
                  <a href={student.linkedin} className="YRC-social-link"><FaLinkedin /></a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-Scrolling Carousel */}
        <h2 className="YRC-heading">YRC ACTIVITES</h2>
        <div className="YRC-carousel-container">
          <Slider {...carouselSettings}>
            {carouselData.map((item, index) => (
              <div key={index} className="YRC-carousel-slide">
                <img src={item.image} alt="YRC Event" className="YRC-carousel-image" />
                <p className="YRC-carousel-text">{item.text}</p>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default YRC;
