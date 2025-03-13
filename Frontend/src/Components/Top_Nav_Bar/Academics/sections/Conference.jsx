import { useState } from "react"
import "./Conference.css"

const Conference = ({ data, action }) => {
  const [expandedCard, setExpandedCard] = useState(null)

  const toggleExpand = (index) => {
    setExpandedCard(expandedCard === index ? null : index)
  }

  const renderValue = (key, value) => {
    if (typeof value === "string" && value.startsWith("http")) {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer">
          View
        </a>
      )
    }
    if (key.toLowerCase().includes("title")) {
      return <h3>{value}</h3>
    }
    return value
  }

  return (
    <div className="container">
      <div className="head">
        <h1 className="cards-h1">{action.replace(/_/g, " ")}</h1>

      </div>
      <div className="cards-grid">
        {data && data.length > 0 ? (
          data.map((item, index) => (
            <div key={index} className={`card ${expandedCard === index ? "expanded" : ""}`}>
              <div className="card-content">
                {Object.entries(item).map(
                  ([key, value], entryIndex) =>
                    (expandedCard === index || entryIndex < 5) && (
                      <div key={key} className="card-entry">
                        <strong>{key.replace(/_/g, " ")}:</strong>
                        {renderValue(key, value)}
                      </div>
                    ),
                )}
              </div>
              {Object.keys(item).length > 5 && (
                <button className="view-more-btn" onClick={() => toggleExpand(index)}>
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
  )
}

export default Conference

