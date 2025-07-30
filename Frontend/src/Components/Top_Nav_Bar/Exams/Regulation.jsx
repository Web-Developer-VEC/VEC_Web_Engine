import React, { useEffect, useState } from "react";
import "./Regulation.css";
import axios from "axios";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";

const REGULATION = ({ theme, toggle }) => {

  const [regulationdata, setRegulationData] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setLoading] = useState(true);
  
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post('/api/main-backend/exam',
          {
            type: "regulation"
          }
        );

        setRegulationData(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error Fetching Regulation data");
        setLoading(true);
      }
    }
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
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/examsbanner.webp"
        headerText="Regulations"
        subHeaderText="Establishing clear guidelines to foster transparency, compliance, and organizational integrity."
      />

      {isLoading ? (
        <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
          <LoadComp txt={""} />
        </div>
      ) : (
        <div className="regulation-container">
          <h1 className="title text-brwn dark:text-drkt">Regulations</h1>
          <div className="regulation-grid">
            {regulationdata?.map((reg, index) => (
              <div key={index} className="regulation-card">
                <h2 className="regulation-year text-brwn dark:text-drkt text-md border-b-2 pb-2 w-fit border-[#fdcc03] dark:border-drks">Regulation {reg.year}</h2>
                <ul className="regulation-list">
                  {reg.links.map((link, idx) => (
                    <li key={idx}>
                      <a href={UrlParser(link.pdf_path)} target="_blank" rel="noopener noreferrer" className="dark:text-drkt font-[Poppins]">
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default REGULATION;
