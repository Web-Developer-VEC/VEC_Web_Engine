import { ArrowLeft, Check, X, FileText, Filter, Search } from "lucide-react"

export default function PastRequestsPage({ onBack, onRequestClick }) {
  // Extended mock data for past requests
  const pastRequests = [
    {
      id: 1,
      title: "Insert new product",
      author: "Admin A",
      timestamp: "2025-09-01 10:30 AM",
      status: "approved",
      description: "Added new product to catalog",
      category: "Product Management",
    },
    {
      id: 2,
      title: "Delete user account",
      author: "Admin B",
      timestamp: "2025-09-02 2:15 PM",
      status: "rejected",
      description: "User account deletion request",
      category: "User Management",
    },
    {
      id: 3,
      title: "Update order status",
      author: "Admin C",
      timestamp: "2025-09-05 4:45 PM",
      status: "approved",
      description: "Changed order status to shipped",
      category: "Order Management",
    },
    {
      id: 4,
      title: "Modify user permissions",
      author: "Admin D",
      timestamp: "2025-09-08 9:20 AM",
      status: "approved",
      description: "Updated user role permissions",
      category: "User Management",
    },
    {
      id: 5,
      title: "Delete expired content",
      author: "Admin E",
      timestamp: "2025-09-10 3:45 PM",
      status: "rejected",
      description: "Removal of outdated content",
      category: "Content Management",
    },
    {
      id: 6,
      title: "Add new category",
      author: "Admin F",
      timestamp: "2025-09-12 11:15 AM",
      status: "approved",
      description: "Created new product category",
      category: "Product Management",
    },
  ]

  const approvedCount = pastRequests.filter((req) => req.status === "approved").length
  const rejectedCount = pastRequests.filter((req) => req.status === "rejected").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Header */}
      <div className="relative bg-brwn shadow-xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={onBack}
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all duration-300"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Past Decisions</h1>
                  <p className="text-emerald-100 text-lg">Complete administrative history</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                <p className="text-white font-semibold m-auto">Total: {pastRequests.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Decisions</p>
                <p className="text-3xl font-bold text-foreground mt-1">{pastRequests.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">{approvedCount}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Check className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Rejected</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{rejectedCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <X className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="px-8 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search decisions..."
                  className="w-full pl-10 pr-4 py-3 bg-muted rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-3 bg-muted hover:bg-muted/80 rounded-xl border border-border transition-colors">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">Filter</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Past Decisions List */}
      <div className="px-8 pb-8">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-8 py-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">All Past Decisions</h3>
                <p className="text-muted-foreground text-sm">Complete administrative history</p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <div className="space-y-4">
              {pastRequests.map((request) => (
                <div
                  key={request.id}
                  className="group flex items-center gap-6 p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-primary/20 cursor-pointer transition-all duration-300"
                  onClick={() => onRequestClick(request)}
                >
                  <div className="flex-shrink-0">
                    {request.status === "approved" ? (
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Check className="w-7 h-7 text-white" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                        <X className="w-7 h-7 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground text-xl group-hover:text-primary transition-colors mb-1">
                          {request.title}
                        </h4>
                        <p className="text-muted-foreground text-base mb-2">{request.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>By: {request.author}</span>
                          <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                          <span>{request.timestamp}</span>
                          <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                          <span className="px-2 py-1 bg-muted rounded-md text-xs">{request.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <div
                          className={`px-4 py-2 rounded-full text-sm font-medium ${
                            request.status === "approved"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <ArrowLeft className="w-4 h-4 text-white rotate-180" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}