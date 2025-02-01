import React, { useEffect, useState } from 'react';
import Banner from '../Assets/UnivAbt-5-1.jpg';

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
        <div className="flex w-full my-[5vh]">
          <div className="basis-3/4 px-4 font-popp ml-20">
            <p className="text-3xl font-bold text-left mb-4">{secHdr}</p>
            <q className="text-2xl text-justify italic">{message}</q>
          </div>
          <div className="grid justify-items-center w-full">
            <img
              className=" max-h-[45vh] h-auto float-right rounded-xl"
              src={photo_path}
              alt="Principal"
            />
            <span className="text-4xl font-popp mt-3">{name}</span>
            <span className="text-2xl font-rome font-bold text-amber-950">{qualification}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Princ;
