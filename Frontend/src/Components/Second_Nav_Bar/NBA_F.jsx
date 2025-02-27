import React, { useEffect, useState } from 'react';
import axios from "axios";
import "./NBA_F.css"; 
import Banner from '../Banner';

const NBA_F = ({theme, toggle}) => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [yearButtons, setYearButtons] = useState({});
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/nba`);
        console.log("Fetched Data:", response.data);
        if (response.data.length > 0) {
          const deptData = response.data[0];
          const deptMap = {};
          deptData.DEPT.forEach((dept, index) => {
            deptMap[dept] = deptData.PDF_Path[index];
          });
          setYearButtons(deptMap);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setLoading(true);
      }
    };
    fetchData();
  }, []);

  const handleYearClick = (year) => {
    setSelectedYear(year);
  };

  return (
    <>
      <Banner toggle={toggle} theme={theme}
        backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
        headerText="National Board of Accreditation"
        subHeaderText="Promoting academic excellence through accreditation, fostering continuous quality improvement, and empowering institutions to deliver world-class education."
      />
      <div className="nba-page mb-24">
        <div className="nba-intro">
          <div className="nba-tiles">
            <div className="nba-tile bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]
              border-2 border-secd dark:border-drkp">
              <h3 className="nba-tile-header text-accn dark:text-drka border-b-2 border-secd dark:border-drks">About NBA</h3>
              <p className="nba-tile-text">
                The National Board of Accreditation (NBA) is an autonomous body established by the All India Council for Technical Education (AICTE) under the Ministry of Education, Government of India. NBA is responsible for evaluating the quality of technical and professional education programs, including engineering, management, pharmacy, architecture, and others.
              </p>
            </div>
            <div className="nba-tile bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] ">
              <h3 className="nba-tile-header text-accn dark:text-drka border-b-2 border-secd dark:border-drks">Purpose of NBA Accreditation</h3>
              <p className="nba-tile-text">
                The primary goal of NBA accreditation is to assess and ensure that academic programs meet predefined quality standards, thereby promoting continuous improvement in educational institutions. It helps students, employers, and other stakeholders identify programs that deliver high-quality education and are aligned with industry and societal needs.
              </p>
            </div>
          </div>
        </div>
        {isLoading ? (
         <div className="loading-screen">
            <div className="spinner"></div>
              Loading...
         </div>
        ) : (
          <>
            <div className="nba-years">
              {Object.keys(yearButtons).map((year) => (
                <button
                  key={year}
                  className={`nba-year-button ${selectedYear === year ? "active bg-accn text-prim dark:bg-drka" 
                      : "bg-secd dark:bg-drks"}`}
                  onClick={() => handleYearClick(year)}
                >
                  {year}
                </button>
              ))}
            </div>
            {selectedYear && (
              <div className="nba-details bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] ">
                <div className="nba-pdf-container">
                  <h3>{`Viewing: ${selectedYear}`}</h3>
                  <embed
                    className="embed border-4 border-secd dark:border-drks"
                    src={yearButtons[selectedYear]}
                    type="application/pdf"
                    width="100%"
                    height="600px"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default NBA_F;
