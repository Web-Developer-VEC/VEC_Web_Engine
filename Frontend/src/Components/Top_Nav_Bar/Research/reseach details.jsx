import { useState } from "react";
import './researchdetails.css'

const Reseachdetails = ({ course, data1 }) => {
  const [expandedCard, setExpandedCard] = useState(null);

  const toggleExpand = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  console.log("Ajay",data1);
  
const data=[
    {
      "S.No": 1,
      "Name of the Faculty": "Dr.J.SathyaPriya,Asso Prof/IT dept  &   Ms.R.Kavitha,Asst.Prof/AI & DS",
      "Title of the Proposal": "Demand Side Management of Household Electricity",
      "Name of Funding Agency": "DST-NewGen IEDC",
      "Amount in Lakhs": "Rs.2,50,000",
      "Project Duration in Yrs": "2 Years",
      "Date of Submission": "26.08.2022",
      "Current Status": "Ongoing",
      "Colloboration Institute": "No",
      "Colloboration agreement Yes / No": "No",
      "Attach E copy of sanctioned letter": "https://drive.google.com/file/d/1TozyxbwttfQXh_oazUlZDo25-Cwv770s/view?usp=sharing"
    },
    {
      "S.No": 2,
      "Name of the Faculty": "Dr.P..Visu, Professor, Dept.of AI & DS  Dr.P.S.Smitha, Associate Professor, Dept.of CSE",
      "Title of the Proposal": "Criminator - Criminal Face Detection Tool",
      "Name of Funding Agency": "DST-NewGen IEDC",
      "Amount in Lakhs": "Rs.2,50,000",
      "Project Duration in Yrs": "2 Years",
      "Date of Submission": "nil",
      "Current Status": "Ongoing",
      "Colloboration Institute": "No",
      "Colloboration agreement Yes / No": "No",
      "Attach E copy of sanctioned letter": "https://drive.google.com/file/d/1X8KutMka4DQeAuigDK7xCpCvUq9ec8Gn/view?usp=share_link"
    },
    {
      "S.No": 2,
      "Name of the Faculty": "Dr.P..Visu, Professor, Dept.of AI & DS  Dr.P.S.Smitha, Associate Professor, Dept.of CSE",
      "Title of the Proposal": "Criminator - Criminal Face Detection Tool",
      "Name of Funding Agency": "DST-NewGen IEDC",
      "Amount in Lakhs": "Rs.2,50,000",
      "Project Duration in Yrs": "2 Years",
      "Date of Submission": "nil",
      "Current Status": "Ongoing",
      "Colloboration Institute": "No",
      "Colloboration agreement Yes / No": "No",
      "Attach E copy of sanctioned letter": "https://drive.google.com/file/d/1X8KutMka4DQeAuigDK7xCpCvUq9ec8Gn/view?usp=share_link"
    },
    {
      "S.No": 2,
      "Name of the Faculty": "Dr.P..Visu, Professor, Dept.of AI & DS  Dr.P.S.Smitha, Associate Professor, Dept.of CSE",
      "Title of the Proposal": "Criminator - Criminal Face Detection Tool",
      "Name of Funding Agency": "DST-NewGen IEDC",
      "Amount in Lakhs": "Rs.2,50,000",
      "Project Duration in Yrs": "2 Years",
      "Date of Submission": "nil",
      "Current Status": "Ongoing",
      "Colloboration Institute": "No",
      "Colloboration agreement Yes / No": "No",
      "Attach E copy of sanctioned letter": "https://drive.google.com/file/d/1X8KutMka4DQeAuigDK7xCpCvUq9ec8Gn/view?usp=share_link"
    }
          ]
const action="FUNDED_PROPOSALS"

  // ✅ Function to get the category heading instead of "Title of the Paper"
  const getCategoryHeading = (action) => {
    const headingMapping = {
      FUNDED_PROPOSALS: "Funded Proposals",
      JOURNAL_PUBLICATIONS: "Journal Publications",
      PATENT_DETAILS: "Patent Details",
      BOOK___BOOK_CHAPTERS: "Books & Book Chapters",
    //   INTERNATIONAL___NATIONAL_Reseach-details: "International & National Reseach-details",
      CONSULTANCY: "Consultancy Projects",
      INTERNSHIP: "Internships",
      PRODUCT_DEVELOPMENT: "Product Development",
    };

    const formattedAction = action.trim().toUpperCase();
    return headingMapping[formattedAction] || "Research Details"; // Default heading
  };

  return (
    <div className="Concontainer-res">
    
      <div className="head-res">
        {/* ✅ Dynamic Category Heading instead of "Title of the Paper" */}
        <h1 className="cards-h1-res">{getCategoryHeading(action)}</h1>
        <h1>{course}</h1>
      </div>
      <div className="cards-grid-res">
        {data && data.length > 0 ? (
          data.map((item, index) => (
            <div
              key={index}
              className={`card-res ${expandedCard === index ? "expanded" : ""}`}
            >
              {/* ✅ Card Head (Displays Item Title) */}
              <CardHead item={item} />

              {/* ✅ Card Body (Excludes Title Fields & "S.No") */}
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
          <p>No data available</p>
        )}
      </div>
    </div>
  );
};

// ✅ Separate Component for Card Head (Only Displays Title)
const CardHead = ({ item }) => {
  return (
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

export default Reseachdetails;
