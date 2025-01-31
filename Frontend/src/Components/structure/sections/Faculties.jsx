import React from 'react';
import Image from './ImageCard';
import styles from './Faculties.module.css';

const Faculties = ({ data }) => {
  if (!data || typeof data !== 'object') {
    return <div>No faculty data available.</div>;
  }

  // Convert the object into an array if needed
  const facultyArray = data.faculty_members

  return (
    <div className={styles.app}>
      <h2>Faculties</h2>
      <div className={styles.imagegallery}>
        {facultyArray?.map((faculty, index) => (
          <Image
            key={faculty.unique_id || index}
            name={faculty.name}
            photo= {faculty.photo}

            Designation={faculty.designation}
            Scholar={faculty.profiles.google_scholar}
            Research={faculty.profiles.research_gate}
            Orchid={faculty.profiles.orchid}
            Publon={faculty.profiles.publon}
            Scopus={faculty.profiles.scopus}
            Linkedin={faculty.profiles.linkedin}
          />
        ))}
      </div>
    </div>
  );
};

export default Faculties;
