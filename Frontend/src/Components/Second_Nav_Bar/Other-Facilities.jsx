import { useState } from "react";
import "./Other-Facilities.css";
import Banner from "../Banner";
const facilities = [
  { 
    name: "Auditorium", 
    content: "The auditorium is well-equipped with modern audio-visual facilities and can accommodate large gatherings.",
    images: ["/images/auditorium1.jpg", "/images/auditorium2.jpg", "/images/auditorium3.jpg", "/images/auditorium4.jpg", "/images/auditorium5.jpg"]
  },
  { 
    name: "Seminar Hall", 
    content: "The seminar hall provides a professional setting for academic and corporate events.",
    images: ["/images/seminar1.jpg", "/images/seminar2.jpg", "/images/seminar3.jpg", "/images/seminar4.jpg", "/images/seminar5.jpg"]
  },
  { 
    name: "Cafeteria", 
    content: "The cafeteria offers a variety of hygienic and delicious food options for students and staff.",
    images: ["/images/cafeteria1.jpg", "/images/cafeteria2.jpg", "/images/cafeteria3.jpg", "/images/cafeteria4.jpg", "/images/cafeteria5.jpg"]
  },
  { 
    name: "Health Center", 
    content: "The health center ensures medical facilities and first aid assistance to students and faculty.",
    images: ["/images/health1.jpg", "/images/health2.jpg", "/images/health3.jpg", "/images/health4.jpg", "/images/health5.jpg"]
  },
  { 
    name: "Physical & Sports", 
    content: "A dedicated space for physical fitness and various sports activities.",
    images: ["/images/sports1.jpg", "/images/sports2.jpg", "/images/sports3.jpg", "/images/sports4.jpg", "/images/sports5.jpg"]
  },
  { 
    name: "Green Campus", 
    content: "The campus is eco-friendly with abundant greenery promoting sustainability.",
    images: ["/images/green1.jpg", "/images/green2.jpg", "/images/green3.jpg", "/images/green4.jpg", "/images/green5.jpg"]
  },
  { 
    name: "Security", 
    content: "24/7 security personnel and surveillance cameras ensure safety on campus.",
    images: ["/images/security1.jpg", "/images/security2.jpg", "/images/security3.jpg", "/images/security4.jpg", "/images/security5.jpg"]
  }
];

export default function OtherFacilities() {
  const [activeTab, setActiveTab] = useState(facilities[0].name);
  const [imageIndex, setImageIndex] = useState(0);

  const currentFacility = facilities.find((facility) => facility.name === activeTab);
  
  const nextImage = () => {
    setImageIndex((prevIndex) => (prevIndex + 1) % currentFacility.images.length);
  };

  const prevImage = () => {
    setImageIndex((prevIndex) => (prevIndex - 1 + currentFacility.images.length) % currentFacility.images.length);
  };

  return (

    <> 
    <Banner
      backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
      headerText="OTHER FACILITES"
      subHeaderText="Fostering excellence in social service and community well-being."
    />
    <div className="facilities-container">

      {/* Tabs */}
      <div className="tabs-container">
        {facilities.map((facility) => (
          <button
            key={facility.name}
            className={`tab-button ${activeTab === facility.name ? "active-tab" : ""}`}
            onClick={() => {
              setActiveTab(facility.name);
              setImageIndex(0); // Reset image index when switching tabs
            }}
          >
            {facility.name}
          </button>
        ))}
      </div>

      {/* Content Section */}
      <div className="content-container">
        <p>{currentFacility.content}</p>

        {/* Image Carousel */}
        <div className="carousel">
          <button className="prev" onClick={prevImage}>❮</button>
          <img src={currentFacility.images[imageIndex]} alt={activeTab} className="carousel-img" />
          <button className="next" onClick={nextImage}>❯</button>
        </div>
      </div>
    </div>
    </>
  );
}
