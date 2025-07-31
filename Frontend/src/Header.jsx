// src/components/DynamicTitle.js
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";

const titleMap = {
  "/": "Home VEC",
  "/abt-us": "About US - VEC",
  "/Term_and_Conditions": "Terms & Conditions - VEC",
  "/trust": "Velammal Educational Trust",
  "/handbook": "Handbook - VEC",
  "/v_m": "VEC Vision & Mission",
  "/management": "Management VEc",
  "/principal": "Principal VEC",
  "/dean": "Dean VEC ",
  "/admin": "Administration VEC",
  "/committee": "Executive Committee VEC",
  "/clg-org": "Organization Chart VEC",
  "/departments": "Academics VEC",
  "/programs": "Programs VEC",
  "/acadamic_cal": "Academic Calendar VEC",
  "/ug": "VEC - UG Admission",
  "/m_e": "VEC - ME Admission",
  "/mba": "VEC - MBA Admission",
  "/phd": "VEC - PhD Admission",
  "/admission-team": "VEC Admission Team",
  "/reg": "Regulations VEC",
  "/Syllabus": "Syllabus VEC",
  "/form": "VEC Forms",
  "/coe": "VEC - COE",
  "/journal": "VEC Journal Publications",
  "/Funded": "VEC Funded Projects",
  "/Book_Chapter": "VEC Book Chapters",
  "/Consultancy": "VEC Consultancy",
  "/abtplace": "VEC - Placement",
  "/place-team": "VEC - Placement Team",
  "/place-dep": "VEC - Placement Department",
  "/Accredation": "Accreditation VEC",
  "/iqac": "IQAC - VEC",
  "/iic": "IIC - VEC",
  "/ecell": "E-Cell - VEC",
  "/incubation": "VEC - Incubation Cell",
  "/alumni": "VEC Alumni",
  "/NSS": "VEC NSS",
  "/NCC": "VEC NCC",
  "/nccnavy": "VEC NCC Navy",
  "/nccarmy": "VEC NCC Army",
  "/YRC": "VEC YRC",
  "/sports": "VEC Sports",
  "/transport": "VEC Transport",
  "/library": "VEC Library",
  "/hosLanding": "VEC Hostel",
  "/other-facilities": "Other Facilities VEC",
  "/Gallery": "VEC Gallery",
  "/gallery-details": "VEC Gallery Details",
  "/grievances": "Grievance Form VEC",
  "/webteam": "WebOps VEC",
  "/login": "Login",
  "/developers": "VEC Developers",
  "/dept/004": "CIVIL - VEC",
  "/dept/001": "AI&DS - VEC",
  "/dept/002": "AUTO - VEC",
  "/dept/003": "Chemistry - VEC",
  "/dept/005": "CSE - VEC",
  "/dept/006": "CSE Cyber - VEC",
  "/dept/007": "EEE - VEC",
  "/dept/008": "EIE - VEC",
  "/dept/009": "ECE - VEC",
  "/dept/010": "English - VEC",
  "/dept/011": "IT - VEC",
  "/dept/012": "Mathematics - VEC",
  "/dept/013": "MECH - VEC",
  "/dept/014": "Tamil - VEC",
  "/dept/015": "Physics - VEC",
  "/dept/016": "M.E CSE - VEC",
  "/dept/017": "MBA - VEC",
  "/hostel/login": "Hostel Login",
  "/hostel/forget-password": "Hostel Forgot Password",
  "/errorlog": "Error Log",
  "/ratelimit": "Rate Limit Reached",
  "/hit_logs": "Hit Logs",
};

export default function DynamicTitle() {
  const location = useLocation();
  const currentPath = location.pathname;

  // Sort paths by length to avoid early match with '/'
  const sortedPaths = Object.keys(titleMap).sort((a, b) => b.length - a.length);
  const matchedKey = sortedPaths.find((key) => currentPath.startsWith(key));
  const pageTitle = titleMap[matchedKey] || "VEC";

  return (
    <Helmet>
      <title>{pageTitle}</title>
    </Helmet>
  );
}