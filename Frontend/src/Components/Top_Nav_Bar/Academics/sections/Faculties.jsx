import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import styles from "./Faculties.module.css";
import ImageCard from "./ImageCard";

const Faculties = ({ data }) => {
  console.log("Fac",data);
    const [open, setopen] = useState(null);
    const Name = 'Ajith';
    const url = '/pdfs/7.3.1-VEC-Institutional-Distinctivenss-2020-21.pdf'
  
  const handleViewClick = (pdfUrl, name) => {
    setopen({ url: pdfUrl, name });
  };
  
  const closeModal = () => {
    setopen(null);
  };
  
  if (!data || !Array.isArray(data.faculty_members)) {
    return <div>No faculty data available.</div>;
  }

  const facultyArray = data.faculty_members;

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
      </div>
      <div className={styles.prefaculty}>
        <button className={styles.prefacultybtn + " bg-accn text-prim hover:bg-secd hover:text-text py-2 px-4 " +
            "dark:bg-drks dark:text-text-drkt dark:hover:bg-drka"}
                onClick={() => handleViewClick(url, Name)}> Previous Year brFaculties</button>
      </div>

      {open && (
              <div className={styles.pdfmodal}>
                <div className={styles.pdfmodalcontent + " bg-prim dark:bg-drkp"}>
                  <button className={styles.pdfclosebutton + " text-text bg-secd dark:bg-drks dark:text-drkt " +
                      "hover:bg-accn hover:text-prim dark:hover:bg-drka"} onClick={closeModal}>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                  <h2>{open.name}</h2>
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
