import React, { useState } from "react";
import { SiPublons } from "react-icons/si";
import { FaGoogleScholar } from "react-icons/fa6";
import { FaOrcid, FaResearchgate, FaLinkedin } from "react-icons/fa";
import styles from "./Faculties.module.css";

const ImageCard = ({ name, photo, Designation, Scholar, Research, Orchid, Publon, Scopus, Linkedin, firstTile ,uid}) => (

  <>
  <div className={`${firstTile ? styles.firstTile : styles.imageCard} bg-prim dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] rounded-lg`}>
    <img src={photo} alt={name} className={firstTile ? styles.firstTileImage : styles.image} />
    <div className={firstTile ? styles.firstTileContent : styles.cardContent}>
      <h3 className={styles.facultyName + " text-secd dark:text-drks"}>{name}</h3>
      <p>{Designation}</p>
      <div className={firstTile ? styles.firstTileSocialLinks : styles.socialLinks}>
        {Publon && (
          <a href={Publon} target="_blank" rel="noopener noreferrer">
            <SiPublons  className="text-secd dark:text-drks" />
          </a>
        )}
        {Scholar && (
          <a href={Scholar} target="_blank" rel="noopener noreferrer">
            <FaGoogleScholar className="text-secd dark:text-drks" />
          </a>
        )}
        {Orchid && (
          <a href={Orchid} target="_blank" rel="noopener noreferrer">
            <FaOrcid className="text-secd dark:text-drks" />
          </a>
        )}
        {Research && (
          <a href={Research} target="_blank" rel="noopener noreferrer">
            <FaResearchgate className="text-secd dark:text-drks" />
          </a>
        )}
        {Linkedin && (
          <a href={Linkedin} target="_blank" rel="noopener noreferrer">
            <FaLinkedin className="text-secd dark:text-drks" />
          </a>
        )}
      </div>
      <button className={styles.facButton + " bg-secd dark:bg-drks hover:bg-accn hover:text-text " +
          "dark:hover:bg-drka dark:hover:drkt"}>
        <a href={`/facultyprofile/${uid}`} className="no-underline text-white">View More</a></button>
    </div>
  </div>
  </>
);

export default ImageCard;
