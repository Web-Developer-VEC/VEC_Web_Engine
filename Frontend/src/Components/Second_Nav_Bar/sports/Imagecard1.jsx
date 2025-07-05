import React from "react";
import styles from "../../Top_Nav_Bar/Academics/sections/Faculties.module.css";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const UrlParser = (path) => {
  return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
};

const ImageCard = ({ name, photo, Designation , qualification , firstTile }) => (

  <>
  <div className={`${firstTile ? styles.firstTile + ' w-[95%] lg:w-full mb-8 lg:mr-10 basis-full mx-3' : 
        styles.imageCard + ' w-fit lg:w-[90%]'} rounded-lg bg-[color-mix(in_srgb,theme(colors.prim)_85%,black)] 
        dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]`}>
    <img src={UrlParser(photo)} alt={name} className={firstTile ? styles.firstTileImage : styles.image} />
    <div className={firstTile ? styles.firstTileContent : styles.cardContent}>
      <h3 className={styles.facultyName + " text-accn dark:text-drka"}>{name}</h3>
      <p>{qualification}</p>
      <p>{Designation}</p>
    </div>
  </div>
  </>
);

export default ImageCard;
