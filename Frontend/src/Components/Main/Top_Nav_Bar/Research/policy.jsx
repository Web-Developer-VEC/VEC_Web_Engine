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
      <div className="w-full px-6 md:px-12 py-10">
        <h1 className="text-4xl font-bold text-center text-brwn dark:text-drkt mb-10">
          Policies
        </h1>

        <div className="flex flex-wrap justify-center gap-5">
          {policies?.map((policy, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handlePdfClick(policy)}
              className="bg-secd hover:bg-accn dark:hover:bg-brwn hover:text-prim font-semibold rounded-xl px-8 py-4 transition-all duration-300 whitespace-nowrap shadow-md"
            >
              {policy.name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
