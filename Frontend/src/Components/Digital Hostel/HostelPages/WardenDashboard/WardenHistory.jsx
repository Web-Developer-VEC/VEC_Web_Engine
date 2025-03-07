import React, { useState, useEffect } from 'react';
import { Search, X, FileText, Filter } from 'lucide-react';
import './WardenRequest.css';
import HostelSidebar from '../HostelSidebar';
import { useNavigate } from 'react-router-dom';

function WardenHistory() {
  const [records, setRecords] = useState([]);
  const [wardenYears, setWardenYears] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [passTypes, setPassTypes] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isMedical, setIsMedical] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filters, setFilters] = useState({ year: '', department: '', passType: '', search: '', date: '', status: '' });
  console.log(selectedDate);
  

  const navigate = useNavigate();

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

  // Mapping Pass Types to Labels
  const passTypeLabels = {
    "od": "OD",
    "outpass": "Out Pass",
    "staypass": "Stay Pass",
    "leave": "Leave"
  };

  const yearToAlphabet = {
    '1': 'First', 
    '2': 'Second ',
    '3': 'Third ',
    '4': 'Fourth ',
    'overall': 'Overall' 
  };

  useEffect(() => {
    fetchWardenDetails();
  }, []);

  const fetchWardenDetails = async () => {
    try {
      const response = await fetch('/api/sidebar_warden');
      const data = await response.json();
      if (data["primary year"] && Array.isArray(data["primary year"])) {
        setWardenYears([...data["primary year"]]);
      }
    } catch (error) {
      console.error("Error fetching warden details:", error);
    }
  };


  useEffect(()=>{
    const fetchPendingPasses = async (selectedDate) => {
      setLoading(true);
      try {
        const response = await fetch('/api/fetch_old_passes_for_warden', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ date: selectedDate }) 
        });
    
        const data = await response.json();
    
        if (data.data) {
          setRecords(data.data);
          setDepartments([...new Set(data.data.map(pass => pass.dept))]);
          setPassTypes([...new Set(data.data.map(pass => pass.passtype))]);
        } else {
          setRecords([]); // If no passes, set empty array
        }
      } catch (error) {
        console.error("Error fetching passes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingPasses(selectedDate);

  },[selectedDate])
  
  const filteredRecords = records.filter(record => {
    const searchQuery = filters.search.toLowerCase();
    const recordDate = new Date(record.from).toISOString().split('T')[0];
    
    return (
      (!filters.year || record.year.toString() === filters.year) &&
      (!filters.department || record.dept === filters.department) &&
      (!filters.passType || record.passtype === filters.passType) &&
      (!filters.search ||
        record.name.toLowerCase().includes(searchQuery) ||
        record.room_no.toLowerCase().includes(searchQuery) ||
        record.place_to_visit.toLowerCase().includes(searchQuery)
      ) &&
      // (!filters.date || recordDate === filters.date) &&
      (!filters.status || (
        (filters.status === "accepted" && record.wardern_approval === true) ||
        (filters.status === "declined" && record.wardern_approval === false)
      ))
    );
  });

  console.log(filteredRecords);
  
  

  return (
    <div className="AR-app">
      <HostelSidebar role="warden" />
      <div className="AR-main">
        <h1 className="AR-page-title"> Previous Requests of {wardenYears.map((year) => `${yearToAlphabet[year]} `)} year</h1>

        <div className="AR-filter-bar">
          <div className="AR-search-container">
            <Search className="AR-search-icon" />
            <input
              type="text"
              placeholder="Search by Name, Room No, or Place..."
              className="AR-search-input"
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <div className="AR-filters">
            {/* Year Filter (Dynamically Generated) */}
            <select className="AR-filter-select" onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}>
              <option value="">All Years</option>
              {wardenYears.map(year => (
                <option key={year} value={year}>
                  {year === 1 ? "First Year" :
                   year === 2 ? "Second Year" :
                   year === 3 ? "Third Year" :
                   year === 4 ? "Fourth Year" : year `${year}`}
                </option>
              ))}
            </select>

             {/* Department Filter */}
            <select className="AR-filter-select" onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}>
              <option value="">All Departments</option>
              {departments.length > 0 ? (
                departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {departmentLabels[dept] || dept}
                  </option>
                ))
              ) : (
                <option disabled>No departments available</option>
              )}
            </select>

            {/* Pass Type Filter (Dynamically Generated) */}
            <select className="AR-filter-select" onChange={(e) => setFilters(prev => ({ ...prev, passType: e.target.value }))}>
              <option value="">All Types</option>
              {passTypes.length > 0 ? (
                passTypes.map((type) => (
                  <option key={type} value={type}>
                    {passTypeLabels[type] || type}
                  </option>
                ))
              ) : (
                <option disabled>No pass types available</option>
              )}
            </select>

            <input
              type="date"
              className="AR-filter-select"
              value={selectedDate}  // Bind the value to state
              onChange={(e) => {
                const newDate = e.target.value;
                setSelectedDate(newDate);  
                setFilters(prev => ({ ...prev, date: newDate })); 
                // fetchPendingPasses(newDate); 
              }}
            />

            <select className="AR-filter-select" onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}>
                <option value="">All Statuses</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p>No passes for selected Date</p>
        ) : (
          <table className="AR-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Year</th>
                <th>Room</th>
                <th>Req data</th>
                <th>Pass Type</th>
                <th>from Date</th>
                <th>Warden Approval</th>
                <th>Parent Approval</th>
              </tr>
            </thead>
            <tbody>
  {filteredRecords?.map((record) => {
    const getStatusClass = (status) => {
      if (status === null) return "AR-status-orange"; // Pending (Orange)
      return status ? "AR-status-green" : "AR-status-red"; // Accepted (Green) | Declined (Red)
    };    

    return (
      <tr key={record.pass_id} onClick={() => setSelectedRecord(record)}>
        <td>{record.name}</td>
        <td>{["I", "II", "III", "IV"][record.year - 1] || record.year}</td>
        <td>{record.room_no}</td>
        <td>{new Date(record.request_time).toLocaleDateString('en-GB').replace(/\//g, ' - ')}</td>
        <td>{passTypeLabels[record.passtype] || record.passtype}</td>
        <td>{new Date(record.from).toLocaleDateString('en-GB').replace(/\//g, ' - ')}</td>
          <td>
            {record.wardern_approval !== null ? (
              <span className={`AR-status-circle ${getStatusClass(record.wardern_approval)}`}>
                {record.wardern_approval ? "Accepted (W)" : "Declined (W)"}
              </span>
            ) : (
              <span className={`AR-status-circle ${getStatusClass(record.superior_wardern_approval)}`}>
                {record.superior_wardern_approval ? "Accepted (SW)" : "Declined (SW)"}
              </span>
            )}
          </td>
          <td>
            <span className={`AR-status-circle ${getStatusClass(record.parent_approval)}`}>
              {record.parent_approval === null ? "Pending" : record.parent_approval ? "Accepted" : "Declined"}
            </span>
          </td>
      </tr>
    );
    })}
    </tbody>

          </table>
        )}

        {selectedRecord && (
          <DetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
        )}
      </div>
    </div>
  );
}

// Detail Modal Component
const PairedInfo = ({ left, right }) => (
  <div className="AR-paired-info">
    <div className="AR-info-container">
      <span className="AR-label">{left.label}</span>
      <p className="AR-value">{left.value}</p>
    </div>
    <div className="AR-info-container">
      <span className="AR-label">{right.label}</span>
      <p className="AR-value">{right.value}</p>
    </div>
  </div>
);

function DetailModal({ record, onClose }) {
  const [showDocument, setShowDocument] = useState(false);

  // Convert "from" and "to" timestamps into date & time formats
  const fromDateTime = new Date(record.from);
  const toDateTime = new Date(record.to);

  const formattedFromDate = fromDateTime.toLocaleDateString('en-GB').replace(/\//g, ' - '); // Format: DD - MM - YYYY
  const formattedFromTime = fromDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }); // Format: HH:MM AM/PM

  const formattedToDate = toDateTime.toLocaleDateString('en-GB').replace(/\//g, ' - '); // Format: DD - MM - YYYY
  const formattedToTime = toDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }); // Format: HH:MM AM/PM

  let formattedInDate = "Not yet returned";
  let formattedINTime = "";
  
  if (record.re_entry_time) {
    const indateTime = new Date(record.re_entry_time);
    formattedInDate = indateTime.toLocaleDateString('en-GB'); // Format: DD/MM/YYYY
    formattedINTime = indateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
  
  const handleDocumentButtonClick = (e) => {
    e.stopPropagation(); // Prevent click from propagating to overlay
    setShowDocument(true);
  };

  const handleModalClick = (e) => {
    e.stopPropagation(); // Prevent click from propagating to overlay
  };

  const handleOverlayClick = () => {
    setShowDocument(false); // Close document modal if overlay is clicked.
    onClose(); // Close main modal if the overlay is clicked.
  };

  const passTypeLabels = {
    "od": "OD",
    "outpass": "Out Pass",
    "staypass": "Stay Pass",
    "leave": "Leave"
  };
  
  const reasonTypeLabels = {
    "intern": "Intern",
    "semester": "Semester",
    "festival": "Festival",
    "medical": "Medical",
    "others": "Other"
  };
  
  return(
      <div className="AR-modal-overlay" onClick={handleOverlayClick}> {/* Overlay click handler for main modal */}
            <div className="AR-modal-container" onClick={handleModalClick}> {/* Modal click handler */}
            <div className="AR-modal-content">
              <div className="AR-modal-header">
                <h2 className="AR-title">Request Details</h2>
                <button onClick={onClose} className="AR-close-button">
                  <X className="AR-icon" />
                </button>
              </div>
    
              <div className="AR-modal-body">
                <PairedInfo
                  left={{ label: "Name", value: record.name }}
                  right={{ label: "Department", value: record.dept }}
                />
                
                <PairedInfo
                  left={{ label: "Year", value: record.year }}
                  right={{ label: "Room", value: record.room_no }}
                />
                
                <PairedInfo
                  left={{ 
                    label: "Pass Type", 
                    value: (
                      <span className="AR-badge AR-badge-primary">
                        {passTypeLabels[record.passtype] || record.passtype}
                      </span>
                    )
                  }}

                  right={{ 
                    label: "Returned Detail", 
                    value: `${formattedInDate} - ${formattedINTime}` 
                  }}
                />
    
                <PairedInfo 
                  left={{ label: "From Date", value: formattedFromDate }} 
                  right={{ label: "From Time", value: formattedFromTime }} 
                />
                <PairedInfo 
                  left={{ label: "To Date", value: formattedToDate }} 
                  right={{ label: "To Time", value: formattedToTime }} 
                />
    
                <PairedInfo
                  left={{ label: "Place to Visit", value: record.place_to_visit }}
                  right={{
                    label: "Reason Category",
                    value: (
                      <span className="AR-badge AR-badge-secondary">
                        {reasonTypeLabels[record.reason_type] || record.reason_type}
                      </span>
                    )
                  }}
                />

                {record.reason_type === 'others' && (
                  <div className="AR-additional-info">
                    <span className="AR-label">Additional Details</span>
                    <p className="AR-value">{record.reason_for_visit || ''}</p>
                  </div>
                )}

                {record.comment !== null &&  (
                  <div className="AR-warden-note">
                    <span className="AR-label-warden">Warden notes</span>
                    <p>{record.comment}</p>
                  </div>
                )}
              </div>
    
              {(record.passtype === 'od' || record.passtype === 'leave') && record.file_path && (
                <button
                  onClick={handleDocumentButtonClick}  // Use the new handler
                  className="AR-document-button"
                >
                  <FileText className="AR-icon" />
                  <span>View Document</span>
                </button>
              )}
            </div>
          </div>
    
          {showDocument && (
            <div className="AR-document-modal" onClick={handleOverlayClick}> {/* Overlay click handler */}
              <div className="AR-document-container" onClick={handleModalClick}> {/* Modal click handler */}
                {/* ... document content */}
                <div className="AR-document-header">
                  <h3 className="AR-document-title">Document Preview</h3>
                  <button onClick={() => setShowDocument(false)} className="AR-close-button">
                    <X className="AR-icon" />
                  </button>
                </div>
                <div className="AR-document-content">
                  <iframe
                    src={record.documentUrl}
                    className="AR-document-frame"
                    title="Document Preview"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
  );
}

export default WardenHistory;
