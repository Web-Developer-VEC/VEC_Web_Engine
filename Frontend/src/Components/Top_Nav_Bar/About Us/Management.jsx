import React, { useEffect, useState } from "react";
import './Management.css';
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import axios from "axios";
import { useNavigate } from "react-router";
  

function Management({ theme, toggle }) {

  const [isOnline, setIsOnline] = useState(navigator.onLine);

    const [AbtUsData, setAbtsUcData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responce = await axios.post('/api/main-backend/about_us',
                  {
                    section: "Management"
                  }
                );
                const data = responce.data.data.content;
                setAbtsUcData(data)
            } catch (error) {
                console.error("Error fetching about us data",error);
                if (error.response.data.status === 429) {
                   navigate('/ratelimit', { state: { msg: error.response.data.message}})
                }
            }
        }
        fetchData();
    }, [])

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
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp txt={"You are offline"} />
        </div>
      );
  }

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  return (
    <>
      <Banner 
        toggle={toggle} 
        theme={theme}
        backgroundImage="./Banners/aboutvec.webp"
        headerText="Management"
        subHeaderText="Leading with vision, fostering innovation, and inspiring integrity at every step."
      />

      {AbtUsData ? (
        <div className={`FCP-message-container ${theme === 'dark' ? 'dark-theme' : ''}`}>
          {/* Founder Message Section */}
          <div className="FCP-message-section FCP-founder-section bg-[#f8f9fa]
                  dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]">
            <h2 className="FCP-section-title text-brwn dark:text-prim">FOUNDER MESSAGE</h2>

            <div className="FCP-content-container">
              <div className="FCP-text-container">
                <p>
                {AbtUsData?.message[0]}
                </p>
              </div>

              <div className="FCP-image-container">
                <img src={UrlParser(AbtUsData?.image_path[0])} alt="Founder's Image" className="founder"/>
                  <div className="flex justify-center items-center flex-col mt-2">
                    <p className="font-bold">{AbtUsData?.name[0]}</p>
                    <p className="text-brwn dark:text-drka">{AbtUsData?.designation[0]}</p>
                  </div>
              </div>
            </div>
          </div>

          {/* CEO Message Section */}
          <div className="FCP-message-section FCP-ceo-section bg-[#f8f9fa]
                  dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]">
            <h2 className="FCP-section-title text-brwn dark:text-prim">CEO MESSAGE</h2>

            <div className="FCP-content-container">
              <div className="FCP-image-container1">
                <img src={UrlParser(AbtUsData?.image_path[1])} alt="CEO's Image" />
                  <div className="flex justify-center items-center flex-col mt-2">
                    <p className="font-bold">{AbtUsData?.name[1]}</p>
                    <p className="text-brwn dark:text-drka">{AbtUsData?.designation[1]}</p>
                  </div>
              </div>

              <div className="FCP-text-container">
                <p>
                {AbtUsData?.message[1]}
                </p>
              </div>
            </div>
          </div>
          {/* Chairman Message */}
          <div className="FCP-message-section FCP-ceo-section bg-[#f8f9fa]
                  dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]">
            <h2 className="FCP-section-title text-brwn dark:text-prim">DEPUTY CEO MESSAGE</h2>

            <div className="FCP-content-container-1 deputy-ceo">

              <div className="FCP-text-container">
                <p>
                {AbtUsData?.message[2]} <br /><br />
                {AbtUsData?.message[3]}
                </p>
              </div>
              <div className="FCP-image-container">
                <img src={UrlParser(AbtUsData?.image_path[2])} alt="deputy ceo Image" />
                <div className="flex justify-center items-center flex-col mt-2">
                  <p className="font-bold">{AbtUsData?.name[2]}</p>
                  <p className="text-brwn dark:text-drka">{AbtUsData?.designation[2]}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
          <LoadComp txt={""} />
        </div>
      )}

    </>
  );
}
export default Management;
