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

const Sidebar = ({ setActiveSection }) => {
  return (
    <div className={styles.sidebar}>
      <ul>
      <li>
          <button
            className={styles.sidebarItem}
            onClick={() => setActiveSection("Vision&Mission")}
          >
            <FaEye className={styles.icon} /> Vision & Mission
          </button>
        </li>
        <li>
          <button
            className={styles.sidebarItem}
            onClick={() => setActiveSection("HeadDepartment")}
          >
            <FaUserTie className={styles.icon} /> Head of the Department
          </button>
        </li>
        <li>
          <button
            className={styles.sidebarItem}
            onClick={() => setActiveSection("Faculties")}
          >
            <FaChalkboardTeacher className={styles.icon} /> Faculties
          </button>
        </li>
        <li>
          <button
            className={styles.sidebarItem}
            onClick={() => setActiveSection("Syllabus")}
          >
            <FaBook className={styles.icon} /> Curriculum & Syllabus
          </button>
        </li>
        <li>
          <button
            className={styles.sidebarItem}
            onClick={() => setActiveSection("Infrastructure")}
          >
            <FaBuilding className={styles.icon} /> Infrastructure
          </button>
        </li>
        <li>
          <button
            className={styles.sidebarItem}
            onClick={() => setActiveSection("Activities")}
          >
            <FaTasks className={styles.icon} /> Department Activities
          </button>
        </li>
        <li>
          <button
            className={styles.sidebarItem}
            onClick={() => setActiveSection("StudentActivities")}
          >
            <FaGraduationCap className={styles.icon} /> Student Activities
          </button>
        </li>
        <li>
          <button
            className={styles.sidebarItem}
            onClick={() => setActiveSection("SupportingStaff")}
          >
            <FaUsers className={styles.icon} /> Supporting Staff
          </button>
        </li>
        <li>
          <button
            className={styles.sidebarItem}
            onClick={() => setActiveSection("Mous")}
          >
            <FaHandshake className={styles.icon} /> MOU's
          </button>
        </li>
        <li>
          <button
            className={styles.sidebarItem}
            onClick={() => setActiveSection("Research")}
          >
            <FaFlask className={styles.icon} /> Department Research
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
