import React, { useEffect, useState, lazy, Suspense } from 'react';
import SharedLandingLayout from './SharedLandingLayout';
import LoadComp from './Components/Main/LoadComp';
import Abt from './Components/Main/Landing Comp/About';
import Announce from './Components/Main/Landing Comp/announcements';
import Event from './Components/Main/Landing Comp/Events';
import Tracker from './Components/Main/Landing Comp/Tracker';
import Samplereact from './Components/Main/Landing Comp/Courses';
import Contact from './Components/Main/Landing Comp/ContactIcon'
import Footer from './Components/Main/Landing Comp/Footer';
import ScrollToTopButton from './Components/Main/ScrollToTopButton';
import NotifyCard from './Components/Main/Landing Comp/NotifyCard';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

const LandingPage = ({ theme, load, toggle, isAdmin }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showPopup, setShowPopup] = useState(true);
    const [landingData, setLandingData] = useState(null);
    const navigate = useNavigate();

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responce = await axios.post('/api/main-backend/landing_page_data',
                    {
                        type: "landing_data"
                    }
                );

                setLandingData(responce.data.data);

            } catch (error) {
                console.error("Error fetching thhe landing page Data", error);
                if (error.response.data.status === 429) {
                    navigate('/ratelimit', { state: { msg: error.response.data.message } })
                }
            }
        }

        fetchData();
    }, []);

    const components = isAdmin ? AdminComponents : MainComponents;

    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center"><LoadComp /></div>}>
            <SharedLandingLayout
                components={components}
                theme={theme}
                load={load}
                toggle={toggle}
                pageData={landingData}
                isOnline={isOnline}
                showPopup={showPopup}
                setShowPopup={setShowPopup}
                isAdmin={isAdmin}
            />
        </Suspense>
    );
};

export default LandingPage;