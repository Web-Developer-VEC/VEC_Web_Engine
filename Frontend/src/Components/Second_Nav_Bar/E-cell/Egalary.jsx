import React from "react";
import "./Egalary.css";

export default function Gall({gallery}) {


    const BASE_URL = process.env.REACT_APP_BASE_URL;

const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };
  return (
    <div className="gallery-container">
      <h2 className="text-2xl text-center text-brwn dark:text-drkt my-4">Gallery</h2>
      <div className="gallery-images">

        {gallery?.image_path?.map((gallery,index)=>(

        <div className="gallery-item"key={index}>
        <img src={UrlParser(gallery)} alt={gallery} className="gallery-image"/>
        </div>
        ))}
      </div>
    </div>
  );
}
