import { useEffect, useState } from "react";
import "./Sponseredresearch.css";
import Banner from "../../Banner";

export default function Sponseredresearch({theme, toggle}) {
  const [pdfUrl, setPdfUrl] = useState(null); // Default PDF
  const [activeYear, setActiveYear] = useState(null); // Track active button
  const [sponserresearch, setSponserResearch] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/get_research_data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ category: "sponsored_research" }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          setSponserResearch(data);
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
          headerText="Sponsered Research "
          subHeaderText="Enrich Your Knowledge"
        />
      </div>
      <div className="research-sponsoredresearch-container">
        <h1 className="research-sponsoredresearch-title">
          Sponsered Research - Year wise Consolidation
        </h1>

        <div className="research-sponsoredresearch-button-container">
          {sponserresearch?.year?.map((year,index) => (
            <button
              key={year}
              onClick={() => {
                setPdfUrl(sponserresearch?.pdf_path[index]);
                setActiveYear(year);
              }}
              className={`research-sponsoredresearch-button ${
                activeYear === year ? "active" : ""
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        <iframe
          src={pdfUrl}
          className="research-sponsoredresearch-iframe-container"
        />
      </div>
    </>
  );
}
