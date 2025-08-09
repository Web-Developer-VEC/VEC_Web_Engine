import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import styles from "./Faculties.module.css";
import ImageCard from "./ImageCard";
import LoadComp from "../../../LoadComp";

const Faculties = ({ data }) => {

  if (!data || !Array.isArray(data)) {
    return <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
      <LoadComp />
  </div>
  }

  const hod_details = data?.find((item) => item.category === "head_of_department")?.members || [];
  const teaching_staff_details = data?.find((item) => item.category === "teaching_staff")?.members || [];
  const non_teaching_staff_details = data?.find((item) => item.category === "non_teaching_staff")?.members || [];

  return (
    <div className={styles.app + " p-0 md:p-12"}>
      <div className={styles.imageGallery + " w-full"}>
          <div className={styles.fullWidthTile}>
            <ImageCard
              key={hod_details?.[0]?.unique_id || 0}
              name={hod_details?.[0]?.name}
              photo={hod_details?.[0]?.image_path}
              Designation={hod_details?.[0]?.designation}
              Scholar={hod_details?.[0]?.socialmedia_links?.googlescholar}
              Research={hod_details?.[0]?.socialmedia_links?.researchgate}
              Orchid={hod_details?.[0]?.socialmedia_links?.orchidprofile}
              Publon={hod_details?.[0]?.socialmedia_links?.publonprofile}
              Scopus={hod_details?.[0]?.socialmedia_links?.scopus}
              Linkedin={hod_details?.[0]?.socialmedia_links?.linkedin}
              firstTile={true}
              uid={hod_details?.[0]?.unique_id}
            />
          </div>
          {teaching_staff_details?.length > 0 && (
            <>
              <h2 className={`${styles.faculty} text-brwn dark:text-drkt`}>Faculty Members</h2>
              <div className={styles.gridContainer + ' grid grid-cols-2 md:grid-cols-4'}>
                {teaching_staff_details?.map((faculty, index) => (
                  <ImageCard
                    key={faculty?.unique_id || index}
                    name={faculty?.name}
                    photo={faculty?.image_path}
                    Designation={faculty?.designation}
                    Scholar={faculty?.socialmedia_links?.googlescholar}
                    Research={faculty?.socialmedia_links?.researchgate}
                    Orchid={faculty?.socialmedia_links?.orchidprofile}
                    Publon={faculty?.socialmedia_links?.publonprofile}
                    Scopus={faculty?.socialmedia_links?.scopus}
                    Linkedin={faculty?.socialmedia_links?.linkedin}
                    uid={faculty?.unique_id}
                  />
                ))}
              </div>
            </>
          )}
          {non_teaching_staff_details?.length > 0 && (
            <>
              <h2 className={`${styles.faculty} text-brwn dark:text-drkt`}>Non Teaching Staff</h2>
              <div className={`${styles.gridContainer} grid grid-cols-2 md:grid-cols-4 bg-black-100`}>
                {non_teaching_staff_details?.map((faculty, index) => (
                  <ImageCard
                    key={faculty?.unique_id || index}
                    name={faculty?.name}
                    photo={faculty?.image_path}
                    Designation={faculty?.designation}
                    Scholar={faculty?.socialmedia_links?.googlescholar}
                    Research={faculty?.socialmedia_links?.researchgate}
                    Orchid={faculty?.socialmedia_links?.orchidprofile}
                    Publon={faculty?.socialmedia_links?.publonprofile}
                    Scopus={faculty?.socialmedia_links?.scopus}
                    Linkedin={faculty?.socialmedia_links?.linkedin}
                    uid={faculty?.unique_id}
                  />
                ))}
              </div>       
            </>
          )}
      </div>
    </div>
  );
};

export default Faculties;
