import React, { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import HeadDepartment from "./sections/HeadDepartment";
import Activities from "./sections/activities";
import Infrastructure from "./sections/Infrastructure";
import VisionMission from "./sections/VisionMission";
import Newsletter from "./sections/newsletter";
import Faculties from "./sections/Faculties";
import ImageCarousel from "./sections/Student_activities";
import CurriculumPage from "./sections/CurriculamPage";
import MOU from "./sections/mou";
import Research from "./sections/RD";
import Conference from "./sections/Conference";
import styles from "./HeadDepartment.module.css";
import college from "../../Assets/college.jpeg";
import Toggle from "../../Toggle";
import LoadComp from "../../LoadComp";

const DepartmentPage = ({ theme, toggle }) => {
  const { deptID } = useParams();
  const location = useLocation();

  // Initialize activeSection based on location.state or a default value
  const [activeSection, setActiveSection] = useState(
    location.state?.activeSection || "Vision&Mission"
  );

  const [availableSections, setAvailableSections] = useState([]);
  const [sectionData, setSectionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const contentRef = useRef(null);
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

  // Update activeSection if location.state changes
  useEffect(() => {
    if (location.state?.activeSection) {
      setActiveSection(location.state.activeSection);
    }
  }, [location.state]);

  const handleSection = (section) => {
    setActiveSection(section);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // Call it immediately
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch data for the active section
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

    // Scroll to the content section on mobile
    setTimeout(() => {
      if (isMobile && contentRef.current) {
        contentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        document.body.style.height = "auto";
        void document.body.offsetHeight; // Trigger reflow
      }
    }, 100);
  }, [deptID, activeSection, isMobile]);

  // Fetch available sections
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await axios.get(`/api/${deptID}/sidebar`);
        const validSections = response.data.content
          .filter((section) => section.hascontent)
          .map((section) => section.id);

        setAvailableSections(validSections);

        // Only set activeSection to the first available section if it hasn't been set yet
        if (!location.state?.activeSection && validSections.length > 0) {
          setActiveSection(validSections[0]);
        }
      } catch (error) {
        console.error("Error fetching sections:", error.message);
        setError("Failed to fetch sections.");
      }
    };

    fetchSections();
  }, [deptID, location.state?.activeSection]);

  const renderSection = () => {
    // if (activeSection === "Syllabus") {
    //   console.log("Rendering CurriculumPage with data:", sectionData); // Debugging
    //   return <CurriculumPage theme={theme} toggle={toggle} data={sectionData} />;
    // }

    console.log(`Render ${activeSection}`);
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
      case "StudentAchievments":
        return <ImageCarousel data={sectionData} />;
      case "Mous":
        return <MOU data={sectionData} />;
      case "Research":
        return <Research data={sectionData} />;
      case "Conference":
        return <Conference data={sectionData} />;
      case "NewsLetter":
        return <Newsletter data={sectionData} />;
      default:
        return <VisionMission data={sectionData} />;
    }
  };

  if (!availableSections.length) return <div className={" grid grid-cols-1 place-content-center top-14 h-screen"}>
      <LoadComp txt={""}/>
    </div>
  if (!isOnline) return <div className={" grid grid-cols-1 place-content-center top-13 h-screen"}>
      <LoadComp txt={"You are offline. Please check your internet connection."}/>
    </div>

  return (
    <div className={styles.main}>
      {/* Header */}
      <div className={styles.header}>
        <Toggle attr="absolute top-3 right-0 md:right-24  float-right  z-9999  h-12 w-12 z-[100000]" toggle={toggle} theme={theme} />
        <img src={`/Banners/Dept_banner/${sectionData?.dept_id}.webp`} alt="Department Header" className={styles.fullWidthImage} />
        <div className={styles.overlay}>
          <h1 className={styles.overlayText}>{sectionData?.department_name}</h1>
        </div>
      </div>
      {loading ? (
        <div className={"grid grid-cols-1 place-content-center top-14 h-screen"}>
          <LoadComp />
        </div>
      ) : (
        <>
        
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row" }}>
            {/* Sidebar */}
            <Sidebar
              sections={availableSections}
              activeSection={activeSection}
              setActiveSection={handleSection}
            />
            {/* Main content */}
            <div ref={contentRef} className="text-text dark:text-drkt" style={{ flex: 1, padding: "20px" }}>
              {renderSection()}
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default DepartmentPage;