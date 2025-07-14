import React, { useEffect, useState } from 'react';
import "./NBA_F.css";
import axios from 'axios';
import LoadComp from '../../LoadComp';

const NBA_F = () => {
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

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      return () => {
       window.removeEventListener("online", handleOnline);
       window.removeEventListener("offline", handleOffline);
       };
    },[]);
   if (!isOnline) {
        return (
          <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
            <LoadComp txt={"You are offline"} />
          </div>
     );
  }

  return (
    <>

    {!data ? (
    <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
        </div>
    ): (



      <div className="nba-page">
        <div className="nba-tiles">
          <div className="nba-tile-container">
            <div className="nba-tile border-l-4 border-secd dark:border-drks rounded-lg dark:bg-drkb">
              <div className="tile-tail"></div>
              <h3 className="nba-tile-header text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1">ABOUT NBA</h3>
              <p className="nba-tile-text text-text dark:text-drkt">
                The National Board of Accreditation (NBA) is an autonomous body established by the All India Council for Technical Education (AICTE) under the Ministry of Education, Government of India. NBA is responsible for evaluating the quality of technical and professional education programs.
              </p>
            </div>
            <div className="nba-tile border-l-4 border-secd dark:border-drks rounded-lg dark:bg-drkb">
              <div className="tile-tail"></div>
              <h3 className="nba-tile-header text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1">Purpose of NBA Accreditation</h3>
              <p className="nba-tile-text text-text dark:text-drkt">
                The primary goal of NBA accreditation is to assess and ensure that academic programs meet predefined quality standards, thereby promoting continuous improvement in educational institutions.
              </p>
            </div>
          </div>
        </div>
        <div className="table-data px-4 md:px-12 lg:px-24">
        <div className="overflow-x-auto border rounded-lg shadow-md">
          <table className=" w-[1000px] department-table">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2 text-text">S.No</th>
                <th className="text-left px-4 py-2 text-text">Programs</th>
                <th className="text-left px-4 py-2 text-text">Validity Years</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-2">{item.id}</td>
                  <td className="px-4 py-2">{item.department}</td>
                  <td className="px-4 py-2">
                    <ul className="list-disc list-inside">
                      {item.pdfs.map((pdf, index) => (
                        <li key={index}>
                          <a
                            href={`${UrlParser(pdf.pdfs_path)}#toolbar=0`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brwn dark:text-drka no-underline"
                          >
                            {pdf.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      </div>
  )}
    </>
  );
};

export default NBA_F; 