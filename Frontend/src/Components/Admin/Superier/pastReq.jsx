import axios from "axios";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, X, FileText, Filter, Search,Calendar, } from "lucide-react"
// Extended mock data for past requests

export default function PastRequestsPage({ onBack, onRequestClick,  pastRequests }) {


  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState("latest");
  const [selectedDate, setSelectedDate] = useState("");

  const [selectedRequest, setSelectedRequest] = useState(null); //pastreq card











  const approvedCount = pastRequests.filter((req) => req.status === "approved").length
  const rejectedCount = pastRequests.filter((req) => req.status === "rejected").length
  const filteredRequests = pastRequests.filter((request) => {

  const search = searchTerm.toLowerCase();

  const matchesSearch =
    request.title?.toLowerCase().includes(search) ||
    request.collection?.toLowerCase().includes(search) ||
    request.category?.toLowerCase().includes(search) ||
    request.type?.toLowerCase().includes(search) ||
    request.admin?.toLowerCase().includes(search) ||
    request.action?.toLowerCase().includes(search);

  const matchesDate =
    !selectedDate ||
    request.createdAt?.slice(0, 10) === selectedDate;

  return matchesSearch && matchesDate;
});
  console.log("pastRequests", pastRequests);
  const displayRequests = filteredRequests.filter((request) => {
    if (filterType === "all") return true;

    if (filterType === "approved")
      return request.status === "approved";

    if (filterType === "rejected")
      return request.status === "rejected";

    return request.action === filterType;
  });

  const sortedRequests = [...displayRequests].sort((a, b) => {
    if (sortOrder === "latest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }

    return new Date(a.createdAt) - new Date(b.createdAt);
  });
  console.log("sortedRequests:", sortedRequests);



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
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-muted rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-500" />

                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-4 py-3 rounded-xl border border-gray-300 bg-white outline-none"
                    >
                      <option value="all">All</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      {/* <option value="insert">Insert</option>
    <option value="update">Update</option>
    <option value="delete">Delete</option> */}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Sort</span>

                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="px-4 py-3 rounded-xl border border-border bg-muted outline-none"
                    >
                      <option value="latest">Latest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>
   <div className="relative">
  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />

  <input
    type="date"
    value={selectedDate}
    onChange={(e) => setSelectedDate(e.target.value)}
    className="pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
  />
</div>
<button
  onClick={() => setSelectedDate("")}
  className="px-4 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 transition"
>
  Clear
</button>
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
                  {sortedRequests.length === 0 ? (
                    <div className="text-center py-16">
                      <FileText className="w-14 h-14 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700">
                        No Requests Found
                      </h3>
                      <p className="text-gray-500 mt-2">
                        Try changing your search or filter.
                      </p>
                    </div>
                  ) : (
                    sortedRequests.map((request, index) => (<div
                      key={index}
                      className="group flex items-center gap-6 p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-primary/20 cursor-pointer transition-all duration-300"
onClick={() => onRequestClick({
  ...request,
  isPastDecision: true
})}                    >
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
                            <p className="text-muted-foreground text-base mb-2">{request.collection} • {request.action}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>By: {request.admin}</span>
                              <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                              <span>{new Date(request.createdAt).toLocaleString()}</span>
                              <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                              <span className="px-2 py-1 bg-muted rounded-md text-xs">{request.category || request.type}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 ml-4">
                            <div
                              className={`px-4 py-2 rounded-full text-sm font-medium ${request.status === "approved"
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
                    )))}
                </div>
              </div>
            </div>
          </div>
        
      
    </div>

  )
}