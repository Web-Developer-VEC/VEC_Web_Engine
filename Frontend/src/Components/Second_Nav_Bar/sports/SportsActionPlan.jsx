import React from 'react';
import './SportsActionPlan.css'; // Import the updated CSS file for styling

const SportsActionPlan = () => {
  return (
    <section className="sports-action-plan dark:bg-drkb">
      <div className="section-header">
        <h2 className="text-accn dark:text-drkt">Our Action Plan</h2>
        <div className="w-fit px-4  sm:ml-5">
          <ul className="text-justify text-text dark:text-drkt marker:text-text dark:marker:text-drks">
            <li className='text-text dark:text-drkt'>
              We give effective training for the students to develop their
              physical fitness.
            </li>
            <li className='text-text dark:text-drkt'>
              We provide efficient coaching system for the students to their
              sports performance.
            </li>
            <li className='text-text dark:text-drkt'>
              To engage the students for a greater number of participations to
              develop their match experience.
            </li>
          </ul>
        </div>
      </div>

      <div className="action-content">
        <div className="sports_card training bg-prim dark:bg-drkp">
          <h3 className="text-brwn dark:text-drkt border-b-2 border-[#FDCC03] dark:border-drks w-fit pb-1">Training Schedule</h3>
          <p>Regular practice sessions from 4:15 pm to 6:15 pm.</p>
        </div>
        <div className="sports_card goals-objectives bg-prim dark:bg-drkp">
          <h3 className="text-brwn dark:text-drkt border-b-2 border-[#FDCC03] dark:border-drks w-fit pb-1">Goals & Objectives</h3>
          <ul className="text-justify">
            <li>To become champions of champions.</li>
            <li>
              To attract a greater number of students for sports participation.
            </li>
            <li>
              To create awareness to the students about the good physique.
            </li>
          </ul>
        </div>

        <div className="sports_card health-awareness bg-prim dark:bg-drkp">
          <h3 className="text-brwn dark:text-drkt border-b-2 border-[#FDCC03] dark:border-drks w-fit pb-1">
            Health Awareness & Orientation
          </h3>
          <ul className="text-justify">
            <li>To give awareness to the importance of regular food habits.</li>
            <li>
              To insist the importance and benefits of the blood donation.{" "}
            </li>
            <li>
              To instruct the knowledge about First-Aid and its importance.{" "}
            </li>
            <li>Counselling the students, when needed.</li>
            <li>To have a cordial relationship with students and staffs</li>
          </ul>
        </div>

        <div className="sports_card additional-info bg-prim dark:bg-drkp">
          <h3 className="text-brwn dark:text-drkt border-b-2 border-[#FDCC03] dark:border-drks w-fit pb-1">
            Facilities & Achievements
          </h3>
          <ul className="text-justify">
            <li>
              Above said facilities are available in our college to inculcate
              sports activities among admitted students.
            </li>
            <li>
              {" "}
              Over all champions in Anna University Zone 1 Sports Competition
              for 18 consecutive years (2003 -2021).
            </li>
            <li>We conduct many tournaments zonal and Inter zonal level.</li>
            <li>
              Also conducted State Level “Velammal Trophy” (Volley Ball &
              Cricket).
            </li>
            <li>
              Regularly used to organize: Tamil Nādu State Men and Women Senior
              National Coaching Camp”.
            </li>
            <li>
              Providing Sports Facilities for Corporate Sector like Tata
              Communication, Pure Chemicals to name a few.
            </li>
            <li>
              Providing Sports facilities to Government Sector like Fire
              Service, Prison Department staff.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default SportsActionPlan;
