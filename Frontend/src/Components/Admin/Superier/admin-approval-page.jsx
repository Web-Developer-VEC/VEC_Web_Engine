import { useState } from "react"
import { ChevronDown, ChevronUp, Check, X, Plus, Edit, Trash2, Calendar, User, Trophy } from "lucide-react"
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function AdminApprovalPage() {
  const [expandedSections, setExpandedSections] = useState({
    add: false,
    edit: false,
    delete: false,
  })

  const [itemApprovals, setItemApprovals] = useState({});
  const [requests, setrequests] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.request) {
      console.log((location.state.request));
      setrequests(location.state.request);
      
    }
  }, [location.state])

  // Sample requests data - any one of these will be passed to the component
  const requests1 = [
    {
      id: 1,
      title: "Sports: Tournament Update",
      section: "sports",
      actions: ["add", "edit", "delete"],
      data: {
        add: [
          {
            title: "Inter College Football Winner",
            date: "2025-07-10",
            winner: "XYZ College",
          },
        ],
        edit: [
          {
            field: "winner",
            from: "ABC College",
            to: "XYZ College",
          },
          {
            field: "date",
            from: "2025-06-10",
            to: "2025-07-10",
          },
        ],
        delete: [
          {
            title: "Old Tournament Result",
            date: "2024-11-15",
            winner: "DEF College",
          },
        ],
      },
      reason: "Update required for recent sports achievement",
      requester: "John Smith",
      created_at: "2025-07-12T10:22:00Z",
    },
    {
      id: 101,
      title: "Zonal Results Update",
      section: "sports",
      reason: "Update required for recent sports achievement",
      requester: "Ms. Jayanthi.K",
      created_at: "2025-07-12T10:22:00Z",
      actions: ["add", "edit", "delete"],
      data: {
        add: [
          { game: "Cricket(M)", position: "Winner" },
          { game: "Throwball(W)", position: "Third" },
        ],
        edit: [
          {
            game: "Kho-Kho(M)",
            field: "position",
            from: "Runner",
            to: "Winner",
          },
        ],
        delete: [{ game: "Volleyball(M)", position: "Third" }],
      },
    },
    {
      id: 2,
      title: "Faculty Profile Change",
      section: "faculty",
      actions: ["edit", "add"],
      data: {
        add: [
          { name: "Dr. Ajith G", qualification: "B.Tech AI", designation: "Head of the dept" },
          { name: "Dr. Ajay G", qualification: "B.Tech AI", designation: "Ass prof of the dept" },
        ],
        edit: [
          {
            name: "Dr. P Visu",
            field: "Designation",
            from: "Head of the dept",
            to: "Non teaching staff",
          },
        ],
      },
      reason: "Profile update due to promotion",
      requester: "Prof. Renu Patel",
      created_at: "2025-07-12T11:30:00Z",
    },
  ]

  // For demo, using the first request. In real app, this would be passed as props
  const requestData = requests1[2]

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleItemApproval = (section, index, approved) => {
    const key = `${section}-${index}`
    setItemApprovals((prev) => ({
      ...prev,
      [key]: approved,
    }))
  }

  const handleBulkAction = (action) => {
    const newApprovals = {}
    ;["add", "edit", "delete"].forEach((section) => {
      if (requestData.data[section]) {
        requestData.data[section].forEach((_, index) => {
          const key = `${section}-${index}`
          newApprovals[key] = action === "accept"
        })
      }
    })
    setItemApprovals(newApprovals)
  }

  const getApprovalStatus = (section, index) => {
    const key = `${section}-${index}`
    return itemApprovals[key]
  }

  const getSectionIcon = (section) => {
    switch (section) {
      case "add":
        return <Plus className="w-4 h-4 text-green-600" />
      case "edit":
        return <Edit className="w-4 h-4 text-orange-600" />
      case "delete":
        return <Trash2 className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const getSectionColor = (section) => {
    switch (section) {
      case "add":
        return "border-l-green-500 bg-green-50"
      case "edit":
        return "border-l-orange-500 bg-orange-50"
      case "delete":
        return "border-l-red-500 bg-red-50"
      default:
        return "border-l-gray-500 bg-gray-50"
    }
  }

  const getFieldIcon = (fieldName) => {
    const field = fieldName?.toLowerCase()
    if (field?.includes("date")) return <Calendar className="w-3 h-3 text-gray-500" />
    if (field?.includes("name") || field?.includes("requester")) return <User className="w-3 h-3 text-gray-500" />
    if (field?.includes("winner") || field?.includes("position")) return <Trophy className="w-3 h-3 text-gray-500" />
    return null
  }

  const formatFieldName = (fieldName) => {
    return fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, " $1")
  }

  const renderDataFields = (item, excludeFields = []) => {
    return Object.entries(item)
      .filter(([key]) => !excludeFields.includes(key))
      .map(([key, value]) => (
        <div key={key} className="flex items-center gap-2 text-sm">
          {getFieldIcon(key)}
          <span className="text-gray-600 font-medium">{formatFieldName(key)}:</span>
          <span className="text-gray-900">{value}</span>
        </div>
      ))
  }

  const renderAddItems = () => (
    <div className="space-y-3">
      {requests?.data?.insert?.map((item, index) => (
        <div key={index} className="bg-white p-4 rounded-lg border border-green-200">
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-2">{renderDataFields(item)}</div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => handleItemApproval("add", index, true)}
                className={`p-2 rounded-full transition-colors ${
                  getApprovalStatus("add", index) === true
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600"
                }`}
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleItemApproval("add", index, false)}
                className={`p-2 rounded-full transition-colors ${
                  getApprovalStatus("add", index) === false
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600"
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderEditItems = () => (
    <div className="space-y-3">
      {requests?.data?.update?.map((item, index) => (
        <div key={index} className="bg-white p-4 rounded-lg border border-orange-200">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {/* Show context info if available (like name, game, title) */}
              {Object.entries(item)
                .filter(([key]) => !["field", "from", "to"].includes(key))
                .map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 text-sm mb-2">
                    {getFieldIcon(key)}
                    <span className="text-gray-600 font-medium">{formatFieldName(key)}:</span>
                    <span className="text-gray-900 font-medium">{value}</span>
                  </div>
                ))}

              {/* Show the actual change */}
              <div className="text-sm">
                <div className="flex items-center gap-2 mb-1">
                  {getFieldIcon(item.field)}
                  <span className="text-gray-600 font-medium">{formatFieldName(item.field)}:</span>
                </div>
                <div className="ml-5">
                  <span className="text-red-600 line-through bg-red-50 px-2 py-1 rounded">{item.from}</span>
                  <span className="text-gray-400 mx-2">→</span>
                  <span className="text-green-600 font-medium bg-green-50 px-2 py-1 rounded">{item.to}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => handleItemApproval("edit", index, true)}
                className={`p-2 rounded-full transition-colors ${
                  getApprovalStatus("edit", index) === true
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600"
                }`}
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleItemApproval("edit", index, false)}
                className={`p-2 rounded-full transition-colors ${
                  getApprovalStatus("edit", index) === false
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600"
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderDeleteItems = () => (
    <div className="space-y-3">
      {requestData.data.delete.map((item, index) => (
        <div key={index} className="bg-white p-4 rounded-lg border border-red-200">
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-2">{renderDataFields(item)}</div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => handleItemApproval("delete", index, true)}
                className={`p-2 rounded-full transition-colors ${
                  getApprovalStatus("delete", index) === true
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600"
                }`}
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleItemApproval("delete", index, false)}
                className={`p-2 rounded-full transition-colors ${
                  getApprovalStatus("delete", index) === false
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600"
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const formatDate = (dateString) => {
    if (!dateString) return ""
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">{requests?.collection}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="text-center md:text-left">
              <span className="text-gray-600 font-medium">Requested by: </span>
              <span className="text-gray-900">{requestData.requester}</span>
            </div>
            {requestData.reason && (
              <div className="text-center md:text-right">
                <span className="text-gray-600 font-medium">Reason: </span>
                <span className="text-gray-900">{requestData.reason}</span>
              </div>
            )}
            {requests?.createdAt && (
              <div className="text-center md:text-left text-gray-500">
                <span className="font-medium">Created: </span>
                {formatDate(requests?.createdAt)}
              </div>
            )}
            {requests?.collection_type && (
              <div className="text-center md:text-right">
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium uppercase">
                  {requests?.collection_type}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Sections */}
        <div className="space-y-4">
          {/* Additions Section */}
          {requests?.data?.insert && requests?.data?.insert?.length > 0 && (
            <div className={`bg-white rounded-lg shadow-sm border-l-4 ${getSectionColor("add")}`}>
              <button
                onClick={() => toggleSection("add")}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getSectionIcon("add")}
                  <span className="font-medium text-gray-900">Additions ({requests?.data?.insert?.length})</span>
                </div>
                {expandedSections.add ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedSections.add && <div className="px-4 pb-4">{renderAddItems()}</div>}
            </div>
          )}

          {/* Modifications Section */}
          {requests.data.update && requests.data.update.length > 0 && (
            <div className={`bg-white rounded-lg shadow-sm border-l-4 ${getSectionColor("edit")}`}>
              <button
                onClick={() => toggleSection("edit")}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getSectionIcon("edit")}
                  <span className="font-medium text-gray-900">Modifications ({requestData.data.edit.length})</span>
                </div>
                {expandedSections.edit ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedSections.edit && <div className="px-4 pb-4">{renderEditItems()}</div>}
            </div>
          )}

          {/* Deletions Section */}
          {requests.data.delete && requests.data.delete.length > 0 && (
            <div className={`bg-white rounded-lg shadow-sm border-l-4 ${getSectionColor("delete")}`}>
              <button
                onClick={() => toggleSection("delete")}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getSectionIcon("delete")}
                  <span className="font-medium text-gray-900">Deletions ({requestData.data.delete.length})</span>
                </div>
                {expandedSections.delete ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedSections.delete && <div className="px-4 pb-4">{renderDeleteItems()}</div>}
            </div>
          )}
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex gap-4 justify-center mt-8">
          <button
            onClick={() => handleBulkAction("reject")}
            className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Reject All
          </button>
          <button
            onClick={() => handleBulkAction("accept")}
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Accept All
          </button>
        </div>
      </div>
    </div>
  )
}
