import React, { useEffect, useState } from 'react';
import "./NBA_F.css";
import Banner from '../Banner';
import axios from 'axios';

const NBA_F = () => {
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [nbaData, setNbaData] = useState(null);

  const data = [
    {
      id: 1,
      department: "Computer Science",
      pdfs: [
        { name: "2015-2019", link: "/pdfs/cs1.pdf" },
        { name: "2019-2023", link: "/pdfs/cs2.pdf" },
        { name: "2023-2027", link: "/pdfs/cs3.pdf" },
        { name: "2027-2031", link: "/pdfs/cs4.pdf" }
      ]
    },
    {
      id: 2,
      department: "Mechanical Engineering",
      pdfs: [
        { name: "2015-2019", link: "/pdfs/me1.pdf" },
        { name: "2019-2023", link: "/pdfs/me2.pdf" },
        { name: "2023-2027", link: "/pdfs/me3.pdf" },
        { name: "2027-2031", link: "/pdfs/me4.pdf" }
      ]
    },
    {
      id: 3,
      department: "Electrical Engineering",
      pdfs: [
        { name: "2015-2019", link: "/pdfs/ee1.pdf" },
        { name: "2019-2023", link: "/pdfs/ee2.pdf" },
        { name: "2023-2027", link: "/pdfs/ee3.pdf" },
        { name: "2027-2031", link: "/pdfs/ee4.pdf" }
      ]
    },
    {
      id: 4,
      department: "Civil Engineering",
      pdfs: [
        { name: "2015-2019", link: "/pdfs/ce1.pdf" },
        { name: "2019-2023", link: "/pdfs/ce2.pdf" },
        { name: "2023-2027", link: "/pdfs/ce3.pdf" },
        { name: "2027-2031", link: "/pdfs/ce4.pdf" }
      ]
    },
    {
      id: 5,
      department: "Electronics & Communication",
      pdfs: [
        { name: "2015-2019", link: "/pdfs/ece1.pdf" },
        { name: "2019-2023", link: "/pdfs/ece2.pdf" },
        { name: "2023-2027", link: "/pdfs/ece3.pdf" },
        { name: "2027-2031", link: "/pdfs/ece4.pdf" }
      ]
    },
    {
      id: 6,
      department: "Information Technology",
      pdfs: [
        { name: "2015-2019", link: "/pdfs/it1.pdf" },
        { name: "2019-2023", link: "/pdfs/it2.pdf" },
        { name: "2023-2027", link: "/pdfs/it3.pdf" },
        { name: "2027-2031", link: "/pdfs/it4.pdf" }
      ]
    },
    {
      id: 7,
      department: "Biotechnology",
      pdfs: [
        { name: "2015-2019", link: "/pdfs/bt1.pdf" },
        { name: "2019-2023", link: "/pdfs/bt2.pdf" },
        { name: "2023-2027", link: "/pdfs/bt3.pdf" },
        { name: "2027-2031", link: "/pdfs/bt4.pdf" }
      ]
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/nba');
        setNbaData(response.data[0]);
      } catch (error) {
        console.error("Error fetching NBA Data", error);
      }
    };
    fetchData();
  }, []);

  const handleDeptClick = (dept) => {
    setSelectedDept(dept);
    setSelectedYear(null);
  };

  const handleYearClick = (year) => {
    setSelectedYear(year);
  };

  const getPdfPath = () => {
    if (!selectedDept || !selectedYear || !nbaData) return null;
    const deptIndex = nbaData.DEPT.indexOf(selectedDept);
    if (deptIndex === -1) return null;
    const yearIndex = nbaData.year[deptIndex].indexOf(selectedYear);
    if (yearIndex === -1) return null;
    return nbaData.PDF_Path[deptIndex][yearIndex];
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
                <th>S.no</th>
                <th>Programs</th>
                <th>Validity Years</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.department}</td>
                  <td>
                    {item.pdfs.map((pdf, index) => (
                      <li key={index} className="pdf-link">
                        <a href={pdf.link} target="_blank" rel="noopener noreferrer">
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