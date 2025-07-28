import React, { useEffect, useState } from "react";
import data from "./hit_logs.json";

const HitLogs = () => {
  const [hitData, setHitData] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 For search

  useEffect(() => {
    setHitData(data);
  }, []);

  const toggleExpand = (index) => {
    setExpanded((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // 🔍 Filtered data based on search
  const filteredData = hitData.filter((item) =>
    item.endpoint.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-white text-gray-800">
      <h1 className="text-2xl font-bold mb-6">📊 API Hit Logs Dashboard</h1>

      {/* 🔍 Search Box */}
      <input
        type="text"
        placeholder="Search endpoint..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-6 p-3 pl-10 pr-4 border border-gray-300 rounded-lg w-full max-w-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 bg-white text-gray-800 placeholder-gray-500"

      />

      {filteredData.length === 0 ? (
        <p className="text-gray-600 italic">No matching endpoints found.</p>
      ) : (
        filteredData.map((item, idx) => (
          <div key={idx} className="border p-4 mb-10 rounded shadow bg-gray-50">
            <h2 className="text-lg font-semibold text-blue-700 mb-3">
              Endpoint: <span className="text-gray-800">{item.endpoint}</span>
            </h2>

            {/* Summary Section */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
              <div className="p-2 bg-white border rounded">
                📅 Today: <strong>{item.currentDay}</strong>
              </div>
              <div className="p-2 bg-white border rounded">
                🕒 Yesterday: <strong>{item.lastDay}</strong>
              </div>
              <div className="p-2 bg-white border rounded">
                📈 Last Week: <strong>{item.lastWeek}</strong>
              </div>
              <div className="p-2 bg-white border rounded">
                🗓️ Last Month: <strong>{item.lastMonth}</strong>
              </div>
              <div className="p-2 bg-white border rounded">
                📊 Overall Count: <strong>{item.overallCount}</strong>
              </div>
            </div>

            {/* Monthly Table */}
            <div className="overflow-x-auto mt-6">
              <table className="table-auto w-full text-left text-sm border">
                <thead className="bg-blue-100 text-gray-800">
                  <tr>
                    <th className="px-4 py-2 border">📅 Month</th>
                    <th className="px-4 py-2 border">📊 Total Hits</th>
                    <th className="px-4 py-2 border">Week 1</th>
                    <th className="px-4 py-2 border">Week 2</th>
                    <th className="px-4 py-2 border">Week 3</th>
                    <th className="px-4 py-2 border">Week 4</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(item.thisYear.monthly).map(([month, stats]) => (
                    <tr key={month} className="hover:bg-gray-100">
                      <td className="px-4 py-2 border">{month}</td>
                      <td className="px-4 py-2 border">{stats.overall_month_count}</td>
                      <td className="px-4 py-2 border">{stats.week1}</td>
                      <td className="px-4 py-2 border">{stats.week2}</td>
                      <td className="px-4 py-2 border">{stats.week3}</td>
                      <td className="px-4 py-2 border">{stats.week4}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default HitLogs;
