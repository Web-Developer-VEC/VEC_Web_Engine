import React, { useState, useEffect, useMemo } from "react";
import "./WardenLogs.css";

const WardenLogs = () => {
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("current-month");
  const [deactivatedDateFilter, setDeactivatedDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch("/api/fetch_logs");
        const data = await response.json();
        setLogs(data.logs);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch logs");
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getMonthYear = (dateString) => {
    const date = new Date(dateString);
    return `${monthNames[date.getMonth()]}-${date.getFullYear()}`;
  };

  const currentMonthYear = getMonthYear(new Date());

  // **Group logs by (Warden Name + Deactivation Date)**
  const groupedData = useMemo(() => {
    const grouped = {};

    logs.forEach((log) => {
      const monthYear = getMonthYear(log.deactivated_date);
      const actionKey = `${log.inactive_warden_name}-${log.deactivated_date}`;

      if (!grouped[monthYear]) grouped[monthYear] = [];
      
      let existingEntry = grouped[monthYear].find((entry) => entry.actionKey === actionKey);

      if (!existingEntry) {
        existingEntry = {
          actionKey,
          wardenName: log.inactive_warden_name,
          deactivatedDate: log.deactivated_date,
          activatedDate: log.activated_date,
          reassignedTo: [],
        };
        grouped[monthYear].push(existingEntry);
      }

      // Add reassignment details to the existing entry
      existingEntry.reassignedTo.push({
        name: log.new_warden_name,
        years: log.transferred_year,
      });
    });

    return grouped;
  }, [logs]);

  // **Apply Search & Filter**
  const filteredData = useMemo(() => {
    const searchText = searchQuery.toLowerCase();
    const dateFilter = deactivatedDateFilter ? new Date(deactivatedDateFilter).toISOString().split("T")[0] : "";

    return Object.keys(groupedData).reduce((acc, monthYear) => {
      if (selectedFilter === "current-month" && monthYear !== currentMonthYear) return acc;

      const monthData = Object.values(groupedData[monthYear]).filter((entry) => {
        const entryDeactivatedDate = new Date(entry.deactivatedDate).toISOString().split("T")[0];

        return (
          (entry.wardenName.toLowerCase().includes(searchText) || 
          // entry.reassignedTo.some((w) => w.name.toLowerCase().includes(searchText)) || 
          entry.reassignedTo.some((w) => w.years.toString().includes(searchText))) &&
          (dateFilter === "" || entryDeactivatedDate === dateFilter) 
        );
      });

      if (monthData.length > 0) {
        acc[monthYear] = monthData;
      }

      return acc;
    }, {});
  }, [searchQuery, deactivatedDateFilter, selectedFilter, groupedData, currentMonthYear]);

  if (loading) return <p>Loading logs...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="HOS-W-warden-logs-container">
      <h1 className="HOS-W-warden-logs-title">WARDEN LOGS</h1>
      
      {/* Search & Filter */}
      <div className="HOS-W-warden-logs-controls">
        <input
          type="text"
          placeholder="Search by Deactivated Warden name"
          className="HOS-W-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <input
          type="date"
          className="HOS-W-date-filter"
          value={deactivatedDateFilter}
          onChange={(e) => setDeactivatedDateFilter(e.target.value)}
        />

        <select
          className="HOS-W-filter-selector"
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
        >
          <option value="current-month">Current Month</option>
          <option value="overall">Overall History</option>
        </select>
      </div>

      {/* Display Logs */}
      {Object.keys(filteredData).length === 0 ? (
        <p>No logs found for this filter/search.</p>
      ) : (
        Object.keys(filteredData).map((monthYear) => (
          <div key={monthYear} className="HOS-W-month-section">
            <h2 className="HOS-W-month-header">{monthYear}</h2>

            {filteredData[monthYear].map((entry) => (
              <div key={entry.actionKey} className="HOS-W-warden-entry">
                <p className="HOS-W-warden-status-text">
                  <strong>{entry.wardenName}</strong> was <strong>DEACTIVATED</strong> on <strong>{new Date(entry.deactivatedDate).toLocaleString()}</strong>
                </p>

                {/* Show the transferred details with arrows */}
                {entry.reassignedTo.length > 0 && (
                  <p className="HOS-W-warden-status-text">
                    Responsibilities transferred: <br />
                    {entry.reassignedTo.map((warden, idx) => (
                      <span key={idx} className="HOS-W-transfer-text">
                        <strong>{warden.years} year{warden.years > 1 ? "s" : ""}</strong> → <strong>{warden.name}</strong> 
                        <br />
                      </span>
                    ))}
                  </p>
                )}

                <p className="HOS-W-warden-status-text">
                  Activated again on <strong>{new Date(entry.activatedDate).toLocaleString()}</strong>
                </p>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default WardenLogs;