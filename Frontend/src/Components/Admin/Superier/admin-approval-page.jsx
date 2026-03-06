import { useEffect, useState } from "react"
import { ChevronDown, ChevronUp, Check, X, Plus, Edit, Trash2, Calendar, User, Trophy, Image, FileText, ArrowRight, ArrowLeft, Type, GraduationCap, ShieldPlus, Mail, Phone } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

export default function AdminApprovalPage() {
  const [expandedSections, setExpandedSections] = useState({
    add: false,
    edit: false,
    delete: false,
  })

  const [request, setrequest] = useState(null)
  const [loading, setLoading] = useState(false)
  const location = useLocation();
  const navigate = useNavigate();

  // const BASE_URL = process.env.REACT_APP_BASE_URL;
  const BASE_URL = "https://vectest123.s3.ap-south-1.amazonaws.com"
  const UrlParser = (path) => (path?.startsWith("http") ? path : `${BASE_URL}${path}`);

  useEffect(() => {
    setrequest(location?.state?.request)
    // Scroll to top whenever location changes
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location?.state]);

  const [itemApprovals, setItemApprovals] = useState([])

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // ✅ Approve / reject items using collection + id
  const handleItemApproval = (collection, id, approved, type) => {
    setItemApprovals((prev) => {
      const existing = prev.find((item) => item.collectionName === collection && item.id === id)

      // If clicked again on the same status → deselect it
      if (existing && existing.status === (approved ? "approved" : "rejected")) {
        return prev.filter((item) => !(item.collectionName === collection && item.id === id))
      }

      // Otherwise, set/overwrite with new status
      const filtered = prev.filter((item) => !(item.collection === collection && item.id === id))
      return [...filtered, { collectionName: collection, id, status: approved ? "approved" : "rejected", type }]
    })
  }

  // ✅ Lookup approval status for collection + id
  const getApprovalStatus = (collection, id) => {
    return itemApprovals.find(
      (item) => item.collectionName === collection && item.id === id
    )?.status;
  };

  const handleSubmitReview = async () => {
    setLoading(true);

    const endpointMap = {
      about_us: "aboutusadmin",
      administration: "administrationadmin",
      admissions: "admissionadmin",
      exams: "examsadmin",
      placement: "placementadmin",
      research: "overallresearchadmin",
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
      academics: "calendaradmin",
    };

    try {
      const isDepartmentCollection =
        /^[A-Z]+_\d+$/.test(request.collection);

      // ====================================
      // Case 1: Department collections
      // ====================================
      if (isDepartmentCollection) {
        const grouped = itemApprovals.reduce((acc, item) => {

          if (!item.type) return acc;

          if (!acc[item.type]) {
            acc[item.type] = [];
          }

          acc[item.type].push(item);
          return acc;
        }, {});

        await Promise.all(
          Object.entries(grouped).map(([type, approvals]) => {
            const endpoint = `${type.toLowerCase().replaceAll("_", "")}admin`;

            return axios.post(
              `/api/admin-backend/${endpoint}`,
              approvals
            );
          })
        );
      }

      // ====================================
      // Case 2: Normal collections
      // ====================================
      else {
        const endpoint = endpointMap[request.collection];

        if (!endpoint) {
          throw new Error("Unknown collection endpoint");
        }

        await axios.post(
          `/api/admin-backend/${endpoint}`,
          itemApprovals
        );
      }
      
      // ✅ Success: Show success toast and navigate back
      toast.success("✅ Changes approved successfully!");
      
      // Navigate back to dashboard after brief delay
      setTimeout(() => {
        navigate("/admin_dashboard", { 
          state: { 
            approvalSuccess: true,
            approvedCollection: request?.collection,
            approvedRequestId: request?._id
          } 
        });
      }, 1500);
    }
    catch (error) {
      console.error(error);
      toast.error("❌ Failed to submit approvals. Please try again.");
    }
    finally {
      setLoading(false);
    }
  };

  const button = (item) => (
    <>
      <button
        onClick={() => handleItemApproval(request?.collection, item?._id?.toString(), true, item?.type)}
        className={`p-3 rounded-xl ${
          getApprovalStatus(request?.collection, item?._id?.toString()) === "approved"
            ? "bg-green-600 text-white"
            : "bg-white"
        }`}
      >
        <Check className="w-5 h-5" />
      </button>
      <button
        onClick={() => handleItemApproval(request?.collection, item?._id?.toString(), false, item?.type)}
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
    if (field?.includes("date") || field?.includes("year") || field?.includes("conducted_on")) return <Calendar className="w-4 h-4 text-gray-500" />
    if (field?.includes("name") || field?.includes("requester")) return <User className="w-4 h-4 text-gray-500" />
    if (field?.includes("winner") || field?.includes("position")) return <Trophy className="w-4 h-4 text-gray-500" />
    if (field?.includes("image")) return <Image className="w-4 h-4 text-gray-500" />
    if (field?.includes("pdf")) return <FileText className="w-4 h-4 text-gray-500" />
    if (field?.includes("type") || field?.includes("title")) return <Type className="w-4 h-4 text-gray-500" />
    if (field?.includes("designation") || field?.includes("qualification")) return <GraduationCap className="w-4 h-4 text-gray-500" />
    if (field?.includes("role")) return <ShieldPlus className="w-4 h-4 text-gray-500" />
    if (field?.includes("email")) return <Mail className="w-4 h-4 text-gray-500" />
    if (field?.includes("phone")) return <Phone className="w-4 h-4 text-gray-500" />
    return null
  }

  const formatFieldName = (fieldName) => {
    if (fieldName === "image_path") return "Images"
    if (fieldName === "pdf_path") return "Pdf"
    return fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z_])/g, " $1").replace(/_/g, " ")
  }

  // ✅ IMPROVED: Recursive function to render any nested data structure
  const renderValue = (value, fieldName = "", depth = 0) => {
    // Handle null/undefined
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">None</span>
    }

    // Handle empty strings
    if (value === "") {
      return (
        <span className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium italic">
          Empty
        </span>
      )
    }

    // Handle arrays
    if (Array.isArray(value)) {
      // Empty array
      if (value.length === 0) {
        return <span className="text-gray-400 italic">Empty Array</span>
      }

      // Check if this is an image_path or pdf_path array FIRST
      if (fieldName?.toLowerCase().includes('image') && value.length > 0 && typeof value[0] === 'string') {
        return (
          <div className="flex flex-wrap gap-2">
            {value.map((img, idx) => (
              <a 
                key={idx}
                href={UrlParser(img)} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
              >
                <Image className="w-4 h-4" />
                Image {idx + 1}
              </a>
            ))}
          </div>
        )
      }

      if (fieldName?.toLowerCase().includes('pdf') && value.length > 0 && typeof value[0] === 'string') {
        return (
          <div className="flex flex-wrap gap-2">
            {value.map((pdf, idx) => (
              <a 
                key={idx}
                href={UrlParser(pdf)} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
              >
                <FileText className="w-4 h-4" />
                PDF {idx + 1}
              </a>
            ))}
          </div>
        )
      }

      // Array of primitives (strings, numbers) - for non-image/pdf fields
      if (typeof value[0] !== 'object') {
        // Check if it's a long text array (like paragraphs)
        const hasLongText = value.some(item => String(item).length > 100)
        
        if (hasLongText) {
          // Render as stacked paragraphs
          return (
            <div className="space-y-3">
              {value.map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-xs font-semibold text-gray-500 mb-2">Paragraph {idx + 1}</div>
                  <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">{item}</p>
                </div>
              ))}
            </div>
          )
        }

        // Short items - render as badges
        return (
          <div className="flex flex-wrap gap-2">
            {value.map((item, idx) => (
              <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                {item}
              </span>
            ))}
          </div>
        )
      }

      // Array of objects - render each object
      return (
        <div className={`space-y-3 ${depth > 0 ? 'mt-2' : ''}`}>
          {value.map((item, idx) => (
            <div key={idx} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
              <div className="text-xs font-bold text-gray-600 mb-3 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </div>
                Item {idx + 1}
              </div>
              <div className="pl-2">
                {renderValue(item, '', depth + 1)}
              </div>
            </div>
          ))}
        </div>
      )
    }

    // Handle objects
    if (typeof value === 'object') {
      return (
        <div className={`space-y-3 ${depth > 0 ? 'bg-white/50 rounded-lg p-3 border border-gray-200' : ''}`}>
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-2">
              <div className="flex items-center gap-2 min-w-[160px] sm:min-w-[200px]">
                {getFieldIcon(key)}
                <span className="text-gray-700 font-semibold text-sm">{formatFieldName(key)}:</span>
              </div>
              <div className="flex-1 min-w-0">
                {renderValue(val, key, depth + 1)}
              </div>
            </div>
          ))}
        </div>
      )
    }

    // Handle image/pdf paths (single strings only - arrays handled above)
    if (fieldName?.toLowerCase().includes('image') && value && typeof value === 'string') {
      return (
        <a 
          href={UrlParser(value)} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
        >
          <Image className="w-4 h-4" />
          View Image
        </a>
      )
    }

    if (fieldName?.toLowerCase().includes('pdf') && value && typeof value === 'string') {
      return (
        <a 
          href={UrlParser(value)} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
        >
          <FileText className="w-4 h-4" />
          View PDF
        </a>
      )
    }

    // Handle URLs (social media links, etc.)
    if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
      // Extract domain for better display
      let displayText = value;
      try {
        const url = new URL(value);
        displayText = url.hostname.replace('www.', '');
      } catch {
        // If URL parsing fails, truncate the string
        displayText = value.length > 40 ? value.substring(0, 37) + '...' : value;
      }
      
      return (
        <a 
          href={UrlParser(value)} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium group max-w-full"
          title={value}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span className="truncate">{displayText}</span>
          <svg className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )
    }

    // Handle long text (more than 200 characters)
    if (typeof value === 'string' && value.length > 200) {
      return (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">{value}</p>
        </div>
      )
    }

    // Handle primitives (string, number, boolean)
    return <span className="text-gray-900 text-sm">{String(value)}</span>
  }

  // ✅ IMPROVED: Render data fields with recursive support
  const renderDataFields = (data) => {
    if (!data || typeof data !== 'object') {
      return <div className="text-gray-400 italic">No data</div>
    }

    let meta_data = data?.meta_data;

    return (
      <div className="space-y-3">
        {renderValue(meta_data)}
      </div>
    )
  }

  const renderDataFieldsMeta = (data) => {
    if (!data || typeof data !== 'object') {
      return <div className="text-gray-400 italic">No data</div>
    }

    let meta_data = data?.meta_data;

    const needArrayNormalize = ['about_the_department', 'department_mission', 'department_vision'].includes(data?.category);

    if (needArrayNormalize && meta_data) {
      meta_data = Array.isArray(meta_data)
        ? meta_data
        : Object.values(meta_data);
    }

    return (
      <div className="space-y-3">
        {renderValue(meta_data)}
      </div>
    )
  }

  const renderDataFieldsOriginal = (data) => {
    if (!data || typeof data !== 'object') {
      return <div className="text-gray-400 italic">No data</div>
    }

    let original_data = data?.original_data;

    return (
      <div className="space-y-3">
        {renderValue(original_data)}
      </div>
    )
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
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-semibold">{item?.title?.replaceAll("_", " ").toUpperCase()}</span>
                <span className="text-gray-400">•</span>
                <Calendar size={16} />
                {formatDate(item?.createdAt)}
              </div>
              {item?.category && (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    {item?.category.replaceAll("_", " ").toUpperCase()}
                  </span>
                </div>
              )}
              {renderDataFields(item)}
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
          className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200/50 shadow-sm"
        >
          <div className="flex flex-col gap-4">
            {/* Header with title and buttons */}
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-800 font-bold text-lg">{item?.title?.replaceAll("_", " ").toUpperCase()}</span>
                  <span className="text-gray-400">•</span>
                  <Calendar size={16} />
                  <span className="text-gray-600 text-sm">{formatDate(item?.createdAt)}</span>
                </div>
                {item?.category && (
                  <span className="inline-flex px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                    {item?.category?.replaceAll("_", " ").toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex gap-3 ml-4">
                {button(item)}
              </div>
            </div>

            {/* Data comparison */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Original Data */}
              <div className="bg-white/70 rounded-xl p-5 border-2 border-red-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-red-200">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <ArrowLeft className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-red-700">Original Data</div>
                    <div className="text-xs text-red-600">Before changes</div>
                  </div>
                </div>
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                  {renderDataFieldsOriginal(item)}
                </div>
              </div>

              {/* Updated Data */}
              <div className="bg-white/70 rounded-xl p-5 border-2 border-green-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-green-200">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-green-700">Updated Data</div>
                    <div className="text-xs text-green-600">Proposed changes</div>
                  </div>
                </div>
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                  {renderDataFieldsMeta(item)}
                </div>
              </div>
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
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-semibold">{item?.title?.replaceAll("_", " ").toUpperCase()}</span>
                <span className="text-gray-400">•</span>
                <Calendar size={16} />
                {formatDate(item?.createdAt)}
              </div>
              {item?.category && (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    {item?.category?.replaceAll("_", " ").toUpperCase()}
                  </span>
                </div>
              )}
              {renderDataFields(item)}
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
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      
      <div className="bg-[#046f54] shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-start gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all duration-300"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Content Approval Dashboard</h1>
              <p className="text-emerald-100">Review and approve content changes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>
                Requested by <strong className="text-text">{request?.admin?.name}</strong>
              </span>
            </div>
            <div className="flex flex-col items-center justify-center gap-3">
              {request?.collection && (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                  {request?.collection?.replace("_", " ").toUpperCase()}
                </span>
              )}
            </div>
          </div>
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
            className={`${(loading) ? "cursor-wait" : ""} inline-flex items-center gap-3 bg-secd text-text hover:bg-brwn hover:text-prim px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-200 border border-white/20`}
            disabled={loading || itemApprovals.length == 0}
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