import React from 'react';
import Head from './Components/Head';
import ImgSld from './Components/ImgSld';
import Abt from './Components/About';
import Announce from './Components/announcements';
import Event from './Components/Events';
import Event1 from './Components/Events1';
import Tracker from './Components/Tracker';
import Samplereact from './Components/Courses';
import Footer from './Components/Footer';
import Contact from './Components/ContactIcon'
import Chat from './Components/ChatPopup'
import Boot from './Components/BootUp';
import "bootstrap/dist/css/bootstrap.min.css";

const courses = [
  {
    name: "Computer Science Engineering",
    image: "/images/CSE.jpeg", // CDN-hosted image
    link: "https://example.com/cse",
    clr: "#01a302",
  },
  {
    name: "Artificial Intelligence and Data Science",
    image: "/images/AIDS.jpeg", // CDN-hosted image
    link: "https://example.com/aids",
    clr: "#be3531"
  },
  {
    name: "Information Technology",
    image: "/images/IT.jpeg", // CDN-hosted image
    link: "https://example.com/it",
    clr: "#a982b4",
  },
  {
    name: "Mechanical Engineering",
    image: "/images/MECH.jpeg", // CDN-hosted image
    link: "https://example.com/mech",
    clr: "#896a21",
  },
  {
    name: "Civil Engineering",
    image: "/images/CIVIL.jpeg", // CDN-hosted image
    link: "https://example.com/civil",
    clr: "#5e84a0",
  },
  {
    name: "CyberSecurity",
    image: "/images/CYBER.jpeg", // CDN-hosted image
    link: "https://example.com/cyber",
    clr: "#114738"
  },
  {
    name: "Electrical Communication Engineering",
    image: "/images/ECE.jpeg", // CDN-hosted image
    link: "https://example.com/ece",
    clr: "#0226c4",
  },
  {
    name: "Electrical and Electronic Engineering",
    image: "/images/EEE.jpeg", // CDN-hosted image
    link: "https://example.com/eee",
    clr: "#ce8143"
  },
  {
    name: "Electrical and Instrumentation Engineering",
    image: "/images/EIE.jpeg", // CDN-hosted image
    link: "https://example.com/eie",
    clr: "#ca4121"
  },
  {
    name: "Master of Business Administration",
    image: "/images/MBA.jpeg", // CDN-hosted image
    link: "https://example.com/mba",
    clr: "#14254f"
  },
  {
    name: "Automobile Engineering",
    image: "/images/AUTO.jpeg", // CDN-hosted image
    link: "https://example.com/auto",
    clr: "#f6a664",
  },
];


const LandingPage = () => {
  return (
    <div className="landing-page">
      <Boot />
      <Head/>
      <ImgSld/>
      <div className='w-[100vw] h-fit absolute z-50'>
        <div className='pt-2 pb-[2vmax] bg-white'>
          <Abt/>
          <Announce/>
          <Event/>
          <Event1/>
        </div>
        <Tracker/>
        <div className='bg-white'>
          <Samplereact courses={courses} />
          <Contact/>
          <Chat/>
          <Footer />
        </div>
        </div>
    </div>
  );
};

export default LandingPage;
