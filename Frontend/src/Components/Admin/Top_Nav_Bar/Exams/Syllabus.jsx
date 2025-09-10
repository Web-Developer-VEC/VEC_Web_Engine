import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { BookOpen, Send } from "lucide-react";
import "./Syllabi.css";
import Banner from "../../Banner";
import { useNavigate } from "react-router-dom";
import LoadComp from "../../LoadComp";
import { FaUserEdit } from "react-icons/fa";
import { div } from "framer-motion/m";

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






const  AdminSyllabus = ({theme, toggle})=> {
  const [curriculumData, setCurriculumData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isContentEditable,setIsContentEditable] =  useState(true)
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
        headerText="Course & Syllabus"
        subHeaderText="Empowering students through structured learning and academic excellence"
      />

{
  isContentEditable ? (
      <div>

       <button className="flex items-center  bg-secd px-3 py-2 z-40 rounded text-text  ml-auto mr-20 my-4"  
          onClick={(e)=>setIsContentEditable(false)}>
              <FaUserEdit className="mr-2"  /> Edit 
       </button>
      <div className="min-h-[10vh] mt-10 mb-0 pb-0 px-4 sm:px-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-6">
          {isLoading ? (
            <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
              <LoadComp txt={""} />
            </div>
          ) : (
            
              <>
              { renderSection(curriculumData)}           
               </>
           
              
              )}
        </motion.div>
        </div>
      </div>
  ):(
      <div>
      <div className="min-h-[10vh] mt-14 mb-0 pb-0 px-4 sm:px-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-6">
          {isLoading ? (
            <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
              <LoadComp txt={""} />
            </div>
          ) : (
               <>
              { renderSection(curriculumData)}           
               </>
              )}
         <div className="flex gap-4 justify-end pr-8 my-8 mr-10">
          <button className="flex items-center bg-secd hover:bg-brwn text-text hover:text-prim px-3 py-2 rounded " >
            <FaUserEdit className="mr-2" /> Back to edit 
          </button>
          <button className="flex items-center bg-green-500 text-text hover:text-prim hover:bg-green-600 px-3 py-2 rounded" >
           <Send className="mr-2" />
           Request     
          </button>
        </div>
        </motion.div>
        </div>
      </div>
  )
}
      
    </>
  );
}

export default AdminSyllabus;