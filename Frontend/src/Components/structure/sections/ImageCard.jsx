import React from "react";
import { SiPublons } from "react-icons/si";
import { FaGoogleScholar } from "react-icons/fa6";
import { FaOrcid, FaResearchgate, FaLinkedin } from "react-icons/fa";
import styles from "./Faculties.module.css";

const ImageCard = ({ name, photo, Designation, Scholar, Research, Orchid, Publon, Scopus, Linkedin }) => (
  <div className={styles.imagecard}>
    <img src={photo} alt={name} />
    <h3>{name}</h3>
    <p className={styles.imagecard_p}>{Designation}</p>
    <div className={styles.socialLinks}>
      {Publon && (
        <a href={Publon} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
          <SiPublons />
        </a>
      )}
      {Scholar && (
        <a href={Scholar} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
          <FaGoogleScholar />
        </a>
      )}
      {Orchid && (
        <a href={Orchid} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
          <FaOrcid />
        </a>
      )}
      {Research && (
        <a href={Research} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
          <FaResearchgate />
        </a>
      )}
      {Linkedin && (
        <a href={Linkedin} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
          <FaLinkedin />
        </a>
      )}
      {Scopus && (
        <a href={Scopus} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
          <img src="/Images/scopus.png" alt="Scopus Author Profile" />
        </a>
      )}
    </div>
    <button className={styles.FACButton}>View More</button>
  </div>
);

export default ImageCard;
