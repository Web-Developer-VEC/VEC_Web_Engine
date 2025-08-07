import React, {useEffect, useState} from 'react';
import './SportsPage.css'; // Import the CSS file for styling
import Banner from '../../Banner';
import SportsActionPlan from './SportsActionPlan';
import SportsInfra from './SportsInfra';
import { Sportsfaculties, SportsHOD } from './sports_faculties';
import Achievements1 from './Achivements2';
import axios from 'axios';
import SideNav from "../SideNav";
import Intramural from './intramural';
import LoadComp from '../../LoadComp';
import { useNavigate } from "react-router";

const SPTIntro = ({ data }) => {
  if (!Array.isArray(data)) return null;

  return (
    <>
    {!data ? (
      <div className="flex justify-center items-center min-h-screen">
        <LoadComp />
      </div>
    ) : (
      <section className="introduction dark:bg-drkb border-l-4 border-secd dark:border-drks">
        <div className="section-content">
          <h2 className="section-title text-brwn dark:text-drkt">Introduction</h2>
          {data.map((para, idx) => (
            <p className="intro-text" key={idx}>
              {typeof para === "string" ? para : JSON.stringify(para)}
            </p>
          ))}
        </div>
      </section>
    )}
    </>
  );
};

const SPTVis = ({ data }) => {
  let paraArray = [];

  if (data?.type === "vision" && Array.isArray(data.data)) {
    paraArray = data.data;
  } else if (Array.isArray(data)) {
    paraArray = data;
  }

  if (!Array.isArray(paraArray)) return null;

  return (
    <>
    {!data ? (
            <div className="flex justify-center items-center min-h-screen">
              <LoadComp />
            </div>
    ) : (
      <section className="vision-mission border-l-4 border-secd dark:border-drks dark:bg-drkb">
        <div className="section-content">
          <h2 className="section-title text-brwn dark:text-drkt">Vision & Mission</h2>
          {paraArray.map((para, index) => (
            <p className="vision-mission-text" key={index}>
              {typeof para === "string" ? para : JSON.stringify(para)}
            </p>
          ))}
        </div>
      </section>
    )}
    </>
  );
};

const SportsPage = ({theme, toggle}) => {
    const [sportData, setSportsData] = useState(null);
    const [spt, setSpt] = useState("Introduction");
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const navigate = useNavigate();

    const navData = {
        "Introduction": <SPTIntro data={sportData}/>,
        "Vision & Mission": <SPTVis data={sportData}/>,
        "HOD's message": <SportsHOD data={sportData}/>,
        "Faculty": <Sportsfaculties data={sportData}/>,
        "Action Plan": <SportsActionPlan data={sportData}/>,
        "Infrastructure": <SportsInfra data={sportData}/>,
        "Achievements": <Achievements1 data={sportData}/>,
        "Intra Mural": <Intramural data={sportData}/>,
    };

    useEffect(() => {
        const typeMap = {
            "Introduction": "introduction",
            "Vision & Mission": "vision",
            "HOD's message": "hod",
            "Faculty": "faculty",
            "Action Plan": "action_plan",
            "Infrastructure": "infrastructure",
            "Achievements": "achivements",
            "Intra Mural": "intramural"
        }
        const fetchData = async () => {
            setSportsData(null); // <- Reset to avoid mismatch
        try {
            const response = await axios.post('/api/main-backend/sportsdata', {
                type: typeMap[spt]
            });
            setSportsData(response.data.data);
        } catch (err) {
            console.error("Failed to fetch sports data:", err);
             if (err.response.data.status === 429) {
                navigate('/ratelimit', { state: { msg: err.response.data.message}})
              }
        }
        }
      fetchData()
    },[spt])

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
        <div className=''>
            <Banner theme={theme} toggle={toggle}
                backgroundImage="./Banners/Vid_banner/Sports_Video_Banner.mp4"
                headerText="Physical Education Department"
                subHeaderText="Fostering excellence in sports, fitness, and holistic development for students."
                isVideo = {true}
            />
            <SideNav sts={spt} setSts={setSpt} navData={navData} cls={"w-screen"} />
        </div>
    );
};

export default SportsPage;
