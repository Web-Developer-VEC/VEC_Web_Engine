import { useState } from "react";
import "./Academicresearch.css";
import './Researchtable.css';
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

export default function Academicresearch({ theme, toggle }) {
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
            <h1 className="research-academicresearch-title">
              Academic Research - Year wise Consolidation
            </h1>

            <div className="course-selection-container">
              {courses.map((course) => (
                <div
                  key={course}
                  className={`course-card ${
                    selectedCourse === course ? "expanded" : ""
                  }`}
                  onClick={() => { handleOpen(true);  }}
                >
                  <div className="course-header">
                    <span className="icon">📖</span>
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
