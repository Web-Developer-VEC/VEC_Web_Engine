import React, { useEffect, useState } from 'react';
import "./NBA_F.css";
import Banner from '../Banner';
import axios from 'axios';

const NBA_F = () => {
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [nbaData, setNbaData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/nba');
        setNbaData(response.data[0]);
      } catch (error) {
        console.error("Error fetching NBA Data", error);
      }
    };
    fetchData();
  }, []);

  const handleDeptClick = (dept) => {
    setSelectedDept(dept);
    setSelectedYear(null);
  };

  const handleYearClick = (year) => {
    setSelectedYear(year);
  };

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
      <div className="nba-page  ">
        <div className="nba-tiles">
          <div className="nba-tile-container">
            <div className="nba-tile">
              <div className="tile-tail"></div>
              <h3 className="nba-tile-header">About NBA</h3>
              <p className="nba-tile-text">
                The National Board of Accreditation (NBA) is an autonomous body established by the All India Council for Technical Education (AICTE) under the Ministry of Education, Government of India. NBA is responsible for evaluating the quality of technical and professional education programs.
              </p>
            </div>
            <div className="nba-tile">
              <div className="tile-tail"></div>
              <h3 className="nba-tile-header">Purpose of NBA Accreditation</h3>
              <p className="nba-tile-text">
                The primary goal of NBA accreditation is to assess and ensure that academic programs meet predefined quality standards, thereby promoting continuous improvement in educational institutions.
              </p>
            </div>
          </div>
        </div>

        {/* Department Selection Buttons */}
        <div className="nba-depts">
          {nbaData?.DEPT.map((dept, index) => (
            <button
              key={index}
              className={`nba-dept-button ${selectedDept === dept ? "active" : ""}`}
              onClick={() => handleDeptClick(dept)}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Year Selection Buttons */}
        {selectedDept && (
          <div className="nba-years">
            {nbaData?.year[nbaData.DEPT.indexOf(selectedDept)].map((year, index) => (
              <button
                key={index}
                className={`nba-year-button ${selectedYear === year ? "active" : ""}`}
                onClick={() => handleYearClick(year)}
              >
                {year}
              </button>
            ))}
          </div>
        )}

        {/* PDF Viewer */}
        {getPdfPath() && (
          <div className="nba-pdf-container">
            <embed className="embed" src={getPdfPath()} type="application/pdf" />
          </div>
        )}
      </div>
    </>
  );
};

export default NBA_F;
