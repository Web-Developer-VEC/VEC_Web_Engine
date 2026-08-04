import { useState, useEffect } from "react"
import { Trash2, Plus, Check, X, Clock, TrendingUp, Users, FileText, Activity, Power, Phone } from "lucide-react"
import PastRequestsPage from "./pastReq"
import { useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import { LogOut } from "react-feather"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export default function AdminDashboard() {
  const [currentView, setCurrentView] = useState("dashboard")
  const [pendingRequests, setPendingRequests] = useState([])
  const [showProfilePopup, setShowProfilePopup] = useState(false)

  const adminDetails = JSON.parse(sessionStorage.getItem("userSession"))
  const navigate = useNavigate()
  const location = useLocation()
  const [pastDecisions, setPastDecisions] = useState([])



  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/admin-backend/request")
        setPendingRequests(response.data)
      } catch (error) {
        console.error("Error fetching the pending request for the Superior Admin Dashboard", error)
        // Fallback to static data or show an error message
        setPendingRequests([])
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const fetchCompletedRequests = async () => {
      try {
        const response = await axios.get(
          "/api/admin-backend/completed"
        );
        const formattedRequests = [];

        response.data.forEach((dateGroup) => {
          dateGroup.collections.forEach((collection) => {


            // UPDATE REQUESTS

            collection.data.update?.forEach((item) => {

              formattedRequests.push({

                id: crypto.randomUUID(),
                date: dateGroup.date,
                collection: collection.collection,
                action: "update",
                isPastDecision: true,
                status: item.status,
                title: item.title,
                type: item.type,
                category: item.category,
                admin: item.admin,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                data: item
              });

            });



            // DELETE REQUESTS

            collection.data.delete?.forEach((item) => {

              formattedRequests.push({

                id: crypto.randomUUID(),
                date: dateGroup.date,
                collection: collection.collection,
                action: "delete",
                isPastDecision: true,
                status: item.status,
                title: item.title,
                type: item.type,
                category: item.category,
                admin: item.admin,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                data: item
              });

            });

            //insert

            collection.data.insert?.forEach((item) => {

              formattedRequests.push({

                id: crypto.randomUUID(),
                date: dateGroup.date,
                collection: collection.collection,
                action: "insert",
                isPastDecision: true,
                status: item.status,
                title: item.title,
                type: item.type,
                category: item.category,
                admin: item.admin,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                data: item
              });

            });



          });


        });



        // Latest request first
        formattedRequests.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setPastDecisions(formattedRequests);
      }
      catch (error) {
        console.log("Error fetching completed:", error);
      }

    }
    fetchCompletedRequests();
  }, []);

  // ✅ Handle approval success - remove approved request from list
  useEffect(() => {
    if (location?.state?.approvalSuccess && location?.state?.approvedRequestId) {
      setPendingRequests((prev) =>
        prev.filter((req) => req._id !== location?.state?.approvedRequestId)
      );
      toast.success("🎉 Request has been processed and removed from pending list");
      // Clear the location state to prevent duplicate removals
      navigate(location.pathname, { replace: true });
    }
  }, [location?.state?.approvalSuccess, location?.state?.approvedRequestId, navigate, location.pathname])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".profile-container")) {
        setShowProfilePopup(false)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  const handleRequestClick = (request) => {
    navigate("/admin_approval", {
      state: {
        request: request,
        isPastDecision: currentView === "past-requests"  || false,
      },
    })
  }

  const handleLogout = () => {
    sessionStorage.removeItem("userSession")
    // Add your logout logic here
    setTimeout(() => {
      navigate("/");
    }, 500);
  }

  const handleViewMore = () => {
    setCurrentView("past-requests")
  }

  const handleBackToDashboard = () => {
    setCurrentView("dashboard")
  }

if (currentView === "past-requests") {
  return (
    <PastRequestsPage
      onBack={handleBackToDashboard}
      onRequestClick={handleRequestClick}
      pastRequests={pastDecisions}
    />
  )
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="relative bg-brwn shadow-xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
                <p className="text-emerald-100 text-lg">Superior Administrative Control</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative profile-container">
                <div
                  onClick={() => setShowProfilePopup(!showProfilePopup)}
                  className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition"
                >
                  <span className="text-white font-bold text-lg">SA</span>
                </div>

                {showProfilePopup && (
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                        {adminDetails.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{adminDetails.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{adminDetails.role.replaceAll("_", " ")}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Email:</strong> {adminDetails.email}</p>
                      <p><strong>Phone:</strong> {adminDetails.phone_no}</p>
                    </div>

                    <button className="flex items-center gap-2 text-black px-3 py-3 m-auto transition-all duration-300" onClick={handleLogout}>
                      Logout <LogOut />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Pending Requests</p>
                <p className="text-3xl font-bold text-foreground mt-1">{pendingRequests.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Decisions</p>
                <p className="text-3xl font-bold text-foreground mt-1">{pastDecisions.length}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {pastDecisions.filter((d) => d.status === "approved").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Active Admins</p>
                <p className="text-3xl font-bold text-foreground mt-1">12x</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Recent Requests */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Recent Requests</h3>
                  <p className="text-muted-foreground text-sm">Pending administrative actions</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-muted-foreground text-lg">No pending requests</p>
                  <p className="text-muted-foreground text-sm mt-1">All caught up!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests?.map((request, index) => (
                    <div
                      key={index}
                      className="group flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-primary/20 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                      onClick={() => handleRequestClick(request)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 flex -space-x-3">
                          {request.action.includes("insert") && (
                            <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center shadow-lg animate-float">
                              <Plus className="w-6 h-6 text-white" />
                            </div>
                          )}
                          {request.action.includes("update") && (
                            <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg animate-bounceX">
                              <Check className="w-6 h-6 text-white" />
                            </div>
                          )}
                          {request.action.includes("delete") && (
                            <div className="w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center shadow-lg animate-float">
                              <Trash2 className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
                            {request.collection.replaceAll("_", " ").toUpperCase()}
                          </h4>
                          <p className="text-muted-foreground text-sm capitalize">{request.action} operation</p>
                          <p className="text-muted-foreground text-sm">Requested by: {request.admin?.name || "Unknown"}</p>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Past Decisions */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-8 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Past Decisions</h3>
                    <p className="text-muted-foreground text-sm">Recent administrative actions</p>
                  </div>
                </div>
                <button
                  className="bg-secd hover:bg-brwn text-text hover:text-prim px-6 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg"
                  onClick={handleViewMore}
                >
                  View More
                </button>
              </div>
            </div>
            <div className="p-8">
              {pastDecisions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-muted-foreground text-lg">No past decisions</p>
                  <p className="text-muted-foreground text-sm mt-1">Decisions will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastDecisions.slice(0,5).map((decision) => (
                    <div
                      key={decision.id}
                      className="group flex items-center gap-4 p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-primary/20 cursor-pointer transition-all duration-300"
                      onClick={() => handleRequestClick(decision)}
                    >
                      <div className="flex-shrink-0">
                        {decision.status === "approved" ? (
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Check className="w-6 h-6 text-white" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                            <X className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div
                          className={`border-l-4 pl-4 ${decision.status === "approved"
                              ? "border-emerald-500 bg-gradient-to-r from-emerald-50/50 to-transparent"
                              : "border-red-500 bg-gradient-to-r from-red-50/50 to-transparent"
                            } py-2 rounded-r-lg`}
                        >
                          <h4 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
                            {decision.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-muted-foreground text-sm">By: {decision.admin?.name || "Unknown"}</span>
                            <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                            <span className="text-muted-foreground text-sm">
                              {new Date(decision.createdAt).toLocaleString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </span>                          
                          </div>
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${decision.status === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                          }`}
                      >
                        {decision.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  )
}