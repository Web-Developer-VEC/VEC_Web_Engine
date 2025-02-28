import React, { useEffect, useState } from 'react';
import "./NBA_F.css";
import Banner from '../Banner';
import axios from 'axios';

const NBA_F = () => {
  const [selectedDept, setSelectedDept] = useState(null); // Track selected department
  const [selectedYear, setSelectedYear] = useState(null); // Track selected year
  const [nbaData, setNbaData] = useState(null); // Store fetched data

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/nba');
        setNbaData(response.data[0]); // Assuming the data is the first item in the array
      } catch (error) {
        console.error("Error fetching NBA Data", error);
      }
    };
    fetchData();
  }, []);

  // Handle department click
  const handleDeptClick = (dept) => {
    setSelectedDept(dept);
    setSelectedYear(null); // Reset selected year when a new department is selected
  };

  // Handle year click
  const handleYearClick = (year) => {
    setSelectedYear(year);
  };

  // Get the PDF path for the selected department and year
  const getPdfPath = () => {
    if (!selectedDept || !selectedYear || !nbaData) return null;

    const deptIndex = nbaData.DEPT.indexOf(selectedDept);
    if (deptIndex === -1) return null;

    const yearIndex = nbaData.year[deptIndex].indexOf(selectedYear);
    if (yearIndex === -1) return null;

    return nbaData.PDF_Path[deptIndex][yearIndex];
  };

  return (
    <>
      <Banner
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
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]">
              <h3 className="nba-tile-header text-accn dark:text-drka border-b-2 border-secd dark:border-drks">Purpose of NBA Accreditation</h3>
              <p className="nba-tile-text">
                The primary goal of NBA accreditation is to assess and ensure that academic programs meet predefined quality standards, thereby promoting continuous improvement in educational institutions. It helps students, employers, and other stakeholders identify programs that deliver high-quality education and are aligned with industry and societal needs.
              </p>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="nba-content">
          {/* Middle - Department Buttons */}
          <div className="nba-depts bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]">
            {nbaData?.DEPT?.map((dept) => (
              <button
                key={dept}
                className={`nba-dept-button ${selectedDept === dept ? "active bg-accn text-prim dark:bg-drka" : "bg-secd dark:bg-drks"}`}
                onClick={() => handleDeptClick(dept)}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Years for Selected Department */}
          {selectedDept && (
            <div className="nba-years">
              {nbaData?.year[nbaData.DEPT.indexOf(selectedDept)]?.map((year) => (
                <button
                  key={year}
                  className={`nba-year-button ${selectedYear === year ? "active bg-accn text-prim dark:bg-drka" : "bg-secd dark:bg-drks"}`}
                  onClick={() => handleYearClick(year)}
                >
                  {year}
                </button>
              ))}
            </div>
          )}

          {/* Display PDF for Selected Year */}
          {selectedYear && (
            <div className="nba-pdf-container">
              <h3>{`Viewing: ${selectedDept} - ${selectedYear}`}</h3>
              <embed
                className="embed border-4 border-secd dark:border-drks"
                src={getPdfPath()}
                type="application/pdf"
                width="100%"
                height="600px"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NBA_F;