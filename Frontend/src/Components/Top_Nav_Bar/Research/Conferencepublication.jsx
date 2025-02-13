import { useState } from "react";
import "./Conferencepublication.css";
import Banner from "../../Banner";

export default function Conferencepublication() {
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
          headerText="Conference Publication"
          subHeaderText="Enrich Your Knowledge"
        />
      </div>
      <div className="research-conference-container">
        <h1 className="research-conference-title">
          Conference Publication - Yearwise Consolidation
        </h1>

        <div className="research-conference-button-container">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => {
                setPdfUrl(`/pdfs/${year}.pdf`);
                setActiveYear(year);
              }}
              className={`research-conference-button ${
                activeYear === year ? "active" : ""
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        <iframe src={pdfUrl} className="research-conference-iframe-container" />
      </div>
    </>
  );
}
