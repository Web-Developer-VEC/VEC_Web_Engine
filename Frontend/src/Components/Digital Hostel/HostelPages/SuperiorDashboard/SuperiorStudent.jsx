import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Download, Edit2, Filter, Footprints, Home, Save, Search, Trash2} from 'lucide-react';
import './SuperiorStudent.css';
import axios from 'axios';
import showSweetAlert from '../Alert';
import DownloadPdf from '../pdf';
import Swal from 'sweetalert2';

function StudentTile({ student, onSave ,onDelete, format}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStudent, setEditedStudent] = useState(student);

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  
  useEffect(() => {
    setEditedStudent(student);
  }, [student]);

  const handleSave = () => {
    onSave(editedStudent);
    setIsEditing(false);
  };

  const handleExpandToggle = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
      setIsEditing(false); // Reset editing state when collapsing
      setEditedStudent(student); // Reset any unsaved changes
    }
  };

  return (
    <div className="superior-student-tile">
      <div className="logo">
        {student.transitStatus ? <Footprints size={18} className="transit-icon" /> : <Home size={18} className="home-icon" />}
      </div>
      <div className="superior-student-header">
        <img src={UrlParser(student.photo)} alt={student.name} />
        <div className="superior-student-basic-info">
          {isEditing ? (
            <div className="superior-edit-form">
              <input
                type="text"
                value={editedStudent.name}
                onChange={(e) => setEditedStudent({ ...editedStudent, name: e.target.value })}
              />
              <input
                type="text"
                value={editedStudent.admissionNumber}
                onChange={(e) => setEditedStudent({ ...editedStudent, admissionNumber: e.target.value })}
              />
              <input
                type="text"
                value={editedStudent.registrationNumber}
                onChange={(e) => setEditedStudent({ ...editedStudent, registrationNumber: e.target.value })}
              />
              <input
                type="text"
                value={editedStudent.department}
                onChange={(e) => setEditedStudent({ ...editedStudent, department: e.target.value })}
              />
            </div>
          ) : (
            <>
              <h3>{student.name}</h3>
              <p>Adm No: {student.admissionNumber}</p>
              <p>Reg No: {student.registrationNumber}</p>
              <p>Dept: {student.department}</p>
              <p>Year: {student.year}</p>
              <p>Room: {student.roomNumber}</p>
            </>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="superior-student-details">
          {isEditing ? (
            <div className="superior-edit-form">
              <input
                type="text"
                value={editedStudent.roomNumber}
                onChange={(e) => setEditedStudent({ ...editedStudent, roomNumber: e.target.value })}
                placeholder="Room Number"
              />
              <input
                type="text"
                value={editedStudent.studentMobile}
                onChange={(e) => setEditedStudent({ ...editedStudent, studentMobile: e.target.value })}
                placeholder="Student Mobile"
              />
              <input
                type="text"
                value={editedStudent.parentMobile}
                onChange={(e) => setEditedStudent({ ...editedStudent, parentMobile: e.target.value })}
                placeholder="Parent Mobile"
              />
              <input
                type="text"
                value={editedStudent.area}
                onChange={(e) => setEditedStudent({ ...editedStudent, area: e.target.value })}
                placeholder="Area"
              />
              <select
                value={editedStudent.foodType}
                onChange={(e) => setEditedStudent({ ...editedStudent, foodType: e.target.value })}
                className="block w-full px-4 py-2 border border-red-500 bg-white text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="Veg">Vegetarian</option>
                <option value="Non-Veg">Non-Vegetarian</option>
              </select>
            </div>
          ) : (
            <>
              <p>Transit Status: {student.transitStatus ? <span>In Transit</span> : <span>In Hostel</span>}</p>
              {/* Display pass details only if passInfo exists and has non-null values */}
              {student.passInfo && (student.passInfo.passtype || student.passInfo.from || student.passInfo.to) && (
                <>
                  <div className="details-info-item">
                    <span className="details-label">Pass Type:</span>
                    <span>{student.passInfo.passtype || "N/A"}</span>
                  </div>
                  <div className="details-info-item">
                    <span className="details-label">From:</span>
                    <span >{format(student.passInfo?.from).date} at {format(student.passInfo?.from).time}</span>
                  </div>
                  <div className="details-info-item">
                    <span className="details-label">To:</span>
                    <span >{format(student.passInfo?.to).date} at {format(student.passInfo?.to).time}</span>
                  </div>
                </>
              )}
              <p>Student Mobile: <a href={`tel${student.studentMobile}`} className='no-underline text-black'>{student.studentMobile}</a></p>
              <p>Parent Mobile: <a href={`tel:${student.parentMobile}`} className='no-underline text-black'>{student.parentMobile}</a></p>
              <p>Area: {student.area}</p>
              <p>Food Type: {student.foodType}</p>
            </>
          )}
        </div>
      )}

      <div className="superior-student-actions">
        <button onClick={handleExpandToggle} className="superior-view-button">
          {isExpanded ? (
            <>
              <ChevronUp className="superior-icon" /> View Less
            </>
          ) : (
            <>
              <ChevronDown className="superior-icon" /> View More
            </>
          )}
        </button>
        {isExpanded && (
          isEditing ? (
            <>
              <button onClick={onDelete} className="superior-delete-button">
                <Trash2 className="superior-icon" /> Delete
              </button>

              <button onClick={handleSave} className="superior-save-button">
                <Save className="superior-icon" /> Save
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="superior-edit-button">
              <Edit2 className="superior-icon" /> Edit
            </button>
          )
        )}
      </div>
    </div>
  );
}


