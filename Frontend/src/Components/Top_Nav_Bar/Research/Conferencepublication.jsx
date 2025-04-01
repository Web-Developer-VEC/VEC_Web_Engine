import { useEffect, useState } from "react";
import "./Conferencepublication.css";
import Banner from "../../Banner";
import axios from "axios";
import Reseachdetails from "./reseach details";
const dept = {
  courses : [
    "B.E Automobile Engineering",
    "B.E Civil Engineering",
    "B.E Computer Science and Engineering",
    "B.E Computer Science and Engineering (Cyber Security)",
    "B.E Electronics and Communication Engineering",
    "B.E Electrical and Electronics Engineering",
    "B.E Electronics and Instrumentation Engineering",
    "B.E Mechanical Engineering",
    "B.Tech Artificial Intelligence and Data Science",
    "B.Tech Information Technology",
    "M.E Computer Science Engineering",
    "M.E Power System Engineering",
    "M.B.A Master of Business Administration",
  ],

  dept_id : [
    "002",
    "004",
    "005",
    "006",
    "009",
    "007",
    "008",
    "013",
    "001",
    "011",
    "005",
    "007",
    "017"
  ]
};

export default function Conferencepublication({theme, toggle}) {
  const [pdfUrl, setPdfUrl] = useState(null); // Default PDF
  const [activeYear, setActiveYear] = useState(null); // Track active button
  const [conference, setConference] = useState(null);
  const [open,setopen]= useState(false)
  const [course , setcourse]= useState(null);
  const [deptid,setdeptid] = useState(null);
  const [conferenceid , setconferenceid] = useState(null)
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  const handleCourseClick = (course,id) => {
    setcourse(course);
    setdeptid(id);
    // const conferencecontent = conference.filter(conference_dept => conference_dept.dept_id === id )
    // setconferenceid(conferencecontent)
    // setSelectedCourse(selectedCourse === course ? null : course);
    setopen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {

        const response = await axios.get('/api/conference')
        setConference(response.data)
        console.log(response.data)
      }catch(error){
        console.error("Fetching error",error)
      }
    }
  
  
    fetchData();
  }, []);

  return (
    <>
      <div>
        <Banner toggle={toggle} theme={theme}
          backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
          headerText="Conference Publication"
          subHeaderText="Enrich Your Knowledge"
        />
      </div>

    {open ? (
      <>
      <div className="ml-[3rem] mt-[1rem]">
        <button onClick={()=>{setopen(false); setcourse(null); setdeptid(null)} } className="backbutton"> back </button>
      
      </div>
      {/* <Reseachdetails course={conference} data1={conferenceid}/> */}
      </>
    ):(
      <div className="research-conference-container">
        <h1 className="research-conference-title">
          Conference Publication
        </h1>

        <div className="course-selection-container">
          
          {dept.courses.map((course,id) => (
            <div
              key={course}
              className={`course-card ${
                selectedCourse === course ? "expanded" : ""
              }`}
              onClick={() => handleCourseClick(course ,dept.dept_id[id])}
            >
              <div className="course-header">
                <span className="icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open course-icon w-10 text-lg text-secd dark:text-drks"><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg></span>
                <span>{course}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    )}
    </>
  );
}
