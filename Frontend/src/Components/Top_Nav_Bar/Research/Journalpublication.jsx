import { useEffect, useState } from "react";
import "./Journalpublication.css";
import Banner from "../../Banner";

export default function Journalpublication() {
  const [pdfUrl, setPdfUrl] = useState(null); // Default PDF
  const [activeYear, setActiveYear] = useState(null); // Track active button
  const [journalPublication, setJournalPublication] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/get_research_data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ category: "journal_publication" }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          setJournalPublication(data);
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
          headerText="Journal Publication"
          subHeaderText="Enrich Your Knowledge"
        />
      </div>
      <div className="research-journal-container">
        <h1 className="research-journal-title">
          Journal Publication - Yearwise Consolidation
        </h1>

        <div className="research-journal-button-container">
          {journalPublication?.year?.map((year,index) => (
            <button
              key={year}
              onClick={() => {
                setPdfUrl(journalPublication?.pdf_path[index]);
                setActiveYear(year);
              }}
              className={`research-journal-button ${
                activeYear === year ? "active" : ""
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        <iframe src={pdfUrl} className="research-journal-iframe-container" />
      </div>
    </>
  );
}
