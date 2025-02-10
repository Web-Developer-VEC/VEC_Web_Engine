import React, { useEffect, useState } from 'react';
import Banner from '../Banner';

const Princ = () => {
  const [data, setData] = useState(null); // State to store fetched data
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(null); // State for error handling

  useEffect(() => {
    // Fetch data from the API
    const fetchData = async () => {
      try {
        const response = await fetch('/api/principal');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        setData(result.principal);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p>Loading...</p>; // Display while data is loading
  }

  if (error) {
    return <p>Error: {error}</p>; // Display in case of error
  }

  if (!data) {
    return null; // If no data, render nothing
  }

  // Destructure fetched data
  const { photo_path, name, qualification, message } = data;

  return (
    <>
      <Banner
        backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
        headerText="Principal's Desk"
        subHeaderText="Leading with vision and commitment to excellence in education and innovation."
      />

      <div className="max-w-[90%] mx-auto my-8 px-4">
        <div className="flex flex-col lg:flex-row-reverse items-start">
          {/* Image on the right for large screens, floating for text wrapping */}
          <div className="lg:max-w-sm lg:ml-6 flex-shrink-0">
            <img
              className="max-h-[40vh] lg:max-h-[45vh] w-auto rounded-xl float-right"
              src={photo_path}
              alt="Principal"
            />
            <div className="text-center lg:text-left">
              <span className="text-2xl font-semibold block">{name}</span>
              <span className="text-lg font-bold text-amber-950 block">{qualification}</span>
            </div>
          </div>

          {/* Text Content Wrapped Around */}
          <div className="text-justify leading-relaxed max-w-[80%] lg:max-w-[60%] mx-auto">
            <p className="text-xl lg:text-2xl font-bold mb-3">From the Principal's Desk</p>
            <q className="text-md lg:text-lg italic block">{message}</q>
          </div>
        </div>
      </div>
    </>
  );
};

export default Princ;