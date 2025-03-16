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

function NCCAbout() {
    return (
        <section
            className="NCC_ARMY-section bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]
                border-l-8 border-r-8 border-[#FDB515] px-6"
        >
            <h2
                className="NCC_ARMY-section-title text-accn dark:text-drka
            border-b-2 border-secd dark:border-drks"
            >
                About NCC
            </h2>
            <ul className="NCC_ARMY-list">
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
        </section>

    );
}

function NCCVisMis() {
    return (
        <div className="NCC_ARMY-row mt-4">
            <section
                className="NCC_ARMY-section bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] border-l-8 border-[#FDB515] px-6"
            >
                <h2
                    className="NCC_ARMY-section-title text-accn dark:text-drka
              border-b-2 border-secd dark:border-drks"
                >
                    Vision
                </h2>
                <p className="NCC_ARMY-content">
                    Empower volunteer youth to become potential leaders and
                    responsible citizens of the country.
                </p>
            </section>

            <section
                className="NCC_ARMY-section bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] border-l-8 border-[#FDB515] px-6"
            >
                <h2
                    className="NCC_ARMY-section-title text-accn dark:text-drka
              border-b-2 border-secd dark:border-drks"
                >
                    Mission
                </h2>
                <p className="NCC_ARMY-content">
                    To develop leadership and character qualities, mold discipline
                    and nurture social integration and cohesion through
                    multi-faceted programs conducted in a military environment.
                </p>
            </section>
        </div>
    );
}

function NCCAim() {
    return (
        <div
            className="NCC_ARMY-aim-container bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] border-l-8 border-[#FDB515] px-6"
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
                    * TO DEVELOP CHARACTER, COMRADESHIP, DISCIPLINE, LEADERSHIP,
                    SECULAR OUTLOOK, SPIRIT OF ADVENTURE, AND THE IDEALS OF SELFLESS
                    SERVICES AMONGST YOUTH OF THE COUNTRY.
                    <br/>
                    * TO CREATE A HUMAN RESOURCE OF ORGANISED, TRAINED AND MOTIVATED
                    YOUTH, TO PROVIDE LEADERSHIP IN ALL WALKS OF LIFE AND BE ALWAYS
                    AVAILABLE FOR THE SERVICE OF THE NATION.
                    <br/>
                    * TO PROVIDE A SUITABLE ENVIRONMENT TO MOTIVATE THE YOUTH TO
                    TAKE UP CAREER IN THE ARMED FORCES.
                    <br/>
                </p>
            </div>
        </div>
    );
}

function NCCMotto() {
    return (<div className="NCC_ARMY-motto-pledge-container">
            <div
                className="NCC_ARMY-motto bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] border-l-8 border-[#FDB515] px-6"
            >
                <h2 className="NCC_ARMY-heading text-accn dark:text-drka border-b-2 border-secd dark:border-drks">
                    MOTTO OF NCC
                </h2>
                <p className="NCC_ARMY-content">
                    The motto of NCC is “Unity and Discipline,” adopted on 23rd Dec
                    1957. It brings together the youth from different parts of the
                    country, molding them into united, secular, and disciplined
                    citizens.
                </p>
            </div>

            <div
                className="NCC_ARMY-pledge bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] border-l-8 border-[#FDB515] px-6"
            >
                <h2 className="NCC_ARMY-heading text-accn dark:text-drka border-b-2 border-secd dark:border-drks">
                    CARDINALS OF NCC
                </h2>
                <p className="NCC_ARMY-content">
                    * Obey with a smile
                    <br/>
                    * BE punctual
                    <br/>
                    * Work hard and without fuss
                    <br/>* Make no excuses and tell no lies
                </p>
            </div>
        </div>
    );
}

const NCC_ARMY = () => {
    const [tabel, setTabelValue] = useState({});
    const [curosel, setCarosel] = useState({});
    const [Coordinator, setCoordinator] = useState({});
    const [ncc, setNcc] = useState("About NCC Army");
    const navData = {
      "About NCC Army": (
        <>
          <NCCAbout />
          <NCCVisMis />
          <NCCAim />
          <NCCMotto />
          <NCCACarousel data={curosel} />
        </>
      ),
      Members: <NCCAMembers />,
      Distinguished_Alumini : <NCCProf />,
      Gallery: <Carouselarmy />,
    };

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
        <div className="NCC_ARMY-container flex flex-wrap w-screen mt-4 max-w-screen">
          <nav
            className="basis-full lg:basis-1/5 flex flex-wrap justify-center gap-y-2 gap-x-2 
  md:grid md:grid-cols-2 lg:flex lg:flex-col lg:items-center lg:float-left lg:w-[12rem] lg:max-w-[12rem] 
  text-xl my-8 self-start lg:ml-4 lg:mr-4 mx-4 md:mx-0"
          >
            {Object.keys(navData).map((itm, ind) => (
              <button
                className={`w-full px-4 py-2 border-2 border-text dark:border-drkt 
      hover:bg-brwn hover:text-white dark:hover:bg-drka/50   
      ${
        ncc === itm
          ? "bg-accn dark:bg-drka text-prim dark:text-drkp font-semibold"
          : ""
      } 
      border-b-2 border-text dark:border-drkt 
      text-center whitespace-normal break-words`}
                key={ind}
                type="button"
                onClick={() => setNcc(itm)}
              >
                {itm}
              </button>
            ))}
          </nav>

          <div className="NCC_ARMY-content-wrapper grow lg:grow-0 basis-9/12 overflow-hidden">
            {navData[ncc]}
          </div>
        </div>
      </>
    );
};

export default NCC_ARMY;
