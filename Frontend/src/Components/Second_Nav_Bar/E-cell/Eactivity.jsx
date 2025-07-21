import { useState } from "react";
import "./Eactivity.css";

export default function ImageGallery({ activity }) {
  const [selectedPdf, setSelectedPdf] = useState(null);

  const pdfMap = {};

  activity?.pdfs_path?.forEach((path) => {
    const fileName = path.split("/").pop().replace(".pdf", ""); // eg: 2020-2021, 2021-2022
    pdfMap[fileName] = path;
  });

  const handleClick = (year) => {
    setSelectedPdf(pdfMap[year]);
  };

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  return (
    <div className="container">
      <div className="year-links">
        {Object.keys(pdfMap).map((year) => (
          <span key={year} onClick={() => handleClick(year)}>
            <i className="fa fa-link" /> {year}
          </span>
        ))}
      </div>

      <div className="image-display" id="displayed-image">
        {selectedPdf && (
          <div className="image-container">
            <iframe
              src={UrlParser(selectedPdf)}
              title="Activity PDF"
              width="100%"
              height="600px"
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
}
