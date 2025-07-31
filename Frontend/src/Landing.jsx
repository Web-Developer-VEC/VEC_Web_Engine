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
import ScrollToTopButton from './Components/ScrollToTopButton';
import { useNavigate } from "react-router";


const LandingPage = ({theme, load, toggle}) => {

    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const navigate = useNavigate();
    const [pageDetails, setPageDetails] = useState(null);
    const [bannerData, setBannerData] = useState([]);
    const [departmentBanner, setDepartmentBanner] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [specialAnnouncements, setSpecialAnnouncements] = useState([]);
    const [events, setEvents] = useState([]);    

    useEffect(() => {
        const fetchData = async () => {
        try {
            const res = await axios.post("/api/main-backend/landing_page_data", {
            type: "landing_data"
            });

            const rawData = res.data?.data;

            rawData.forEach((item) => {
            switch (item.type) {
                case "page_details":
                    setPageDetails(item.data[0]); // only 1 object inside
                    break;
                case "banner":
                    setBannerData(item.data);
                    break;
                case "department_banner":
                    setDepartmentBanner(item.data);
                    break;
                case "notifications":
                    setNotifications(item.data);
                    break;
                case "announcements":
                    setAnnouncements(item.data);
                    break;
                case "special_announcements":
                    setSpecialAnnouncements(item.data);
                    break;
                case "events":
                    setEvents(item.data);
                    break;
                default:
                    console.warn("Unhandled type:", item.type);
            }
            });
        } catch (error) {
            console.error("API error:", error);
            if (error.response.data.status === 429) {
                navigate('/ratelimit', { state: { msg: error.response.data.message}})
            }
        }
        };

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
                lst={notifications} 
                ph={pageDetails?.phone_number}
                email={pageDetails?.email}
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
                    <Footer theme={theme} data={pageDetails}/>
                </div>
            </div>
            <ScrollToTopButton/>
        </div>
    );
};

export default LandingPage;
