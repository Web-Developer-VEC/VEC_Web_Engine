import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import "./Syllabi.css";
import Banner from "../../Banner";
import { useNavigate } from "react-router-dom";
import LoadComp from "../../LoadComp";

const CourseCard = ({ course, onClick }) => (
  <motion.div
    className="syllabi-course-card w-full dark:bg-drkts sm:w-1/2 md:w-1/3 lg:w-1/4 p-2 hover:bg-[color-mix(in_srgb,theme(colors.secd),transparent_70%)]
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
  const [curriculumData, setCurriculumData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const navigate = useNavigate();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`/api/main-backend/exam`,
          {
            type: "exam_curriculum"
          }
        );
        setCurriculumData(response.data.data[0]);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        if (error.response.data.status === 429) {
          navigate('/ratelimit', { state: { msg: error.response.data.message}})
        }
        setLoading(true);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
    };
}, []);

if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
}

  const handleDepartmentClick = (deptId) => {
    navigate(`/dept/${deptId}`, {
      state: { activeSection: "Syllabus" }, 
    });
  };

  const renderSection = (data) => (
    <motion.div variants={itemVariants} className="w-full">
      <div className="groups rounded-lg overflow-hidden p-5 shadow-md bg-prim dark:bg-drkp">
        <div className="card-syl p-6 sm:p-8">
          <div className="course-grid flex flex-wrap -m-2">
            {data?.department?.map((course, courseIndex) => (
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
        backgroundImage="./Banners/examsbanner.webp"
        headerText="Verticals   "
        subHeaderText="Empowering students through structured learning and academic excellence"
      />
      <div className="min-h-[10vh] mt-2 mb-0 pb-0 px-4 sm:px-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-6">
          {isLoading ? (
            <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
              <LoadComp txt={""} />
            </div>
          ) : (
            // curriculumData?.map((yearData, index) => {
            //   const year = Object.keys(yearData)[0];
            //   if (year === "_id") return null;
            //   if (year === "Verticals" || year === "01") {
            //     return yearData[year]?.map((verticalData, vIndex) =>
            //       renderSection(verticalData, `${year}-${vIndex}`)
            //     );
            //   }
            //   return renderSection(yearData[year][0], year);
            // })
            renderSection(curriculumData)
          )}
        </motion.div>
      </div>
    </>
  );
}

export default Syllabus;