import React, { useState, useEffect, useRef } from "react";
import { Send, Plus, Pencil, X, Eye } from "lucide-react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import { useAdminRequest } from "../../../hooks/useAdminRequest";
import "./Forms.css";

const deepCopy = (data) => {
  const copyCategory = (list) =>  
    list.map((item) => ({
      ...item,
      file: item.file ?? null, // ✅ PRESERVE File
    }));

  return {
    student: copyCategory(data.student || []),
    faculty: copyCategory(data.faculty || []),
  };
};

const AdminForms = ({ theme, toggle }) => {
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const { sendRequest, loading: requestLoading, error } = useAdminRequest();

  const UrlParser = (path) => (path?.startsWith("http") ? path : `${BASE_URL}${path}`);

  // State variables
  const [activeCategory, setActiveCategory] = useState("student");
  const [tempData, setTempData] = useState({ student: [], faculty: [] });
  const [originalData, setOriginalData] = useState({ student: [], faculty: [] });
  const [pendingData, setPendingData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState({ student: new Set(), faculty: new Set() });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hadEditingChangesRef = React.useRef(false);

  // ---- file input ref for popup (Handbook-style)
  const fileInputRef = useRef(null);

  // Popup state
  const [popupData, setPopupData] = useState({
    type: "student",
    index: null,
    name: "",
    file: null,
    isEditing: false,
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setErrorMsg(null);

      try {
        const response = await axios.post(`/api/main-backend/exam`, {
          type: "all_forms",
        });

        const data = response?.data?.data;
        if (data) {
          const students = data?.find((item) => item.category === "student")?.content || [];
          const faculty = data?.find((item) => item.category === "faculty")?.content || [];

          const formattedStudentResources = students.map((item) => ({
            id: item.pdf_path || Date.now() + Math.random(),
            name: item.name,
            pdf_path: item.pdf_path,
            url: UrlParser(item.pdf_path),
          }));

          const formattedFacultyResources = faculty.map((item) => ({
            id: item.pdf_path || Date.now() + Math.random(),
            name: item.name,
            pdf_path: item.pdf_path,
            url: UrlParser(item.pdf_path),
          }));

          const newData = {
            student: formattedStudentResources,
            faculty: formattedFacultyResources,
          };

          setTempData(deepCopy(newData));
          setOriginalData(deepCopy(newData));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error?.response?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
          return;
        }
        setErrorMsg("Failed to load resources. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Online/Offline handling
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Handle view PDF
  const handleViewClick = (pdfObj) => {
    if (!pdfObj) return;
    const url = pdfObj.url?.startsWith("blob:") ? pdfObj.url : UrlParser(pdfObj.pdf_path);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Edit mode handlers
  const handleEdit = () => {
    setIsEditing(true);
    setIsSaved(false);
    setIsDirty(false);
    setSelectedRows({ student: new Set(), faculty: new Set() });
  };

  const handleSave = () => {
    if (editingChanges.length === 0) {
      toast.info("No changes to save!");
      return;
    }

    const allItems = [...tempData.student, ...tempData.faculty];
    const invalidItem = allItems.find((item) => !item.name?.trim());

    if (invalidItem) {
      toast.error("Please fill all resource names before saving!");
      return;
    }

    // ✅ KEEP FILES
    setPendingData(deepCopy(tempData));

    setIsSaved(true);
    setIsEditing(false);
    setIsDirty(false);
    setSelectedRows({ student: new Set(), faculty: new Set() });

  };

  const handleCancel = () => {
    if (pendingData) {
      setTempData(deepCopy(pendingData));
      toast.info("Cancelled changes. Draft preserved!");
    } else {
      setTempData(deepCopy(originalData));
      toast.info("Cancelled changes. Reverted to original!");
    }

    setIsEditing(false);
    setIsSaved(!!pendingData);
    setIsDirty(false);
    setSelectedRows({ student: new Set(), faculty: new Set() });
    setShowPopup(false);
  };

  const handleDiscard = () => {
    setTempData(deepCopy(originalData));
    setPendingData(null);
    setIsSaved(false);
    setIsDirty(false);
    setSelectedRows({ student: new Set(), faculty: new Set() });
    toast.info("Changes discarded!");
  };

  const normalizeDataAfterRequest = (data) => {
    const clean = (list) =>
      list.map((item) => ({
        id: item.id,
        name: item.name,
        pdf_path: item.pdf_path || "", // backend will fill later
        url: item.pdf_path ? UrlParser(item.pdf_path) : "",
        file: null,
      }));

    return {
      student: clean(data.student),
      faculty: clean(data.faculty),
    };
  };

  const handleRequest = () => setShowRequestModal(true);

  const buildPayload = () => {
    const changes = getChanges(pendingData);

    const resolvePdfPath = (currentItem, originalItem) => {
      if (currentItem?.file instanceof File) {
        return `/static/pdfs/all_forms/${currentItem.file.name}`;
      }
      if (originalItem?.pdf_path) {
        return originalItem.pdf_path;
      }
      return "";
    };

    return changes
      .map((change) => {
        const category = change.section?.toLowerCase().includes("faculty") ? "faculty" : "student";

        const currentItem = pendingData?.[category]?.find((i) => i.id === change.rowId) || null;

        const originalItem = originalData?.[category]?.find((i) => i.id === change.rowId) || null;

        const actionMap = {
          Added: "insert",
          Edited: "update",
          Deleted: "delete",
        };

        const basePayload = {
          collectionName: "exams",
          collection_type: "all_forms",
          action: actionMap[change.action],
          title: actionMap[change.action],
          category,
        };

        // 🟢 INSERT
        if (change.action === "Added" && currentItem) {
          return {
            ...basePayload,
            meta_data: {
              name: currentItem.name,
              pdf_path: resolvePdfPath(currentItem, null),
            },
          };
        }

        // 🟡 UPDATE
        if (change.action === "Edited" && currentItem && originalItem) {
          return {
            ...basePayload,
            original_data: {
              name: originalItem.name,
              pdf_path: originalItem.pdf_path,
            },
            meta_data: {
              name: currentItem.name,
              pdf_path: resolvePdfPath(currentItem, originalItem),
            },
          };
        }

        // 🔴 DELETE
        if (change.action === "Deleted" && originalItem) {
          return {
            ...basePayload,
            meta_data: {
              name: originalItem.name,
              pdf_path: originalItem.pdf_path,
            },
          };
        }

        // 🚫 SAFETY FALLBACK (prevents crash)
        return null;
      })
      .filter(Boolean);
  };

  const handleFinalRequestConfirm = async () => {
    if (!pendingData) {
      toast.error("No changes to submit");
      return;
    }

    const payload = buildPayload();
    if (payload.length === 0) {
      toast.info("No valid changes to submit");
      return;
    }

    const files = [];

    ["student", "faculty"].forEach((category) => {
      pendingData[category]?.forEach((item) => {
        if (item.file instanceof File) {
          files.push(item.file);
        }
      });
    });

    console.log("📦 payload", payload);
    console.log("📁 files", files);

    try {
      await sendRequest(payload, files);

     

      setOriginalData(deepCopy(pendingData));
      setTempData(deepCopy(pendingData));
      setPendingData(null);
      setIsSaved(false);
      setIsDirty(false);
      setShowRequestModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit request");
    }
  };

  // Row selection
  const toggleSelectRow = (category, index) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev[category]);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return { ...prev, [category]: newSet };
    });
  };

  // Delete handlers
  const confirmDelete = () => {
    const newTempData = { ...tempData };

    Object.keys(selectedRows).forEach((category) => {
      if (selectedRows[category].size > 0) {
        newTempData[category] = newTempData[category].filter((_, i) => !selectedRows[category].has(i));
      }
    });

    setTempData(newTempData);
    setSelectedRows({ student: new Set(), faculty: new Set() });
    setShowDeleteModal(false);
    setIsDirty(true);
  };

  // Popup handlers
  const handleAddNew = (type) => {
    setPopupData({
      type,
      index: null,
      name: "",
      file: null,
      isEditing: false,
    });
    setShowPopup(true);
  };

  const handleEditItem = (type, index) => {
    const item = tempData[type][index];
    setPopupData({
      type,
      index,
      name: item.name,
      file: null,
      isEditing: true,
    });
    setShowPopup(true);
  };

  // Get changes for request modal
  const getChanges = (sourceData) => {
    if (!sourceData) return [];

    const changes = [];

    const processCategory = (category) => {
      const originalMap = new Map(originalData[category].map((item) => [item.id, item]));
      const sourceMap = new Map(sourceData[category].map((item) => [item.id, item]));

      // Added / Edited
      for (const [id, newItem] of sourceMap.entries()) {
        const oldItem = originalMap.get(id);

        if (!oldItem) {
          changes.push({
            action: "Added",
            section: `${category.charAt(0).toUpperCase() + category.slice(1)} Resources`,
            changes: newItem.name,
            rowId: id,
          });
        } else if (oldItem.name !== newItem.name || oldItem.pdf_path !== newItem.pdf_path) {
          changes.push({
            action: "Edited",
            section: `${category.charAt(0).toUpperCase() + category.slice(1)} Resources`,
            changes: newItem.name,
            rowId: id,
          });
        }
      }

      // Deleted
      for (const [id, oldItem] of originalMap.entries()) {
        if (!sourceMap.has(id)) {
          changes.push({
            action: "Deleted",
            section: `${category.charAt(0).toUpperCase() + category.slice(1)} Resources`,
            changes: oldItem.name,
            rowId: id,
          });
        }
      }
    };

    processCategory("student");
    processCategory("faculty");

    return changes;
  };

  const editingChanges = getChanges(tempData); // Save button logic
  const changes = getChanges(pendingData); // Final Request logic

  useEffect(() => {
    if (!isEditing) {
      hadEditingChangesRef.current = false;
      return;
    }

    if (editingChanges.length > 0) {
      hadEditingChangesRef.current = true;
      return;
    }

    // User reverted all changes manually
    if (hadEditingChangesRef.current && editingChanges.length === 0) {
      setPendingData(null);
      setIsDirty(false);
      setIsSaved(false);
      // 🚫 DO NOT exit edit mode
    }
  }, [editingChanges, isEditing]);

  const revertChange = (rowId) => {
    if (!pendingData) return;

    const reverted = {
      student: [...pendingData.student],
      faculty: [...pendingData.faculty],
    };

    for (const category of ["student", "faculty"]) {
      const originalItem = originalData[category].find((i) => i.id === rowId);
      const pendingIndex = reverted[category].findIndex((i) => i.id === rowId);

      // 🟢 Added → remove it
      if (!originalItem && pendingIndex !== -1) {
        reverted[category].splice(pendingIndex, 1);
        break;
      }

      // 🟡 Edited → restore original
      if (originalItem && pendingIndex !== -1) {
        reverted[category][pendingIndex] = { ...originalItem };
        break;
      }

      // 🔴 Deleted → add back original
      if (originalItem && pendingIndex === -1) {
        reverted[category].push({ ...originalItem });
        break;
      }
    }

    // ✅ ONLY update pending data
    setPendingData(reverted);
  };

  // Render resource items
  const renderResourceItems = (resources, type) => (
    <div className="space-y-2">
      {resources.map((resource, index) => (
        <div key={resource.id} className="resource-item relative dark:bg-drkts font-[Poppins]">
          <div className="form-content dark:bg-drkts">
            <div className="form-regulation bg-[#f8f9fa] dark:bg-black flex justify-between items-center p-3 rounded-lg">
              <div className="w-[65%]">
                <p className="text-text dark:text-drkt break-words whitespace-normal sm:text-left text-center text-sm">
                  {resource.name || "Untitled Document"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      className="text-text bg-secd rounded-xl px-2 py-2 hover:bg-accn hover:text-prim transition-colors"
                      onClick={() => handleEditItem(type, index)}
                      aria-label={`Edit ${resource.name}`}
                    >
                      <Pencil size={18} />
                    </button>
                    <input
                      type="checkbox"
                      checked={selectedRows[type]?.has(index)}
                      onChange={() => toggleSelectRow(type, index)}
                      className="w-4 h-4 cursor-pointer"
                      aria-label={`Select ${resource.name} for deletion`}
                    />
                  </>
                ) : (
                  <button
                    className="form-button view-button px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
                    onClick={() => handleViewClick(resource)}
                    aria-label={`View ${resource.name}`}
                  >
                    <Eye size={18} className="mr-2" />
                    View
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {isEditing && (
        <button
          className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
          onClick={() => handleAddNew(type)}
          aria-label={`Add new ${type} resource`}
        >
          <Plus className="mr-2" size={16} /> Add New
        </button>
      )}
    </div>
  );

  // Handle offline state
  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt="You are offline" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt="Loading resources..." />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="h-screen flex items-center justify-center text-red-600 dark:text-red-400 font-semibold">
        {errorMsg}
      </div>
    );
  }

  const findPendingItemById = (rowId) => {
    for (const category of ["student", "faculty"]) {
      const item = pendingData?.[category]?.find((i) => i.id === rowId);
      if (item) return item;
    }
    return null;
  };

  const handleFinalView = (rowId) => {
    const item = findPendingItemById(rowId);
    if (!item) return;

    const url = item.url?.startsWith("blob:") ? item.url : UrlParser(item.pdf_path);

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      toast.error("File not available for preview");
    }
  };

  // View icon only when a PDF exists (either selected file or existing path)
  const handlePopupView = () => {
    const { type, index, file, isEditing } = popupData;

    let url = null;

    if (file) {
      url = URL.createObjectURL(file);
    } else if (isEditing && index !== null) {
      const item = tempData[type][index];
      if (item?.pdf_path || item?.url) {
        const maybe = item.url || item.pdf_path;
        url = maybe?.startsWith("blob:") ? maybe : UrlParser(item.pdf_path);
      }
    }

    if (url && url !== "#") {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      toast.info("No PDF available to preview");
    }
  };

  // handbook-style upload trigger and file change handler for popup
  const triggerPopupFileInput = () => fileInputRef.current?.click();

  const handlePopupFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (f.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      e.target.value = "";
      return;
    }

    setPopupData((prev) => ({ ...prev, file: f }));
  };

  // determine if popup has an existing pdf (for Replace/Upload label + Eye visibility)
  const popupHasExistingPdf = (() => {
    if (!popupData.isEditing || popupData.index === null) return false;
    const item = tempData?.[popupData.type]?.[popupData.index];
    return !!(item?.pdf_path || item?.url);
  })();

  const showPopupEye = !!(popupData.file || popupHasExistingPdf);

  // ---- NEW: detect changes inside Edit Resource modal to show/hide Save button
  const editModalHasChanges = (() => {
    if (!popupData.isEditing || popupData.index === null) return true; // "Add New" always shows Save
    const originalItem = tempData?.[popupData.type]?.[popupData.index];
    if (!originalItem) return true;

    const nameChanged = (popupData.name || "").trim() !== (originalItem.name || "").trim();
    const pdfChanged = popupData.file instanceof File; // only considered changed when user selected new file
    return nameChanged || pdfChanged;
  })();

  const handlePopupSubmit = () => {
    const { type, index, name, file, isEditing } = popupData;

    if (!name.trim()) {
      toast.error("Please enter a resource name");
      return;
    }

    if (!isEditing && !file) {
      toast.error("Please upload a PDF file");
      return;
    }

    // If editing and nothing changed, do nothing (and optionally inform)
    if (isEditing && !editModalHasChanges) {
      toast.info("No changes to save");
      return;
    }

    setTempData((prev) => {
      const updated = { ...prev };
      const isEdit = isEditing && index !== null;

      const newItem = {
        id: isEdit ? updated[type][index].id : Date.now() + Math.random(), // ✅ keep original id for edit
        name: name.trim(),
        pdf_path: file ? "" : updated[type][index]?.pdf_path || "",
        url: file ? URL.createObjectURL(file) : updated[type][index]?.url || "",
        file: file || null,
      };

      if (isEditing && index !== null) {
        updated[type][index] = { ...updated[type][index], ...newItem };
      } else {
        updated[type] = [...updated[type], newItem];
      }

      return updated;
    });

    setIsDirty(true);
    setShowPopup(false);
    setPopupData({ type: "student", index: null, name: "", file: null, isEditing: false });
  };

  return (
    <>
      <toastContainer position="bottom-right" autoClose={2000} />
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/examsbanner.webp"
        headerText="Downloads"
        subHeaderText="Streamlining processes with easy access to forms, empowering smooth academic and administrative workflows."
      />
      <ToastContainer position="bottom-right" autoClose={2000} />

      <div className="mt-10 px-4">
        {/* Header with Edit Button */}
        <div className="relative mb-6 w-full">
          <h1 className="text-accn dark:text-drkt text-4xl mb-4 font-bold text-center">Resources</h1>

          {!isEditing && (
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2  px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
              >
                <Pencil size={18} /> Edit
              </button>
            </div>
          )}
        </div>

        {/* Resource Sections */}
        <div className="flex flex-wrap justify-center gap-8 py-2 sm:py-4">
          {/* Student Resources */}
          <div className="tail student-tail dark:bg-black w-full md:w-1/2">
            <div className="tail-content flex flex-col h-full">
              <h2 className="font-[24px] font-bold mb-4 text-brwn dark:text-drkt">Student Resources</h2>
              <div className="flex-grow overflow-y-auto overflow-x-hidden pr-2 h-full dark:bg-drkts max-h-[400px]">
                {renderResourceItems(tempData.student, "student")}
              </div>
            </div>
          </div>

          {/* Faculty Resources */}
          <div className="tail faculty-tail dark:bg-black w-full md:w-1/2">
            <div className="tail-content flex flex-col h-full">
              <h2 className="font-bold mb-4 text-brwn dark:text-drkt">Faculty Resources</h2>
              <div className="download-links-container overflow-y-auto overflow-x-hidden dark:bg-drkts max-h-[400px]">
                {renderResourceItems(tempData.faculty, "faculty")}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <>
            {Object.values(selectedRows).some((set) => set.size > 0) && (
              <div className="flex justify-center pt-5">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 flex items-center gap-2 bg-red-500 text-prim rounded hover:bg-red-600"
                >
                  Delete Selected ({Object.values(selectedRows).reduce((sum, set) => sum + set.size, 0)})
                </button>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6 m-8">
              <button onClick={handleCancel} className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500">
                Cancel
              </button>
              {isEditing && editingChanges.length > 0 && (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
                >
                  Save
                </button>
              )}
            </div>
          </>
        )}

        {isSaved && (
          <div className="flex justify-end gap-3 mt-6 m-8">
            <button onClick={handleDiscard} className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500">
              Discard Changes
            </button>
            {changes.length > 0 && (
              <button
                onClick={handleRequest}
                className="flex items-center px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
              >
                <Send size={18} /> Request
              </button>
            )}
          </div>
        )}

        {/* Final Request Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[600px] max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Final Request</h2>
              <p className="text-sm text-red-500 mb-4 dark:text-red-400">
                Note: Your changes will stay pending until approved by the superior admin. Once approved will go on live.
              </p>
              {changes.length > 0 ? (
                <table className="w-full text-center text-sm border dark:border-gray-600">
                  <thead className="bg-gray-200 dark:bg-gray-700">
                    <tr>
                     <th className="border p-2">Action</th>
                    <th className="border p-2">Section</th>
                    <th className="border p-2">Changes</th>
                    <th className="border p-2">Undo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {changes.map((ch, i) => (
                      <tr key={i} className="dark:border-gray-600">
                        <td className="border dark:border-gray-600 p-2 text-blue-600 dark:text-blue-400">{ch.action}</td>
                        <td className="border dark:border-gray-600 p-2">{ch.section}</td>
                        <td className="border dark:border-gray-600 p-2">{ch.changes}</td>
                      

<td className="border dark:border-gray-600 p-2 text-center">
  <button
    onClick={() => revertChange(ch.rowId)}
    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
    title="Undo"
  >
    <X size={16} className="text-red-500" />
  </button>
</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No changes detected.</p>
              )}
              <div className="flex justify-end gap-2 mt-6">
                <button onClick={() => setShowRequestModal(false)} className="px-4 py-2 rounded bg-gray-400 text-prim">
                  Cancel
                </button>
                {changes.length > 0 && (
<button
  onClick={handleFinalRequestConfirm}
  disabled={requestLoading}
  className={`px-4 py-2 rounded flex items-center gap-2
    ${requestLoading 
      ? "bg-gray-400 cursor-not-allowed text-white" 
      : "bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
    }`}
>
  {requestLoading ? (
    <>
      <svg
        className="animate-spin h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      Submitting...
    </>
  ) : (
    "Final Request"
  )}
</button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border w-[90%] max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Confirm Delete</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete {Object.values(selectedRows).reduce((sum, set) => sum + set.size, 0)} selected
                resource(s)?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-prim rounded-lg hover:bg-red-700">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Resource Popup (UPDATED) */}
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[1000]">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-[420px]">
              <h2 className="text-lg text-brwn font-semibold mb-4 text-center dark:text-white">
                {popupData.isEditing ? "Edit Resource" : "Add New Resource"}
              </h2>

              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Enter Resource Name"
                  value={popupData.name}
                  onChange={(e) => setPopupData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full mb-3 p-2 border border-black rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  aria-label="Resource name"
                />
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={triggerPopupFileInput}
                    className="px-3 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500 flex items-center gap-2 whitespace-nowrap"
                    title={popupData.isEditing ? "Replace PDF" : "Upload PDF"}
                  >
                    {popupData.isEditing ? "Replace PDF" : "Upload PDF"}
                  </button>

                  {showPopupEye && (
                    <button
                      type="button"
                      onClick={handlePopupView}
                      className="h-10 w-10 flex items-center justify-center text-blue-400 dark:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      title="Preview PDF"
                    >
                      <Eye size={25} />
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handlePopupFileChange}
                    className="hidden"
                  />
                </div>

                {popupData.file && (
                  <p className="mt-2 text-[11px] text-green-600 justify-end dark:text-green-400 truncate">
                    ✓ {popupData.file.name}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowPopup(false);
                    setPopupData({ type: "student", index: null, name: "", file: null, isEditing: false });
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-black dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>

                {/* ✅ Save button only when: (Add mode) OR (Edit mode AND there are changes) */}
                {(!popupData.isEditing || editModalHasChanges) && (
                  <button
                    onClick={handlePopupSubmit}
                    className="px-4 py-2 bg-secd text-text rounded hover:bg-brwn hover:text-prim transition-colors"
                    disabled={!popupData.name.trim() || (!popupData.isEditing && !popupData.file)}
                  >
                    Save
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminForms;