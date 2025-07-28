import { useState } from "react";
import "./Eactivity.css";
import LoadComp from "../../LoadComp";

export default function ImageGallery({ activity }) {
  const [selectedPdf, setSelectedPdf] = useState(null);
  console.log("Act",activity);
  

  const handleClick = (year) => {
    setSelectedPdf(year);
  };

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

if (!Array.isArray(activity)) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
}

  return (
    <>
      {activity ? (
      <div className="dark:bg-drkp">
        <div className="year-links">
          {activity?.map((year) => (
            <span key={year.year} onClick={() => handleClick(year.pdf_path)}>
              <i className="fa fa-link" /> {year.year}
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
      ) : (
        <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
        </div>
      )}
    </>
  );
}
