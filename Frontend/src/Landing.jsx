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
import ScrollToTopButton from './Components/ScrollToTopButton';


const LandingPage = ({theme, load, toggle, pageData}) => {

    const [isOnline, setIsOnline] = useState(navigator.onLine);

    const pageDetails = pageData?.find((item) => item.type === "page_details")?.data || [];
    const bannerData = pageData?.find((item) => item.type === "banner")?.data || [];
    const departmentBanner = pageData?.find((item) => item.type === "department_banner")?.data || [];
    const notifications = pageData?.find((item) => item.type === "notifications")?.data || [];
    const announcements = pageData?.find((item) => item.type === "announcements")?.data || [];
    const specialAnnouncements = pageData?.find((item) => item.type === "special_announcements")?.data || [];
    const events = pageData?.find((item) => item.type === "events")?.data || [];

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
                lst={notifications} 
                ph={pageDetails[0]?.phone_number}
                email={pageDetails[0]?.email}
            />
            <div className='w-max max-w-[100vw] h-fit absolute z-50'>
                <div className='pt-2 pb-[2vmax] bg-prim dark:bg-drkp'>
                    <Abt/>
                    <Announce anno={announcements} spc={specialAnnouncements}/>
                    <Event data={events}/>
                </div>
                <Tracker data={bannerData}/>
                <div className='bg-prim dark:bg-drkp'>
                    <Samplereact courses={departmentBanner}/>
                    <Contact/>
                    {/* <Chat/> */}
                    <Footer theme={theme} data={pageDetails[0]}/>
                </div>
            </div>
            <ScrollToTopButton/>
        </div>
    );
};

export default LandingPage;
