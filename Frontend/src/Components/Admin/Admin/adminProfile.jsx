"use client"

import { useEffect, useState } from "react"
import { Check, Clock, Trash2, Plus, LogOut, Mail, Phone, Shield, Calendar, Activity } from "lucide-react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

// Dictionary to map routes → human-readable labels
const routeDictionary = {
  "/": "Home",
  "/abt-us": "About Us",
  "/abt-yr": "About Year",
  "/Term_and_Conditions": "Terms & Conditions",
  "/trust": "Trust",
  "/handbook": "Handbook",
  "/v_m": "Vision & Mission",
  "/management": "Management",
  "/principal": "Principal",
  "/dean": "Dean",
  "/admin": "Admin",
  "/committee": "Committee",
  "/clg-org": "College Organization",
  "/departments": "Departments",
  "/programs": "Programs",
  "/acadamic_cal": "Academic Calendar",
  "/dept/:deptID": "Department Details",
  "/facultyprofile/:uid": "Faculty Profile",
  "/ug": "Undergraduate Programs",
  "/m_e": "M.E. Programs",
  "/mba": "MBA Programs",
  "/phd": "PhD Programs",
  "/admission-team": "Admission Team",
  "/reg": "Registrar",
  "/Syllabus": "Syllabus",
  "/form": "Forms",
  "/Academic": "Academic Info",
  "/coe": "Controller of Exams",
  "/abtplace": "About Placement",
  "/place-team": "Placement Team",
  "/place-dep": "Placement Department",
  "/Consultancy": "Consultancy",
  "/Journal": "Journal",
  "/policies": "Policies",
  "/Funded": "Funded Projects",
  "/Book_Chapter": "Book Chapters",
  "/Accreditation": "Accreditation",
  "/iqac": "IQAC",
  "/iic": "IIC",
  "/ecell": "E-Cell",
  "/incubation": "Incubation",
  "/alumni": "Alumni",
  "/NSS": "NSS",
  "/NCC": "NCC",
  "/nccnavy": "NCC Navy",
  "/nccarmy": "NCC Army",
  "/YRC": "YRC",
  "/sports": "Sports",
  "/transport": "Transport",
  "/library": "Library",
  "/hosLanding": "Hostel",
  "/other-facilities": "Other Facilities",
  "/gallery": "Gallery",
  "/gallery-details": "Gallery Details",
  "/grievances": "Grievances",
  "/webteam": "Web Team",
  "/web_contact": "Web Contact",
  "/admin_dash": "Admin Dashboard",
  "/admin_approval": "Admin Approval",

  // Department Routes
  "/dept/001": "Artificial Intelligence and Data Science",
  "/dept/002": "Automobile Engineering",
  "/dept/003": "Chemistry",
  "/dept/004": "Civil Engineering",
  "/dept/005": "Computer Science and Engineering",
  "/dept/006": "Computer Science and Engineering (Cyber Security)",
  "/dept/007": "Electrical and Electronics Engineering",
  "/dept/008": "Electronics and Instrumentation Engineering",
  "/dept/009": "Electronics and Communication Engineering",
  "/dept/010": "English",
  "/dept/011": "Information Technology",
  "/dept/012": "Mathematics",
  "/dept/013": "Mechanical Engineering",
  "/dept/014": "Tamil",
  "/dept/015": "Physics",
  "/dept/016": "Master of Engineering in Computer Science",
  "/dept/017": "Master of Business Administration",
};

const getActionIcon = (action) => {
  switch (action) {
    case "insert":
      return <Plus className="w-4 h-4" />
    case "update":
      return <Clock className="w-4 h-4" />
    case "delete":
      return <Trash2 className="w-4 h-4" />
    default:
      return <Activity className="w-4 h-4" />
  }
}

const getActionColor = (action) => {
  switch (action) {
    case "insert":
      return "bg-gradient-to-r from-emerald-500 to-emerald-600"
    case "update":
      return "bg-gradient-to-r from-blue-500 to-blue-600"
    case "delete":
      return "bg-gradient-to-r from-red-500 to-red-600"
    default:
      return "bg-gradient-to-r from-gray-500 to-gray-600"
  }
}

