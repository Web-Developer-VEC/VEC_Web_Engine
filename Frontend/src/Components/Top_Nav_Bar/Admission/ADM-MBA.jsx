import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ADM-MBA.css";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";

const MBA = ({theme, toggle}) => {
  const [mbaData, setMbaData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  // Ensure mbaData exists before accessing properties
  const mba = mbaData?.MBA || {};

  return (
    <>
      <Banner toggle={toggle} theme={theme}
        backgroundImage="./Banners/admissionbanner.webp"
        headerText="MBA Admission"
        subHeaderText="Empowering future business leaders through strategic thinking, innovation, and global opportunities."
      />

      {isLoading ? (
        <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
          <LoadComp txt={""} />
        </div>
      ) : (
        <div className="mba-page">
          <div className="MBA">
            <h3 className="text-accn dark:text-drkt ml-4 font-bold border-b-2 pb-2 w-fit border-[#fdcc03] dark:border-drks">M.B.A Admission</h3>
          </div>
          <div className="mba-container bg-[#f8f9fa]
                  dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]">
            <div className="text-start text-accn dark:text-drkt mb-3 Eligibility font-bold border-b-2 pb-2 w-fit border-[#fdcc03] dark:border-drks">Eligibility</div>
            <p className="description-text">
            Learners for admission to the first semester of the MBA Programme shall be required to have passed an appropriate Under-Graduate Degree Examination of Anna University or equivalent as specified under qualification for admission as per the Tamil Nadu single window counselling process. The Government of Tamil Nadu releases the updated eligibility criteria for the admission. Admission shall be offered only to candidates who possess the qualification prescribed and the eligibility criteria for the programme.
            </p>
          <div>
            <p className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1 text-[24px] w-fit font-bold mb-2 mt-2">GOVERNMENT QUOTA</p>
            <p className="text-text dark:text-drkt ml-8">MBA : Apply through TANCET/TANCA</p>
          </div>
          <div>
            <p className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1 text-[24px] w-fit font-bold mb-2 mt-2">MANAGEMENT QUOTA</p>
            <p className="text-text dark:text-drkt ml-8">MBA : Apply through Common Entrance Test (CET) conducted by the Consortium of Self –Financing Professional, Arts and  Science Colleges in Tamil Nadu</p>
          </div>

            <div className="mba-content">
              <center>
                <h4 className="text-accn dark:text-drkt font-bold">MBA - Total Intake ({mbaData?.Year})</h4>
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
      )}
    </>
  );
};

export default MBA;
