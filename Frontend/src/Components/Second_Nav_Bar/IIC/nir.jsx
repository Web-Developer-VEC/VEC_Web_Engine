import LoadComp from "../../LoadComp";

export default function IicFacnir({ iicData }) {

    // Update NIR sections
    const nirSectionsArray = [
        {
            heading: "Registration Statistics",
            buttons:
                iicData?.NIR?.["Registration Statistics"]?.name?.map((name, index) => ({
                    text: `${name}: ${iicData.NIR["Registration Statistics"].count[index]}`,
                    path: `/pdfs/${name.replace(/\s+/g, "-")}.pdf`,
                })) || [],
        },
        {
            heading: "Innovation Metrics",
            buttons:
                iicData?.NIR?.["Innovation Metrics"]?.name?.map((name, index) => ({
                    text: `${name}: ${iicData.NIR["Innovation Metrics"].count[index]}`,
                    path: `/pdfs/${name.replace(/\s+/g, "-")}.pdf`,
                })) || [],
        },
        {
            heading: "Impact Assessment",
            buttons:
                iicData?.NIR?.["Impact Assessment"]?.name?.map((name, index) => ({
                    text: `${name}: ${iicData.NIR["Impact Assessment"].count[index]}`,
                    path: `/pdfs/${name.replace(/\s+/g, "-")}.pdf`,
                })) || [],
        },
    ]

    const renderNIRContent = () => {
        return (
            <div className="nir-container">
                <h2>National Innovation Repository (NIR)</h2>
                {nirSectionsArray.map((section, index) => (
                    <div key={index} className="nir-section">
                        <h3 className="nir-heading">{section.heading}</h3>
                        <div className="nir-buttons">
                            {section.buttons.map((button, btnIndex) => (
                                <div key={btnIndex} className="iic-action-button bg-secd dark:bg-drks hover:bg-accn hover:text-prim
                    dark:hover:bg-brwn rounded-xl border-2 border-accn dark:border-drka">
                                    {button.text}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

  return (
    <>
      {iicData ? (
        <div className="nirf-content mt-4">
        

          <div className="nirf-details dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] height">
            <div>
              {renderNIRContent()}
            </div>
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