import axios from "axios";
import { useEffect, useState } from "react";
import Banner from "../../../Banner";

const ScheduledExam = ({ toggle, theme }) => {
  const [filters, setFilters] = useState({
    department: "",
    year: "",
    time: "",
  });
  const [examData, setExamData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responce = await axios.get("/api/main-backend/exam_code_view");

        setExamData(responce.data.exams);
        
      } catch (error) {
        console.error("Error fetching QA Exam schedules", error);
      }
    }

    fetchData();
  }, [])

  const filteredExams = examData?.filter((exam) => {
    const timeSlot =
      exam.start < "12:00" ? "Morning" : "Afternoon";

    return (
      (!filters.department || exam.department === filters.department) &&
      (!filters.year || exam.year === filters.year) &&
      (!filters.time || filters.time === timeSlot)
    );
  });

  const handleCancel = () => {

  }

  const statusStyles = {
    active: "bg-green-100 text-green-700",
    scheduled: "bg-green-200 text-green-700",
    Completed: "bg-indigo-100 text-indigo-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  const session = JSON.parse(sessionStorage.getItem("userSession"));

  return (
    <>
    <Banner
      toggle={toggle}
      theme={theme}
      backgroundImage="./Banners/examsbanner.webp"
      headerText="office of controller of examinations"
      subHeaderText="COE"
    />
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-brwn mb-6">
          Today's Exam Schedule
        </h1>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Select
            label="Department"
            options={["CSE", "ECE", "MECH"]}
            value={filters.department}
            onChange={(v) => setFilters({ ...filters, department: v })}
          />

          <Select
            label="Year"
            options={["1st Year", "2nd Year", "3rd Year", "4th Year"]}
            value={filters.year}
            onChange={(v) => setFilters({ ...filters, year: v })}
          />

          <Select
            label="Time"
            options={["Morning", "Afternoon"]}
            value={filters.time}
            onChange={(v) => setFilters({ ...filters, time: v })}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gry border-b">
              <tr>
                <TableHead>Department</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>CIE</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Exam Code</TableHead>
                <TableHead>Status</TableHead>
                {session.role === "admin" && (
                    <TableHead>Action</TableHead>
                )}
              </tr>
            </thead>

            <tbody>
              {filteredExams.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-gray-500">
                    No exams found
                  </td>
                </tr>
              )}

              {filteredExams.map((exam) => (
                <tr
                  key={exam.scheduleId}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <TableCell>{exam.department}</TableCell>
                  <TableCell>{exam.year}</TableCell>
                  <TableCell>{exam.cie}</TableCell>
                  <TableCell>{exam.subject}</TableCell>
                  <TableCell>{exam.subjectCode}</TableCell>
                  <TableCell>
                    {exam.start} - {exam.end}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {!exam.examCode ? (
                      "Will be scheduled"
                    ) : (
                      <p className="m-0 p-0">{exam.examCode}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[exam.status]}`}
                    >
                      {exam.status}
                    </span>
                  </TableCell>
                  {session.role === "admin" && (
                    <TableCell>
                        <button className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
                            Cancel
                        </button>
                    </TableCell>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-gray-500 mt-4 text-right">
          Showing {filteredExams.length} exams
        </p>
      </div>
    </div>
    </>
  );
}

/* Reusable Components */

function Select({ label, options, value, onChange }) {
  return (
    <select
      className="w-full p-2.5 border rounded-md bg-prim text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{`All ${label}`}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function TableHead({ children }) {
  return (
    <th className="px-4 py-3 font-semibold text-text">
      {children}
    </th>
  );
}

function TableCell({ children, className = "" }) {
  return (
    <td className={`px-4 py-3 text-gray-700 ${className}`}>
      {children}
    </td>
  );
}

export default ScheduledExam;