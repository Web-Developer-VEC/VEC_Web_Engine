import React, { useEffect, useState } from "react";
import './Management.css';
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import axios from "axios";

function Management({ theme, toggle }) {

  const [isOnline, setIsOnline] = useState(navigator.onLine);

    const [AbtUsData, setAbtsUcData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responce = await axios.get('/api/about_us');
                const data = responce.data[0];
                setAbtsUcData(data.Management)
            } catch (error) {
                console.error("Error fetching about us data",error);
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
                    <p className="font-bold">Shri. M.V. MUTHURAMALINGAM</p>
                    <p className="text-brwn dark:text-drka">Chairman</p>
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
                    <p className="font-bold">Shri. M.V.M. VELMURUGAN</p>
                    <p className="text-brwn dark:text-drka">Chief Executive Officer</p>
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

            <div className="FCP-content-container deputy-ceo">

              <div className="FCP-text-container">
                <p>
                {AbtUsData?.message[2]} <br /><br />
                {AbtUsData?.message[3]}
                </p>
              </div>
              <div className="FCP-image-container">
                <img src={UrlParser(AbtUsData?.image_path[2])} alt="deputy ceo Image" />
                <div className="flex justify-center items-center flex-col mt-2">
                  <p className="font-bold">Shri. V. KARTHIK MUTHURAMALINGAM</p>
                  <p className="text-brwn dark:text-drka">Deputy CEO</p>
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
