import React, { useEffect, useState, lazy, Suspense } from 'react';
import SharedLandingLayout from './SharedLandingLayout';
import LoadComp from './Components/Main/LoadComp';

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
};

// Admin components
const AdminComponents = {
    ImgSld: lazy(() => import('./Components/Admin/Landing Comp/ImgSld')),
    Abt: lazy(() => import('./Components/Admin/Landing Comp/About')),
    Announce: lazy(() => import('./Components/Admin/Landing Comp/announcements')),
    Event: lazy(() => import('./Components/Admin/Landing Comp/Events')),
    Tracker: lazy(() => import('./Components/Admin/Landing Comp/Tracker')),
    Samplereact: lazy(() => import('./Components/Admin/Landing Comp/Courses')),
    Contact: lazy(() => import('./Components/Admin/Landing Comp/ContactIcon')),
    Footer: lazy(() => import('./Components/Admin/Landing Comp/Footer')),
    ScrollToTopButton: lazy(() => import('./Components/Admin/ScrollToTopButton')),
};

const LandingPage = ({ theme, load, toggle, pageData, isAdmin }) => {
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
            />
        </Suspense>
    );
};

export default LandingPage;
