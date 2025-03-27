import { useState } from "react";
import "./Academicresearch.css";
import Banner from "../../Banner";

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

  const handleCourseClick = (course) => {
    setSelectedCourse(selectedCourse === course ? null : course);
  };

  return (
    <>
      <div>
        <Banner
          toggle={toggle}
          theme={theme}
          backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
          headerText="Academic Research"
          subHeaderText="Enrich Your Knowledge"
        />
      </div>

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
              onClick={() => handleCourseClick(course)}
            >
              <div className="course-header">
                <span className="icon">📖</span>
                <span>{course}</span>
              </div>

              {/* Expanding Content */}
              <div
                className="dropdown-container"
                style={{
                  maxHeight: selectedCourse === course ? "150px" : "0",
                  opacity: selectedCourse === course ? "1" : "0",
                  padding: selectedCourse === course ? "10px" : "0",
                }}
              >
                <ul>
                  <li>Internship</li>
                  <li>Product Development</li>
                  <li>Start-up</li>
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
