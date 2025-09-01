import { useState } from "react"
import { Trash2, Plus, Check, X, Clock } from "lucide-react"
import PastRequestsPage from "./pastReq"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import axios from "axios";

// Static data for the dashboard
const recentRequests = [
  {
    id: 1,
    title: "Sports: Tournament Update",
    status: "pending",
    hasActions: true,
    timestamp: "2025-07-12T10:22:00Z",
  },
  {
    id: 2,
    title: "Zonal Results Update",
    status: "rejected",
    hasActions: false,
    timestamp: "2025-07-11T14:30:00Z",
  },
  {
    id: 3,
    title: "Faculty Profile Change",
    status: "approved",
    hasActions: true,
    timestamp: "2025-07-10T09:15:00Z",
  },
  {
    id: 4,
    title: "Faculty Profile Change",
    status: "approved",
    hasActions: true,
    timestamp: "2025-07-09T16:45:00Z",
  },
]

const pastDecisions = [
  {
    id: 1,
    title: "Annual Sports Winners",
    author: "Coach Ram",
    timestamp: "2025-07-10 14:00",
    status: "approved",
  },
  {
    id: 2,
    title: "Faculty Promotion Update",
    author: "Dean Arjun",
    timestamp: "2025-07-11 11:30",
    status: "rejected",
  },
  {
    id: 3,
    title: "Annual Sports Winners",
    author: "Coach Ram",
    timestamp: "2025-07-10 14:00",
    status: "approved",
  },
  {
    id: 4,
    title: "Faculty Promotion Update",
    author: "Dean Arjun",
    timestamp: "2025-07-11 11:30",
    status: "rejected",
  },
]

export default function AdminDashboard() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [pendingRequest, setPendingrequest] = useState(null);
  console.log("Ajay",pendingRequest);
  
  const navigate = useNavigate();

  const handleRequestClick = (requestId, request) => {
    // Navigate to approval page - in a real app this would use Next.js router
    console.log(`Navigating to approval page for request ${requestId}`)
    navigate('/admin_approval', {
      state: {
        request: request
      }
    });
    
    // For demo purposes, you could set up routing here
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responce = await axios.get('/api/admin-backend/request');

        console.log("Request", responce.data);
        setPendingrequest(responce.data);
        
      } catch (error) {
        console.error("Error fetching the pending request for the Superier Admin Dashbord",error);
      }
    }
    fetchData();
  }, []);

  const handleViewMore = () => {
    setCurrentView("past-requests")
  }

  const handleBackToDashboard = () => {
    setCurrentView("dashboard")
  }

  if (currentView === "past-requests") {
    return <PastRequestsPage onBack={handleBackToDashboard} onRequestClick={handleRequestClick} />
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-prim dark:bg-drkp p-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">Superior Dashboard</span>
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-sm">SA</span>
            </div>
            <button className="text-sm text-gray-700 hover:text-black">Logout</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Requests */}
          <div className="bg-prim p-10 shadow-sm">
            <div className="pb-4">
              <div className="text-lg font-semibold text-center">Recent Requests</div>
            </div>
            <div className="space-y-3">
              {pendingRequest?.map((request) => {
                const insert = request.action.include("insert");
                return (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    onClick={() => handleRequestClick(request.id,request)}
                  >
                    <span className="text-gray-800 font-medium">{request?.collection}</span>
                    <div className="flex items-center gap-2">
                      {insert && (
                        <>
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Plus className="w-4 h-4 text-white" />
                          </div>
                          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Clock className="w-3 h-3 text-white" />
                          </div>
                        </>
                      )}
                      {request.status === "rejected" && (
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <Trash2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                      {request.status === "approved" && (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Plus className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="w-1 h-8 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                )})}
            </div>
          </div>

          {/* Past Decisions */}
          <div className="bg-prim p-10 shadow-sm">
            <div className="pb-4">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">Past Decisions</div>
                <button
                  variant="ghost"
                  className="text-blue-600 hover:text-blue-700 p-0 h-auto font-normal"
                  onClick={handleViewMore}
                >
                  View More
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {pastDecisions.map((decision) => (
                <div
                  key={decision.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <div
                    className={`flex-1 border-l-4 pl-3 ${
                      decision.status === "approved" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
                    }`}
                  >
                    <h6 className="font-medium text-gray-900">{decision.title}</h6>
                    <p className="text-sm text-gray-600">
                      By: {decision.author} • {decision.timestamp}
                    </p>
                  </div>
                  <div className="ml-3">
                    {decision.status === "approved" ? (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <X className="w-4 h-4 text-white" />
                      </div>
                    )}
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
