import React from 'react';
import Image from './ImageCard';
import styles from './Faculties.module.css';

const Faculties = ({ data }) => {
  if (!data || typeof data !== 'object') {
    return <div>No faculty data available.</div>;
  }

  // Convert the object into an array if needed
  const facultyArray = Object.values(data);

  return (
    <div className={styles.app}>
      <h2>Faculties</h2>
      <div className={styles.imagegallery}>
        {facultyArray.map((faculty, index) => (
          <Image
            key={faculty.unique_id || index}
            name={faculty.Name}
            photo= {faculty.Photo}

            Designation={faculty.Designation}
            Scholar={faculty["Google Scholar Profile"]}
            Research={faculty["Research Gate"]}
            Orchid={faculty["Orchid Profile"]}
            Publon={faculty["Publon Profile"]}
            Scopus={faculty["Scopus Author Profile"]}
            Linkedin={faculty["LinkedIn Profile"]}
          />
        ))}
      </div>
    </div>
  );
};

export default Faculties;
