// frontend/src/App.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from './ImageCard.js';
import styles from './Facullties.module.css';

const Faculties = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/staff')
      .then(response => {
        setImages(response.data);
      })
      .catch(error => {
        console.error('Error fetching images:', error);
      });
  }, []);

  return (
    <div className={styles.app}>
      <h1>Faculties</h1>
      <div className={styles.imagegallery}>
        {images.map((image) => (
          <Image key={image._id} name={image.name} photo={image.photo} Designation={image.Designation}/>
        ))}
      </div>
    </div>
  );
};

export default Faculties;
