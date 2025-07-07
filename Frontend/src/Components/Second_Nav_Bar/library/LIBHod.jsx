import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadComp from "../../LoadComp";

const BASE_URL = process.env.REACT_APP_BASE_URL;

    const UrlParser = (path) => {
        return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };

const LIBHod = () => {
  
  const [hod, setHod] = useState(null);

  useEffect(() => {
    const fetchHodData = async () => {
      try {
        const res = await axios.get("/api/library");
        const data = res.data;

        const hodData = data?.HOD || data[0]?.HOD;
        setHod(hodData);
        console.log("HoD data loaded:", hodData);
      } catch (error) {
        console.error("Error fetching HoD data:", error.message);
      }
    };

    fetchHodData();
  }, []);
 
  if (!hod) {
    return (
      <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
        </div>
    );
  }

  return (
    <article className="flex flex-col gap-4 bg-prim dark:bg-drkp shadow-xl p-6 rounded-xl items-center text-center">
      <div className="w-full md:w-1/8 flex justify-center">
        <img
          className="w-auto h-60"
          alt="Library HoD"
          src={UrlParser(hod.image_path)}
        />
      </div>

      <div className="flex flex-col px-4">
        <h2 className="text-2xl font-semibold">{hod.name}</h2>
        <p className="text-lg text-accn dark:text-drka mb-2">{hod.designation}</p>
        <p className="text-md mb-2 text-brwn dark:text-drka">{hod.education_qualification}</p>
        <p className="text-xl italic text-justify-center">{hod.message}</p>
      </div>
    </article>
  );
};

export default LIBHod;
