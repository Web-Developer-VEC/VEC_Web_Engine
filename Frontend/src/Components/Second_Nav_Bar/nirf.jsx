import React from "react";
import "./nirf.css"; // Importing the CSS file
import Banner from "../Banner";

const nirfData = [
  {
    year: "2025",
    categories: [
      { name: "Overall", link: "https://example.com/nirf2025-overall" },
      { name: "Engineering", link: "https://example.com/nirf2025-engineering" },
      { name: "SDG Institution", link: "https://example.com/nirf2025-sdg" },
      { name: "Innovation", link: "https://example.com/nirf2025-innovation" },
    ],
  },
  {
    year: "2024",
    categories: [
      { name: "Overall", link: "https://example.com/nirf2024-overall" },
      { name: "Engineering", link: "https://example.com/nirf2024-engineering" },
    ],
  },
  {
    year: "2023",
    categories: [
      { name: "Overall", link: "https://example.com/nirf2023-overall" },
      { name: "Engineering", link: "https://example.com/nirf2023-engineering" },
    ],
  },
  {
    year: "2022",
    categories: [
      { name: "Overall", link: "#" },
      { name: "Engineering", link: "#" },
    ],
  },
  {
    year: "2021",
    categories: [
      { name: "Overall", link: "#" },
      { name: "Engineering", link: "#" },
    ],
  },
  {
    year: "2020",
    categories: [
      { name: "Engineering", link: "#" },
    ],
  },
  {
    year: "2019",
    categories: [
      { name: "Engineering", link: "#" },
    ],
  },
  {
    year: "2018",
    categories: [
      { name: "Engineering", link: "#" },
    ],
  },
  {
    year: "2017",
    categories: [
      { name: "Engineering", link: "#" },
    ],
  },
];

const NIRF = ({ toggle, theme, isLoading }) => {
  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
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
        <div className="nirf-intro ">
          <h1 className="nirf-header ">
            NATIONAL INSTITUTIONAL RANKING FRAMEWORK (NIRF)
          </h1>
          <p>
            The NIRF is a comprehensive ranking system launched by the Ministry
            of Education, Government of India, in 2015. It provides a structured
            methodology to rank higher education institutions across India based
            on various objective and subjective criteria. The ranking is
            released annually, aiming to promote a competitive spirit among
            institutions and enhance transparency in education standards.
          </p>
        </div>
        <h2 className="nirf-title">NATIONAL INSTITUTIONAL RANKING FRAMEWORK</h2>
        <div className="nirf-grid">
          {nirfData.map((item, index) => (
            <div key={index} className="nirf-year">
              <h3>NIRF {item.year}</h3>
              {item.categories.map((category, catIndex) => (
                <a
                  key={catIndex}
                  href={category.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nirf-link"
                >
                  {category.name}
                </a>
              ))}
            </div>
          ))}
        </div>
        <p className="nirf-footer">
          Comments and suggestions are invited from the public to provide
          feedback through 
          <a href="mailto:feedback_nirf@nec.edu.in" className="nirf-email"> velammal@gmail.com
          </a>
        </p>
      </div>
    </>
  );
};

export default NIRF;
