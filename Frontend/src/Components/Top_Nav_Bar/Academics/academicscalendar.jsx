import React, { useEffect, useState } from "react";
import axios from "axios";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp"
import "../../Second_Nav_Bar/Accredation/nirf.css"


const Acadamiccal = ({ toggle, theme }) => {

  const yearRanges = [
    [2025, 2026],
    [2024, 2025],
    [2023, 2024],
    [2022, 2023],
    [2021, 2022],
    [2020, 2021],
  ];

  const [isOnline, setIsOnline] = useState(navigator.onLine);

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
      <div className="nirf-page">      
        <h2 className="nirf-title pt-[35px]">ACADEMIC CALENDAR
          <div className="w-[255px] h-0.5 bg-[#eab308] mx-auto mt-1 rounded"></div>
        </h2>

        <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {yearRanges.map(([startYear, endYear]) => (
            <div key={startYear} className="bg-prim dark:bg-drkb border p-6 rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-xl font-bold text-brwn dark:text-drkt mb-4 inline-block pb-1">
                Academic Year {startYear}-{endYear}
              </h3>
              <div className="flex flex-col items-center space-y-2 text-blue-600">
                <a href={`/calendar/${startYear}-${endYear}/odd`} className="hover:text-blue-800 dark:text-drka">Odd Sem</a>
                <a href={`/calendar/${startYear}-${endYear}/even`} className="hover:text-blue-800 dark:text-drka">Even Sem</a>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </>
  );
};

export default Acadamiccal;