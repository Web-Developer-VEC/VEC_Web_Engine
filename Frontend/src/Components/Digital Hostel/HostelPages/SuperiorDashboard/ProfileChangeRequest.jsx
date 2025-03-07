import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import './ProfileChangeRequest.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function SuperiorRequest() {
  const [records, setRecords] = useState([]);
  const [wardenYears, setWardenYears] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeGender, setActiveGender] = useState('');
  const [filters, setFilters] = useState({ year: '', department: '', search: '' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch warden years
  const fetchWardenDetails = async () => {
    try {
      const response = await fetch('/api/sidebar_warden');
      const data = await response.json();
      if (data["primary year"]) {
        setWardenYears([...data["primary year"]]);
      }
    } catch (error) {
      console.error("❌ Error fetching warden details:", error);
    }
  };

  // Fetch food type requests
  const fetchFoodRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/profile_request_changes');
      const data = await response.json();
      if (data.requests) {
        setRecords(data.requests);
        setDepartments([...new Set(data.requests.map(req => req.department))]);
      }
    } catch (error) {
      console.error("❌ Error fetching food requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenderFilter = (gender) => {
    const newGender = activeGender === gender ? '' : gender; // Toggle selection
    setActiveGender(newGender);
  };

  useEffect(() => {
    fetchWardenDetails();
    fetchFoodRequests();
  }, []);

  // Accept/Decline Handlers
  const handleAction = async (registration_number, action) => {
    try {
      const response = await fetch('/api/handle_request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_number, action })
      });

      if (response.ok) {
        setRecords(records.filter(record => record.registration_number !== registration_number));
        Swal.fire({
          title: "Updated Successful",
          text: "Profile request Updated ",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          willClose: () => {
            Swal.close();
          },
        });
        setSelectedRecord(null);
      }
    } catch (error) {
      console.error(`❌ Error processing ${action} request:`, error);
    }
  };

  // Filter Logic
  const filteredRecords = records.filter(record => {
    const searchQuery = filters.search.toLowerCase();
    return (
      (!activeGender || record.gender === activeGender) && // ✅ Add gender filtering here
      (!filters.year || record.year.toString() === filters.year) &&
      (!filters.department || record.department === filters.department) &&
      (!filters.search ||
        record.name.toLowerCase().includes(searchQuery) ||
        record.registration_number.toLowerCase().includes(searchQuery) ||
        record.room_number.toLowerCase().includes(searchQuery)
      )
    );
  });

  return (
    <div className="VR-app">
      <div className="VR-main">
        <h1 className="VR-page-title">Profile Change Requests</h1>

        {/* Filter Bar */}
        <div className="VR-filter-bar">
          <div className="VR-search-container">
            <Search className="VR-search-icon" />
            <input
              type="text"
              placeholder="Search by Name, Room Number, or Registration No..."
              className="VR-search-input"
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <div className="VR-filters">
          <div className="SR-gender-buttons">
          <button
            className={`SR-gender-button ${activeGender === 'Male' ? 'SR-gender-button-active' : ''}`}
            onClick={() => handleGenderFilter(activeGender === 'Male' ? '' : 'Male')}
          >
            Boys
          </button>
          <button
            className={`SR-gender-button ${activeGender === 'Female' ? 'SR-gender-button-active' : ''}`}
            onClick={() => handleGenderFilter(activeGender === 'Female' ? '' : 'Female')}
          >
            Girls
          </button>
        </div>
            {/* Year Filter */}
            <select className="VR-filter-select" onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}>
              <option value="">All Years</option>
              {wardenYears.map(year => (
                <option key={year} value={year}>
                  {year === 1 ? "First Year" :
                   year === 2 ? "Second Year" :
                   year === 3 ? "Third Year" :
                   year === 4 ? "Fourth Year" : `Year ${year}`}
                </option>
              ))}
            </select>

            {/* Department Filter */}
            <select className="VR-filter-select" onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}>
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="VR-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Year</th>
                <th>Room</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.registration_number} onClick={() => setSelectedRecord(record)}>
                  <td>{record.from_data.name}</td>
                  <td>{["I", "II", "III", "IV"][record.year - 1] || record.year}</td>
                  <td>{record.room_number}</td>
                  <td>
                    <span className={`VR-status ${record.edit_status === null ? "VR-status-warning" : record.edit_status ? "VR-status-success" : "VR-status-danger"}`}>
                      {record.edit_status === null ? "Pending" : record.edit_status ? "Accepted" : "Declined"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Modal */}
        {selectedRecord && (
          <DetailModal
            record={selectedRecord}
            onClose={() => setSelectedRecord(null)}
            onAccept={() => handleAction(selectedRecord.registration_number, "approve")}
            onDecline={() => handleAction(selectedRecord.registration_number, "decline")}
          />
        )}
      </div>
    </div>
  );
}

// Detail Modal Component
function DetailModal({ record, onClose, onAccept, onDecline }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Function to check if a field has changed
  const getChangedFields = () => {
    const changedFields = [];
    Object.keys(record.from_data).forEach((key) => {
      if (record.from_data[key] !== record.to_data[key]) {
        changedFields.push(key);
      }
    });
    return changedFields;
  };

  const changedFields = getChangedFields(); // Get only changed fields

  return (
    <div className="SR-modal-overlay">
      <div ref={modalRef} className="SR-modal-container">
        <div className="SR-modal-content">
          <div className="SR-modal-header">
            <h2 className="SR-title">Profile Change Request</h2>
            <button onClick={onClose} className="SR-close-button">
              <X className="SR-icon" />
            </button>
          </div>

          <div className="SR-modal-body">
            <table className="SR-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>From (Previous)</th>
                  <th></th>
                  <th>To (Updated)</th>
                </tr>
              </thead>
              <tbody>
                {changedFields.includes("name") && (
                  <tr>
                    <td><strong>Name</strong></td>
                    <td>{record.from_data.name}</td>
                    <td className="arrow-cell">→</td>
                    <td>{record.to_data.name}</td>
                  </tr>
                )}
                {changedFields.includes("room_number") && (
                  <tr>
                    <td><strong>Room Number</strong></td>
                    <td>{record.from_data.room_number}</td>
                    <td className="arrow-cell">→</td>
                    <td>{record.to_data.room_number}</td>
                  </tr>
                )}
                {changedFields.includes("phone_number_student") && (
                  <tr>
                    <td><strong>Student Mobile</strong></td>
                    <td>{record.from_data.phone_number_student}</td>
                    <td className="arrow-cell">→</td>
                    <td>{record.to_data.phone_number_student}</td>
                  </tr>
                )}
                {changedFields.includes("phone_number_parent") && (
                  <tr>
                    <td><strong>Parent's Mobile</strong></td>
                    <td>{record.from_data.phone_number_parent}</td>
                    <td className="arrow-cell">→</td>
                    <td>{record.to_data.phone_number_parent}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="SR-modal-footer">
            <button onClick={onDecline} className="SR-button SR-button-secondary">
              Decline
            </button>
            <button onClick={onAccept} className="SR-button SR-button-primary">
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


export default SuperiorRequest;
