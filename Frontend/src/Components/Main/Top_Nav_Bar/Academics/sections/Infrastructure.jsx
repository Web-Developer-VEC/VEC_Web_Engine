import React, { useState } from "react";
import "./infrastructure.css";
import LoadComp from "../../../LoadComp";

const Infrastructure = ({ data }) => {

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${BASE_URL}${path}`;
  };

  const [selectedCard, setSelectedCard] = useState(null);
  const infrastructure_images = data?.find((item) => item.category === "infrastructure_images")?.content || [];


  const handleCardClick = (index) => {
    setSelectedCard(selectedCard === index ? null : index);
  };

  return (
    <div>
      {infrastructure_images?.length > 0 ? (
        <>
          <section className="infra">
            <h1 className="infra-head text-accn dark:text-drkt font-bold border-x-4 border-[#FFD700] rounded-md dark:border-drks">Infrastructure</h1>
          </section>

          <main className="page-content">
            {infrastructure_images?.map((card, index) => {

              const imageUrl = UrlParser(card?.image_path); 
              return (
                <div
                  key={index}
                  className={`card_infa ${selectedCard === index ? "active" : ""}`}
                  style={{
                    backgroundImage: imageUrl ? `url("${imageUrl}")` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  onClick={() => handleCardClick(index)}
                >
                  <div className="content">
                    <h1 className="infra_title">{card?.image_name}</h1>
                  </div>
                </div>
              );
            })}
          </main>
        </>
      ) : (
        <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
        </div>
      )}
    </div>
  );
};

export default Infrastructure;
