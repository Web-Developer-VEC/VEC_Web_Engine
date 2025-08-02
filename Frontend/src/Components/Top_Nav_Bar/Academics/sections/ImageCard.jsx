import React, { useState } from "react";
import {useNavigate} from 'react-router-dom';
import { SiPublons } from "react-icons/si";
import { FaOrcid, FaResearchgate, FaLinkedin, FaBook } from "react-icons/fa";
import styles from "./Faculties.module.css";
import { FaGoogleScholar } from "react-icons/fa6";



function ImageCard ({ name, photo, Designation, Scholar, Research, Orchid, Publon, Scopus, Linkedin, firstTile ,uid}) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const navigate = useNavigate()
  return  (
  <>
<div 
  className={`rounded-lg bg-[color-mix(in_srgb,theme(colors.prim)_85%,black)] 
              dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] 
              h-[95%] 
              ${firstTile ? 'w-[65%] lg:w-full mb-8 lg:mr-10 basis-full mx-3' : 'w-fit lg:w-[90%]'} 
              ${firstTile ? styles.firstTile : styles.imageCard}`}>


    <img src={UrlParser(photo)} alt={name} className={firstTile ? styles.firstTileImage : styles.image} />
    <div className={firstTile ? styles.firstTileContent : styles.cardContent}>
      <h3 className={styles.facultyName + " text-text dark:text-drkt"}>{name}</h3>
      <p className="+ text-[#800000] dark:text-drka">{Designation}</p>
      <div className={firstTile ? styles.firstTileSocialLinks : styles.socialLinks}>
        {Linkedin && (
          <a href={Linkedin} target="_blank" rel="noopener noreferrer">
            <FaLinkedin className="text-brwn dark:text-drka" />
          </a>
        )}
        {Publon && (
          <a href={Publon} target="_blank" rel="noopener noreferrer">
            <SiPublons  className="text-brwn dark:text-drka" />
          </a>
        )}
        {Scholar && (
          <a href={Scholar} target="_blank" rel="noopener noreferrer">
            <FaGoogleScholar className="text-brwn dark:text-drka" />
          </a>
        )}
        {Orchid && (
          <a href={Orchid} target="_blank" rel="noopener noreferrer">
            <FaOrcid className="text-brwn dark:text-drka" />
          </a>
        )}
        {Research && (
          <a href={Research} target="_blank" rel="noopener noreferrer">
            <FaResearchgate className="text-brwn dark:text-drka" />
          </a>
        )}
        {Scopus && (
          <a href={Scopus} target="_blank" rel="noopener noreferrer">
            <FaBook className="text-brwn dark:text-drka" />
          </a>
        )}
      </div>
       
      {/* <button */}
        {/* onClick={() => navigate(`/facultyprofile/${uid}`)} */}
       {/* className={styles.facButton + " bg-brwn dark:bg-drks hover:bg-secd text-prim dark:text-black"}> */}
        {/* View More</button> */}
    </div>
  </div>
  </>
)};

export default ImageCard;
