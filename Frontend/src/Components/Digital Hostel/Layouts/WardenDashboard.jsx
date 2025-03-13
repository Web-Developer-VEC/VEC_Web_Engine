import { Routes, Route, Navigate } from "react-router-dom";
import HostelSidebar from "../HostelPages/HostelSidebar";
import WardenRequest from "../HostelPages/WardenDashboard/WardenRequest.jsx";
import Attendance from "../HostelPages/WardenDashboard/AttendanceDashboard.jsx";
import WardenStudent from "../HostelPages/WardenDashboard/Hostelstudents.jsx";
import WardenAnalytics from "../HostelPages/WardenDashboard/WardenAnalytics.jsx";
import FoodTypeRequest from "../HostelPages/WardenDashboard/FoodTypeRequest.jsx";
import WardenHistory from "../HostelPages/WardenDashboard/WardenHistory.jsx";
import TutorialPage2 from "../HostelPages/WardenDashboard/TutorialPage2.jsx";
import { useState } from "react";

const WardenLayout = () => {
  const [activeNav, setActiveNav] = useState("analytics");
  
  return (
    <div className="dashboard-container">
      <HostelSidebar role="warden" activeNav={activeNav} setActiveNav={setActiveNav}/>
      <div className="dashboard-content">
        <Routes>
          <Route index element={<Navigate to="analytics" replace />} />
          <Route path="analytics" element={<WardenAnalytics />} />
          <Route path="request" element={<WardenRequest />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="student" element={<WardenStudent />} />
          <Route path="request/Food-Change-Request" element={<FoodTypeRequest />} />
          <Route path="request/pass-log-history" element={<WardenHistory />} />
          <Route path="tutorial" element={<TutorialPage2/>}/>
        </Routes>
      </div>
    </div>
  );
};

export default WardenLayout;
