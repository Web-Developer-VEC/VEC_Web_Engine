import React, { useEffect, useState } from "react";
import {
  FaBrain,
  FaCar,
  FaBuilding,
  FaLaptopCode,
  FaShieldAlt,
  FaBolt,
  FaBroadcastTower,
  FaMicrochip,
  FaDatabase,
  FaCogs,
  FaGraduationCap,
  FaBusinessTime,
  FaFlask,
  FaBook,
  FaCalculator,
  FaAtom,
  FaLanguage,
} from "react-icons/fa";
import LoadComp from "../../LoadComp";
import "./dapartment1.css";
import Banner from "../../Banner";

const ugDepartments = [
  { name: "B.E. Automobile Engineering", icon: <FaCar />, link: "/dept/002" },
  { name: "B.E. Civil Engineering", icon: <FaBuilding />, link: "/dept/004" },
  {
    name: "B.E. Computer Science and Engineering",
    icon: <FaLaptopCode />,
    link: "/dept/005",
  },
  {
    name: "B.E. Computer Science and Engineering (Cyber Security)",
    icon: <FaShieldAlt />,
    link: "/dept/006",
  },
  {
    name: "B.E. Electrical and Electronics Engineering",
    icon: <FaBolt />,
    link: "/dept/007",
  },
  {
    name: "B.E. Electronics and Communication Engineering",
    icon: <FaBroadcastTower />,
    link: "/dept/009",
  },
  {
    name: "B.E. Electronics and Instrumentation Engineering",
    icon: <FaMicrochip />,
    link: "/dept/008",
  },
  { name: "B.E. Mechanical Engineering", icon: <FaCogs />, link: "/dept/013" },
  {
    name: "B.Tech. Artificial Intelligence and Data Science",
    icon: <FaBrain />,
    link: "/dept/001",
  },
  { name: "B.Tech. Information Technology", icon: <FaDatabase />, link: "/dept/011" },
];

const pgDepartments = [
  {
    name: "M.E. Computer Science & Engineering",
    icon: <FaGraduationCap />,
    link: "/dept/005",
  },
  {
    name: "M.E. Power System Engineering",
    icon: <FaBolt />,
    link: "/dept/007",
  },
  {
    name: "M.B.A. Master of Business Administration",
    icon: <FaBusinessTime />,
    link: "/dept/017",
  },
];

const scienceHumanities = [
  { name: "Chemistry", icon: <FaFlask />, link: "/dept/003" },
  { name: "English", icon: <FaBook />, link: "/dept/010" },
  { name: "Mathematics", icon: <FaCalculator />, link: "/dept/012" },
  { name: "Physics", icon: <FaAtom />, link: "/dept/015" },
  { name: "Tamil", icon: <FaLanguage />, link: "/dept/014" },
];

const AcademicDepartments = () => {

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
    <>
      <Banner
        
        backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
        headerText="Department"
        subHeaderText="The NIRF is a comprehensive ranking system launched by the Ministry of Education, Government of India, in 2015."
      />
      <div className="department1-container">
        <h1 className="department1-heading">UG Courses</h1>
        <div className="department1-grid">
          {ugDepartments.map((dept, index) => (
            <div key={index} className="department1-department-card">
              <span className="department1-icon">{dept.icon}</span>
              <a href={dept.link} className="department1-department-link">
                {dept.name}
              </a>
            </div>
          ))}
        </div>

        <h1 className="department1-heading">PG Courses</h1>
        <div className="department1-grid">
          {pgDepartments.map((dept, index) => (
            <div key={index} className="department1-department-card">
              <span className="department1-icon">{dept.icon}</span>
              <a href={dept.link} className="department1-department-link">
                {dept.name}
              </a>
            </div>
          ))}
        </div>

        <h1 className="department1-heading">Science & Humanities</h1>
        <div className="department1-grid">
          {scienceHumanities.map((dept, index) => (
            <div key={index} className="department1-department-card">
              <span className="department1-icon">{dept.icon}</span>
              <a href={dept.link} className="department1-department-link">
                {dept.name}
              </a>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AcademicDepartments;
