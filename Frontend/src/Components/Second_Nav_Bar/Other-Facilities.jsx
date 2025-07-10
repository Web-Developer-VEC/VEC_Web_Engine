import { useEffect, useState } from "react";
import "./Other-Facilities.css";
import Banner from "../Banner";
import LoadComp from "../LoadComp";

const facilities = [
  { 
    name: "Anna Auditorium",
    img_name: ["Anna Auditorium"], 
    content: ["A spacious and well-equipped auditorium with modern audio-visual facilities, ideal for large events and gatherings with accommodation around 2500"],
    images: ["/static/images/other_facilities/Anna Auditorium/Anna Auditorium 1.webp"]
  },
  { 
    name: "Seminar Hall", 
    img_name: ["Vivekananda Hall", "Placement Seminar Hall", "Sarojini Naidu Seminar Hall", "Billgate Seminar Hall "],
    content: ["Vivekananda Hall is an air-conditioned venue equipped with state-of-the-art facilities and can accommodate approximately 300 people", "Placement Seminar Hall is an air-conditioned venue equipped with state-of-the-art facilities and can accommodate approximately 120 people", "Sarojini Naidu Seminar Hall is an air-conditioned venue equipped with state-of-the-art facilities and can accommodate approximately 150 people", "Billgate Seminar Hall is an air-conditioned venue equipped with state-of-the-art facilities and can accommodate approximately 50 people"],
    images: ["/static/images/other_facilities/Seminar Halls/Vivehananda Seminar Hall.webp", "/static/images/other_facilities/Seminar Halls/Vivehananda Seminar Hall.webp", "/static/images/other_facilities/Seminar Halls/Vivehananda Seminar Hall.webp", "/static/images/other_facilities/Seminar Halls/Vivehananda Seminar Hall.webp"]
  },
  { 
    name: "On-Campus Medical Facility ", 
    img_name: ["First Aid Medicines"],
    content: ["Velammal Engineering College provides a full-time medical facility with a qualified doctor and nurse available to attend to any health emergencies. The medical center is equipped with basic necessary equipment, and an ambulance service is on standby to handle emergencies and ensure the well-being of students and staff."],
    images: ["/static/images/other_facilities/Health Centre/HC 1.webp","/static/images/other_facilities/Health Centre/HC 3.webp","/static/images/other_facilities/Health Centre/HC 4.webp","/static/images/other_facilities/Health Centre/HC 5.webp","/static/images/other_facilities/Health Centre/HC 6.webp"]
  },
  { 
    name: "Reprographic facility", 
    img_name: ["Printing Services"],
    content: ["The college has reprographic facility available for students which functions from 8:30 AM to 6:00 PM. It is located opposite to BILL GATES BLOCK in the Velammal Engineering College."],
    images: ["/static/images/other_facilities/Repographic Facility/RF 1.webp","/static/images/other_facilities/Repographic Facility/RF 3.webp"]
  },
  { 
    name: "Store", 
    img_name: ["Stationary Shop"],
    content: ["A well-stocked store providing essential academic supplies, stationery, and other student requirements."],
    images: ["/static/images/other_facilities/VE Store/VE Store 1.webp","/static/images/other_facilities/VE Store/VE Store 2.webp"]
  },
  { 
    name: "Sewage Treatment Plant", 
    img_name: ["Purification Plant"],
    content: ["The Sewage Treatment Plant is designed for a capacity of 2,00,000 LITRES/DAYTreatment Scheme for the Existing Plant The plant operates 24x7 with regular maintenance, utilizing a three-stage treatment process: Primary Treatment: Bar screening and sedimentation in a Primary Clarifier. Secondary Treatment: Activated Sludge Process with four aeration tanks and a circular clarifier. Tertiary Treatment: Final polishing using Sand & Activated Carbon Filters for removing solids, color, and odor.Additionally, the plant includes sludge drying beds and treated water storage for efficient waste management."],
    images: ["/static/images/other_facilities/Sewage Plant/Sweage Plant 1.webp","/static/images/other_facilities/Sewage Plant/Sweage Plant 2.webp","/static/images/other_facilities/Sewage Plant/Sweage Plant.webp"]
  },
  { 
    name: "RO (Reverse Osmosis)", 
    img_name: ["Water Plant"],
    content: ["The RO plant in the campus is designed for a Capacity of 5000L/hr. The treated water is pumped using the Pneumatic pumping system and distributed for drinking purpose in the campus. Regular maintenance of the plant is done and water tested to confirm that the quality meets BIS ( IS 10500:2012) standards."],
    images: ["/static/images/other_facilities/RO/RO 1.webp","/static/images/other_facilities/RO/RO 2.webp"]
  },
  { 
    name: "Solar Power", 
    img_name: ["Renewable Power Sources"],
    content: ["Based on the various measures taken by both state and central Govt policies as a promotional measure of enhancing the installed capacity of the Solar Power plants across T.N. M/s. Velammal Educational trust established a 10 MW Solar P.N power plant at Manjalkudi Village TiruppuvanamTaluk, Sivagangai District. The plant was commissioned on 19.03.2019"],
    images: ["/static/images/other_facilities/Solar Power/SP 1.webp","/static/images/other_facilities/Solar Power/SP 2.webp"]
  },
  { 
    name: "Student Counseling Services", 
    img_name: ["Student Guidance Services"],
    content: ["Our college provides a full-time qualified Student Counselor to support students' academic, emotional, and personal well-being, ensuring a healthy and positive learning environment."],
    images: ["/static/images/other_facilities/Student Councellor/Student Councellor.webp","/static/images/other_facilities/Student Councellor/Student Councellor 2.webp"]
  },
  { 
    name: "Transport",
    img_name: ["Bus Services"], 
    content: ["Our college offers fully air-conditioned buses covering all major routes across the city, ensuring comfortable and convenient transportation for students."],
    images: ["/static/images/other_facilities/Transport/Bus View 1.webp","/static/images/other_facilities/Transport/Bus View 2.webp","/static/images/other_facilities/Transport/Bus View 3.webp","/static/images/other_facilities/Transport/Bus View 4.webp","/static/images/other_facilities/Transport/Bus View 5.webp"]
  },
  { 
    name: "High-Speed Internet Facility", 
    img_name: ["Broadband Access"],
    content: ["Our college provides a 1 Gbps high-speed internet connection, ensuring seamless access to online resources, research materials, and digital learning platforms for students and faculty."],
    images: ["/static/images/other_facilities/High Speed Internet Facility/Airtel 1.webp","/static/images/other_facilities/High Speed Internet Facility/BSNL.webp","/static/images/other_facilities/High Speed Internet Facility/NIA .webp","/static/images/other_facilities/High Speed Internet Facility/Tata.webp"]
  },
  { 
    name: "Group Insurance Policy ", 
    img_name: ["Group Insurance Policy "],
    content: ["Our institution provides a comprehensive Group Insurance Policy through United India Insurance covering:Teaching & Non-Teaching Staff: 433 members Students: 3,522 members This initiative ensures financial security and support for our faculty, staff, and students."],
    images: ["/static/images/other_facilities/Group Insurance Policy/RSA 1.webp"]
  },
  { 
    name: "Faculty Accommodation", 
    img_name: ["Faculty Residence"],
    content: ["Velammal Engineering College has faculty quarters with 16 single-bedroom houses and 16 two-bedroom houses, providing comfortable and convenient housing for faculty members. Thesequarters are well-maintained and provide a peaceful comfortable living environment, allowing faculty to reside on campus while focusing on their job. The setup allows faculty to easily access the college's resources and engage in campus events."],
    images: ["/static/images/other_facilities/Faculty Accomodation/Faculty Accomodation 1.webp"]
  },
  { 
    name: "Spacious Food Canteen", 
    img_name: ["Capacious dining hall"],
    content: ["Our college has a well-equipped canteen with ample seating capacity to accommodate a large number of students, offering hygienic and nutritious meals in a comfortable dining environment."],
    images: ["/static/images/other_facilities/Canteen/Canteen 1.webp","/static/images/other_facilities/Canteen/Canteen 2.webp","/static/images/other_facilities/Canteen/Canteen 3.webp"]
  },
  { 
    name: "Fire Extinguisher",
    img_name: ["Fire Extinguisher"], 
    content: ["Velammal Engineering College has comprehensive fire safety measures, including fire extinguishers, sand buckets, and water hoses in all blocks. The water hose inlets are strategically placed on the ground floor of each block to ensure quick access during emergencies."],
    images: ["/static/images/other_facilities/Fire Safety/FS 1.webp","/static/images/other_facilities/Fire Safety/FS 2.webp","/static/images/other_facilities/Fire Safety/FS 3.webp","/static/images/other_facilities/Fire Safety/FS 4.webp","/static/images/other_facilities/Fire Safety/FS 5.webp","/static/images/other_facilities/Fire Safety/FS 6.webp"]
  },
  { 
    name: "Power Backup", 
    img_name: ["Backup power Supply"],
    content: ["Uninterrupted power supply with backup generators to ensure continuous academic and administrative activities."],
    images: ["/static/images/other_facilities/Power Backup/PB 1.webp","/static/images/other_facilities/Power Backup/PB 2.webp","/static/images/other_facilities/Power Backup/PB 3.webp","/static/images/other_facilities/Power Backup/PB 4.webp","/static/images/other_facilities/Power Backup/PB 6.webp","/static/images/other_facilities/Power Backup/PB 7.webp"]
  },
  { 
    name: "Surveillance & Security", 
    img_name: ["Supervision and Safeguard"],
    content: ["Velammal Engineering College ensures student safety with a robust CCTV surveillance system covering the entire campus. The main administrators and chief security officers continuously monitor the feeds to prevent unauthorized access, maintain discipline, and respond to emergencies. This system helps detect suspicious activities and resolve conflicts efficiently. Additionally, the college has a dedicated security department with 24 trained personnel guarding the campus 24/7, ensuring a safe and secure environment for all."],
    images: ["/static/images/other_facilities/Security/CCTV 1.webp","/static/images/other_facilities/Security/CCTV 2.webp","/static/images/other_facilities/Security/CCTV 3.webp","/static/images/other_facilities/Security/CCTV 4.webp","/static/images/other_facilities/Security/Security Room 1.webp","/static/images/other_facilities/Security/Security Room 2.webp"]
  },
  { 
    name: "Gym Facility",
    img_name: ["Fitness Studio"],
    content: ["Our college features a modern gym with essential fitness machines and equipment, promoting a healthy and active lifestyle for students and staff."],
    images: ["/static/images/other_facilities/Gym/fitnesscenter.webp","/static/images/other_facilities/Gym/gym.webp","/static/images/other_facilities/Gym/ladies_hostel_gym.webp"]
  },
  { 
    name: "Temple",
    img_name: ["Velmurugan Temple"],
    content: ["Our college features a modern Velmurugan temple to provide better lifestyle for students and staff."],
    images: ["/static/images/other_facilities/Temple/Temple.webp"]
  },

];


