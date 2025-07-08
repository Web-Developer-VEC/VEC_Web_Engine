import React, { useEffect, useState } from "react";
import axios from "axios";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp"
import "../../Second_Nav_Bar/nirf.css"


const Acadamiccal = ({ toggle, theme, isLoading }) => {
  const [calendarData, setCalendarData] = useState([]);
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const yearRanges = [
    [2025, 2026],
    [2024, 2025],
    [2023, 2024],
    [2022, 2023],
    [2021, 2022],
    [2020, 2021],
  ];

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
        headerText="ACADEMIC CALENDAR"
        subHeaderText="Ensuring academic clarity and structured timelines for efficient learning."
      />
      <div className="nirf-page">
        {isLoading && (
          <div className="loading-screen">
            <div className="spinner"></div>
            Loading...
          </div>
        )}
      
        <h2 className="nirf-title pt-[35px]">ACADEMIC CALENDAR
          <div className="w-[255px] h-0.5 bg-[#eab308] mx-auto mt-1 rounded"></div>
        </h2>

        <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {yearRanges.map(([startYear, endYear]) => (
            <div key={startYear} className="bg-white border p-6 rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-xl font-bold text-red-800 mb-4 inline-block pb-1">
                Academic Year {startYear}-{endYear}
              </h3>
              <div className="flex flex-col items-center space-y-2 text-blue-600">
                <a href={`/calendar/${startYear}-${endYear}/odd`} className="hover:text-blue-800">Odd Sem</a>
                <a href={`/calendar/${startYear}-${endYear}/even`} className="hover:text-blue-800">Even Sem</a>
              </div>
            </div>
          ))}
        </div>
      </div>
         {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 md:px-20">
            {calendarData.map((item, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-xl font-semibold text-red-800 border-b-2 border-yellow-500 inline-block pb-1">
                  {item.year}
                </h3>
                <div className="flex flex-col gap-1">
                  {item.semesters.map((semester, i) => (
                    <a
                      key={i}
                      href={`${UrlParser(semester.link)}#toolbar=0`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {semester.name}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div> */}

        {/* <div className="nirf-grid">
          {nirfData?.reverse().map((item, index) => (
            <div key={index} className="nirf-year">
              <h3>NIRF {item.year}</h3>
              {item.categories.map((category, catIndex) => (
                <a
                  key={catIndex}
                  href={`${UrlParser(category.link)}#toolbar=0`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nirf-link"
                >
                  {category.name}
                </a>
              ))}
            </div>
          ))}
        </div> */}
      </div>
    </>
  );
};

export default Acadamiccal;