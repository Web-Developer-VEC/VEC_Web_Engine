import { useState } from "react";
import "./Eactivity.css";

export default function ImageGallery() {
  const [selectedImage, setSelectedImage] = useState(null);

  const images = {
    "2015-2016": "/images/.jpg",
    "2016-2017": "/images/.jpg",
    "2017-2018": "/images/.jpg",
    "2018-2019": "/images/.jpg",
    "2019-2020": "/images/.jpg",
    "2020-2021": "/images/.jpg",
    "2021-2022": "/images/.jpg",
    "2022-2023": "/images/.jpg",
    "2023-2024": "/images/.jpg",
    "2022-2023 back": "/images/.jpg",
    "2024-2025 ecell": "/images/.jpg",
  };

  const handleClick = (year) => {
    setSelectedImage(images[year]);
    setTimeout(() => {
      const imageElement = document.getElementById("displayed-image");
    //   if (imageElement) {
    //     imageElement.scrollIntoView({ behavior: "smooth" });
    //   }
    }, 100);
  };

  return (
    <div className="container">
      <div className="year-links">
        {Object.keys(images).map((year) => (
          <span key={year} onClick={() => handleClick(year)}>
            <i className="fa fa-link" /> {year}
          </span>
        ))}
      </div>

      <div className="image-display" id="displayed-image">
        {selectedImage && (
          <div className="image-container">
            <img src={selectedImage} alt="Activity" />
          </div>
        )}
      </div>
    </div>
  );
}