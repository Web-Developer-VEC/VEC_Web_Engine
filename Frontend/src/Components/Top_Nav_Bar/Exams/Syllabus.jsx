import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, BookOpen } from "lucide-react";
import "./Syllabi.css";
import Banner from "../../Banner";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const CourseCard = ({ course, onClick }) => (
  <motion.div
    className="course-card w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-2 hover:bg-[color-mix(in_srgb,theme(colors.secd),transparent_70%)]
      dark:hover:bg-[color-mix(in_srgb,theme(colors.drks),transparent_70%)] rounded-xl"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <button className="course-button w-full" onClick={onClick}>
      <div className="course-content flex flex-row items-center gap-2 p-3 bg-prim dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]
        rounded-lg shadow-md gap-3">
        <BookOpen className="course-icon w-10 text-lg text-secd dark:text-drks" />
        <p className="font-semibold text-sm sm:text-base">{course}</p>
      </div>
    </button>
  </motion.div>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

function Syllabus({theme, toggle}) {
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [curriculumData, setCurriculumData] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const navigate = useNavigate();

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
  return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/curriculumandsyllabus`);
        setCurriculumData(response.data);
        console.log(response.data);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setLoading(true);
      }
    };
    fetchData();
  }, []);

  const getPdfPath = (year, department) => {
    const yearData = curriculumData.find((item) => Object.keys(item)[0] === year);
    if (yearData) {
      const yearContent = yearData[year][0];
      const departmentIndex = yearContent.department.indexOf(department);
      return UrlParser(yearContent.pdf_path[departmentIndex]);
    }
    return null;
  };

  const handleDepartmentClick = (deptId) => {
    navigate(`/dept/${deptId}`, {
      state: { activeSection: "Syllabus" }, 
    });
  };

  const renderSection = (data, year) => (
    <motion.div key={year} variants={itemVariants} className="w-full">
      <div className="groups rounded-lg overflow-hidden p-5 shadow-md bg-prim dark:bg-drkp">
        <div className="card-syl p-6 sm:p-8">
          {/* <div className="flex items-center gap-3 mb-4 text-accn dark:text-drka">
            <Calendar className="w-[30px] h-[30px]" /> 
            <h2 className="text-[30px] font-bold">{data.year}</h2>
          </div> */}
          <div className="course-grid flex flex-wrap -m-2">
            {data.department.map((course, courseIndex) => (
              <CourseCard
                key={courseIndex}
                course={course}
                onClick={() => handleDepartmentClick(data.deptid[courseIndex])}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      <Banner toggle={toggle} theme={theme}
        backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
        headerText="Course & Syllabus"
        subHeaderText="Empowering students through structured learning and academic excellence"
      />
      <div className="min-h-screen mt-2 px-4 sm:px-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-6">
          {isLoading ? (
            <div className="loading-screen flex justify-center items-center h-40">
              <div className="spinner"></div> Loading...
            </div>
          ) : (
            curriculumData.map((yearData, index) => {
              const year = Object.keys(yearData)[0];
              if (year === "_id") return null;
              if (year === "Verticals" || year === "01") {
                return yearData[year].map((verticalData, vIndex) =>
                  renderSection(verticalData, `${year}-${vIndex}`)
                );
              }
              return renderSection(yearData[year][0], year);
            })
          )}
        </motion.div>
      </div>
    </>
  );
}

export default Syllabus;