function SuperiorStudent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState('male');
  const [department, setDepartment] = useState('');
  const [foodType, setFoodType] = useState('');
  const [year, setYear] = useState('');
  const [students, setStudents] = useState(null);
  const [activeNav, setActiveNav] = useState('students'); // Add this for mobile navigation
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Control modal visibility
  const [tempYear, setTempYear] = useState(""); // Store selected year before confirmation
  const [selectedYear, setSelectedYear] = useState(""); 
  const [uniqueBatches, setUniqueBatches] = useState([]);
  const [filters, setFilters] = useState({
    year: 'All',
    department: 'All',
    foodType: 'All',
    transitStatus: "All",
    passType: "All"
  });

  const yearToAlphabet = {
    '1': 'First Year', 
    '2': 'Second Year',
    '3': 'Third Year',
    '4': 'Fourth Year',
    '10': 'MBA',
    '9': 'ME',
    'overall': 'Overall'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/fetch_student_details_superior');
        const fetchedData = response.data;

        const formattedData = fetchedData.students.map((student) => ({
          id: student._id,
          name: student.name,
          photo: student.profile_photo_path, // Ensure this is a valid URL
          admissionNumber: student.admin_number,
          registrationNumber: student.registration_number,
          gender : student.gender,
          year: yearToAlphabet[student.year], 
          department: student.department,
          roomNumber: student.room_number,
          studentMobile: student.phone_number_student,
          parentMobile: student.phone_number_parent,
          area: student.city,
          foodType: student.foodtype === "Veg" ? "Vegetarian" : "Non-Vegetarian",
          transitStatus: student.transit_status,
          vacateStatus: student.vacate_status,
          passInfo: student.pass_info || {}, // Ensure it's always an 
          batch: student.batch
        }));

        const batches = [...new Set(formattedData.map(student => student.batch))];
        setUniqueBatches(batches);
  
        setStudents({
          male: formattedData?.filter(student => student.gender === "Male"),
          female: formattedData?.filter(student => student.gender === "Female")
        });
  
      } catch (err) {
        console.error('Error fetching data', err);
      }
    };
  
    fetchData();
  }, []);

  const handleDelete = async (registration_number) => {
    try {
      const response = await fetch("/api/delete_student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", 
        body: JSON.stringify({ registration_number , type: "student" }), 
      });
  
      if (response.ok) {
        Swal.fire({
          title: "Success!",
          text: "Student data deleted successfully.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          willClose: () => {
            Swal.close();
          },
        });
      } else {
        // alert("Failed to delete student.");
        showSweetAlert("Error","Error Deleting The Student try Again Later",'error');
      }
    } catch (error) {
      console.error("❌ Error deleting student:", error);
      // alert("Error deleting student. Try again.");
      showSweetAlert("Error","Error Deleting The Student try Again Later",'error');
    }
  };


  // Handle year selection
  const handleYearChange = (event) => {
    const year = event.target.value;
  
    // If "Increment Student Year" is selected, do nothing
    if (year === "") {
      return;
    }
  
    setTempYear(year); // Store the selected year
    setIsModalOpen(true); // Open confirmation modal
  };
  
  const confirmYearChange = async () => {
    // setSelectedYear(tempYear); 
    setIsModalOpen(false); // Update state with selected year
    console.log("temp Year",tempYear);
    

    // API Call to Backend
    try {
      const response = await fetch("/api/increment_student_year", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ batch: tempYear }),
      });

      const data = await response.json();
      console.log("Response from backend:", data);
    } catch (error) {
      console.error("Error updating year:", error);
    }
  };
  
  const ConfirmationModal = ({ onConfirm, onCancel }) => (
    <div className="AR-confirmation-modal-overlay">
      <div className="AR-confirmation-modal">
        <h3>Confirm Year Increment</h3>
        <p>Are you sure you want to increment the student year {tempYear} ?</p>
        <div className="AR-confirmation-buttons">
          <button onClick={onCancel} className="AR-button AR-button-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className="AR-button AR-button-primary">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
  

  const filteredStudents = students?.[selectedGender]?.filter(student => {

    const searchTermLower = searchTerm.toLowerCase();

    const matchesSearch =
        student.name.toLowerCase().includes(searchTermLower) ||
        student.admissionNumber.toLowerCase().includes(searchTermLower) ||
        student.area.toLowerCase().includes(searchTermLower) ||
        student.roomNumber.toString().includes(searchTermLower) ||
        student.studentMobile.toString().includes(searchTermLower) ||
        student.parentMobile.toString().includes(searchTermLower) ||
        student.foodType.toString().includes(searchTermLower) ||
        student.registrationNumber.toString().includes(searchTermLower) ||
        student.department?.toLowerCase().includes(searchTermLower);

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
  }) || [];
   
  

  const handleSaveStudent = async (editedStudent, originalStudent) => {
    const updateFields = {};
  
    if (editedStudent.name !== originalStudent.name) {
      updateFields.name = editedStudent.name;
    }
    if (editedStudent.admissionNumber !== originalStudent.admissionNumber) {  
      updateFields.admin_number = editedStudent.admissionNumber;
    }
    if (editedStudent.registrationNumber !== originalStudent.registrationNumber) {
      updateFields.registration_number = editedStudent.registrationNumber
    }
    if (editedStudent.year !== originalStudent.year) {
      updateFields.year = editedStudent.year;
    }
    if (editedStudent.department !== originalStudent.department) {
      updateFields.department = editedStudent.department;
    }
    if (editedStudent.roomNumber !== originalStudent.roomNumber) { 
      updateFields.room_number = editedStudent.roomNumber;
    }
    if (editedStudent.studentMobile !== originalStudent.studentMobile) {  
      updateFields.phone_number_student = editedStudent.studentMobile;
    }
    if (editedStudent.parentMobile !== originalStudent.parentMobile) {  
      updateFields.phone_number_parent = editedStudent.parentMobile;
    }
    if (editedStudent.area !== originalStudent.area) {  
      updateFields.city = editedStudent.area;
    }
    if (editedStudent.foodType !== originalStudent.foodType) {  
      updateFields.foodtype = editedStudent.foodType;
    }
  
    if (Object.keys(updateFields).length === 0) {
      alert("No changes detected.");
      return;
    }
  
    try {
      const response = await axios.post('/api/update_student_by_warden', {
        registration_number: originalStudent.registrationNumber, 
        ...updateFields,
      });
  
      if (response.status === 200) {
        // alert("Sucessfully Updated");
        showSweetAlert("Success","Student Profile Updated Successfully",'error');
        setStudents((prevStudents) =>
          prevStudents?.[selectedGender]?.map((student) =>
            student.id === originalStudent.id ? { ...student, ...updateFields } : student
          )
        );
      } else {
        console.error("failed to update");
        
      }
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Failed to update student.');
    }
    window.location.reload();
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return { date: "N/A", time: "N/A" }; // Handle missing values
  
    const dateObj = new Date(dateTime);
    return {
      date: dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }), // Example: "21 February 2025"
      time: dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) // Example: "09:00 AM"
    };
  };

  
  return (
    <>
    <div className="superior-container">
      <div className="superior-content">
        <div className="superior-header">
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

          <div className='buttons'>
            <div className="superior-buttons">
              <button
                onClick={() => setSelectedGender('male')}
                className={selectedGender === 'male' ? 'superior-active' : ''}
              >
                Boys
              </button>
              <button
                onClick={() => setSelectedGender('female')}
                className={selectedGender === 'female' ? 'superior-active' : ''}
              >
                Girls
              </button>
                <select onChange={handleYearChange} value={selectedYear} className='custom-select'>
                  <option value="">Increment Student Year</option>
                  {uniqueBatches.map((batch) => (
                    <option key={batch} value={batch}>
                      {batch}
                    </option>
                  ))}
                </select>
              
            </div> 
            <div className='buttons-2'>
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
                            value={filters.yearyear}
                            onChange={(e) => setFilters({...filters, year: e.target.value})}
                            className="filter-select"
                          >
                            <option value="All">All Years</option>
                            <option value="1">First Year</option>
                            <option value="2">Second Year</option>
                            <option value="3">Third Year</option>
                            <option value="4">Fourth Year</option>
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
        </div>


        {isModalOpen && (
            <ConfirmationModal
              onConfirm={confirmYearChange}
              onCancel={() => setIsModalOpen(false)}
            />
          )}
        <div className="superior-students-grid">
          {filteredStudents?.map(student => (
            <StudentTile
              key={student.id}
              student={student}
              onSave={(editedStudent) => handleSaveStudent(editedStudent, student)}
              onDelete={() => handleDelete(student.registration_number)}
              format={formatDateTime}
            />
          ))}
        </div>
      </div>
    </div>
    </>
  );
}

export default SuperiorStudent;
