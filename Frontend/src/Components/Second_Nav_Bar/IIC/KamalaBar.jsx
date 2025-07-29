import React, { useState } from "react";
import LoadComp from "../../LoadComp";

const KapilaPage = ({data}) => {
  const [activePdf, setActivePdf] = useState(null);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

    const UrlParser = (path) => {
        return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };

  const handleButtonClick = (pdfKey) => {
    setActivePdf(pdfKey);
  };

  if (!Array.isArray(data)) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }
  
  return (
    <>
      {data ? (
        <div className="p-6 mt-4 pb-10">
          {/* Horizontal Button Group */}
          <div className="flex flex-col md:flex-row justify-center gap-8 mb-6">
            {Array.isArray(data) && data?.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleButtonClick(key)}
                className={`px-6 py-3 font-semibold rounded-xl hover:text-white transition-all
                  ${activePdf?.name === key?.name ? "bg-[#800000] text-white" : "bg-secd dark:bg-drks"}
                  hover:bg-[#a00000]`}
              >
                {key?.name}
              </button>
            ))}
          </div>

          {/* Show PDF on click */}
          {activePdf && (
            <div className="border p-8 mt-20 w-[94%] mx-auto bg-prim dark:bg-drkp shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-center text-text dark:text-prim">
                {activePdf?.name}
              </h3>
              <embed
                src={UrlParser(activePdf?.pdf_path)}
                type="application/pdf"
                width="100%"
                height="600px"
                className="border"
              />

            </div>
          )}
        </div>
      ) : (
        <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
        </div>
      )}
    </>
  );
};

export default KapilaPage;
