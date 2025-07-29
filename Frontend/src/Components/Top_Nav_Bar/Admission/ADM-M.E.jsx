import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ADM-M.E.css";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";

const ME = ({theme, toggle}) => {

  const [pgData, setpgData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const pg = pgData?.PG || [];
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`/api/main-backend/admission`,
          {
            type: "pg"
          }
        );
        setpgData(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setLoading(true); // Ensure loading ends even on error
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
    };
}, []);

if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
}

  return (
    <>
    <Banner toggle={toggle} theme={theme}
      backgroundImage="./Banners/admissionbanner.webp"
      headerText="ME Admission"
      subHeaderText="Shaping future engineers through advanced learning, research, and transformative opportunities."
    />

    {isLoading ? (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={""} />
      </div>
    ) : (
      <div className="me-page">
        <div className="ME">
          <h3 className="text-accn dark:text-drkt font-bold border-b-2 pb-2 w-fit border-[#fdcc03] dark:border-drks">M.E. Degree Programme</h3>

        </div>
        <div className="me-contents bg-[#fffae6]
                  dark:bg-drkb border-l-4 border-secd dark:border-drks">
          <h3 className="text-accn dark:text-drkt Eligibility text-center">
            Candidates seeking Admission to the First Semester of the Four-Semester M.E. Degree Programme:
          </h3>
          
          <br></br>
          <p className="M.E. Degree Programme">Candidates seeking admission for the Post-Graduate Degree Programme shall be required to have passed an appropriate Under-Graduate Degree Examination of Anna University or equivalent as specified under qualification for admission as per the Tamil Nadu Common Admission (TANCA) criteria.
          </p>
          <br />
          <p className="description-text">
            <strong>Note:</strong>TANCA releases the updated criteria during the admissions every academic year. Admission shall be offered only to the candidates who possess the qualification prescribed against each programme.
            </p>
          <br></br>
          <p className="description-text">
          Any other relevant qualification which is not prescribed against each programme shall be considered for equivalence by the committee constituted for the purpose. Admission to such degrees shall be offered only after obtaining equivalence to such degrees.
          </p>
          <div>
            <p className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1 text-[24px] w-fit font-bold mb-2 mt-2">GOVERNMENT QUOTA</p>
            <p className="text-text dark:text-drkt ml-8">M.E : Apply through TANCET/TANCA</p>
          </div>
          <div>
            <p className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1 text-[24px] w-fit font-bold mb-2 mt-2">MANAGEMENT QUOTA</p>
            <p className="text-text dark:text-drkt ml-8">M.E : Apply through Common Entrance Test (CET) conducted by the Consortium of Self –Financing Professional, Arts and  Science Colleges in Tamil Nadu</p>
          </div>
          <div className="me-container">
            <center><h4 className="text-accn dark:text-drkt Eligibility mt-5 font-bold">M.E - Total Intake {pgData.year}</h4></center>
            <table className="intake-table">
              <thead>
                <tr>
                  <th className="ugHeader">PG Courses</th>
                  <th className="ugHeader">Government Quota Intake</th>
                  <th className="ugHeader">Management Quota Intake</th>
                  <th className="ugHeader">Total Intake</th>
                </tr>
              </thead>
              <tbody>
              {pg.map((item, rowIndex) => {
                const [courseName, courseDetails] = Object.entries(item)[0];
                return (
                  <tr key={rowIndex} className="bg-prim dark:bg-drkp">
                    <td className="text-start">{courseName}</td>
                    <td className="font-light">{courseDetails["Government Quota Intakes"]}</td>
                    <td className="font-light">{courseDetails["Management Quota Intakes"]}</td>
                    <td className="font-light">{courseDetails["Total Intakes"]}</td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default ME;
