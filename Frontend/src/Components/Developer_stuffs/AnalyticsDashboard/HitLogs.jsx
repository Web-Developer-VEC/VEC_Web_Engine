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
    "/api/main-backend/transport": "Transport",
    "/api/main-backend/admission": "Admission",
    "/api/main-backend/help_desk": "Help Desk",
    "/api/main-backend/hostel_menu": "Hostel Menu",
    "/api/main-backend/sportsdata": "Sports Data",
    "/api/main-backend/web_team": "Web Team",
    "/api/main-backend/ncc_navy": "NCC Navy",
    "/api/main-backend/ncc_army": "NCC Army",
    "/api/main-backend/research": "Research",
    "/api/main-backend/yrc": "Young Researchers Club",
    "/api/main-backend/v_m/sidebar": "Vision & Mission Sidebar",
    "/api/main-backend/get_grievance": "Get Grievance",
    "/api/main-backend/acadamic_cal/sidebar": "Academic Calendar Sidebar",
    "/api/main-backend/01/sidebar": "Sidebar 01",
    "/api/main-backend/iic_applynow": "IIC Apply Now",
    "/api/main-backend/submit_feedback": "Submit Feedback",
    "/api/main-backend/logs": "Logs",
    // Sidebar Endpoints
    "/api/main-backend/001/sidebar": "Artificial Intelligence and Data Science",
    "/api/main-backend/002/sidebar": "Automobile Engineering",
    "/api/main-backend/003/sidebar": "Chemistry",
    "/api/main-backend/004/sidebar": "Civil Engineering",
    "/api/main-backend/005/sidebar": "Computer Science & Engineering",
    "/api/main-backend/006/sidebar": "Computer Science (CYBER SECURITY)",
    "/api/main-backend/007/sidebar": "Electrical & Electronics Engineering",
    "/api/main-backend/008/sidebar": "Electronics & Instrumentation",
    "/api/main-backend/009/sidebar": "Electronics and Communication",
    "/api/main-backend/010/sidebar": "English",
    "/api/main-backend/011/sidebar": "Information Technology",
    "/api/main-backend/012/sidebar": "Mathematics",
    "/api/main-backend/013/sidebar": "Mechanical Engineering",
    "/api/main-backend/014/sidebar": "தமிழ்த்துறை",
    "/api/main-backend/015/sidebar": "Physics",
    "/api/main-backend/016/sidebar": "M.E. Computer Science Engineering",
    "/api/main-backend/017/sidebar": "Master of Business Administration",
    "/api/main-backend/018/sidebar": "M.E. Power Systems Engineering",
    "/api/main-backend/exam": "Exam",
    "/api/main-backend/other_facilities": "Other Facilities",
    "/api/main-backend/auth/staff/login": "Staff Login",
    // Other
    "/main.8d42b3187757ff8e8698.hot-update.json": "Hot Update JSON",
  };

  const filteredData = hitData.filter(
    (item) =>
      item.endpoint &&
      item.endpoint.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getWeekValue = (monthName, weekNum, value) => {
    const now = new Date();
    const currentMonthIndex = now.getMonth();
    const currentWeekNumber = Math.ceil(now.getDate() / 7);

    const rowMonthIndex = new Date(`${monthName} 1, 2000`).getMonth();

    if (rowMonthIndex > currentMonthIndex) return "-";
    if (rowMonthIndex === currentMonthIndex && weekNum > currentWeekNumber) return "-";

    return value ?? 0;
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 md:px-10 pt-10 md:pt-16 pb-12 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2 md:gap-3">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-[#801828] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              <span>API Hit Logs</span>
            </h1>
            <p className="text-sm md:text-base text-slate-500 mt-1">Monitor your endpoint traffic and usage statistics</p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-96 md:shrink-0 group/search">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400 transition-colors group-focus-within/search:text-[#801828]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search endpoints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 md:py-2 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#801828] focus:border-[#801828] text-sm transition-all"
            />
          </div>
        </div>

        {/* Data Cards */}
        {filteredData.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-lg">No matching endpoints found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredData.map((item, idx) => (
              <div
                key={item._id?.$oid || idx}
                className="group bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-[#801828]/30 hover:-translate-y-0.5"
              >
                {/* Card Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors group-hover:bg-[#801828]/[0.04]">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-400 shrink-0 transition-all duration-200 group-hover:text-[#801828] group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                    <span className="transition-colors group-hover:text-[#801828]">{endpointNames[item.endpoint] || item.endpoint}</span>
                  </h2>
                </div>

                {/* Summary Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-6 py-4 border-b border-slate-100">
                  <StatCard
                    label="Today"
                    value={item.currentDay}
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>}
                  />
                  <StatCard
                    label="Yesterday"
                    value={item.lastDay}
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                  />
                  <StatCard
                    label="Last Week"
                    value={item.lastWeek}
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>}
                  />
                  <StatCard
                    label="Last Month"
                    value={item.lastMonth}
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>}
                  />
                  <StatCard
                    label="Overall"
                    value={item.overallCount}
                    isHighlight
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>}
                  />
                </div>

                {/* Monthly Table */}
                {item.thisYear?.monthly && (
                  <div className="px-6 pt-4 pb-5 overflow-x-auto">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      Monthly Breakdown
                    </h3>
                    <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Month</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Week 1</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Week 2</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Week 3</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Week 4</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                        {Object.entries(item.thisYear.monthly).map(([month, stats]) => (
                          <tr key={month} className="hover:bg-[#801828]/[0.04] transition-colors">
                            <td className="px-4 py-2 text-sm font-medium text-slate-800 whitespace-nowrap">{month}</td>
                            <td className="px-4 py-2 text-sm text-[#801828] font-bold">{stats.overall_month_count ?? 0}</td>
                            <td className="px-4 py-2 text-sm text-slate-600">{getWeekValue(month, 1, stats.week1)}</td>
                            <td className="px-4 py-2 text-sm text-slate-600">{getWeekValue(month, 2, stats.week2)}</td>
                            <td className="px-4 py-2 text-sm text-slate-600">{getWeekValue(month, 3, stats.week3)}</td>
                            <td className="px-4 py-2 text-sm text-slate-600">{getWeekValue(month, 4, stats.week4)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, isHighlight = false }) => (
  <div className="group/stat flex flex-col rounded-lg px-2 py-1.5 -mx-2 -my-1.5 transition-all duration-150 hover:bg-slate-50 hover:-translate-y-0.5 cursor-default">
    <span className="flex items-center gap-1.5 text-xs text-slate-500 uppercase tracking-wider font-medium mb-1 transition-colors group-hover/stat:text-[#801828]">
      <span className="transition-transform duration-150 group-hover/stat:scale-110">{icon}</span> {label}
    </span>
    <span className={`text-2xl font-bold transition-colors ${isHighlight ? 'text-[#801828]' : 'text-slate-800 group-hover/stat:text-[#801828]'}`}>
      {value ?? 0}
    </span>
  </div>
);

export default HitLogs;