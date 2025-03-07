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
import './SuperiorAttendance.css';
import axios from 'axios';

const yearData = {
  first: {
    totalStudents: 130,
    presentStudents: 110,
    absentStudents: 12,
    mismatchedStudents: 8,
    vegCount: 80,
    nonVegCount: 50,
    boys: {
      totalStudents: 70,
      presentStudents: 60,
      absentStudents: 6,
      mismatchedStudents: 4,
      vegCount: 45,
      nonVegCount: 25
    },
    girls: {
      totalStudents: 60,
      presentStudents: 50,
      absentStudents: 6,
      mismatchedStudents: 4,
      vegCount: 35,
      nonVegCount: 25
    },
    absentList: [
      { name: "John Doe", roomNumber: "A-101", gender: "male" },
      { name: "Jane Smith", roomNumber: "A-102", gender: "female" }
    ],
    mismatchedList: [
      { name: "Alice Johnson", roomNumber: "B-201", issue: "Wrong mess", gender: "female" },
      { name: "Bob Wilson", roomNumber: "B-202", issue: "Double entry", gender: "male" }
    ]
  },
  second: {
    totalStudents: 125,
    presentStudents: 105,
    absentStudents: 13,
    mismatchedStudents: 7,
    vegCount: 70,
    nonVegCount: 55,
    boys: {
      totalStudents: 65,
      presentStudents: 55,
      absentStudents: 7,
      mismatchedStudents: 3,
      vegCount: 40,
      nonVegCount: 25
    },
    girls: {
      totalStudents: 60,
      presentStudents: 50,
      absentStudents: 6,
      mismatchedStudents: 4,
      vegCount: 30,
      nonVegCount: 30
    },
    absentList: [
      { name: "Mike Johnson", roomNumber: "A-201", gender: "male" },
      { name: "Sarah Williams", roomNumber: "A-202", gender: "female" }
    ],
    mismatchedList: [
      { name: "Carol Martinez", roomNumber: "B-301", issue: "Wrong mess", gender: "female" },
      { name: "David Thompson", roomNumber: "B-302", issue: "Double entry", gender: "male" }
    ]
  },
  third: {
    totalStudents: 120,
    presentStudents: 98,
    absentStudents: 15,
    mismatchedStudents: 7,
    vegCount: 75,
    nonVegCount: 45,
    boys: {
      totalStudents: 65,
      presentStudents: 53,
      absentStudents: 8,
      mismatchedStudents: 4,
      vegCount: 40,
      nonVegCount: 25
    },
    girls: {
      totalStudents: 55,
      presentStudents: 45,
      absentStudents: 7,
      mismatchedStudents: 3,
      vegCount: 35,
      nonVegCount: 20
    },
    absentList: [
      { name: "John Doe", roomNumber: "A-101", gender: "male" },
      { name: "Jane Smith", roomNumber: "A-102", gender: "female" }
    ],
    mismatchedList: [
      { name: "Alice Johnson", roomNumber: "B-201", issue: "Wrong mess", gender: "female" },
      { name: "Bob Wilson", roomNumber: "B-202", issue: "Double entry", gender: "male" }
    ]
  },
  fourth: {
    totalStudents: 110,
    presentStudents: 89,
    absentStudents: 12,
    mismatchedStudents: 9,
    vegCount: 65,
    nonVegCount: 45,
    boys: {
      totalStudents: 60,
      presentStudents: 48,
      absentStudents: 7,
      mismatchedStudents: 5,
      vegCount: 35,
      nonVegCount: 25
    },
    girls: {
      totalStudents: 50,
      presentStudents: 41,
      absentStudents: 5,
      mismatchedStudents: 4,
      vegCount: 30,
      nonVegCount: 20
    },
    absentList: [
      { name: "Emily Brown", roomNumber: "C-101", gender: "female" },
      { name: "Michael Davis", roomNumber: "C-102", gender: "male" }
    ],
    mismatchedList: [
      { name: "Sarah Miller", roomNumber: "D-201", issue: "Wrong mess", gender: "female" },
      { name: "James Wilson", roomNumber: "D-202", issue: "Double entry", gender: "male" }
    ]
  },
  overall: {
    totalStudents: 485,
    presentStudents: 402,
    absentStudents: 52,
    mismatchedStudents: 31,
    vegCount: 290,
    nonVegCount: 195,
    boys: {
      totalStudents: 260,
      presentStudents: 216,
      absentStudents: 28,
      mismatchedStudents: 16,
      vegCount: 160,
      nonVegCount: 100
    },
    girls: {
      totalStudents: 225,
      presentStudents: 186,
      absentStudents: 24,
      mismatchedStudents: 15,
      vegCount: 130,
      nonVegCount: 95
    },
    absentList: [
      { name: "John Doe", roomNumber: "A-101", gender: "male" },
      { name: "Jane Smith", roomNumber: "A-102", gender: "female" }
    ],
    mismatchedList: [
      { name: "Alice Johnson", roomNumber: "B-201", issue: "Wrong mess", gender: "female" },
      { name: "Bob Wilson", roomNumber: "B-202", issue: "Double entry", gender: "male" }
    ]
  }
};

