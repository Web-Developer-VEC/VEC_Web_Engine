import React from "react";
import { SiPublons } from "react-icons/si";
import { FaGoogleScholar } from "react-icons/fa6";
import { FaOrcid, FaResearchgate, FaLinkedin } from "react-icons/fa";
import styles from "./Faculties.module.css";

const ImageCard = ({ name, photo, Designation, Scholar, Research, Orchid, Publon, Scopus, Linkedin, firstTile }) => (
  <div className={firstTile ? styles.firstTile : styles.imageCard}>
    <img src={photo} alt={name} className={firstTile ? styles.firstTileImage : styles.image} />
    <div className={firstTile ? styles.firstTileContent : styles.cardContent}>
      <h3 className={styles.facultyName}>{name}</h3>
      <p>{Designation}</p>
      <div className={firstTile ? styles.firstTileSocialLinks : styles.socialLinks}>
        {Publon && (
          <a href={Publon} target="_blank" rel="noopener noreferrer">
            <SiPublons />
          </a>
        )}
        {Scholar && (
          <a href={Scholar} target="_blank" rel="noopener noreferrer">
            <FaGoogleScholar />
          </a>
        )}
        {Orchid && (
          <a href={Orchid} target="_blank" rel="noopener noreferrer">
            <FaOrcid />
          </a>
        )}
        {Research && (
          <a href={Research} target="_blank" rel="noopener noreferrer">
            <FaResearchgate />
          </a>
        )}
        {Linkedin && (
          <a href={Linkedin} target="_blank" rel="noopener noreferrer">
            <FaLinkedin />
          </a>
        )}
      </div>
      <button className={styles.facButton}>View More</button>
    </div>
  </div>
);

export default ImageCard;
