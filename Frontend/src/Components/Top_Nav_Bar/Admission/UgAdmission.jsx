import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UgAdmission.css";
import {FaLink} from "react-icons/fa";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";

const UgAdmission = ({theme, toggle}) => {
  const [ugData, setUgData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const ug = ugData?.UG || []; 
  const ug_lateral = ugData?.UG_Lateral || [];
  const year = ugData?.Year

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
      return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/ug`);
        setUgData(response.data);
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

  const renderTable = (data, title, subtitle) => (
  <div className="table-container mt-5">
    <h4 className="text-accn dark:text-drkt Eligibility text-center">{title}</h4>
    <h6 className="text-accn dark:text-drkt Eligibility font-thin text-center">{subtitle}</h6>
    <div className="table-card overflow-x-auto">
      <table className="styled-table min-w-[600px]">
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
              <tr key={rowIndex} className="bg-prim dark:bg-text">
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
        backgroundImage="./Banners/admissionbanner.webp"
        headerText="UG Admission"
        subHeaderText="Empowering the next generation of leaders through access to world-class education and opportunities."
      />

      {isLoading ? (
        <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
          <LoadComp txt={""} />
        </div>
      ) : (
        <div className="Admission">
          <div className="B-E">
            <h3 className="text-accn dark:text-drkt border-b-2 pb-2 w-fit border-[#fdcc03] dark:border-drks">B.E./B.Tech. Degree Programme</h3>
          </div>

          <div className="ADM-content bg-[#fffae6]
                  dark:bg-drkb border-l-4 border-secd dark:border-drks ">        
           <div className="text-start text-accn dark:text-drkt mb-3 Eligibility font-bold border-b-2 pb-2 w-fit border-[#fdcc03] dark:border-drks">Eligibility</div>
           
            <p className="description-text">
            Candidates seeking admission should have passed the Higher Secondary Examinations of (10+2) Curriculum (Academic Stream) prescribed by the Government of Tamil Nadu with Mathematics, Physics, and Chemistry as three of the four subjects of study under Part-III or any examination of any other University or authority accepted by the Syndicate of Anna University as equivalent thereto.
            </p><br />
            <p className="text-start description-text ">( OR )</p>
            <br />
            <p className="description-text">
            Should have passed the Higher Secondary Examination of Vocational stream (Vocational groups in Engineering / Technology) as prescribed by the Government of Tamil Nadu.
            </p>
            <br />
            <div>
              <p className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1 text-[24px] w-fit font-bold mb-2">GOVERNMENT QUOTA</p>
              <p className="text-text dark:text-drkt ml-8">B.E/ B.Tech : Apply through TNEA Counselling</p>
            </div>
             <div className="flex justify-center mt-4">
              <p className="text-text dark:text-drkt font-bold mr-8">INFORMATION TO…..</p>
              <a href={UrlParser(ugData?.link)} className="dark:text-drka" target="_blank">
                <FaLink  className={"inline size-5 mr-1 mb-1"}/>* FIRST YEAR B.E/B.Tech – Government Quota ( Through TNEA counselling 2025)
              </a>
            </div>
            <div>
              <p className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1 text-[24px] w-fit font-bold mb-2 mt-2">MANAGEMENT QUOTA</p>
              <p className="text-text dark:text-drkt ml-8">B.E/ B.Tech : Apply through Consortium of Self –Financing Professional, Arts and Science Colleges in Tamil Nadu</p>
            </div>
            <div className="flex justify-center mt-4">
              <p className="text-text dark:text-drkt font-bold mr-8">INFORMATION TO…..</p>
              <a href={UrlParser(ugData?.link)} className="dark:text-drka" target="_blank">
                <FaLink  className={"inline size-5 mr-1 mb-1"}/>* FIRST YEAR B.E/B.TECH – MANAGEMENT QUOTA
              </a>
            </div>
            {renderTable(ug, `UG COURSES - TOTAL INTAKE ${year}`, "(For First Year Admissions)")}
          </div>


          <div className="B-E">
            <h3 className="text-accn dark:text-drkt mt-5 border-b-2 pb-2 w-fit border-[#fdcc03] dark:border-drks">Lateral Entry</h3>
          </div>
          <div className="ADM-content lateral-entry bg-[#fffae6]
                  dark:bg-drkb border-l-4 border-secd dark:border-drks"> 
            <div className="text-start text-accn dark:text-drkt mb-3 Eligibility font-bold border-b-2 pb-2 w-fit border-[#fdcc03] dark:border-drks">Eligibility</div>
            <p className="description-text">
            Candidates possessing a Diploma in Engineering/Technology awarded by the State Board of Technical Education, Tamilnadu or its equivalent are eligible for Lateral entry admission to the third semester of B.E./B.Tech. as per the rules fixed by the Govt. of Tamilnadu.
            </p>
            <br />
            <p className="description-text">( OR )</p>
            <br />
            <p className="description-text">
            Candidates possessing a Degree in Science (B.Sc.,) (10+2+3 stream) with Mathematics as a subject at the B.Sc. level are eligible for Lateral entry admission to the third semester of B.E./B.Tech.
            </p>
            {renderTable(ug_lateral, `UG COURSES - TOTAL INTAKE ${year}`, "(For Diploma Holders Only)")}
          </div>
        </div>
      )}
    </>
  );
};

export default UgAdmission;
