import React, { useState, useEffect } from 'react';
import { 
  BarChart3,
  FileText,
  Users,
  ClipboardCheck,
  UserX, 
  AlertTriangle, 
  Utensils,
  X 
} from 'lucide-react';
import './AttendanceDashboard.css';
import HostelSidebar from '../HostelSidebar';
import axios from 'axios';

// const yearData = {
//   1: {
//     totalStudents: 120,
//     presentStudents: 98,
//     absentStudents: 15,
//     mismatchedStudents: 7,
//     vegCount: 75,
//     nonVegCount: 45,
//     absentList: [
//       { name: "John Doe", roomNumber: "A-101" },
//       { name: "Jane Smith", roomNumber: "A-102" },
//       { name: "Mike Johnson", roomNumber: "A-103" },
//       { name: "Sarah Williams", roomNumber: "A-104" },
//       { name: "Robert Brown", roomNumber: "A-105" },
//       { name: "Emily Davis", roomNumber: "A-106" },
//       { name: "James Wilson", roomNumber: "A-107" },
//       { name: "Emma Taylor", roomNumber: "A-108" },
//       { name: "William Moore", roomNumber: "A-109" },
//       { name: "Olivia Anderson", roomNumber: "A-110" },
//     ],
//     mismatchedList: [
//       { name: "Alice Johnson", roomNumber: "B-201", issue: "Wrong mess" },
//       { name: "Bob Wilson", roomNumber: "B-202", issue: "Double entry" },
//       { name: "Carol Martinez", roomNumber: "B-203", issue: "Wrong mess" },
//       { name: "David Thompson", roomNumber: "B-204", issue: "Double entry" },
//       { name: "Eva White", roomNumber: "B-205", issue: "Wrong mess" },
//       { name: "Frank Thomas", roomNumber: "B-206", issue: "Double entry" },
//       { name: "Grace Lee", roomNumber: "B-207", issue: "Wrong mess" }
//     ]
//   },
//   2: {
//     totalStudents: 110,
//     presentStudents: 89,
//     absentStudents: 12,
//     mismatchedStudents: 9,
//     vegCount: 65,
//     nonVegCount: 45,
//     absentList: [
//       { name: "Emily Brown", roomNumber: "C-101" },
//       { name: "Michael Davis", roomNumber: "C-102" },
//       { name: "Sophie Turner", roomNumber: "C-103" },
//       { name: "Daniel White", roomNumber: "C-104" },
//       { name: "Isabella Clark", roomNumber: "C-105" },
//       { name: "Matthew Lewis", roomNumber: "C-106" },
//       { name: "Ava Martinez", roomNumber: "C-107" },
//       { name: "Ethan Walker", roomNumber: "C-108" }
//     ],
//     mismatchedList: [
//       { name: "Sarah Miller", roomNumber: "D-201", issue: "Wrong mess" },
//       { name: "James Wilson", roomNumber: "D-202", issue: "Double entry" },
//       { name: "Lucy Parker", roomNumber: "D-203", issue: "Wrong mess" },
//       { name: "Noah Harris", roomNumber: "D-204", issue: "Double entry" },
//       { name: "Emma Thompson", roomNumber: "D-205", issue: "Wrong mess" },
//       { name: "Oliver King", roomNumber: "D-206", issue: "Double entry" },
//       { name: "Mia Rodriguez", roomNumber: "D-207", issue: "Wrong mess" },
//       { name: "Lucas Scott", roomNumber: "D-208", issue: "Double entry" },
//       { name: "Chloe Adams", roomNumber: "D-209", issue: "Wrong mess" }
//     ]
//   }
// };


