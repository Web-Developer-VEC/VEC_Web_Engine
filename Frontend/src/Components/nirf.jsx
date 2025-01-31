import React, { useEffect, useState } from 'react';
import axios from "axios";
import "./nirf.css";
import Banner from './Banner';

const Nirf = () => {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedAction, setSelectedAction] = useState(null); 
  const [yearButtons, setYearButtons] = useState({});
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/nirf`);
        console.log("HI", response.data);
        processNirfData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setLoading(true);
      } 
    };
    fetchData();
  }, []);

  // Process the fetched data and convert it into the yearButtons structure
  const processNirfData = (data) => {
    if (!data || data.length === 0) return;

    const formattedData = {};
    const nirfEntry = data[0]; // Assuming only one object is returned

    nirfEntry.year.forEach((year, index) => {
      formattedData[year] = {
        actions: {},
      };
      
      if (nirfEntry.content[index] && nirfEntry["pdf path"][index]) {
        nirfEntry.content[index].forEach((category, catIndex) => {
          formattedData[year].actions[category.trim()] = nirfEntry["pdf path"][index][catIndex];
        });
      }
    });

    setYearButtons(formattedData);
  };

  const openPdf = (action) => {
    setSelectedAction(action); 
  };

  const handleYearClick = (year) => {
    setSelectedYear(year);
    setSelectedAction(null);
  };

  return (
    <>
      <Banner
          backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
          headerText="NIRF"
          subHeaderText="The NIRF is a comprehensive ranking system launched by the Ministry of Education, Government of India, in 2015."
        />
      <div className="nirf-page">
      {isLoading && (
          <div className="loading-screen">
            <div className="spinner"></div>
            Loading...
          </div>
        )}
        <div className="nirf-intro">
          <h1 className="nirf-header">NATIONAL INSTITUTIONAL RANKING FRAMEWORK (NIRF)</h1>
          <p>
            <strong>About NIRF</strong>
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The NIRF is a comprehensive ranking system launched by the Ministry of Education, Government of India, in 2015. It provides a structured methodology to rank higher education institutions across India based on various objective and subjective criteria. The ranking is released annually, aiming to promote a competitive spirit among institutions and enhance transparency in education standards.
          </p>
        </div>

        {/* Page Content */}
        <div className="nirf-content">
          {/* Left Side - Years */}
          <div className="nirf-years">
            {Object.keys(yearButtons)
              .sort((a, b) => b - a)
              .map((year) => (
                <button
                  key={year}
                  className={`nirf-year-button ${selectedYear === year ? "active" : ""}`}
                  onClick={() => handleYearClick(year)}
                >
                  {year}
                </button>
              ))}
          </div>

          {/* Right Side - Buttons for Selected Year */}
          <div className="nirf-details">
            <div className="nirf-year-actions">
              {Object.keys(yearButtons[selectedYear]?.actions || {}).map((action, index) => (
                <div key={index}>
                  <button
                    className="nirf-action-button"
                    onClick={() => openPdf(action)}
                  >
                    {action}
                  </button>
                </div>
              ))}
            </div>

            {/* Display PDF if an action is selected */}
            {selectedAction && (
              <div className="nirf-pdf-container">
                <h3>{`Viewing: ${selectedAction}`}</h3>
                <embed className='embed'
                  src={yearButtons[selectedYear]?.actions[selectedAction]}
                  type="application/pdf"
                  width="100%"
                  height="600px"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Nirf;
