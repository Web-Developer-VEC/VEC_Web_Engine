import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Banner from '../../Banner';
import './Trust.css'
import LoadComp from '../../LoadComp';
import axios from 'axios';

const NewTrust = ({theme, toggle}) => {

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [AbtTrustData, setAbtTrustData] = useState(null);

  useEffect(() => {
      const fetchData = async () => {
          try {
              const responce = await axios.get('/api/about_us');
              const data = responce.data[0];
              setAbtTrustData(data.about_trust)
              
            } catch (error) {
              console.error("Error fetching about us data",error);
            }
          }
          fetchData();
        }, [])
        
        console.log("Ajay",AbtTrustData);
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
      <Banner toggle={toggle} theme={theme}
        backgroundImage="./Banners/aboutvec.webp"
        headerText="Velammal Educational Trust"
        subHeaderText=" Transforming dreams into reality through a strong foundation of learning, leadership, and innovation."
      />
      {AbtTrustData ? (
        // <div className="bg-prim dark:bg-drkp min-h-screen px-10 pt-0 md:p-8">
        <div className="bg-prim dark:bg-drkp min-h-screen pt-0 px-11 md:p-9 lg:px-16">



          <div className="mt-12 container1 text-text dark:text-drkt mx-auto px-2 md:px-8 lg:px-16">
          <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="text-left text-text dark:text-drkt"
              >
                <h2 className="text-3xl text-brwn dark:text-drkt font-bold mb-4 border-b-4 border-secd dark:border-drks inline-block pb-2">
                Velammal Educational Trust (VET)
                </h2>
                <p className="text-lg leading-relaxed text-justify">
                {AbtTrustData?.Velammal_Educational_Trust[0]}
                </p>
                <p className="mt-4 text-lg leading-relaxed text-justify">
                {AbtTrustData?.Velammal_Educational_Trust[1]}
            </p>
            </motion.div>
            <div className="mt-10 grid md:grid-cols-2 items-center ">
              {/* Image Section */}
              <motion.div
                whileHover={{  }}
                className="flex justify-center group overflow-hiaccn rounded-2xl saadow-lg flex-col items-center"
              >
                <img
                  className="w-64 h-max object-cover transition-transform duration-500 "
                  src={UrlParser(AbtTrustData?.velammal?.image_path)}
                  alt="Velammal Trust Banner"
                />
                <div className="flex justify-center items-center flex-col mt-2">
                  <p className="font-bold">THIRUMATHI VELAMMAL</p>
                </div>
              </motion.div>


              <div className="mt-6 md:mt-0 md:pr-10">


              {/* Text Section */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="text-left text-text dark:text-drkt"
                >
                <h2 className="text-3xl text-brwn dark:text-drkt font-bold mb-4 border-b-4 border-secd dark:border-drks inline-block pb-2">
                  Strength of the Trust
                </h2>
                <p className="text-lg leading-relaxed text-justify">
                {AbtTrustData?.velammal?.content}
                </p>
              </motion.div>
              </div>
            </div>


          </div>
          {/* Section 3 - Management */}
          <div className="mt-16 py-4 px-6 rounded-t-3xl shadow-lg">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-accn dark:text-drkt mb-6">The Management</h2>
            </div>
            <div className="grid lg:grid-cols-3 md:grid-cols-1 gap-10 justify-evenly">
              {/* {managementTeam.map((person, index) => ( */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)] 
                            dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] 
                            text-text dark:text-drkt p-6 rounded-lg shadow-md 
                            hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row"
                >
                  <img
                    src={UrlParser(AbtTrustData?.image_path[0])}
                    alt="Shri. M.V. Muthuramalingam"
                    className="management-image-1 md:w-40 md:h-40 mr-6 shadow-lg"
                  />

                  <div className='text-center md:text-left mt-2 md:mt-0'>
                    <h5 className="text-sm font-bold">{AbtTrustData?.The_Management?.name[0]}</h5>
                    <h6 className="text-sm text-brwn dark:text-drka">{AbtTrustData?.The_Management?.designation[0]}</h6>
                    <p className="mt-2">Velammal Educational Trust</p>
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)] 
                            dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] 
                            text-text dark:text-drkt p-6 rounded-lg shadow-md 
                            hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row"
                >
                  <img
                    src={UrlParser(AbtTrustData?.image_path[1])}
                    alt="Shri. M.V. VelMurugan"
                    className="management-image-1 md:w-40 md:h-40 mr-6 shadow-lg"
                  />

                  <div className='text-center md:text-left mt-2 md:mt-0'>
                    <h5 className="text-sm font-bold">{AbtTrustData?.The_Management?.name[1]}</h5>
                    <h6 className="text-sm text-brwn dark:text-drka">{AbtTrustData?.The_Management?.designation[1]}</h6>
                    <p className="mt-2">Velammal Educational Trust</p>
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)] 
                            dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] 
                            text-text dark:text-drkt p-6 rounded-lg shadow-md 
                            hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row"
                >
                  <img
                    src={UrlParser(AbtTrustData?.image_path[2])}
                    alt="Shri. M.V. VelMurugan"
                    className="management-image-1 md:w-40 md:h-40 mr-6 shadow-lg"
                  />

                  <div className='text-center md:text-left mt-2 md:mt-0'>
                    <h5 className="text-sm font-bold">{AbtTrustData?.The_Management?.name[2]}</h5>
                    <h6 className="text-sm text-brwn dark:text-drka">{AbtTrustData?.The_Management?.designation[2]}</h6>
                    <p className="mt-2">Velammal Educational Trust</p>
                  </div>
                </motion.div>
              {/* ))} */}
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
};

export default NewTrust;
