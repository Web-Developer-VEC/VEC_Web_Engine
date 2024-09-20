import React, { useState, useEffect, useRef } from 'react';
import Lottie from 'react-lottie-player';
import './Tracker.css';

const StatsGrid = () => {
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef(null);

  const targetValues = {
    teachers: 34500,
    phdHolders: 25,
    students: 300,
    placement: 52,
  };

  const [counters, setCounters] = useState({
    teachers: 0,
    phdHolders: 0,
    students: 0,
    placement: 0,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      const animateCounters = () => {
        setCounters((prevCounters) => {
          const newCounters = { ...prevCounters };
          Object.keys(targetValues).forEach((key) => {
            if (newCounters[key] < targetValues[key]) {
              newCounters[key] += Math.ceil(targetValues[key] / 95); // Adjust the divisor for speed
              if (newCounters[key] > targetValues[key]) {
                newCounters[key] = targetValues[key];
              }
            }
          });
          return newCounters;
        });
      };

      const interval = setInterval(animateCounters, 30);

      return () => clearInterval(interval);
    }
  }, [isVisible]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
<div className="page-container flex justify-start text-white font-popp bg-black/30 backdrop-blur-[4px]">
<div className="stats-grid-container mt-[5%]">
        <div className="stats-grid h-fit rounded-lg" ref={statsRef}>
          <div className="stat-item px-2">
            <Lottie
              loop
              animationData={require('./Assets/Active Learners.json')}
              play
              style={{ width: 140, height: 140 }}
            />
            <h2 className="stat-number">{counters.teachers}</h2>
            <p className="stat-label">Active Learners</p>
          </div>
          <div className="stat-item">
            <Lottie
              loop
              animationData={require('./Assets/hike.json')}
              play
              style={{ width: 140, height: 140 }}
            />
            <h2 className="stat-number">{counters.phdHolders} INR</h2>
            <p className="stat-label">Highest Salary Offered (LPA)</p>
          </div>
          <div className="stat-item">
            <Lottie
              loop
              animationData={require('./Assets/Hiring Partners.json')}
              play
              style={{ width: 140, height: 140 }}
            />
            <h2 className="stat-number">{counters.students}+</h2>
            <p className="stat-label">Hiring Partners</p>
          </div>
          <div className="stat-item">
            <Lottie
              loop
              animationData={require('./Assets/salary.json')}
              play
              style={{ width: 140, height: 140 }}
            />
            <h2 className="stat-number">{counters.placement}%</h2>
            <p className="stat-label">Average Salary Hike</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsGrid;
