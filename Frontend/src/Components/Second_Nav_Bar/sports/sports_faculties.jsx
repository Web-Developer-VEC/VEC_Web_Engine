import React from 'react';
import Image from '../../Top_Nav_Bar/Academics/sections/ImageCard';
import styles from '../../Top_Nav_Bar/Academics/sections/Faculties.module.css';

const Sportsfaculties = ({ data }) => {
  if (!data || !data.name || !data.image_path || !data.designation || !data.qualification) {
    return <p>Loading...</p>; // Handle case where data is not yet available
  }

  return (
    <div className={styles.app}>
      <h2 style={{ color: 'black' }}>Faculties</h2>
      <div className={styles.imagegallery}>
        {data?.name?.map((name, index) => (
          <Image
            key={index}
            name={name}
            photo={data?.image_path[index]} // Use the fetched image paths
            Designation={data?.designation[index]}
            Qualification={data?.qualification[index]}
          />
        ))}
      </div>
    </div>
  );
};

export default Sportsfaculties;