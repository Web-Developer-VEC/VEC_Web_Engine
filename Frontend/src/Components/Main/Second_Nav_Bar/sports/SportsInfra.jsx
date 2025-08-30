import React from "react";
import "./SportsInfra.css";

const SportsInfra = ({ data }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  if (!Array.isArray(data) || data.length === 0) {
    return <div className="text-center py-10">No infrastructure data available.</div>;
  }

  return (
    <div className="sports-container">
      {data.map((item, index) => (
        index % 2 === 0 ? (
          <div key={index} className="sports-row">
            {/* First item */}
            <div className="sports-item border-1 border-black dark:bg-text">
              <img
                className="sport-img"
                src={UrlParser(item.image_path)}
                alt={item.title}
              />
              <h2 className="sports-title">{item.title}</h2>
              <p className="sports-description">{item.description}</p>
            </div>

            {/* Second item if exists */}
            {index + 1 < data.length && (
              <div className="sports-item border-1 border-black dark:bg-text">
                <img
                  className="sport-img"
                  src={UrlParser(data[index + 1].image_path)}
                  alt={data[index + 1].title}
                />
                <h2 className="sports-title">{data[index + 1].title}</h2>
                <p className="sports-description">{data[index + 1].description}</p>
              </div>
            )}
          </div>
        ) : null
      ))}
    </div>
  );
};

export default SportsInfra;
