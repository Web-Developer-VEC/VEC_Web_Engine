import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UgAdmission.css";
import Banner from "../../Banner";

const UgAdmission = ({theme, toggle}) => {
  const [ugData, setUgData] = useState(null);
  const [isLoading, setLoading] = useState(true);

  const ug = ugData?.UG || []; 
  const ug_lateral = ugData?.UG_Lateral || [];
  const year = ugData?.Year

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/ug`);
        setUgData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setLoading(true); // Ensure loading ends even on error
      }
    };
    fetchData();
  }, []);

  const renderTable = (data, title, subtitle) => (
    <div className="table-container mt-5">
      <h4 className="text-accn dark:text-drka Eligibility text-center">{title}</h4>
      <h6 className="text-accn dark:text-drka Eligibility font-thin text-center">{subtitle}</h6>
      <div className="table-card">
        <table className="styled-table">
          <thead>
            <tr>
              <th className="ugHeader">UG COURSES</th>
              <th className="ugHeader">GOVERNMENT QUOTA INTAKE</th>
              <th className="ugHeader">MANAGEMENT QUOTA INTAKE</th>
              <th className="ugHeader">TOTAL INTAKE</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, rowIndex) => {
              const [courseName, courseDetails] = Object.entries(item)[0];
              return (
                <tr key={rowIndex} className={""}>
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
  );

  return (
    <>
      <Banner toggle={toggle} theme={theme}
        backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
        headerText="UG Admission"
        subHeaderText="Empowering the next generation of leaders through access to world-class education and opportunities."
      />
      <div className="Admission">
      {isLoading && (
          <div className="loading-screen">
            <div className="spinner"></div>
            Loading...
          </div>
        )}
        <div className="B-E">
          <h3 className="text-accn dark:text-drka">B.E./B.Tech. Degree Programme</h3>
        </div>

        <div className="ADM-content bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]">        
          <div className="text-accn dark:text-drka mb-3  Eligibility">Eligibility</div>
          <p className="description-text">
            &nbsp; &nbsp; Should have passed the Higher Secondary Examinations of (10+2) Curriculum (Academic Stream) prescribed by the Government of Tamil Nadu with Mathematics, Physics, and Chemistry as three of the four subjects of study under Part-III or any examination of any other University or authority accepted by the Syndicate of Anna University as equivalent thereto.
          </p>
          <p className="description-text text-center">( OR )</p>
          <p className="description-text">
          &nbsp; &nbsp; Should have passed the Higher Secondary Examination of Vocational stream (Vocational groups in Engineering / Technology) as prescribed by the Government of Tamil Nadu.
          </p>
          {renderTable(ug, `UG COURSES - TOTAL INTAKE ${year}`, "(For First Year Admissions)")}
        </div>


        <div className="B-E">
          <h3 className="text-accn dark:text-drka mt-5">Lateral Entry</h3>
        </div>
        <div className="ADM-content lateral-entry bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]"> 
          <div className="text-accn dark:text-drka mb-3 Eligibility">Eligibility</div>
          <p className="description-text">
            &nbsp; &nbsp; Candidates possessing a Diploma in Engineering/Technology awarded by the State Board of Technical Education, Tamilnadu or its equivalent are eligible for Lateral entry admission to the third semester of B.E./B.Tech. as per the rules fixed by the Govt. of Tamilnadu.
          </p>
          <p className="description-text text-center">( OR )</p>
          <p className="description-text">
            &nbsp; &nbsp; Candidates possessing a Degree in Science (B.Sc.,) (10+2+3 stream) with Mathematics as a subject at the B.Sc. level are eligible for Lateral entry admission to the third semester of B.E./B.Tech.
          </p>
          {renderTable(ug_lateral, `UG COURSES - TOTAL INTAKE ${year}`, "(For Diploma Holders Only)")}
        </div>
      </div>
    </>
  );
};

export default UgAdmission;
