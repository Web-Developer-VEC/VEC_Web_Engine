import {useState,useEffect} from "react";
import "./Incub.css";
import Banner from "../../Banner";
import SideNav from "../SideNav";
import LoadComp from "../../LoadComp";
import Startup from "./startUp";
import Committe from "./comitte";
import Facilities from "./Facilities";
import Projects from "./Projects";
import Seedmoney from "./Seedmoney";
import Patents from "./Patents";
import Applynow from "./ApplyNow";


const Incub = ( {toggle, theme}) => {
    const [cub, setCub] = useState("Home")
    const navData = {
        "Home": <CubHme/>,
        "Incubated Startups": <Startup/>, 
        "Committee": <Committe/>,  
        "Facilities": <Facilities/>,
        "Project": <Projects/>,
        "Patents": <Patents/>,
        "Seed Money": <Seedmoney/>,
        "Apply Now": <Applynow/>           
    };


    function CubHme() {
        return (
            <div className="ic-home-container">
                <div className="ic-about-section dark:bg-drkb border-l-4 border-secd dark:border-drks">
                    <h2 className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1">About Us</h2>
                    <p className="ic-centered-text text-text dark:text-drkt">
                        The objective of the scheme is to promote and support untapped creativity and to promote adoption of latest technologies in MSMEs that seek the validation of their ideas at the proof-of-concept level. The scheme also supports engagement with enablers who will advise such MSMEs in expanding the business by supporting them in design, strategy and execution.
                    </p>
                </div>

                <div className="ic-vision-mission-grid">
                    <div className="ic-vm-card dark:bg-drkb border-l-4 border-secd dark:border-drks">
                        <h3 className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1">Activities</h3>
                        <ul>
                            <li>Recognition of eligible institutions as Host Institute (HI) to act as Business Incubator (BI)</li>
                            <li>Approval of Ideas of Incubatees submitted through Host Institute (HI)</li>
                            <li>Assistance for nurturing of Ideas to HI</li>
                            <li>Assistance towards Capital Support to HI for Plant and Machinery</li>
                        </ul>
                    </div>
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
                toggle={toggle} theme={theme}
                backgroundImage="./Banners/IIC.webp"
                headerText="incubation cell"
                subHeaderText="Innovation & Incubation Center"
            />
            <SideNav sts={cub} setSts={setCub} navData={navData} cls={"w-screen"}/>
        </>
    );
};

export default Incub;