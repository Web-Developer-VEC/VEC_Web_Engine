import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";
import React, { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import Cookies from "universal-cookie";
import AdminSideButton from "./Components/Admin/sideButton.jsx";
import Footer from "./Components/Main/Landing Comp/Footer.jsx";
import LoadComp from "./Components/Main/LoadComp.jsx";
import ScrollToTopButton from "./Components/Main/ScrollToTopButton.jsx";
import SideButton from "./Components/Main/sideButton.jsx";
import { getRouteElement } from "./getRouteElement.js";
import DynamicTitle from "./Header.jsx"; // This seems to be just a title updater, keep eager
import LandingPage from "./Landing.jsx"; // Keep eager, internal parts are lazy
import RateLimitReach from "./ratelimit.jsx";
import { routeConfig } from "./routeConfig.js";
import useGoogleAnalytics from "./useAnalytics.js";
import useIsMobile from "./Components/hooks/useIsMobile.jsx"

// Lazy load components
const Boot = lazy(() => import("./Components/Main/Landing Comp/BootUp"));
const Head = lazy(() => import("./Components/Main/Landing Comp/Head.jsx"));
const AdminHead = lazy(() => import("./Components/Admin/Landing Comp/Head.jsx"));
const TermsandCon = lazy(() => import("./Components/Main/Landing Comp/Terms_and_Con_.jsx"));
const Facultyprofile = lazy(() => import("./Components/Main/Top_Nav_Bar/Academics/sections/Facultyprofile.jsx"));
const Alumni = lazy(() => import("./Components/Main/Second_Nav_Bar/Alumni/Alumni.jsx"))
const WebTeam = lazy(() => import("./Components/Main/Second_Nav_Bar/Club/web Team/webteam.jsx"));
const NotFound = lazy(() => import("./NotFound"));
const ErrorLogPage = lazy(() => import("./Components/Developer_stuffs/errorlog/errorlog.jsx"));
const HitLogs = lazy(() => import("./Components/Developer_stuffs/AnalyticsDashboard/HitLogs"));
const EnquiryWeb = lazy(() => import("./Components/Main/Second_Nav_Bar/Club/web Team/enquiryWeb.jsx"));
const AuthPage = lazy(() => import("./Components/Admin/Auth/auth.jsx"));
const Career = lazy(() => import("./Components/Main/Landing Comp/career.jsx"));
const ForgotPassword = lazy(() => import("./Components/Admin/Auth/ForgotPassword.jsx"))
const MobileBlocked = lazy(() => import("./Components/Admin/MobileBlocked.jsx"))

/* General Forms */
const AppraisalReport = React.lazy(() => import("./Components/Main/Forms/Appraisal/Appraisal Download/AppraisalReport.jsx"));
const AppraisalForm = React.lazy(() => import("./Components/Main/Forms/Appraisal/Appraisal Form/AppraisalForm.jsx"));

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
    const location = useLocation();
    const [currentPath, setCurrentPath] = useState(location.pathname);
    const cookies = new Cookies()
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [landingData, setLandingData] = useState(null);
    const footer = landingData?.find((item) => item.type === "page_details")?.data || [];
    const footerRef = useRef(null);
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    useGoogleAnalytics();

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

    const session = JSON.parse(sessionStorage.getItem("userSession"));
    const isFooter = currentPath === "/";

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
                {/* Conditionally render Head */}
                <>
                    <Suspense fallback={<div className="h-20 bg-prim dark:bg-drkp"></div>}>
                        {session ? <AdminHead /> : <Head />}
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

                                    {/* Admin based route */}
                                    {Object.keys(routeConfig).map((path) => (
                                        <Route
                                            key={path}
                                            path={path}
                                            element={
                                                session &&
                                                session.routes.includes(path) &&
                                                isMobile ? (
                                                    <MobileBlocked />
                                                ) : (
                                                    getRouteElement(path, session, toggle, theme)
                                                )
                                            }
                                        />
                                    ))}
                            
                                <Route path="/facultyprofile/:uid" drk element={<Facultyprofile toggle={toggle} theme={theme} />} />
                                <Route path="/careers" drk element={<Career toggle={toggle} theme={theme} />} />
                                <Route path="/webteam" drk element={<WebTeam toggle={toggle} theme={theme} />} />
                                <Route path="/web_contact" drk element={<EnquiryWeb toggle={toggle} theme={theme} />} />

                                {/* Developer Stuffs */}
                                <Route path="/errorlog" element={<ErrorLogPage />} />
                                <Route path="/hit_logs" element={<HitLogs />} />
                                <Route path="/admin_auth" drk element={<AuthPage toggle={toggle} theme={theme} />} />
                                <Route path="/forgot_password" drk element={<ForgotPassword toggle={toggle} theme={theme} />} />
                                <Route path="/alumni" drk element={<Alumni toggle={toggle} theme={theme} />} />
                                <Route path="/Term_and_Conditions" drk element={<TermsandCon toggle={toggle} theme={theme} />} />
                                {/*  General Forms  */}
                                <Route path="/appraisalreport" element={<AppraisalReport />} />
                                <Route path="/appraisalform" element={<AppraisalForm />} />

                                {/*  conditional routes  */}
                                <Route path="/vec-connect/*" element={<Navigate to="/" replace />} />
                                <Route path="/Accreditation" element={<Navigate to="/" replace />} />

                                {/*  404 - Page not found  */}
                                <Route path="*" element={<NotFound />} />
                                {/* Rate limit page */}
                                <Route path="/ratelimit" element={<RateLimitReach />} />
                            </Routes>
                        </Suspense>

                    </MainContentWrapper>
                    {!isFooter && (
                        <Suspense fallback={null}>
                            <Footer theme={theme} data={footer?.[0]} ref={footerRef} />
                        </Suspense>
                    )}
                    {session && session.routes.includes("/") && currentPath === "/" ? <AdminSideButton/> : <SideButton/>}
                    <ScrollToTopButton />

                </>
            </AppContainer>
        </>
    );
};

export default App;