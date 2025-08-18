import { React, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Banner from "../../Banner";
import SideNav from "../../Second_Nav_Bar/SideNav";
import "./AbtYr.css";
import axios from "axios";

const AbtYear = ({ toggle, theme }) => {
  const navigate = useNavigate();
  const [section, setAbtyear] = useState("2021-2022");
  const [aboutYearData, setAboutYearData] = useState([]);


    const BASE_URL = process.env.REACT_APP_BASE_URL;
    const UrlParser = (path) => {
        return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };
    
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("/api/main-backend/about_us", {
          type: "AISHE",
        });

        const data = response.data.data;
        setAboutYearData(data);
      } catch (error) {
        console.error("Error fetching about us data", error);
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
        }
      }
    };

    fetchData();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.body.scrollTo({ top: 0, behavior: "smooth" });
    document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
  }, [navigate]);

  const openInNewTab = (url) => {
    if (url) {
      window.open(UrlParser(url), "_blank");
    }
  };

  // Dynamically render year content
  const renderYearContent = (selectedYear) => {
    const yearData = aboutYearData.find((item) => item.year === selectedYear);

    if (!yearData) {
      return <p style={{ textAlign: "center" }}>No data available for {selectedYear}</p>;
    }
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1 className="yr-title">{yearData.year}</h1>
        <div className="btn-yr text-black">
          {yearData.content.map((entry, index) => (
            <button
              className="button-yr "
              key={index}
              onClick={() => openInNewTab(entry.pdf_path)}
            >
              {entry.name}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const navData = {
    "2021-2022": renderYearContent("2021-2022"),
    "2022-2023": renderYearContent("2022-2023"),
    "2023-2024": renderYearContent("2023-2024")
  };

  return (
    <>
      <Banner
        theme={theme}
        toggle={toggle}
        backgroundImage="./Banners/aboutvec.webp"
        headerText="AISHE"
        subHeaderText="A center for academic excellence and innovation, nurturing minds to create a brighter future through education and empowerment."
      />
      <SideNav
        navData={navData}
        sts={section}
        setSts={setAbtyear}
        backButton={true}
      />
    </>
  );
};

export default AbtYear;
