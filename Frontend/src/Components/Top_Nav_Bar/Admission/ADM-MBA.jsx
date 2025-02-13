import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ADM-MBA.css";
import Banner from "../../Banner";

const MBA = () => {
  const [mbaData, setMbaData] = useState(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/mba`);
        setMbaData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setLoading(true);
      }
    };
    fetchData();
  }, []);

  // Ensure mbaData exists before accessing properties
  const mba = mbaData?.MBA || {};

  return (
    <>
      <Banner
        backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
        headerText="MBA Admission"
        subHeaderText="Empowering future business leaders through strategic thinking, innovation, and global opportunities."
      />

      <div className="mba-page">
      {isLoading && (
          <div className="loading-screen">
            <div className="spinner"></div>
            Loading...
          </div>
        )}
        <div className="MBA">
          <h3>M.B.A Admission</h3>
        </div>
        <div className="mba-container">
          <p className="description-text">
            Learners for admission to the first semester of the MBA Programme shall be required to have passed an appropriate Under-Graduate Degree Examination of Anna University or equivalent as specified under qualification for admission as per the Tamil Nadu single window counselling process. The Government of Tamil Nadu releases the updated eligibility criteria for the admission. Admission shall be offered only to candidates who possess the qualification prescribed and the eligibility criteria for the programme.
          </p>

          <div className="mba-content">
            <center>
              <h4>MBA - Total Intake ({mbaData?.Year})</h4>
            </center>
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
                <tr className="mba-even-row">
                  <td>Master of Business Administration (MBA)</td>
                  <td>{mba["Government Quota Intakes"]}</td>
                  <td>{mba["Management Quota Intakes"]}</td>
                  <td>{mba["Total Intakes"]}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default MBA;
