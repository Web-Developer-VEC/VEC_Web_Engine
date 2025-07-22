import React, { useState } from "react";

const KapilaPage = ({data}) => {
  const [activePdf, setActivePdf] = useState(null);
  console.log("Kapila",data);
  

  const BASE_URL = process.env.REACT_APP_BASE_URL;

    const UrlParser = (path) => {
        return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };

  const handleButtonClick = (pdfKey) => {
    setActivePdf(pdfKey);
  };
  
  return (
    <div className="p-6 mt-4 pb-10">
      {/* Horizontal Button Group */}
      <div className="flex justify-center  gap-8 mb-6">
        {Object.keys(data).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => handleButtonClick(key)}
            className={`px-6 py-3 font-semibold rounded-xl hover:text-white ${
              activePdf === key ? "bg-[#800000] text-white" : "bg-[#fdcc03] "
            } hover:bg-[#a00000] transition-all`}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Show PDF on click */}
      {activePdf && (
        <div className="border p-8 mt-20 w-[94%] mx-auto bg-white shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-center">
            {activePdf}
          </h3>
          <embed
            src={UrlParser(data[activePdf])}
            type="application/pdf"
            width="100%"
            height="600px"
            className="border"
          />

        </div>
      )}
    </div>
  );
};

export default KapilaPage;
