import React, { useState, useEffect } from "react";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RankHonder = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [rankholderData, setRankHolderData] = useState(null);
  const navigate = useNavigate();

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("/api/main-backend/exam", {
          type: "rankholder",
        });
        setRankHolderData(response.data.data);
      } catch (error) {
        console.error("Error Fetching Rankholder data:", error);
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
        }
      }
    };

    fetchData();
  }, [navigate]);

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
  };

  if (!Array.isArray(rankholderData)) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <div className="p-6 mt-4 pb-10 w-full min-h-[100vh]">
      <h2 className="basis-full text-center text-[24px] text-brwn dark:text-drkt mb-4 title">
        Rank list UG & PG
      </h2>

      <div className="flex flex-col md:flex-row justify-center gap-6 mb-8 flex-wrap">
        {rankholderData.map((cat, index) => (
          <button
            key={index}
            onClick={() => handleCategoryClick(cat)}
            className={`px-6 py-3 font-semibold rounded-xl hover:text-white transition-all ${
              activeCategory?.category === cat.category
                ? "bg-[#800000] text-white"
                : "bg-secd dark:bg-drks text-text dark:text-prim"
            } hover:bg-[#a00000]`}
          >
            {cat.category}
          </button>
        ))}
      </div>

      {activeCategory && (
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          {activeCategory.content.map((item, idx) => (
            item.pdf_path ? (
              <div
                key={idx}
                className="border p-6 mt-6 w-[81%] mx-auto bg-prim dark:bg-drkp shadow-lg"
              >
                <h3 className="text-xl font-bold mb-4 text-center text-text dark:text-prim">
                  {item.name}
                </h3>
                <embed
                  src={`${UrlParser(item.pdf_path)}#toolbar=0`}
                  type="application/pdf"
                  width="100%"
                  height="600px"
                  className="border"
                />
              </div>
            ) : null
          ))}
        </div>
      )}
    </div>
  );
};

export default RankHonder;