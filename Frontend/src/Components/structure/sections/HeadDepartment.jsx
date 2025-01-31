import React, { useEffect, useState } from "react";
import styles from '../HeadDepartment.module.css';
import { FaLinkedin } from 'react-icons/fa';
import { SiPublons } from "react-icons/si";
import { FaGoogleScholar } from "react-icons/fa6";
import { FaOrcid } from "react-icons/fa";
import { FaResearchgate } from "react-icons/fa6";


const HeadDepartment = ({ data }) => {
  const [departmentData, setDepartmentData] = useState(null);

  useEffect(() => {
    // Simulating fetching data from the database (replace with actual API call)
    if (data) {
      setDepartmentData(data);
    }
  }, [data]);

  if (!departmentData) {
    return <p>Loading...</p>;
  }

  const {
    Name = departmentData.Name,
    Qualification = [departmentData.Qualification],
    designation = departmentData.designation,
    Hod_message = departmentData.Hod_message,
    Image = departmentData.Image, // Provide a default path if needed
    Social_media_links = {},
  } = departmentData;

  return (
    <div className={styles.messageContent}>
      <div className={styles.textColumn}>
        <div className={styles.hodInfo}>
          <h2 className={styles.messageHeader}>
            {Name}, <span className={styles.messageHeader2}>{Qualification.join(", ")}</span>
          </h2>
          <p className={styles.hodDesignation}>{designation}</p>
        </div>

        <div className={styles.hodMessage}>
          <h3 className={styles.messageTitle}>HOD's Message</h3>
          <p className={styles.messageBody}>{Hod_message}</p>
        </div>
        <button className={styles.viewMoreButton}>View More</button>
      </div>

      <div className={styles.imageColumn}>
        {Image ? (
          <img src={Image} alt="Head of Department" className={styles.hodImage} />
        ) : (
          <p>No image available</p>
        )}
        <div className={styles.socialLinks}>
          {Social_media_links['Publon'] && (
            <a
              href={Social_media_links['Publon']}
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <SiPublons />
            </a>
          )}
          {Social_media_links['Google Scholar'] && (
            <a
              href={Social_media_links['Google Scholar']}
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaGoogleScholar />
            </a>
          )}
          {Social_media_links['Orchid Profile'] && (
            <a
              href={Social_media_links['Orchid Profile']}
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaOrcid />
            </a>
          )}
          {Social_media_links['Research Gate'] && (
            <a
              href={Social_media_links['Research Gate']}
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaResearchgate />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeadDepartment;
