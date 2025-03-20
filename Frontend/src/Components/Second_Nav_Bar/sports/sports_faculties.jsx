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
            Qualification={data?.qualification[index]}
          />
        ))}
      </div>
    </div>
  );
};


  


const SportsHOD = () => {
  return (
    <article className='SportsHOD-container'>
      <div className='Sports-HOD'>
         <img src={Banyan}alt="Sports hod" />
      </div>
      <div className='SportsHOD-details'>
        <h2 className='SportsHODName'>Sports HOD NAME</h2> 
        <h2 className='SportsHODDes'>designation</h2>
        <p className='SportsHODmessage'>
          Sports play an important role in every human being's day-to-day life and bring people together irrespective of their age, gender, and nationality. Our department of physical education is marching towards fulfilling CEO Sir Vision as a reality. Young achievers in various sports have won prizes and medals at various state, national, and international level events. Our goal is to increase the participation of our teams in various competitions and win medals and bring laurels to the college and the country.
        </p>
      </div>
    </article>
  );
};




export { Sportsfaculties , SportsHOD };


