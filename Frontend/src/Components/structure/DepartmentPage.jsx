import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import HeadDepartment from "./sections/HeadDepartment";
import Activities from "./sections/activities";
import Infrastructure from "./sections/Infrastructure";
import VisionMission from "./sections/VisionMission";
import Faculties from "./sections/Faculties";
import ImageCarousel from "./sections/Student_activities";
import CurriculumPage from "./sections/CurriculamPage";
import MOU from "./sections/mou";
import Research from "./sections/RD";
import Conference from "./sections/Conference";
import styles from "./HeadDepartment.module.css"; 
import college from "../Assets/college.jpeg";

const DepartmentPage = () => {
  const { deptID } = useParams();
  const [activeSection, setActiveSection] = useState(null);
  const [availableSections, setAvailableSections] = useState([]);
  const [sectionData, setSectionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  console.log("ajith",activeSection)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
  
    handleResize(); // Call it immediately after defining it
    window.addEventListener("resize", handleResize);
  
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  


  useEffect(() => {
    if (!activeSection) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/${deptID}/${activeSection.toLowerCase()}`);
        setSectionData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [deptID, activeSection]);
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await axios.get(`/api/${deptID}/sidebar`);
        console.log("API Response:", response.data);
        const validSections = response.data.content
          .filter((section) => section.hascontent)
          .map((section) => section.id);
        
        setAvailableSections(validSections);
        setActiveSection(validSections[0] || null); // Set first available section
      } catch (error) {
        console.error("Error fetching sections:", error.message);
        setError("Failed to fetch sections.");
      }
    };
    fetchSections();
  }, [deptID]);
  const renderSection = () => {
    switch (activeSection) {
      case "HeadDepartment":
        return <HeadDepartment data={sectionData} />;
      case "Vision&Mission":
        return <VisionMission data={sectionData} />;
      case "Faculties":
        return <Faculties data={sectionData} />;
      case "Activities":
        return <Activities data={sectionData} />;
      case "Syllabus":
        return <CurriculumPage data={sectionData} />;
      case "Infrastructure":
        return <Infrastructure data={sectionData} />;
      case "StudentActivities":
        return <ImageCarousel data={sectionData} />;
      case "SupportingStaff":
        return <Faculties data={sectionData} />;
      case "Mous":
        return <MOU data={sectionData} />;
      case "Research":
        return <Research data={sectionData} />;
      case "Conference":
        return <Conference data={sectionData} />;
      default:
        return <VisionMission data={sectionData} />;
    }
  };

  if (!availableSections.length) return <div>Loading sections...</div>;

  return (
    <div className={styles.main}>
      {loading && (
          <div className={styles.loadingscreen}>
            <div className={styles.spinner}></div>
              Loading...
            </div>
        )}
      {/* Header */}
      <div className={styles.header}>
        <img src={college} alt="Department Header" className={styles.fullWidthImage} />
        <div className={styles.overlay}>
          <h1 className={styles.overlayText}>{sectionData?.department_name}</h1>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row", // Sidebar on top in mobile, right in desktop
        }}
      >
        {/* Sidebar */}
        <Sidebar 
          sections={availableSections} 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
        />
        {/* Main content */}
        <div style={{ flex: 1, padding: "20px" }}>{renderSection()}</div>
      </div>
    </div>
  );
};

export default DepartmentPage;
