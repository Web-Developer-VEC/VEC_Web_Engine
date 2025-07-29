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
import axios from "axios";

const AcademicDepartments = ({ theme , toggle }) => {

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [departments,setDepartments] = useState(null);

  const iconMap = {
  "Automobile": <FaCar />,
  "Civil": <FaBuilding />,
  "Computer Science": <FaLaptopCode />,
  "Cyber Security": <FaShieldAlt />,
  "Electrical": <FaBolt />,
  "Electronics and Communication": <FaBroadcastTower />,
  "Electronics and Instrumentation": <FaMicrochip />,
  "Mechanical": <FaCogs />,
  "Artificial Intelligence": <FaBrain />,
  "Information Technology": <FaDatabase />,
  "Chemistry": <FaFlask />,
  "English": <FaBook />,
  "Mathematics": <FaCalculator />,
  "Physics": <FaAtom />,
  "Tamil": <FaLanguage />,
  "Business Administration": <FaBusinessTime />,
  "Power System": <FaBolt />,
  "M.E.": <FaGraduationCap />,
};

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responce = await axios.post('/api/main-backend/academics',
          {
            type: "departments_list"
          }
        );
        const data = responce.data.data;
        
        setDepartments(data)
        
      } catch (error) {
        console.error("error fetching Department List Data",error);
      }
    }
    fetchData();
  }, [])

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
      toggle={toggle}
      theme={theme}
      backgroundImage="./Banners/academicsbanner.webp"
      headerText="Department"
      subHeaderText="Each department represents a gateway to discovery, innovation, and personal growth—together forming the academic foundation of our institution."
    />
    {departments ? (
        <div className="department1-container">
          {departments &&
            departments?.map((categoryObj, index) => {

              return (
                <div key={index}>
                  <h1 className="department1-heading text-brwn dark:text-prim">
                    {categoryObj?.category}
                  </h1>
                  <div className="department1-grid">
                    {categoryObj?.content?.map((dept, i) => {
                      // Find icon
                      const matchedKey = Object.keys(iconMap).find((key) =>
                        dept.name.includes(key)
                      );
                      const IconComponent = matchedKey ? iconMap[matchedKey] : <FaGraduationCap />;

                      return (
                        <div
                          key={i}
                          className="department1-department-card bg-prim dark:bg-drkts"
                        >
                          <span className="department1-icon">{IconComponent}</span>
                          <a
                            href={dept.link}
                            className="department1-department-link text-text dark:text-drkt"
                          >
                            {dept.name}
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
    ) : (
        <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
          <LoadComp txt={""} />
        </div>
    )}

  </>
);

};

export default AcademicDepartments;
