import React, { useEffect, useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import Cookies from "universal-cookie";
import LoadComp from './Components/LoadComp';
import Boot from './Components/Landing Comp/BootUp';
import ImgSld from './Components/Landing Comp/ImgSld';
import Abt from './Components/Landing Comp/About';
import Announce from './Components/Landing Comp/announcements';
import Event from './Components/Landing Comp/Events';
import Tracker from './Components/Landing Comp/Tracker';
import Samplereact from './Components/Landing Comp/Courses';
import Contact from './Components/Landing Comp/ContactIcon'
import Chat from './Components/Landing Comp/ChatPopup'
import Footer from './Components/Landing Comp/Footer';
import axios from 'axios';


const LandingPage = ({theme, load, toggle}) => {

    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [landingData, setLandingData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responce = await axios.get('/api/landing_page_data');

                setLandingData(responce.data);
                
            } catch (error) {
                console.error("Error fetching thhe landing page Data",error);
                
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
        <div className="landing-page -mt-[5vmax] overflow-x-hidden">
            <ImgSld 
                load={load} toggle={toggle} theme={theme} 
                lst={landingData?.notifications} 
                ph={landingData?.landing_page_details?.phone_number}
                email={landingData?.landing_page_details?.email_id}
            />
            <div className='w-max max-w-[100vw] h-fit absolute z-50'>
                <div className='pt-2 pb-[2vmax] bg-prim dark:bg-drkp'>
                    <Abt/>
                    <Announce/>
                    <Event/>
                </div>
                <Tracker/>
                <div className='bg-prim dark:bg-drkp'>
                    <Samplereact courses={landingData?.department_banner}/>
                    <Contact/>
                    {/* <Chat/> */}
                    <Footer theme={theme} data={landingData?.landing_page_details}/>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
