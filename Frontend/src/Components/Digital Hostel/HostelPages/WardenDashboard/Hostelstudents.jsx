import React, { useState, useRef, useEffect } from 'react';
import {BarChart, ClipboardList, GraduationCap, Search, Filter, Check, X, Footprints, Download } from 'lucide-react';
import { Home, Walk } from "lucide-react";
import HostelSidebar from '../HostelSidebar';
import './Hostelstudents.css';
import axios from 'axios';
import DownloadExcel from '../excel';
import DownloadPdf from '../pdf';
import showSweetAlert from '../Alert';
import Swal from 'sweetalert2';

function Hostelstudents() {
    const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    year: 'All',
    department: 'All',
    foodType: 'All',
    transitStatus: "All",
    passType: "All"
  });
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [activeNav, setActiveNav] = useState('students');
  const [editingStates, setEditingStates] = useState({});
  const [tempFoodTypes, setTempFoodTypes] = useState({});
  const filterRef = useRef(null);
  const [studentsData, setStudentData] = useState(null);
  const [yearData, setYearData] = useState(null);
  const [reg, setReg] = useState(null);
  const [editingRoomStates, setEditingRoomStates] = useState({});
  const [tempRoomNumbers, setTempRoomNumbers] = useState({});     

  // Year Mapping
  const yearToAlphabet = {
    '1': 'First Year', 
    '2': 'Second Year',
    '3': 'Third Year',
    '4': 'Fourth Year' 
  };

  // Mapping Department Codes to Full Names
  const departmentLabels = {
    "AI&DS": "AI",
    "AUTO": "Automobile",
    "CIVIL": "Civil",
    "CSE": "Computer Science",
    "CYBER": "Cyber",
    "EEE": "EEE",
    "ECE": "ECE",
    "EIE": "EIE",
    "IT": "IT",
    "MECH": "Mechanical",
    "MBA": "MBA"
  };
  // Fetching Data for warden student base
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/get_student_details');
        if (response.data && response.data.students) {
          const formattedData = response.data.students.map((student) => ({
            id: student._id,
            name: student.name,
            photo: student.profile_photo_path, // Ensure this is a valid URL
            admissionNumber: student.admin_number,
            registrationNumber: student.registration_number,
            year: yearToAlphabet[student.year] || `Year ${student.year}`, // Handles missing mapping
            department: student.department,
            roomNumber: student.room_number,
            studentMobile: student.phone_number_student,
            parentMobile: student.phone_number_parent,
            area: student.city,
            foodType: student.foodtype === "Veg" ? "Vegetarian" : "Non-Vegetarian",
            transitStatus: student.transit_status,
            vacateStatus: student.vacate_status,
            passInfo: student.pass_info || {}, // Ensure it's always an object
          }));
          setStudentData(formattedData);
        }
      } catch (err) {
        console.error("Error fetching data", err);
      }
    };
    fetchData();
  }, []);
  

  const handleVacateStatus = async (studentId) => {

    // Find the student by ID in studentsData
    const student = studentsData.find(s => s.id === studentId);

    if (!student) {
        console.error("Student not found for ID:", studentId);
        showSweetAlert("Error", "Student not found!", "error");
        return;
    }

    try {
        const response = await axios.post(
            "/api/mark_student_vacate",
            { student_id: student.registrationNumber },  
            { withCredentials: true }
        );

        if (response.status === 200) {
            // showSweetAlert("Vacate Status", response.data.message, "success");
            Swal.fire({
              title: "Vacate Status",
              text: `response.data.message`,
              icon: "success",
              timer: 1000,
              showConfirmButton: false,
              willClose: () => {
                Swal.close(); // Close the alert
                window.location.reload(); // Reload the page
              },
            });
        }
    } catch (error) {
        console.error("Error Fetching Data:", error);
        showSweetAlert("Vacate Status", "Student not marked for vacating", "error");
    }
};


  //getting year data
  useEffect(()=>{
    const fetchData = async () => {
        try{
          const response = await axios.get('/api/sidebar_warden');
          const fetchdata = response.data;
          setYearData(fetchdata?.["primary year"]); 
        }
        catch (err) {
          console.error("Failed to fetch",err);
        }
      }
      fetchData();
  },[]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleCard = (id) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const startEditing = (studentId) => {
    setEditingStates(prev => ({ ...prev, [studentId]: true }));
    setTempFoodTypes(prev => ({
      ...prev,
      [studentId]: studentsData.find(s => s.id === studentId)?.foodType
    }));
  };

  const cancelEditing = (studentId) => {
    setEditingStates(prev => ({ ...prev, [studentId]: false }));
    setTempFoodTypes(prev => ({ ...prev, [studentId]: null }));
  };

  const saveFoodType = async (studentId) => {
    const newFoodType = tempFoodTypes[studentId];
    if (!newFoodType) return;
  
    const student = studentsData?.find(s => s.id === studentId);
    if (!student) return;
  
    const isConfirmed = window.confirm("Are you sure you want to change the food type?");
    if (!isConfirmed) {
      alert("Food type change was canceled by the user.");
      return;
    }
  
    try {
      const response = await axios.post('/api/warden_change_foodtype', 
        { registration_number: student.registrationNumber },
        { withCredentials: true } 
      );
  
      setStudentData(prev => prev?.map(student => 
        student.id === studentId
          ? { ...student, foodType: newFoodType }
          : student
      ));
      
      setEditingStates(prev => ({ ...prev, [studentId]: false }));
      setTempFoodTypes(prev => ({ ...prev, [studentId]: null }));

      window.location.reload();
  
    } catch (error) {
      // Handle error and notify user
      console.error("Error updating food type:", error);
      alert("Failed to update food type. Please try again later.");
    }
  };

  const startRoomEditing = (studentId) => {
    setEditingRoomStates(prev => ({ ...prev, [studentId]: true }));
    setTempRoomNumbers(prev => ({
      ...prev,
      [studentId]: studentsData.find(s => s.id === studentId)?.roomNumber
    }));
  };
  
  const cancelRoomEditing = (studentId) => {
    setEditingRoomStates(prev => ({ ...prev, [studentId]: false }));
    setTempRoomNumbers(prev => ({ ...prev, [studentId]: null }));
  };
  
  const saveRoomNumber = async (studentId) => {
    const newRoomNumber = tempRoomNumbers[studentId];
    if (!newRoomNumber) return;
    
    const student = studentsData?.find(s => s.id === studentId);
    if (!student) return;
  
    const isConfirmed = window.confirm("Are you sure you want to change the room number?");
    if (!isConfirmed) {
      alert("Room number change was canceled by the user.");
      return;
    }
  
    try {
      const response = await axios.post('/api/edit_student_room_number', 
        { 
          student_id: student.registrationNumber, 
          new_room_number: newRoomNumber 
        },
        { withCredentials: true } 
      );
  
      // if (response.ok) {
        setStudentData(prev => prev?.map(student => 
          student.id === studentId
            ? { ...student, roomNumber: newRoomNumber }
            : student
        ));
        
        // Reset editing states
        setEditingRoomStates(prev => ({ ...prev, [studentId]: false }));
        setTempRoomNumbers(prev => ({ ...prev, [studentId]: null }));
  
        alert("Room number updated successfully!");
        window.location.reload();
      // } else {
        // throw new Error(response.data.error || "Failed to update room number");
      // }
    } catch (error) {
      console.error("Error updating room number:", error);
      alert(error.message || "Failed to update room number. Please try again later.");
    }
  };
  
  const handleRoomNumberChange = (studentId, newValue) => {
    setTempRoomNumbers(prev => ({ ...prev, [studentId]: newValue }));
  };

  const handleFoodTypeChange = (studentId, newValue) => {
    setTempFoodTypes(prev => ({ ...prev, [studentId]: newValue }));
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return { date: "N/A", time: "N/A" }; // Handle missing values
  
    const dateObj = new Date(dateTime);
    return {
      date: dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }), // Example: "21 February 2025"
      time: dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) // Example: "09:00 AM"
    };
  };
  


  const filteredStudents = studentsData?.filter(student => {
    // Convert search term to lowercase for case-insensitive search
    const searchTermLower = searchTerm.toLowerCase();

    const matchesSearch =
        student.name.toLowerCase().includes(searchTermLower) ||
        student.admissionNumber.toLowerCase().includes(searchTermLower) ||
        student.area.toLowerCase().includes(searchTermLower) ||
        student.roomNumber.toString().includes(searchTermLower) ||
        student.studentMobile.toString().includes(searchTermLower) ||
        departmentLabels[student.department]?.toLowerCase().includes(searchTermLower);

    const matchesYear =
          filters.year === "All" || student.year === yearToAlphabet[filters.year];
          
    const matchesDepartment =
          filters.department === "All" || student.department === filters.department;

    const matchesFoodType =
        filters.foodType === "All" || student.foodType === filters.foodType;

    const matchesTransitStatus =
        filters.transitStatus === "All" || 
        (filters.transitStatus === "true" && student.transitStatus) || 
        (filters.transitStatus === "false" && !student.transitStatus);

        const matchesPassType = 
        filters.passType === 'All' ||
        (filters.passType === 'staypass' && student.passInfo.passtype === 'staypass') ||
        (filters.passType === 'outpass' && student.passInfo.passtype === 'outpass') ||
        (filters.passType === 'od' && student.passInfo.passtype === 'od') ||
        (filters.passType === 'leave' && student.passInfo.passtype === 'leave');

    return matchesSearch && matchesYear && matchesDepartment && matchesFoodType && matchesTransitStatus && matchesPassType;
});

  return (
    <div className="details-container">
      <HostelSidebar role='warden' />
      {/* Main Content */}
      <div className="details-main">
        {/* Header with Search and Filter */}
        <div className="details-header">
          <div className="details-search">
            <Search className="details-search-icon" />
            <input
              type="text"
              placeholder="Search students by anything"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="details-search-input"
            />
          </div>
            <div className="buttons">

                <button className='filter-button download'>
                  <Download />
                  <DownloadPdf studentData={filteredStudents}/>
                </button>

                <div className="details-filter" ref={filterRef}>
                  <button 
                    className="filter-button"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter size={20} />
                    Filters
                  </button>
                  
                  {showFilters && (
                    <div className="filter-popup">
                      <div className="filter-section">
                        <label className="filter-label">Year</label>
                        <select
                          className="filter-select"
                          value={filters.year}
                          onChange={(e) => setFilters({...filters, year: e.target.value})}
                        >
                          <option value="All">All Years</option>
                            {yearData?.map((year) => (
                              <option key={year} value={year}>  
                                {yearToAlphabet[year]}
                              </option>
                            ))}
                        </select>
                      </div>
                      
                      <div className="filter-section">
                        <label className="filter-label">Department</label>
                        <select
                          className="filter-select"
                          value={filters.department}
                          onChange={(e) => setFilters({...filters, department: e.target.value})}
                        >
                          <option value="All">All Departments</option>
                          <option value="AI&DS">AI</option>
                          <option value="AUTO">Automobile</option>
                          <option value="CIVIL">Civil</option>
                          <option value="CSE">Computer Science</option>
                          <option value="CYBER">Cyber</option>
                          <option value="ECE">ECE</option>
                          <option value="EEE">EEE</option>
                          <option value="EIE">EIE</option>
                          <option value="IT">IT</option>
                          <option value="MECH">Mechanical</option>
                          <option value="MBA">MBA</option>
                        </select>
                      </div>
                      
                      <div className="filter-section">
                        <label className="filter-label">Food Type</label>
                        <select
                          className="filter-select"
                          value={filters.foodType}
                          onChange={(e) => setFilters({...filters, foodType: e.target.value})}
                        >
                          <option value="All">All Types</option>
                          <option value="Vegetarian">Vegetarian</option>
                          <option value="Non-Vegetarian">Non-Vegetarian</option>
                        </select>
                      </div>
                      {/* Transit Status Filter */}
                      <div className="filter-section">
                        <label className="filter-label">Transit Status</label>
                        <select
                          className="filter-select"
                          value={filters.transitStatus}
                          onChange={(e) => setFilters({...filters, transitStatus: e.target.value})}
                        >
                          <option value="All">All Students</option>
                          <option value="true">In Transit</option>
                          <option value="false">In Hostel</option>
                        </select>
                      </div>
                      <div className="filter-section">
                        <label className="filter-label">Pass Type</label>
                        <select
                          className="filter-select"
                          value={filters.passType}
                          onChange={(e) => setFilters({ ...filters, passType: e.target.value })}
                        >
                          <option value="All">All Students</option>
                          <option value="staypass">Stay Pass</option>
                          <option value="outpass">Out Pass</option>
                          <option value="od">OD</option>
                          <option value="leave">Leave</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

            </div>
        </div>

        {/* Student Cards Grid */}
        <div className="details-grid">
          {filteredStudents?.map(student => (
            <div key={student.id} className="details-card">
              <div className="logo">
                {student.transitStatus ? <Footprints size={18} className="transit-icon" /> : <Home size={18} className="home-icon" />}
              </div>
              <div className="details-basic-info">
                <img
                  src={student.photo} 
                  alt={student.name}
                  className="details-student-photo"
                />
                <div className="details-primary-info">
                  <h3 className="details-name">{student.name}</h3>
                  <p className="details-admission">Admission No: {student.admissionNumber}</p>
                  <p className="details-year">{student.year}</p>
                  <p className="details-department">{departmentLabels[student.department]}</p>
                </div>
              </div>
              
              <div className={`details-extended-info ${
                expandedCards.has(student.id) ? 'details-expanded' : ''
              }`}>
                <div className="details-info-grid">
                <div className="details-info-item">
                  <span className="details-label">Room Number:</span>
                  {editingRoomStates[student.id] ? (
                    <div className="details-food-edit">
                      <input
                        type="text"
                        value={tempRoomNumbers[student.id] || student.roomNumber}
                        onChange={(e) => handleRoomNumberChange(student.id, e.target.value)}
                        className="details-room-input"
                      />
                      <button
                        className="details-food-button save"
                        onClick={() => saveRoomNumber(student.id)}
                      >
                        ✔
                      </button>
                      <button
                        className="details-food-button cancel"
                        onClick={() => cancelRoomEditing(student.id)}
                      >
                        ✘
                      </button>
                    </div>
                  ) : (
                    <div className="details-food-display">
                      <span>{student.roomNumber}</span>
                      <button
                        className="details-food-edit-button"
                        onClick={() => startRoomEditing(student.id)}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
                  <div className="details-info-item">
                    <span className="details-label">Transit Status:</span>
                    {student.transitStatus ? <span>In Transit</span> : <span>In Hostel</span>}
                  </div>

                  {/* Display pass details only if passInfo exists and has non-null values */}
                  {student.passInfo && (student.passInfo.passtype || student.passInfo.from || student.passInfo.to) && (
                    <>
                      <div className="details-info-item">
                        <span className="details-label">Pass Type:</span>
                        <span>{student.passInfo.passtype || "N/A"}</span>
                      </div>
                      <div className="details-info-item">
                        <span className="details-label">From:</span>
                        <span className='text-xs'>{formatDateTime(student.passInfo?.from).date} at {formatDateTime(student.passInfo?.from).time}</span>
                      </div>
                      <div className="details-info-item">
                        <span className="details-label">To:</span>
                        <span className='text-xs'>{formatDateTime(student.passInfo?.to).date} at {formatDateTime(student.passInfo?.to).time}</span>
                      </div>
                    </>
                  )}

                  <div className="details-info-item">
                    <span className="details-label">Student Mobile:</span>
                    <span><a href={`tel:'${student.studentMobile}`} className='no-underline text-black'>{student.studentMobile}</a></span>
                  </div>
                  <div className="details-info-item">
                    <span className="details-label">Parent Mobile:</span>
                    <span><a href={`tel:${student.parentMobile}`} className='no-underline text-black'>{student.parentMobile}</a></span>
                  </div>
                  <div className="details-info-item">
                    <span className="details-label">Area:</span>
                    <span>{student.area}</span>
                  </div>
                  <div className="details-info-item">
                    <span className="details-label">Food Type:</span>
                    {editingStates[student.id] ? (
                      <div className="details-food-edit">
                        <select
                          value={tempFoodTypes[student.id] || student.foodType}
                          onChange={(e) => handleFoodTypeChange(student.id, e.target.value)}
                          className="details-food-select"
                        >
                          <option value="Vegetarian">Vegetarian</option>
                          <option value="Non-Vegetarian">Non-Vegetarian</option>
                        </select>
                        <button
                          className="details-food-button save"
                          onClick={() => saveFoodType(student.id)}
                        >
                           ✔
                        </button>
                        <button
                          className="details-food-button cancel"
                          onClick={() => cancelEditing(student.id)}
                        >
                          ✘
                        </button>
                      </div>
                    ) : (
                      <div className="details-food-display">
                        <span>{student.foodType}</span>
                        <button
                          className="details-food-edit-button"
                          onClick={() => startEditing(student.id)}
                        >
                          Edit
                        </button>
                      </div>
                    )}
                </div>
                {!student.vacateStatus && (
                  <div className="details-vaccate-display">
                    <button
                      className="details-vaccate-button"
                      onClick={() => handleVacateStatus(student.id)}
                    >
                      Mark Vaccate
                    </button>
                    {/* <span>Vacate </span> */}
                  </div>
                )}
                </div>
              </div>
              
              <button
                className="details-view-more"
                onClick={() => toggleCard(student.id)}
              >
                {expandedCards.has(student.id) ? 'View Less' : 'View More'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Hostelstudents;