import React from 'react';
import { SiPublons } from "react-icons/si";
import { FaGoogleScholar } from "react-icons/fa6";
import { FaOrcid } from "react-icons/fa";
import { FaResearchgate } from "react-icons/fa6";
import styles from './Facullties.module.css';


const ImageCard = ({ name, photo, Designation }) => (
  <div className={styles.imagecard}>
    <img src={photo} alt={name} />
    <h3>{name}</h3>
    <p>{Designation}</p>
    <div className={styles.socialLinks}>
      <a href="" className={styles.socialLink}>
        <SiPublons />
      </a>
      <a href="" className={styles.socialLink}>
        <FaGoogleScholar />
      </a>
      <a href="" className={styles.socialLink}>
        <FaOrcid/>
     </a>
     <a href="" className={styles.socialLink}>
        <FaResearchgate/>
     </a>
     </div>
    <button >View More</button>
  </div>
);

export default ImageCard;
