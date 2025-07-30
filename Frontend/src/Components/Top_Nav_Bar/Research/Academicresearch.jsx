import { useState } from "react";
import "./Academicresearch.css";
import Banner from "../../Banner";
import { Link } from "react-router-dom";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/solid"; // FIXED

const courses = [
  "2020",
  "2014",
  "2005",
  "2006",
  "2007",
];

export default function Consultancy({ theme, toggle }) {
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
        backgroundImage="./Banners/researchbanner.webp"
        headerText="Academic Research"
        subHeaderText="Enrich Your Knowledge"
      />

   
        <div className="">
          <h1 className="research-academicresearch-title text-brwn dark:text-drkt dark:border-drks">
            Consultancy
          </h1>

          <div className="course-selection-container p-12">
            {courses.map((course) => (
            
                 <div
                   
                    className={`px-4 py-3 font-semibold text-center rounded-xl bg-secd hover:bg-accn hover:text-prim dark:hover:bg-brwn`}
                
                  >
                   {course}
                  </div>
          
            ))}
          </div>
        </div>
  
    </>
  );
}
