import { useState } from "react";
import './newsletter.css';

export default function Newsletter({ data }) {
  const [activeYear, setActiveYear] = useState(null);

  if (!data || !data.years) {
    return <p>Loading...</p>;
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
