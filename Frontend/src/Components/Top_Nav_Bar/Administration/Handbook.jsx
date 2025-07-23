import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook } from "@fortawesome/free-solid-svg-icons";
import Banner from "../../Banner";
import axios from'axios';
import LoadComp from "../../LoadComp"

const BASE_URL = process.env.REACT_APP_BASE_URL;

const UrlParser = (path) => {
  return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
};

const HandbookButton = ({ year, pdfspath }) => (
  <a
  href={UrlParser(pdfspath)}
  target="_blank"
    className="flex items-center justify-center gap-2 px-6 py-4 
               rounded-lg bg-white dark:bg-drkb border-2 border-secd dark:border-drks text-text dark:text-prim text-lg font-medium
               hover:bg-yellow-600 shadow-md transition-all duration-200 no-underline cursor-pointer"
    >
    <FontAwesomeIcon icon={faBook} className="text-secd dark:text-drks" />
    {year}
  </a>
);

const Handbook = ({ theme, toggle }) => {

  const [handBook, sethandbook] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const response = await axios.get('/api/handbook');

        const data = response.data[0];

        sethandbook(data.HB)
        
      } catch (error) {
        console.error("Error fetching handbook data", error);
        
      }
    }

    fetchdata();
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
        headerText="Handbook"
        subHeaderText="Comprehensive manual for students and staff"
      />

      <div className="flex flex-col items-center my-12 px-4">
        <h2 className="text-3xl font-semibold mb-8 text-brwn dark:text-drkt">
          Handbook
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 justify-center items-center">
          {handBook?.Years?.map((year, idx) => (
            <HandbookButton
              key={idx}
              year={year}
              pdfspath={`${handBook?.pdfs_path[idx] ? UrlParser(handBook?.pdfs_path[idx]) : '#'}`}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Handbook;