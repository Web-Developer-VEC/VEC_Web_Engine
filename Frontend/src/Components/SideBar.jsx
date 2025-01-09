import React, { useState } from "react";
import { Bars3BottomRightIcon } from "@heroicons/react/24/solid";
import "../App.css" // Example icon, replace with your own if needed

const Sidebar = (props) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubSidebarOpen, setIsSubSidebarOpen] = useState(false);
  const [sz, setSz] = useState("10")
  console.log(props.Sz)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setIsSubSidebarOpen(false); // Close sub-sidebar when the main sidebar is toggled
  };

  const toggleSubSidebar = () => {
    setIsSubSidebarOpen(!isSubSidebarOpen);
  };

  return (
    <>
      {/* Fixed icon on the right side of the screen */}
      <div className={`group rounded-md border-2 border-slate-700 p-2 -mt-10 ${props.Sz} transition-all ease-in-out duration-300`}
        style={{
          position: "fixed",
          top: "5vmax",
          right: "20px",
          zIndex: "1100", // Higher than the sidebar z-index
          cursor: "pointer",
          background: "transparent",
        }}
        onClick={toggleSidebar}
      >
        <Bars3BottomRightIcon className= 'size-10 text-black transition-all duration-300 ease-in-out' color="#fff" />
      </div>

      {/* Main Sidebar */}
      <div
        style={{
          position: "fixed",
          right: isSidebarOpen ? "0" : "-100vw", // Fully hide the sidebar when not clicked
          top: "0",
          width: "250px",
          height: "100%",
          background: "#444",
          padding: "10vh 20px",
          transition: "right 0.3s ease",
          zIndex: "1000",
          color: "#fff",
          overflowY: "auto", // Add scrolling if content overflows
          boxShadow: "-20px 0px 19px -7px rgb(0, 0, 0, 0.4)"
        }}
      >
        <h3>Main Menu</h3>
        <ul>
          <li  className="lis" onClick={toggleSubSidebar} style={{ cursor: "pointer" }}>
            Open Sub-Menu
          </li>
          <li className="lis" onClick={toggleSubSidebar} style={{ cursor: "pointer" }}>
            RAndom STuff 1
          </li>
          <li className="lis" onClick={toggleSubSidebar} style={{ cursor: "pointer" }}>
            RAndom STuff 2
          </li>
          <li className="lis" onClick={toggleSubSidebar} style={{ cursor: "pointer" }}>
            RAndom STuff 3
          </li>
          <li className="lis" onClick={toggleSubSidebar} style={{ cursor: "pointer" }}>
            RAndom STuff 4
          </li>
          <li className="lis" onClick={toggleSubSidebar} style={{ cursor: "pointer" }}>
            RAndom STuff 5
          </li>
          <li className="lis" onClick={toggleSubSidebar} style={{ cursor: "pointer" }}>
            RAndom STuff 6
          </li>
          <li className="lis" onClick={toggleSubSidebar} style={{ cursor: "pointer" }}>
            RAndom STuff 7
          </li>
          <li className="lis" onClick={toggleSubSidebar} style={{ cursor: "pointer" }}>
            RAndom STuff 8
          </li>
          <li className="lis" onClick={toggleSubSidebar} style={{ cursor: "pointer" }}>
            RAndom STuff 9
          </li><li className="lis" onClick={toggleSubSidebar} style={{ cursor: "pointer" }}>
            RAndom STuff 10
          </li>
          {/* Add more sidebar items as needed */}
        </ul>
      </div>

      {/* Sub-Sidebar */}
      <div
        style={{
          position: "fixed",
          right: isSubSidebarOpen ? "250px" : "-100vw", // Fully hide the sub-sidebar when not clicked
          top: "0",
          width: "250px",
          height: "100%",
          background: "#666",
          padding: "20px",
          transition: "right 0.3s ease",
          zIndex: "900",
          color: "#fff",
          overflowY: "auto", // Add scrolling if content overflows
          boxShadow: "-20px 0px 19px -7px rgb(0, 0, 0, 0.4)"
        }}
      >
        <h3>Sub Menu</h3>
        <ul>
          <li className="lis" >Sub-item 1</li>
          <li className="lis" >Sub-item 2</li>
          <li className="lis" >Sub-item 3</li>
          {/* Add more sub-sidebar items as needed */}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;