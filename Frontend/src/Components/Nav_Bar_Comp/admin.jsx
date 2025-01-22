// Import necessary dependencies
import React from "react";
import "./admin.css"; // Import the CSS file for styling

// Sample data for cards
const cardData = [
  {
    id: 1,
    image: "/Images/Kalpana.png",
    name: "Kalpana M",
    designation: "Receptionist & ERP Co-ordinator",
  },
  {
    id: 2,
    image: "/Images/Kalyani.png",
    name: "S Kalyani",
    designation: "PA to Principal",
  },
  {
    id: 3,
    image: "/Images/Prakash.png",
    name: "B Prakash Kumar",
    designation: "Superintendent",
  },
  {
    id: 3,
    image: "/Images/Murugan.png",
    name: "C Muruganantham",
    designation: "Clerk",
  },
  {
    id: 3,
    image: "/Images/Vithya.png",
    name: "Vithya",
    designation: "Accountant Assistant",
  },
  {
    id: 3,
    image: "/Images/Esther.png",
    name: "E Esther Flora",
    designation: "Manager-HR",
  },
  {
    id: 3,
    image: "/Images/Nivethitha.png",
    name: "N Nivethitha",
    designation: "Admission Co-Ordinator",
  },
  {
    id: 3,
    image: "/Images/Sheeba.png",
    name: "K Sheeba",
    designation: "Student Affairs",
  },
  {
    id: 3,
    image: "/Images/Rajalakshmi.png",
    name: "M Rajalakshmi",
    designation: "Cashier",
  },
  {
    id: 10,
    image: "/Images/Karthikeyan.png",
    name: "Karthikeyan N",
    designation: "Office Assistant",
  },
  {
    id: 11,
    image: "/Images/Thavamani.png",
    name: "Thavamani T",
    designation: "Office Assistant",
  },
  {
    id: 12,
    image: "/Images/Lakshmi.png",
    name: "R Lakshmi",
    designation: "Office Assistant",
  },
];

// Card component
const Card = ({ image, name, designation }) => {
  return (
    <div className="admin-card">
      <img src={image} alt={name} className="admin-card-image" />
      <h3 className="admin-card-name">{name}</h3>
      <p className="admin-card-designation">{designation}</p>
    </div>
  );
};

// Main CardPage component
const CardPage = () => {
  return (
    <div className="admin-card-page">
      <h1 className="admin-page-title">Our Team</h1>
      <div className="admin-card-container">
        {cardData.map((card) => (
          <Card
            key={card.id}
            image={card.image}
            name={card.name}
            designation={card.designation}
          />
        ))}
      </div>
    </div>
  );
};

export default CardPage;
