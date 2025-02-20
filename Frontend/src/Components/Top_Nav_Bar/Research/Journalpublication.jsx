import { useState } from "react";
import "./Journalpublication.css";
import Banner from "../../Banner";

export default function Journalpublication({theme, toggle}) {
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
        <Banner toggle={toggle} theme={theme}
          backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
          headerText="Journal Publication"
          subHeaderText="Enrich Your Knowledge"
        />
      </div>
      <div className="research-journal-container">
        <h1 className="research-journal-title text-secd dark:text-drks">
          Journal Publication - Yearwise Consolidation
        </h1>

        <div className="research-journal-button-container">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => {
                setPdfUrl(`/pdfs/${year}.pdf`);
                setActiveYear(year);
              }}
              className={`research-journal-button dark:text-drkt ${
                activeYear === year ? "active bg-accn dark:bg-drka text-prim" : "bg-secd dark:bg-drks text-text"
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        <iframe src={pdfUrl} className="research-journal-iframe-container   [border:0.25rem_solid_theme(colors.secd)]
            dark:[border:0.25rem_solid_theme(colors.drks)]" />
      </div>
    </>
  );
}
