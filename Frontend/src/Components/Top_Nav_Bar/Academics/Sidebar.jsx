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
  "Vision&Mission": <FaEye className={styles.icon + " text-secd dark:text-drks"} />,
    "HeadDepartment": <FaUserTie className={styles.icon + " text-secd dark:text-drks"} />,
    "Faculties": <FaChalkboardTeacher className={styles.icon + " text-secd dark:text-drks"} />,
    "Syllabus": <FaBook className={styles.icon + " text-secd dark:text-drks"} />,
    "Infrastructure": <FaBuilding className={styles.icon + " text-secd dark:text-drks"} />,
    "Activities": <FaTasks className={styles.icon + " text-secd dark:text-drks"} />,
    "StudentActivities": <FaGraduationCap className={styles.icon + " text-secd dark:text-drks"} />,
    "SupportingStaff": <FaUsers className={styles.icon + " text-secd dark:text-drks"} />,
    "Mous": <FaHandshake className={styles.icon + " text-secd dark:text-drks"} />,
    "Research": <FaFlask className={styles.icon + " text-secd dark:text-drks"} />
};

const Sidebar = ({ sections, activeSection, setActiveSection }) => {
  return (
    <div className={styles.sidebar}>
      <ul>
        {sections.map((section) => (
          <li key={section} className="hover:bg-secd dark:hover:bg-drks hover:rounded-lg">
            <button
              className={`text-prim ${styles.sidebarItem} ${activeSection === section ? " bg-secd dark:bg-drks text-text" : ""}`}
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
