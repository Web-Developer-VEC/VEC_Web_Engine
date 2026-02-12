"use client"

import { useEffect, useState } from "react"
import { ChevronDown, ChevronUp, Check, X, Plus, Edit, Trash2, Calendar, User, Trophy, Phone, Image } from "lucide-react"
import { useLocation } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

export default function AdminApprovalPage() {
  const [expandedSections, setExpandedSections] = useState({
    add: false,
    edit: false,
    delete: false,
  })

  const [request,setrequest] = useState(null)
  const location = useLocation();

  useEffect(() => {
    setrequest(location?.state?.request)
  }, [location?.state]);

  const [itemApprovals, setItemApprovals] = useState([])

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // ✅ Approve / reject items using collection + id
  const handleItemApproval = (collection, id, approved) => {
    setItemApprovals((prev) => {
      const existing = prev.find((item) => item.collectionName === collection && item.id === id)

      // If clicked again on the same status → deselect it
      if (existing && existing.status === (approved ? "approved" : "rejected")) {
        return prev.filter((item) => !(item.collectionName === collection && item.id === id))
      }

      // Otherwise, set/overwrite with new status
      const filtered = prev.filter((item) => !(item.collection === collection && item.id === id))
      return [...filtered, { collectionName: collection, id, status: approved ? "approved" : "rejected" }]
    })
  }

  // ✅ Lookup approval status for collection + id
  const getApprovalStatus = (collection, id) => {
    return itemApprovals.find(
      (item) => item.collectionName === collection && item.id === id
    )?.status;
  };

  const handleSubmitReview = async () => {
    const allItems = [
      ...(request?.data?.insert || []),
      ...(request?.data?.update || []),
      ...(request?.data?.delete || []),
    ]

    // Get all item IDs
    const allItemIds = allItems.map((item) => item?._id?.toString())

    // Get all approved/rejected IDs
    const decidedIds = itemApprovals.map((item) => item.id)

    // Find missing ones (not approved/rejected yet)
    const pending = allItemIds.filter((id) => !decidedIds.includes(id))

    // if (pending.length > 0) {
    //   toast.error("⚠️ Please approve or reject all items before submitting.")
    //   return
    // }

    // Prepare the review data
    const review = {
      requestId: request?.admin?.name,
      collection: request?.collection,
      approvals: itemApprovals,
    }

    const endpointMap = {
      about_us: "aboutusadmin",
      administration: "administrationadmin",
      admissions: "admissionadmin",
      exams: "examsadmin" , 
      placement: "placementadmin",
      research: "researchadmin",
      accreditations_and_ranking: "accreditations_and_ranking_admin",
      ecell: "ecelladmin",
      gallery: "galleryadmin",
      help_desk: "helpdeskadmin",
      hostel_details: "hosteladmin",
      iic: "iicadmin",
      incubation: "incubationadmin",
      iqac: "iqacadmin",
      library: "libraryadmin",
      ncc_army: "armyadmin",
      ncc_navy: "navyadmin",
      nss: "nssadmin",
      other_facilities: "other_facilities_admin",
      sports: "sportsadmin",
      transport: "transportadmin",
      yrc: "yrcadmin",
      landing_page_details: "landingpageadmin",
      academics: "calendaradmin" ,
    }

    try {
      const responce = await axios.post(`/api/admin-backend/${endpointMap[request?.collection]}`,
        itemApprovals
      )

      toast.success(responce.message || "Successful")
    } catch (error) {
      console.error("Error sending data to the approval status",error);
      toast.error("Error sending responce")
    }

    console.log("Submitting review:", review)
    toast.success("✅ Review submitted! Check console for details.")
  }

  const button = (item) => (
    <>
      <button
        onClick={() => handleItemApproval(request?.collection, item?._id?.toString(), true)}
        className={`p-3 rounded-xl ${
          getApprovalStatus(request?.collection, item?._id?.toString()) === "approved"
            ? "bg-green-600 text-white"
            : "bg-white"
        }`}x
      >
        <Check className="w-5 h-5" />
      </button>
      <button
        onClick={() => handleItemApproval(request?.collection, item?._id?.toString(), false)}
        className={`p-3 rounded-xl ${
          getApprovalStatus(request?.collection, item?._id?.toString()) === "rejected"
            ? "bg-red-600 text-white"
            : "bg-white"
        }`}
      >
        <X className="w-5 h-5" />
      </button>
    </>
  );

  const getFieldIcon = (fieldName) => {
      const field = fieldName?.toLowerCase()
      if (field?.includes("date") || field?.includes("year") || field?.includes("conducted_on")) return <Calendar className="w-3 h-3 text-gray-500" />
      if (field?.includes("name") || field?.includes("requester")) return <User className="w-3 h-3 text-gray-500" />
      if (field?.includes("winner") || field?.includes("position")) return <Trophy className="w-3 h-3 text-gray-500" />
      if (field?.includes("image_path")) return <Image className="w-3 h-3 text-gray-500" />
      return null
  }

  const formatFieldName = (fieldName) => {
    if (fieldName == "image_path") return "Images"
    return fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, " $1")
  }

  const renderDataFields = (item, excludeFields = []) => {
      return Object.entries(item)
          .filter(([key]) => !excludeFields.includes(key))
          .map(([key, value]) => (
          <div key={key} className="flex items-center gap-2 text-sm">
              {getFieldIcon(key)}
              <span className="text-gray-600 font-medium">{formatFieldName(key)}:</span>
              {Array.isArray(value) ? (
                  <>
                  {value?.length > 0 ? (
                      <>
                          {value?.map((img,idx) => (
                              <span className="text-gray-900"><a href={img}>Image {idx + 1}</a></span>
                          ))}
                      </>
                  ) : (
                      <span className="text-gray-900">Entire Category Was Deleted</span>
                  )}
                  </>
              ) : (
                  <span className="text-gray-900">{value}</span>
              )}  
          </div>
      ))
  }
  
  const renderAddItems = (data) => (
      <div className="space-y-3">
          {data?.data?.insert?.map((item, index) => (
          <div
              key={index}
              className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200/50 shadow-sm"
          >
              <div className="flex justify-between items-start">
              <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2"><span className="text-gray-600">{item?.title}</span> - <Calendar size={16}/>{formatDate(item?.createdAt)}</div>
                  {renderDataFields(item?.meta_data)}
              </div>
              <div className="flex gap-3 ml-6">
                  {button(item)}
              </div>
              </div>
          </div>
          ))}
      </div>
  )
  
  const renderEditItems = (data) => (
      <div className="space-y-3">
          {data?.data?.update?.map((item, index) => (
          <div
              key={index}
              className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200/50 shadow-sm"
          >
              <div className="flex justify-between items-start">
              <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2"><span className="text-gray-600">{item?.title}</span> - <Calendar size={16}/>{formatDate(item?.createdAt)}</div>
                  {renderDataFields(item?.meta_data)}
              </div>
              <div className="flex gap-3 ml-6">
                  {button(item)}
              </div>
              </div>
          </div>
          ))}
      </div>
  )
  
  const renderDeleteItems = (data) => (
      <div className="space-y-3">
        {data?.data?.delete.map((item, index) => (
          <div
            key={index}
            className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-6 border border-red-200/50 shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2"><span className="text-gray-600">{item?.title}</span> - <Calendar size={16}/>{formatDate(item?.createdAt)}</div>
                  {renderDataFields(item?.meta_data)}
              </div>
              <div className="flex gap-3 ml-6">
                  {button(item)}
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
              {/* <h2 className="text-2xl font-bold text-foreground mb-2">{requestData.title}</h2> */}
              <div className="flex flex-col gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>
                    Requested by <strong className="text-text">{request?.admin?.name}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>
                    <a href={`tel:${request?.admin?.phone_no}`} className="text-text">{request?.admin?.phone_no}</a>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-3">
              {request?.collection && (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                  {request?.collection?.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {request?.reason && (
            <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
              <h3 className="font-semibold text-foreground mb-2">Reason for Request</h3>
              <p className="text-muted-foreground">{request?.reason}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Additions Section */}
          {request?.data?.insert && request?.data?.insert?.length > 0 && (
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
                    <p className="text-muted-foreground">{request?.data?.insert?.length} items to be added</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {request?.data?.insert?.length}
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
                  <div className="space-y-4 mt-4">{renderAddItems(request)}</div>
                </div>
              )}
            </div>
          )}

          {/* Modifications Section */}
          {request?.data?.update && request?.data?.update?.length > 0 && (
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
                    <p className="text-muted-foreground">{request?.data?.update?.length} items to be modified</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    {request?.data?.update?.length}
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
                  <div className="space-y-4 mt-4">{renderEditItems(request)}</div>
                </div>
              )}
            </div>
          )}

          {/* Deletions Section */}
          {request?.data.delete && request?.data.delete.length > 0 && (
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
                    <p className="text-muted-foreground">{request?.data?.delete?.length} items to be removed</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                    {request?.data.delete.length}
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
                  <div className="space-y-4 mt-4">{renderDeleteItems(request)}</div>
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
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  )
}