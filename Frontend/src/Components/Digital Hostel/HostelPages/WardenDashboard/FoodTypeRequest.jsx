import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import './FoodTypeRequest.css';
import HostelSidebar from '../HostelSidebar';
import { useNavigate } from 'react-router-dom';

function FoodTypeRequest() {
  const [records, setRecords] = useState([]);
  const [wardenYears, setWardenYears] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
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
      const response = await fetch('/api/food_requests_changes');
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

  useEffect(() => {
    fetchWardenDetails();
    fetchFoodRequests();
  }, []);

  // Accept/Decline Handlers
  const handleAction = async (registration_number, name, action) => {
    console.log(`🔵 Sending ${action.toUpperCase()} request for ${registration_number}`);
    try {
      const response = await fetch('/api/approve_food_change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_number, name, action })
      });

      if (response.ok) {
        setRecords(records.filter(record => record.registration_number !== registration_number));
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
      (!filters.year || record.year.toString() === filters.year) &&
      (!filters.department || record.department === filters.department) &&
      (!filters.search ||
        record.name.toLowerCase().includes(searchQuery) ||
        record.registration_number.toLowerCase().includes(searchQuery) ||
        record.requested_foodtype.toLowerCase().includes(searchQuery) ||
        record.room_number.toLowerCase().includes(searchQuery)
      )
    );
  });

  return (
    <div className="VR-app">
      <HostelSidebar role="warden" />
      <div className="VR-main">
        <h1 className="VR-page-title">Food Type Requests</h1>

        {/* Filter Bar */}
        <div className="VR-filter-bar">
          <div className="VR-search-container">
            <Search className="VR-search-icon" />
            <input
              type="text"
              placeholder="Search by Name, Room Number, Registration No, or Food Type..."
              className="VR-search-input"
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <div className="VR-filters">
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
                <th>Food Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.registration_number} onClick={() => setSelectedRecord(record)}>
                  <td>{record.name}</td>
                  <td>{["I", "II", "III", "IV"][record.year - 1] || record.year}</td>
                  <td>{record.room_number}</td>
                  <td className="VR-food-cell">
                    <span className={`VR-food-old ${record.previous_foodtype === 'Veg' ? 'food-veg' : 'food-nonveg'}`}>
                      {record.previous_foodtype}
                    </span>
                    <ArrowRight size={16} className="VR-food-arrow" />
                    <span className={`VR-food-new ${record.requested_foodtype === 'Veg' ? 'food-veg' : 'food-nonveg'}`}>
                      {record.requested_foodtype}
                    </span>
                  </td>
                  <td>
                    <span className={`VR-status ${record.status === null ? "VR-status-warning" : record.status ? "VR-status-success" : "VR-status-danger"}`}>
                      {record.status === null ? "Pending" : record.status ? "Accepted" : "Declined"}
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
            onAccept={() => handleAction(selectedRecord.registration_number, selectedRecord.name, "approve")}
            onDecline={() => handleAction(selectedRecord.registration_number, selectedRecord.name, "decline")}
          />
        )}
      </div>
    </div>
  );
}

// Detail Modal Component
function DetailModal({ record, onClose, onAccept, onDecline }) {
  return (
    <div className="VR-modal-overlay">
      <div className="VR-modal-container">
        <div className="VR-modal-content">
          <div className="VR-modal-header">
            <h2 className="VR-title">Confirm Changes</h2>
            <button onClick={onClose} className="VR-close-button">
              <X className="VR-icon" />
            </button>
          </div>

          <div className="VR-modal-body">
            <p className="VR-confirm-text">
              Are you sure you want to change the food type for <strong>{record.name}</strong>?
            </p>
          </div>

          <div className="VR-modal-footer">
            <button onClick={onDecline} className="VR-button VR-button-secondary">
              Decline
            </button>
            <button onClick={onAccept} className="VR-button VR-button-primary">
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoodTypeRequest;
