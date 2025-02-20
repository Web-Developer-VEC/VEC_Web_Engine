import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ADM-M.E.css";
import Banner from "../../Banner";

const ME = ({theme, toggle}) => {

  const [pgData, setpgData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const pg = pgData?.PG || [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/pg`);
        setpgData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setLoading(true); // Ensure loading ends even on error
      }
    };
    fetchData();
  }, []);

  return (
    <>
<Banner toggle={toggle} theme={theme}
  backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
  headerText="ME Admission"
  subHeaderText="Shaping future engineers through advanced learning, research, and transformative opportunities."
/>


    <div className="me-page">
    {isLoading && (
          <div className="loading-screen">
            <div className="spinner"></div>
            Loading...
          </div>
        )}
      <div className="ME">
        <h3 className="text-secd dark:text-drks">M.E. Degree Programme</h3>
        <h3 className="text-secd dark:text-drks">
          Candidates seeking admission to the first semester of the four-semester M.E. Degree Programme:
        </h3>
      </div>
      <div className="me-contents dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]">
        <p className="description-text">
          Candidates for admission to the first semester of the Post-Graduate Degree Programme shall be
          required to have passed an appropriate Under-Graduate Degree Examination of Anna University or
          equivalent as specified under qualification for admission as per the Tamil Nadu Common Admission
          (TANCA) criteria.
        </p>
        <br></br>
        <p className="description-text">
          <strong>Note:</strong> TANCA releases the updated criteria during the admissions every academic
          year. Admission shall be offered only to the candidates who possess the qualification prescribed
          against each programme.
        </p>
        <br></br>
        <p className="description-text">
          Any other relevant qualification which is not prescribed against each programme shall be considered
          for equivalence by the committee constituted for the purpose. Admission to such degrees shall be
          offered only after obtaining equivalence to such degrees.
        </p>
        <div className="me-container">
          <center><h4 className="text-secd dark:text-drks">M.E - Total Intake {pgData.Year}</h4></center>
          <table className="intake-table">
            <thead>
              <tr>
                <th className="bg-gradient-to-r
        from-secd to-[color-mix(in_srgb,theme(colors.secd)_75%,black)]
        dark:from-drks dark:to-[color-mix(in_srgb,theme(colors.drks)_50%,black)]">PG Courses</th>
                <th className="bg-gradient-to-r
        from-secd to-[color-mix(in_srgb,theme(colors.secd)_75%,black)]
        dark:from-drks dark:to-[color-mix(in_srgb,theme(colors.drks)_50%,black)]">Government Quota Intake</th>
                <th className="bg-gradient-to-r
        from-secd to-[color-mix(in_srgb,theme(colors.secd)_75%,black)]
        dark:from-drks dark:to-[color-mix(in_srgb,theme(colors.drks)_50%,black)]">Management Quota Intake</th>
                <th className="bg-gradient-to-r
        from-secd to-[color-mix(in_srgb,theme(colors.secd)_75%,black)]
        dark:from-drks dark:to-[color-mix(in_srgb,theme(colors.drks)_50%,black)]">Total Intake</th>
              </tr>
            </thead>
            <tbody>
            {pg.map((item, rowIndex) => {
              const [courseName, courseDetails] = Object.entries(item)[0];
              return (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? "even-row" : "odd-row"}>
                  <td>{courseName}</td>
                  <td>{courseDetails["Government Quota Intakes"]}</td>
                  <td>{courseDetails["Management Quota Intakes"]}</td>
                  <td>{courseDetails["Total Intakes"]}</td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
};

export default ME;
