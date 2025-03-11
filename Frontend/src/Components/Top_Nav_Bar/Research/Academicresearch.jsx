import { useEffect, useState } from "react";
import "./Academicresearch.css";
import Banner from "../../Banner";

export default function Academicresearch({theme, toggle}) {
  const [pdfUrl, setPdfUrl] = useState(null); // Default PDF
  const [activeYear, setActiveYear] = useState(null); // Track active button
  const [academicresearch, setAcademicResearch] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/get_research_data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ category: "academic_research" }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          setAcademicResearch(data);
          setPdfUrl(data?.pdf_path[0]);
          setActiveYear(data?.year[0]);
        }
      } catch (error) {
        console.error("Fetching Error:", error);
      }
    }

    fetchData();
  }, []);

  return (
    <>
      <div>
        <Banner toggle={toggle} theme={theme}
          backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
          headerText="Academic Research"
          subHeaderText="Enrich Your Knowledge"
        />
      </div>
      <div className="research-academicresearch-container">
        <h1 className="research-academicresearch-title">
          Academic Research - Year wise Consolidation
        </h1>

        <div className="research-academicresearch-button-container">
          {academicresearch?.year?.map((year,index) => (
            <button
              key={year}
              onClick={() => {
                setPdfUrl(academicresearch?.pdf_path[index]);
                setActiveYear(year);
              }}
              className={`research-academicresearch-button ${
                activeYear === year ? "active" : ""
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        <iframe
          src={pdfUrl}
          className="research-academicresearch-iframe-container"
        />
      </div>
    </>
  );
}
