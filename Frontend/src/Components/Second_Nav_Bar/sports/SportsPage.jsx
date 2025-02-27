import React, { useEffect, useState } from 'react';
import './SportsPage.css'; // Import the CSS file for styling
import Banner from '../../Banner';
import SportsActionPlan from './SportsActionPlan';
import SportsInfra from './SportsInfra';
import ZonalResults from './ZonalResults';
import WinnerSlider from './winners_sld';
import Sportsfaculties from './sports_faculties';
import Achievements from './achivements';
import Achievements1 from './Achivements2';
import axios from 'axios';

const SportsPage = ({theme, toggle}) => {
  const [sportData,setSportsData] = useState(null);

  useEffect(()=> {
    const fetchData = async ()=>{
      try{
        const responce = await axios.get('/api/sportsdata');
        setSportsData(responce.data);
        console.log("Responce",responce.data);
        
      }
      catch (err){
        console.error("Error Fetching data", err.message);
      }
    }
    fetchData();
  },[])
  return (
    <>
<Banner theme={theme} toggle={toggle}
  backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"  // Replace with an image related to sports or fitness
  headerText="Physical Education Department"
  subHeaderText="Fostering excellence in sports, fitness, and holistic development for students."
/>

    <div className="sports-page">
      {/* Introduction Section */}
      <section className="introduction">
        <div className="section-content">
          <h2 className="section-title">Introduction</h2>
          <p className="intro-text">
          Our College department of physical education is an integral part of our institution right from its inception from the year 2005-2006.
          </p>
          <p className="intro-text">
          We are now having 3 faculty members, including a Head of the department. In which we have one doctorate in physical education. We engage the students both morning and evening for sports activities and make them to participate in Inter collegiate tournaments. We have one big Indoor stadium and one multi Gym with Fitness trainer.
          </p>
          <p className="intro-text">
          Our college students got the 18th consecutive years of overall championship in zone – I competitions. This is our pride for our department of physical education. Moreover, our college students participate for Anna university teams, State and National teams. Our students got places in National level sports competitions every year.          </p>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="vision-mission">
        <div className="section-content">
          <h2 className="section-title">Vision & Mission</h2>
          <p className="vision-mission-text">
          The vision of our department of physical education is physical, mental and Intellectual development of the whole student. For which we create an environment that will focus on students’ attitude towards physical activity. And provide opportunities for personal and intellectual growth through fitness, outdoor recreation, and coaching and sports participation.          </p>
        </div>
      </section>
      <SportsActionPlan />
      <SportsInfra/>
      <Achievements1 data={sportData && sportData.length > 2 ? sportData[4] : null}/>
      <ZonalResults data={sportData && sportData.length > 2 ? sportData[0] : null}/>
      <WinnerSlider data={sportData && sportData.length > 2 ? sportData[1] : null}/><br/>
      <Sportsfaculties data={sportData && sportData.length > 2 ? sportData[2] : null}/>
    </div>
    <Achievements data={sportData && sportData.length > 2 ? sportData[3] : null}/>
    </>
  );
};

export default SportsPage;
