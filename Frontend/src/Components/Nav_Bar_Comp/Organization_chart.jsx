import React from "react";
import './Orgainzation_chart.css'; // Ensure the CSS file includes necessary styles

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
                    { name: "Dean - Faculty Devlopment & Welfare" },
                    { name: "Dean - Students Devlopment & Welfare" },
                    { name: "Dean - Planning & Devlopment" },
                    { name: "Dean - Accredations & Ranking" },
                    { name: "Dean - Research & Devlopment" },
                    { name: "Dean - Coperate Relations Higherstudies "},
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
                    { name: "STP &RO" },
                    { name: "ITES" },
                    { name: "NTS & House Keeping" },
                    { name: "Security" },
                    { name: "gadern" },
                    { name: "Transport" },
                    { name: "Temple" },
                    { name: "hospital" },
                  ],
                },
                {
                  name: "HOD",
                  className: "HOD-node",
                  children: [
                    { name: "Professor" },
                    { name: "Asso. professor" },
                    { name: "Asst. professor" },
                    { name: "Lab Assistants" },
                  ],
                },
                {
                  name: "Hostel",
                  className: "hostel-node",
                  children: [
                    { name: "Chief Warden" },
                    { name: "Deputy cheif wardern" },
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
      <div className="org-chart-container">
        <h1 className="chart-title">Organization Chart</h1>
        <div className="org-chart">{renderChart(chartData)}</div>
      </div>
    );
  };
export default CollegeOrgChart;
