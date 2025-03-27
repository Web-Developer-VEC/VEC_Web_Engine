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
        backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
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
            <div className="lg:max-w-sm lg:ml-6 flex-shrink-0 mx-auto">
            <div className="relative max-h-[25vh] lg:max-h-[45vh] w-auto flex justify-center items-center">
            {/* Loading Spinner */}
            {isLoading && !hasError && (
                <div className="fixed inset-0 flex justify-center items-center bg-gray-100/50">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* Image */}
            {!hasError ? (
                <img
                    className={`max-h-[25vh] lg:max-h-[45vh] w-auto rounded-xl transition-opacity duration-500 
                                ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    src={UrlParser(data?.photo_path)}
                    alt="Principal"
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setHasError(true);
                        setIsLoading(false);
                    }}
                />
            ) : (
                <div className="text-red-500">Image failed to load</div>
            )}
        </div>
              <div className="text-center">
                <span className="text-2xl font-semibold block font-poppins">{data?.name}</span>
                <span className="text-lg font-bold text-accn dark:text-drka block font-poppins">
                  {data?.qualification}
                </span>
              </div>
            </div>
<br />
            {/* Text Content Wrapped Around */}
            <div className="text-justify leading-relaxed max-w-[80%] lg:max-w-[60%] mx-auto">
              <p className="text-lg lg:text-[24px] font-bold mb-3 font-poppins">
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