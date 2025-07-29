import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SportsActionPlan.css';
import LoadComp from '../../LoadComp'; // Adjust if needed

const SportsActionPlan = () => {
  const [actionData, setActionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .post("/api/main-backend/sportsdata", { type: "action_plan" })
      .then((res) => {
        setActionData(res.data.data[0]);
      })
      .catch((err) => {
        console.error("Error fetching action plan:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadComp />
      </div>
    );
  }

  return (
    <section className="sports-action-plan dark:bg-drkb">
      <div className="section-header">
        <h2 className="text-accn dark:text-drkt">Our Action Plan</h2>
        <div className="w-fit px-4 sm:ml-5">
          <ul className="text-justify text-text dark:text-drkt marker:text-text dark:marker:text-drks">
            <li className='text-text dark:text-drkt'>
              We give effective training for the students to develop their physical fitness.
            </li>
            <li className='text-text dark:text-drkt'>
              We provide efficient coaching system for the students to their sports performance.
            </li>
            <li className='text-text dark:text-drkt'>
              To engage the students for a greater number of participations to develop their match experience.
            </li>
          </ul>
        </div>
      </div>

      <div className="action-content">
        <div className="sports_card training bg-prim dark:bg-drkp">
          <h3 className="text-brwn dark:text-drkt border-b-2 border-[#FDCC03] dark:border-drks w-fit pb-1">
            Training Schedule
          </h3>
          <p>{actionData?.training}</p>
        </div>

        <div className="sports_card goals-objectives bg-prim dark:bg-drkp">
          <h3 className="text-brwn dark:text-drkt border-b-2 border-[#FDCC03] dark:border-drks w-fit pb-1">
            Goals & Objectives
          </h3>
          <ul className="text-justify">
            {actionData?.goals?.map((goal, idx) => (
              <li key={idx}>{goal}</li>
            ))}
          </ul>
        </div>

        <div className="sports_card health-awareness bg-prim dark:bg-drkp">
          <h3 className="text-brwn dark:text-drkt border-b-2 border-[#FDCC03] dark:border-drks w-fit pb-1">
            Health Awareness & Orientation
          </h3>
          <ul className="text-justify">
            {actionData?.health?.map((point, idx) => (
              <li key={idx}>{point}</li>
            ))}
          </ul>
        </div>

        <div className="sports_card additional-info bg-prim dark:bg-drkp">
          <h3 className="text-brwn dark:text-drkt border-b-2 border-[#FDCC03] dark:border-drks w-fit pb-1">
            Facilities & Achievements
          </h3>
          <ul className="text-justify">
            {actionData?.facilities?.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default SportsActionPlan;
