import React, { useEffect, useState } from "react";
import "./Regulation.css";
import axios from "axios";
import Banner from "../../Banner";

const REGULATION = ({ theme, toggle }) => {

  const [regulationdata, setRegulationData] = useState(null);
  
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/regulation');

        setRegulationData(response.data);
      } catch (error) {
        console.error("Error Fetching Regulation data");
      }
    }
    fetchData();
  },[]);

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
        headerText="Regulations"
        subHeaderText="Establishing clear guidelines to foster transparency, compliance, and organizational integrity."
      />
      <div className="regulation-container">
        <h1 className="title">Regulations</h1>
        <div className="regulation-grid">
          {regulationdata?.map((reg, index) => (
            <div key={index} className="regulation-card">
              <h2 className="regulation-year">Regulation {reg.year}</h2>
              <ul className="regulation-list">
                {reg.links.map((link, idx) => (
                  <li key={idx}>
                    <a href={UrlParser(link.pdf_path)} target="_blank" rel="noopener noreferrer">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default REGULATION;