function AttendanceDashboard() {
  const [showIframe, setShowIframe] = useState(false);
  const [selectedYear, setSelectedYear] = useState(1);
  const [animatedCount, setAnimatedCount] = useState(0);
  const [animatedVeg, setAnimatedVeg] = useState(0);
  const [animatedNonVeg, setAnimatedNonVeg] = useState(0);
  const [showAbsentModal, setShowAbsentModal] = useState(false);
  const [showMismatchModal, setShowMismatchModal] = useState(false);
  const [activeNav, setActiveNav] = useState('attendance'); // Add this for mobile navigation
  const [foodCount, setFoodCount] = useState(null);
  const [availableYear, setAvailableYears] = useState(null);
  

  // ... (keep all your existing useEffect and helper functions)
  // const currentData = yearData[selectedYear];
  // const attendancePercentage = (currentData.presentStudents / currentData.totalStudents) * 100;
  
  const yearToAlphabet = {
    '1': 'First Year', 
    '2': 'Second Year',
    '3': 'Third Year',
    '4': 'Fourth Year' 
  };
  
  useEffect(() => {
    // Reset animations when year changes
    setAnimatedCount(0);
    setAnimatedVeg(0);
    setAnimatedNonVeg(0);
    
    // Animate half donut
    // const speedDuration = 1500;
    // const speedSteps = 60;
    // const speedIncrement = attendancePercentage / speedSteps;
    // let speedCurrent = 0;
    
    // const speedInterval = setInterval(() => {
      //   if (speedCurrent < attendancePercentage) {
        //     speedCurrent += speedIncrement;
        //     setAnimatedCount(Math.min(speedCurrent, attendancePercentage));
        //   } else {
          //     clearInterval(speedInterval);
          //   }
          // }, speedDuration / speedSteps);
          
          // Animate food counts
          const foodDuration = 1000;
          const foodSteps = 40;
          const vegIncrement = vegCount / foodSteps;
          const nonVegIncrement = nonVegCount / foodSteps;
          let vegCurrent = 0;
          let nonVegCurrent = 0;
          
          const foodInterval = setInterval(() => {
            if (vegCurrent < vegCount || nonVegCurrent < nonVegCount) {
              vegCurrent = Math.min(vegCurrent + vegIncrement, vegCount);
              nonVegCurrent = Math.min(nonVegCurrent + nonVegIncrement, nonVegCount);
              setAnimatedVeg(Math.round(vegCurrent));
              setAnimatedNonVeg(Math.round(nonVegCurrent));
            } else {
              clearInterval(foodInterval);
            }
          }, foodDuration / foodSteps);
          
          return () => {
            // clearInterval(speedInterval);
            clearInterval(foodInterval);
          };
        }, [selectedYear]);
        
        const getSpeedometerColor = (percentage) => {
          if(percentage > 80) return "green";
          else if(percentage > 35) return "#fdcc03";
          else return "red";
        };
        
        const handleModalOverlayClick = (e, closeModal) => {
          if (e.target === e.currentTarget) {
      closeModal();
    }
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/food_count_warden');
        const fetchedData = response.data;
        
        const years = Object.keys(fetchedData).map(Number);
        setAvailableYears(years);
        
        if (years.length > 0) {
          setSelectedYear(years[0]);
        }
        
        setFoodCount(fetchedData);
      } catch (err) { 
        console.error("Failed to fetch data", err);
      }
    };
    fetchData();
  }, []);
  
  const vegCount = foodCount?.[selectedYear]?.veg_count || 0; 
  const nonVegCount = foodCount?.[selectedYear]?.non_veg_count || 0;
  const totalStudents = vegCount + nonVegCount;
  
  
  return (
    <div className="attendance-container">
      <HostelSidebar role='warden' />
      {/* Main Content */}
      <div className="attendance-main">
        {/* ... (keep all your existing main content) */}
        <div className="attendance-year-buttons">
          {availableYear?.map((yearKey) => (
            <button
              key={yearKey}
              className={`attendance-year-button ${selectedYear === yearKey ? 'attendance-active' : ''}`}
              onClick={() => setSelectedYear(yearKey)}
            >
              {yearToAlphabet[yearKey]}
            </button>
          ))}
        </div>

        {/* <div className="attendance-overview">
          <div className="attendance-chart">
            <div className="attendance-chart-container">
              <svg viewBox="0 0 200 100" className="attendance-donut">
                <path
                  d="M20 90 A 60 60 0 0 1 180 90"
                  className="attendance-donut-bg"
                />
                <path
                  d="M20 90 A 60 60 0 0 1 180 90"
                  className="attendance-donut-fill"
                  style={{
                    stroke: "#fdcc03",
                    strokeDasharray: `${(animatedCount / 100) * 251.2} 251.2`
                  }}
                />
                <text x="100" y="50" className="attendance-donut-number">
                  {currentData.presentStudents}
                </text>
                <text x="100" y="70" className="attendance-donut-label">
                  Present
                </text>
                <text x="100" y="85" className="attendance-donut-total">
                  out of {currentData.totalStudents} students
                </text>
              </svg>
            </div>
          </div>

          <div className="attendance-status-cards">
            <div className="attendance-card attendance-present">
              <Users className="attendance-card-icon" />
              <div className="attendance-card-content">
                <h3>Present</h3>
                <p className="attendance-card-number">{currentData.presentStudents}</p>
                <p className="attendance-card-percentage">
                  {((currentData.presentStudents / currentData.totalStudents) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div 
              className="attendance-card attendance-absent"
              onClick={() => setShowAbsentModal(true)}
              style={{ cursor: 'pointer' }}
            >
              <UserX className="attendance-card-icon" />
              <div className="attendance-card-content">
                <h3>Absent</h3>
                <p className="attendance-card-number">{currentData.absentStudents}</p>
                <p className="attendance-card-percentage">
                  {((currentData.absentStudents / currentData.totalStudents) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div 
              className="attendance-card attendance-mismatched"
              onClick={() => setShowMismatchModal(true)}
              style={{ cursor: 'pointer' }}
            >
              <AlertTriangle className="attendance-card-icon" />
              <div className="attendance-card-content">
                <h3>Mismatched</h3>
                <p className="attendance-card-number">{currentData.mismatchedStudents}</p>
                <p className="attendance-card-percentage">
                  {((currentData.mismatchedStudents / currentData.totalStudents) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
      </div> */}

      <div className="attendance-food-section">
          <div className="attendance-food-counts">
            <div className="attendance-food-type">
              <Utensils className="attendance-food-icon attendance-veg" />
              <div className="attendance-food-details">
                <h3>Vegetarian</h3>
                <p className="attendance-food-number">{animatedVeg}</p>
                <p className="attendance-food-percentage">
                  {((vegCount / totalStudents) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="attendance-food-type">
              <Utensils className="attendance-food-icon attendance-non-veg" />
              <div className="attendance-food-details">
                <h3>Non-Vegetarian</h3>
                <p className="attendance-food-number">{animatedNonVeg}</p>
                <p className="attendance-food-percentage">
                  {((nonVegCount / totalStudents) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="attendance-pie-chart">
            <div
              className="attendance-pie"
              style={{
                background: `conic-gradient(
                  #10b981 0% ${(vegCount / totalStudents) * 100}%,
                  #10b981 ${(vegCount / totalStudents) * 100}% ${(vegCount / totalStudents) * 100}%,
                  #ef4444 ${(vegCount / totalStudents) * 100}% 100%
                )`
              }}
            />
            <div className="attendance-pie-legend">
              <div className="attendance-legend-item">
                <span className="attendance-legend-color attendance-veg"></span>
                <span>Vegetarian</span>
              </div>
              <div className="attendance-legend-item">
                <span className="attendance-legend-color attendance-non-veg"></span>
                <span>Non-Vegetarian</span>
              </div>
            </div>
          </div>
        </div>

      {/* <button 
        className="attendance-consolidation-button"
        onClick={() => setShowIframe(true)}
      >
        View Attendance Consolidation
      </button>

      {showIframe && (
          <div className="attendance-modal-overlay" onClick={() => setShowIframe(false)}>
            <div className="attendance-modal" onClick={(e) => e.stopPropagation()}>
              <div className="attendance-modal-header">
                <h2>Attendance Consolidation</h2>
                <button className="attendance-modal-close" onClick={() => setShowIframe(false)}>
                  <X />
                </button>
              </div>
              <div className="attendance-modal-content">
                <iframe
                  src="https://drive.google.com/file/d/11BOmR-0biNhpCG2dipZsLH_s1vdk6Gb0" // Replace with your hosted Excel file link
                  className="attendance-iframe"
                ></iframe>
              </div>
            </div>
          </div>
        )} */}

      {/* ... (keep all your existing modals) */}
        {/* {showAbsentModal && (
          <div 
            className="attendance-modal-overlay"
            onClick={(e) => handleModalOverlayClick(e, () => setShowAbsentModal(false))}
          >
            <div className="attendance-modal">
              <div className="attendance-modal-header">
                <h2>Absent Students</h2>
                <button 
                  className="attendance-modal-close"
                  onClick={() => setShowAbsentModal(false)}
                >
                  <X />
                </button>
              </div>
              <div className="attendance-modal-content">
                {currentData.absentList.map((student, index) => (
                  <div key={index} className="attendance-modal-item">
                    <span className="attendance-modal-name">{student.name}</span>
                    <span className="attendance-modal-room">{student.roomNumber}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )} */}

        {/* {showMismatchModal && (
          <div 
            className="attendance-modal-overlay"
            onClick={(e) => handleModalOverlayClick(e, () => setShowMismatchModal(false))}
          >
            <div className="attendance-modal">
              <div className="attendance-modal-header">
                <h2>Mismatched Students</h2>
                <button 
                  className="attendance-modal-close"
                  onClick={() => setShowMismatchModal(false)}
                >
                  <X />
                </button>
              </div>
              <div className="attendance-modal-content">
                {currentData.mismatchedList.map((student, index) => (
                  <div key={index} className="attendance-modal-item">
                    <div className="attendance-modal-student-info">
                      <span className="attendance-modal-name">{student.name}</span>
                      <span className="attendance-modal-room">{student.roomNumber}</span>
                    </div>
                    <span className="attendance-modal-issue">{student.issue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )} */}
    </div>
  </div>
  );
}

export default AttendanceDashboard;