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
  FaNewspaper,
  FaCalendarAlt
} from "react-icons/fa";
import { MdEvent } from "react-icons/md";
import styles from "./HeadDepartment.module.css";

const iconMap = {
  "Vision&Mission": <FaEye className={styles.icon + " text-secd dark:text-drks"} />,
    "HeadDepartment": <FaUserTie className={styles.icon + " text-secd dark:text-drks"} />,
    "Faculties": <FaChalkboardTeacher className={styles.icon + " text-secd dark:text-drks"} />,
    "Syllabus": <FaBook className={styles.icon + " text-secd dark:text-drks"} />,
    "Infrastructure": <FaBuilding className={styles.icon + " text-secd dark:text-drks"} />,
    "Activities": <FaTasks className={styles.icon + " text-secd dark:text-drks"} />,
    "StudentAchievments": <FaGraduationCap className={styles.icon + " text-secd dark:text-drks"} />,
    "SupportingStaff": <FaUsers className={styles.icon + " text-secd dark:text-drks"} />,
    // "EventOrg": <MdEvent className={styles.icon + " text-secd dark:text-drks"} />,
    "Mous": <FaHandshake className={styles.icon + " text-secd dark:text-drks"} />,
    "Research": <FaFlask className={styles.icon + " text-secd dark:text-drks"} />,
    "NewsLetter": <FaNewspaper className={styles.icon + " text-secd dark:text-drks"} />
};

const displayNameMap = {
  "Vision&Mission": "Vision & Mission",
  "HeadDepartment": "Head of the Department",
  "Faculties": "Faculty Members",
  "Syllabus": "Curriculum & Syllabus",
  "Infrastructure": "Infrastructure",
  "Activities": "Department Activities",
  "EventOrg":"Event Organizer",
  "StudentAchievments": "Student Achievements",
  "SupportingStaff": "Supporting Staff",
  "Mous": "MOUs",
  "Research": "Research & Innovations",
  "NewsLetter": "News Letters"
};

const Sidebar = ({ sections, activeSection, setActiveSection }) => {
  return (
    <div className={styles.sidebar}>
      <ul>
        {sections.map((section) => (
          <li key={section} className="hover:bg-secd dark:hover:bg-drks hover:rounded-lg
            hover:*:text-text dark:hover:*:text-drkt">
            <button
              className={`text-prim *:hover:text-text dark:*:hover:text-drkt 
                ${styles.sidebarItem} ${activeSection === section ? " bg-secd dark:bg-drks text-text dark:text-drkt" 
                  : ""}`} onClick={() => setActiveSection(section)}
            >
              {iconMap[section] || "📄"} {displayNameMap[section] || section.replace(/([A-Z])/g, " $1")}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
