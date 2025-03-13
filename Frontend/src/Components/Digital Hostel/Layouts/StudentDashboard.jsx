import { Routes, Route, Navigate } from "react-router-dom";
import HostelSidebar from "../HostelPages/HostelSidebar";
import StudentRequest from "../HostelPages/StudentDashboard/Outpass.jsx";
import PreviousRequest from "../HostelPages/StudentDashboard/StudentHistory";
import StudentProfile from "../HostelPages/StudentDashboard/Studentprofile";
import TutorialPage from "../HostelPages/StudentDashboard/TutorialPage.jsx";
import Vacate from "../HostelPages/StudentDashboard/Vacate.jsx";
import { useState } from "react";

const StudentLayout = () => {
  const [activeNav, setActiveNav] = useState("request");

  return (
    <div className="dashboard-container">
      <HostelSidebar role="student" activeNav={activeNav} setActiveNav={setActiveNav}/>
      <div className="dashboard-content">
        <Routes>
          <Route index element={<Navigate to="request" replace />} />
          <Route path="request" element={<StudentRequest />} />
          <Route path="previousrequest" element={<PreviousRequest />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="tutorial" element={<TutorialPage/>}/>
          <Route path="vacate" element={<Vacate/>}/>
        </Routes>
      </div>
    </div>
  );
};

export default StudentLayout;
