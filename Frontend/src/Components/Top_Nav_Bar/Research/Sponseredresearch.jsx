import { useEffect, useState } from "react";
import "./Sponseredresearch.css";
import Banner from "../../Banner";
import Researchtable from "./Researchtable";

const courses = [
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
];

export default function Sponseredresearch({theme, toggle}) {
const [selectedCourse, setSelectedCourse] = useState(null);
  const [open, handleOpen] = useState(false);

  const handleCourseClick = (course) => {
    setSelectedCourse(selectedCourse === course ? null : course);
  };

  return (
    <> 
        <Banner
          toggle={toggle}
          theme={theme}
          backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
          headerText="Academic Research"
          subHeaderText="Enrich Your Knowledge"
          />
          {open ? (
            <>
            <div className="research-backbutton-container">
            <button  onClick={() => handleOpen(false)} >Back</button>
            </div>
              <Researchtable />
            </>
          ) : (

          <div className="research-academicresearch-container">
            <h1 className="research-academicresearch-title text-brwn dark:text-drkt border-l-4 border-r-4 border-secd dark:border-drks">
              Sponsored Research
            </h1>

            <div className="course-selection-container">
              {courses.map((course) => (
                <div
                  key={course}
                  className={"course-card dark:bg-text"}
                  onClick={() => { 
                    // handleOpen(true); 
                   }}
                >
                  <div className="course-header dark:bg-text">
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
