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
    const [incubation,setIncubation] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        if (cub === "E-Cell") {
            navigate("/ecell");
        }
    }, [cub, navigate]);

    const navData = {
        "Home": <CubHme data={incubation}/>,
        "Incubated Startups": <Startup data={incubation}/>, 
        "E-Cell": <></>,
        "Committee": <Committe data={incubation}/>,  
        "Facilities": <Facilities data={incubation}/>,
        "Project": <Projects data={incubation}/>,
        "Patents": <Patents data={incubation}/>,
        "Seed Money": <Seedmoney data={incubation}/>,
        "Apply Now": <Applynow/>           
    };
    useEffect(() => {
        setIncubation(null);
        const fetchData = async () => {
            const typeMatch = {
                "Home": "home",
                "Incubated Startups": "start_up",
                "Committee": "incubation_committee",
                "Facilities": "facilities",
                "Project": "projects",
                "Patents": "patent",
                "Seed Money": "seed_money"
            }
            try {
                setIncubation(null);
                const responce = await axios.post('/api/main-backend/incubation',
                    {
                        type : typeMatch[cub]
                    }
                );

                const data = responce.data.data;

                setIncubation(data);
            } catch (error) {
                console.error("Error fetching incubation data",error);
                 if (error.response.data.status === 429) {
                    navigate('/ratelimit', { state: { msg: error.response.data.message}})
               }
            }
        }
        fetchData();
    }, [cub]);

    function CubHme({data}) {
        let home
        if (data) {
            home = data[0]
        }
        return (
            <>
                {data ? (
                    <div className="ic-home-container">
                        <div className="ic-about-section dark:bg-drkb border-l-4 border-secd dark:border-drks">
                            <h2 className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1">About Us</h2>
                            <p className="ic-centered-text text-text dark:text-drkt">
                                {home?.about_us}
                            </p>
                        </div>

                        <div className="ic-vision-mission-grid">
                            <div className="ic-vm-card dark:bg-drkb border-l-4 border-secd dark:border-drks">
                                <h3 className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1">Activities</h3>
                                <ul>
                                    {home?.activities?.map((adv,i)=>(
                                        <li>{adv}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
                        <LoadComp />
                    </div>
                )}
            </>
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