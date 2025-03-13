import { useState } from "react";
import "./Other-Facilities.css";
import Banner from "../Banner";

const facilities = [
  { 
    name: "Anna Auditorium", 
    content: "A spacious and well-equipped auditorium with modern audio-visual facilities, ideal for large events and gatherings.",
    images: ["/images/auditorium1.jpg", "/images/auditorium2.jpg", "/images/auditorium3.jpg", "/images/auditorium4.jpg", "/images/auditorium5.jpg"]
  },
  { 
    name: "Seminar Hall", 
    content: "A professional setting designed for academic seminars, workshops, and corporate meetings with state-of-the-art amenities.",
    images: ["/images/seminar1.jpg", "/images/seminar2.jpg", "/images/seminar3.jpg", "/images/seminar4.jpg", "/images/seminar5.jpg"]
  },
  { 
    name: "Health Center", 
    content: "A dedicated facility offering first aid, emergency care, and medical assistance for students and faculty members.",
    images: ["/images/health1.jpg", "/images/health2.jpg", "/images/health3.jpg", "/images/health4.jpg", "/images/health5.jpg"]
  },
  { 
    name: "Xerox", 
    content: "On-campus photocopying and printing services to help students and staff with their academic and administrative needs.",
    images: ["/images/xerox1.jpg", "/images/xerox2.jpg", "/images/xerox3.jpg", "/images/xerox4.jpg", "/images/xerox5.jpg"]
  },
  { 
    name: "Store", 
    content: "A well-stocked store providing essential academic supplies, stationery, and other student requirements.",
    images: ["/images/store1.jpg", "/images/store2.jpg", "/images/store3.jpg", "/images/store4.jpg", "/images/store5.jpg"]
  },
  { 
    name: "Sewage Treatment Plant", 
    content: "An advanced sewage treatment plant to promote water conservation and environmental sustainability on campus.",
    images: ["/images/sewage1.jpg", "/images/sewage2.jpg", "/images/sewage3.jpg", "/images/sewage4.jpg", "/images/sewage5.jpg"]
  },
  { 
    name: "RO (Reverse Osmosis)", 
    content: "A water purification system ensuring safe and clean drinking water for students and staff at all times.",
    images: ["/images/ro1.jpg", "/images/ro2.jpg", "/images/ro3.jpg", "/images/ro4.jpg", "/images/ro5.jpg"]
  },
  { 
    name: "Solar Power", 
    content: "Eco-friendly solar panels that contribute to renewable energy solutions, reducing the campus's carbon footprint.",
    images: ["/images/solar1.jpg", "/images/solar2.jpg", "/images/solar3.jpg", "/images/solar4.jpg", "/images/solar5.jpg"]
  },
  { 
    name: "Student Counsellor", 
    content: "A dedicated counselling service providing support and guidance for students' personal and academic growth.",
    images: ["/images/counsellor1.jpg", "/images/counsellor2.jpg", "/images/counsellor3.jpg", "/images/counsellor4.jpg", "/images/counsellor5.jpg"]
  },
  { 
    name: "Transport", 
    content: "A well-organized transport facility ensuring safe and convenient travel for students and staff across various locations.",
    images: ["/images/transport1.jpg", "/images/transport2.jpg", "/images/transport3.jpg", "/images/transport4.jpg", "/images/transport5.jpg"]
  },
  { 
    name: "Internet Bandwidth", 
    content: "High-speed internet connectivity across the campus to support academic research, online learning, and administrative operations.",
    images: ["/images/internet1.jpg", "/images/internet2.jpg", "/images/internet3.jpg", "/images/internet4.jpg", "/images/internet5.jpg"]
  },
  { 
    name: "Student & Staff Insurance Policy", 
    content: "Comprehensive insurance coverage ensuring safety and financial security for students and staff members.",
    images: ["/images/insurance1.jpg", "/images/insurance2.jpg", "/images/insurance3.jpg", "/images/insurance4.jpg", "/images/insurance5.jpg"]
  },
  { 
    name: "Quarters", 
    content: "On-campus residential quarters providing comfortable accommodation for faculty and staff.",
    images: ["/images/quarters1.jpg", "/images/quarters2.jpg", "/images/quarters3.jpg", "/images/quarters4.jpg", "/images/quarters5.jpg"]
  },
  { 
    name: "Canteen", 
    content: "A hygienic and well-maintained canteen offering a variety of delicious and nutritious food options.",
    images: ["/images/canteen1.jpg", "/images/canteen2.jpg", "/images/canteen3.jpg", "/images/canteen4.jpg", "/images/canteen5.jpg"]
  },
  { 
    name: "Fire Safety", 
    content: "Advanced fire safety measures and emergency preparedness systems to ensure campus security.",
    images: ["/images/fire1.jpg", "/images/fire2.jpg", "/images/fire3.jpg", "/images/fire4.jpg", "/images/fire5.jpg"]
  },
  { 
    name: "Power Backup", 
    content: "Uninterrupted power supply with backup generators to ensure continuous academic and administrative activities.",
    images: ["/images/power1.jpg", "/images/power2.jpg", "/images/power3.jpg", "/images/power4.jpg", "/images/power5.jpg"]
  },
  { 
    name: "Security", 
    content: "24/7 security personnel and surveillance cameras ensuring the safety of students, staff, and campus property.",
    images: ["/images/security1.jpg", "/images/security2.jpg", "/images/security3.jpg", "/images/security4.jpg", "/images/security5.jpg"]
  },
  { 
    name: "Gym", 
    content: "A well-equipped gymnasium promoting health and fitness for students and faculty members.",
    images: ["/images/gym1.jpg", "/images/gym2.jpg", "/images/gym3.jpg", "/images/gym4.jpg", "/images/gym5.jpg"]
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
