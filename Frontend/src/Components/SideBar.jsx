import React, { useState, useEffect } from "react"
import { Bars3BottomRightIcon, ArrowLeftIcon, ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/solid"
import { FaInstagram, FaTwitter, FaLinkedin, FaFacebook } from "react-icons/fa"
import "../App.css"
import "./SideBar.css"

// Sample navs data with 'more' content and other main items
const navs = [
  {
    main: "About Us",
    cod: [0, 5],
    cols: 1,
    sub: [
      { hrd: false, ttl: "About VEC", sup: [], lnk: "/abt-us" },
      { hrd: false, ttl: "About Trust", sup: [], lnk: "/trust" },
      { hrd: false, ttl: "Vision & Mission", sup: [], lnk: "v_m" },
      { hrd: false, ttl: "Management", sup: [], lnk: "/management" },
      { hrd: false, ttl: "Contact Us", sup: [], lnk: "#footer" },
    ],
  },
  {
    main: "Administration",
    cod: [0, 5],
    cols: 1,
    sub: [
      { hrd: false, ttl: "Principal", sup: [], lnk: "" },
      { hrd: false, ttl: "Dean's & Asso Dean's", sup: [], lnk: "/dean" },
      { hrd: false, ttl: "Admin Office", sup: [], lnk: "/admin" },
      { hrd: false, ttl: "Committee's", sup: [], lnk: "/committee" },
      { hrd: false, ttl: "Organization Chart", sup: [], lnk: "/clg-org" },
    ],
  },
  {
    main: "Academics",
    cod: [0, 11, 13],
    cols: 2,
    sub: [
      { hrd: true, ttl: "UG Courses", sup: [], lnk: "" },
      {
        hrd: false,
        ttl: "Artificial Intelligence and Data Science",
        sup: [],
        lnk: "/dept/001",
        deptID: "001",
      },
      {
        hrd: false,
        ttl: "Automobile Engineering",
        sup: [],
        lnk: "/dept/002",
        deptID: "002",
      },
      { hrd: false, ttl: "Civil Engineering", sup: [], lnk: "" },
      { hrd: false, ttl: "Computer Science and Engineering", sup: [], lnk: "" },
      {
        hrd: false,
        ttl: "Computer Science and Engineering (Cyber Security)",
        sup: [],
        lnk: "",
      },
      { hrd: false, ttl: "Electrical and Electronics Engineering", sup: [], lnk: "" },
      { hrd: false, ttl: "Electronics and Communication Engineering", sup: [], lnk: "" },
      { hrd: false, ttl: "Electronics and Instrumentation Engineering", sup: [], lnk: "" },
      { hrd: false, ttl: "Information Technology", sup: [], lnk: "" },
      { hrd: false, ttl: "Mechanical Engineering (ME)", sup: [], lnk: "" },
      { hrd: true, ttl: "PG Courses", sup: [], lnk: "" },
      { hrd: false, ttl: "M.E. Computer Science & Engineering", sup: [], lnk: "" },
      { hrd: false, ttl: "M.E. Power System Engineering", sup: [], lnk: "" },
      { hrd: false, ttl: "Master Of Business Administration (MBA)", sup: [], lnk: "" },
      { hrd: false, ttl: "", sup: [], lnk: "" },
      { hrd: true, ttl: "Science & Humanities", sup: [], lnk: "" },
      { hrd: false, ttl: "Chemistry", sup: [], lnk: "" },
      { hrd: false, ttl: "English", sup: [], lnk: "" },
      { hrd: false, ttl: "Mathematicis", sup: [], lnk: "" },
      { hrd: false, ttl: "Physics", sup: [], lnk: "" },
      { hrd: false, ttl: "Tamil", sup: [], lnk: "" },
    ],
  },
  {
    main: "Admission",
    cod: [0, 4],
    cols: 1,
    sub: [
      { hrd: false, ttl: "B.E/B.Tech Admission", sup: [], lnk: "/ug" },
      { hrd: false, ttl: "M.E Admission", sup: [], lnk: "/m_e" },
      { hrd: false, ttl: "MBA Admission", sup: [], lnk: "/mba" },
      { hrd: false, ttl: "Ph.D Programme Details", sup: [], lnk: "" },
    ],
  },
  {
    main: "Exams",
    cod: [0, 4],
    cols: 1,
    sub: [
      { hrd: false, ttl: "Regulation", sup: [], lnk: "/reg" },
      { hrd: false, ttl: "Curriculum & Syllabus", sup: [], lnk: "/Syllabus" },
      {
        hrd: false,
        ttl: "Student Verification",
        sup: [],
        lnk: "https://vecchennai.directverify.in/student/#/app/request",
        openInNewTab: true,
      },
      { hrd: false, ttl: "All Forms", sup: [], lnk: "/form" },
    ],
  },
  {
    main: "Research",
    cod: [0, 5],
    cols: 1,
    sub: [
      { hrd: false, ttl: "Academic Research", sup: [], lnk: "" },
      { hrd: false, ttl: "Sponsored Research", sup: [], lnk: "" },
      {
        hrd: false,
        ttl: "Publication",
        sup: [
          { hrd: false, ttl: "Journal", sup: [], lnk: "" },
          { hrd: false, ttl: "Conference", sup: [], lnk: "" },
        ],
        lnk: "",
      },
      { hrd: false, ttl: "Patents", sup: [], lnk: "" },
      { hrd: false, ttl: "Book Publications", sup: [], lnk: "" },
    ],
  },
  {
    main: "Placement",
    cod: [0, 4],
    cols: 1,
    sub: [
      { hrd: false, ttl: "About Placement Department", sup: [], lnk: "/abtplace" },
      { hrd: false, ttl: "Placement Team", sup: [], lnk: "/place-team" },
      { hrd: false, ttl: "Placement Details", sup: [], lnk: "/place-dep" },
      { hrd: false, ttl: "Our Proud Alumni", sup: [], lnk: "" },
    ],
  },
  {
    main: "More",
    cod: [0, 13],
    cols: 1,
    sub: [
      { hrd: false, ttl: "NBA", lnk: "" },
      { hrd: false, ttl: "NAAC", lnk: "" },
      { hrd: false, ttl: "NIRF", lnk: "" },
      { hrd: false, ttl: "IIC", lnk: "" },
      { hrd: false, ttl: "Incubation Cell", lnk: "" },
      { hrd: false, ttl: "Alumni", lnk: "" },
      { hrd: false, ttl: "NSS", lnk: "" },
      { hrd: false, ttl: "NCC", lnk: "" },
      { hrd: false, ttl: "YRC", lnk: "" },
      { hrd: false, ttl: "Sports", lnk: "" },
      { hrd: false, ttl: "Transport", lnk: "" },
      { hrd: false, ttl: "Library", lnk: "" },
      { hrd: false, ttl: "Hostel", lnk: "" },
      { hrd: false, ttl: "Other Facilities", lnk: "" },
    ],
  },
]

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [currentContent, setCurrentContent] = useState(null)
  const [currentSubItems, setCurrentSubItems] = useState([])
  const [showMore, setShowMore] = useState(false)
  const [fadeIn, setFadeIn] = useState(false)

  useEffect(() => {
    setFadeIn(true)
    return () => setFadeIn(false)
  }, [currentContent, showMore])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
    setCurrentContent(null)
    setShowMore(false)
  }

  const handleMainMenuClick = (mainMenu) => {
    setFadeIn(false)
    setTimeout(() => {
      if (mainMenu === "More") {
        setShowMore(!showMore)
      } else {
        const selectedNav = navs.find((nav) => nav.main === mainMenu)
        setCurrentContent(mainMenu)
        setCurrentSubItems(selectedNav.sub || [])
        setShowMore(false)
      }
    }, 10)
  }

  const goBackToMainMenu = () => {
    setFadeIn(false)
    setTimeout(() => {
      setCurrentContent(null)
      setCurrentSubItems([])
      setShowMore(false)
    }, 10)
  }

  return (
    <>
      {/* Toggle Sidebar Button */}
      <div
        className="group rounded-md border-2 border-slate-700 p-2 -mt-10 transition-all ease-in-out duration-300"
        style={{
          position: "fixed",
          top: "5vmax",
          right: "20px",
          zIndex: "1100", // Higher than the sidebar z-index
          background: "transparent",
        }}
        onClick={toggleSidebar}
      >
        <Bars3BottomRightIcon className="h-6 w-6 text-black" />
      </div>

      {/* Sidebar */}
      <div
        className="sidebar"
        style={{
          position: "fixed",
          right: isSidebarOpen ? "0" : "-100vw",
          top: "6.5vmax",
          width: "250px",
          height: "calc(100% - 6.5vmax)",
          background: "#fff",
          padding: "10vh 20px 0",
          transition: "right 0.3s ease",
          zIndex: "1000",
          color: "#333",
          overflowY: "auto",
          boxShadow: "-20px 0px 19px -7px rgba(0, 0, 0, 0.2)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3>Main Menu</h3>
        <ul>
          <li  className="lis" onClick={toggleSubSidebar} >
            Open Sub-Menu
          </li>
          <li className="lis" onClick={toggleSubSidebar}>
            RAndom STuff 1
          </li>
          <li className="lis" onClick={toggleSubSidebar} >
            RAndom STuff 2
          </li>
          <li className="lis" onClick={toggleSubSidebar} >
            RAndom STuff 3
          </li>
          <li className="lis" onClick={toggleSubSidebar} >
            RAndom STuff 4
          </li>
          <li className="lis" onClick={toggleSubSidebar} >
            RAndom STuff 5
          </li>
          <li className="lis" onClick={toggleSubSidebar} >
            RAndom STuff 6
          </li>
          <li className="lis" onClick={toggleSubSidebar}>
            RAndom STuff 7
          </li>
          <li className="lis" onClick={toggleSubSidebar}>
            RAndom STuff 8
          </li>
          <li className="lis" onClick={toggleSubSidebar} >
            RAndom STuff 9
          </li><li className="lis" onClick={toggleSubSidebar}>
            RAndom STuff 10
          </li>
          {/* Add more sidebar items as needed */}
        </ul>
      </div>

          {/* Main Menu or Sub-Items */}
          <ul className={fadeIn ? "fade-in" : ""}>
            {currentContent
              ? // Sub-items
                currentSubItems.map((item, index) => (
                  <li
                    key={index}
                    className="lis"
                    style={{
                      cursor: "pointer",
                      padding: "8px 0",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <a
                      href={item.lnk}
                      style={{ textDecoration: "none", color: "#333" }}
                      target={item.openInNewTab ? "_blank" : "_self"}
                      rel={item.openInNewTab ? "noopener noreferrer" : ""}
                    >
                      {item.ttl}
                    </a>
                  </li>
                ))
              : // Main Menu
                navs.map((nav, index) => (
                  <React.Fragment key={index}>
                    <li className="main-menu-item" onClick={() => handleMainMenuClick(nav.main)}>
                      {nav.main}
                      {nav.main === "More" ? (
                        <ChevronDownIcon className={`h-4 w-4 arrow ${showMore ? "open" : ""}`} />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4 arrow" />
                      )}
                    </li>
                    {nav.main === "More" && showMore && (
                      <div className="more-section">
                        {nav.sub.map((item, subIndex) => (
                          <li key={subIndex} className="lis">
                            <a href={item.lnk}>{item.ttl}</a>
                          </li>
                        ))}
                      </div>
                    )}
                  </React.Fragment>
                ))}
          </ul>
        </div>

        {/* Social Media Links */}
        <div className="social-media">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <FaInstagram />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <FaTwitter />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <FaLinkedin />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <FaFacebook />
          </a>
        </div>
      </div>
    </>
  )
}

export default Sidebar

