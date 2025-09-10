import { useState, useEffect } from "react";
import { Trash2, Plus, Check, X, Clock } from "lucide-react";
import PastRequestsPage from "./pastReq";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminDashboard() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [pendingRequests, setPendingRequests] = useState([]);
  const navigate = useNavigate();

  const [pastDecisions, setPastDecisions] = useState([
  {
    id: 1,
    title: "Insert new product",
    author: "Admin A",
    timestamp: "2025-09-01 10:30 AM",
    status: "approved",
  },
  {
    id: 2,
    title: "Delete user account",
    author: "Admin B",
    timestamp: "2025-09-02 2:15 PM",
    status: "rejected",
  },
  {
    id: 3,
    title: "Update order status",
    author: "Admin C",
    timestamp: "2025-09-05 4:45 PM",
    status: "approved",
  },
]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/admin-backend/request');
        setPendingRequests(response.data);
      } catch (error) {
        console.error("Error fetching the pending request for the Superier Admin Dashbord", error);
        // Fallback to static data or show an error message
        setPendingRequests([]);
      }
    };
    fetchData();
  }, []);

  const handleRequestClick = (request) => {
    navigate('/admin_approval', {
      state: {
        request: request
      }
    });
  };

  const handleViewMore = () => {
    setCurrentView("past-requests");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
  };

  if (currentView === "past-requests") {
    return <PastRequestsPage onBack={handleBackToDashboard} onRequestClick={handleRequestClick} />;
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
              {pendingRequests.length === 0 ? (
                <p className="text-center text-gray-500">No pending requests.</p>
              ) : (
                pendingRequests.map((request, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    onClick={() => handleRequestClick(request)}
                  >
                    <span className="text-gray-800 font-medium">
                      {request.collection}
                    </span>
                    <div className="flex items-center gap-2">
                      {request.action.includes("insert") && (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Plus className="w-4 h-4 text-white" />
                        </div>
                      )}
                      {request.action.includes("update") && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      {request.action.includes("delete") && (
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <Trash2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Past Decisions */}
          <div className="bg-prim p-10 shadow-sm">
            <div className="pb-4">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">Past Decisions</div>
                <button
                  className="text-blue-600 hover:text-blue-700 p-0 h-auto font-normal"
                  onClick={handleViewMore}
                >
                  View More
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {/* You will fetch past decisions here in a similar way */}
              {pastDecisions.length === 0 ? (
                <p className="text-center text-gray-500">No past decisions to display.</p>
              ) : (
                pastDecisions.map((decision) => (
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
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}