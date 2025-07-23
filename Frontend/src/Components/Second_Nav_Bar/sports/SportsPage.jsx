import React, {useEffect, useState} from 'react';
import './SportsPage.css'; // Import the CSS file for styling
import Banner from '../../Banner';
import SportsActionPlan from './SportsActionPlan';
import SportsInfra from './SportsInfra';
import ZonalResults from './ZonalResults';
import { Sportsfaculties, SportsHOD } from './sports_faculties';
import Achievements from './achivements';
import Achievements1 from './Achivements2';
import axios from 'axios';
import SideNav from "../SideNav";
import Intramural from './intramural';
import WinnerSlider from './winners_sld';
import LoadComp from '../../LoadComp';

function SPTIntro() {
    return (
    <section className="introduction dark:bg-drkb border-l-4 border-secd dark:border-drks">
        <div className="section-content">
            <h2 className="section-title text-brwn dark:text-drkt">Introduction</h2>
            <p className="intro-text">
                Our College department of Physical Education is an integral part of our institution right from its
                inception
                from the year 2005-2006.
            </p>
            <p className="intro-text">
                We are now having 3 faculty members, including a Head of the department. In which we have one doctorate
                in
                physical education. We engage the students both morning and evening for sports activities and make them
                to
                participate in Inter collegiate tournaments. We have one big Indoor stadium and one multi Gym with
                Fitness
                trainer.
            </p>
            <p className="intro-text">
                Our college students got the 18th consecutive years of overall championship in Zone – I competitions.
                This is
                our pride for our department of Physical Education. Moreover, our college students participate for Anna
                university teams, State and National teams. Our students got places in National level sports
                competitions every
                year. </p>
        </div>
    </section>);
}

function SPTVis() {
    return (
    <section className="vision-mission border-l-4 border-secd dark:border-drks dark:bg-drkb">
        <div className="section-content">
            <h2 className="section-title text-brwn dark:text-drkt">Vision & Mission</h2>
            <p className="vision-mission-text">
                The vision of our department of physical education is physical, mental and Intellectual
                development of the whole student. For which we create an environment that will focus on
                students’ attitude towards physical activity. And provide opportunities for personal and
                intellectual growth through fitness, outdoor recreation, and coaching and sports
                participation. </p>
        </div>
    </section>
    );
}

const SportsPage = ({theme, toggle}) => {
    const [sportData, setSportsData] = useState(null);
    const [spt, setSpt] = useState("Introduction");
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    const navData = {
        "Introduction": <SPTIntro/>,
        "Vision & Mission": <SPTVis/>,
        "HOD's message": <SportsHOD data={sportData?.HOD}/>,
        "Faculty": <Sportsfaculties data={sportData?.faculty}/>,
        "Action Plan": <SportsActionPlan/>,
        "Infrastructure": <SportsInfra/>,
        "Achievements": <Achievements1 zonaltable={sportData?.zonal_table} zonewinner={sportData?.zone_winner} interzone={sportData?.interzone} others={sportData?.others} coordinator={sportData?.coordinator}/>,
        "Intra Mural": <Intramural data={sportData?.interamural}/>,
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responce = await axios.get('/api/sportsdata');
                setSportsData(responce.data[0]);
                console.log("Responce", responce.data[0].HOD);

            } catch (err) {
                console.error("Error Fetching data", err.message);
            }
        }
        fetchData();
    }, []);

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
            backgroundImage="./Banners/sports.webp"
                    headerText="Physical Education Department"
                    subHeaderText="Fostering excellence in sports, fitness, and holistic development for students."
            />
            <SideNav sts={spt} setSts={setSpt} navData={navData} cls={"w-screen"} />
        </div>
    );
};

export default SportsPage;
