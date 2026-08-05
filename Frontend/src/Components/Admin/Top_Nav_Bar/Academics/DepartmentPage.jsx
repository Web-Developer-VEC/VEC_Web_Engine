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
import Pedagogy from "./sections/Pedagogy";
import MOU from "./sections/mou";
import Research from "./sections/RD";
import styles from "./HeadDepartment.module.css";
import Toggle from "../../Toggle";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

const AdminDepartmentPage = ({ theme, toggle }) => {
  const { deptID } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Initialize activeSection based on location.state or a default value
  const [activeSection, setActiveSection] = useState(
    location.state?.activeSection || "Vision&Mission"
  );
const { sendRequest } = useAdminRequest();
const [pendingPayload, setPendingPayload] = useState(null);
const [showRequestModal, setShowRequestModal] = useState(false);
  const [availableSections, setAvailableSections] = useState([]);
  const [sectionData, setSectionData] = useState(null);
    const [sidebarData, setSidebarData] = useState([]);
    const [pendingChanges, setPendingChanges] = useState([]);
    const [pendingSidebarData, setPendingSidebarData] = useState(null);
const [isSaved, setIsSaved] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const contentRef = useRef(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const banner_details = sectionData?.find((item) => item.category === "banner_name_and_image")?.content || [];
    const deptidmap = {
        "001":  "AIDS_001",
        "002":  "AUTO_002",
        "003":  "CHEMISTRY_003",
        "004":  "CIVIL_004",
        "005":  "CSE_005",
        "006":  "CSECS_006",
        "007":  "EEE_007",
        "008":  "EIE_008",
        "009":  "ECE_009",
        "010":  "ENGLISH_010",
        "011":  "IT_011",
        "012":  "MATHS_012",
        "013":  "MECH_013",
        "014":  "TAMIL_014",
        "015":  "PHYSICS_015",
        "016":  "MECSE_016",
        "017":  "MBA_017",
        "018":  "PS_018"
      }
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
      const maptype = {
        "HeadDepartment": "hod",
        "Vision&Mission": "vision_and_mission",
        "Faculties": "faculty",
        "Activities": "activities",
        "Pedagogy": "pedagogy",
        "Syllabus": "curriculum_and_syllabus",
        "Infrastructure": "infrastructure",
        "StudentAchievments": "student_achievements",
        "Mous": "mous",
        "Research": "research",
        "NewsLetter": "newsletter",
        "Event Organizer": "eventorg"
      }

  
      try {
        setLoading(true);
        setError(null);
        const response = await axios.post(`/api/main-backend/department`, {
          type: maptype[activeSection],
          department_id: deptidmap[deptID]
        });
        setSectionData(response.data.data);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setError("Failed to fetch data.");
        if (error.response.data.status === 429) {
          navigate('/ratelimit', { state: { msg: error.response.data.message}})
        }
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
        const response = await axios.get(`/api/main-backend/${deptidmap[deptID]}/sidebar`);
        setSidebarData(response.data.content);

        const validSections = response.data.content
          .map((section) => section.id);

        setAvailableSections(validSections);

        // Only set activeSection to the first available section if it hasn't been set yet
        if (!location.state?.activeSection && validSections.length > 0) {
          setActiveSection(validSections[0]);
        }
      } catch (error) {
        console.error("Error fetching sections:", error.message);
        if (error.response.data.status === 429) {
          navigate('/ratelimit', { state: { msg: error.response.data.message}})
        }
        setError("Failed to fetch sections.");
      }
    };

    fetchSections();
  }, [deptID, location.state?.activeSection]);

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
      case "Pedagogy":
        return <Pedagogy data={sectionData} />;
      case "Syllabus":
        return <CurriculumPage data={sectionData}  deptId={deptID} />;
      case "Infrastructure":
        return <Infrastructure data={sectionData} />;
      case "StudentAchievments":
        return <ImageCarousel data={sectionData} />;
      case "Mous":
        return <MOU data={sectionData} />;
      case "Research":
        return <Research data={sectionData} />; 
      case "NewsLetter":
        return <Newsletter data={sectionData} />;
      default:
        return <VisionMission data={sectionData} />;
    }
  };

  const revertChange = (sectionId) => {
  // Remove this change from saved changes
  setPendingSidebarData(prev =>
    prev.filter(item => item.meta_data.content[0].id !== sectionId)
  );

  // Remove it from pending changes too
  setPendingChanges(prev =>
    prev.filter(item => item.meta_data.content[0].id !== sectionId)
  );

  // Restore original sidebar state
  setSidebarData(prev =>
    prev.map(item => {
      if (item.id !== sectionId) return item;

      const original = pendingSidebarData.find(
        p => p.meta_data.content[0].id === sectionId
      );

      return original
        ? {
            ...item,
            hascontent: original.original_data.content[0].hascontent,
          }
        : item;
    })
  );
};
const handleFinalRequest = async () => {

  for (const payload of pendingSidebarData) {

    const result = await sendRequest(payload);

    if (!result?.success) {
      return;
    }

    const change = payload.meta_data.content[0];

    setSidebarData(prev =>
      prev.map(item =>
        item.id === change.id
          ? {
              ...item,
              hascontent: change.hascontent,
            }
          : item
      )
    );
  }

setPendingChanges([]);
setPendingSidebarData(null);
setIsSaved(false);
setShowRequestModal(false);
};

