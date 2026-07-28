import { useState } from "react";
import LoadComp from "../../LoadComp";

export default function IicFacCertificate({ data }) {
  const [selectedAction, setSelectedAction] = useState(null)
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };
  const openPdf = (category, name) => {
    setSelectedAction({ category, name })
  }


  const certificateArray = Array.isArray(data) ?
    data?.map((name, index) => ({
      name: name?.year,
      path: UrlParser(name?.image_path),
    })) : []

  return (
    <>
      {data ? (
        <div className="nirf-content mt-12">
          <h2 className="text-accn dark:text-drkt text-center text-4xl mb-4 font-bold">
            IIC Certificate
          </h2>
          <div className="nirf-details dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] height">



            {/* Certificate Buttons */}
            <div className="flex flex-wrap justify-center gap-8 my-10">
              {certificateArray.map((action, index) => {
                const isActive =
                  selectedAction &&
                  selectedAction.category === "Certificate" &&
                  selectedAction.name === action.name;
                return (
                  <div
                    key={index}
                    onClick={() => openPdf("Certificate", action.name)}
                    className={`w-52 h-16 rounded-xl flex items-center justify-center cursor-pointer font-bold text-lg shadow-lg transition-all duration-300 hover:-translate-y-1
                    ${isActive
                        ? "bg-[#800000] text-white"
                        : "bg-[#FDCC03] text-black hover:bg-[#800000] hover:text-white"
                      }
                  `}
                  >
                    {action.name}
                  </div>
                );
              })}
            </div>
            {/* PDF Viewer */}
            {selectedAction && selectedAction.category === "Certificate" && (
              <div className="border p-8 mt-20 w-[94%] mx-auto bg-prim dark:bg-drkp shadow-lg">
                <h3 className="text-center mb-2">
                  Viewing: {selectedAction.name}
                </h3>

                <embed
                  className="embed"
                  src={
                    certificateArray.find(
                      (item) => item.name === selectedAction.name
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
  )
};