import React from "react";
import {
  FaUserTie,
  FaChalkboardTeacher,
  FaBook,
  FaBuilding,
  FaTasks,
  FaGraduationCap,
  FaUsers,
  FaHandshake,
  FaFlask,
  FaEye,
} from "react-icons/fa";
import styles from "./HeadDepartment.module.css";

const iconMap = {
  "Vision&Mission": <FaEye className={styles.icon} />,
  "HeadDepartment": <FaUserTie className={styles.icon} />,
  "Faculties": <FaChalkboardTeacher className={styles.icon} />,
  "Syllabus": <FaBook className={styles.icon} />,
  "Infrastructure": <FaBuilding className={styles.icon} />,
  "Activities": <FaTasks className={styles.icon} />,
  "StudentActivities": <FaGraduationCap className={styles.icon} />,
  "SupportingStaff": <FaUsers className={styles.icon} />,
  "Mous": <FaHandshake className={styles.icon} />,
  "Research Data": <FaFlask className={styles.icon} />
};

const Sidebar = ({ sections, activeSection, setActiveSection }) => {
  return (
    <div className={styles.sidebar}>
      <ul>
        {sections.map((section) => (
          <li key={section}>
            <button
              className={`${styles.sidebarItem} ${activeSection === section ? styles.active : ""}`}
              onClick={() => setActiveSection(section)}
            >
              {iconMap[section] || "📄"} {section.replace(/([A-Z])/g, " $1")}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
