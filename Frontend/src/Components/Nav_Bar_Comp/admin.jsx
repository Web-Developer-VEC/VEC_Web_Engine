// Import necessary dependencies
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./admin.css"; // Import the CSS file for styling

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
  const [adminData, setadminData] = useState([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/adminoffice`);
        console.log("HI",response.data);

        setadminData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setLoading(true);
      } 
    };
    fetchData();
  },[]);

  return (
    <div className="admin-card-page">
      <h1 className="admin-page-title">Our Team</h1>
      {/* Show loading spinner during data fetch */}
      {isLoading && (
          <div className="loading-screen">
            <div className="spinner"></div>
            Loading...
          </div>
        )}
      <div className="admin-card-container">
        {adminData.map((card) => (
          <Card
            key={card.id}
            image={card.photo_path}
            name={card.name}
            designation={card.designation}
          />
        ))}
      </div>
    </div>
  );
};

export default CardPage;
