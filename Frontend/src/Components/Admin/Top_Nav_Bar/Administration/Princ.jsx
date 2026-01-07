import React, { useEffect, useState, useRef } from 'react';
import Banner from '../../Banner';
import LoadComp from '../../LoadComp';
import axios from 'axios';
import { useNavigate } from "react-router";
import { MdUndo } from "react-icons/md";
import { Trash2 } from 'lucide-react'
import { FaBook, FaLinkedin, FaOrcid, FaResearchgate } from 'react-icons/fa';
import { FaGoogleScholar } from 'react-icons/fa6';
import { SiPublons } from 'react-icons/si';
import { useAdminRequest } from '../../../hooks/useAdminRequest';

const SOCIAL_LINKS_CONFIG = [
  { key: "linkedin", label: "LinkedIn", icon: FaLinkedin, backendKey: "LinkedIn Profile" },
  { key: "googlescholar", label: "Google Scholar", icon: FaGoogleScholar, backendKey: "Google Scholar Profile" },
  { key: "researchgate", label: "Research Gate", icon: FaResearchgate, backendKey: "Research Gate" },
  { key: "orchidprofile", label: "Orcid", icon: FaOrcid, backendKey: "Orcid Profile" },
  { key: "publonprofile", label: "Publons", icon: SiPublons, backendKey: "Publons Profile" },
  { key: "scopus", label: "Scopus", icon: FaBook, backendKey: "Scopus Author Profile" }
];

