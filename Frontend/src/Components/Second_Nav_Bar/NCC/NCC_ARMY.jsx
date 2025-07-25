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


function NCCAbout() {
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
          <li>
            The VEC NCC Army embodies the motto of the National Cadet Corps
            (NCC) – Unity and Discipline. At Velammal Engineering College, we
            take immense pride in fostering leadership, discipline and
            patriotism among our cadets. Under the able guidance of our
            Associate NCC Officer (ANO), Captain R. Chezhian, the unit
            consistently strives for excellence in both training and service.
          </li>
          <li>
            Our NCC Army wing provides a structured training program that
            instills qualities of leadership, teamwork and social
            responsibility. The cadets undergo rigorous physical training, drill
            sessions, and weapon training, preparing them to face challenges
            with confidence. Additionally, the unit actively participates in
            various social service activities, including environmental
            campaigns, disaster relief efforts, and blood donation camps,
            contributing to the welfare of society.
          </li>
          <li>
            The VEC NCC Army also encourages participation in prestigious camps
            such as the Republic Day Camp (RDC), Thal Sainik Camp (TSC) and
            Combined Annual Training Camp (CATC). These experiences help cadets
            develop resilience, discipline and camaraderie, essential for
            personal and professional growth.
          </li>
          <li>
            We are committed to shaping responsible citizens who uphold the
            values of service, courage and integrity. Through the unwavering
            dedication of our cadets and the support of our faculty, the VEC NCC
            Army continues to uphold the spirit of the NCC and inspire young
            minds to serve the nation with honor and pride.
          </li>
          
        </ul>
      </section>
    );
}

function NCCObjectives() {
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
            <li>
              To fulfill the requirements expected in the latest socio-economic
              scenario in India.
            </li>
            <li>
              To develop character, discipline, comradeship, secular outlook,
              ideals of selfless services and adventure spirits amongst large
              numbers of young citizens.
            </li>
            <li>
              To create a pool of trained, organized and motivated youth with
              various leadership qualities in every walk of their life and serve
              the Nation irrespective of the career they choose.
            </li>
            <li>
              To provide a sound environment conducive towards motivating large
              numbers of young people of India to join armed forces.
            </li>
          </ul>
        </section>
      </div>
    );
}



function NCCAim() {
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
            * To Create a Human Resource of Organized, Trained and Motivated
            Youth, To Provide Leadership in all Walks of life and be Always
            Available for the Service of the Nation.
            <br />
            * To Provide a Suitable Environment to Motivate the Youth to Take Up
            a Career in the Armed Forces.
            <br />
            * To Develop Character, Comradeship, Discipline, Leadership,
            Secular Outlook, Spirit of Adventure and Ideals of Selfless Service
            amongst the Youth of the Country.
            <br />
          </p>
        </div>
      </div>
    );
}

function NCCMotto() {
    return (
      <div className="NCC_ARMY-motto-pledge-container">
        <div
          className="NCC_ARMY-motto bg-prim
                dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-6"
        >
          <h2 className="NCC_ARMY-heading text-accn dark:text-drkt border-b-2 border-secd dark:border-drks w-fit">
            MOTTO OF NCC
          </h2>
          <p className="NCC_ARMY-content-1 ">"Unity and Discipline"</p>
        </div>

        <div
          className="NCC_ARMY-pledge bg-prim
                dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-6"
        >
          <h2 className="NCC_ARMY-heading text-accn dark:text-drkt border-b-2 border-secd dark:border-drks w-fit">
            CARDINALS OF NCC
          </h2>
          <p className="NCC_ARMY-content">
            * Obey with a smile
            <br />
            * Be punctual
            <br />
            * Work hard and without fuss
            <br />* Make no excuses and tell no lies
          </p>
        </div>
      </div>
    );
}

