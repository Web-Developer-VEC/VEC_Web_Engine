import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ADM-MBA.css";
import Banner from "../../Banner";

const MBA = ({theme, toggle}) => {
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
      <Banner toggle={toggle} theme={theme}
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
          <h3 className="text-accn dark:text-drka ml-4 font-bold">M.B.A Admission</h3>
        </div>
        <div className="mba-container bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]">
          <div className="text-accn dark:text-drka mb-3 Eligibility">Eligibility</div>
          <p className="description-text">
            &nbsp;&nbsp; Learners for admission to the first semester of the MBA Programme shall be required to have passed an appropriate Under-Graduate Degree Examination of Anna University or equivalent as specified under qualification for admission as per the Tamil Nadu single window counselling process. The Government of Tamil Nadu releases the updated eligibility criteria for the admission. Admission shall be offered only to candidates who possess the qualification prescribed and the eligibility criteria for the programme.
          </p>

          <div className="mba-content">
            <center>
              <h4 className="text-accn dark:text-drka">MBA - Total Intake ({mbaData?.Year})</h4>
            </center>
            <table className="mba-intake-table">
              <thead>
                <tr>
                  <th className="ugHeader">PG Courses</th>
                  <th className="ugHeader">Government Quota Intake</th>
                  <th className="ugHeader">Management Quota Intake</th>
                  <th className="ugHeader">Total Intake</th>
                </tr>
              </thead>
              <tbody>
                <tr className="even:bg-[color-mix(in_srgb,theme(colors.secd),transparent_70%)]
                    dark:even:bg-[color-mix(in_srgb,theme(colors.drks),transparent_70%)] bg-prim dark:bg-drkp">
                  <td className="text-start">Master of Business Administration (MBA)</td>
                  <td className="font-light">{mba["Government Quota Intakes"]}</td>
                  <td className="font-light">{mba["Management Quota Intakes"]}</td>
                  <td className="font-light">{mba["Total Intakes"]}</td>
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
