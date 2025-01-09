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
    name: "Artificial Intelligence & Data Science",
    image: "/images/CYBER.mp4", // CDN-hosted image
    link: "https://example.com/aids",
    clr: "#be3531"
  },
  {
    name: "Automobile Engineering",
    image: "/images/CYBER.mp4", // CDN-hosted image
    link: "https://example.com/auto",
    clr: "#f6a664",
  },
  {
    name: "Civil Engineering",
    image: "/images/CYBER.mp4", // CDN-hosted image
    link: "https://example.com/civil",
    clr: "#5e84a0",
  },
  {
    name: "Computer Science Engineering",
    image: "/images/CYBER.mp4", // CDN-hosted image
    link: "https://example.com/cse",
    clr: "#01a302",
  },
  {
    name: "CSE(CyberSecurity)",
    image: "/images/CYBER.mp4", // CDN-hosted image
    link: "https://example.com/cyber",
    clr: "#114738"
  },
  {
    name: "Electrical & Electronics Engineering",
    image: "/images/CYBER.mp4", // CDN-hosted image
    link: "https://example.com/eee",
    clr: "#ce8143"
  },
  {
    name: "Electronics & Communication Engineering",
    image: "/images/CYBER.mp4", // CDN-hosted image
    link: "https://example.com/ece",
    clr: "#0226c4",
  },
  {
    name: "Electronics & Instrumentation Engineering",
    image: "/images/CYBER.mp4", // CDN-hosted image
    link: "https://example.com/eie",
    clr: "#ca4121"
  },
  {
    name: "Information Technology",
    image: "/images/CYBER.mp4", // CDN-hosted image
    link: "https://example.com/it",
    clr: "#a982b4",
  },
  {
    name: "Mechanical Engineering",
    image: "/images/CYBER.mp4", // CDN-hosted image
    link: "https://example.com/mech",
    clr: "#896a21",
  },
  {
    name: "Master of Business Administration",
    image: "/images/CYBER.mp4", // CDN-hosted image
    link: "https://example.com/mba",
    clr: "#14254f"
  },
  
];


const LandingPage = () => {
  return (
    <div className="landing-page">
      <Boot />
      <Head/>
      <ImgSld/>
      <div className='w-max lg:max-w-full max-w-[220vw] h-fit absolute z-50'>
        <div className='pt-2 pb-[2vmax] bg-white'>
          <Abt />
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
