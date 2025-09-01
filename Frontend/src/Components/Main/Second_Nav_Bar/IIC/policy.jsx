import { useState } from "react";
import LoadComp from "../../LoadComp";

export default function IicFacPolicy({ data }) {
    const [selectedAction, setSelectedAction] = useState(null)
        const openPdf = (category, year) => {
        setSelectedAction({category, year})
    }
        const BASE_URL = process.env.REACT_APP_BASE_URL;

    const UrlParser = (path) => {
        return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };


    const policyArray = Array.isArray(data) ? 
        data?.map((name, index) => ({
        year: name?.name,
        path: UrlParser(name?.path),
    })) : []

  return (
    <>
      {data ? (
        <div className="nirf-content mt-12">
          <h1 className="text-accn dark:text-drkt text-4xl mb-4 font-bold">Policy</h1>
          <div className="nirf-details dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] height">
            <div className="nirf-year-actions flex flex-col mb-20 md:grid md:grid-cols-2 md:gap-8 md:gap-x-16 md:p-4 md:w-fit md:mx-auto">
              {policyArray.map((action, index) => {
                const isActive =
                  selectedAction &&
                  selectedAction.category === "Policy" &&
                  selectedAction.year === action.year;

                return (
                  <button
                    key={index}
                    className={`px-6 py-3  font-semibold rounded-xl nirf-action-button cursor-pointer w-100
                      ${isActive ? "bg-[#800000] text-white" : "bg-secd dark:bg-drks hover:bg-accn hover:text-prim dark:hover:bg-cewn"}
                    `}
                   onClick={() => {
                   
                    openPdf("Policy", action.year);
                  }}
                  >
                    {action.year}
                  </button>
                );
              })}
            </div>

            {selectedAction && selectedAction.category === "Policy" && (
              <div className="border p-8 mt-10 w-[94%] mx-auto bg-prim dark:bg-drkp shadow-lg" id="policyPdfViewer">
                <h3 className="text-text dark:text-prim text-center mb-2">{`Viewing: ${selectedAction.year}`}</h3>
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