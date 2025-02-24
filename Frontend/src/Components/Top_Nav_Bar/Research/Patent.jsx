import { useEffect, useState } from "react";
import "./PatentConsolidation.css"; // Import the CSS file
import Banner from "../../Banner";

export default function PatentConsolidation() {
  const [pdfUrl, setPdfUrl] = useState(null); 
  const [activeYear, setActiveYear] = useState(null); 
  const [patent, setPatent] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/get_research_data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ category: "patents" }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          setPatent(data);
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
        <Banner
          backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
          headerText="Patents"
          subHeaderText="Enrich Your Knowledge"
        />
      </div>
      <div className="research-patent-container">
        <h1 className="research-patent-title">
          Patent - Yearwise Consolidation
        </h1>

        <div className="research-patent-button-container">
          {patent?.year?.map((year,index) => (
            <button
              key={year}
              onClick={() => {
                setPdfUrl(patent?.pdf_path[index]);
                setActiveYear(year);
              }}
              className={`research-patent-button ${
                activeYear === year ? "active" : ""
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        <iframe src={pdfUrl} className="research-patent-iframe-container" />
      </div>
    </>
  );
}
