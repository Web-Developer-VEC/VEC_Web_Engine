import React from "react";
import { useNavigate } from "react-router-dom";
// import galleryData from "./data"; // ✅ Importing image data array
import "./Gallery.css";
import Banner from "../../Banner";

const Gallery = ({ toggle, theme}) => {
  const navigate = useNavigate();

  const handleReadMore = (id) => {
    navigate(`/gallery-details/${id}`);
  };
  // ./data.js
const galleryData = [
  {
    id: 1,
    src: "https://tse1.mm.bing.net/th/id/OIP.CzrhIYzmH4IqMAfAm-duNwHaEo?pid=Api&P=0&h=220",
    title: "Save Earth Rally",
    description: "A rally promoting environmental awareness and sustainability.",
  },
  {
    id: 2,
    src: "/images/img2.jpg",
    title: "Police & Cadet March",
    description: "March past by cadets and police team on Republic Day.",
  },
  {
    id: 3,
    src: "/images/img3.jpg",
    title: "Cycle Awareness Ride",
    description: "Community cycling event promoting clean transportation.",
  },
  {
    id: 4,
    src: "/images/img4.jpg",
    title: "College Entrance",
    description: "Main gate of the college decorated during the annual event.",
  },
   {
    id: 5,
    src: "/images/img4.jpg",
    title: "College Entrance",
    description: "Main gate of the college decorated during the annual event.",
  },
];
  return (
    <>
    {/* <div className="overflow-y-auto"> */}
        <Banner toggle={toggle} theme={theme}
        backgroundImage="./Banners/IIC.webp"            
        headerText="Gallery"
            subHeaderText="Some pics of velammal Engineering Collegge"
        />
        <div className="gallery-container overflow-y-auto">
          <h1 className="gallery-title">Gallery</h1>
          <div className="gallery-grid">
            {galleryData.map((img) => (
              <div key={img.id} className="gallery-card">
                <img src={img.src} alt={img.title} className="gallery-image" />
                <div className="gallery-content">
                  <h2 className="gallery-title-text">{img.title}</h2>
                  <button
                    className="read-more-button"
                    onClick={() => handleReadMore(img.id)}
                  >
                    Read More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
    {/* </div> */}
    </>
  );
};

export default Gallery;
