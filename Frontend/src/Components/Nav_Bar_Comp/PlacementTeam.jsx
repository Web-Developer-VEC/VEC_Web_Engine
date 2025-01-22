import React from 'react';
import './PlacementTeam.css';
import image from '../Assets/Placement Team.jpg';
import Banner from '../Banner';

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
      <img src={person.image} alt={person.name} className="person-image" />
      <div className="person-content">
        <h2>{person.title}</h2>
        <h3>{person.name}</h3>
        <p>{person.description}</p>
      </div>
    </div>
  );
}

export const PlacementTeam = () => {
  return (
    <>
<Banner
  backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
  headerText="Placement Team"
  subHeaderText="Connecting talent with opportunity through strategic partnerships and career support services."
/>

    <div className="Placement-App">
      <h1>Placement Team</h1>
      {persons.map((person, index) => (
        <PersonDetail key={person.id} person={person} isImageLeft={index % 2 === 0} />
      ))}
    </div>
    </>
  );
}