const AdminPrinc = ({ theme, toggle }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [editSessionData, setEditSessionData] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [requestStep, setRequestStep] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteKey, setPendingDeleteKey] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const navigate = useNavigate();
  const textareaRef = useRef();

  const { sendRequest, loading: loadings, error: reqError } = useAdminRequest();

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

  // helper map: local key -> backendKey
  const localToBackendKeyMap = SOCIAL_LINKS_CONFIG.reduce((acc, cur) => {
    acc[cur.key] = cur.backendKey;
    return acc;
  }, {});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.post('/api/main-backend/administration', {
          type: "principal"
        });
        const result = response.data.data;
        setData({
          ...result,
          social_links: backendToLocalLinks(result.social_links)
        });
        setEditedData({
          ...result,
          social_links: backendToLocalLinks(result.social_links)
        });
      } catch (err) {
        setError(err?.message || "Failed to load");
        if (err.response?.data?.status === 429) {
          navigate('/ratelimit', { state: { msg: err.response.data.message } });
        } else {
          console.error("Fetch error", err);
        }
      } finally {
        setLoading(false);
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

  const handleSave = () => {
    setRequestStep(true);
    setIsEditing(false);
    setPreviewImage(previewImage);
  };

  const getProfileIcon = (IconComponent, url) => {
    if (!url) return null;
    return <IconComponent size={20} />;
  };

  const handleConfirm = () => setShowConfirmModal(true);

  // Build payload entries according to changes (supports add, update, delete actions)
  const buildPayloadEntriesFromChanges = (oldData, newData) => {
    const entries = [];

    // Name change
    if ((oldData?.name || "") !== (newData?.name || "")) {
      entries.push({
        collectionName: "administration",
        collection_type: "principal",
        action: "update",
        title: "Update Principal Name",
        category: "administration",
        meta_data: { name: newData?.name || "" },
        original_data: { name: oldData?.name || "" }
      });
    }

    // Message change
    if ((oldData?.message || "") !== (newData?.message || "")) {
      entries.push({
        collectionName: "administration",
        collection_type: "principal",
        action: "update",
        title: "Update Principal Message",
        category: "administration",
        meta_data: { message: newData?.message || "" },
        original_data: { message: oldData?.message || "" }
      });
    }

    // Profile image change
    if (newData?.newImageFile) {
      // We send an update entry for the image. The file will be attached separately.
      entries.push({
        collectionName: "administration",
        collection_type: "principal",
        action: "update",
        title: "Update Principal Profile Image",
        category: "administration",
        meta_data: { image: newData?.newImageFile?.name || "" },
        original_data: { image: oldData?.image || oldData?.photo || oldData?.profile_image || "" }
      });
    }

    const oldLinksBackend = localToBackendLinks(oldData?.social_links || {});
    const newLinksBackend = localToBackendLinks(newData?.social_links || {});

    SOCIAL_LINKS_CONFIG.forEach(({ key, label, backendKey }) => {
      const oldVal = oldLinksBackend[backendKey] || "";
      const newVal = newLinksBackend[backendKey] || "";

      if (!oldVal && newVal) {
        // add
        const meta = { [backendKey]: newVal };
        entries.push({
          collectionName: "administration",
          collection_type: "principal",
          action: "add",
          title: `Add ${label} Link`,
          category: "administration",
          meta_data: meta,
          original_data: { [backendKey]: "" }
        });
      } else if (oldVal && !newVal) {
        // delete
        entries.push({
          collectionName: "administration",
          collection_type: "principal",
          action: "delete",
          title: `Delete ${label} Link`,
          category: "administration",
          meta_data: { [backendKey]: "" },
          original_data: { [backendKey]: oldVal }
        });
      } else if (oldVal && newVal && oldVal !== newVal) {
        // update
        entries.push({
          collectionName: "administration",
          collection_type: "principal",
          action: "update",
          title: `Update ${label} Link`,
          category: "administration",
          meta_data: { [backendKey]: newVal },
          original_data: { [backendKey]: oldVal }
        });
      }
    });

    return entries;
  };

  const handleRequest = async () => {
    try {
      const oldData = data || {};
      const newData = {
        ...editedData,
        social_links: editedData?.social_links || {}
      };

      const payloadEntries = buildPayloadEntriesFromChanges(oldData, newData);

      if (!payloadEntries.length) {
        setError("No changes detected to request.");  
        return;
      }

      // if there's a new image file, attach it
      const fileToSend = editedData?.newImageFile ? editedData.newImageFile : null;

      const result = await sendRequest(payloadEntries, fileToSend);

      if (result?.success) {
        setData({
          ...newData
        });
        setEditedData({
          ...newData
        });
        setRequestStep(false);
        setShowConfirmModal(false);
        setPreviewImage(null);
      } else {
        if (result?.status === 429 || result?.data?.status === 429) {
          navigate('/ratelimit', { state: { msg: result?.message || result?.data?.message || "Rate limit exceeded" }});
          return;
        }
        setError(result?.message || "Failed to send request");
      }
    } catch (err) {
      setError(err?.message || "Failed to send request");
    }
  };

  const handleCancelClick = () => {
    if (getSessionChanges().length > 0) {
      setShowCancelConfirm(true);
    } else {
      setIsEditing(false);
      setPreviewImage(null);
      setEditedData(requestStep ? editedData : data);
    }
  };

  const handleCancelConfirm = () => {
    setEditedData(editSessionData);
    setPreviewImage(null);
    setIsEditing(false);
    setShowCancelConfirm(false);
  };

  const handleDiscardConfirm = () => {
    setEditedData(data);
    setPreviewImage(null);
    setRequestStep(false);
    setShowDiscardConfirm(false);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedData(requestStep ? editedData : data);
    setEditSessionData(requestStep ? editedData : data);
    setPreviewImage(null);
  };

  const handleDeleteLink = (key) => {
    setPendingDeleteKey(key);
    setShowDeleteConfirm(true);
  };

  const handleConfirmedDelete = () => {
    if (!editedData || !pendingDeleteKey) return;
    const updatedLinks = { ...(editedData.social_links || {}) };
    updatedLinks[pendingDeleteKey] = "";
    setEditedData({ ...editedData, social_links: updatedLinks });
    setShowDeleteConfirm(false);
    setPendingDeleteKey(null);
  };

  const getRequestChanges = () => {
    if (!data || !editedData) return [];
    const changes = [];
    if (data.name !== editedData.name) {
      changes.push({
        action: "Edited",
        section: "Name",
        prevValue: data.name,
        newValue: editedData.name,
      });
    }
    if (data.message !== editedData.message) {
      changes.push({
        action: "Edited",
        section: "Message",
        prevValue: data.message,
        newValue: editedData.message,
      });
    }
    if (JSON.stringify(data.social_links || {}) !== JSON.stringify(editedData.social_links || {})) {
      changes.push({
        action: "Edited",
        section: "Social Links",
        prevValue: data.social_links || {},
        newValue: editedData.social_links || {},
      });
    }
    if (editedData?.newImageFile) {
      const prevImg = data?.image || data?.photo || data?.profile_image || null;
      changes.push({
        action: "Edited",
        section: "Profile Image",
        prevValue: prevImg,
        newValue: editedData.newImageFile,
      });
    }
    return changes;
  };

  const getSessionChanges = () => {
    if (!editSessionData || !editedData) return [];
    const changes = [];
    if (editSessionData.name !== editedData.name) {
      changes.push({
        action: "Edited",
        section: "Name",
        prevValue: editSessionData.name,
        newValue: editedData.name,
      });
    }
    if (editSessionData.message !== editedData.message) {
      changes.push({
        action: "Edited",
        section: "Message",
        prevValue: editSessionData.message,
        newValue: editedData.message,
      });
    }
    if (JSON.stringify(editSessionData.social_links || {}) !== JSON.stringify(editedData.social_links || {})) {
      changes.push({
        action: "Edited",
        section: "Social Links",
        prevValue: editSessionData.social_links || {},
        newValue: editedData.social_links || {},
      });
    }
    if (editedData?.newImageFile) {
      const prevImg = editSessionData?.image || editSessionData?.photo || editSessionData?.profile_image || null;
      changes.push({
        action: "Edited",
        section: "Profile Image",
        prevValue: prevImg,
        newValue: editedData.newImageFile,
      });
    }
    return changes;
  };

  const handleUndoChange = (change) => {
    if (!change || !editedData || !data) return;
    const { section, prevValue } = change;
    setEditedData((prev) => {
      const copy = { ...prev };
      switch (section) {
        case "Name":
          copy.name = prevValue;
          break;
        case "Message":
          copy.message = prevValue;
          break;
        case "Social Links":
          copy.social_links = prevValue || {};
          break;
        case "Profile Image":
          if (copy.newImageFile) {
            delete copy.newImageFile;
          }
          break;
        default:
          break;
      }
      return copy;
    });
    if (section === "Profile Image") {
      setPreviewImage(null);
    }
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editedData?.message, isEditing]);

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
          {/* Top-right Edit button */}
          {!isEditing && (
            <div className='flex justify-end top-0 right-0'>
            <button
              onClick={handleEditClick}
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
                src={previewImage || UrlParser("/static/images/principal_data/principal_photo.webp")}
                alt="Principal"
              />
              <div className='text-center w-full '>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData?.name || ""}
                    onChange={(e) =>
                      setEditedData({ ...editedData, name: e.target.value })
                    }
                    className="text-center border p-2 mt-2 w-full"
                  />
                ) : (
                  <span className="text-2xl font-semibold block font-poppins mt-2">
                    {editedData?.name}
                  </span>
                )}

                {/* Social Links as icons */}
                <div className="socialLinks flex flex-row gap-3 justify-center mt-4 text-xl">
                  {SOCIAL_LINKS_CONFIG.map(({ key, icon: IconComponent }) => {
                    const url = editedData?.social_links?.[key];
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
                  value={editedData?.message || ""}
                  onChange={(e) => {
                    setEditedData({ ...editedData, message: e.target.value });
                  }}
                  className="w-full border p-2 rounded-md"
                  rows={6}
                  style={{ minHeight: "120px", overflow: "hidden", resize: "none" }}
                />
              ) : (
                <q className="text-md font-[Poppins] lg:text-[16px] block">
                  {editedData?.message}
                </q>
              )}
            </div>
          </div>

          {/* BUTTON GROUP*/}
          {(isEditing || requestStep) && (
            <div className="flex justify-end top-0 right-0 gap-3">
              {isEditing && (
                <>
                  <button
                    onClick={handleCancelClick}
                    className="px-3 py-2 bg-gray-400 text-white rounded font-[poppins] hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  {getSessionChanges().length > 0 && (
                    <button
                      onClick={handleSave}
                      className="px-3 py-2 bg-yellow-400 text-black font-[poppins] rounded flex items-center gap-2 hover:bg-yellow-500"
                    >
                      Save
                    </button>
                  )}
                </>
              )}
              {!isEditing && requestStep && (
                <>
                  <button
                    onClick={() => setShowDiscardConfirm(true)}
                    className="px-3 py-2 bg-gray-400 text-white rounded font-[poppins] hover:bg-gray-500"
                  >
                    Discard All Changes
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="px-3 py-2 bg-yellow-400 text-black font-[poppins] rounded flex items-center gap-2 hover:bg-yellow-500"
                  >
                    Request
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Social Links Modal Edit Table */}
      {showModal && (
        <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/60">
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                          bg-white p-6 rounded-xl shadow-2xl min-w-[850px] max-w-[90%] max-h-[75vh]
                          overflow-y-auto border border-gray-200">

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
                {SOCIAL_LINKS_CONFIG.map(({ key, label, icon: IconComponent }) => {
                  const url = editedData?.social_links?.[key] || "";
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
                          onChange={(e) => {
                            setEditedData((prev) => ({
                              ...prev,
                              social_links: {
                                ...prev.social_links,
                                [key]: e.target.value
                              }
                            }));
                          }}
                          className="border px-2 py-1 w-full rounded focus:ring focus:ring-[#fdcc03]"
                        />
                      </td>
                      <td className="border px-4 w-20 text-center text-red-500 py-1">
                        <button
                          onClick={() => {
                            setEditedData((prev) => ({
                              ...prev,
                              social_links: {
                                ...prev.social_links,
                                [key]: ""
                              }
                            }));
                          }}
                          title="Delete"
                        >
                          {/* You may use <MdDelete size={20} /> if you want a delete icon from react-icons */}
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
      
      {/* Request Modal - CHANGES ALWAYS SHOW */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[450px]">
            <h2 className="text-lg font-bold mb-4">Final Request for the Changes</h2>
            <p className="text-red-600 mb-4">
              <span className="font-semibold">Note:</span> Your changes will stay pending until approved by the superior admin. Once approved, they will be applied automatically to the live site.
            </p>
            <table className="w-full border-collapse mb-6">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-2">Action</th>
                  <th className="pb-2">Section</th>
                  <th className="pb-2">Undo</th>
                </tr>
              </thead>
              <tbody>
                {getRequestChanges().length > 0 ? (
                  getRequestChanges().map((change, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2">{change.action}</td>
                      <td className="py-2">{change.section}</td>
                      <td className="py-2">
                        <button
                          onClick={() => handleUndoChange(change)}
                          className="px-3 py-1 bg-yellow-400 text-black rounded hover:bg-yellow-500 flex items-center gap-1"
                        >
                          <MdUndo /> Undo
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-gray-500">
                      No changes detected.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="flex justify-between">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-400 text-white font-[poppins] rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleRequest}
                className="px-4 py-2 bg-yellow-400 text-black rounded font-[poppins] flex items-center gap-2 hover:bg-yellow-500"
              >
                Final Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal (Edit Mode) */}
      {showCancelConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[400px]">
            <h2 className="text-lg font-bold mb-4">Cancel Changes?</h2>
            <p className="mb-4">Are you sure you want to discard your edits?</p>
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

      {/* Discard All Changes Confirmation Modal (Request Step) */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[400px]">
            <h2 className="text-lg font-bold mb-4">Discard All Changes?</h2>
            <p className="mb-4">Are you sure you want to discard all pending changes?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDiscardConfirm(false)}
                className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                No
              </button>
              <button
                onClick={handleDiscardConfirm}
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[400px]">
            <h2 className="text-lg font-bold mb-4">Delete Link?</h2>
            <p className="mb-4">Are you sure you want to delete this social link?</p>
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