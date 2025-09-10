import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook } from "@fortawesome/free-solid-svg-icons";
import Banner from "../../Banner";
import axios from "axios";
import "./Handbook.css";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const UrlParser = (path) => {
  return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
};

const HandbookButton = ({ year, pdfspath, onOpen }) => (
  <button
    onClick={() => onOpen(year, pdfspath)}
    className="flex items-center justify-center gap-2 px-6 py-4 
               rounded-lg bg-prim dark:bg-drkb border-2 border-secd dark:border-drks text-text dark:text-prim text-lg font-medium
               hover:bg-yellow-100 shadow-md transition-all duration-200 no-underline cursor-pointer"
  >
    <FontAwesomeIcon icon={faBook} className="text-secd dark:text-drks" />
    {year}
  </button>
);

const Handbook = ({ theme, toggle }) => {
  const [handBook, setHandbook] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const response = await axios.post("/api/main-backend/administration", {
          type: "HandBook",
        });

        const data = response.data.data;
        setHandbook(data);
      } catch (error) {
        console.error("Error fetching handbook data", error);
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
        }
      }
    };

    fetchdata();
  }, [navigate]);

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

  // Always open PDF in new tab
  const handleOpenPDF = (year, pdfUrl) => {
    if (pdfUrl && pdfUrl !== "#") {
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    }
  };

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
      {handBook ? (
        <div className="flex flex-col items-center my-12 px-4">
          <h2 className="text-[32px] font-semibold mb-8 text-brwn dark:text-drkt">
            Handbook
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 justify-center items-center">
            {handBook?.Years?.map((year, idx) => (
              <HandbookButton
                key={idx}
                year={year}
                pdfspath={
                  handBook?.pdfs_path[idx]
                    ? UrlParser(handBook?.pdfs_path[idx])
                    : "#"
                }
                onOpen={handleOpenPDF}
              />
            ))}
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

export default Handbook;
