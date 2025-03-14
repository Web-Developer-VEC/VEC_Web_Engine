import React from "react";
import "./Regulation.css";
import Banner from "../../Banner";

const REGULATION = ({ theme, toggle }) => {
  const regulations = [
    {
      year: "2023",
      links: [
        { name: "UG - B.E / B.Tech", file: "/regulation_2025_btech.pdf" },
        { name: "PG - MBA", file: "/regulation_2025_mba.pdf" },
        { name: "PG - ME", file: "/regulation_2025_me.pdf" },
      ],
    },
    {
      year: "2019(A)",
      links: [
        { name: "UG - B.E / B.Tech", file: "/regulation_2024_btech.pdf" },
        { name: "PG - MBA", file: "/regulation_2024_mba.pdf" },
        { name: "PG - ME", file: "/regulation_2024_me.pdf" },
      ],
    },
    {
      year: "2019",
      links: [
        { name: "UG - B.E / B.Tech", file: "/regulation_2024_btech.pdf" },
        { name: "PG - MBA", file: "/regulation_2024_mba.pdf" },
        { name: "PG - ME", file: "/regulation_2024_me.pdf" },
      ],
    },
  ];

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
          {regulations.map((reg, index) => (
            <div key={index} className="regulation-card">
              <h2 className="regulation-year">Regulation {reg.year}</h2>
              <ul className="regulation-list">
                {reg.links.map((link, idx) => (
                  <li key={idx}>
                    <a href={link.file} target="_blank" rel="noopener noreferrer">
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
