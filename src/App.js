import React from 'react';
import Head from './Components/Head';
import ImgSld from './Components/ImgSld';
import Abt from './Components/About';
import Announce from './Components/announcements';
import Event from './Components/Events';
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
  },
  {
    name: "Artificial Intelligence and Data Science",
    image: "/images/AIDS.jpeg", // CDN-hosted image
    link: "https://example.com/aids",
  },
  {
    name: "Information Technology",
    image: "/images/IT.jpeg", // CDN-hosted image
    link: "https://example.com/it",
  },
  {
    name: "Mechanical Engineering",
    image: "/images/MECH.jpeg", // CDN-hosted image
    link: "https://example.com/mech",
  },
  {
    name: "Civil Engineering",
    image: "/images/CIVIL.jpeg", // CDN-hosted image
    link: "https://example.com/civil",
  },
  {
    name: "CyberSecurity",
    image: "/images/CYBER.jpeg", // CDN-hosted image
    link: "https://example.com/cyber",
  },
  {
    name: "Electrical Communication Engineering",
    image: "/images/ECE.jpeg", // CDN-hosted image
    link: "https://example.com/ece",
  },
  {
    name: "Electrical and Electronic Engineering",
    image: "/images/EEE.jpeg", // CDN-hosted image
    link: "https://example.com/eee",
  },
  {
    name: "Electrical and Instrumentation Engineering",
    image: "/images/EIE.jpeg", // CDN-hosted image
    link: "https://example.com/eie",
  },
  {
    name: "Master of Business Administration",
    image: "/images/MBA.jpeg", // CDN-hosted image
    link: "https://example.com/mba",
  },
  {
    name: "Automobile Engineering",
    image: "/images/AUTO.jpeg", // CDN-hosted image
    link: "https://example.com/auto",
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
