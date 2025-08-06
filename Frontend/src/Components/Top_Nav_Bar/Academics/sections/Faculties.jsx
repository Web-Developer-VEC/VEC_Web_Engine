import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import styles from "./Faculties.module.css";
import ImageCard from "./ImageCard";
import LoadComp from "../../../LoadComp";

const Faculties = ({ data }) => {

    const [open, setopen] = useState(null);
      const BASE_URL = process.env.REACT_APP_BASE_URL;

    const UrlParser = (path) => {
      return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };
    
    const Name = 'Previous Year Faculties';
    const url = data?.previous_faculty_pdf_path
  
  const handleViewClick = (pdfUrl, name) => {
    setopen({ url: pdfUrl, name });
  };
  
  const closeModal = () => {
    setopen(null);
  };
  
  if (!data || !Array.isArray(data.faculty_members)) {
    return <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
      <LoadComp />
  </div>
  }

  const facultyArray = data.faculty_members?.filter(member => {
    const idParts = member.unique_id?.split("-");
    return idParts?.length >= 3 && ["01", "02", "03", "04"].includes(idParts[2]);
  });

  const SupportingStaffArray = data.faculty_members?.filter(member => {
    const idParts = member.unique_id?.split("-");
    return idParts?.length >= 3 && idParts[2] === "05";
  });

  return (
    <div className={styles.app + " p-0 md:p-12"}>
      <div className={styles.imageGallery + " w-full"}>
        {facultyArray.length > 0 && (
          <div className={styles.fullWidthTile}>
            <ImageCard
              key={facultyArray[0].unique_id || 0}
              name={facultyArray[0].name}
              photo={facultyArray[0].photo}
              Designation={facultyArray[0].designation}
              Scholar={facultyArray[0].profiles.google_scholar}
              Research={facultyArray[0].profiles.research_gate}
              Orchid={facultyArray[0].profiles.orchid}
              Publon={facultyArray[0].profiles.publon}
              Scopus={facultyArray[0].profiles.scopus}
              Linkedin={facultyArray[0].profiles.linkedin}
              firstTile={true}
              uid={facultyArray[0].unique_id}
            />
          </div>
        )}
        {facultyArray?.length > 1 && (
          <>
            <h2 className={`${styles.faculty} text-brwn dark:text-drkt`}>Faculty Members</h2>
            <div className={styles.gridContainer + ' grid grid-cols-2 md:grid-cols-4'}>
              {facultyArray.slice(1).map((faculty, index) => (
                <ImageCard
                  key={faculty.unique_id || index}
                  name={faculty.name}
                  photo={faculty.photo}
                  Designation={faculty.designation}
                  Scholar={faculty.profiles.google_scholar}
                  Research={faculty.profiles.research_gate}
                  Orchid={faculty.profiles.orchid}
                  Publon={faculty.profiles.publon}
                  Scopus={faculty.profiles.scopus}
                  Linkedin={faculty.profiles.linkedin}
                  uid={faculty.unique_id}
                />
              ))}
            </div>
          </>
        )}

        {SupportingStaffArray?.length > 0 && (
          <>
            <h2 className={styles.faculty}>Non Teaching Staff</h2> 
            <div className={styles.gridContainer + ' grid grid-cols-2 md:grid-cols-4 bg-black-100'}>
              {SupportingStaffArray?.map((faculty, index) => (
                <ImageCard
                  key={faculty.unique_id || index}
                  name={faculty.name}
                  photo={faculty.photo}
                  Designation={faculty.designation}
                  Scholar={faculty.profiles.google_scholar}
                  Research={faculty.profiles.research_gate}
                  Orchid={faculty.profiles.orchid}
                  Publon={faculty.profiles.publon}
                  Scopus={faculty.profiles.scopus}
                  Linkedin={faculty.profiles.linkedin}
                  uid={faculty.unique_id}
                />
              ))}
            </div>       
          </>
        )}
      </div>

      {open && (
              <div className={styles.pdfmodal}>
                <div className={styles.pdfmodalcontent + " bg-prim dark:bg-drkp"}>
                  <button className={styles.pdfclosebutton + " text-text bg-secd dark:bg-drks dark:text-drkt " +
                      "hover:bg-accn hover:text-prim dark:hover:bg-drka"} onClick={closeModal}>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                  <h2 className={styles.facultyModalHeader}>{open.name}</h2>
                  <iframe
                    src={open.url}
                    title={open.name}
                    className={styles.pdfiframe}
                  ></iframe>
                </div>
              </div>
            )}
        </div>
  );
};

export default Faculties;
