import React from "react";
import './Orgainzation_chart.css'; // Ensure the CSS file includes necessary styles
import Banner from "../Banner";

const CollegeOrgChart = () => {
    const chartData = {
      name: "Chairman",
      children: [
        {
          name: "CEO",
          className: "ceo-node",
          children: [
            {
              name: "Principal",
              className: "principal-node",
              leftCh: [
                { name: "Governing Council", className: "committee-node" },
                { name: "Academic Council", className: "committee-node" },
              ],
              rightChildren: [
                { name: "IQAC", className: "committee-node" },
                { name: "Finance Committee", className: "committee-node" },
              ],
              children: [
                {
                  name: "Deans",
                  className: "dean-node",
                  children: [
                    { name: "Dean - Academics" },
                    { name: "Dean - Faculty Development & Welfare" },
                    { name: "Dean - Students Development & Welfare" },
                    { name: "Dean - Planning & Development" },
                    { name: "Dean - Accreditations & Ranking" },
                    { name: "Dean - Research & Development" },
                    { name: "Dean - Corporate Relations & Higher Studies" },
                  ],
                },
                {
                  name: "Library",
                  className: "library-node",
                },
                {
                  name: "Administrative officer",
                  className: "Admin-node",
                  children: [
                    { name: "Accounts" },
                    { name: "Admin" },
                    { name: "Electricals" },
                    { name: "ITES" },
                    { name: "STP&RO" },
                    { name: "NTS & Housekeeping" },
                    { name: "Security" },
                    { name: "Garden" },
                    { name: "Transport" },
                    { name: "Temple" },
                    { name: "Hospital" },
                  ],
                },
                {
                  name: "HOD",
                  className: "HOD-node",
                  children: [
                    { name: "Professor" },
                    { name: "Associate Professor" },
                    { name: "Assistant Professor" },
                    { name: "Lab Assistants" },
                  ],
                },
                {
                  name: "Hostel",
                  className: "hostel-node",
                  children: [
                    { name: "Chief Warden" },
                    { name: "Deputy Chief Warden" },
                    { name: "Warden" },
                    { name: "Deputy Warden" },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const renderChart = (node) => (
      <div className={`org-node ${node.className}`} key={node.name}>
        <div className="person">
          <h4>{node.name}</h4>
        </div>
        {node.leftCh && (
          <div className="side-children left-children">
            {node.leftCh.map((child) => renderChart(child))}
          </div>
        )}
        {node.rightChildren && (
          <div className="side-children right-children">
            {node.rightChildren.map((child) => renderChart(child))}
          </div>
        )}
        {node.children && (
          <div className="children">
            {node.children.map((child) => renderChart(child))}
          </div>
        )}
      </div>
    );

    return (
      <>
        <Banner
          backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
          headerText="Organization Chart"
          subHeaderText="A clear framework for success, aligning teams and leaders toward shared goals and growth."
        />

        <div className="org-chart-container">
          <div className="org-chart">{renderChart(chartData)}</div>
        </div>
      </>
    );
};

export default CollegeOrgChart;
