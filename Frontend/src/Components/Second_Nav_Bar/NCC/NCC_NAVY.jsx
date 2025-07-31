import React, { useEffect, useState } from "react";
import "./NCC_NAVY.css"; 
import NCCNCarousel from "./NCC_NAvY comps/NCCNCarousel";
import axios from "axios";
import NCCNMembers from "./NCC_NAvY comps/NCCNMembers";
import logo from '../../Assets/NccNavy.png'
import SideNav from "../SideNav";
import AlumniSlider1 from "./NCC_NAvY comps/DisguishedAluminiN";
import LoadComp from "../../LoadComp";
import Banner from "../../Banner";
import { useNavigate } from "react-router";

function NCCAbout({data}) {
  return (
  <section
            className="NCC_NAVY-section bg-prim
                dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-6 "
          >
            <h2
              className="NCC_NAVY-section-title  ext-accn dark:text-drkt
            border-b-2 border-secd dark:border-drks w-fit"
            >
              About NCC
            </h2>
            <ul className="NCC_NAVY-list">
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
          </section>);
}

function NCCVisMis({data}) {
  return (<div className="NCC_NAVY-row">
            <section
              className="NCC_NAVY-section bg-prim
                dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-6"
            >
              <h2
                className="NCC_NAVY-section-title text-accn dark:text-drkt
            border-b-2 border-secd dark:border-drks w-fit"
              >
                Vision
              </h2>
              <p className="NCC_NAVY-content">
                {Array.isArray(data) && data[0]?.vision}
              </p>
            </section>

            <section
              className="NCC_NAVY-section bg-prim
                dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-6"
            >
              <h2
                className="NCC_NAVY-section-title text-accn dark:text-drkt
            border-b-2 border-secd dark:border-drks w-fit"
              >
                Mission
              </h2>
              <p className="NCC_NAVY-content">
                {Array.isArray(data) && data[0]?.mission}
              </p>
            </section>
          </div>);
}

function NCCAim({data}) {
  return (<div
            className="NCC_NAVY-aim-container bg-prim
                dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-6"
          >
            <div className="NCC_NAVY-aim">
              <h2 className="NCC_NAVY-heading text-accn dark:text-drkt border-b-2 border-secd dark:border-drks w-fit">
                <img
                  src={logo}
                  alt="NCC Logo"
                  className="NCC_NAVY-icon"
                />
                AIM of NCC
              </h2>
              <p className="NCC_NAVY-aimcontent">
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
          </div>);
}

function NCCMotto({data}) {
  return (<div className="NCC_NAVY-motto-pledge-container">
            <div
              className="NCC_NAVY-motto bg-prim
                dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-6"
            >
              <h2 className="NCC_NAVY-heading text-accn dark:text-drkt border-b-2 border-secd dark:border-drks w-fit">
                MOTTO OF NCC
              </h2>
              <p className="NCC_NAVY-content">
                {Array.isArray(data) && data[0]?.motto}
              </p>
            </div>

            <div
              className="NCC_NAVY-pledge bg-prim
                dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-6"
            >
              <h2 className="NCC_NAVY-heading text-accn dark:text-drkt border-b-2 border-secd dark:border-drks w-fit">
                NCC PLEDGE
              </h2>
              <p className="NCC_NAVY-content">
                {Array.isArray(data) && data[0]?.pledge}
              </p>
            </div>
          </div>);
}


const NCC_NAVY = ({ toggle, theme }) => {
  const [member,setMember]= useState({})
  const [tabel,setTabelValue] = useState({});
  const [curosel, setCarosel] = useState({});
  const [ Coordinator, setCoordinator] = useState({});
  const [ncc_navy, setnavy] = useState("About NCC Navy");
  const [navydata, setnavdata] = useState(null);
  const navigate = useNavigate();
  const navData = {
    "About NCC Navy": (
      <>
      
        <NCCAbout data={navydata}/>
        <NCCVisMis data={navydata}/>
        <NCCAim data={navydata}/>
        <NCCMotto data={navydata}/>
        {/* <NCCNCarousel data={curosel} /> */}
      </>
    ),
    "Recent Events": <NCCNCarousel data={navydata}/>,
    "Team & Coordinators": <NCCNMembers data={navydata}/>,
    "Awards & Recognition": <AlumniSlider1 data={navydata}/>,
    
  };


  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(()=>{
    const typeMatch = {
        "About NCC Navy": "about",
        "Recent Events": "events",
        "Team & Coordinators": "team",
        "Awards & Recognition" : "awards"
    }
    const fetchData = async () => {
        try {
            const response = await axios.post('/api/main-backend/ncc_navy',
                {
                    type: typeMatch[ncc_navy]
                }
            )
            setnavdata(response.data.data)
        } catch (error) {
            console.error("Error fetching data:", error.message)
             if (error.response.data.status === 429) {
                navigate('/ratelimit', { state: { msg: error.response.data.message}})
              }
        }
    }
    fetchData()
  }, [ncc_navy]);

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


  function NCCProf() {
  return (<div
            className="NCC_NAVY-profile-container bg-prim
                dark:bg-drkb border-l-8 border-r-8 border-[#FDB515] px-6"
          >
            <div className="NCC_NAVY-profile-photo">
              <img src={UrlParser(Coordinator?.coordinator_image)} alt={Coordinator?.coordinator_name} />
            </div>
            <div className="NCC_NAVY-profile-content">
              <h2 className="NCC_NAVY-profile-name">{Coordinator?.coordinator_name}</h2>
              <h4 className="NCC_NAVY-profile-position text-accn dark:text-drkt">
                {Coordinator?.coordinator_designation}
              </h4>
              <p className="NCC_NAVY-profile-bio">
                {Coordinator?.coordinator_description}
              </p>
            </div>
        </div>);
  }

  return (

    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/Vid_banner/NCC_Navy_Banner.mp4"
        headerText="National Cadet Corps (Navy)"
        subHeaderText="Fostering excellence in sports, fitness, and holistic development for students."
        isVideo={true}
      />
      {/* Main NCC_NAVY Container */}
      <SideNav sts={ncc_navy} setSts={setnavy} navData={navData} cls="" backButton={true}/>
    </>

  );
};

export default NCC_NAVY;
