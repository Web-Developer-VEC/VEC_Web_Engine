import {useState,useEffect} from "react";
import { useNavigate } from "react-router-dom"
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
import axios from "axios";



const Incub = ( {toggle, theme}) => {
    const [cub, setCub] = useState("Home")
    const [home, sethome] = useState(null)
    const [startup, setstartup] = useState(null)
    const [committee, setcommittee] = useState(null)
    const [facilities, setfacilities] = useState(null)
    const [project, setproject] = useState(null)
    const [patents, setpatents] = useState(null)
    const [seedmoney, setseedmoney] = useState(null)
    const navigate = useNavigate();
    useEffect(() => {
        if (cub === "E-Cell") {
            navigate("/ecell");
        }
    }, [cub, navigate]);

    const navData = {
        "Home": <CubHme data={home}/>,
        "Incubated Startups": <Startup data={startup}/>, 
        "E-Cell": <></>,
        "Committee": <Committe data={committee}/>,  
        "Facilities": <Facilities data={facilities}/>,
        "Project": <Projects data={project}/>,
        "Patents": <Patents data={patents}/>,
        "Seed Money": <Seedmoney data={seedmoney}/>,
        "Apply Now": <Applynow/>           
    };
    useEffect(() => {
        const fetchData = async () => {
            try {
                const responce = await axios.get('/api/incubation');

                const data = responce.data[0];

                sethome(data.home);
                setstartup(data.start_up);
                setseedmoney(data.seed_money);
                setfacilities(data.facilities);
                setproject(data.projects);
                setpatents(data.patent);
                setcommittee(data.incubation_committee);
            } catch (error) {
                console.error("Error fetching incubation data",error);
            }
        }
        fetchData();
    }, []);

    function CubHme({data}) {
        return (
            <div className="ic-home-container">
                <div className="ic-about-section dark:bg-drkb border-l-4 border-secd dark:border-drks">
                    <h2 className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1">About Us</h2>
                    <p className="ic-centered-text text-text dark:text-drkt">
                        {data?.about_us}
                    </p>
                </div>

                <div className="ic-vision-mission-grid">
                    <div className="ic-vm-card dark:bg-drkb border-l-4 border-secd dark:border-drks">
                        <h3 className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1">Activities</h3>
                        <ul>
                            {data?.activities?.map((adv,i)=>(
                                <li>{adv}</li>
                            ))}
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