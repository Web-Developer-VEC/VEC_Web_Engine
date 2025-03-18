import React, {useEffect, useState} from 'react';
import './SportsPage.css'; // Import the CSS file for styling
import Banner from '../../Banner';
import SportsActionPlan from './SportsActionPlan';
import SportsInfra from './SportsInfra';
import ZonalResults from './ZonalResults';
import WinnerSlider from './winners_sld';
import Sportsfaculties from './sports_faculties';
import Achievements from './achivements';
import Achievements1 from './Achivements2';
import axios from 'axios';
import SideNav from "../SideNav";

function SPTIntro() {
    return (<section className="introduction">
        <div className="section-content">
            <h2 className="section-title">Introduction</h2>
            <p className="intro-text">
                Our College department of physical education is an integral part of our institution right from its
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
                Our college students got the 18th consecutive years of overall championship in zone – I competitions.
                This is
                our pride for our department of physical education. Moreover, our college students participate for Anna
                university teams, State and National teams. Our students got places in National level sports
                competitions every
                year. </p>
        </div>
    </section>);
}

function SPTVis() {
    return (<section className="vision-mission">
        <div className="section-content">
            <h2 className="section-title">Vision & Mission</h2>
            <p className="vision-mission-text">
                The vision of our department of physical education is physical, mental and Intellectual
                development of the whole student. For which we create an environment that will focus on
                students’ attitude towards physical activity. And provide opportunities for personal and
                intellectual growth through fitness, outdoor recreation, and coaching and sports
                participation. </p>
        </div>
    </section>);
}

const SportsPage = ({theme, toggle}) => {
    const [sportData, setSportsData] = useState(null);
    const [spt, setSpt] = useState("Introduction")
    const navData = {
        "Introduction": <SPTIntro/>,
        "Vision & Mission": <SPTVis/>,
        "Action Plan": <SportsActionPlan/>,
        "Infrastructure": <SportsInfra/>,
        "Achievements": <Achievements1 data={sportData && sportData.length > 2 ? sportData[4] : null}/>,
        "Zonal results": <ZonalResults data={sportData && sportData.length > 2 ? sportData[0] : null}/>,
        "Our Winners": <WinnerSlider data={sportData && sportData.length > 2 ? sportData[1] : null}/>,
        "Faculty": <Sportsfaculties data={sportData && sportData.length > 2 ? sportData[2] : null}/>,
        "Other": <Achievements className="" data={sportData && sportData.length > 2 ? sportData[3] : null}/>
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responce = await axios.get('/api/sportsdata');
                setSportsData(responce.data);
                console.log("Responce", responce.data);

            } catch (err) {
                console.error("Error Fetching data", err.message);
            }
        }
        fetchData();
    }, [])
    return (
        <div className=''>
            <Banner theme={theme} toggle={toggle}
                    backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"  // Replace with an image related to sports or fitness
                    headerText="Physical Education Department"
                    subHeaderText="Fostering excellence in sports, fitness, and holistic development for students."
            />

            {/*<div className="sports-page flex flex-wrap w-screen">*/}
            {/*    <nav className="basis-full lg:basis-1/5 flex flex-wrap gap-y-2 lg:gap-y-0 gap-x-2 justify-center*/}
            {/*        lg:grid lg:float-left w-screen lg:w-fit lg:max-w-[20vw] text-xl my-8">*/}
            {/*        {Object.keys(navData).map((itm, ind) => (*/}
            {/*            <button className={`px-4 py-2 border-2 border-text dark:border-drkt */}
            {/*              hover:bg-accn/50 dark:hover:bg-drka/50   */}
            {/*              ${(spt === itm) ? "bg-accn dark:bg-drka text-prim dark:text-drkp font-semibold" : ""}*/}
            {/*            ${(ind + 1 === Object.keys(navData).length) ? "" : "lg:border-b-transparent"}`} key={ind}*/}
            {/*                    type={"button"} onClick={() => setSpt(itm)}>{itm}</button>*/}
            {/*        ))}*/}
            {/*    </nav>*/}
            {/*    <div className="basis-full lg:basis-4/5">*/}
            {/*        {navData[spt]}*/}
            {/*    </div>*/}
            {/*</div>*/}
            <SideNav sts={spt} setSts={setSpt} navData={navData} cls={"w-screen"} />
        </div>
    );
};

export default SportsPage;
