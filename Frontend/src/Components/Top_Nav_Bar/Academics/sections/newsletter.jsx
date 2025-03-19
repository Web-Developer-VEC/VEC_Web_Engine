import { useState } from "react";
import './newsletter.css';
import LoadComp from "../../../LoadComp";

export default function Newsletter({ data }) {
  const [activeYear, setActiveYear] = useState(null);

  if (!data || !data.years) {
    return <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
      <LoadComp />
    </div>
  }

  const {  years } = data; 

  return (
    <div className="news-container">

      <div className="news-tabs-container">
        {Object.keys(years).map((year) => (
          <button
            key={year}
            className={`news-tab-button ${activeYear === year ? "news-active-tab" : ""}`}
            onClick={() => setActiveYear(year)}
          >
            {year}
          </button>
        ))}
      </div>

      {activeYear && (
        <div className={`news-pdf-container ${years[activeYear].length === 2 ? "news-two-pdfs" : "news-one-pdf"}`}>
          {years[activeYear].map((pdf, index) => (
            <iframe key={index} src={pdf} title={`PDF ${index + 1}`} className="news-pdf-frame"></iframe>
          ))}
        </div>
      )}
    </div>
  );
}
