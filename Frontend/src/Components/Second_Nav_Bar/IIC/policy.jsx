import { useState } from "react";
import LoadComp from "../../LoadComp";

export default function IicFacPolicy({ iicData }) {
    const [selectedAction, setSelectedAction] = useState(null)
        const openPdf = (category, year) => {
        setSelectedAction({category, year})
    }
        const BASE_URL = process.env.REACT_APP_BASE_URL;

    const UrlParser = (path) => {
        return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };


    const policyArray =
        iicData?.policy?.name?.map((name, index) => ({
        year: name,
        path: UrlParser(iicData.policy.pdfpath[index]),
    })) || []

  //   function scrollToPDF() {
  //   document.getElementById("policyPdfViewer").scrollIntoView({ behavior: "smooth" });
  // }

  return (
    <>
      {iicData ? (
        <div className="nirf-content mt-4">
          <h1 className="text-accn text-4xl mb-4">Policy</h1>
          <div className="nirf-details dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] height">
            <div className="nirf-year-actions faculty-icc">
              {policyArray.map((action, index) => {
                const isActive =
                  selectedAction &&
                  selectedAction.category === "Policy" &&
                  selectedAction.year === action.year;

                return (
                  <button
                    key={index}
                    className={`px-6 py-3 font-semibold rounded-xl nirf-action-button cursor-pointer 
                      ${isActive ? "bg-[#800000] text-white" : "bg-secd dark:bg-drks hover:bg-accn hover:text-prim dark:hover:bg-drka"}
                    `}
                   onClick={() => {
                   
                    openPdf("Policy", action.year);
                    //  setTimeout(() => {
                    //   scrollToPDF();
                    // }, 300);
                  }}
                  >
                    {action.year}
                  </button>
                );
              })}
            </div>

            {selectedAction && selectedAction.category === "Policy" && (
              <div className="border p-8 mt-10 w-[94%] mx-auto bg-white shadow-lg" id="policyPdfViewer">
                <h3>{`Viewing: ${selectedAction.year}`}</h3>
                <embed
                  className="embed"
                  src={
                    policyArray.find(
                      (item) => item.year === selectedAction.year
                    )?.path
                  }
                  type="application/pdf"
                  width="100%"
                  height="600px"
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp />
        </div>
      )}
    </>
  );
}