function AttendanceDashboard() {
  const [showIframe, setShowIframe] = useState(false);
  const [selectedYear, setSelectedYear] = useState('overall');
  const [selectedGender, setSelectedGender] = useState('overall');
  const [animatedCount, setAnimatedCount] = useState(0);
  const [animatedVeg, setAnimatedVeg] = useState(0);
  const [animatedNonVeg, setAnimatedNonVeg] = useState(0);
  const [showAbsentModal, setShowAbsentModal] = useState(false);
  const [showMismatchModal, setShowMismatchModal] = useState(false);
  const [maledata , setMaleData] = useState(null);
  const [femaledata , setFemaledata] = useState(null);

  useEffect(() => {
    if (showAbsentModal || showMismatchModal || showIframe) {
      document.body.style.overflow = "hidden"; // Disable scrolling when any modal is open
    } else {
      document.body.style.overflow = "auto"; // Restore scrolling when all modals are closed
    }
  
    return () => {
      document.body.style.overflow = "auto"; // Ensure scrolling restores on unmount
    };
  }, [showAbsentModal, showMismatchModal, showIframe]); // Runs when modal state changes
  

  useEffect(()=>{
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/food_count_superior')

        const fetchedData = response.data;

        setMaleData(fetchedData.Male);
        setFemaledata(fetchedData.Female);

      } catch (error) {
        console.error("error fetched food count data",error);
      }
    }
    fetchData();
  },[]);

  
  const getCurrentData = () => {
    // Determine the gender key based on the selected gender
    const genderKey = selectedGender === 'boys' ? 'Male' : selectedGender === 'girls' ? 'Female' : null;
    
    // Determine the year key based on the selected year
    const yearKey = selectedYear === 'first' ? '1' :
                   selectedYear === 'second' ? '2' :
                   selectedYear === 'third' ? '3' :
                   selectedYear === 'fourth' ? '4' : 'Overall';
    
    // If "overall" is selected for gender, combine Male and Female data
    if (selectedGender === 'overall') {
      const maleData = maledata?.[yearKey] || { veg_count: 0, non_veg_count: 0 };
      const femaleData = femaledata?.[yearKey] || { veg_count: 0, non_veg_count: 0 };

      return {
        veg_count: maleData.veg_count + femaleData.veg_count,
        non_veg_count: maleData.non_veg_count + femaleData.non_veg_count,
      };
    }
  
    // If a specific gender is selected, return the corresponding data
    if (genderKey) {
      const genderData = genderKey === 'Male' ? maledata : femaledata;
      return genderData?.[yearKey] || { veg_count: 0, non_veg_count: 0 };
    }
  
    // Default fallback
    return { veg_count: 0, non_veg_count: 0 };
  };

  const closeAbsentModal = () => {
    setShowAbsentModal(false);
    setTimeout(() => {
      document.body.style.overflow = "auto";
    }, 100);
  };

  const closeMismatchModal = () => {
    setShowMismatchModal(false);
    setTimeout(() => {
      document.body.style.overflow = "auto";
    }, 100);
  };

  const closeIframeModal = () => {
    setShowIframe(false);
    setTimeout(() => {
      document.body.style.overflow = "auto";
    }, 100);
  };
  
  const currentData = getCurrentData();
  console.log("Current Data ",currentData);
  

  useEffect(() => {
    const targetCount = currentData.veg_count + currentData.non_veg_count;
    const targetVeg = currentData.veg_count;
    console.log(targetVeg);
    const targetNonVeg = currentData.non_veg_count;
    let current = 0;
    let vegCurrent = 0;
    let nonVegCurrent = 0;

    const animationDuration = 1000;
    const steps = 60;
    const interval = animationDuration / steps;

    const countIncrement = targetCount / steps;
    const vegIncrement = targetVeg / steps;
    const nonVegIncrement = targetNonVeg / steps;

    const timer = setInterval(() => {
      current += countIncrement;
      vegCurrent += vegIncrement;
      nonVegCurrent += nonVegIncrement;

      if (current >= targetCount) {
        setAnimatedCount(targetCount);
        setAnimatedVeg(targetVeg);
        setAnimatedNonVeg(targetNonVeg);
        clearInterval(timer);
      } else {
        setAnimatedCount(Math.round(current));
        setAnimatedVeg(Math.round(vegCurrent));
        setAnimatedNonVeg(Math.round(nonVegCurrent));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [selectedYear, selectedGender ,maledata, femaledata]);

  const getFilteredList = (list) => {
    if (selectedGender === 'overall') return list;
    return list.filter(item => 
      (selectedGender === 'boys' && item.gender === 'male') ||
      (selectedGender === 'girls' && item.gender === 'female')
    );
  };

  return (
    <div className="attendance-container">
      <div className="attendance-main">
        <div className="attendance-filters">
          <div className="attendance-filter-group">
            <label className="attendance-filter-label">Year</label>
            <select 
              className="attendance-filter-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="overall">Overall</option>
              <option value="first">First Year</option>
              <option value="second">Second Year</option>
              <option value="third">Third Year</option>
              <option value="fourth">Fourth Year</option>
            </select>
          </div>

          <div className="attendance-filter-group">
            <label className="attendance-filter-label">Gender</label>
            <select 
              className="attendance-filter-select"
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
            >
              <option value="overall">Overall</option>
              <option value="boys">Boys</option>
              <option value="girls">Girls</option>
            </select>
          </div>
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
                    strokeDasharray: `${(animatedCount / currentData.totalStudents) * 251.2} 251.2`
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
                  {((currentData.veg_count / (currentData.veg_count + currentData.non_veg_count)) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="attendance-food-type">
              <Utensils className="attendance-food-icon attendance-non-veg" />
              <div className="attendance-food-details">
                <h3>Non-Vegetarian</h3>
                <p className="attendance-food-number">{animatedNonVeg}</p>
                <p className="attendance-food-percentage">
                  {((currentData.non_veg_count / (currentData.veg_count + currentData.non_veg_count)) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="attendance-pie-chart">
          <div
            className="attendance-pie"
            style={{
              background: `conic-gradient(
                #10b981 0% ${(currentData.veg_count / (currentData.veg_count + currentData.non_veg_count)) * 100}%,
                #10b981 ${(currentData.veg_count / (currentData.veg_count + currentData.non_veg_count)) * 100}% ${(currentData.veg_count / (currentData.veg_count + currentData.non_veg_count)) * 100}%,
                #ef4444 ${(currentData.veg_count / (currentData.veg_count + currentData.non_veg_count)) * 100}% 100%
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
        </button> */}

        {/* {showIframe && (
          <div className="attendance-modal-overlay" onClick={() => setShowIframe(false)}>
            <div className="attendance-modal" onClick={(e) => e.stopPropagation()}>
              <div className="attendance-modal-header">
                <h2>Attendance Consolidation</h2>
                <button className="attendance-modal-close" onClick={closeIframeModal}>
                  <X />
                </button>
              </div>
              <div className="attendance-modal-content">
                <iframe
                  src="https://drive.google.com/file/d/11BOmR-0biNhpCG2dipZsLH_s1vdk6Gb0"
                  className="attendance-iframe"
                ></iframe>
              </div>
            </div>
          </div>
        )} */}

        {/* {showAbsentModal && (
          <div 
            className="attendance-modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAbsentModal(false);
              }
            }}
          >
            <div className="attendance-modal">
              <div className="attendance-modal-header">
                <h2>Absent Students</h2>
                <button 
                  className="attendance-modal-close"
                  onClick={closeAbsentModal}
                >
                  <X />
                </button>
              </div>
              <div className="attendance-modal-content">
                {getFilteredList(yearData[selectedYear].absentList).map((student, index) => (
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
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowMismatchModal(false);
              }
            }}
          >
            <div className="attendance-modal">
              <div className="attendance-modal-header">
                <h2>Mismatched Students</h2>
                <button 
                  className="attendance-modal-close"
                  onClick={closeMismatchModal}
                >
                  <X />
                </button>
              </div>
              <div className="attendance-modal-content">
                {getFilteredList(yearData[selectedYear].mismatchedList).map((student, index) => (
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