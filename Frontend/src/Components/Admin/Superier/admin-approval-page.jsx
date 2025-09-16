"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Check, X, Plus, Edit, Trash2, Calendar, User, Trophy } from "lucide-react"

export default function AdminApprovalPage() {
  const [expandedSections, setExpandedSections] = useState({
    add: false,
    edit: false,
    delete: false,
  })

  const [itemApprovals, setItemApprovals] = useState({})

  // Sample requests data - any one of these will be passed to the component
  const requests = [
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
  const requestData = requests[1]

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

  const getApprovalStatus = (section, index) => {
    const key = `${section}-${index}`
    return itemApprovals[key]
  }

  const handleSubmitReview = () => {
    // Prepare the review data
    const review = {
      requestId: requestData.id,
      approvals: itemApprovals,
    }
    console.log("Submitting review:", review)
    // Here you would typically send this data to the backend API
    alert("Review submitted! Check console for details.")
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
      {requestData.data.add.map((item, index) => (
        <div
          key={index}
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200/50 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-3">{renderDataFields(item)}</div>
            <div className="flex gap-3 ml-6">
              <button
                onClick={() => handleItemApproval("add", index, true)}
                className={`p-3 rounded-xl transition-all duration-200 shadow-sm ${
                  getApprovalStatus("add", index) === true
                    ? "bg-green-600 text-white shadow-lg scale-105"
                    : "bg-white text-muted-foreground hover:bg-primary hover:text-white hover:shadow-lg hover:scale-105"
                }`}
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleItemApproval("add", index, false)}
                className={`p-3 rounded-xl transition-all duration-200 shadow-sm ${
                  getApprovalStatus("add", index) === false
                    ? "bg-red-600 text-white shadow-lg scale-105"
                    : "bg-white text-muted-foreground hover:bg-destructive hover:text-white hover:shadow-lg hover:scale-105"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderEditItems = () => (
    <div className="space-y-3">
      {requestData.data.edit.map((item, index) => (
        <div
          key={index}
          className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200/50 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {/* Show context info if available (like name, game, title) */}
              <div className="space-y-2 mb-4">
                {Object.entries(item)
                  .filter(([key]) => !["field", "from", "to"].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3">
                      {getFieldIcon(key)}
                      <span className="text-muted-foreground font-medium">{formatFieldName(key)}:</span>
                      <span className="text-foreground font-semibold">{value}</span>
                    </div>
                  ))}
              </div>

              {/* Show the actual change */}
              <div className="bg-white/70 rounded-lg p-4 border border-orange-200/30">
                <div className="flex items-center gap-3 mb-3">
                  {getFieldIcon(item.field)}
                  <span className="text-foreground font-semibold">{formatFieldName(item.field)} Change:</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-2 bg-red-100 text-red-700 rounded-lg line-through font-medium">
                    {item.from}
                  </span>
                  <div className="w-8 h-0.5 bg-gradient-to-r from-red-300 to-green-300 rounded-full"></div>
                  <span className="px-3 py-2 bg-green-100 text-green-700 rounded-lg font-medium">{item.to}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 ml-6">
              <button
                onClick={() => handleItemApproval("edit", index, true)}
                className={`p-3 rounded-xl transition-all duration-200 shadow-sm ${
                  getApprovalStatus("edit", index) === true
                    ? "bg-green-600 text-white shadow-lg scale-105"
                    : "bg-white text-muted-foreground hover:bg-primary hover:text-white hover:shadow-lg hover:scale-105"
                }`}
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleItemApproval("edit", index, false)}
                className={`p-3 rounded-xl transition-all duration-200 shadow-sm ${
                  getApprovalStatus("edit", index) === false
                    ? "bg-red-600 text-white shadow-lg scale-105"
                    : "bg-white text-muted-foreground hover:bg-destructive hover:text-white hover:shadow-lg hover:scale-105"
                }`}
              >
                <X className="w-5 h-5" />
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
        <div
          key={index}
          className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-6 border border-red-200/50 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-3">{renderDataFields(item)}</div>
            <div className="flex gap-3 ml-6">
              <button
                onClick={() => handleItemApproval("delete", index, true)}
                className={`p-3 rounded-xl transition-all duration-200 shadow-sm ${
                  getApprovalStatus("delete", index) === true
                    ? "bg-green-600 text-white shadow-lg scale-105"
                    : "bg-white text-muted-foreground hover:bg-primary hover:text-white hover:shadow-lg hover:scale-105"
                }`}
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleItemApproval("delete", index, false)}
                className={`p-3 rounded-xl transition-all duration-200 shadow-sm ${
                  getApprovalStatus("delete", index) === false
                    ? "bg-red-600 text-white shadow-lg scale-105"
                    : "bg-white text-muted-foreground hover:bg-destructive hover:text-white hover:shadow-lg hover:scale-105"
                }`}
              >
                <X className="w-5 h-5" />
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 mt-4">
      <div className="bg-[#046f54] shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Content Approval Dashboard</h1>
              <p className="text-emerald-100">Review and approve content changes</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="backdrop-blur-sm rounded-lg px-4 py-2">
                {/* <span className="text-white text-sm font-medium">Request #{requestData.id}</span> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{requestData.title}</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>
                    Requested by <strong className="text-foreground">{requestData.requester}</strong>
                  </span>
                </div>
                {requestData.created_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(requestData.created_at)}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              {requestData.section && (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                  {requestData.section.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {requestData.reason && (
            <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
              <h3 className="font-semibold text-foreground mb-2">Reason for Request</h3>
              <p className="text-muted-foreground">{requestData.reason}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Additions Section */}
          {requestData.data.add && requestData.data.add.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <button
                onClick={() => toggleSection("add")}
                className="w-full p-6 flex items-center justify-between hover:bg-green-50/50 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-foreground">New Additions</h3>
                    <p className="text-muted-foreground">{requestData.data.add.length} items to be added</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {requestData.data.add.length}
                  </span>
                  {expandedSections.add ? (
                    <ChevronUp className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                  )}
                </div>
              </button>
              {expandedSections.add && (
                <div className="px-6 pb-6 border-t border-border/50">
                  <div className="space-y-4 mt-4">{renderAddItems()}</div>
                </div>
              )}
            </div>
          )}

          {/* Modifications Section */}
          {requestData.data.edit && requestData.data.edit.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <button
                onClick={() => toggleSection("edit")}
                className="w-full p-6 flex items-center justify-between hover:bg-orange-50/50 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Edit className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-foreground">Modifications</h3>
                    <p className="text-muted-foreground">{requestData.data.edit.length} items to be modified</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    {requestData.data.edit.length}
                  </span>
                  {expandedSections.edit ? (
                    <ChevronUp className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                  )}
                </div>
              </button>
              {expandedSections.edit && (
                <div className="px-6 pb-6 border-t border-border/50">
                  <div className="space-y-4 mt-4">{renderEditItems()}</div>
                </div>
              )}
            </div>
          )}

          {/* Deletions Section */}
          {requestData.data.delete && requestData.data.delete.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <button
                onClick={() => toggleSection("delete")}
                className="w-full p-6 flex items-center justify-between hover:bg-red-50/50 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Trash2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-foreground">Deletions</h3>
                    <p className="text-muted-foreground">{requestData.data.delete.length} items to be removed</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                    {requestData.data.delete.length}
                  </span>
                  {expandedSections.delete ? (
                    <ChevronUp className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                  )}
                </div>
              </button>
              {expandedSections.delete && (
                <div className="px-6 pb-6 border-t border-border/50">
                  <div className="space-y-4 mt-4">{renderDeleteItems()}</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={handleSubmitReview}
            className="inline-flex items-center gap-3 bg-secd text-text hover:bg-brwn hover:text-prim px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-200 border border-white/20"
          >
            <Check className="w-6 h-6" />
            Submit Review Decision
          </button>
        </div>
      </div>
    </div>
  )
}