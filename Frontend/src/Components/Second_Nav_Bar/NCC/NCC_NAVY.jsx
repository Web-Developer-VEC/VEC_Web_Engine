import React, { useEffect, useState } from "react";
import "./NCC_NAVY.css"; 
import NCCNCarousel from "./NCC_NAvY comps/NCCNCarousel";
import NCCNtable from "./NCC_NAvY comps/NCCNtable";
import axios from "axios";
import NCCACarousel from "./NCC_ARMY comps/NCCACarousel";
import NCCAtable from "./NCC_ARMY comps/NCCAtable";

import CarouselNavy from "./NCC_NAvY comps/Corouselnavy";
import NCCNMembers from "./NCC_NAvY comps/NCCNMembers";

import SideNav from "../SideNav";
import AlumniSlider1 from "./NCC_NAvY comps/DisguishedAluminiN";



function NCCAbout() {
  return (
  <section
            className="NCC_NAVY-section bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] border-l-4 border-[#FDB515] px-6 "
          >
            <h2
              className="NCC_NAVY-section-title  ext-accn dark:text-drka
            border-b-2 border-secd dark:border-drks text-[#800000]"
            >
              About NCC
            </h2>
            <ul className="NCC_NAVY-list">
              <li>
                National Cadet Corps is a Tri-Services Organization, comprising
                the Army, Navy, and Air Force, engaged in grooming the youth of
                the country into disciplined and patriotic citizens.
              </li>
              <li>
                The National Cadet Corps (NCC) is a youth development movement.
                It has enormous potential for nation-building.
              </li>
              <li>
                The NCC provides opportunities to the youth of the country for
                their all-round development with a sense of Duty, Commitment,
                Dedication, Discipline, and Moral Values so that they become
                able leaders and useful citizens.
              </li>
              <li>
                The NCC provides exposure to the cadets in a wide range of
                activities, with a distinct emphasis on Social Services,
                Discipline, and Adventure Training.
              </li>
              <li>
                The NCC is open to all regular students of schools and colleges
                on a voluntary basis all over India.
              </li>
              <li>
                The cadets have no liability for active military service once
                they complete their course but are given preference over normal
                candidates during selections based on the achievements in the
                corps.
              </li>
            </ul>
          </section>);
}

function NCCVisMis() {
  return (<div className="NCC_NAVY-row">
            <section
              className="NCC_NAVY-section bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] border-l-4 border-[#FDB515] px-6"
            >
              <h2
                className="NCC_NAVY-section-title text-accn dark:text-drka
            border-b-2 border-secd dark:border-drks"
              >
                Vision
              </h2>
              <p className="NCC_NAVY-content">
                Empower volunteer youth to become potential leaders and
                responsible citizens of the country.
              </p>
            </section>

            <section
              className="NCC_NAVY-section bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] border-l-4 border-[#FDB515] px-6"
            >
              <h2
                className="NCC_NAVY-section-title text-accn dark:text-drka
            border-b-2 border-secd dark:border-drks"
              >
                Mission
              </h2>
              <p className="NCC_NAVY-content">
                To develop leadership and character qualities, mold discipline
                and nurture social integration and cohesion through
                multi-faceted programs conducted in a military environment.
              </p>
            </section>
          </div>);
}

function NCCAim() {
  return (<div
            className="NCC_NAVY-aim-container bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] border-l-4 border-[#FDB515] px-6"
          >
            <div className="NCC_NAVY-aim">
              <h2 className="NCC_NAVY-heading text-accn dark:text-drka border-b-2 border-secd dark:border-drks">
                <img
                  src="./ncc_logo.png"
                  alt="NCC Logo"
                  className="NCC_NAVY-icon"
                />
                AIM of NCC
              </h2>
              <p className="NCC_NAVY-aimcontent">
                • The ‘Aims’ of the NCC laid out in 1988 have stood the test of
                time and continue to meet the requirements expected of it in the
                current socio-economic scenario of the country.
                <br />
                * To develop good qualities like character, commandership,
                discipline, leadership, secular outlook, and selfless service.
                <br />
                * To create a human resource of trained and motivated youth.
                <br />* To provide an environment to motivate youth for a career
                in the Armed Forces.
              </p>
            </div>
          </div>);
}

function NCCMotto() {
  return (<div className="NCC_NAVY-motto-pledge-container">
            <div
              className="NCC_NAVY-motto bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] border-l-4 border-[#FDB515] px-6"
            >
              <h2 className="NCC_NAVY-heading text-accn dark:text-drka border-b-2 border-secd dark:border-drks">
                MOTTO OF NCC
              </h2>
              <p className="NCC_NAVY-content">
                The motto of NCC is “Unity and Discipline,” adopted on 23rd Dec
                1957. It brings together the youth from different parts of the
                country, molding them into united, secular, and disciplined
                citizens.
              </p>
            </div>

            <div
              className="NCC_NAVY-pledge bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] border-l-4 border-[#FDB515] px-6"
            >
              <h2 className="NCC_NAVY-heading text-accn dark:text-drka border-b-2 border-secd dark:border-drks">
                NCC PLEDGE
              </h2>
              <p className="NCC_NAVY-content">
                We, the cadets of the National Cadet Corps, do solemnly pledge
                that we shall always uphold the unity of India. We resolve to be
                disciplined and responsible citizens of our nation.
              </p>
            </div>
          </div>);
}


const NCC_NAVY = () => {
  const [tabel,setTabelValue] = useState({});
  const [curosel, setCarosel] = useState({});
  const [ Coordinator, setCoordinator] = useState({});
  const navData = {
    "About NCC Navy": (
      <>
        <NCCAbout />
        <NCCVisMis />
        <NCCAim />
        <NCCMotto />
        {/* <NCCNCarousel data={curosel} /> */}
      </>
    ),
    "Recent Events": <NCCNCarousel data={curosel} />,
    "Team & Coordinators": <NCCNMembers />,
    "Awards & Recognition": <AlumniSlider1 />,
    
  };
  const [ncc, setNcc] = useState(Object.keys(navData)[0]);


  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(()=>{
    const fetchData = async ()=>{
      try {
        const responce = await axios.get('/api/ncc_navy');
        const data = responce.data[0];

        setTabelValue(data.Table);
        setCarosel(data.events);
        setCoordinator(data.Coordinator)

      } catch (error) {
        console.error("Error fetching data",error);  
      }
    }
    fetchData()
  },[]);

  function NCCProf() {
  return (<div
            className="NCC_NAVY-profile-container bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] border-l-8 border-r-8 border-[#FDB515] px-6"
          >
            <div className="NCC_NAVY-profile-photo">
              <img src={UrlParser(Coordinator?.coordinator_image)} alt={Coordinator?.coordinator_name} />
            </div>
            <div className="NCC_NAVY-profile-content">
              <h2 className="NCC_NAVY-profile-name">{Coordinator?.coordinator_name}</h2>
              <h4 className="NCC_NAVY-profile-position text-accn dark:text-drka">
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
      {/* Main NCC_NAVY Container */}
      <SideNav sts={ncc} setSts={setNcc} navData={navData} cls="" />
    </>

  );
};

export default NCC_NAVY;
