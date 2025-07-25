import React, { useEffect, useState } from 'react';
import Banner from '../../Banner';
import LoadComp from '../../LoadComp';
import axios from 'axios';

const Princ = ({theme, toggle}) => {
  const [data, setData] = useState(null); // State to store fetched data
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(null); // State for error handling
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
  return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    // Fetch data from the API
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/principal');

        const result = response.data
        setData(result.principal);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching the Principal data",err);
        
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
        backgroundImage="./Banners/administrationbanner.webp"
        headerText="Principal's Desk"
        subHeaderText="Leading with vision and commitment to excellence in education and innovation."
      />
      {!data ? (
        <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
          <LoadComp txt={""} />
        </div>
      ) : (

        <div className="max-w-[90%] mx-auto my-8 px-4">
          <div className="flex flex-col md:flex md:justify-center lg:flex-row-reverse items-center lg:items-start">
            {/* Image on the right for large screens, centered for tablets */}
            <div className="lg:max-w-sm lg:ml-6 flex-shrink-0 mx-auto py-8">
              <div className="relative max-h-[30vh] lg:max-h-[50vh] w-[300px] md:w-[450px] flex justify-center items-center">

                  {/* Image */}
                  {!hasError ? (
                    <div >

                      <img
                          className={`h-[25vh] lg:h-[45vh] w-auto rounded-xl transition-opacity duration-500 
                            ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                            src={UrlParser("/static/images/principal_data/principal_photo.webp")}
                            alt="Principal"
                            onLoad={() => setIsLoading(false)}
                            onError={() => {
                              setHasError(true);
                              setIsLoading(false);
                            }}
                            />
                       <div className="text-center ">
                      <span className="text-2xl font-semibold block font-poppins mt-2">{data?.name}</span>
                      <span className="text-lg font-bold text-accn dark:text-drka block font-poppins">
                        {/* <button
                  //  onClick={() => navigate(`/facultyprofile/${uid}`)}
                    className={"p-2 bg-secd dark:bg-drks hover:bg-brwn hover:text-drkt text-text"}>
                    View More</button> */}
                </span>
              </div>
                    </div>
                  ) : (
                      <div className="text-red-500">Image failed to load</div>
                  )}
              </div>
             
            </div>
<br />
            {/* Text Content Wrapped Around */}
            <div className="text-justify leading-relaxed max-w-[95%] lg:max-w-[60%] mx-auto">
              <p className="text-lg lg:text-[24px] font-bold mb-3 mt-2 font-poppins text-brwn dark:text-prim inline-block border-b-2 border-[#FDCC03] dark:border-drks pb-1">
                From the Principal's Desk
              </p>
              <q className="text-md lg:text-[16px] font-poppins block">{data?.message}</q>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Princ;