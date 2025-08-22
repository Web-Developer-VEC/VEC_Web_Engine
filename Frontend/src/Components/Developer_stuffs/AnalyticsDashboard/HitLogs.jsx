import React, { useEffect, useState } from "react";
import axios from "axios";

const HitLogs = () => {
  const [hitData, setHitData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/main-backend/logs"); 

        const data = response.data;

        if (Array.isArray(data)) {
          setHitData(data);
        } else {
          console.error("Unexpected data format:", data);
          setHitData([]);
        }
      } catch (error) {
        console.error("Error fetching hit log data:", error);
      }
    };

    fetchData();
  }, []);

  const endpointNames = {
    "/favicon.ico": "Favicon",
    "/logo192.png": "React Logo",
    "/placeholder.svg": "Placeholder Image",
    "/Banners/Dept_banner/undefined.webp": "Broken Dept Banner",

    // Main Backend APIs
    "/api/main-backend/landing_page_data": "Landing Page",
    "/api/main-backend/library": "Library",
    "/api/main-backend/academics": "Academics",
    "/api/main-backend/department": "Department",
    "/api/main-backend/placement": "Placement",
    "/api/main-backend/accreditation": "Accreditation",
    "/api/main-backend/iqac": "IQAC",
    "/api/main-backend/incubation": "Incubation",
    "/api/main-backend/ecell": "E-Cell",
    "/api/main-backend/administration": "Administration",
    "/api/main-backend/nss": "NSS",
    "/api/main-backend/iic": "IIC",
    "/api/main-backend/about_us": "About Us",
    "/api/main-backend/contact_us": "Contact Us",
    "/api/main-backend/vision_mission": "Vision & Mission",
    "/api/main-backend/gallery": "Gallery",

    // Sidebar Endpoints
    "/api/main-backend/001/sidebar": "Artificial Intelligence and Data Science",
    "/api/main-backend/002/sidebar": "Automobile Engineering",
    "/api/main-backend/003/sidebar": "Chemistry",
    "/api/main-backend/004/sidebar": "Civil Engineering",
    "/api/main-backend/005/sidebar": "Computer Science & Engineering",
    "/api/main-backend/006/sidebar": "Computer Science and Engineering (CYBER SECURITY)",
    "/api/main-backend/007/sidebar": "Electrical & Electronics Engineering",
    "/api/main-backend/008/sidebar": "Electronics & Instrumentation Engineering",
    "/api/main-backend/009/sidebar": "Electronics and Communication Engineering",
    "/api/main-backend/010/sidebar": "English",
    "/api/main-backend/011/sidebar": "Information Technology",
    "/api/main-backend/012/sidebar": "Mathematics",
    "/api/main-backend/013/sidebar": "Mechanical Engineering",
    "/api/main-backend/014/sidebar": "தமிழ்த்துறை",
    "/api/main-backend/015/sidebar": "Physics",
    "/api/main-backend/016/sidebar": "M.E. Computer Science Engineering",
    "/api/main-backend/017/sidebar": "Master of Business Administration",
    "/api/main-backend/018/sidebar": "M.E. Power Systems Engineering",

    // Other
    "/main.8d42b3187757ff8e8698.hot-update.json": "Hot Update JSON",
  };

  

  // 🔍 Search filter
  const filteredData = hitData.filter(
    (item) =>
      item.endpoint &&
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
          <div
            key={item._id?.$oid || idx}
            className="border p-4 mb-10 rounded shadow bg-gray-50"
          >
             <h2 className="text-lg font-semibold text-blue-700 mb-3">
              <span className="text-gray-800">
                {endpointNames[item.endpoint] || item.endpoint}
              </span>
            </h2>

            {/* Summary Section */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
              <div className="p-2 bg-white border rounded">
                📅 Today: <strong>{item.currentDay ?? 0}</strong>
              </div>
              <div className="p-2 bg-white border rounded">
                🕒 Yesterday: <strong>{item.lastDay ?? 0}</strong>
              </div>
              <div className="p-2 bg-white border rounded">
                📈 Last Week: <strong>{item.lastWeek ?? 0}</strong>
              </div>
              <div className="p-2 bg-white border rounded">
                🗓️ Last Month: <strong>{item.lastMonth ?? 0}</strong>
              </div>
              <div className="p-2 bg-white border rounded">
                📊 Overall Count: <strong>{item.overallCount ?? 0}</strong>
              </div>
            </div>

            {/* Monthly Table */}
            {item.thisYear?.monthly && (
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
                    {Object.entries(item.thisYear.monthly).map(
                      ([month, stats]) => (
                        <tr key={month} className="hover:bg-gray-100">
                          <td className="px-4 py-2 border">{month}</td>
                          <td className="px-4 py-2 border">
                            {stats.overall_month_count ?? 0}
                          </td>
                          <td className="px-4 py-2 border">{stats.week1 ?? 0}</td>
                          <td className="px-4 py-2 border">{stats.week2 ?? 0}</td>
                          <td className="px-4 py-2 border">{stats.week3 ?? 0}</td>
                          <td className="px-4 py-2 border">{stats.week4 ?? 0}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default HitLogs;
