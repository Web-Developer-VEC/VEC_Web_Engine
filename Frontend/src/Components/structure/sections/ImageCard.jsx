import React from 'react';
import { SiPublons } from "react-icons/si";
import { FaGoogleScholar } from "react-icons/fa6";
import { FaOrcid } from "react-icons/fa";
import { FaResearchgate } from "react-icons/fa6";
import styles from './Faculties.module.css';


const ImageCard = ({ name, photo, Designation, Scholar, Research, Orchid, Publon, Scopus, Linkedin }) => (
  <div className={styles.imagecard}>
    <img src={photo} alt={name} />
    <h3>{name}</h3>
    <p>{Designation}</p>
    <div className={styles.socialLinks}>
      <a href={Publon} target="_blank" className={styles.socialLink}>
        <SiPublons />
      </a>
      <a href={Scholar} target="_blank" className={styles.socialLink}>
        <FaGoogleScholar />
      </a>
      <a href={Orchid} target="_blank" className={styles.socialLink}>
        <FaOrcid/>
     </a>
     <a href={Research} target="_blank" className={styles.socialLink}>
        <FaResearchgate/>
     </a>
     </div>
    <button className={styles.FACButton}>View More</button>
  </div>
);

export default ImageCard;

