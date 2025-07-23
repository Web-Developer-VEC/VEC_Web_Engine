import {TfiControlBackward, TfiControlForward, TfiControlPause, TfiControlPlay} from "react-icons/tfi";
import {useEffect, useState, useRef, act} from "react"
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
        return (<div className="naac-info-panel border-l-4 border-secd dark:border-drks dark:bg-drkb iic-box">
        <h1 className="text-accn dark:text-drkt text-[32px]">Home</h1>
        <h2 className="text-[24px] text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1 naac-about">About IIC</h2>
        <p className="text-text dark:text-drkt">
           {data?.aboutiic[0]}
            <br/>
            {data?.aboutiic[1]}
        </p>
    </div>);
}


function IicEst({data}) {
    console.log("esta",data)
    
    return (<div className="about-section">
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

    </div>);
}

function IicEco({data}) {
    return (<div className="mb-10">
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
    </div>);
}

function IicCon({iicData}) {
    return (
       <>
       {
       iicData?( <h1 className="text-accn text-4xl">Contacts</h1>):( <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
                    <LoadComp />
                </div>)
       }
       </>
    );
}

const Iic = ({toggle, theme}) => {
    const leftCardsRef = useRef([])
    const rightCardsRef = useRef([])
    const intervalRef = useRef(null);
    const [iicData, setIicData] = useState(null)
    console.log(iicData)
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
    const [iic, setIic] = useState(Object.keys(navData)[0])

    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const UrlParser = (path) => {
        return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };

    const [selectedYear, setSelectedYear] = useState("Certificate")
    const [selectedAction, setSelectedAction] = useState(null)
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

    // Update the image gallery
    const imageLeft = iicData?.imagepath?.slice(0, 6) || []
    const imageRight = iicData?.imagepath?.slice(6, 12) || []

    // Update certificate, events, and policy arrays


    const eventsOrganizedArray =
        iicData?.events?.year?.map((year, index) => ({
            year,
            path: UrlParser(iicData.events.pdfpath[index]),
        })) || []

    // Update members array
    const membersArray =
        iicData?.members?.faculty?.map((member) => ({
            name: member.name,
            image: UrlParser(member.imagepath),
            designation: member.designation,
            keyRole: member.role,
        })) || []

    const openPdf = (category, year) => {
        setSelectedAction({category, year})
    }

    const handleYearClick = (year) => {
        setSelectedYear(year)
        setSelectedAction(null)
    }



    function IicGal({issData}) {
        return (
            <>
            {issData ? ( 
                <div className="carousel-controls">
                <h1 className="text-accn text-4xl">Gallery</h1>
                <button
                    className={`carousel-button bg-secd dark:text-prim dark:bg-drks hover:bg-accn hover:text-prim dark:hover:bg-drka`}
                    // onClick={movePrev}
                >
                    <TfiControlBackward/>
                </button>
                {/* <button
                className={`carousel-button bg-secd dark:bg-drks hover:bg-accn hover:text-prim dark:hover:bg-drka ${isPlaying ? 'active' : ''}`}
                onClick={togglePlayPause}
              >
                {isPlaying ? <TfiControlPause /> : <TfiControlPlay />}
              </button> */}
                <button
                    className={`carousel-button bg-secd dark:bg-drks dark:text-prim hover:bg-accn hover:text-prim dark:hover:bg-drka`}
                    // onClick={moveNext}
                >
                    <TfiControlForward/>
                </button>
            </div> ):(<div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
                    <LoadComp />
                </div>)}
        
            </>
        );
    }

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