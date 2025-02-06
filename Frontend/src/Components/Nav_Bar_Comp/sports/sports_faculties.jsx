import React from 'react';
import Image from '../../structure/sections/ImageCard';
import styles from '../../structure/sections/Faculties.module.css';

const facultyData = [
  {
    unique_id: 1,
    Name: 'Dr. P. RAMESH KANNAN',
    Designation: 'Head & Director of Physical Education',
    Qualification: 'MA.MPEd,Mphil,Ph.D',
    Photo: '/sports/ramesh.png',
    Designation: "Professor",
    "Google Scholar Profile": "https://scholar.google.com/citations?user=example",
    "Research Gate": "https://www.researchgate.net/profile/John_Doe",
    "Orchid Profile": "https://orcid.org/0000-0001-2345-6789",
    "Publon Profile": "https://publons.com/researcher/example",
    "Scopus Author Profile": "https://www.scopus.com/authid/detail.uri?authorId=123456789",
    "LinkedIn Profile": "https://www.linkedin.com/in/johndoe/"
  },
  {
    unique_id: 2,
    Name: 'Ms. JAYANTHI.K',
    Designation: 'ASST.PD',
    Qualification: 'MPEd.Mphil',
    Photo: '/sports/jayanthi.png',
    Designation: "Professor",
    "Google Scholar Profile": "https://scholar.google.com/citations?user=example",
    "Research Gate": "https://www.researchgate.net/profile/John_Doe",
    "Orchid Profile": "https://orcid.org/0000-0001-2345-6789",
    "Publon Profile": "https://publons.com/researcher/example",
    "Scopus Author Profile": "https://www.scopus.com/authid/detail.uri?authorId=123456789",
    "LinkedIn Profile": "https://www.linkedin.com/in/johndoe/"
  },
  {
    unique_id: 3,
    Name: 'Mr. SRINIVASAN.S',
    Designation: 'ASST.PD',
    Qualification: 'MPEd.Mphil',
    Photo: '/sports/srinivasan.png',
    
  }
];

const Sportsfaculties = () => {
  return (
    <div className={styles.app}>
    <h2 style={{ color: 'black' }}>Faculties</h2>
    <div className={styles.imagegallery}>
        {facultyData.map((faculty) => (
          <Image
            key={faculty.unique_id}
            name={faculty.Name}
            photo={faculty.Photo}
            Designation={faculty.Designation}
            Qualification={faculty.Qualification}
          />
        ))}
      </div>
    </div>
  );
};

export default Sportsfaculties;