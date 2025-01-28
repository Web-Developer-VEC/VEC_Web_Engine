import React, { useEffect, useState } from 'react';
import axios from "axios";
import './PlacementTeam.css';
import image from '../Assets/Placement Team.jpg';

const persons = [
  {
    id: 1,
    title: 'Head of Placement',
    name: 'Arun Ramaswami A',
    description: 'Being a post graduate in Business Administration, He is an expert in using his people skills and networking to design students career. Mr. Arun strongly believes that, getting a job is just a primitive stage and they have to scale greater heights and bring laurels to our brand, “Velammal” globally. His primary focus is on the learning and development of the students in various employability skills in addition to their academic curriculum. He has consistently produced 90% placement in Velammal Group of Colleges, Chennai & Madurai and Improved the average salary to 4.20 LPA. More than 200+ students every year get more than 6.50 LPA.',
    image: image,
  },
  {
    id: 2,
    title: 'Head of Placement',
    name: 'Arun Ramaswami A',
    description: 'Being a post graduate in Business Administration, He is an expert in using his people skills and networking to design students career. Mr. Arun strongly believes that, getting a job is just a primitive stage and they have to scale greater heights and bring laurels to our brand, “Velammal” globally. His primary focus is on the learning and development of the students in various employability skills in addition to their academic curriculum. He has consistently produced 90% placement in Velammal Group of Colleges, Chennai & Madurai and Improved the average salary to 4.20 LPA. More than 200+ students every year get more than 6.50 LPA.',
    image: image,
  },
  {
    id: 3,
    title: 'Head of Placement',
    name: 'Arun Ramaswami A',
    description: 'Being a post graduate in Business Administration, He is an expert in using his people skills and networking to design students career. Mr. Arun strongly believes that, getting a job is just a primitive stage and they have to scale greater heights and bring laurels to our brand, “Velammal” globally. His primary focus is on the learning and development of the students in various employability skills in addition to their academic curriculum. He has consistently produced 90% placement in Velammal Group of Colleges, Chennai & Madurai and Improved the average salary to 4.20 LPA. More than 200+ students every year get more than 6.50 LPA.',
    image: image,
  },
];

function PersonDetail({ person, isImageLeft }) {
  return (
    <div className={`person-detail ${isImageLeft ? 'left' : 'right'}`}>
      <img src={person.photo_path} alt={person.name} className="person-image" />
      <div className="person-content">
        <h2>{person.designation}</h2>
        <h3>{person.name}</h3>
        <p>{person.content}</p>
      </div>
    </div>
  );
}

export const PlacementTeam = () => {

  const [PlacementTeam, setPlacementTeam] = useState([]);
  const [isLoading,setLoading] = useState(true);
  const content = PlacementTeam[0]?.placement_team || [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/placementteam`);
        console.log("HI",response.data);

        setPlacementTeam(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setLoading(true);
      } 
    };
    fetchData();
  },[]);

  return (
    <div className='container'>
      <div className="Placement-App">
        <h1>Placement Team</h1>
        {/* Show loading spinner during data fetch */}
        {isLoading && (
            <div className="loading-screen">
              <div className="spinner"></div>
              Loading...
            </div>
          )}
        {content.map((person, index) => (
          <PersonDetail key={person.name} person={person} isImageLeft={index % 2 === 0} />
        ))}
      </div>
    </div>
  );
}
