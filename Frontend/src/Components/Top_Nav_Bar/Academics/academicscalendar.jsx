import React, { useEffect, useState } from "react";
import axios from "axios";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp"
import "../../Second_Nav_Bar/Accredation/nirf.css"


const Acadamiccal = ({ toggle, theme }) => {

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [academicCal, setAcademicData] = useState(null);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responce = await axios.post('/api/main-backend/academics',
          {
            type: "academic_calendar"
          }
        );
        const data = responce.data.data;
        console.log(data);
        
        setAcademicData(data)
        
      } catch (error) {
        console.error("Error fetching Calender Data",error);
      }
    }
    fetchData();
  },[])

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

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/academicsbanner.webp"
        headerText="ACADEMIC CALENDAR"
        subHeaderText="Ensuring academic clarity and structured timelines for efficient learning."
      />
      {academicCal ? (
          <div className="nirf-page">      
            <h2 className="text-center text-[24px] text-brwn dark:text-drkt font-bold pt-[35px]">ACADEMIC CALENDAR
              <div className="w-[255px] h-0.5 bg-[#eab308] mx-auto mt-1 rounded"></div>
            </h2>

            <div className="max-w-6xl mx-auto px-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                {academicCal?.map((item, i) => {
                  const oddPath = item.pdf_path?.find(path => path.toLowerCase().includes("odd"));
                  const evenPath = item.pdf_path?.find(path => path.toLowerCase().includes("even"));

                  return (
                    <div
                      key={i}
                      className="bg-prim dark:bg-drkb border p-6 rounded-lg shadow hover:shadow-lg transition"
                    >
                      <h3 className="text-xl font-bold text-brwn dark:text-drkt mb-4 inline-block pb-1">
                        {item.year}
                      </h3>
                      <div className="flex flex-col items-center space-y-2 text-blue-600">
                        {oddPath && (
                          <a
                            href={UrlParser(oddPath)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-800 dark:text-drka"
                          >
                            Odd Sem
                          </a>
                        )}
                        {evenPath && (
                          <a
                            href={UrlParser(evenPath)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-800 dark:text-drka"
                          >
                            Even Sem
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
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

export default Acadamiccal;