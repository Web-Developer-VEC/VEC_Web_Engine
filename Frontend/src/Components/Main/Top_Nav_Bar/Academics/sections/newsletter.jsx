import { useState } from "react";
import './newsletter.css';
import LoadComp from "../../../LoadComp";

export default function Newsletter({ data }) {
  const [activeYear, setActiveYear] = useState(null);

  if (!data) {
    return (
      <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
        <LoadComp />
      </div>
    );
  }

  // Get newsletter content
  const newsletter = data?.find((item) => item.category === "newsletter")?.content || [];

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  // Group PDFs by year and flatten arrays
  const groupedByYear = newsletter.reduce((acc, item) => {
    acc[item.year] = acc[item.year] || [];
    acc[item.year].push(...item.pdf_path); // flatten so each path is a string
    return acc;
  }, {});

  console.log(groupedByYear);
  

  const allYears = Object.keys(groupedByYear);

  return (
    <div className="news-container">
      {/* Year selection buttons */}
      <div className="news-tabs-container">
        {allYears.map((year, i) => (
          <button
            key={i}
            className={`news-tab-button ${activeYear === year ? "news-active-tab" : ""}`}
            onClick={() => setActiveYear(year)}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Show PDFs for the selected year */}
      {activeYear && (
        <div
          className={`news-pdf-container ${
            groupedByYear[activeYear]?.length === 2 ? "news-two-pdfs" : "news-one-pdf"
          }`}
        >
          {groupedByYear[activeYear]?.map((pdf, index) => (
            <iframe
              key={index}
              src={UrlParser(pdf)}
              title={`PDF ${index + 1}`}
              className="news-pdf-frame"
            />
          ))}
        </div>
      )}
    </div>
  );
}
