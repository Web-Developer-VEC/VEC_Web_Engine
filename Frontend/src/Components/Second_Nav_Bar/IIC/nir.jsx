import LoadComp from "../../LoadComp";

export default function IicFacnir({ data }) {
  console.log("NIR Data:", data);

    // Update NIR sections
    const nirSectionsArray = [
        {
            heading: "Registration Statistics",
            buttons:
                data["Registration Statistics"]?.name?.map((name, index) => ({
                    text: `${name}: ${data["Registration Statistics"].count[index]}`,
                })) || [],
        },
        {
            heading: "Innovation Metrics",
            buttons:
                data["Innovation Metrics"]?.name?.map((name, index) => ({
                    text: `${name}: ${data["Innovation Metrics"].count[index]}`,
                })) || [],
        },
        {
            heading: "Impact Assessment",
            buttons:
                data["Impact Assessment"]?.name?.map((name, index) => ({
                    text: `${name}: ${data["Impact Assessment"].count[index]}`,
                })) || [],
        },
    ]

    const renderNIRContent = () => {
        return (
            <div className="nir-container">
                <h2 className="text-4xl text-brwn font-bold text-center">Yukthi National Innovation Repository (NIR)</h2>
                {nirSectionsArray.map((section, index) => (
                    <div key={index} className="nir-section">
                        <h3 className="nir-heading">{section.heading}</h3>
                        <div className="nir-buttons">
                            {section.buttons.map((button, btnIndex) => (
                                <div key={btnIndex} className="iic-action-button bg-secd text-center m-auto dark:bg-drks hover:bg-accn hover:text-prim
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
      {data ? (
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