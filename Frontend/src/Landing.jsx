import React, { useEffect, useState, lazy, Suspense } from 'react';
import SharedLandingLayout from './SharedLandingLayout';
import LoadComp from './Components/Main/LoadComp';
import Boot from './Components/Main/Landing Comp/BootUp';
import ImgSld from './Components/Main/Landing Comp/ImgSld';
import Abt from './Components/Main/Landing Comp/About';
import Announce from './Components/Main/Landing Comp/announcements';
import Event from './Components/Main/Landing Comp/Events';
import Tracker from './Components/Main/Landing Comp/Tracker';
import Samplereact from './Components/Main/Landing Comp/Courses';
import Contact from './Components/Main/Landing Comp/ContactIcon'
import Chat from './Components/Main/Landing Comp/ChatPopup'
import Footer from './Components/Main/Landing Comp/Footer';
import ScrollToTopButton from './Components/Main/ScrollToTopButton';
import NotifyCard from './Components/Main/Landing Comp/NotifyCard';

// Main components
const MainComponents = {
    ImgSld: lazy(() => import('./Components/Main/Landing Comp/ImgSld')),
    Abt: lazy(() => import('./Components/Main/Landing Comp/About')),
    Announce: lazy(() => import('./Components/Main/Landing Comp/announcements')),
    Event: lazy(() => import('./Components/Main/Landing Comp/Events')),
    Tracker: lazy(() => import('./Components/Main/Landing Comp/Tracker')),
    Samplereact: lazy(() => import('./Components/Main/Landing Comp/Courses')),
    Contact: lazy(() => import('./Components/Main/Landing Comp/ContactIcon')),
    Footer: lazy(() => import('./Components/Main/Landing Comp/Footer')),
    ScrollToTopButton: lazy(() => import('./Components/Main/ScrollToTopButton')),
    NotifyCard: lazy(()=>import('./Components/Main/Landing Comp/NotifyCard'))
};

// Admin components
const AdminComponents = {
    ImgSld: lazy(() => import('./Components/Admin/Landing Comp/ImgSld')),
    Abt: lazy(() => import('./Components/Admin/Landing Comp/About')),
    Announce: lazy(() => import('./Components/Admin/Landing Comp/announcements')),
    Event: lazy(() => import('./Components/Admin/Landing Comp/Events')),
    NotifySection: lazy(() => import('./Components/Admin/Landing Comp/NotifySection')),
    Tracker: lazy(() => import('./Components/Admin/Landing Comp/Tracker')),
    Samplereact: lazy(() => import('./Components/Admin/Landing Comp/Courses')),
    Contact: lazy(() => import('./Components/Admin/Landing Comp/ContactIcon')),
    Footer: lazy(() => import('./Components/Admin/Landing Comp/Footer')),
    ScrollToTopButton: lazy(() => import('./Components/Admin/ScrollToTopButton')),
    
};

const LandingPage = ({ theme, load, toggle, pageData, isAdmin }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showPopup, setShowPopup] = useState(true);

    const pageDetails = pageData?.find((item) => item.type === "page_details")?.data || [];
    const bannerData = pageData?.find((item) => item.type === "banner")?.data || [];
    const departmentBanner = pageData?.find((item) => item.type === "department_banner")?.data || [];
    const notifications = pageData?.find((item) => item.type === "notifications")?.data || [];
    const announcements = pageData?.find((item) => item.type === "announcements")?.data || [];
    const specialAnnouncements = pageData?.find((item) => item.type === "special_announcements")?.data || [];
    const events = pageData?.find((item) => item.type === "events")?.data || [];
    const newscard = pageData?.find((item) => item.type === "news_card")?.data || [];

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

    const components = isAdmin ? AdminComponents : MainComponents;

    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center"><LoadComp /></div>}>
            <SharedLandingLayout
                components={components}
                theme={theme}
                load={load}
                toggle={toggle}
                pageData={pageData}
                isOnline={isOnline}
                showPopup={showPopup}
                setShowPopup={setShowPopup}
                isAdmin={isAdmin}
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
                    <Contact data={pageDetails[0]}/>
                    {/* <Chat/> */}
                    <Footer theme={theme} data={pageDetails[0]}/>
                </div>
            </div>
            <ScrollToTopButton/>,
            {showPopup && (
                <NotifyCard onClose={() => setShowPopup(false)} data={newscard} />
            )}
        </Suspense>
    );
};

export default LandingPage;
