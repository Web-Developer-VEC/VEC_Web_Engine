import React, { useEffect, useState, useRef } from "react";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import axios from "axios";
import { useNavigate } from "react-router";
import { MdUndo } from "react-icons/md";
import { PartyPopper, Trash2 } from "lucide-react";
import { FaBook, FaLinkedin, FaOrcid, FaResearchgate } from "react-icons/fa";
import { FaGoogleScholar } from "react-icons/fa6";
import { SiPublons } from "react-icons/si";
import { useAdminRequest } from "../../../hooks/useAdminRequest";
import { X } from "lucide-react";

const SOCIAL_LINKS_CONFIG = [
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: FaLinkedin,
    backendKey: "LinkedIn Profile",
  },
  {
    key: "googlescholar",
    label: "Google Scholar",
    icon: FaGoogleScholar,
    backendKey: "Google Scholar Profile",
  },
  {
    key: "researchgate",
    label: "Research Gate",
    icon: FaResearchgate,
    backendKey: "Research Gate",
  },
  {
    key: "orchidprofile",
    label: "Orcid",
    icon: FaOrcid,
    backendKey: "Orcid Profile",
  },
  {
    key: "publonprofile",
    label: "Publons",
    icon: SiPublons,
    backendKey: "Publons Profile",
  },
  {
    key: "scopus",
    label: "Scopus",
    icon: FaBook,
    backendKey: "Scopus Author Profile",
  },
];

