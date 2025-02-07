import React from "react";
import styles from "./Faculties.module.css";
import ImageCard from "./ImageCard";

const Faculties = ({ data }) => {
  console.log("Fac",data);
  
  if (!data || !Array.isArray(data.faculty_members)) {
    return <div>No faculty data available.</div>;
  }

  const facultyArray = data.faculty_members;

  return (
    <div className={styles.app}>
      <div className={styles.imageGallery}>
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

        <div className={styles.gridContainer}>
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
    </div>
  );
};

export default Faculties;
