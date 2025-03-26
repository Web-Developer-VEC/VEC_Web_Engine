import React, { useState } from "react";
import "./infrastructure.css";
import LoadComp from "../../../LoadComp";

const Infrastructure = ({ data }) => {

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const [selectedCard, setSelectedCard] = useState(null);

  const handleCardClick = (index) => {
    setSelectedCard(selectedCard === index ? null : index);
  };

  return (
    <div>
      {data?.infrastructure_images?.length > 0 ? (
        <>
          <section className="infra">
            <h1 className="infra-head text-accn dark:text-drka border-x-4 border-accn dark:border-drka">Infrastructure</h1>
          </section> 

          <main className="page-content">
            {data?.infrastructure_images?.map((card, index) => (
              <div
                key={index}
                className={`card_infa ${selectedCard === index ? "active" : ""}`}
                style={{
                  backgroundImage: `url(${UrlParser(card.image_path)})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                onClick={() => handleCardClick(index)}
              >
                <div className="content">
                  <h1 className="infra_title">{card.image_name}</h1>
                  <p className="copy">{card.image_content}</p>
                </div>
              </div>
            ))}
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