const AdminPrinc = ({ theme, toggle }) => {
  const [data, setData] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Workflow states
  const [isEditing, setIsEditing] = useState(false);
  const [isSavedOnce, setIsSavedOnce] = useState(false);

  // Data states
  const [editableData, setEditableData] = useState(null);
  const [sessionChanges, setSessionChanges] = useState([]);
  const [allChanges, setAllChanges] = useState([]);

  // UI states
  const [previewImage, setPreviewImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteKey, setPendingDeleteKey] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const navigate = useNavigate();
  const textareaRef = useRef();

  const { sendRequest, loading: loadings } = useAdminRequest();

  // References for original and saved data
  const originalDataRef = useRef(null);
  const savedDataRef = useRef(null);

  const UrlParser = (path) => {
    if (!path) return path;
    if (path.startsWith("http")) return path;
    if (BASE_URL && path.startsWith("/")) return `${BASE_URL}${path}`;
    return path;
  };

  function backendToLocalLinks(backendLinks) {
    const out = {};
    SOCIAL_LINKS_CONFIG.forEach(({ key, backendKey }) => {
      out[key] = backendLinks?.[backendKey] || "";
    });
    return out;
  }

  function localToBackendLinks(localLinks) {
    const out = {};
    SOCIAL_LINKS_CONFIG.forEach(({ key, backendKey }) => {
      out[backendKey] = localLinks?.[key] || "";
    });
    return out;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("/api/main-backend/administration", {
          type: "principal",
        });
        const result = response.data.data;

        const formattedData = {
          ...result,
          social_links: backendToLocalLinks(result.social_links),
        };

        setData(formattedData);
        setEditableData(formattedData);
        originalDataRef.current = JSON.parse(JSON.stringify(formattedData));
        savedDataRef.current = JSON.parse(JSON.stringify(formattedData));
      } catch (err) {
        if (err.response?.data?.status === 429) {
          navigate("/ratelimit", { state: { msg: err.response.data.message } });
        } else {
          console.error("Fetch error", err);
        }
      }
    };
    fetchData();
  }, [navigate]);

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

  const getProfileIcon = (IconComponent, url) => {
    if (!url) return null;
    return <IconComponent size={20} />;
  };

  // Handle field changes
  const handleFieldChange = (field, value) => {
    if (!editableData) return;

    const oldValue = editableData[field];

    setEditableData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Track changes in session
    setSessionChanges((prev) => {
      // Check if this field already has a change recorded
      const existingIndex = prev.findIndex((c) => c.field === field);

      if (existingIndex >= 0) {
        // Update existing change
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          newValue: value,
          data: { ...editableData, [field]: value },
        };
        return updated;
      } else {
        // Add new change
        return [
          ...prev,
          {
            field,
            oldValue,
            newValue: value,
            data: { ...editableData, [field]: value },
          },
        ];
      }
    });
  };

  // Handle social link changes
  const handleSocialLinkChange = (key, value) => {
    if (!editableData) return;

    const oldLinks = { ...(editableData.social_links || {}) };
    const oldValue = oldLinks[key];

    setEditableData((prev) => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [key]: value,
      },
    }));

    setSessionChanges((prev) => {
      const field = `social_links.${key}`;
      const existingIndex = prev.findIndex((c) => c.field === field);

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          newValue: value,
          data: {
            ...editableData,
            social_links: { ...editableData.social_links, [key]: value },
          },
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            field,
            key,
            oldValue,
            newValue: value,
            data: {
              ...editableData,
              social_links: { ...editableData.social_links, [key]: value },
            },
          },
        ];
      }
    });
  };

  // Handle image change
  const handleImageChange = (file) => {
    if (!editableData) return;

    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);

    setEditableData((prev) => ({
      ...prev,
      newImageFile: file,
      image_path: imageUrl,
    }));

    setSessionChanges((prev) => {
      const existingIndex = prev.findIndex((c) => c.field === "image");

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          field: "image",
          oldValue:
            data?.image_path ||
            data?.image ||
            data?.photo ||
            data?.profile_image,
          newValue: file,
          data: { ...editableData, newImageFile: file, image_path: imageUrl },
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            field: "image",
            oldValue:
              data?.image_path ||
              data?.image ||
              data?.photo ||
              data?.profile_image,
            newValue: file,
            data: { ...editableData, newImageFile: file, image_path: imageUrl },
          },
        ];
      }
    });
  };

  // Handle delete social link
  const handleDeleteLink = (key) => {
    setPendingDeleteKey(key);
    setShowDeleteConfirm(true);
  };

  const handleConfirmedDelete = () => {
    if (!editableData || !pendingDeleteKey) return;

    const oldValue = editableData.social_links?.[pendingDeleteKey];

    const updatedLinks = { ...(editableData.social_links || {}) };
    updatedLinks[pendingDeleteKey] = "";

    setEditableData({ ...editableData, social_links: updatedLinks });

    setSessionChanges((prev) => {
      const field = `social_links.${pendingDeleteKey}`;
      const existingIndex = prev.findIndex((c) => c.field === field);

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          newValue: "",
          data: { ...editableData, social_links: updatedLinks },
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            field,
            key: pendingDeleteKey,
            oldValue,
            newValue: "",
            data: { ...editableData, social_links: updatedLinks },
          },
        ];
      }
    });

    setShowDeleteConfirm(false);
    setPendingDeleteKey(null);
  };

  // Save changes (move from session to allChanges but stay in edit mode)
  // Save changes (move from session to allChanges but stay in edit mode)
  const handleSave = () => {
    if (sessionChanges.length === 0) {
      return;
    }

    // Validate required fields
    if (!editableData?.name?.trim()) {
      alert("Name is required");
      return;
    }

    // Update savedDataRef with current editableData
    savedDataRef.current = JSON.parse(JSON.stringify(editableData));

    // Move session changes to allChanges
    setAllChanges((prev) => [...prev, ...sessionChanges]);

    // Clear session changes
    setSessionChanges([]);

    // Mark as saved once
    setIsSavedOnce(true);

    // EXIT edit mode
    setIsEditing(false);
  };
  // Cancel current session changes only
  const handleCancelSession = () => {
    if (sessionChanges.length > 0) {
      setShowCancelConfirm(true);
    } else {
      // No changes to cancel, just exit edit mode
      setIsEditing(false);
      setPreviewImage(null);
    }
  };

  const handleCancelConfirm = () => {
    // Revert to savedDataRef (last saved state)
    setEditableData(JSON.parse(JSON.stringify(savedDataRef.current)));
    setPreviewImage(null);
    setSessionChanges([]);
    setIsEditing(false);
    setShowCancelConfirm(false);
  };

  // Discard all changes (reset to original)
  const handleDiscardAll = () => {
    setEditableData(JSON.parse(JSON.stringify(originalDataRef.current)));
    savedDataRef.current = JSON.parse(JSON.stringify(originalDataRef.current));
    setSessionChanges([]);
    setAllChanges([]);
    setIsEditing(false);
    setIsSavedOnce(false);
    setPreviewImage(null);
    setShowDiscardConfirm(false);
  };

  // Open request modal
  const handleRequest = () => {
    if (allChanges.length === 0) {
      return;
    }
    setShowRequestModal(true);
  };

  // Undo a specific change in request modal
  const handleUndoChange = (changeToUndo) => {
    // Remove this change from allChanges
    const newAllChanges = allChanges.filter((c) => c !== changeToUndo);

    // Reconstruct savedDataRef from remaining changes
    let reconstructedData = JSON.parse(JSON.stringify(originalDataRef.current));

    newAllChanges.forEach((change) => {
      if (
        change.field === "name" ||
        change.field === "message" ||
        change.field === "qualification"
      ) {
        reconstructedData[change.field] = change.newValue;
      } else if (change.field.startsWith("social_links.")) {
        const key = change.key;
        if (!reconstructedData.social_links)
          reconstructedData.social_links = {};
        reconstructedData.social_links[key] = change.newValue;
      } else if (change.field === "image") {
        // Handle image - but we can't reconstruct the file object
        // This would need special handling
      }
    });

    setAllChanges(newAllChanges);
    savedDataRef.current = reconstructedData;
    setEditableData(reconstructedData);

    // If no changes left, exit saved state
    if (newAllChanges.length === 0) {
      setIsSavedOnce(false);
      setShowRequestModal(false);
    }
  };

  // Handle final request
  const handleFinalRequest = async () => {
    try {
      const oldData = originalDataRef.current || {};
      const newData = editableData || {};

      const payloadEntries = buildPayloadEntriesFromChanges(oldData, newData);
     console.log(payloadEntries);
     
      const fileToSend = editableData?.newImageFile || null;

      const result = await sendRequest(payloadEntries, fileToSend);

      if (result?.success) {
        // Update all refs with current data
        const currentData = JSON.parse(JSON.stringify(editableData));
        setData(currentData);
        originalDataRef.current = currentData;
        savedDataRef.current = currentData;

        // Clear all changes
        setAllChanges([]);
        setSessionChanges([]);
        setIsSavedOnce(false);
        setShowRequestModal(false);
        setPreviewImage(null);

        // Exit edit mode
        setIsEditing(false);
      } else {
        if (result?.status === 429 || result?.data?.status === 429) {
          navigate("/ratelimit", {
            state: {
              msg:
                result?.message ||
                result?.data?.message ||
                "Rate limit exceeded",
            },
          });
        }
      }
    } catch (err) {
      console.error("Request failed:", err);
    }
  };

  // Build payload (your existing function - unchanged)
  const buildPayloadEntriesFromChanges = (oldData, newData) => {
    const payloadEntries = [];

    const oldLinks = localToBackendLinks(oldData?.social_links || {});
    const newLinks = localToBackendLinks(newData?.social_links || {});

    const imagePath = newData?.newImageFile
      ? `/static/images/principal_data/${newData.newImageFile.name}`
      : oldData?.image_path || oldData?.image || "";

    const payload = {
      collectionName: "administration",
      collection_type: "principal",
      action: "update",
      title: "update principal",
      meta_data: {
        name: newData?.name || "",
        qualification: newData?.qualification || oldData?.qualification || "",
        message: newData?.message || "",
        image_path: imagePath,
        social_links: newLinks,
      },
      original_data: {
        name: oldData?.name || "",
        qualification: oldData?.qualification || "",
        message: oldData?.message || "",
        image_path:
          oldData?.image_path ||
          oldData?.image ||
          oldData?.photo ||
          oldData?.profile_image ||
          "",
        social_links: oldLinks,
      },
    };

      console.log("sathish kuamr ",payload);

    if (
      JSON.stringify(payload.meta_data) !==
      JSON.stringify(payload.original_data)
    ) {
      payloadEntries.push(payload);
    }

    return payloadEntries;
  };


  // Get changes for display in request modal
  const getDisplayChanges = () => {
    return allChanges
      .map((change) => {
        if (change.field === "name") {
          return {
            action: "Edited",
            section: "Name",
            details: `Name updated`,
            original: change,
          };
        } else if (change.field === "message") {
          return {
            action: "Edited",
            section: "Message",
            details: `Message updated`,
            original: change,
          };
        } else if (change.field === "qualification") {
          return {
            action: "Edited",
            section: "Qualification",
            details: `Qualification updated`,
            original: change,
          };
        } else if (change.field.startsWith("social_links.")) {
          const config = SOCIAL_LINKS_CONFIG.find((c) => c.key === change.key);
          return {
            action: "Edited",
            section: `${config?.label || change.key} Link`,
            details: "Social link updated",
            original: change,
          };
        } else if (change.field === "image") {
          return {
            action: "Edited",
            section: "Profile Image",
            details: "Image replaced",
            original: change,
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editableData?.message, isEditing]);

  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
  }

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/administrationbanner.webp"
        headerText="Principal's Desk"
        subHeaderText="Leading with vision and commitment to excellence in education and innovation."
      />

      {!data ? (
        <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
          <LoadComp txt={""} />
        </div>
      ) : (
        <div className="relative max-w-[90%] mx-auto my-8 px-4 pb-15">
          {/* Top-right Edit button - shown only when not editing */}
          {!isEditing && (
            <div className="flex justify-end top-0 right-0">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setEditableData(savedDataRef.current);
                  setPreviewImage(null);
                }}
                className="px-3 py-2 bg-yellow-400 p-2 rounded shadow-md hover:bg-yellow-500"
              >
                Edit
              </button>
            </div>
          )}

          {/* Content */}
          <div className="flex flex-col md:flex md:justify-center lg:flex-row-reverse items-center lg:items-start">
            <div className="lg:max-w-sm lg:ml-6 flex-shrink-0 mx-auto py-8 relative">
              <img
                className="h-[25vh] lg:h-[45vh] w-auto rounded-xl object-cover"
                src={UrlParser(
                  editableData?.image_path ||
                    editableData?.image ||
                    editableData?.photo,
                )}
                alt="Principal"
              />
              <div className="text-center w-full">
                {isEditing && (
                  <>
                    <button
                      className="bg-secd hover:bg-brwn text-text hover:text-prim my-2 px-2 py-2 rounded"
                      onClick={() =>
                        document.getElementById("imageInput").click()
                      }
                    >
                      Replace image
                    </button>
                    <input
                      id="imageInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleImageChange(e.target.files[0]);
                        }
                      }}
                    />
                  </>
                )}

                {isEditing ? (
                  <input
                    type="text"
                    value={editableData?.name || ""}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    className="text-center border p-2 mt-2 w-full"
                  />
                ) : (
                  <span className="text-2xl font-semibold block font-poppins mt-2">
                    {editableData?.name}
                  </span>
                )}

                {/* Social Links as icons */}
                <div className="socialLinks flex flex-row gap-3 justify-center mt-4 text-xl">
                  {SOCIAL_LINKS_CONFIG.map(({ key, icon: IconComponent }) => {
                    const url = editableData?.social_links?.[key];
                    if (url) {
                      return (
                        <a
                          key={key}
                          href={url}
                          className="text-accn dark:text-drka hover:text-secd dark:hover:text-drks"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <IconComponent size={20} />
                        </a>
                      );
                    }
                    return null;
                  })}
                </div>

                {isEditing && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="mt-3 px-3 py-1 bg-brwn text-white font-[poppins] rounded-lg"
                  >
                    + Add/Edit Links
                  </button>
                )}
              </div>
            </div>

            <div className="text-justify leading-relaxed max-w-[95%] lg:max-w-[60%] mx-auto">
              <p className="princ-tex text-lg lg:text-[24px] font-[poppins] font-bold mb-3 mt-2 text-brwn dark:text-prim inline-block border-b-2 border-[#FDCC03] dark:border-drks pb-1">
                From the Principal's Desk
              </p>
              {isEditing ? (
                <textarea
                  ref={textareaRef}
                  value={editableData?.message || ""}
                  onChange={(e) => handleFieldChange("message", e.target.value)}
                  className="w-full border p-2 rounded-md"
                  rows={6}
                  style={{
                    minHeight: "120px",
                    overflow: "hidden",
                    resize: "none",
                  }}
                />
              ) : (
                <q className="text-md font-[Poppins] lg:text-[16px] block">
                  {editableData?.message}
                </q>
              )}
            </div>
          </div>

          {/* BUTTON GROUP - EDIT MODE */}
          {/* BUTTON GROUP - EDIT MODE */}
          {isEditing && (
            <div className="flex justify-end top-0 right-0 gap-3 mt-4">
              <button
                onClick={handleCancelSession}
                className="px-3 py-2 bg-gray-400 text-white rounded font-[poppins] hover:bg-gray-500"
              >
                Cancel
              </button>
              {/* Save button only shows when there are session changes */}
              {sessionChanges.length > 0 && (
                <button
                  onClick={handleSave}
                  className="px-3 py-2 bg-yellow-400 text-black font-[poppins] rounded flex items-center gap-2 hover:bg-yellow-500"
                >
                  Save
                </button>
              )}
            </div>
          )}

          {/* BUTTON GROUP - SAVED STATE (not editing but has saved changes) */}

          {/* BUTTON GROUP - SAVED STATE (not editing but has saved changes) */}
          {!isEditing && isSavedOnce && (
            <div className="flex justify-end top-0 right-0 gap-3 mt-4">
              <button
                onClick={() => setShowDiscardConfirm(true)}
                className="px-3 py-2 bg-gray-400 text-white rounded font-[poppins] hover:bg-gray-500"
              >
                Discard All
              </button>
              <button
                onClick={handleRequest}
                className="px-3 py-2 bg-yellow-400 text-black font-[poppins] rounded flex items-center gap-2 hover:bg-yellow-500"
              >
                Request
              </button>
            </div>
          )}
        </div>
      )}

      {/* Social Links Modal Edit Table */}
      {showModal && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60">
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                          bg-white p-6 rounded-xl shadow-2xl min-w-[850px] max-w-[90%] max-h-[75vh]
                          overflow-y-auto border border-gray-200"
          >
            <h2 className="text-xl font-bold mb-4 text-center text-[#800000]">
              Add / Edit links
            </h2>

            <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">Profile</th>
                  <th className="border px-2 text-left py-1">Link</th>
                  <th className="border px-2 text-left py-1">Delete</th>
                </tr>
              </thead>
              <tbody>
                {SOCIAL_LINKS_CONFIG.map(
                  ({ key, label, icon: IconComponent }) => {
                    const url = editableData?.social_links?.[key] || "";
                    return (
                      <tr key={key}>
                        <td className="border px-2 font-medium py-1 flex items-center gap-2">
                          {getProfileIcon(IconComponent, url)}
                          <span>{label}</span>
                        </td>
                        <td className="border px-2 py-1">
                          <input
                            type="text"
                            value={url}
                            onChange={(e) =>
                              handleSocialLinkChange(key, e.target.value)
                            }
                            className="border px-2 py-1 w-full rounded focus:ring focus:ring-[#fdcc03]"
                          />
                        </td>
                        <td className="border px-4 w-20 text-center text-red-500 py-1">
                          <button
                            onClick={() => handleDeleteLink(key)}
                            title="Delete"
                          >
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 flex items-center gap-2 bg-[#fdcc03] text-text rounded-lg hover:bg-[#800000] hover:text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[600px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Final Request for the Changes
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the
              superior admin. Once approved, they will be applied automatically
              to the live site.
            </p>

            <div className="max-h-[300px] overflow-y-auto mb-4">
              {getDisplayChanges().length > 0 ? (
                <table className="w-full text-left text-text dark:text-drkt border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-3 border">Action</th>
                      <th className="py-2 px-3 border">Section</th>
                      <th className="py-2 px-3 border">Changes</th>
                      <th className="py-2 px-3 border">Undo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getDisplayChanges().map((c, i) => (
                      <tr key={i} className="even:bg-white odd:bg-gray-50">
                        <td className="py-2 px-3 border">
                          <span className="text-blue-600">✎ Edited</span>
                        </td>
                        <td className="py-2 px-3 border">{c.section}</td>
                        <td className="py-2 px-3 border">{c.details}</td>
                        <td className="py-2 px-3 border text-center">
                          <button
                            onClick={() => handleUndoChange(c.original)}
                            className="text-red-500 font-bold hover:text-red-700"
                            title="Undo"
                          >
                            <X size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-400 text-center py-4">
                  No changes found.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRequestModal(false)}
                className={`px-4 py-2 rounded bg-gray-400 text-white ${loadings ? "cursor-not-allowed" : ""}`}
                disabled={loadings}
              >
                Cancel
              </button>
              <button
                onClick={handleFinalRequest}
                className={`px-4 py-2 rounded bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt ${loadings ? "cursor-progress" : "hover:bg-[#800000]"}`}
                disabled={loadings}
              >
                {loadings ? "Processing..." : "Final Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Session Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[400px]">
            <h2 className="text-lg font-bold mb-4">Cancel Changes?</h2>
            <p className="mb-4">
              Are you sure you want to discard your current session changes?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                No
              </button>
              <button
                onClick={handleCancelConfirm}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Yes, Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discard All Changes Confirmation Modal */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[400px]">
            <h2 className="text-lg font-bold mb-4">Discard All Changes?</h2>
            <p className="mb-4">
              Are you sure you want to discard all saved changes? This cannot be
              undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDiscardConfirm(false)}
                className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                No
              </button>
              <button
                onClick={handleDiscardAll}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Yes, Discard All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Social Link Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[2147483647]">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[400px]">
            <h2 className="text-lg font-bold mb-4">Delete Link?</h2>
            <p className="mb-4">
              Are you sure you want to delete this social link?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                No
              </button>
              <button
                onClick={handleConfirmedDelete}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPrinc;
