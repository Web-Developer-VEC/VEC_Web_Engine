import { Routes, Route, Navigate } from "react-router-dom";
import HostelSidebar from "../HostelPages/HostelSidebar.jsx";
import SuperiorRequest from "../HostelPages/SuperiorDashboard/SuperiorRequest.jsx";
import SuperiorWarden from "../HostelPages/SuperiorDashboard/WardenProfile.jsx";
import SuperiorStudent from "../HostelPages/SuperiorDashboard/SuperiorStudent.jsx";
import SuperiorAnalytics from "../HostelPages/SuperiorDashboard/SuperiorAnalytics.jsx";
import ProfileChange from "../HostelPages/SuperiorDashboard/ProfileChangeRequest.jsx";
import SuperiorAttentance from '../HostelPages/SuperiorDashboard/SuperiorAttendance.jsx'
import PrevRequest from "../HostelPages/SuperiorDashboard/PrevRequests.jsx";
import WardenLogs from "../HostelPages/SuperiorDashboard/WardenLogs.jsx";
import VacateReq from "../HostelPages/SuperiorDashboard/vacatereq.jsx";
import { useState } from "react";

const SuperiorLayout = () => {

    const [activeNav, setActiveNav] = useState("wardens");
  
  return (
    <div className="dashboard-container">
      <HostelSidebar role="superior" activeNav={activeNav} setActiveNav={setActiveNav}/>
      <div className="dashboard-content">
        <Routes>
          <Route index element={<Navigate to="wardens" replace />} />
          <Route path="wardens" element={<SuperiorWarden />} />
          <Route path="requests" element={<SuperiorRequest />} />
          <Route path="attendance" element={<SuperiorAttentance/>} />
          <Route path="analytics" element={<SuperiorAnalytics />} />
          <Route path="students" element={<SuperiorStudent />} />
          <Route path="requests/profile-change-request" element={<ProfileChange />} />
          <Route path="requests/vacate" element={<VacateReq />} />
          <Route path="requests/Prev-Requests" element={<PrevRequest />} />
          <Route path="wardenlogs" element={<WardenLogs/>}/>
        </Routes>
      </div>
    </div>
  );
};

export default SuperiorLayout;