function NCCPledge() {
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
          WE THE CADETS OF THE NATIONAL CADET CORPS,
          <br /> DO SOLEMNLY PLEDGE THAT WE SHALL ALWAYS UPHOLD THE UNITY OF
          INDIA.
          <br /> WE RESOLVE TO BE DISCIPLINED AND RESPONSIBLE CITIZENS OF OUR
          NATION.
          <br /> WE SHALL UNDERTAKE POSITIVE COMMUNITY SERVICE IN THE SPIRIT OF
          SELFLESSNESS
          <br /> AND CONCERN FOR OUR FELLOW BEINGS.
        </p>
      </section>
    </div>
  );
}
function NCCContact() {
    return (
        <div className="max-w-lg mx-auto p-6 bg-gray-100 dark:bg-drkb rounded-lg shadow-md text-center">
            <h2 className="text-2xl text-brwn font-bold  dark:text-white mb-4">
                Contact Us
            </h2>
            <p className="text-lg font-poppi text-[16px] text-gray-700 dark:text-gray-300">
                VEC NCC Army Room (Next to Electronic Practices Lab)
                <br />
                Anna Auditorium, Velammal Engineering College, Surapet,
                <br />
                Chennai - 600 066
            </p>
        </div>
    );
}



const NCC_ARMY = ({ toggle, theme }) => {
  const [member,setMember]= useState({});
    const [tabel, setTabelValue] = useState({});
    const [curosel, setCarosel] = useState({});
    const [Coordinator, setCoordinator] = useState({});
    const [armyData,setArmyData] = useState(null);
    const navData = {
      "About NCC Army": (
        <>
          <NCCAbout />
          <NCCObjectives />
          <NCCAim />
          <NCCMotto />
          <NCCPledge />
          {/* <NCCACarousel data={curosel} /> */}
          <NCCContact />
        </>
      ),
      "Recent Events":   <NCCACarousel data={curosel} />,
      "Team & Coordinators": <NCCAMembers armyFacultyData={Coordinator} armyStudentData={member} />,
      "Awards & Recognition" : <AlumniSlider data={armyData?.events} />,
      
      
    };
    const [ncc, setNcc] = useState(Object.keys(navData)[0]);

    const BASE_URL = process.env.REACT_APP_BASE_URL;
    const UrlParser = (path) => {
        return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responce = await axios.get('/api/ncc_army');
                const data = responce.data[0];

                
                const memberData = data.members
                setTabelValue(data.Table);
                setCarosel(data.image);
                setCoordinator(data.coordinater)  
                


                const formattedMembers =  memberData.name.map((name, i) => ({
                  name,
                  rank: memberData.rank[i],
                    regiment_no:  memberData.regiment_no[i],
                    year:  memberData.year[i],
                    department: memberData.department[i],
                    image: memberData.image_path[i]
                    }));


                setMember(formattedMembers)
            } catch (error) {
                console.error("Error fetching data", error);
            }
        }
        fetchData()
    }, []);
    

    function NCCProf() {
        return (
            <div
                className="NCC_ARMY-profile-container bg-prim
                dark:bg-drkb border-l-8 border-r-8 border-[#FDB515] px-6"
            >
                <div className="NCC_ARMY-profile-photo">
                    <img src={UrlParser(Coordinator?.coordinator_image)} alt={Coordinator?.coordinator_name}/>
                </div>
                <div className="NCC_ARMY-profile-content">
                    <h2 className="NCC_ARMY-profile-name ">{Coordinator?.coordinator_name}</h2>
                    <h4 className="NCC_ARMY-profile-position text-accn dark:text-drka">
                        {Coordinator?.coordinator_designation}
                    </h4>
                    <p className="NCC_ARMY-profile-bio">
                        {Coordinator?.coordinator_description}
                    </p>
                </div>
            </div>
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
      <>

        <Banner
          toggle={toggle}
          theme={theme}
          backgroundImage="./Banners/Vid_banner/NCC_Video_Banner.mp4"
          headerText="National Cadet Corps (NCC)"
          subHeaderText="Fostering excellence in sports, fitness, and holistic development for students."
          isVideo={true}
        />
        {/* Main NCC_ARMY Container */}
        <SideNav sts={ncc} setSts={setNcc} navData={navData} cls="" backButton={true}/>
      </>
    );
};

export default NCC_ARMY;
