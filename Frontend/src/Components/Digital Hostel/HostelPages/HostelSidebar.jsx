import React, { useState, useEffect } from "react";
import { ClipboardCheck, Users, FileText, BarChart3, User, Clock, PenSquare, Phone, ScrollText, BookOpen, BookOpenCheck, DoorOpen } from "lucide-react";
import { CiLogout } from "react-icons/ci";
import { NavLink, useLocation } from "react-router-dom";
import "./HostelSidebar.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const navItems = {
  student: [
    { path: "/hostel/student/request", label: "Request", icon: <PenSquare className="icon" /> },
    { path: "/hostel/student/previousrequest", label: "Previous Request", icon: <Clock className="icon" /> },
    { path: "/hostel/student/profile", label: "Profile", icon: <User className="icon" /> },
    { path: "/hostel/student/tutorial", label: "Tutorial Page", icon: <BookOpenCheck className="icon" /> },
    { path: "/hostel/student/vacate", label: "Vacate Form", icon: <DoorOpen className="icon" /> },
  ],
  warden: [
    { path: "/hostel/warden/analytics", label: "Analytics", icon: <BarChart3 className="icon" /> },
    { path: "/hostel/warden/attendance", label: "Attendance", icon: <ClipboardCheck className="icon" /> },
    { path: "/hostel/warden/request", label: "Request", icon: <FileText className="icon" /> },
    { path: "/hostel/warden/student", label: "Student", icon: <Users className="icon" /> },
    { path: "/hostel/warden/tutorial", label: "Tutorial Page", icon: <BookOpenCheck className="icon" /> },
  ],
  superior: [
    { path: "/hostel/superior/wardens", label: "Wardens", icon: <Users className="icon" /> },
    { path: "/hostel/superior/analytics", label: "Analytics", icon: <BarChart3 className="icon" /> },
    { path: "/hostel/superior/attendance", label: "Attendance", icon: <ClipboardCheck className="icon" /> },
    { path: "/hostel/superior/requests", label: "Requests", icon: <FileText className="icon" /> },
    { path: "/hostel/superior/students", label: "Students", icon: <Users className="icon" /> },
    { path: "/hostel/superior/wardenlogs", label: "Warden Logs", icon: <ScrollText className="icon" /> },
  ],
};

