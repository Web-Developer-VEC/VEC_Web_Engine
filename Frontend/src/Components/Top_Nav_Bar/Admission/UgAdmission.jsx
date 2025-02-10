import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UgAdmission.css";
import Banner from "../../Banner";

const UgAdmission = () => {
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
    <div className="table-container">
      <h4>{title}</h4>
      <h6>{subtitle}</h6>
      <div className="table-card">
        <table className="styled-table">
          <thead>
            <tr>
              <th>UG COURSES</th>
              <th>GOVERNMENT QUOTA INTAKE</th>
              <th>MANAGEMENT QUOTA INTAKE</th>
              <th>TOTAL INTAKE</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, rowIndex) => {
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
  );

  return (
    <>
      <Banner
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
          <h3>B.E./B.Tech. Degree Programme</h3>
        </div>

        <div className="ADM-content">
          <p className="description-text">
            Should have passed the Higher Secondary Examinations of (10+2) Curriculum (Academic Stream) prescribed by the Government of Tamil Nadu with Mathematics, Physics, and Chemistry as three of the four subjects of study under Part-III or any examination of any other University or authority accepted by the Syndicate of Anna University as equivalent thereto.
          </p>
          <p className="description-text">( OR )</p>
          <p className="description-text">
            Should have passed the Higher Secondary Examination of Vocational stream (Vocational groups in Engineering / Technology) as prescribed by the Government of Tamil Nadu.
          </p>
          {renderTable(ug, `UG COURSES - TOTAL INTAKE ${year}`, "(For First Year Admissions)")}
        </div>

        <div className="ADM-content lateral-entry">
          <h5>Lateral Entry Admission</h5>
          <p className="description-text">
            Candidates possessing a Diploma in Engineering/Technology awarded by the State Board of Technical Education, Tamilnadu or its equivalent are eligible for Lateral entry admission to the third semester of B.E./B.Tech. as per the rules fixed by the Govt. of Tamilnadu.
          </p>
          <p className="description-text">( OR )</p>
          <p className="description-text">
            Candidates possessing a Degree in Science (B.Sc.,) (10+2+3 stream) with Mathematics as a subject at the B.Sc. level are eligible for Lateral entry admission to the third semester of B.E./B.Tech.
          </p>
          {renderTable(ug_lateral, `UG COURSES - TOTAL INTAKE ${year}`, "(For Diploma Holders Only)")}
        </div>
      </div>
    </>
  );
};

export default UgAdmission;
