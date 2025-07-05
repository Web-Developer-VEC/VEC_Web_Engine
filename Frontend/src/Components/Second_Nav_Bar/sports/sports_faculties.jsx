import React from 'react';
import Image from './Imagecard1';
import styles from '../../Top_Nav_Bar/Academics/sections/Faculties.module.css';
import '../sports/Sportshod.css';
import LoadComp from '../../LoadComp';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
};

const Sportsfaculties = ({ data }) => {
  if (!data || !data.name || !data.image_path || !data.designation || !data.qualification) {
    return <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
            <LoadComp />
          </div>
  }

  return (
    <div className={styles.app}>
      <h2 style={{ color: '#800000' ,marginTop:'30px',marginBottom:'30px'}} >Faculties</h2>
      <div className={styles.imagegallery} >
        {data?.name?.map((name, index) => (
          <Image
            key={index}
            name={name}
            photo={UrlParser(data?.image_path[index])} // Use the fetched image paths
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

    <>
      {data ? (
      <article className='SportsHOD-container'>
        <div className='Sports-HOD'>
          <img src={UrlParser(data?.image_path)} alt="Sports hod" />
        </div>
        <br />
        <div className='SportsHOD-details'>
        <div className='SportsHODNameAndqualification text-2xl font-semibolt'>
        <h2 className='SportsHODName'>{data?.name} {data?.qualification} </h2>
        
        </div>
          
          <h2 className='SportsHODDes'>{data?.designation}</h2>

          <br />

          <p className='SportsHODmessage text-xl p-8 text-justify' >
            {data?.message}
          </p>
        </div>
      </article>
      ) : (
        <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
        </div>
      )}
    </>
  );
};

export { Sportsfaculties , SportsHOD };