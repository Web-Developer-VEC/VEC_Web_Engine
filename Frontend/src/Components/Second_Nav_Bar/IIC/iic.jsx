import {TfiControlBackward, TfiControlForward} from "react-icons/tfi";
import {useEffect, useState, useRef} from "react"
import axios from "axios"
import "./iic.css"
import Banner from "../../Banner"
import SideNav from "../SideNav";
import LoadComp from "../../LoadComp";
import IICMentee from "./IICMentee";
import {IICStudent,IICFaculty,IICExpert} from './IICFaculty'
import KamalaBar from './KamalaBar'
import IICContact from "./IICContect";
import IicFacEvent from "./event";
import IicFacPolicy from "./policy";
import IicFacCertificate from "./certificates";
import IicFacnir from "./nir";


function IicHome({data}) {
    return (
        <>
            {data ? (
                <div className="naac-info-panel border-l-4 border-secd dark:border-drks dark:bg-drkb iic-box">
                    <h1 className="text-accn dark:text-drkt text-[32px]">Home</h1>
                    <h2 className="text-[24px] text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1 naac-about">About IIC</h2>
                    <p className="text-text dark:text-drkt">
                    {data?.aboutiic[0]}
                        <br/>
                        {data?.aboutiic[1]}
                    </p>
                </div>
            ): (
                <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
                    <LoadComp />
                </div>
            )}
        </>
    );
}


function IicEst({data}) {
    return (
        <>
            {data ? (
                <div className="about-section">
                    <div><h1 className="text-brwn dark:text-drkt text-4xl font-bold text-center">Establishment of IIC</h1></div>

                    <div className="naac-info-panel border-l-4 border-secd dark:border-drks dark:bg-drkb">
                        <h2 className="text-[30px] text-brwn dark:text-drkt iic-establishment border-b-2 border-secd dark:border-drks pb-1">Major Focus of IIC</h2>
                        <p>
                            <br/>• {data?.majorfocus[0]}
                            <br/>• {data?.majorfocus[1]}
                            <br/>• {data?.majorfocus[2]}
                            <br/>
                        </p>
                    </div>

                <div className="flex flex-col lg:flex-row justify-between gap-6">
                        {/* Left Panel */}
                        <div className="iqac-info-panel border-l-4 border-secd dark:border-drks w-full lg:w-1/2 dark:bg-drkb">
                            <h2 className="text-[30px] text-brwn dark:text-drkt iic-establishment border-b-2 border-secd dark:border-drks pb-1">Vision</h2>
                            <p>
                            {data?.vission[0]}
                            </p>
                        </div>

                        {/* Right Panel */}
                        <div className="iqac-info-panel border-l-4 border-secd dark:border-drks w-full lg:w-1/2 dark:bg-drkb">
                            <h2 className="text-[30px] iic-establishment border-b-2 border-secd dark:border-drks pb-1 text-brwn dark:text-drkt">Mission</h2>
                            <p>
                                {data?.mission[0]}
                            </p>
                        </div>
                    </div>
                    <div>
                        <IicEco data={data?.function}/>
                    </div>
                </div>
            ) : (
                <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
                    <LoadComp />
                </div>
            )}
        </>
    );
}

function IicEco({data}) {
    return (
        <>
            {data ? (
                <div className="mb-10">
                    <div className="card-plc functions-info-panel border-l-4 border-secd dark:border-drks dark:bg-drkb">
                        <h1 className="text-accn dark:text-drkt text-4xl">I & E Ecosystem</h1>
                        <h2 className="text-[30px] iic-eco">Functions of IIC</h2>
                        <p>
                            <br/>• {data[0]}
                            <br/>• {data[1]}
                            <br/>• {data[2]}
                            <br/>• {data[3]}
                            <br/>• {data[4]}
                            <br/>• {data[5]}
                            <br/>
                        </p>
                    </div>
                </div>
            ) : (
                <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
                    <LoadComp />
                </div>
            )}
        </>
    );
}

const Iic = ({toggle, theme}) => {
    const [iicData, setIicData] = useState(null)
    const navData = {
        "Home": <IicHome data={iicData?.home}/>,
        "Establishment of IIC": <IicEst data={iicData?.establishment}/>,
        "Council": {
            "Faculty": <IICFaculty data={iicData?.Council.Faculty}/>,  
            "Expert Representation": <IICExpert data={iicData?.Council.Expert_Representation}/>,    
            "Student Representation": <IICStudent data={iicData?.Council.Student_Representation}/>   
        },

        "Event Organized": {
            "IIC 3.0": <IicFacEvent title={"IIC 3.0"} data={iicData?.Events["IIC 0.3"]}/>,  
            "IIC 4.0": <IicFacEvent title={"IIC 4.0"} data={iicData?.Events["IIC 0.4"]}/>,  
            "IIC 5.0": <IicFacEvent title={"IIC 5.0"} data={iicData?.Events["IIC 0.5"]}/>,
            'IIC 6.0': <IicFacEvent title={"IIC 6.0"} data={iicData?.Events["IIC 0.6"]}/>,
            'IIC 7.0' : < IicFacEvent title={"IIC 7.0"} data={iicData?.Events["IIC 0.7"]}/>
        },
        "Kapila": <KamalaBar data={iicData?.kapila_bar} />, 
        "Mentee Institution ":   <IICMentee data={iicData?.mentee}/>,
        "Yukti" : <IicFacnir data={iicData?.yukti}/>,
        "Certificate":<IicFacCertificate data={iicData?.certificate}/>,
        "Policy" : <IicFacPolicy data={iicData?.policy}/>,
        "Contact": <IICContact data={iicData?.contact}/>, 
    }   
    const [iic, setIic] = useState(Object.keys(navData)[0]);
    const [isLoading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`/api/iic`)
                setIicData(response.data)
                setLoading(false)
            } catch (error) {
                console.error("Error fetching data:", error.message)
                setLoading(true)
            }
        }
        fetchData()
    }, []);

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
          window.removeEventListener("online", handleOnline);
          window.removeEventListener("offline", handleOffline);
      };
    }, []);

    if (!isOnline) {
        return (
          <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
            <LoadComp txt={"You are offline"} />
          </div>
        );
    }
    return (
      <div className="nirf-page">
          <Banner toggle={toggle} theme={theme}
              backgroundImage="./Banners/IIC.webp"            
              headerText="IIC"
              subHeaderText="Instituition's Innovation Council"
          />

          {isLoading ? (
              <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
                <LoadComp />
              </div>
          ) : (
              <SideNav sts={iic} setSts={setIic} navData={navData} />
          )}
          
      </div>
    )
}

export default Iic