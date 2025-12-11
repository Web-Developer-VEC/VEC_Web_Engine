import React, { useRef, useState, useCallback, useEffect, Suspense } from "react";
import { Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import styled, { createGlobalStyle } from "styled-components";
import Cookies from "universal-cookie";
import axios from 'axios';
import useGoogleAnalytics from "./useAnalytics.js";

/* Static Imports (Layout & Critical) */
import Boot from "./Components/Main/Landing Comp/BootUp";
import Head from "./Components/Main/Landing Comp/Head.jsx";
import Footer from "./Components/Main/Landing Comp/Footer.jsx";
import HostelHeader from "./Components/Digital Hostel/HostelPages/HeadHeader.jsx";
import SideButton from "./Components/Main/sideButton.jsx";
import ScrollToTopButton from "./Components/Main/ScrollToTopButton.jsx";
import LoadComp from "./Components/Main/LoadComp.jsx";
import DynamicTitle from "./Header.jsx";
import Layout from "./Components/Main/Top_Nav_Bar/Exams/QP/Layout.jsx";

/* Lazy Loaded Components */
/* Landing Page */
const LandingPage = React.lazy(() => import("./Landing.jsx"));
const TermsandCon = React.lazy(() => import("./Components/Main/Landing Comp/Terms_and_Con_.jsx"));

/* AboutUs Pages */
const AbtUs = React.lazy(() => import("./Components/Main/Top_Nav_Bar/About Us/AbtUs.jsx"));
const Collegevisionmission = React.lazy(() => import("./Components/Main/Top_Nav_Bar/About Us/collegevisionmission.jsx"));
const Management = React.lazy(() => import("./Components/Main/Top_Nav_Bar/About Us/Management.jsx"));
const NewTrust = React.lazy(() => import("./Components/Main/Top_Nav_Bar/About Us/Trust.jsx"));
const AbtYear = React.lazy(() => import("./Components/Main/Top_Nav_Bar/About Us/Abtyear.jsx"));

/* Administration Pages */
const Princ = React.lazy(() => import("./Components/Main/Top_Nav_Bar/Administration/Princ.jsx"));
const Dean = React.lazy(() => import("./Components/Main/Top_Nav_Bar/Administration/dean.jsx"));
const CardPage = React.lazy(() => import("./Components/Main/Top_Nav_Bar/Administration/admin.jsx"));
const ExecutiveCommittee = React.lazy(() => import("./Components/Main/Top_Nav_Bar/Administration/Executive commitee.jsx"));
const CollegeOrgChart = React.lazy(() => import("./Components/Main/Top_Nav_Bar/Administration/Organization_chart.jsx"));
const Handbook = React.lazy(() => import("./Components/Main/Top_Nav_Bar/Administration/Handbook.jsx"));

/* Academics Pages */
const DepartmentPage = React.lazy(() => import("./Components/Main/Top_Nav_Bar/Academics/DepartmentPage.jsx"));
const AcademicDepartments = React.lazy(() => import("./Components/Main/Top_Nav_Bar/Academics/Department.jsx"));
const Programmes = React.lazy(() => import("./Components/Main/Top_Nav_Bar/Academics/Programmes.jsx"));
const Acadamiccal = React.lazy(() => import("./Components/Main/Top_Nav_Bar/Academics/academicscalendar.jsx"));
const Facultyprofile = React.lazy(() => import("./Components/Main/Top_Nav_Bar/Academics/sections/Facultyprofile.jsx"));

/* Admission Pages */
const UgAdmission = React.lazy(() => import("./Components/Main/Top_Nav_Bar/Admission/UgAdmission.jsx"));
const ME = React.lazy(() => import("./Components/Main/Top_Nav_Bar/Admission/ADM-M.E.jsx"));
const MBA = React.lazy(() => import("./Components/Main/Top_Nav_Bar/Admission/ADM-MBA.jsx"));
const PhdAdmission = React.lazy(() => import("./Components/Main/Top_Nav_Bar/Admission/PhdAdmission.jsx"));
const ADMteam = React.lazy(() => import("./Components/Main/Top_Nav_Bar/Admission/ADM-Team.jsx"));

/* Exams Pages */
const REGULATION = React.lazy(() => import("./Components/Main/Top_Nav_Bar/Exams/Regulation.jsx"));
const Syllabus = React.lazy(() => import("./Components/Main/Top_Nav_Bar/Exams/Syllabus.jsx"));
const Forms = React.lazy(() => import("./Components/Main/Top_Nav_Bar/Exams/forms.jsx"));
const Coe = React.lazy(() => import("./Components/Main/Top_Nav_Bar/Exams/Coe.jsx"));
const RankHonder = React.lazy(() => import("./Components/Main/Top_Nav_Bar/Exams/rankhonder.jsx"));

/* Research Pages */
const Academres = React.lazy(() => import("./Components/Main/Top_Nav_Bar/Research/Academicresearch.jsx"));
const Policies = React.lazy(() => import("./Components/Main/Top_Nav_Bar/Research/policy.jsx"));
const Consultancy = React.lazy(() => import("./Components/Main/Top_Nav_Bar/Research/Academicresearch.jsx"));
const BookChapter = React.lazy(() => import("./Components/Main/Top_Nav_Bar/Research/BookChapter.jsx"));
const Funded = React.lazy(() => import("./Components/Main/Top_Nav_Bar/Research/Funded.jsx"));
const Journal = React.lazy(() => import("./Components/Main/Top_Nav_Bar/Research/Journal_publica.jsx"));

/* Placements Pages */
const Aboutplacement = React.lazy(() => import("./Components/Main/Top_Nav_Bar/Placements/Aboutplacement.jsx"));
const PlacementTeam = React.lazy(() => import("./Components/Main/Top_Nav_Bar/Placements/PlacementTeam.jsx").then(module => ({ default: module.PlacementTeam })));
const PlacementDetails = React.lazy(() => import("./Components/Main/Top_Nav_Bar/Placements/PlacementDetails.jsx").then(module => ({ default: module.PlacementDetails })));

/* Second_Nav_Bar Pages */
const Accredation = React.lazy(() => import("./Components/Main/Second_Nav_Bar/Accredation/Accredation.jsx"));
const Iic = React.lazy(() => import("./Components/Main/Second_Nav_Bar/IIC/iic.jsx"));
const IQAC = React.lazy(() => import("./Components/Main/Second_Nav_Bar/IQAC/IQAC.jsx"));
const Incub = React.lazy(() => import("./Components/Main/Second_Nav_Bar/Incubation/InCub.jsx"));
const Ecell = React.lazy(() => import("./Components/Main/Second_Nav_Bar/E-cell/aboutEcell.jsx"));
const Alumni = React.lazy(() => import("./Components/Main/Second_Nav_Bar/Alumni/Alumni.jsx"));
const NSS = React.lazy(() => import("./Components/Main/Second_Nav_Bar/NSS/NSS.jsx"));
const NCC = React.lazy(() => import("./Components/Main/Second_Nav_Bar/NCC/NCC_MAIN.jsx"));
const NCC_NAVY = React.lazy(() => import("./Components/Main/Second_Nav_Bar/NCC/NCC_NAVY.jsx"));
const NCC_ARMY = React.lazy(() => import("./Components/Main/Second_Nav_Bar/NCC/NCC_ARMY.jsx"));
const YRC = React.lazy(() => import("./Components/Main/Second_Nav_Bar/yrc/YRC.jsx"));
const SportsPage = React.lazy(() => import("./Components/Main/Second_Nav_Bar/sports/SportsPage.jsx"));
const Transport = React.lazy(() => import("./Components/Main/Second_Nav_Bar/Transport/Transport.jsx"));
const Library = React.lazy(() => import("./Components/Main/Second_Nav_Bar/library/LibraryLayout.jsx"));
const OtherFacilities = React.lazy(() => import("./Components/Main/Second_Nav_Bar/other_facilities/Other-Facilities.jsx"));
const GrievanceForm = React.lazy(() => import("./Components/Main/Second_Nav_Bar/Helpdesk/Grievences.jsx"));
const HostelPage = React.lazy(() => import("./Components/Main/Second_Nav_Bar/Hostel/Hostel.jsx"));
const Gallery = React.lazy(() => import("./Components/Main/Second_Nav_Bar/Gallery/gallery.jsx"));
const Gallerydetails = React.lazy(() => import("./Components/Main/Second_Nav_Bar/Gallery/detailpage.jsx"));
const WebTeam = React.lazy(() => import("./Components/Main/Second_Nav_Bar/Club/web Team/webteam.jsx"));
const EnquiryWeb = React.lazy(() => import("./Components/Main/Second_Nav_Bar/Club/web Team/enquiryWeb.jsx"));

/* Digital Hostel */
const StudentLayout = React.lazy(() => import("./Components/Digital Hostel/Layouts/StudentDashboard.jsx"));
const WardenLayout = React.lazy(() => import("./Components/Digital Hostel/Layouts/WardenDashboard.jsx"));
const SuperiorLayout = React.lazy(() => import("./Components/Digital Hostel/Layouts/SuperiorDashboard.jsx"));
const SecurityLayout = React.lazy(() => import("./Components/Digital Hostel/Layouts/SecurityDashboard.jsx"));
const HostelLoginDigital = React.lazy(() => import("./Components/Digital Hostel/HostelPages/Hostel Login.jsx"));
const ForgotPassword = React.lazy(() => import("./Components/Digital Hostel/HostelPages/ForgetPassword.jsx"));

/* Other Stuffs */
const NotFound = React.lazy(() => import("./NotFound"));
const RateLimitReach = React.lazy(() => import("./ratelimit.jsx"));
const ErrorLogPage = React.lazy(() => import("./Components/Developer_stuffs/errorlog/errorlog.jsx"));
const HitLogs = React.lazy(() => import("./Components/Developer_stuffs/AnalyticsDashboard/HitLogs"));

/*Aptitude */
const Aptitude = React.lazy(() => import("./Components/Main/Aptitude/Approve.jsx"));
const QuestionPage = React.lazy(() => import("./Components/Main/Aptitude/questions.jsx"));

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
                if (error.response.data.status === 429) {
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

    const isHostelRoute = currentPath.startsWith("/hostel")

    return (
        <>
            <GlobalStyle />
            {/* The rest of the routes */}
            <AppContainer className={`App ${theme} bg-prim dark:bg-drkp text-text dark:text-drkt`}>
                {window.location.pathname === "/" && showBoot && (<Boot isAuth={isAuth} isLoaded={loaded} theme={theme} />)}
                {/* Conditionally render Head and Footer */}
                <>
                    {/* <Head/> */}
                    {currentPath.startsWith("/hostel") ? <HostelHeader /> : <Head />}
                    <MainContentWrapper id="main-content" className="overflow-y-auto h-full">
                        <DynamicTitle />
                        <Suspense fallback={<div className="h-screen flex items-center justify-center"><LoadComp /></div>}>
                            <Routes>
                                <Route path="/" drk element={<LandingPage load={load} toggle={toggle} theme={theme} pageData={landingData}/>}/>
                                <Route path="/abt-us" drk element={<AbtUs toggle={toggle} theme={theme}/>}/>
                                <Route path="/abt-yr" drk element={<AbtYear toggle={toggle} theme={theme}/>}/>
                                <Route path="/Term_and_Conditions" drk element={<TermsandCon toggle={toggle} theme={theme}/>}/>
                                <Route path="/trust" drk element={<NewTrust toggle={toggle} theme={theme}/>}/>
                                <Route path="/handbook"  drk element={<Handbook toggle={toggle} theme={theme}/>}/>
                                <Route path="/v_m" dork element={<Collegevisionmission toggle={toggle} theme={theme}/>}/>
                                <Route path="/management" drk element={<Management toggle={toggle} theme={theme}/>}/>
                                <Route path="/principal" drk element={<Princ toggle={toggle} theme={theme}/>}/>
                                <Route path="/dean" drk element={<Dean toggle={toggle} theme={theme}/>}/>
                                <Route path="/admin" drk element={<CardPage toggle={toggle} theme={theme}/>}/>
                                <Route path="/committee" drk element={<ExecutiveCommittee toggle={toggle} theme={theme}/>}/>
                                <Route path="/clg-org" dork element={<CollegeOrgChart toggle={toggle} theme={theme}/>}/>
                                <Route path="/departments" drk element={<AcademicDepartments toggle={toggle} theme={theme}/>}/>
                                <Route path="/programs" drk element={<Programmes toggle={toggle} theme={theme}/>} />
                                <Route path="/acadamic_cal" drk element={<Acadamiccal toggle={toggle} theme={theme}/>} />
                                <Route path="/dept/:deptID" drk element={<DepartmentPage toggle={toggle} theme={theme}/>}/>
                                <Route path="/facultyprofile/:uid" drk element={<Facultyprofile toggle={toggle} theme={theme}/>}></Route>
                                <Route path="/ug" drk element={<UgAdmission toggle={toggle} theme={theme}/>}/>
                                <Route path="/m_e" drk element={<ME toggle={toggle} theme={theme}/>}/>
                                <Route path="/mba" drk element={<MBA toggle={toggle} theme={theme}/>}/>
                                <Route path="/phd" drk element={<PhdAdmission toggle={toggle} theme={theme}/>}/>
                                <Route path="/admission-team" drk element={<ADMteam toggle={toggle} theme={theme}/>}/>
                                <Route path="/reg" drk element={<REGULATION toggle={toggle} theme={theme}/>}/>
                                <Route path="/Syllabus" drk element={<Syllabus toggle={toggle} theme={theme}/>}/>
                                <Route path="/form" dork element={<Forms toggle={toggle} theme={theme}/>}/>
                                <Route path="/Academic" drk element={<Academres toggle={toggle} theme={theme}/>}/>
                                <Route path="/coe" drk element={<Coe toggle={toggle} theme={theme}/>}/>
                                <Route path="/rankholders" drk element={<RankHonder toggle={toggle} theme={theme}/>}/>
                                <Route path="/abtplace" drk element={<Aboutplacement toggle={toggle} theme={theme}/>}/>
                                <Route path="/place-team" drk element={<PlacementTeam toggle={toggle} theme={theme}/>}/>
                                <Route path="/place-dep" drk element={<PlacementDetails toggle={toggle} theme={theme}/>}/>

                                <Route path="/Consultancy" drk element={<Consultancy toggle={toggle} theme={theme}/>}/>
                                <Route path="/Journal" drk element={<Journal toggle={toggle} theme={theme}/>}/>
                                <Route path="/policies" drk element={<Policies toggle={toggle} theme={theme}/>}/>
                                <Route path="/Funded" drk element={<Funded toggle={toggle} theme={theme}/>}/>
                                <Route path="/Book_Chapter" drk element={<BookChapter toggle={toggle} theme={theme}/>}/>
                                
                                <Route path="/Accredation"drk element={<Accredation toggle={toggle} theme={theme}/>}/>
                                <Route path="/iqac" drk element={<IQAC toggle={toggle} theme={theme}/>}/>
                                <Route path="/iic" drk element={<Iic toggle={toggle} theme={theme}/>}/> 
                                <Route path="/ecell" drk element={<Ecell toggle={toggle} theme={theme}/>}/>
                                <Route path="/incubation" drk element={<Incub toggle={toggle} theme={theme}/>}/>
                                <Route path="/alumni" drk element={<Alumni toggle={toggle} theme={theme}/>}/>
                                <Route path="/NSS" drk element={<NSS toggle={toggle} theme={theme}/>}/>
                                <Route path="/NCC" drk element={<NCC toggle={toggle} theme={theme}/>}/>
                                <Route path="/nccnavy" drk element={<NCC_NAVY toggle={toggle} theme={theme}/>}/>
                                <Route path="/nccarmy" drk element={<NCC_ARMY toggle={toggle} theme={theme}/>}/>
                                <Route path="/YRC" drk element={<YRC toggle={toggle} theme={theme}/>}/>
                                <Route path="/sports" drk element={<SportsPage toggle={toggle} theme={theme}/>}/>
                                <Route path="/transport" drk element={<Transport toggle={toggle} theme={theme}/>}/>
                                <Route path="/library" drk element={<Library toggle={toggle} theme={theme}/>}/>
                                <Route path="/hosLanding" drk element={<HostelPage toggle={toggle} theme={theme}/>}/>
                                <Route path="/other-facilities" drk element={<OtherFacilities toggle={toggle} theme={theme}/>} />
                                <Route path="/gallery" drk element={<Gallery toggle={toggle} theme={theme}/>}/>
                                <Route path="/gallery-details" drk element={<Gallerydetails toggle={toggle} theme={theme}/>}/>
                                <Route path="/grievances" drk element={<GrievanceForm toggle={toggle} theme={theme} />}/>
                                <Route path="/webteam" drk element={<WebTeam toggle={toggle} theme={theme} />}/>
                                <Route path="/web_contact" drk element={<EnquiryWeb toggle={toggle} theme={theme}/>}/>
                                {/* Hostel Pages */}
                                <Route path="/hostel/student/*" element={<StudentLayout />} />
                                <Route path="/hostel/warden/*" element={<WardenLayout />} />
                                <Route path="/hostel/superior/*" element={<SuperiorLayout />} />
                                <Route path="/hostel/security/*" element={<SecurityLayout />} />
                                <Route path="/hostel/login" element={<HostelLoginDigital />} />
                                <Route path="/hostel/forget-password" element={<ForgotPassword />} />
                                {/*  Question paper Routes */}
                                <Route path="/preview" element={<Layout />} />
                                {/* Developer Stuffs */}
                                <Route path="/errorlog" element={<ErrorLogPage />} />
                                <Route path="/hit_logs" element={<HitLogs />} />
                                {/* Aptitude Routes */}
                                <Route path="/QA/que" element={<QuestionPage />} />
                                <Route path="/QA/aptitude" element={<Aptitude />} />

                                {/*  404 - Page not found  */}
                                <Route path="*" element={<NotFound />} />
                                {/* Rate limit page */}
                                <Route path="/ratelimit" element={<RateLimitReach />} />
                            </Routes>
                        </Suspense>

                    </MainContentWrapper>
                    {/* <Footer ref={footerRef}/> */}
                    {!isHostelRoute && <Footer theme={theme} data={footer?.[0]} />}

                    <SideButton />
                    <ScrollToTopButton />
                </>
            </AppContainer>
        </>
    );
};

export default App;
