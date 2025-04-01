import { useEffect, useState } from "react";
import './researchdetails.css';

const ResearchDetails = ({ course, data1 }) => {
  const [expandedCard, setExpandedCard] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  const toggleExpand = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  const years = data1?.years ? Object.keys(data1.years) : [];
  useEffect(() => {
    if (years.length > 0) {
      setSelectedYear(years[0]); 
    }
  }, []);
  const filteredData = selectedYear ? data1.years[selectedYear] : [];

  return (
    <div className="Concontainer-res">
      {/* Year selection buttons */}
      <div className="res-year-button">
        {years.map((year, i) => (
          <button
            key={i}
            className={`res-button ${selectedYear === year ? "active" : ""}`}
            onClick={() => setSelectedYear(year)}
          >
            {year}
          </button>
        ))}
      </div>

      <div className="head-res">
        <h1>{course}</h1>
      </div>

      <div className="cards-grid-res">
        {filteredData && filteredData.length > 0 ? (
          filteredData.map((item, index) => (
            <div
              key={index}
              className={`card-res ${expandedCard === index ? "expanded" : ""}`}
            >
              <CardHead item={item} />
              <CardBody item={item} expanded={expandedCard === index} />

              {Object.keys(item).length > 6 && (
                <button
                  className="view-more-btn-res"
                  onClick={() => toggleExpand(index)}
                >
                  {expandedCard === index ? "View Less" : "View More"}
                </button>
              )}
            </div>
          ))
        ) : (
          <p>{selectedYear ? "No data available for this year" : "Select a year to view data"}</p>
        )}
      </div>
    </div>
  );
};

// ✅ Card Head
const CardHead = ({ item }) => (
  <div className="card-head-res">
    <h3 className="card-title-res">
      {item["Title of the Paper"] ||
        item["Title of the Proposal"] ||
        item["Title of the Patent"] ||
        item["Book/Chapter Title"] ||
        item["Title of the Consultancy"] ||
        item["Name of the Industry, address"] ||
        item["Name of the Product"] ||
        "No Title Available"}
    </h3>
  </div>
);

// ✅ Card Body
const CardBody = ({ item, expanded }) => {
  const excludedKeys = [
    "S.No",
    "Title of the Paper",
    "Title of the Proposal",
    "Title of the Patent",
    "Book/Chapter Title",
    "Title of the Consultancy",
    "Name of the Industry, address",
    "Name of the Product",
  ];

  return (
    <div className="card-body-res">
      <div className="details-grid-res">
        {Object.entries(item).map(([key, value], entryIndex) =>
          !excludedKeys.includes(key) && (expanded || entryIndex < 6) ? (
            <div key={key} className="card-entry-res">
              <strong>{key.replace(/_/g, " ")}:</strong> {value}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
};

export default ResearchDetails;