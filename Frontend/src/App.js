import React, { useRef, useState, useCallback, useEffect, lazy, Suspense } from "react";
import { Router, Routes, Route, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import styled from "styled-components";
import { createGlobalStyle } from "styled-components";
import Cookies from "universal-cookie";
import useGoogleAnalytics from "./useAnalytics.js";
import LandingPage from "./Landing.jsx"; // Keep eager, internal parts are lazy
import LoadComp from "./Components/Main/LoadComp.jsx";
import axios from 'axios';
import SideButton from "./Components/Main/sideButton.jsx";
import ScrollToTopButton from "./Components/Main/ScrollToTopButton.jsx";
import RateLimitReach from "./ratelimit.jsx";
import { useNavigate } from "react-router";
import DynamicTitle from "./Header.jsx"; // This seems to be just a title updater, keep eager
import { routeConfig } from "./routeConfig.js";
import { getRouteElement } from "./getRouteElement.js";

// Lazy load components
const Boot = lazy(() => import("./Components/Main/Landing Comp/BootUp"));
const Head = lazy(() => import("./Components/Main/Landing Comp/Head.jsx"));
const Footer = lazy(() => import("./Components/Main/Landing Comp/Footer.jsx"));
const TermsandCon = lazy(() => import("./Components/Main/Landing Comp/Terms_and_Con_.jsx"));
const AbtUs = lazy(() => import("./Components/Main/Top_Nav_Bar/About Us/AbtUs.jsx"));
const Collegevisionmission = lazy(() => import("./Components/Main/Top_Nav_Bar/About Us/collegevisionmission.jsx"));
const Management = lazy(() => import("./Components/Main/Top_Nav_Bar/About Us/Management.jsx"));
const NewTrust = lazy(() => import("./Components/Main/Top_Nav_Bar/About Us/Trust.jsx"));
const ExecutiveCommittee = lazy(() => import("./Components/Main/Top_Nav_Bar/Administration/Executive commitee.jsx"));
const CollegeOrgChart = lazy(() => import("./Components/Main/Top_Nav_Bar/Administration/Organization_chart.jsx"));
const Facultyprofile = lazy(() => import("./Components/Main/Top_Nav_Bar/Academics/sections/Facultyprofile.jsx"));
const Alumni = lazy(() => import("./Components/Main/Second_Nav_Bar/Alumni/Alumni.jsx"));
const OtherFacilities = lazy(() => import("./Components/Main/Second_Nav_Bar/other_facilities/Other-Facilities.jsx"));
const WebTeam = lazy(() => import("./Components/Main/Second_Nav_Bar/Club/web Team/webteam.jsx"));
const StudentLayout = lazy(() => import("./Components/Digital Hostel/Layouts/StudentDashboard.jsx"));
const WardenLayout = lazy(() => import("./Components/Digital Hostel/Layouts/WardenDashboard.jsx"));
const SuperiorLayout = lazy(() => import("./Components/Digital Hostel/Layouts/SuperiorDashboard.jsx"));
const SecurityLayout = lazy(() => import("./Components/Digital Hostel/Layouts/SecurityDashboard.jsx"));
const HostelLoginDigital = lazy(() => import("./Components/Digital Hostel/HostelPages/Hostel Login.jsx"));
const ForgotPassword = lazy(() => import("./Components/Digital Hostel/HostelPages/ForgetPassword.jsx"));
const HostelHeader = lazy(() => import("./Components/Digital Hostel/HostelPages/HeadHeader.jsx"));
const NotFound = lazy(() => import("./NotFound"));
const ErrorLogPage = lazy(() => import("./Components/Developer_stuffs/errorlog/errorlog.jsx"));
const HitLogs = lazy(() => import("./Components/Developer_stuffs/AnalyticsDashboard/HitLogs"));
const EnquiryWeb = lazy(() => import("./Components/Main/Second_Nav_Bar/Club/web Team/enquiryWeb.jsx"));
const AuthPage = lazy(() => import("./Components/Admin/Auth/auth.jsx"));
const Aishe = lazy(() => import("./Components/Main/Top_Nav_Bar/About Us/Aishe.jsx"));

const GlobalStyle = createGlobalStyle`
    /* Global Cursor Style */
    body {
        cursor: url("/cursor.svg") 10 0, auto; /* Custom cursor with defined hotspot */
        overflow: auto;
        -ms-overflow-style: none;
        scrollbar-width: none;
        overflow-x: hidden; 
    }

    html {
        overflow-x: hidden;
    }

    body::-webkit-scrollbar {
        display: none; 
    }

    button, a, .clickable {
        cursor: url("/cursor.svg") 0 0, auto;
    }
    `;

const AppContainer = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
`;

const MainContentWrapper = styled.div`
flex: 1;
padding-top: 8.69%;
`;

const App = () => {
    const footerRef = useRef(null);
    const location = useLocation();
    const [currentPath, setCurrentPath] = useState(location.pathname);
    const cookies = new Cookies()
    const [landingData, setLandingData] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const navigate = useNavigate();
    useGoogleAnalytics();
    const footer = landingData?.find((item) => item.type === "page_details")?.data || [];

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
                if (error.response && error.response.data.status === 429) {
                    navigate('/ratelimit', { state: { msg: error.response.data.message } })
                }
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

    if (cookies.get('theme') === undefined) cookies.set('theme', 'light')


    const [loaded, setLoaded] = useState(false);
    const [theme, setTheme] = useState(cookies.get('theme'));

    let isAuth = cookies.get('firstTime') !== undefined && +(cookies.get('firstTime')) > 3
    if (cookies.get('firstTime') === undefined) cookies.set('firstTime', 0)
    else if (cookies.get('firstTime') < 5) cookies.set('firstTime', +(cookies.get('firstTime')) + 1)

    const load = useCallback(() => {
        setLoaded(true);
    })

    const toggle = useCallback(() => {
        if (theme === "light") cookies.set('theme', 'dark')
        else cookies.set('theme', 'light')
        setTheme(cookies.get('theme'))
    })

    const [showBoot, setShowBoot] = useState(true);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setShowBoot(false);
        }, 4000); // or when isLoaded is true

        return () => clearTimeout(timeout);
    }, [loaded]);

    useEffect(() => {
        setCurrentPath(location.pathname); // Update state when route changes
    }, [location]);

    if (!isOnline) {
        return (
            <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
                <LoadComp txt={"You are offline"} />
            </div>
        );
    }

    const isHostelRoute = currentPath.startsWith("/hostel");


    const session = JSON.parse(sessionStorage.getItem("userSession"));

    return (
        <>
            <GlobalStyle />
            {/* The rest of the routes */}
            <AppContainer className={`App ${theme} bg-prim dark:bg-drkp text-text dark:text-drkt`}>
                {window.location.pathname === "/" && showBoot && (
                    <Suspense fallback={null}>
                        <Boot isAuth={isAuth} isLoaded={loaded} theme={theme} />
                    </Suspense>
                )}
                {/* Conditionally render Head and Footer */}
                <>
                    <Suspense fallback={<div className="h-20 bg-prim dark:bg-drkp"></div>}>
                        {currentPath.startsWith("/hostel") ? <HostelHeader /> : <Head />}
                    </Suspense>
                    <MainContentWrapper id="main-content" className="overflow-y-auto h-full">
                        <DynamicTitle />
                        <Suspense fallback={<div className="h-screen flex items-center justify-center"><LoadComp /></div>}>
                            <Routes>
                                <Route path="/" drk
                                    element={
                                        <LandingPage
                                            load={load}
                                            toggle={toggle}
                                            theme={theme}
                                            pageData={landingData}
                                            isAdmin={session && session.routes.includes("/")}
                                        />
                                    }
                                />
                                <Route path="/abt-us" drk element={<AbtUs toggle={toggle} theme={theme} />} />
                                <Route path="/abt-yr" drk element={<Aishe toggle={toggle} theme={theme} />} />
                                <Route path="/Term_and_Conditions" drk element={<TermsandCon toggle={toggle} theme={theme} />} />
                                <Route path="/trust" drk element={<NewTrust toggle={toggle} theme={theme} />} />
                                <Route path="/v_m" drk element={<Collegevisionmission toggle={toggle} theme={theme} />} />
                                <Route path="/management" drk element={<Management toggle={toggle} theme={theme} />} />
                                <Route path="/committee" drk element={<ExecutiveCommittee toggle={toggle} theme={theme} />} />
                                <Route path="/clg-org" drk element={<CollegeOrgChart toggle={toggle} theme={theme} />} />

                                <Route path="/facultyprofile/:uid" drk element={<Facultyprofile toggle={toggle} theme={theme} />}></Route>

                                <Route path="/alumni" drk element={<Alumni toggle={toggle} theme={theme} />} />
                                {/* <Route path="/sports" drk element={<SportsPage toggle={toggle} theme={theme} />} /> */}
                                <Route path="/other-facilities" drk element={<OtherFacilities toggle={toggle} theme={theme} />} />
                                <Route path="/webteam" drk element={<WebTeam toggle={toggle} theme={theme} />} />
                                <Route path="/web_contact" drk element={<EnquiryWeb toggle={toggle} theme={theme} />} />
                                {/* Hostel Pages */}
                                <Route path="/hostel/student/*" element={<StudentLayout />} />
                                <Route path="/hostel/warden/*" element={<WardenLayout />} />
                                <Route path="/hostel/superior/*" element={<SuperiorLayout />} />
                                <Route path="/hostel/security/*" element={<SecurityLayout />} />
                                <Route path="/hostel/login" element={<HostelLoginDigital />} />
                                <Route path="/hostel/forget-password" element={<ForgotPassword />} />
                                {/* Developer Stuffs */}
                                <Route path="/errorlog" element={<ErrorLogPage />} />
                                <Route path="/hit_logs" element={<HitLogs />} />
                                <Route path="/admin_auth" drk element={<AuthPage toggle={toggle} theme={theme} />} />

                                {/* Admin based route */}
                                {Object.keys(routeConfig).map((path) => (
                                    <Route
                                        key={path}
                                        path={path}
                                        drk
                                        element={getRouteElement(path, session, toggle, theme)}
                                    />
                                ))}

                                {/*  404 - Page not found  */}
                                <Route path="*" element={<NotFound />} />
                                {/* Rate limit page */}
                                <Route path="/ratelimit" element={<RateLimitReach />} />
                            </Routes>
                        </Suspense>

                    </MainContentWrapper>
                    {!isHostelRoute && (
                        <Suspense fallback={null}>
                            <Footer theme={theme} data={footer?.[0]} ref={footerRef} />
                        </Suspense>
                    )}

                    <SideButton />
                    <ScrollToTopButton />
                </>
            </AppContainer>
        </>
    );
};

export default App;