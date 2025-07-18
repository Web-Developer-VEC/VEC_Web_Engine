import React, { useEffect, useState } from "react";
import axios from "axios";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";

const Card = ({ image, name, designation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="border-2 border-secd dark:border-drks rounded-md flex flex-col items-center p-4 w-60 bg-prim dark:bg-drkp shadow hover:shadow-lg transition-shadow">
      {!hasError ? (
        <img
          src={image}
          alt={name}
          className={`rounded-md w-36 h-44 object-cover transition-opacity duration-500 ${
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

      <h3 className="mt-2 font-semibold text-brwn dark:text-drkt text-center text-[18px]">
        {name}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
        {designation}
      </p>
    </div>
  );
};

const AdminCard = ({ image, name, designation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="border-2 border-secd dark:border-drks rounded-md flex flex-col items-center p-4 w-60 bg-prim dark:bg-drkp shadow hover:shadow-lg transition-shadow">
      {!hasError ? (
        <img
          src={image}
          alt={name}
          className={`rounded-md w-36 h-44 object-cover transition-opacity duration-500 ${
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
      <div className="mt-2 text-center">
        <h3 className="font-semibold text-brwn dark:text-prim text-[16px]">
          {name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{designation}</p>
      </div>
    </div>
  );
};

export default function ADMteam({ theme, toggle }) {
  const [admissionteamData, setadmissionteamData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) => (path?.startsWith("http") ? path : `${BASE_URL}${path}`);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/admission-team`);
        setadmissionteamData(response.data);
        console.log("Admission team",response.data);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setLoading(true);
      }
    };
    fetchData();
  }, []);

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
      <div className="h-screen flex items-center justify-center">
        <LoadComp txt="You are offline" />
      </div>
    );
  }

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/administrationbanner.webp"
        headerText="Admission team"
        subHeaderText="Driving organizational excellence through strategic leadership and seamless coordination."
      />

      {isLoading ? (
        <div className="h-screen flex items-center justify-center">
          <LoadComp txt="" />
        </div>
      ) : (
        <div className="flex flex-col items-center py-6 min-h-screen bg-prim dark:bg-drkp">
          {/* Top two Admin cards */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {admissionteamData[0] && (
              <AdminCard
                image={UrlParser(admissionteamData[0]?.photo_path)}
                name={admissionteamData[0]?.name}
                designation={admissionteamData[0]?.designation}
              />
            )}
            {admissionteamData[1] && (
              <AdminCard
                image={UrlParser(admissionteamData[1]?.photo_path)}
                name={admissionteamData[1]?.name}
                designation={admissionteamData[1]?.designation}
              />
            )}
          </div>

          {/* Rest of the cards */}
          <div className="flex flex-wrap justify-center gap-6">
            {admissionteamData.slice(2).map((card) => (
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
}