function Hostelsidebar({ role, activeNav, setActiveNav }) {
  const items = navItems[role] || [];
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [wardenSlidebar, setWardenSlidebar] = useState(null);
  const [message, setMessage] = useState(null)

  useEffect(()=>{
    const fetchData = async () => {
        try{
          const response = await axios.get('/api/sidebar_warden');
          setWardenSlidebar(response.data); 
        }
        catch(err){
          console.error("Failed to fetch",err);
        }
      }
      fetchData();
  },[]);

  const navigate = useNavigate();

  const handleLogout = async ()=>{

    try {
      const response = await fetch("/api/logout", {
        method: "GET",
        credentials: "include", 
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Success: ${data.message}`);

        Swal.fire({
          title: "Log out",
          text: data.message,
          icon: "success",
          timer: 2000, 
          showConfirmButton: false,
          willClose: () => {
            Swal.close();
            navigate(data.redirect);
          },
        });
      } else {
        setMessage(`Error: ${data.error || data.message}`);        
      }
    } catch (error) {
      setMessage("Error connecting to the server");
      console.error("Logout Error:", error);
    }
  }

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize(); // Run once to set initial state
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  const toRoman = (num) => {
    const romanMap = {
        1: "I", 2: "II", 3: "III", 4: "IV"
    };
    return romanMap[num] || num; 
};

const primaryYearArray = Array.isArray(wardenSlidebar?.["primary year"]) ? wardenSlidebar["primary year"] : [];
const primaryYears = primaryYearArray.map(toRoman).join(", ") || "N/A";


const yearLabel = primaryYearArray.length === 1 ? "year" : "years";

  return (
    <>
      {/* Mobile Navbar */}
      {isMobile ? (
  <nav className={`Hostel-mobile-nav ${role === "superior" ? "scrollable" : ""}`} >
    {/* Navigation Buttons */}
    {items.map((item) => (
      <NavLink
        key={item.path}
        to={item.path}
        className={`Hostel-mobile-nav-button ${
          location.pathname.startsWith(item.path) ? "active" : ""
        }`}
        // onClick={() => setActiveNav(item.path)}
      >
        {item.icon}
        <span className="Hostel-mobile-nav-label">{item.label}</span>
      </NavLink>
    ))}

    {/* Logout Button in Mobile Navbar */}
    {role !== 'warden' && (
      <button className="Hostel-mobile-nav-button" onClick={handleLogout}>
        <CiLogout size={19} className="Hostel-mobile-nav-icon" />
        <span className="Hostel-mobile-nav-label">Logout</span>
      </button>
    )}

    {/* Profile Button in Mobile Navbar */}
    {role === "warden" && (
      <div className="Hostel-mobile-nav-profile">
        <button
          className="Hostel-mobile-nav-button"
          onClick={() => setShowProfile(!showProfile)}
        >
          <User className="Hostel-mobile-nav-icon" />
          <span className="Hostel-mobile-nav-label">Profile</span>
        </button>
      </div>
    )}
  </nav>
) : (
  <div className={`Hostel-sidebar ${sidebarOpen ? "open" : ""}`}>
    {/* Desktop Sidebar Content */}
    {role === "warden" && (
      <div className="warden-sidebar-top">
        <div className="warden-photo-container">
          <img
            src={wardenSlidebar?.image_path}
            alt={wardenSlidebar?.name}
            className="warden-photo"
            style={{ color: "white" }}
          />
        </div>
        <div className="warden-sidebar-info">
          <h3 className="sidebar-warden-name">{wardenSlidebar?.name}</h3>
          <p className="warden-years">Handling: <span className="text-white">{primaryYears} {yearLabel}</span></p>
        </div>
      </div>
    )}

    {role === "warden" && (
      <div className="warden-contact">
        <p className="warden-mobile">
          <Phone size={16} /> <a href={`tel:${wardenSlidebar?.["Phone number"]}`} className="no-underline text-white">{wardenSlidebar?.["Phone number"]}</a>
        </p>
        <p className="text-white">
          Status: <span className={`warden-status ${wardenSlidebar?.["Active Status"] ? "active" : "inactive"}`}>{wardenSlidebar?.["Active Status"] ? "Active" : "Inactive"}</span>
        </p>
      </div>
    )}

    {/* Sidebar Navigation */}
    <div className="Hostel-sidebar-content">
      <div className="Hostel-sidebar-menu">
        <nav>
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={`Hostel-nav-button ${
                location.pathname.startsWith(item.path) ? "Hostel-nav-active" : ""
              }`}
            >
              {item.icon} {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="Logout-container">
        <CiLogout className="Hostel-icon" />
        <button className="Logout-button" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  </div>
)}

{/* Warden Profile Popup */}
{showProfile && (
          <div className="warden-profile-popup">
            <div className="warden-profile-header">
              <img
                src={wardenSlidebar?.image_path || "https://via.placeholder.com/150"}
                alt={wardenSlidebar?.name}
                className="warden-photo"
              />
              <div>
                <h3 className="sidebar-warden-name">{wardenSlidebar?.name}</h3>
                <p className="warden-years">Handling: <span className="text-white">{primaryYears} {yearLabel}</span></p>
              </div>
            </div>
            <p className="warden-mobile">
              <Phone size={16} /> <a href={`tel:${wardenSlidebar?.["Phone number"]}`} className="no-underline text-white">{wardenSlidebar?.["Phone number"]}</a>
            </p>
            <p className="text-white">
              Status: <span className={`warden-status ${wardenSlidebar?.["Active Status"] ? "active" : "inactive"}`}>{wardenSlidebar?.["Active Status"] ? "Active" : "Inactive"}</span>
            </p>

            {/* Logout Button Inside Profile Popup */}
            <button className="warden-profile-logout-button" onClick={handleLogout}>
              <CiLogout className="warden-profile-logout-icon" />
              <span>Logout</span>
            </button>
          </div>
        )}
    </>
  );
}

export default Hostelsidebar;