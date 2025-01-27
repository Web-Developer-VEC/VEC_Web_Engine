import React from "react";
import "./ADM-M.E.css";
import Banner from "../Banner";

const ME = () => {
  // Data for the table
  const intakeData = [
    {
      program: "M.E. Computer Science & Engineering",
      governmentQuota: 9,
      managementQuota: 9,
      totalIntake: 18,
    },
    {
      program: "M.E. Power System Engineering",
      governmentQuota: 9,
      managementQuota: 9,
      totalIntake: 18,
    },
  ];

  return (
    <>
<Banner
  backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
  headerText="ME Admission"
  subHeaderText="Shaping future engineers through advanced learning, research, and transformative opportunities."
/>


    <div className="me-page">
        <center>
      <div className="mba-contents">
        <h1>M.E. Degree Programme</h1>
        <br></br>
        <h3>
          Candidates seeking admission to the first semester of the four-semester M.E. Degree Programme:
        </h3>
        <br></br>
        <p>
          Candidates for admission to the first semester of the Post-Graduate Degree Programme shall be
          required to have passed an appropriate Under-Graduate Degree Examination of Anna University or
          equivalent as specified under qualification for admission as per the Tamil Nadu Common Admission
          (TANCA) criteria.
        </p>
        <br></br>
        <p>
          <strong>Note:</strong> TANCA releases the updated criteria during the admissions every academic
          year. Admission shall be offered only to the candidates who possess the qualification prescribed
          against each programme.
        </p>
        <br></br>
        <p>
          Any other relevant qualification which is not prescribed against each programme shall be considered
          for equivalence by the committee constituted for the purpose. Admission to such degrees shall be
          offered only after obtaining equivalence to such degrees.
        </p>
      </div>
      </center>
      <div className="mba-container">
        <h2>M.E - Total Intake</h2>
        <table className="intake-table">
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
              <tr key={index} className={index % 2 === 0 ? "even-row" : "odd-row"}>
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

export default ME;
