import React, { useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Head from "./Components/Head";
import ImgSld from "./Components/ImgSld";
import Abt from "./Components/About";
import Announce from "./Components/announcements";
import Event from "./Components/Events";
import Tracker from "./Components/Tracker";
import Samplereact from "./Components/Courses";
import Footer from "./Components/Footer";
import Contact from "./Components/ContactIcon";
import Chat from "./Components/ChatPopup";
import Boot from "./Components/BootUp";
import NIRF from "./Components/nirf"; // Ensure this is correctly imported
import NAAC from "./Components/naac";
import NBA from "./Components/NBA_F";
import "bootstrap/dist/css/bootstrap.min.css";
import LandingPage from "./Landing";
import styled from "styled-components";
import DepartmentPage from "./Components/structure/DepartmentPage.js";
import Collegevisionmission from "./Components/Nav_Bar_Comp/collegevisionmission.jsx";
import REGULATION from "./Components/Nav_Bar_Comp/Regulation.jsx";
import Conference from "./Components/structure/sections/Conference.jsx";
import { createGlobalStyle } from "styled-components";
import Aboutplacement from "./Components/Nav_Bar_Comp/Aboutplacement.jsx";
import AbtUs from "./Components/Pages/AbtUs";
import Princ from "./Components/Pages/Princ";

const GlobalStyle = createGlobalStyle`
body {
  cursor: url("/cursor.svg") 32 32, auto;}
`;
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContentWrapper = styled.div`
  flex: 1;
  padding-top: 9%;
`;

const Nirf1 = () => {
  const footerRef = useRef(null);

  const scrollToFooter = () => {
    footerRef.current.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className="nirf2">
      <NIRF /> {/* This will render the NIRF component */}
      <Contact />
      <Chat />
    </div>
  );
};

const Naac1 = () => {
  const footerRef = useRef(null);

  const scrollToFooter = () => {
    footerRef.current.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className="naac2">
      <NAAC /> {/* This will render the NIRF component */}
      <Contact />
      <Chat />
    </div>
  );
};

const Nba1 = () => {
  const footerRef = useRef(null);

  const scrollToFooter = () => {
    footerRef.current.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className="nba2">
      <NBA /> {/* This will render the NIRF component */}
      <Contact />
      <Chat />
    </div>
  );
};

const Dept = () => {
  const footerRef = useRef(null);

  const scrollToFooter = () => {
    footerRef.current.scrollIntoView({ behavior: "smooth" });
  };
  return <DepartmentPage />;
};
const App = () => {
  const footerRef = useRef(null);

  const scrollToFooter = () => {
    footerRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <GlobalStyle />

      <Router>
        {/* Landing Page Route */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </Router>

      {/* The rest of the routes */}
      <Router>
        <AppContainer className="App">
          {/* Conditionally render Head and Footer */}
          {window.location.pathname !== "/" && (
            <>
              <Head />
              <MainContentWrapper>
                <Routes>
                  <Route path="/nirf" element={<Nirf1 />} />
                  <Route path="/naac" element={<Naac1 />} />
                  <Route path="/nba" element={<Nba1 />} />
                  <Route path="/dept" element={<Dept />} />
                  <Route path="/v_m" element={<Collegevisionmission />} />
                  <Route path="/reg" element={<REGULATION />} />
                  <Route path="/funded-proposals" element={<Conference />} />
                  <Route
                    path="/journal-publications"
                    element={<Conference />}
                  />
                  <Route path="//patent-details" element={<Conference />} />
                  <Route path="/books" element={<Conference />} />
                  <Route path="/conferences" element={<Conference />} />
                  <Route path="/consultancy" element={<Conference />} />
                  <Route path="/internship" element={<Conference />} />
                  <Route path="/product-development" element={<Conference />} />
                  <Route path="/abtplace" element={<Aboutplacement />} />
                  <Route path="/abtus" element={<AbtUs />}  />
                  <Route path="/prick" element={<Princ />} />
                </Routes>
              </MainContentWrapper>
              <Footer ref={footerRef} />
            </>
          )}
        </AppContainer>
      </Router>
    </>
  );
};

export default App;