const handleSave = () => {
  if (pendingChanges.length === 0) return;

  setPendingSidebarData([...pendingChanges]);
  setIsSaved(true);
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
      <div className={`${styles.header} h-[20vh] md:h-[13vh] lg:h-[25vh]`}>
        <Toggle attr="absolute -top-2 md:top-12 lg:top-4 right-10 md:right-20 float-right z-[100000]" toggle={toggle} theme={theme} />
        <img src={`/Banners/Dept_banner/${banner_details?.[0]?.dept_id}.webp`} alt="Department Header" className={styles.fullWidthImage} />
        <div className={styles.overlay}>
          <h1 className={styles.overlayText}>{banner_details?.[0]?.name}</h1>
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
  sidebarData={sidebarData}
  activeSection={activeSection}
  setActiveSection={handleSection}

isSaved={isSaved}
onSave={handleSave}
onRequest={() => setShowRequestModal(true)}

  onToggleVisibility={(section) => {
    const current = sidebarData.find(item => item.id === section);

    if (!current) return;

    const newValue = !current.hascontent;

    const payload = {
      collectionName: deptidmap[deptID],
      collection_type: "sidebar",
      action: "update",
      title: "update department sidebar",
      meta_data: {
        content: [
          {
            id: section,
            hascontent: newValue,
          },
        ],
      },
      original_data: {
        content: [
          {
            id: section,
            hascontent: current.hascontent,
          },
        ],
      },
    };

    // Store pending changes
    setSidebarData(prev =>
  prev.map(item =>
    item.id === section
      ? {
          ...item,
          hascontent: newValue,
        }
      : item
  )
);

setPendingChanges(prev => {
  const others = prev.filter(
    item => item.meta_data.content[0].id !== section
  );

  return [...others, payload];
});
  }}
/>
            {/* Main content */}
            <div ref={contentRef} className="text-text dark:text-drkt" style={{ flex: 1, padding: "20px" }}>
              {renderSection()}
            </div>
          </div>
        </>
      )}
      {showRequestModal && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1200]">
    <div className="bg-white p-6 rounded-xl w-[500px]">

      <h2 className="text-xl font-semibold text-center mb-3">
        Request
      </h2>

      <p className="text-center text-red-500 mb-4">
  These sidebar visibility changes will be sent for approval.
</p>

<table className="w-full border border-gray-300 text-sm mb-5">
  <thead className="bg-gray-100">
    <tr>
      <th className="border p-2">Section</th>
      <th className="border p-2">Change</th>
      <th className="border p-2">Undo</th>
    </tr>
  </thead>

  <tbody>
    {pendingSidebarData.map((item, index) => {
  const change = item.meta_data.content[0];

  return (
    <tr key={index}>
      

      <td className="border p-2">
        {change.id}
      </td>

      <td className="border p-2">
        {change.hascontent ? "Visible" : "Hidden"}
      </td>

      <td className="border p-2 text-center">
        <button
          onClick={() => revertChange(change.id)}
          className="p-1 rounded hover:bg-gray-100"
        >
          ❌
        </button>
      </td>
    </tr>
  );
})}
  </tbody>
</table>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowRequestModal(false)}
          className="px-4 py-2 rounded bg-gray-400 text-white"
        >
          Cancel
        </button>

        {pendingSidebarData?.length > 0 && (
  <button
    onClick={handleFinalRequest}
    className="px-4 py-2 rounded bg-[#fdcc03] hover:bg-[#800000] hover:text-white"
  >
    Final Request
  </button>
)}
      </div>

    </div>
  </div>
)}

    </div>
  );
};

export default AdminDepartmentPage;
