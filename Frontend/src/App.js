import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Head from './Components/Head';
import ImgSld from './Components/ImgSld';
import Abt from './Components/About';
import Announce from './Components/announcements';
import Event from './Components/Events';
import Tracker from './Components/Tracker';
import Samplereact from './Components/Courses';
import Footer from './Components/Footer';
import Contact from './Components/ContactIcon';
import Chat from './Components/ChatPopup';
import Boot from './Components/BootUp';
import NIRF from './Components/nirf'; // Ensure this is correctly imported
import NAAC from './Components/naac';
import NBA from './Components/NBA_F'
import "bootstrap/dist/css/bootstrap.min.css";
import LandingPage from './Landing';
import styled from "styled-components";
import DepartmentPage from "./Components/structure/DepartmentPage.js";

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
  return (
    <div className="nirf2">
      <Head />
      <NIRF /> {/* This will render the NIRF component */}
      <Contact />
      <Chat />
      <Footer />
    </div>
  );
};

const Naac1 = () => {
  return (
    <div className="naac2">
      <Head />
      <NAAC /> {/* This will render the NIRF component */}
      <Contact />
      <Chat />
      <Footer />
    </div>
  );
};

const Nba1 = () => {
  return (
    <div className="nba2">
      <Head />
      <NBA /> {/* This will render the NIRF component */}
      <Contact />
      <Chat />
      <Footer />
    </div>
  );
};

const Dept = () => {
  return(
    <AppContainer className="App">
      <Head />
      <MainContentWrapper>
        <DepartmentPage />{" "}
      </MainContentWrapper>
      <Footer />
    </AppContainer>
  );
}

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/nirf" element={<Nirf1 />} /> 
        <Route path="/naac" element={<Naac1 />} />
        <Route path="/nba" element={<Nba1 />} />
        <Route path="/dept" element={<Dept />} />
      </Routes>
    </Router>
  );
};

export default App;
