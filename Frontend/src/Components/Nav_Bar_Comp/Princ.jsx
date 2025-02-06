// Ensure React and necessary modules are imported
import React, { useEffect, useState } from 'react';
import Banner from '../Assets/UnivAbt-5-1.jpg';
import './princ.css'

const Princ = () => {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/principal');
        const result = await response.json();
        setData(result.principal || {}); // Ensure it's at least an empty object
        setLoading(false);
      } catch (err) {
        setLoading(true);
      }
    };

    fetchData();
  }, []);

  // Avoid destructuring if `data` is null
  const photo_path = data?.photo_path || ''; 
  const name = data?.name || 'Unknown';
  const qualification = data?.qualification || 'N/A';
  const message = data?.message || 'No message available';

  const banTtl = 'Principal of VEC';
  const secHdr = "From the Principal's Desk";

  return (
    <>
      <div
        className="relative flex justify-start items-end w-screen h-[20vh] bg-white
          bg-cover bg-no-repeat bg-[position:0px_-550px]"
        style={{ backgroundImage: `url(${Banner})` }}
      >
        <div className="absolute grid bg-amber-600 rounded-tr-3xl px-4 pt-3 justify-items-end font-popp">
          <p className="text-white text-5xl">{banTtl}</p>
        </div>
      </div>
      <div className="flex m-8">
        {isLoading ? (
          <div className="loading-screen loading-text">
            <div className="spinner"></div>
            Loading...
          </div>
        ) : (
          <div className="flex w-full my-[5vh]">
            <div className="basis-3/4 px-4 font-popp ml-20 text-justify">
              <p className="text-3xl font-bold text-left mb-4">{secHdr}</p>
              <q className="text-2xl text-end">{message}</q>
            </div>
            <div className="grid justify-items-center w-full">
              {photo_path ? (
                <img
                  className="max-h-[45vh] h-auto float-right rounded-xl"
                  src={photo_path}
                  alt="Principal"
                />
              ) : (
                <div className="text-gray-500">No Image Available</div>
              )}
              <span className="text-4xl font-popp mt-3">{name}</span>
              <span className="text-2xl font-rome font-bold text-amber-950">{qualification}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Princ;