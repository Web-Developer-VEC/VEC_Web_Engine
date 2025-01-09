import React from "react";
import styles from '../HeadDepartment.module.css';
import { FaFacebook, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { SiPublons } from "react-icons/si";
import { FaGoogleScholar } from "react-icons/fa6";
import { FaOrcid } from "react-icons/fa";
import { FaResearchgate } from "react-icons/fa6";
import visu from '../../Assets/Visu.png';
const HeadDepartment = () => {
  return (
  <div className={styles.messageContent}>
  <div className={styles.textColumn}>
    <div className={styles.hodInfo}>
      <h2 className={styles.messageHeader}>
        Dr. P. Visu, <span className={styles.messageHeader2}>M.E., Ph.D</span>
      </h2>
      <p className={styles.hodDesignation}>
        Professor and Head, Dept of Artificial Intelligence and Data Science
      </p>
    </div>

    <div className={styles.hodMessage}>
      <h3 className={styles.messageTitle}>HOD's Message</h3>
      <p className={styles.messageBody}>
        I feel privileged to lead a team of talented and experienced faculty members. AI & DS is the most 
        conspicuous technology transforming the facet of industry and mankind. This course is specially designed 
        to enable students to build intelligent machines, software, or applications with a cutting-edge 
        combination of Machine Learning, Deep Learning, Analytics, and Visualization technologies.
      </p>
      <p className={styles.messageBody}>
        Our department aims to produce skilled professionals in the domain of AI and DS and enable them to excel 
        professionally. It also provides state-of-the-art laboratory facilities to the students to get better 
        practical exposure and strong ties with industry, research organizations, and the community at large.
      </p>
    </div>
    <button className={styles.viewMoreButton}>View More</button>

  </div>

  <div className={styles.imageColumn}>
    <img 
      src={visu} 
      alt="Head of Department" 
      className={styles.hodImage} 
    />
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
  </div>
</div>
  );
};

export default HeadDepartment;
