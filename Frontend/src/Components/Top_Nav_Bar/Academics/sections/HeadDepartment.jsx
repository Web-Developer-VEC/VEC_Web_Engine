import React, { useEffect, useState } from "react";
import styles from '../HeadDepartment.module.css';
import { FaBook, FaLinkedin } from 'react-icons/fa';
import { SiPublons } from "react-icons/si";
import { FaGoogleScholar } from "react-icons/fa6";
import { FaOrcid } from "react-icons/fa";
import { FaResearchgate } from "react-icons/fa6";
import LoadComp from "../../../LoadComp";


const HeadDepartment = ({ data }) => {
  const [departmentData, setDepartmentData] = useState(null);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    // Simulating fetching data from the database (replace with actual API call)
    if (data) {
      setDepartmentData(data);
    }
  }, [data]);

  if (!departmentData) {
    return <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
      <LoadComp />
  </div>
  }

  const {
    Name = departmentData.Name,
    uid = departmentData.Unique_id,
    Qualification = [departmentData.Qualification],
    designation = departmentData.designation,
    Hod_message = departmentData.Hod_message,
    Image = departmentData.Image, // Provide a default path if needed
    Social_media_links = {},
  } = departmentData;



  return (
    <div className={styles.messageContent + " text-text dark:text-drkt"}>
      <div className={styles.textColumn}>
        <div className={styles.hodInfo}>
          <h2 className={styles.messageHeader + " text-accn dark:text-drka"}>
            {Name}, <span className={styles.messageHeader2 + " text-black dark:text-drks"}>{Qualification.join(", ")}</span>
          </h2>
          <p className={styles.hodDesignation}>{designation}</p>
        </div>

        <div className={styles.hodMessage + " text-text dark:text-drkt"}>
          <h3 className={styles.messageTitle + " text-text dark:text-drkt border-b-2 border-secd dark:border-drks"}>HOD's Message</h3>
          <p className={styles.messageBody}>{Hod_message}</p>
        </div>
        <a className={styles.viewMoreButton + " bg-secd dark:bg-drks text-text dark:text-drkt"} href={`/facultyprofile/${uid}`}>View More</a>
      </div>

      <div className={styles.imageColumn}>
        {Image ? (
          <img src={UrlParser(Image)} alt="Head of Department" className={styles.hodImage} />
        ) : (
          <p>No image available</p>
        )}
        <div className={styles.socialLinks}>
        {Social_media_links['LinkedIn'] && (
            <a
              href={Social_media_links['LinkedIn']}
              className={styles.socialLink + " text-accn dark:text-drka hover:text-secd dark:hover:text-drks"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaLinkedin />
            </a>
          )}
          {Social_media_links['Publon'] && (
            <a
              href={Social_media_links['Publon']}
              className={styles.socialLink + " text-accn dark:text-drka hover:text-secd dark:hover:text-drks"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <SiPublons />
            </a>
          )}
          {Social_media_links['Google Scholar'] && (
            <a
              href={Social_media_links['Google Scholar']}
              className={styles.socialLink + " text-accn dark:text-drka hover:text-secd dark:hover:text-drks"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaGoogleScholar />
            </a>
          )}
          {Social_media_links['Orchid Profile'] && (
            <a
              href={Social_media_links['Orchid Profile']}
              className={styles.socialLink + " text-accn dark:text-drka hover:text-secd dark:hover:text-drks"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaOrcid />
            </a>
          )}
          {Social_media_links['Research Gate'] && (
            <a
              href={Social_media_links['Research Gate']}
              className={styles.socialLink + " text-accn dark:text-drka hover:text-secd dark:hover:text-drks"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaResearchgate />
            </a>
          )}
          {Social_media_links['Scopus'] && (
            <a
              href={Social_media_links['Scopus']}
              className={styles.socialLink + " text-accn dark:text-drka hover:text-secd dark:hover:text-drks"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaBook />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeadDepartment;
