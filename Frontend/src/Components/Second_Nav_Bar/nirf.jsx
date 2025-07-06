import React, { useEffect, useState } from "react";
import "./nirf.css"; // Importing the CSS file
import Banner from "../Banner";
import axios from "axios";
import LoadComp from "../LoadComp";

const NIRF = ({ toggle, theme, isLoading }) => {
  const [nirfData, setNirfData] = useState(null);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/nirf");
        const transformedData = transformFetchedData(response.data);
        setNirfData(transformedData);
      } catch (error) {
        console.error("Error fetching NIRF data:", error);
      }
    };

    fetchData();
  }, []);

  const transformFetchedData = (fetchedData) => {
    if (!fetchedData || fetchedData.length === 0) return [];

    const { year, content, "pdf path": pdfPaths } = fetchedData[0];

    return year.map((yr, index) => ({
      year: yr.toString(),
      categories: content[index].map((category, catIndex) => ({
        name: category,
        link: pdfPaths[index][catIndex], // Use the corresponding PDF path as the link
      })),
    }));
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
    }, []);

    if (!isOnline) {
        return (
          <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
            <LoadComp txt={"You are offline"} />
          </div>
        );
    }

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
        headerText="NIRF"
        subHeaderText="The NIRF is a comprehensive ranking system launched by the Ministry of Education, Government of India, in 2015."
      />
      <div className="nirf-page">
        {isLoading && (
          <div className="loading-screen">
            <div className="spinner"></div>
            Loading...
          </div>
        )}
        <div className="nirf-intro ">
          <h1 className="nirf-header ">
            NATIONAL INSTITUTIONAL RANKING FRAMEWORK (NIRF)
          </h1>
          <p>
            The NIRF is a comprehensive ranking system launched by the Ministry
            of Education, Government of India, in 2015. It provides a structured
            methodology to rank higher education institutions across India based
            on various objective and subjective criteria. The ranking is
            released annually, aiming to promote a competitive spirit among
            institutions and enhance transparency in education standards.
          </p>
        </div>
        <h2 className="nirf-title">NATIONAL INSTITUTIONAL RANKING FRAMEWORK</h2>
        <div className="nirf-grid">
          {nirfData?.reverse().map((item, index) => (
            <div key={index} className="nirf-year">
              <h3>NIRF {item.year}</h3>
              {item.categories.map((category, catIndex) => (
                <a
                  key={catIndex}
                  href={`${UrlParser(category.link)}#toolbar=0`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nirf-link"
                >
                  {category.name}
                </a>
              ))}
            </div>
          ))}
        </div>
        <p className="nirf-footer">
          Comments and suggestions are invited from the public to provide
          feedback through 
          <a href="mailto:feedback.nirf@velammal.edu.in" className="nirf-email"> feedback.nirf@velammal.edu.in
          </a>
        </p>
      </div>
    </>
  );
};

export default NIRF;