const getActionBadgeColor = (action) => {
  switch (action) {
    case "insert":
      return "bg-emerald-100 text-emerald-800 border-emerald-200"
    case "update":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "delete":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export default function AdminProfilePage() {
  // Get user session from sessionStorage
  const userSession = JSON.parse(sessionStorage.getItem("userSession") || "{}");
  const navigate = useNavigate();

  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responce = await axios.get('/api/admin-backend/adminrequest');

        console.log("Responce",responce.data);
        setPendingRequests(responce.data)
      } catch (error) {
        console.error("Error fetching the Admin pending request",error);
      }
    }

    fetchData();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("userSession")
    // Add your logout logic here
    setTimeout(() => {
      navigate("/");
    }, 500);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 mt-10">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Admin Portal
                  </h1>
                  <p className="text-sm text-gray-500 font-medium">Management Dashboard</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="hidden sm:flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{userSession?.name}</p>
                  <p className="text-xs text-gray-500 capitalize font-medium">{userSession?.role?.replace("-", " ")}</p>
                </div>
                <div className="w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white/50">
                  <span className="text-white font-bold text-lg">{userSession?.name?.charAt(0) || "A"}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-xl transition-all duration-200 backdrop-blur-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Overview */}
        <div className="mb-8">
          <div className="backdrop-blur-xl bg-gradient-to-r from-white/90 to-blue-50/90 rounded-3xl border border-white/20 shadow-xl p-8">
            <div className="flex items-center space-x-6 mb-6">
              <div className="w-20 h-20 bg-blue-800 rounded-3xl flex items-center justify-center shadow-2xl">
                <span className="text-white font-bold text-2xl">{userSession?.name?.charAt(0) || "A"}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  {userSession?.name}
                </h2>
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-semibold rounded-full border border-blue-200 capitalize">
                    {userSession?.role?.replace("-", " ")}
                  </span>
                  {/* <span className="text-gray-600 font-medium">Administrator</span> */}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-4 p-4 bg-white/60 rounded-2xl backdrop-blur-sm border border-white/30">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Email</p>
                  <p className="text-sm font-semibold text-gray-900">{userSession?.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-white/60 rounded-2xl backdrop-blur-sm border border-white/30">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Phone</p>
                  <p className="text-sm font-semibold text-gray-900">{userSession?.phone_no}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-white/60 rounded-2xl backdrop-blur-sm border border-white/30">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Access</p>
                  <p className="text-sm font-semibold text-gray-900">{userSession.routes
                    .filter((route) => route !== "/admin_profile" && route !== "/gallery_details")?.length || 0} Routes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Pending Requests */}
          <div className="backdrop-blur-xl bg-white/90 rounded-3xl border border-white/20 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Pending Requests</h3>
                    <p className="text-sm text-gray-500">{pendingRequests?.requests?.length || 0} requests awaiting approval</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 text-sm font-bold rounded-full border border-orange-200">
                  {pendingRequests?.requests?.length || 0}
                </div>
              </div>
            </div>

            <div className="p-6">
              {pendingRequests?.requests?.length === 0 || pendingRequests?.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-600 font-semibold mb-1">No pending requests</p>
                  <p className="text-sm text-gray-400">All caught up!</p>
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto max-h-96">
                  {pendingRequests?.requests?.map((request, idx) => (
                    <div
                      key={idx}
                      className="group p-5 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="flex items-start space-x-4">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${getActionColor(request.action)}`}
                        >
                          {getActionIcon(request.action)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {request?.data?.[0]?.title}
                            </h4>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full border capitalize ${getActionBadgeColor(request.action)}`}
                            >
                              {request.action}
                            </span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-2" />
                            <span className="font-medium">{request.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Allowed Routes */}
          <div className="backdrop-blur-xl bg-white/90 rounded-3xl border border-white/20 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Allowed Routes</h3>
                    <p className="text-sm text-gray-500">Pages and sections you can manage</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm font-bold rounded-full border border-green-200">
                  {userSession.routes
                    .filter((route) => route !== "/admin_profile" && route !== "/gallery_details")?.length || 0}
                </div>
              </div>
            </div>

            <div className="p-6">
              {!userSession?.routes || userSession.routes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-600 font-semibold mb-1">No routes assigned</p>
                  <p className="text-sm text-gray-400">Contact your superior admin for access</p>
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-96">
                  {userSession.routes
                    .filter((route) => route !== "/admin_profile" && route !== "/gallery_details")
                    .map((route, index) => (
                      <div
                        key={index}
                        className="group p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-green-200 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <a
                            href={route}
                            className="flex items-center space-x-4 text-gray-700 hover:text-green-700 transition-colors flex-1 cursor-pointer no-underline"
                          >
                            <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full group-hover:scale-125 transition-transform"></div>
                            <span className="font-semibold group-hover:text-green-700">
                              {routeDictionary[route] || route}
                            </span>
                          </a>
                          <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-emerald-100 group-hover:from-green-200 group-hover:to-emerald-200 rounded-full flex items-center justify-center transition-all duration-300">
                            <Check className="w-4 h-4 text-green-600" />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}