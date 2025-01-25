import React from "react";
import './OrganizationChart.css'; // Assuming your CSS is in this file

const CollegeOrgChart = () => {
  const chartData = {
    name: "Chairman",
    className: "chairman",
    children: [
      {
        name: "CEO",
        className: "ceo",
        children: [
          {
            name: "Principal",
            className: "principal",
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
                  { name: "Dean - Corporate Relations Higher Studies" },
                ],
              },
              {
                name: "CEO",
                className: "CEO-node",
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
                  { name: "STP & RO" },
                  { name: "ITES" },
                  { name: "NTS & House Keeping" },
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
                  { name: "Asso. Professor" },
                  { name: "Asst. Professor" },
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
    <div className={`org-node ${node.className || ''}`} key={node.name}>
      <div className="person">
        <h4>{node.name}</h4>
      </div>

      {(node.leftCh || node.rightChildren) && (
        <div className="side-children-container">
          {node.leftCh && (
            <div className="side-children left-children">
              {node.leftCh.map((child) => (
                <div className="side-child-wrapper" key={child.name}>
                  {renderChart(child)}
                </div>
              ))}
            </div>
          )}
          {node.rightChildren && (
            <div className="side-children right-children">
              {node.rightChildren.map((child) => (
                <div className="side-child-wrapper" key={child.name}>
                  {renderChart(child)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {node.children && (
        <div className="children">
          {node.children.map((child) => (
            <div className="child-wrapper" key={child.name}>
              {renderChart(child)}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="org-chart-container">
      <h1 className="chart-title">Organization Chart</h1>
      <div className="org-chart">{renderChart(chartData)}</div>
    </div>
  );
};

export default CollegeOrgChart;
