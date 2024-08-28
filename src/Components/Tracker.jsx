import React, { useState, useEffect, useRef } from 'react';
import './Tracker.css';
import { FaChalkboardTeacher } from "react-icons/fa";
import { PiStudentBold } from "react-icons/pi";
import { GiAchievement } from "react-icons/gi";
import { IoIosPeople } from "react-icons/io";

const StatsGrid = () => {
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef(null);

  const targetValues = {
    teachers: 286,
    phdHolders: 25,
    students: 34069,
    placement: 90,
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
    <div className="page-container flex justify-start text-white">
      <div className="stats-grid-container">
        <div className="stats-grid h-fit rounded-lg bg-[#0000001a] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-[3px]" 
          ref={statsRef}>
          <div className="stat-item px-2">
          <FaChalkboardTeacher className='icon' size={90} color='orange' />
            <h2 className="stat-number">{counters.teachers}</h2>
            <p className="stat-label">Teachers</p>
          </div>
          <div className="stat-item">
            <PiStudentBold className='icon' size={90} color='orange'/>
            <h2 className="stat-number" >{counters.phdHolders} INR</h2>
            <p className="stat-label">highest Salary (LPA)</p>
          </div>
          <div className="stat-item">
            <IoIosPeople className='icon' size={90} color='orange'/>
            <h2 className="stat-number">{counters.students}</h2>
            <p className="stat-label">Active Learners</p>
          </div>
          <div className="stat-item">
            <GiAchievement className='icon' size={90} color='orange'/>
            <h2 className="stat-number">{counters.placement}%</h2>
            <p className="stat-label">Placement</p>
          </div>
        </div>
      </div>
  </div>
  );
};

export default StatsGrid;
