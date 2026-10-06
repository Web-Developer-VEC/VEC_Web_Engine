import React, { useEffect, useRef, useState } from "react";
import "slick-carousel/slick/slick.scss";
import "slick-carousel/slick/slick-theme.scss";
import styles from "./Achievements1.module.css";
import ZonalResults from "./ZonalResults";
import WinnerSlider from "./winners_sld";
import Achievements from "./achivements";
import Others from "./others";

import Slider from "react-slick";

import LoadComp from "../../LoadComp";

const Achievements1 = ({ data }) => {
  const [showZone, setShowZone] = useState("zone");
  const sectionRef = useRef(null);

  // Check if data is separated by academic year: [{ year: "...", content: [...] }, ...]
  const isYearGrouped =
    Array.isArray(data) && data.length > 0 && Boolean(data[0]?.year && data[0]?.content);
  const years = isYearGrouped ? data.map((item) => item.year) : [];
  const [selectedYear, setSelectedYear] = useState(years[0] || "");

  useEffect(() => {
    if (years.length > 0 && !years.includes(selectedYear)) {
      setSelectedYear(years[0]);
    }
  }, [data, years, selectedYear]);

  // Extract categories for the currently selected academic year (or fallback to flat data)
  const activeYearData = isYearGrouped
    ? data?.find((item) => item.year === selectedYear)?.content || []
    : data || [];

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    arrows: true,
  };

  const handleZoneClick = (zoneType) => {
    setShowZone(zoneType);
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // ✅ Separate categories for active year
  const zonalTableData =
    activeYearData?.find((item) => item.category === "zonal_table")?.content || [];
  const zonalTableYear =
    activeYearData?.find((item) => item.category === "zonal_table")?.year || selectedYear || "";
  const zoneWinnerData =
    activeYearData?.find((item) => item.category === "zone_winner")?.content || [];
  const interZonalData =
    activeYearData?.find((item) => item.category === "interzonal_achievements")?.content || [];
  const othersData =
    activeYearData?.find((item) => item.category === "others")?.content || [];

  const coordinator = activeYearData?.find((item) => item.category === "coordinator")?.content;

  return (
    <>
      {data ? (
        <>
          {/* Academic Year Selection Tabs (Top) */}
          {years.length > 0 && (
            <div className="flex flex-wrap gap-3 justify-center items-center my-6">
              {years.map((year) => (
                <button
                  key={year}
                  className={`font-bold rounded-md transition duration-300 ease-in-out transform px-5 py-2 text-sm md:px-6 md:py-2.5 md:text-base cursor-pointer ${
                    selectedYear === year
                      ? "bg-brwn text-white shadow-md scale-105"
                      : "bg-secd text-black dark:bg-drks dark:text-drkt hover:opacity-90"
                  }`}
                  onClick={() => setSelectedYear(year)}
                >
                  {year}
                </button>
              ))}
            </div>
          )}

          {coordinator && (
            <div className={`${styles.achievementsContainer}`}>
              <h2 className={styles.sportscoordinator}>Anna University Zone {coordinator?.zone}</h2>
              <p className={styles.coordinatordes}>Co-ordinating Centre {coordinator?.year}</p>

              <Slider
                {...settings}
                className="[&_.slick-prev]:text-xs [&_.slick-next]:text-xs [&_.slick-prev]:w-6 [&_.slick-next]:w-6"
              >
                {coordinator?.image_path?.map((item, index) => (
                  <div key={index} className={styles.slide}>
                    <img src={UrlParser(item)} alt={`Coordinator ${index + 1}`} className={"m-auto"} />
                  </div>
                ))}
              </Slider>
            </div>
          )}

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap gap-6 justify-center items-center mb-6">
            <button
              className={`text-black font-bold rounded-md transition duration-300 ease-in-out transform px-4 py-2 text-sm md:px-6 md:py-3 md:text-base cursor-pointer ${
                showZone === "zone" ? "bg-brwn text-white" : "bg-secd text-black"
              }`}
              onClick={() => handleZoneClick("zone")}
            >
              Zone
            </button>
            <button
              className={`text-black font-bold rounded-md transition duration-300 ease-in-out transform px-4 py-2 text-sm md:px-6 md:py-3 md:text-base cursor-pointer ${
                showZone === "interzone" ? "bg-brwn text-white" : "bg-secd text-black"
              }`}
              onClick={() => handleZoneClick("interzone")}
            >
              Inter Zone
            </button>
            <button
              className={`text-black font-bold rounded-md transition duration-300 ease-in-out transform px-4 py-2 text-sm md:px-6 md:py-3 md:text-base cursor-pointer ${
                showZone === "others" ? "bg-brwn text-white" : "bg-secd text-black"
              }`}
              onClick={() => handleZoneClick("others")}
            >
              Others
            </button>
          </div>

          <div ref={sectionRef}>
            {showZone === "zone" ? (
              <div className="sport-zone-container mb-10">
                {zonalTableData?.length > 0 && (
                  <ZonalResults data={zonalTableData} year={zonalTableYear} />
                )}
                {zoneWinnerData?.length > 0 && (
                  <WinnerSlider data={zoneWinnerData} />
                )}
                {zonalTableData?.length === 0 && zoneWinnerData?.length === 0 && (
                  <p className="text-center text-gray-500 py-6">No zonal records for {selectedYear}</p>
                )}
              </div>
            ) : showZone === "interzone" ? (
              <div className="sport-zone-container mb-10">
                {interZonalData?.length > 0 ? (
                  <Achievements data={interZonalData} />
                ) : (
                  <p className="text-center text-gray-500 py-6">No inter-zone records for {selectedYear}</p>
                )}
              </div>
            ) : showZone === "others" ? (
              <div className="sport-zone-container mb-10">
                {othersData?.length > 0 ? (
                  <Others data={othersData} />
                ) : (
                  <p className="text-center text-gray-500 py-6">No other achievement records for {selectedYear}</p>
                )}
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp />
        </div>
      )}
    </>
  );
};

export default Achievements1;