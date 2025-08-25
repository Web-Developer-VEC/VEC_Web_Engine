import React, { useEffect, useState } from "react";
import styles from '../HeadDepartment.module.css';
import { FaBook, FaLinkedin } from 'react-icons/fa';
import { SiPublons } from "react-icons/si";
import { FaGoogleScholar } from "react-icons/fa6";
import { FaOrcid } from "react-icons/fa";
import { FaResearchgate } from "react-icons/fa6";
import LoadComp from "../../../LoadComp";


const HeadDepartment = ({ data }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const hod_details = data?.find((item) => item.category === "hod_details")?.content || [];

  const {
    Name = hod_details?.[0]?.name,
    uid = hod_details?.[0]?.unique_id,
    Qualification = [hod_details?.[0]?.qualification],
    designation = hod_details?.[0]?.designation,
    Hod_message = hod_details?.[0]?.hod_message,
    Image = hod_details?.[0]?.hod_image, // Provide a default path if needed
    Social_media_links = hod_details?.[0]?.Social_media_links || {},
    resume = hod_details?.[0]?.resume_pdf
  } = hod_details || {};

  return (
    <>
    
    {Hod_message ? (
      <>
    <div className={styles.messageContent + " text-text dark:text-drkt"}>
          <div className={styles.textColumn}>
            <div className={styles.hodInfo}>
              <h2 className={styles.messageHeader + " + text-[#00000]"}>
                {Name}, <span className={styles.messageHeader2 + " text-text dark:text-drka"}>{Qualification.join(", ")}</span>
              </h2>
              <p className={styles.hodDesignation}>{designation}</p>
            </div>

            <div className={styles.hodMessage + " text-text dark:text-drkt"}>
              <h3 className={styles.messageTitle + " + text-[#800000] dark:text-drkt border-b-2 border-secd dark:border-drks"}>HOD's Message</h3>
              <p className={styles.messageBody}>{Hod_message}</p>
            </div>
            <a className={styles.viewMoreButton + " bg-secd dark:bg-drks text-text"}
            href={resume ? UrlParser(resume) : "#"}
            target="_blank"
            rel="noopener noreferrer"
            //  href={`/facultyprofile/${uid}`}
             >View More</a>
          </div>

          <div className={styles.imageColumn}>
            {Image ? (
              <img src={UrlParser(Image)} alt="Head of Department" className={styles.hodImage} />
            ) : (
              <p>No image available</p>
            )}
            <div className={styles.socialLinks}>
            {Social_media_links['linkedin'] && (
                <a
                  href={Social_media_links['linkedin']}
                  className={styles.socialLink + " text-accn dark:text-drka hover:text-secd dark:hover:text-drks"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaLinkedin />
                </a>
              )}
              {Social_media_links['publonprofile'] && (
                <a
                  href={Social_media_links['publonprofile']}
                  className={styles.socialLink + " text-accn dark:text-drka hover:text-secd dark:hover:text-drks"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SiPublons />
                </a>
              )}
              {Social_media_links['googlescholar'] && (
                <a
                  href={Social_media_links['googlescholar']}
                  className={styles.socialLink + " text-accn dark:text-drka hover:text-secd dark:hover:text-drks"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaGoogleScholar />
                </a>
              )}
              {Social_media_links['orchidprofile'] && (
                <a
                  href={Social_media_links['orchidprofile']}
                  className={styles.socialLink + " text-accn dark:text-drka hover:text-secd dark:hover:text-drks"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaOrcid />
                </a>
              )}
              {Social_media_links['researchgate'] && (
                <a
                  href={Social_media_links['researchgate']}
                  className={styles.socialLink + " text-accn dark:text-drka hover:text-secd dark:hover:text-drks"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaResearchgate />
                </a>
              )}
              {Social_media_links['scopus'] && (
                <a
                  href={Social_media_links['scopus']}
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
        </>
      ) : (
        <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
        </div>
      )}
    </>
  );
};

export default HeadDepartment;
