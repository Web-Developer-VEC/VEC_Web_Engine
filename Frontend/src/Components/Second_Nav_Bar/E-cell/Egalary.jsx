import React from "react";
import "./Egalary.css";
import LoadComp from "../../LoadComp";

export default function Gall({gallery}) {


    const BASE_URL = process.env.REACT_APP_BASE_URL;

const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };
  return (
    <>
      {gallery ? (
      <div className="e-">
        <h2 className="text-2xl text-center text-brwn dark:text-drkt my-4">Gallery</h2>
        <div className="gallery-images">

          {gallery?.image_path?.map((gallery,index)=>(

            <div className="gallery-item"key={index}>
              <img src={UrlParser(gallery)} alt={gallery} className="gallery-image"/>
            </div>
          ))}
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
