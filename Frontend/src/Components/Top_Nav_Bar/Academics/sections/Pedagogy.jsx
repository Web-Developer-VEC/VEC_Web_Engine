import axios from "axios";
import { React, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Pedagogy = ({data}) => {
  const [activeButtonName, setActiveButtonName] = useState(null);
  const [pedagogyData, setPedagogyData] = useState([]);
  const BASE_URL = process.env.REACT_APP_BASE_URL;


  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const handleButtonClick = (pdfItem) => {
    setActiveButtonName(pdfItem.name);
    if (pdfItem.pdf_path) {
      window.open(UrlParser(pdfItem.pdf_path), '_blank');
    }
  };
  console.log(data);
  
  // Get the "Pedagogy Initiatives" content
  const pedagogyCategory = data.find(item => item.category === "Pedagogy Initiatives");
  const pedagogyContent = pedagogyCategory ? pedagogyCategory.content : [];

  return (
    <>
      {data?.length > 0 ? (
        <div className="p-6 mt-4 pb-10">
          <div className="flex flex-col md:flex-row justify-center gap-8 mb-6">
            {pedagogyContent?.map((item, index) => (
              <button
                key={item.name || index}
                type="button"
                onClick={() => handleButtonClick(item)}
                className={`px-6 py-3 font-semibold rounded-xl hover:text-white transition-all
                  ${activeButtonName === item?.name ?"bg-[#800000] text-white" : "bg-secd dark:bg-drks"
      } 
                   hover:bg-[#a00000]`}
                disabled={!item.pdf_path}
              >
                {item?.name}
              </button>
            ))}
          </div>

          {!activeButtonName && (
            <div className="text-center text-gray-700 dark:text-gray-300 mt-20">
              {/* Click a button to open the Pedagogy PDF. */}
            </div>
          )}
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          {/* You can show a loading component here */}
        </div>
      )}
    </>
  );
};

export default Pedagogy;
