import React, { useState, useEffect, useRef } from "react";
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
import college from "../../Assets/college.jpeg";
import Sun from "../../Assets/sun.png";
import Moon from "../../Assets/moon.png";
import Cookies from "universal-cookie";
import Toggle from "../../Toggle";

const DepartmentPage = ({theme, toggle}) => {
  const { deptID } = useParams();
  const cookies = new Cookies()
  if(cookies.get(`${deptID}_sec`) === undefined) cookies.set(`${deptID}_sec`, "HeadDepartment");
  const [activeSection, setActiveSection] = useState(cookies.get(`${deptID}_sec`));
  console.log(activeSection)
  const [availableSections, setAvailableSections] = useState([]);
  const [sectionData, setSectionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const contentRef = useRef(null);

  const handleSection = (section) => {
    cookies.set(`${deptID}_sec`, section);
    setActiveSection(section);
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // Call it immediately
    window.addEventListener("resize", handleResize);
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!cookies.get(`${deptID}_sec`)) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/${deptID}/${cookies.get(`${deptID}_sec`).toLowerCase()}`);
        setSectionData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // 🔥 Fix Scroll Issue: Ensure content is fully rendered before scrolling
    setTimeout(() => {
      if (isMobile && contentRef.current) {
        contentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });

        // 🔥 Force reflow to fix Safari & some Android browsers
        document.body.style.height = "auto";
        void document.body.offsetHeight; // Trigger reflow
      }
    }, 100);

  }, [deptID, activeSection, isMobile]);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await axios.get(`/api/${deptID}/sidebar`);
        const validSections = response.data.content
          .filter((section) => section.hascontent)
          .map((section) => section.id);
        
        setAvailableSections(validSections);
        setActiveSection(validSections[0] || null);
      } catch (error) {
        console.error("Error fetching sections:", error.message);
        setError("Failed to fetch sections.");
      }
    };
    fetchSections();
  }, [deptID]);

  const renderSection = () => {
    console.log(`Render ${activeSection}`)
    switch (cookies.get(`${deptID}_sec`)) {
      case "HeadDepartment": return <HeadDepartment data={sectionData} />;
      case "Vision&Mission": return <VisionMission data={sectionData} />;
      case "Faculties": return <Faculties data={sectionData} />;
      case "Activities": return <Activities data={sectionData} />;
      case "Syllabus": return <CurriculumPage data={sectionData} />;
      case "Infrastructure": return <Infrastructure data={sectionData} />;
      case "StudentActivities": return <ImageCarousel data={sectionData} />;
      case "SupportingStaff": return <Faculties data={sectionData} />;
      case "Mous": return <MOU data={sectionData} />;
      case "Research": return <Research data={sectionData} />;
      case "Conference": return <Conference data={sectionData} />;
      default: return <VisionMission data={sectionData} />;
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
      <div className={styles.header + " bottom-3"}>
        <Toggle attr="absolute bottom-0 float-right right-24 size-12" toggle={toggle} theme={theme} />
        <img src={college} alt="Department Header" className={styles.fullWidthImage}/>
        <div className={styles.overlay}>
          <h1 className={styles.overlayText}>{sectionData?.department_name}</h1>
        </div>
      </div>

      <div style={{display: "flex", flexDirection: isMobile ? "column" : "row"}}>
        {/* Sidebar */}
        <Sidebar
            sections={availableSections}
            activeSection={cookies.get(`${deptID}_sec`)}
            setActiveSection={handleSection}
        />
        {/* Main content */}
        <div ref={contentRef} className="text-text dark:text-drkt"
             style={{flex: 1, padding: "20px"}}>{renderSection()}</div>
      </div>
    </div>
  );
};

export default DepartmentPage;
