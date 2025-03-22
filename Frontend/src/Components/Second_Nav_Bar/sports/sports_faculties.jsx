import React from 'react';
import Image from './Imagecard1';
import styles from '../../Top_Nav_Bar/Academics/sections/Faculties.module.css';
import '../sports/Sportshod.css';
import Banyan from '../../Assets/Banyan.jpg';

const Sportsfaculties = ({ data }) => {
  if (!data || !data.name || !data.image_path || !data.designation || !data.qualification) {
    return <p>Loading...</p>; // Handle case where data is not yet available
  }

  return (
    <div className={styles.app}>
      <h2 style={{ color: '#800000' ,marginTop:'30px',marginBottom:'30px'}}>Faculties</h2>
      <div className={styles.imagegallery}>
        {data?.name?.map((name, index) => (
          <Image
            key={index}
            name={name}
            photo={data?.image_path[index]} // Use the fetched image paths
            Designation={data?.designation[index]}
            qualification={data?.qualification[index]}
          />
        ))}
      </div>
    </div>
  );
};

const SportsHOD = ( { data } ) => {
  return (
    <article className='SportsHOD-container'>
      <div className='Sports-HOD'>
         <img src={Banyan}alt="Sports hod" />
      </div>
      <div className='SportsHOD-details'>
        <h2 className='SportsHODName'>{data?.name}</h2>
        <p>{data?.qualification}</p> 
        <h2 className='SportsHODDes'>{data?.designation}</h2>
        <p className='SportsHODmessage'>
          {data?.message}
        </p>
      </div>
    </article>
  );
};




export { Sportsfaculties , SportsHOD };


