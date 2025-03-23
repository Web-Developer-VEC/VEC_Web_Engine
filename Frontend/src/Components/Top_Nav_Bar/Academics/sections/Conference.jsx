import { useState } from "react";
import "./Conference.css";

const Conference = ({ data, action }) => {
  const [expandedCard, setExpandedCard] = useState(null);

  const toggleExpand = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
  };


  // ✅ Function to get the category heading instead of "Title of the Paper"
  const getCategoryHeading = (action) => {
    const headingMapping = {
      FUNDED_PROPOSALS: "Funded Proposals",
      JOURNAL_PUBLICATIONS: "Journal Publications",
      PATENT_DETAILS: "Patent Details",
      BOOK___BOOK_CHAPTERS: "Books & Book Chapters",
      INTERNATIONAL___NATIONAL_CONFERENCES: "International & National Conferences",
      CONSULTANCY: "Consultancy Projects",
      INTERNSHIP: "Internships",
      PRODUCT_DEVELOPMENT: "Product Development",
    };

    const formattedAction = action.trim().toUpperCase();
    return headingMapping[formattedAction] || "Research Details"; // Default heading
  };

  return (
    <div className="Concontainer">
      <div className="head">
        {/* ✅ Dynamic Category Heading instead of "Title of the Paper" */}
        <h1 className="cards-h1">{getCategoryHeading(action)}</h1>
      </div>
      <div className="cards-grid">
        {data && data.length > 0 ? (
          data.map((item, index) => (
            <div
              key={index}
              className={`card ${expandedCard === index ? "expanded" : ""}`}
            >
              {/* ✅ Card Head (Displays Item Title) */}
              <CardHead item={item} />

              {/* ✅ Card Body (Excludes Title Fields & "S.No") */}
              <CardBody item={item} expanded={expandedCard === index} />

              {Object.keys(item).length > 6 && (
                <button
                  className="view-more-btn"
                  onClick={() => toggleExpand(index)}
                >
                  {expandedCard === index ? "View Less" : "View More"}
                </button>
              )}
            </div>
          ))
        ) : (
          <p>No data available</p>
        )}
      </div>
    </div>
  );
};

// ✅ Separate Component for Card Head (Only Displays Title)
const CardHead = ({ item }) => {
  return (
    <div className="card-head">
      <h3 className="card-title">
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
};

// ✅ Separate Component for Card Body (Excludes Title Fields & "S.No")
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
    <div className="card-body">
      <div className="details-grid">
        {Object.entries(item).map(([key, value], entryIndex) =>
          !excludedKeys.includes(key) && (expanded || entryIndex < 6) ? (
            <div key={key} className="card-entry">
              <strong>{key.replace(/_/g, " ")}:</strong> {value}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
};

export default Conference;
