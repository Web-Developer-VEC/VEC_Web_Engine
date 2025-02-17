import React, { useRef, useState, useCallback } from "react";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
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
/* Admisiion Pages Imports */
import UgAdmission from "./Components/Top_Nav_Bar/Admission/UgAdmission.jsx";
import ME from "./Components/Top_Nav_Bar/Admission/ADM-M.E.jsx";
import MBA from "./Components/Top_Nav_Bar/Admission/ADM-MBA.jsx";
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
import NBA from "./Components/Second_Nav_Bar/NBA_F.jsx";
import NAAC from "./Components/Second_Nav_Bar/naac.jsx";
import NIRF from "./Components/Second_Nav_Bar/nirf.jsx";
import IIC from "./Components/Second_Nav_Bar/iic.jsx";
import NSS from "./Components/Second_Nav_Bar/NSS/NSS.jsx"
import YRC from "./Components/Second_Nav_Bar/YRC.jsx"
import SportsPage from "./Components/Second_Nav_Bar/sports/SportsPage.jsx";
import Transport from "./Components/Second_Nav_Bar/Transport/Transport.jsx"
import Library from "./Components/Second_Nav_Bar/library/LibraryLayout.jsx"
import Hostel from "./Components/Second_Nav_Bar/Hostel/Hostel.jsx";
import Login from "./Components/Second_Nav_Bar/Login.jsx";
import OtherFacilities from "./Components/Second_Nav_Bar/Other-Facilities.jsx";
import GrievanceForm from "./Components/Second_Nav_Bar/Grievences.jsx";


const GlobalStyle = createGlobalStyle`
    /* Global Cursor Style */
    body {
        cursor: url("/cursor.svg") 10 0, auto; /* Custom cursor with defined hotspot */
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
    const [loaded, setLoaded] = useState(false);

    const cookies = new Cookies()
    let isAuth = cookies.get('firstTime') !== undefined && +(cookies.get('firstTime')) > 3
    if (cookies.get('firstTime') === undefined) cookies.set('firstTime', 0)
    else cookies.set('firstTime', +(cookies.get('firstTime')) + 1)

    const load = useCallback(() => {
        setLoaded(true);
        console.log("Called back")
    })

    return (
        <>
            <GlobalStyle/>
            {/* The rest of the routes */}
            <Router>
                {window.location.pathname === "/" && (<Boot isAuth={isAuth} isLoaded={loaded} />)}
                <AppContainer className="App bg-white">
                    {/* Conditionally render Head and Footer */}
                    <>
                        <Head/>
                        <MainContentWrapper>
                            <Routes>
                                <Route path="/" element={<LandingPage load={load}/>}/>
                                <Route path="/abt-us" element={<AbtUs/>}/>
                                <Route path="/trust" element={<Trust/>}/>
                                <Route path="/v_m" element={<Collegevisionmission/>}/>
                                <Route path="/management" element={<Management/>}/>
                                <Route path="/principal" element={<Princ/>}/>
                                <Route path="/dean" element={<Dean/>}/>
                                <Route path="/admin" element={<CardPage/>}/>
                                <Route path="/committee" element={<ExecutiveCommittee/>}/>
                                <Route path="/clg-org" element={<CollegeOrgChart/>}/>
                                <Route path="/dept/:deptID" element={<DepartmentPage/>}/>
                                <Route path="/facultyprofile/:uid" element={<Facultyprofile/>}></Route>
                                <Route path="/ug" element={<UgAdmission/>}/>
                                <Route path="/m_e" element={<ME/>}/>
                                <Route path="/mba" element={<MBA/>}/>
                                <Route path="/reg" element={<REGULATION/>}/>
                                <Route path="/Syllabus" element={<Syllabus/>}/>
                                <Route path="/form" element={<Forms/>}/>
                                <Route path="/Academic" element={<Academres/>}/>
                                <Route path="/Sponseredresearch" element={<Sponsres/>}/>
                                <Route path="/journal" element={<JounalPub/>}/>
                                <Route path="/conference" element={<ConfPub/>}/>
                                <Route path="/patents" element={<Patentsres/>}/>
                                <Route path="/Bookpubliction" element={<Bookres/>}/>
                                <Route path="/abtplace" element={<Aboutplacement/>}/>
                                <Route path="/place-team" element={<PlacementTeam/>}/>
                                <Route path="/place-dep" element={<PlacementDetails/>}/>
                                <Route path="/proudalumni" element={<ProudAlumni/>}/>
                                <Route path="/nba" element={<NBA/>}/>
                                <Route path="/naac" element={<NAAC/>}/>
                                <Route path="/nirf" element={<NIRF/>}/>
                                <Route path="/iic" element={<IIC/>}/>
                                <Route path="/NSS" element={<NSS/>}/>
                                <Route path="/YRC" element={<YRC/>}/>
                                <Route path="/sports" element={<SportsPage/>}/>
                                <Route path="/trans" element={<Transport/>}/>
                                <Route path="/library" element={<Library/>}/>
                                <Route path="/hostel" element={<Hostel/>}/>
                                <Route path="/other-facilities" element={<OtherFacilities />} />
                                <Route path="/greviences" element={<GrievanceForm />}/>
                                <Route path='/login' element={<Login/>}/>
                            </Routes>
                        </MainContentWrapper>
                        <Footer ref={footerRef}/>
                    </>
                </AppContainer>
            </Router>
        </>
    );
};

export default App;
