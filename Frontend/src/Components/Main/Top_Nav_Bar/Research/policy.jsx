import React, { useEffect, useState } from "react";
import axios from "axios";
import "./policy.css";
import Banner from "../../Banner";
import { useNavigate } from "react-router-dom";

export default function Policies({ theme, toggle }) {               
  const [policies, setPolicies] = useState(null);
  const navigate = useNavigate();
    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

    const handlePdfClick = (name) => {
    if (!name?.pdf_path || name.pdf_path.trim() === "") return;

    const url = UrlParser(name.pdf_path);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("/api/main-backend/research", {
          type: "Policy",
        });

        const data = response.data.data;
        setPolicies(data);
      } catch (error) {
        console.error("Error fetching Funded data", error);
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
        }
      }
    };
    fetchData();
  }, [navigate]);

    return (

            <>
            <Banner theme={theme} toggle={toggle}
                    backgroundImage="./Banners/researchbanner.webp"
                    headerText="Academic Research"
                    subHeaderText="Enrich Your Knowledge"
            />
        <div>
        <h1 className="research-academicresearch-title text-brwn dark:text-drkt dark:border-drks">
          Policy
        </h1>

        <div className="course-selection-container p-12">
          {policies?.map((name, index) => (
            <div
              key={index}
              className="px-4 py-3 font-semibold text-center rounded-xl bg-secd hover:bg-accn hover:text-prim dark:hover:bg-brwn cursor-pointer"
              onClick={() => handlePdfClick(name)}
            >
              {name?.name}
            </div>
          ))}
        </div>
      </div>
            </>
    );
}
