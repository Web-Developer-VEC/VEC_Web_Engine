import { useState } from "react"

export default function PastRequestsPage({ onBack, onRequestClick }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("All Departments")
  const [statusFilter, setStatusFilter] = useState("All Status")

  const pastRequestsData = [
    {
      id: 1,
      title: "Zonal Result Update",
      requester: "Ms. Jayanthi.K",
      department: "Sports",
      status: "Accepted",
      timestamp: "2025-07-10 14:00",
    },
    {
      id: 2,
      title: "Faculty Profile Change",
      requester: "Prof. Renu Patel",
      department: "Faculty",
      status: "Rejected",
      timestamp: "2025-07-09 11:15",
    },
    {
      id: 3,
      title: "Sports - Football Winner",
      requester: "John Smith",
      department: "Sports",
      status: "Accepted",
      timestamp: "2025-07-08 09:30",
    },
  ]

  const filteredRequests = pastRequestsData.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requester.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = departmentFilter === "All Departments" || request.department === departmentFilter
    const matchesStatus = statusFilter === "All Status" || request.status === statusFilter
    return matchesSearch && matchesDepartment && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold text-gray-900">Past Requests</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>All Departments</option>
                <option>Sports</option>
                <option>Faculty</option>
                <option>Administration</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>All Status</option>
                <option>Accepted</option>
                <option>Rejected</option>
                <option>Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request, index) => (
                <tr
                  key={request.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onRequestClick(request.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.requester}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        request.status === "Accepted" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}