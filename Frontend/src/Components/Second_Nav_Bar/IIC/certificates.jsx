import { useState } from "react";
import LoadComp from "../../LoadComp";

export default function IicFacCertificate({data}) {
  console.log("Certificate Data:", data);
    const [selectedAction, setSelectedAction] = useState(null)
        const BASE_URL = process.env.REACT_APP_BASE_URL;

    const UrlParser = (path) => {
        return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };
        const openPdf = (category, name) => {
        setSelectedAction({category, name})
    }
    

    const certificateArray =
    data?.names?.map((name, index) => ({
        name,
        path: UrlParser(data?.image_path[index]),
    })) || []

    console.log("Certificate Array:", certificateArray);
    
  return (
    <>
      {data ? (
        <div className="nirf-content mt-4">
          <h1 className="text-accn text-4xl mb-4">Faculty - Certificate</h1>

          <div className="nirf-details dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] height">
            <div className="nirf-year-actions faculty-icc">
              {certificateArray.map((action, index) => {
                const isActive =
                  selectedAction &&
                  selectedAction.category === "Certificate" &&
                  selectedAction.name === action.name;

                return (
                  <div
                    key={index}
                    className={`text-[10px] nirf-action-button hover:bg-accn hover:text-prim dark:hover:bg-drka
                      ${
                        isActive
                          ? "bg-[#800000] text-white"
                          : "bg-secd dark:bg-drks"
                      }`}
                    onClick={() => openPdf("Certificate", action.name)}
                  >
                    {action.name}
                  </div>
                );
              })}
            </div>

            {selectedAction && selectedAction.category === "Certificate" && (
              <div className="iic-pdf-container">
                <h3>{`Viewing: ${selectedAction.name}`}</h3>
                {/* <embed
                  className="embed"
                  src={
                    certificateArray.find(
                      (item) => item.name === selectedAction.name
                    )?.path
                  }
                  type="application/pdf"
                  width="100%"
                  height="600px"
                /> */}
                <img src={certificateArray.find(
                      (item) => item.name === selectedAction.name
                    )?.path} alt="" />
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