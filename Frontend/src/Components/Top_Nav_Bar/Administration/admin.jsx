// Import necessary dependencies
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./admin.css"; // Import the CSS file for styling
import Banner from "../../Banner";

// Card component
const Card = ({ image, name, designation }) => {
  return (
    <div className="admin-card border-2 border-secd dark:border-drks">
      <img src={image} alt={name} className="admin-card-image" />
      <h3 className="admin-card-name text-accn dark:text-drka">{name}</h3>
      <p className="admin-card-designation">{designation}</p>
    </div>
  );
};


// Main CardPage component
const CardPage = ({theme, toggle}) => {
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
    <>
    <Banner toggle={toggle} theme={theme}
      backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
      headerText="Administrative Office"
      subHeaderText="Driving organizational excellence through strategic leadership and seamless coordination."
    />
    <div className="admin-card-page">
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
    </>
  );
};

export default CardPage;
