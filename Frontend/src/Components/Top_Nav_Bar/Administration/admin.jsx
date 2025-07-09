// Import necessary dependencies
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./admin.css"; // Import the CSS file for styling
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";

// Card component
const Card = ({ image, name, designation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="admin-card border-2 border-secd dark:border-drks relative flex flex-col items-center p-4">
      {!hasError ? (
        <img
          src={image}
          alt={name}
          className={`admin-card-image rounded-md transition-opacity duration-500 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
        />
      ) : (
        <div className="text-red-500">Failed to load image</div>
      )}

      <h3 className="admin-card-name text-accn dark:text-drkt mt-2 font-poppins text-[#000000]">{name}</h3>
      <p className="admin-card-designation text-gray-600 dark:text-drka">{designation}</p>
    </div>
  );
};

const AdminCard = ({ image, name, designation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="admin-card-ao border-2 border-secd dark:border-drks relative flex p-4">
      {!hasError ? (
        <img
          src={image}
          alt={name}
          className={`admin-card-image rounded-md transition-opacity duration-500 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
        />
      ) : (
        <div className="text-red-500">Failed to load image</div>
      )}

      <div className="admin-text-content">
        <h3 className="admin-card-name text-accn dark:text-drkt font-poppins">{name}</h3>
        <p className="admin-card-designation text-gray-600 dark:text-drka">{designation}</p>
      </div>
    </div>
  );
};


// Main CardPage component
const CardPage = ({theme, toggle}) => {
  const [adminData, setadminData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/adminoffice`);

        setadminData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setLoading(true);
      } 
    };
    fetchData();
  },[]);


  useEffect(() => {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
          window.removeEventListener("online", handleOnline);
          window.removeEventListener("offline", handleOffline);
      };
  }, []);

  if (!isOnline) {
      return (
        <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
          <LoadComp txt={"You are offline"} />
        </div>
      );
  }

  return (
    <>
    <Banner toggle={toggle} theme={theme}
      backgroundImage="./Banners/administrationbanner.webp"
      headerText="Administrative Office"
      subHeaderText="Driving organizational excellence through strategic leadership and seamless coordination."
    />
    {isLoading ? (
        <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
          <LoadComp txt={""} />
        </div>
      ) : (
        <div className="admin-card-page">
            <div className="ao-container">
            <AdminCard
              key={adminData[0]?.id}
              image={UrlParser(adminData[0]?.photo_path)}
              name={adminData[0]?.name}
              designation={adminData[0]?.designation}
            />
            <AdminCard
              key={adminData[1]?.id}
              image={UrlParser(adminData[1]?.photo_path)}
              name={adminData[1]?.name}
              designation={adminData[1]?.designation}
            />
            </div>
          <div className="admin-card-container">
            {adminData.slice(2).map((card) => (
              <Card
                key={card.id}
                image={UrlParser(card.photo_path)}
                name={card.name}
                designation={card.designation}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default CardPage;
