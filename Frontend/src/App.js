import React, { useRef, useState, useCallback, useEffect } from "react";
import { Router, Routes, Route, useLocation} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import styled from "styled-components";
import {createGlobalStyle} from "styled-components";
import Cookies from "universal-cookie";
/* Landing Page Imports */
import Boot from "./Components/Landing Comp/BootUp";
import LandingPage from "./Landing.jsx";
import Head from "./Components/Landing Comp/Head.jsx";
import Footer from "./Components/Landing Comp/Footer.jsx";
/* AboutUs Pages Imports */
import AbtUs from "./Components/Top_Nav_Bar/About Us/AbtUs.jsx";
import Trust from "./Components/Top_Nav_Bar/About Us/Trust.jsx";
import Collegevisionmission from "./Components/Top_Nav_Bar/About Us/collegevisionmission.jsx";
import Management from "./Components/Top_Nav_Bar/About Us/Management.jsx";
/* Administration Pages Imports */
import Princ from "./Components/Top_Nav_Bar/Administration/Princ.jsx";
import Dean from "./Components/Top_Nav_Bar/Administration/dean.jsx";
import CardPage from "./Components/Top_Nav_Bar/Administration/admin.jsx";
import ExecutiveCommittee from "./Components/Top_Nav_Bar/Administration/Executive commitee.jsx";
import CollegeOrgChart from "./Components/Top_Nav_Bar/Administration/Organization_chart.jsx";
/* Academics Pages Imports */
import DepartmentPage from "./Components/Top_Nav_Bar/Academics/DepartmentPage.jsx";
import Facultyprofile from './Components/Top_Nav_Bar/Academics/sections/Facultyprofile.jsx'
import AcademicDepartments from "./Components/Top_Nav_Bar/Academics/Department.jsx";
import Programmes from "./Components/Top_Nav_Bar/Academics/Programmes.jsx";
/* Admisiion Pages Imports */
import UgAdmission from "./Components/Top_Nav_Bar/Admission/UgAdmission.jsx";
import ME from "./Components/Top_Nav_Bar/Admission/ADM-M.E.jsx";
import MBA from "./Components/Top_Nav_Bar/Admission/ADM-MBA.jsx";
import PHD from "./Components/Top_Nav_Bar/Admission/PhdAdmission.jsx";
/* Exams Pages Imports */
import REGULATION from "./Components/Top_Nav_Bar/Exams/Regulation.jsx";
import Syllabus from "./Components/Top_Nav_Bar/Exams/Syllabus.jsx";
import Forms from "./Components/Top_Nav_Bar/Exams/forms.jsx";
/* Research Pages Import */
import Academres from "./Components/Top_Nav_Bar/Research/Academicresearch.jsx";
import Sponsres from "./Components/Top_Nav_Bar/Research/Sponseredresearch.jsx";
import JounalPub from "./Components/Top_Nav_Bar/Research/Journalpublication.jsx";
import ConfPub from "./Components/Top_Nav_Bar/Research/Conferencepublication.jsx";
import Patentsres from "./Components/Top_Nav_Bar/Research/Patent.jsx";
import Bookres from "./Components/Top_Nav_Bar/Research/Bookpublication.jsx";
/* Placements Pages Imports */
import Aboutplacement from "./Components/Top_Nav_Bar/Placements/Aboutplacement.jsx";
import {PlacementTeam} from "./Components/Top_Nav_Bar/Placements/PlacementTeam.jsx";
import {PlacementDetails} from "./Components/Top_Nav_Bar/Placements/PlacementDetails.jsx";
import ProudAlumni from "./Components/Top_Nav_Bar/Placements/ProudAlumni.jsx";
/* Second_Nav_Bar Pages Imports */
import IQAC from "./Components/Second_Nav_Bar/IQAC.jsx";
import NBA from "./Components/Second_Nav_Bar/Accredation/NBA_F.jsx";
// import IQAC from "./Components/Second_Nav_Bar/IQAC.jsx";
import NAAC from "./Components/Second_Nav_Bar/Accredation/naac.jsx";
import NIRF from "./Components/Second_Nav_Bar/Accredation/nirf.jsx";
import IIC from "./Components/Second_Nav_Bar/iic.jsx";
import Alumni from "./Components/Second_Nav_Bar/Alumni.jsx";
import NSS from "./Components/Second_Nav_Bar/NSS/NSS.jsx";
import NCC from "./Components/Second_Nav_Bar/NCC/NCC_MAIN.jsx";
import YRC from "./Components/Second_Nav_Bar/YRC.jsx";
import SportsPage from "./Components/Second_Nav_Bar/sports/SportsPage.jsx";
import Transport from "./Components/Second_Nav_Bar/Transport/Transport.jsx"
import Library from "./Components/Second_Nav_Bar/library/LibraryLayout.jsx"
import Hostel from "./Components/Second_Nav_Bar/Hostel/Hostel.jsx";
import Login from "./Components/Second_Nav_Bar/Login.jsx";
import OtherFacilities from "./Components/Second_Nav_Bar/Other-Facilities.jsx";
import GrievanceForm from "./Components/Second_Nav_Bar/Grievences.jsx";
// Digital Hostel
import StudentLayout from "./Components/Digital Hostel/Layouts/StudentDashboard.jsx";
import WardenLayout from "./Components/Digital Hostel/Layouts/WardenDashboard.jsx";
import SuperiorLayout from "./Components/Digital Hostel/Layouts/SuperiorDashboard.jsx";
import SecurityLayout from "./Components/Digital Hostel/Layouts/SecurityDashboard.jsx";
import HostelLoginDigital from "./Components/Digital Hostel/HostelPages/Hostel Login.jsx";
import ForgotPassword from "./Components/Digital Hostel/HostelPages/ForgetPassword.jsx";
import HostelHeader from "./Components/Digital Hostel/HostelPages/HeadHeader.jsx";
import Researchtable from "./Components/Top_Nav_Bar/Research/Researchtable.jsx";
import NotFound from "./NotFound";
import Crdt from "./Components/Credits/Crdt.jsx";
import Accredation from "./Components/Second_Nav_Bar/Accredation/Accredation.jsx";
import Acadamiccal from "./Components/Top_Nav_Bar/Academics/academicscalendar.jsx";
import Coe from "./Components/Top_Nav_Bar/Exams/Coe.jsx";
import axios from 'axios';
import ScrollUp from "./Components/ScrollUp.jsx";
import Ecell from "./Components/Second_Nav_Bar/E-cell/aboutEcell.jsx";
import Incub from "./Components/Second_Nav_Bar/Incubation/InCub.jsx";
import ADMteam from "./Components/Top_Nav_Bar/Admission/ADM-Team.jsx";
import TermsandCon from "./Components/Landing Comp/Terms_and_Con_.jsx";


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

    if (cookies.get('theme') === undefined) cookies.set('theme', 'light')


    const [loaded, setLoaded] = useState(false);
    const [theme, setTheme] = useState(cookies.get('theme'));

    let isAuth = cookies.get('firstTime') !== undefined && +(cookies.get('firstTime')) > 3
    if (cookies.get('firstTime') === undefined) cookies.set('firstTime', 0)
    else if(cookies.get('firstTime') < 5) cookies.set('firstTime', +(cookies.get('firstTime')) + 1)

    const load = useCallback(() => {
        setLoaded(true);
    })

    const toggle = useCallback(() => {
        if(theme === "light") cookies.set('theme', 'dark')
        else cookies.set('theme', 'light')
        setTheme(cookies.get('theme'))
    })

    useEffect(() => {
        setCurrentPath(location.pathname); // Update state when route changes
    }, [location]);

    const isHostelRoute = currentPath.startsWith("/hostel")

    return (
        <>
            <GlobalStyle/>
            {/* The rest of the routes */}
                    <AppContainer className={`App ${theme} bg-prim dark:bg-drkp text-text dark:text-drkt`}>
                    {window.location.pathname === "/" && (<Boot isAuth={isAuth} isLoaded={loaded} theme={theme} />)}
                    {/* Conditionally render Head and Footer */}
                    <>
                        {/* <Head/> */}
                        {currentPath.startsWith("/hostel") ? <HostelHeader /> : <Head />}
                        <MainContentWrapper>
                            <Routes>
                                <Route path="/" drk element={<LandingPage load={load} toggle={toggle} theme={theme} />}/>
                                <Route path="/abt-us" drk element={<AbtUs toggle={toggle} theme={theme}/>}/>
                                <Route path="/Term_and_Conditions" drk element={<TermsandCon toggle={toggle} theme={theme}/> }/>
                                <Route path="/trust" drk element={<Trust toggle={toggle} theme={theme}/>}/>
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
                                <Route path="/phd" drk element={<PHD toggle={toggle} theme={theme}/>}/>
                                <Route path="/admission-team" drk element={<ADMteam toggle={toggle} theme={theme}/>}/>
                                <Route path="/reg" drk element={<REGULATION toggle={toggle} theme={theme}/>}/>
                                <Route path="/Syllabus" drk element={<Syllabus toggle={toggle} theme={theme}/>}/>
                                <Route path="/form" dork element={<Forms toggle={toggle} theme={theme}/>}/>
                                <Route path="/Academic" drk element={<Academres toggle={toggle} theme={theme}/>}/>
                                <Route path="/coe" drk element={<Coe toggle={toggle} theme={theme}/>}/>
                                <Route path="/Sponseredresearch" drk element={<Sponsres toggle={toggle} theme={theme}/>}/>
                                <Route path="/journal" drk element={<JounalPub toggle={toggle} theme={theme}/>}/>
                                <Route path="/conference" drk element={<ConfPub toggle={toggle} theme={theme}/>}/>
                                <Route path="/patents" drk element={<Patentsres toggle={toggle} theme={theme}/>}/>
                                <Route path="/Bookpubliction" drk element={<Bookres toggle={toggle} theme={theme}/>}/>
                                <Route path="/abtplace" drk element={<Aboutplacement toggle={toggle} theme={theme}/>}/>
                                <Route path="/place-team" drk element={<PlacementTeam toggle={toggle} theme={theme}/>}/>
                                <Route path="/place-dep" drk element={<PlacementDetails toggle={toggle} theme={theme}/>}/>
                                <Route path="/proudalumni" drk element={<ProudAlumni />}/>
                                <Route path="/acadamicresearchtable" drk element={<Researchtable/> }/>

                                <Route path="/nba" drk element={<NBA toggle={toggle} theme={theme}/>}/>
                                <Route path="/Accredation"drk element={<Accredation toggle={toggle} theme={theme}/>}/>
                                <Route path="/iqac" drk element={<IQAC toggle={toggle} theme={theme}/>}/>
                                <Route path="/naac" drk element={<NAAC toggle={toggle} theme={theme}/>}/> 
                                <Route path="/nirf" drk element={<NIRF toggle={toggle} theme={theme}/>}/>
                                <Route path="/iic" drk element={<IIC toggle={toggle} theme={theme}/>}/> 
                                <Route path="/ecell" drk element={<Ecell toggle={toggle} theme={theme}/>}/>
                                <Route path="/incubation" drk element={<Incub toggle={toggle} theme={theme}/>}/>
                                <Route path="/alumni" drk element={<Alumni toggle={toggle} theme={theme}/>}/>
                                <Route path="/NSS" drk element={<NSS toggle={toggle} theme={theme}/>}/>
                                <Route path="/NCC" drk element={<NCC toggle={toggle} theme={theme}/>}/>
                                <Route path="/YRC" drk element={<YRC toggle={toggle} theme={theme}/>}/>
                                <Route path="/sports" drk element={<SportsPage toggle={toggle} theme={theme}/>}/>
                                <Route path="/transport" drk element={<Transport toggle={toggle} theme={theme}/>}/>
                                <Route path="/library" drk element={<Library toggle={toggle} theme={theme}/>}/>
                                <Route path="/hosLanding" drk element={<Hostel toggle={toggle} theme={theme}/>}/>
                                <Route path="/other-facilities" drk element={<OtherFacilities toggle={toggle} theme={theme}/>} />
                                <Route path="/grievances" drk element={<GrievanceForm toggle={toggle} theme={theme} />}/>
                                <Route path='/login' drk element={<Login/>}/>

                                <Route path="/credits/:ind" element={<Crdt toggle={toggle} theme={theme}/>} />

                                {/* Hostel Pages */}
                                <Route path="/hostel/student/*" element={<StudentLayout />} />
                                <Route path="/hostel/warden/*" element={<WardenLayout />} />
                                <Route path="/hostel/superior/*" element={<SuperiorLayout />} />
                                <Route path="/hostel/security/*" element={<SecurityLayout />} />
                                <Route path="/hostel/login" element={<HostelLoginDigital/>}/>
                                <Route path="/hostel/forget-password" element={<ForgotPassword/>}/>\

                            {/*  404 - Page not found  */}
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </MainContentWrapper>
                        {/* <Footer ref={footerRef}/> */}
                        <ScrollUp/>
                        {!isHostelRoute && <Footer theme={theme} data={landingData?.landing_page_details}/>}
                    </>
                </AppContainer>
        </>
    );
};

export default App;
