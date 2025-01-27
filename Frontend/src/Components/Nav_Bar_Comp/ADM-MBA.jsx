import React from "react";
import "./ADM-MBA.css";
import Banner from "../Banner";

const MBA = () => {
  // Data for the table
  const intakeData = [
    {
      program: "Master of Business Administration (MBA)",
      governmentQuota: 60,
      managementQuota: 60,
      totalIntake: 120,
    },
  ];

  return (
    <>
<Banner
  backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
  headerText="MBA Admission"
  subHeaderText="Empowering future business leaders through strategic thinking, innovation, and global opportunities."
/>

    <div className="mba-page">
      <center>
        <div className="mba-contents">
          <h1>M.B.A Admission</h1>
          <br />
          <p>
            Learners for admission to the first semester of the MBA Programme shall be required to have passed an appropriate Under-Graduate Degree Examination of Anna University or equivalent as specified under qualification for admission as per the Tamil Nadu single window counselling process. The Government of Tamil Nadu releases the updated eligibility criteria for the admission. Admission shall be offered only to candidates who possess the qualification prescribed and the eligibility criteria for the programme.
          </p>
        </div>
      </center>
      <br></br>
      <br></br>
      <div className="mba-container">
        <h2>MBA - Total Intake</h2>
        <table className="mba-intake-table">
          <thead>
            <tr>
              <th>PG Courses</th>
              <th>Government Quota Intake</th>
              <th>Management Quota Intake</th>
              <th>Total Intake</th>
            </tr>
          </thead>
          <tbody>
            {intakeData.map((data, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "mba-even-row" : "mba-odd-row"}
              >
                <td>{data.program}</td>
                <td>{data.governmentQuota}</td>
                <td>{data.managementQuota}</td>
                <td>{data.totalIntake}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
};

export default MBA;
