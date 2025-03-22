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
    name: "On-Campus Medical Facility ", 
    content: "Velammal Engineering College provides a full-time medical facility with a qualified doctor and nurse available to attend to any health emergencies. The medical center is equipped with basic necessary equipment, and an ambulance service is on standby to handle emergencies and ensure the well-being of students and staff.",
    images: ["/images/health1.jpg", "/images/health2.jpg", "/images/health3.jpg", "/images/health4.jpg", "/images/health5.jpg"]
  },
  { 
    name: "reprographic facility ", 
    content: "The college has reprographic facility available for students which functions from 8:30 AM to 6:00 PM. It is located opposite to BILL GATES BLOCK in the Velammal Engineering College.",
    images: ["/images/xerox1.jpg", "/images/xerox2.jpg", "/images/xerox3.jpg", "/images/xerox4.jpg", "/images/xerox5.jpg"]
  },
  { 
    name: "Store", 
    content: "A well-stocked store providing essential academic supplies, stationery, and other student requirements.",
    images: ["/images/store1.jpg", "/images/store2.jpg", "/images/store3.jpg", "/images/store4.jpg", "/images/store5.jpg"]
  },
  { 
    name: "Sewage Treatment Plant", 
    content: "The Sewage Treatment Plant is designed for a capacity of 2,00,000 LITRES/DAYTreatment Scheme for the Existing Plant The plant operates 24x7 with regular maintenance, utilizing a three-stage treatment process: Primary Treatment: Bar screening and sedimentation in a Primary Clarifier. Secondary Treatment: Activated Sludge Process with four aeration tanks and a circular clarifier. Tertiary Treatment: Final polishing using Sand & Activated Carbon Filters for removing solids, color, and odor.Additionally, the plant includes sludge drying beds and treated water storage for efficient waste management.",
    images: ["/images/sewage1.jpg", "/images/sewage2.jpg", "/images/sewage3.jpg", "/images/sewage4.jpg", "/images/sewage5.jpg"]
  },
  { 
    name: "RO (Reverse Osmosis)", 
    content: "The RO plant in the campus is designed for a Capacity of 5000L/hr. The treated water is pumped using the Pneumatic pumping system and distributed for drinking purpose in the campus. Regular maintenance of the plant is done and water tested to confirm that the quality meets BIS ( IS 10500:2012) standards.",
    images: ["/images/ro1.jpg", "/images/ro2.jpg", "/images/ro3.jpg", "/images/ro4.jpg", "/images/ro5.jpg"]
  },
  { 
    name: "Solar Power", 
    content: "Based on the various measures taken by both state and central Govt policies as a promotional measure of enhancing the installed capacity of the Solar Power plants across T.N. M/s. Velammal Educational trust established a 10 MW Solar P.N power plant at Manjalkudi Village TiruppuvanamTaluk, Sivagangai District. The plant was commissioned on 19.03.2019",
    images: ["/images/solar1.jpg", "/images/solar2.jpg", "/images/solar3.jpg", "/images/solar4.jpg", "/images/solar5.jpg"]
  },
  { 
    name: "Student Counseling Services", 
    content: "Our college provides a full-time qualified Student Counselor to support students' academic, emotional, and personal well-being, ensuring a healthy and positive learning environment.",
    images: ["/images/counsellor1.jpg", "/images/counsellor2.jpg", "/images/counsellor3.jpg", "/images/counsellor4.jpg", "/images/counsellor5.jpg"]
  },
  { 
    name: "Transport", 
    content: "Our college offers fully air-conditioned buses covering all major routes across the city, ensuring comfortable and convenient transportation for students.",
    images: ["/images/transport1.jpg", "/images/transport2.jpg", "/images/transport3.jpg", "/images/transport4.jpg", "/images/transport5.jpg"]
  },
  { 
    name: "High-Speed Internet Facility", 
    content: "Our college provides a 1 Gbps high-speed internet connection, ensuring seamless access to online resources, research materials, and digital learning platforms for students and faculty.",
    images: ["/images/internet1.jpg", "/images/internet2.jpg", "/images/internet3.jpg", "/images/internet4.jpg", "/images/internet5.jpg"]
  },
  { 
    name: "Group Insurance Policy ", 
    content: "Our institution provides a comprehensive Group Insurance Policy through United India Insurance covering:Teaching & Non-Teaching Staff: 433 members Students: 3,522 members This initiative ensures financial security and support for our faculty, staff, and students.",
    images: ["/images/gym1.jpg", "/images/gym2.jpg", "/images/gym3.jpg", "/images/gym4.jpg", "/images/gym5.jpg"]
  },
  { 
    name: "Faculty Accommodation", 
    content: "Velammal Engineering College has faculty quarters with 16 single-bedroom houses and 16 two-bedroom houses, providing comfortable and convenient housing for faculty members. Thesequarters are well-maintained and provide a peaceful comfortable living environment, allowing faculty to reside on campus while focusing on their job. The setup allows faculty to easily access the college's resources and engage in campus events.",
    images: ["/images/quarters1.jpg", "/images/quarters2.jpg", "/images/quarters3.jpg", "/images/quarters4.jpg", "/images/quarters5.jpg"]
  },
  { 
    name: "Spacious Food Canteen", 
    content: "Our college has a well-equipped canteen with ample seating capacity to accommodate a large number of students, offering hygienic and nutritious meals in a comfortable dining environment.",
    images: ["/images/canteen1.jpg", "/images/canteen2.jpg", "/images/canteen3.jpg", "/images/canteen4.jpg", "/images/canteen5.jpg"]
  },
  { 
    name: "Fire Extinguisher", 
    content: "Velammal Engineering College has comprehensive fire safety measures, including fire extinguishers, sand buckets, and water hoses in all blocks. The water hose inlets are strategically placed on the ground floor of each block to ensure quick access during emergencies.",
    images: ["/images/fire1.jpg", "/images/fire2.jpg", "/images/fire3.jpg", "/images/fire4.jpg", "/images/fire5.jpg"]
  },
  { 
    name: "Power Backup", 
    content: "Uninterrupted power supply with backup generators to ensure continuous academic and administrative activities.",
    images: ["/images/power1.jpg", "/images/power2.jpg", "/images/power3.jpg", "/images/power4.jpg", "/images/power5.jpg"]
  },
  { 
    name: "Surveillance & Security", 
    content: "Velammal Engineering College ensures student safety with a robust CCTV surveillance system covering the entire campus. The main administrators and chief security officers continuously monitor the feeds to prevent unauthorized access, maintain discipline, and respond to emergencies. This system helps detect suspicious activities and resolve conflicts efficiently. Additionally, the college has a dedicated security department with 24 trained personnel guarding the campus 24/7, ensuring a safe and secure environment for all.",
    images: ["/images/security1.jpg", "/images/security2.jpg", "/images/security3.jpg", "/images/security4.jpg", "/images/security5.jpg"]
  },
  { 
    name: "Gym Facility", 
    content: "Our college features a modern gym with essential fitness machines and equipment, promoting a healthy and active lifestyle for students and staff.",
    images: ["/images/gym1.jpg", "/images/gym2.jpg", "/images/gym3.jpg", "/images/gym4.jpg", "/images/gym5.jpg"]
  },

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
