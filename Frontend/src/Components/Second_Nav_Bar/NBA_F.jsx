import React, { useEffect, useState } from 'react';
import "./NBA_F.css";
import Banner from '../Banner';
import axios from 'axios';

const NBA_F = () => {
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [data, setNbaData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/nba');
        setNbaData(response.data[0].departments);
      } catch (error) {
        console.error("Error fetching NBA Data", error);
      }
    };
    fetchData();
  }, []);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };


  return (
    <>
      <Banner
        backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
        headerText="National Board of Accreditation"
        subHeaderText="Promoting academic excellence through accreditation, fostering continuous quality improvement, and empowering institutions to deliver world-class education."
      />
      <div className="nba-page">
        <div className="nba-tiles">
          <div className="nba-tile-container">
            <div className="nba-tile">
              <div className="tile-tail"></div>
              <h3 className="nba-tile-header">About NBA</h3>
              <p className="nba-tile-text">
                The National Board of Accreditation (NBA) is an autonomous body established by the All India Council for Technical Education (AICTE) under the Ministry of Education, Government of India. NBA is responsible for evaluating the quality of technical and professional education programs.
              </p>
            </div>
            <div className="nba-tile">
              <div className="tile-tail"></div>
              <h3 className="nba-tile-header">Purpose of NBA Accreditation</h3>
              <p className="nba-tile-text">
                The primary goal of NBA accreditation is to assess and ensure that academic programs meet predefined quality standards, thereby promoting continuous improvement in educational institutions.
              </p>
            </div>
          </div>
        </div>
        <div className="table-data">
          <table className="department-table">
            <thead>
              <tr>
                <th>s.no</th>
                <th>Programs</th>
                <th>Validity Years</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.department}</td>
                  <td>
                    {item.pdfs.map((pdf, index) => (
                      <li key={index} className="pdf-link">
                        <a href={`${UrlParser(pdf.pdfs_path)}#toolbar=0`} target="_blank" rel="noopener noreferrer">
                          {pdf.name}
                        </a>
                      </li>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>
    </>
  );
};

export default NBA_F; 