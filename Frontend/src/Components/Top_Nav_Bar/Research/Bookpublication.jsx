import { useEffect, useState } from "react";
import "./Bookpublication.css";
import Banner from "../../Banner";

export default function Bookpublication() {
  const [pdfUrl, setPdfUrl] = useState(null); // Default PDF
  const [activeYear, setActiveYear] = useState(null); // Track active button
  const [books, setBooks] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/get_research_data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ category: "book_publications" }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          setBooks(data);
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
          headerText="Book Publication"
          subHeaderText="Enrich Your Knowledge"
        />
      </div>
      <div className="research-bookpublication-container">
        <h1 className="research-bookpublication-title">
          Book Publication - Yearwise Consolidation
        </h1>

        <div className="research-bookpublication-button-container">
          {books?.year?.map((year,index) => (
            <button
              key={year}
              onClick={() => {
                setPdfUrl(books?.pdf_path[index]);
                setActiveYear(year);
              }}
              className={`research-bookpublication-button ${
                activeYear === year ? "active" : ""
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        <iframe
          src={pdfUrl}
          className="research-bookpublication-iframe-container"
        />
      </div>
    </>
  );
}
