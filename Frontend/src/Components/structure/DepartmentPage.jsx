import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios"; // Import Axios
import Sidebar from "./Sidebar";
import HeadDepartment from "./sections/HeadDepartment";
import Activities from "./sections/activities";
import styles from "./HeadDepartment.module.css"; // Assuming you're using CSS modules
import Infrastructure from "./sections/Infrastructure";
import college from "../Assets/college.jpeg";
import VisionMission from "./sections/VisionMission";
import Faculties from "./sections/Faculties";
import ImageCarousel from "./sections/Student_activities";
import CurriculumPage from "./sections/CurriculamPage";
import MOU from "./sections/mou";
import Research from "./sections/RD";
import Conference from "./sections/Conference";

const DepartmentPage = () => {
  const { deptID } = useParams(); // Get departmentID from the URL
  console.log("Params:", deptID);
  const [activeSection, setActiveSection] = useState("Vision&Mission");
  const [isMobile, setIsMobile] = useState(false);
  const [sectionData, setSectionData] = useState(null); // Store backend data for the active section
  const [loading, setLoading] = useState(true); // Loading state for fetch calls
  const [error, setError] = useState(null); // Error state for fetch calls


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
        return <Research setActiveSection={setActiveSection} data={sectionData} />;
      case "Conference":
        return <Conference data={sectionData} />;
      default:
        return <HeadDepartment data={sectionData} />;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Adjust 768px for tablets and mobile
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call it once to set the initial state
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state
        const response = await axios.get(`/api/${deptID}/${activeSection.toLowerCase()}`);
        console.log(response)

        setSectionData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (activeSection) {
      fetchData();
    }
  }, [deptID, activeSection]);
  
  

  if (loading) {
    return <div>Loading...</div>; // Display a loading state
  }

  if (error) {
    return <div>Error: {error}</div>; // Display an error state
  }

  return (
    <div>
      {/* Header section */}
      <div className={styles.header}>
        <img
          src={college}
          alt="Department Header"
          className={styles.fullWidthImage}
        />
        <div className={styles.overlay}>
          <h1 className={styles.overlayText}>
            Artificial Intelligence and Data Science (AI&DS)
          </h1>
        </div>
      </div>

      {/* Main content and sidebar */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row", // Sidebar on top in mobile, right in desktop
        }}
      >
        {/* Sidebar */}
        <Sidebar setActiveSection={setActiveSection} />

        {/* Main content */}
        <div style={{ flex: 1, padding: "20px" }}>{renderSection()}</div>
      </div>
    </div>
  );
};

export default DepartmentPage;
