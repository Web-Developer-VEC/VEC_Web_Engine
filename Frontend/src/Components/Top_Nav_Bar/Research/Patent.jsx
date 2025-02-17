import { useState } from "react";
import "./PatentConsolidation.css"; // Import the CSS file
import Banner from "../../Banner";

export default function PatentConsolidation() {
  const [pdfUrl, setPdfUrl] = useState("/pdfs/2024-2025.pdf"); // Default PDF
  const [activeYear, setActiveYear] = useState("2024-2025"); // Track active button

  const years = [
    "2024-2025",
    "2023-2024",
    "2022-2023",
    "2021-2022",
    "2020-2021",
  ];

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
          {years.map((year) => (
            <button
              key={year}
              onClick={() => {
                setPdfUrl(`/pdfs/${year}.pdf`);
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
