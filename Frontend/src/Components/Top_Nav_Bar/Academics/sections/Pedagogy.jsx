import React, { useState } from "react";

const Pedagogy = ({ data }) => {
  const [activeYear, setActiveYear] = useState(null);
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const pedagogyCategory = data.find(
    (item) => item.category === "Pedagogy Initiatives"
  );
  const pedagogyContent = pedagogyCategory ? pedagogyCategory.content : [];

  const handleYearClick = (year) => {
    setActiveYear(activeYear === year ? null : year); // toggle active year
  };

  const handlePdfClick = (pdfPath) => {
    if (pdfPath) {
      window.open(UrlParser(pdfPath), "_blank");
    }
  };

  // ✅ These two lines were missing:
  const activeContent =
    pedagogyContent.find((item) => item.year === activeYear)?.content || [];
  const isOdd = activeContent.length % 2 === 1;

  return (
    <>
      {pedagogyContent?.length > 0 ? (
        <div className="p-6 mt-4 pb-10">
          {/* Year buttons */}
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            {pedagogyContent.map((yearItem) => (
              <button
                key={yearItem.year}
                type="button"
                onClick={() => handleYearClick(yearItem.year)}
                className={`px-6 py-3  font-semibold rounded-xl transition-all hover:text-prim
                  ${
                    activeYear === yearItem.year
                      ? "bg-[#800000] text-prim"
                      : "bg-[#fdcc03] text-text"
                  }
                  hover:bg-[#800000] hover:text-white`}
              >
                {yearItem.year}
              </button>
            ))}
          </div>

          {/* PDF Buttons */}
          {activeYear && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 place-items-center">
              {activeContent.map((pdfItem, idx) => (
                <div
                  key={idx}
                  className={`w-full ${
                    isOdd && idx === activeContent.length - 1
                      ? "col-span-2 flex justify-center"
                      : ""
                  }`}
                >
                  <button
                    onClick={() => handlePdfClick(pdfItem.pdf_path)}
                    className="w-[500px] h-[70px] px-5 py-2 rounded-md bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim transition-all text-center flex items-center justify-center text-sm"
                  >
                    {pdfItem.name}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          {/* Optionally add a loader or fallback message here */}
        </div>
      )}
    </>
  );
};

export default Pedagogy;

