import React, {useEffect, useState} from "react";
import "./NCC_ARMY.css";
import NCCACarousel from "./NCC_ARMY comps/NCCACarousel";
import axios from "axios";
import NCCAMembers from "./NCC_ARMY comps/NCCAMembers";
import SideNav from "../SideNav";
import AlumniSlider from "./NCC_ARMY comps/DisguishedAlumini";
import LoadComp from "../../LoadComp";
import logo from '../../Assets/NccArmy.png';
import Banner from "../../Banner";


function NCCAbout({data}) {
    return (
      <section
        className="NCC_ARMY-section bg-prim
                dark:bg-drkb
                border-l-4 border-[#FDB515] dark:border-drks px-6 mt-4"
      >
        <h2
          className="NCC_ARMY-section-title text-accn dark:text-drkt
            border-b-2 border-secd dark:border-drks w-fit"
        >
          About NCC
        </h2>
        <ul className="NCC_ARMY-list">
          {data?.map((item,i) => (
            <>
            {item?.about_us?.map((content,i) => (
              <li>
                {content}
              </li>
            ))}
            </>
          ))}
          
        </ul>
      </section>
    );
}

function NCCObjectives({data}) {
    return (
      <div className="NCC_ARMY-row mt-4">
        <section
          className="NCC_ARMY-section bg-prim
                dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-3"
        >
          <h2
            className="NCC_ARMY-section-title text-accn dark:text-drkt
              border-b-2 border-secd dark:border-drks w-fit"
          >
            Objectives of NCC
          </h2>
          <ul className="NCC_ARMY-list list-disc pl-5 ">
             {data?.map((item,i) => (
              <>
              {item?.objectives?.map((content,i) => (
                <li>
                  {content}
                </li>
              ))}
              </>
             ))}
          </ul>
        </section>
      </div>
    );
}

function NCCAim({data}) {
    return (
      <div
        className="NCC_ARMY-aim-container bg-prim
                dark:bg-drkb border-l-4 border-secd dark:border-drks px-6"
      >
        <div className="NCC_ARMY-aim">
          <h2 className="NCC_ARMY-heading text-accn dark:text-drkt border-b-2 border-secd dark:border-drks w-fit">
            <img
              src={logo}
              alt="NCC Logo"
              className="NCC_ARMY-icon"
            />
            AIM of NCC
          </h2>
          <p className="NCC_ARMY-aimcontent">
            {data?.map((item,i) => (
              <>
                {item?.aim?.map((content,i) => (
                  <li>
                    {content}
                  </li>
                ))}
              </>
            ))}
          </p>
        </div>
      </div>
    );
}

function NCCMotto({data}) {
    return (
      <div className="NCC_ARMY-motto-pledge-container">
        <div
          className="NCC_ARMY-motto bg-prim
                dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-6"
        >
          <h2 className="NCC_ARMY-heading text-accn dark:text-drkt border-b-2 border-secd dark:border-drks w-fit">
            MOTTO OF NCC
          </h2>
          <p className="NCC_ARMY-content-1 ">{Array.isArray(data) && data[0]?.motto}</p>
        </div>

        <div
          className="NCC_ARMY-pledge bg-prim
                dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-6"
        >
          <h2 className="NCC_ARMY-heading text-accn dark:text-drkt border-b-2 border-secd dark:border-drks w-fit">
            CARDINALS OF NCC
          </h2>
          <p className="NCC_ARMY-content">
            {data?.map((item,i) => (
              <>
                {item?.cardinals?.map((content,i) => (
                  <li>
                    {content}
                  </li>
                ))}
              </>
            ))}
          </p>
        </div>
      </div>
    );
}

function NCCPledge({data}) {
  return (
    <div className="NCC_ARMY-row mt-4">
      <section
        className="NCC_ARMY-section bg-prim
                dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-6"
      >
        <h2
          className="NCC_ARMY-section-title text-accn dark:text-drkt
              border-b-2 border-secd dark:border-drks w-fit"
        >
          Pledge of NCC
        </h2>
        <p className="NCC_ARMY-content text-lg leading-7 text-center font-semibold">
          {data?.map((item,i) => (
              <>
                {item?.pledge?.map((content,i) => (
                  <li>
                    {content}
                  </li>
                ))}
              </>
            ))}
        </p>
      </section>
    </div>
  );
}
function NCCContact({data}) {
    return (
        <div className="max-w-lg mx-auto p-6 bg-gray-100 dark:bg-drkb rounded-lg shadow-md text-center">
            <h2 className="text-2xl text-brwn font-bold  dark:text-white mb-4">
                Contact Us
            </h2>
            <p className="text-lg font-poppi text-[16px] text-gray-700 dark:text-gray-300">
                {Array.isArray(data) && data[0]?.contact_address}
            </p>
        </div>
    );
}



const NCC_ARMY = ({ toggle, theme }) => {
  // const [member,setMember]= useState({});
  //   const [tabel, setTabelValue] = useState({});
  //   const [curosel, setCarosel] = useState({});
  //   const [Coordinator, setCoordinator] = useState({});
  //   const [armyData,setArmyData] = useState(null);
  const [ncc_army, setarmydata] = useState(null);
  const [army, setnccarmy] = useState("About NCC Army")
    const navData = {
      "About NCC Army": (
        <>
          <NCCAbout data={ncc_army}/>
          <NCCObjectives data={ncc_army}/>
          <NCCAim data={ncc_army}/>
          <NCCMotto data={ncc_army}/>
          <NCCPledge data={ncc_army}/>
          {/* <NCCACarousel data={curosel} /> */}
          <NCCContact data={ncc_army}/>
        </>
      ),
      // "Recent Events":   <NCCACarousel data={ncc_army} />,
      "Team & Coordinators": <NCCAMembers data={ncc_army}/>,
      // "Awards & Recognition" : <AlumniSlider data={ncc_army} />,
      
      
    };

    const BASE_URL = process.env.REACT_APP_BASE_URL;
    const UrlParser = (path) => {
        return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };

    useEffect(()=>{
    const typeMatch = {
        "About NCC Army": "about",
        "Recent Events": "events",
        "Team & Coordinators": "team",
        "Awards & Recognition" : "awards"
    }
    const fetchData = async () => {
        try {
            const response = await axios.post('/api/main-backend/ncc_army',
                {
                    type: typeMatch[army]
                }
            )
            setarmydata(response.data.data)
        } catch (error) {
            console.error("Error fetching data:", error.message)
        }
    }
    fetchData()
  }, [army]);
    

    // function NCCProf() {
    //     return (
    //         <div
    //             className="NCC_ARMY-profile-container bg-prim
    //             dark:bg-drkb border-l-8 border-r-8 border-[#FDB515] px-6"
    //         >
    //             <div className="NCC_ARMY-profile-photo">
    //                 <img src={UrlParser(Coordinator?.coordinator_image)} alt={Coordinator?.coordinator_name}/>
    //             </div>
    //             <div className="NCC_ARMY-profile-content">
    //                 <h2 className="NCC_ARMY-profile-name ">{Coordinator?.coordinator_name}</h2>
    //                 <h4 className="NCC_ARMY-profile-position text-accn dark:text-drka">
    //                     {Coordinator?.coordinator_designation}
    //                 </h4>
    //                 <p className="NCC_ARMY-profile-bio">
    //                     {Coordinator?.coordinator_description}
    //                 </p>
    //             </div>
    //         </div>
    //     );
    // }

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
      <>

        <Banner
          toggle={toggle}
          theme={theme}
          backgroundImage="./Banners/Vid_banner/NCC_Army_Banner.mp4"
          headerText="National Cadet Corps (Army)"
          subHeaderText="Fostering excellence in sports, fitness, and holistic development for students."
          isVideo={true}
        />
        {/* Main NCC_ARMY Container */}
        <SideNav sts={army} setSts={setnccarmy} navData={navData} cls="" backButton={true}/>
      </>
    );
};

export default NCC_ARMY;
