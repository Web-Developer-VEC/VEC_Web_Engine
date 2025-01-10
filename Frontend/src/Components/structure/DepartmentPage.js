import React, { useState, useEffect } from "react";
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

const DepartmentPage = () => {
  const [activeSection, setActiveSection] = useState("Vision&Mission");
  const [isMobile, setIsMobile] = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case "HeadDepartment":
        return <HeadDepartment />;
      case "Vision&Mission":
        return <VisionMission />;
      case "Faculties":
        return <Faculties />;
      case "Activities":
        return <Activities />;
      case "Syllabus":
        return <CurriculumPage />;
      case "Infrastructure":
        return <Infrastructure />;
      case "StudentActivities":
        return <ImageCarousel />;
      case "SupportingStaff":
        return <Faculties />;
      case "Mous":
        return <MOU />;
      case "Research":
        return <Research />;
      default:
        return <HeadDepartment />;
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
