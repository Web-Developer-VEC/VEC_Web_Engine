import React, { useEffect, useState } from 'react';
import "./naac.css";
import axios from "axios";
import Banner from './Banner';

const Naac = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [naacData, setNaacData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/naac`);
        console.log("Fetched Data:", response.data);

        const parsedData = parseNaacData(response.data);
        setNaacData(parsedData);

        setSelectedCategory(Object.keys(parsedData)[0]); // Set default category
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setIsLoading(true);
      }
    };

    fetchData();
  }, []);

  // Helper function to structure the API data
  const parseNaacData = (data) => {
    const formattedData = {};

    if (data.length > 0 && data[0].Title) {
      data[0].Title.forEach(categoryObj => {
        const categoryName = Object.keys(categoryObj)[0];
        const categoryData = categoryObj[categoryName];

        formattedData[categoryName] = {
          years: categoryData.years || [],
          pdfPaths: Array.isArray(categoryData.PDF_Path) ? categoryData.PDF_Path : [categoryData.PDF_Path]
        };
      });
    }

    return formattedData;
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSelectedYear(null);
  };

  const handleYearClick = (year) => {
    setSelectedYear(year);
  };

  return (
    <>
      <Banner
        backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
        headerText="NAAC"
        subHeaderText="NATIONAL ASSESSMENT AND ACCREDITATION COUNCIL (NAAC)"
      />

      <div className="naac-page">
        {isLoading && (
          <div className="loading-screen">
            <div className="spinner"></div>
            Loading...
          </div>
        )}

        <div className="about-section">
          <div className="naac-info-panel">
            <h2>About NAAC</h2>
            <p>The NAAC conducts assessment and accreditation of Higher Educational Institutions (HEI) such as colleges, universities or other recognised institutions to derive an understanding of the ‘Quality Status’ of the institution...</p>
          </div>

          <div className="iqac-info-panel">
            <h2>About IQAC</h2>
            <p>The Internal Quality Assurance Cell (IQAC) is a pivotal body established to ensure continuous quality enhancement...</p>
          </div>
        </div>

        <div className="objectives-section">
          <h2>Key Objectives</h2>
          <ol>
            <li><b>Quality Enhancement:</b> Develop system for consistent improvement</li>
            <li><b>Best Practices:</b> Institutionalize innovative practices</li>
            <li><b>Stakeholder Engagement:</b> Ensure active participation</li>
            <li><b>Documentation:</b> Maintain records effectively</li>
          </ol>
        </div>

        <div className="naac-content">
          <div className="naac-years">
            {Object.keys(naacData).map((category) => (
              <button
                key={category}
                className={`naac-year-button ${selectedCategory === category ? "active" : ""}`}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="naac-details">
            {selectedCategory && selectedCategory !== "code_of_ethics" && (
              <div className="naac-year-actions">
                {naacData[selectedCategory].years.map((year, index) => (
                  <button
                    key={index}
                    className="naac-action-button"
                    onClick={() => handleYearClick(year)}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}

            {selectedCategory && (
              <div className="naac-pdf-container">
                {selectedCategory === "code_of_ethics" ? (
                  // Always show PDF for "code_of_ethics"
                  <embed
                    className="embed"
                    src={naacData[selectedCategory].pdfPaths[0]}
                    type="application/pdf"
                    width="100%"
                    height="600px"
                  />
                ) : (
                  selectedYear && (
                    <embed
                      className="embed"
                      src={naacData[selectedCategory].pdfPaths[naacData[selectedCategory].years.indexOf(selectedYear)]}
                      type="application/pdf"
                      width="100%"
                      height="600px"
                    />
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Naac;
