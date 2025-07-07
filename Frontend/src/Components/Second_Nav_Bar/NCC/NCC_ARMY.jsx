import React, {useEffect, useState} from "react";
import "./NCC_ARMY.css";
import NCCACarousel from "./NCC_ARMY comps/NCCACarousel";
import NCCAtable from "./NCC_ARMY comps/NCCAtable";
import axios from "axios";
import NSSCarousel from "../NSS/NSSCarousel";
import NSSContent from "../NSS/NSSContent";
import NSSManual from "../NSS/NSSManual";
import Coordinators from "../NSS/NSSCoordinatiors";

import NCCAMembers from "./NCC_ARMY comps/NCCAMembers";
import Carouselarmy from "./NCC_ARMY comps/Corouselarmy";
import NCCNMembers from "./NCC_NAvY comps/NCCNMembers";
import SideNav from "../SideNav";
import AlumniSlider from "./NCC_ARMY comps/DisguishedAlumini";


function NCCAbout() {



  
    return (
      <section
        className="NCC_ARMY-section bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]
                border-l-4 border-[#FDB515] px-6 mt-4"
      >
        <h2
          className="NCC_ARMY-section-title text-accn dark:text-drka
            border-b-2 border-secd dark:border-drks"
        >
          About NCC
        </h2>
        <ul className="NCC_ARMY-list">
          <li>
            The VEC NCC Army embodies the motto of the National Cadet Corps
            (NCC) – Unity and Discipline. At Velammal Engineering College, we
            take immense pride in fostering leadership, discipline, and
            patriotism among our cadets. Under the able guidance of our
            Associate NCC Officer (ANO), Captain R. Chezhian, the unit
            consistently strives for excellence in both training and service.
          </li>
          <li>
            Our NCC Army wing provides a structured training program that
            instills qualities of leadership, teamwork, and social
            responsibility. The cadets undergo rigorous physical training, drill
            sessions, and weapon training, preparing them to face challenges
            with confidence. Additionally, the unit actively participates in
            various social service activities, including environmental
            campaigns, disaster relief efforts, and blood donation camps,
            contributing to the welfare of society.
          </li>
          <li>
            The VEC NCC Army also encourages participation in prestigious camps
            such as the Republic Day Camp (RDC), Thal Sainik Camp (TSC), and
            Combined Annual Training Camp (CATC). These experiences help cadets
            develop resilience, discipline, and camaraderie, essential for
            personal and professional growth.
          </li>
          <li>
            We are committed to shaping responsible citizens who uphold the
            values of service, courage, and integrity. Through the unwavering
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
          className="NCC_ARMY-section bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] border-l-4 border-[#FDB515] px-3"
        >
          <h2
            className="NCC_ARMY-section-title text-accn dark:text-drka
              border-b-2 border-secd dark:border-drks"
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
        className="NCC_ARMY-aim-container bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] border-l-4 border-[#FDB515] px-6"
      >
        <div className="NCC_ARMY-aim">
          <h2 className="NCC_ARMY-heading text-accn dark:text-drka border-b-2 border-secd dark:border-drks">
            <img
              src="./ncc_logo.png"
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
            Secular Outlook, Spirit of Adventure, and Ideals of Selfless Service
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
          className="NCC_ARMY-motto bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] border-l-4 border-[#FDB515] px-6"
        >
          <h2 className="NCC_ARMY-heading text-accn dark:text-drka border-b-2 border-secd dark:border-drks">
            MOTTO OF NCC
          </h2>
          <p className="NCC_ARMY-content-1 ">"Unity and Discipline"</p>
        </div>

        <div
          className="NCC_ARMY-pledge bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] border-l-4 border-[#FDB515] px-6"
        >
          <h2 className="NCC_ARMY-heading text-accn dark:text-drka border-b-2 border-secd dark:border-drks">
            CARDINALS OF NCC
          </h2>
          <p className="NCC_ARMY-content">
            * Obey with a smile
            <br />
            * BE punctual
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
        className="NCC_ARMY-section bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] border-l-4 border-[#FDB515] px-6"
      >
        <h2
          className="NCC_ARMY-section-title text-accn dark:text-drka
              border-b-2 border-secd dark:border-drks"
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
        <div className="max-w-lg mx-auto p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md text-center">
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



const NCC_ARMY = () => {
    const [tabel, setTabelValue] = useState({});
    const [curosel, setCarosel] = useState({});
    const [Coordinator, setCoordinator] = useState({});
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
      "Team & Coordinators": <NCCAMembers />,
      "Awards & Recognition" : <AlumniSlider />,
      
      
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

                setTabelValue(data.Table);
                setCarosel(data.image);
                setCoordinator(data.Coordinator)

            } catch (error) {
                console.error("Error fetching data", error);
            }
        }
        fetchData()
    }, []);
    

    function NCCProf() {
        return (
            <div
                className="NCC_ARMY-profile-container bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] border-l-8 border-r-8 border-[#FDB515] px-6"
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


    return (
      <>
        {/* Main NCC_ARMY Container */}
        <SideNav sts={ncc} setSts={setNcc} navData={navData} cls="" />
      </>
    );
};

export default NCC_ARMY;
