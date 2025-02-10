import React from 'react';
import './SportsActionPlan.css'; // Import the updated CSS file for styling

const SportsActionPlan = () => {
  return (
    
    <section className="sports-action-plan">
        
      <div className="section-header">
        <h2>Our Action Plan</h2>
        <li>We give effective training for the students to develop their physical fitness.</li>
        <li>We provide efficient coaching system for the students to their sports performance.</li>
        <li>To engage the students for a greater number of participations to develop their match experience.</li>
      </div>

      <div className="action-content">
      <div className="card training">
          <h3>Training Schedule</h3>
          <p>Regular practice sessions from 4:15 pm to 6:15 pm.</p>
        </div>
        <div className="card goals-objectives">
          <h3>Goals & Objectives</h3>
          <ul>
            <li>To become champions of champions.</li>
            <li>To attract a greater number of students for sports participation.</li>
            <li> To create awareness to the students about the good physique.</li>
          </ul>
        </div>

        <div className="card health-awareness">
          <h3>Health Awareness & Orientation</h3>
          <ul>
            <li>To give awareness to the importance of regular food habits.</li>
            <li>To insist the importance and benefits of the blood donation. </li>
            <li>To instruct the knowledge about First-Aid and its importance. </li>
            <li>Counselling the students, when needed.</li>
            <li>To have a cordial relationship with students and staffs</li>
          </ul>
        </div>

        <div className="card additional-info">
          <h3>Facilities & Achievements</h3>
          <ul>
            <li>Above said facilities are available in our college to inculcate sports activities among admitted students.</li>
            <li> Over all champions in Anna University Zone 1 Sports Competition for 18 consecutive years (2003 -2021).</li>
            <li>We conduct many tournaments zonal and Inter zonal level.</li>
            <li>Also conducted State Level “Velammal Trophy” (Volley Ball & Cricket).</li>
            <li>Regularly used to organize: Tamil Nādu State Men and Women Senior National Coaching Camp”.</li>
            <li>Providing Sports Facilities for Corporate Sector like Tata Communication, Pure Chemicals to name a few.</li>
            <li>Providing Sports facilities to Government Sector like Fire Service, Prison Department staff.</li>

          </ul>
        </div>
      </div>
    </section>
  );
};

export default SportsActionPlan;