export default function OtherFacilities({ theme, toggle}) {
  const [activeTab, setActiveTab] = useState(facilities[0].name);
  const [imageIndex, setImageIndex] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const currentFacility = facilities.find((facility) => facility.name === activeTab);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
      return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };
  
  const nextImage = () => {
    setImageIndex((prevIndex) => (prevIndex + 1) % currentFacility.images.length);
  };

  const prevImage = () => {
    setImageIndex((prevIndex) => (prevIndex - 1 + currentFacility.images.length) % currentFacility.images.length);
  };

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

    <> 
    <Banner
      toggle={toggle} theme={theme}
      backgroundImage="./Banners/Others.webp"
      headerText="OTHER FACILITES"
      subHeaderText="Fostering excellence in social service and community well-being."
    />
    <div className="facilities-container bg-prim dark:bg-drkp">

      {/* Tabs */}
      <div className="tabs-container">
        {facilities.map((facility) => (
          <button
            key={facility.name}
            className={`tab-button ${activeTab === facility.name ? "active-tab" : ""} bg-secd dark:bg-drks text-text`}
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
        {currentFacility.img_name.length > 1 ? (
          <h2 className="current-facility text-brwn dark:text-drkt">{currentFacility.img_name[imageIndex]}</h2>
        ) : (
        <h2 className="current-facility text-brwn dark:text-drkt">{currentFacility.img_name}</h2>
        )}
        {currentFacility.content.length > 1 ? (
          <p>{currentFacility.content[imageIndex]}</p>
        ) : (
          <p>{currentFacility.content}</p>
        )}

        {/* Image Carousel */}
        <div className="carousel">
          <button className="prev" onClick={prevImage}>❮</button>
          <img src={UrlParser(currentFacility.images[imageIndex])} alt={activeTab} className="carousel-img" />
          <button className="next" onClick={nextImage}>❯</button>
        </div>
      </div>
    </div>
    </>
  );
}
