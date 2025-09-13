import React, { useEffect, useState } from 'react';
import Banner from '../../../Banner';
import LoadComp from '../../../LoadComp';
import axios from 'axios';
import { useNavigate } from "react-router";
import { FaPaperPlane, FaBook, FaLinkedin, FaResearchgate } from 'react-icons/fa';
import { FaGoogleScholar } from 'react-icons/fa6';
import { MdDelete, MdUndo } from "react-icons/md";
import { Pencil } from 'lucide-react';

const AdminPrinc = ({ theme, toggle }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newLink, setNewLink] = useState({ name: "", url: "", icon: "FaBook" });
  const [previewImage, setPreviewImage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const navigate = useNavigate();

  const UrlParser = (path) => {
    if (!path) return path;
    if (path.startsWith("http")) return path;
    if (BASE_URL && path.startsWith("/")) return `${BASE_URL}${path}`;
    return path;
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.post('/api/main-backend/administration', {
          type: "principal"
        });
        const result = response.data.data;
        setData(result);
        setEditedData(result);
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

  // Save changes locally (before requesting)
  const handleSave = () => {
    setIsSaved(true);
    console.log("Changes saved locally.");
  };

  // Show confirmation modal before final request
  const handleConfirm = () => {
    setShowConfirmModal(true);
  };

  // Actually send data (after user reviews)
  const handleRequest = async () => {
    try {
      const formData = new FormData();
      formData.append("type", "principal");
      formData.append("data", JSON.stringify(editedData));
      if (editedData?.newImageFile) {
        formData.append("image", editedData.newImageFile);
      }
      await axios.put('/api/main-backend/administration', formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setData(editedData);
      setIsEditing(false);
      setShowConfirmModal(false);
      setIsSaved(false);
      setPreviewImage(null);
      console.log("Request submitted successfully.");
    } catch (err) {
      console.error("Error sending request", err);
      setError(err?.message || "Failed to send request");
    }
  };

  // Cancel with confirmation
  const handleCancelConfirm = () => {
  setEditedData(data);
  setPreviewImage(null);
  setIsEditing(false);
  setIsSaved(false);
  setShowCancelConfirm(false);
};

  const hasChanges = () => getChanges().length > 0;

  // Add new social link
  const handleAddLink = () => {
    if (!newLink.name || !newLink.url) {
      // simple guard. no alerts as requested.
      console.warn("Link name and url required");
      return;
    }
    setEditedData((prev) => ({
      ...prev,
      social_links: {
        ...(prev?.social_links || {}),
        [newLink.name]: { url: newLink.url, icon: newLink.icon },
      },
    }));
    setShowModal(false);
    setNewLink({ name: "", url: "", icon: "FaBook" });
  };

  // Delete social link
  const handleDeleteLink = (name) => {
    if (!editedData) return;
    const updatedLinks = { ...(editedData.social_links || {}) };
    delete updatedLinks[name];
    setEditedData({ ...editedData, social_links: updatedLinks });
  };

  // Render correct icon
  const renderIcon = (name, iconKey) => {
    if (iconKey) {
      switch (iconKey) {
        case "FaLinkedin": return <FaLinkedin />;
        case "FaGoogleScholar": return <FaGoogleScholar />;
        case "FaResearchgate": return <FaResearchgate />;
        case "FaBook": return <FaBook />;
        default: return <FaBook />;
      }
    }
    if (name.includes("LinkedIn")) return <FaLinkedin />;
    if (name.includes("Google Scholar")) return <FaGoogleScholar />;
    if (name.includes("Research")) return <FaResearchgate />;
    if (name.includes("Scopus")) return <FaBook />;
    return <FaBook />;
  };

  // Change detection with previous values for undo
  const getChanges = () => {
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
      // try common image key names from backend, else null
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

  // Undo a specific change by restoring prevValue
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
          // remove any staged new file
          if (copy.newImageFile) {
            delete copy.newImageFile;
          }
          break;
        default:
          break;
      }
      return copy;
    });

    // preview behavior for image undo
    if (section === "Profile Image") {
      // clear preview so img falls back to the original path (if any)
      setPreviewImage(null);
    }

    // If all changes are undone, reset saved flag
    setTimeout(() => {
      const remaining = getChanges();
      if (remaining.length === 0) {
        setIsSaved(false);
      }
    }, 0);
  };

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
          {/* 🔹 Edit/Cancel */}
          {!isEditing ? (
            <button
              onClick={() => {
                setIsEditing(true);
                setEditedData(data);
              }}
              className="px-3 py-2 absolute top-0 right-0 bg-yellow-400  p-2 rounded shadow-md hover:bg-yellow-500"
            >
              Edit
            </button>
          ) : (
            <button
              onClick={() => {
                if (hasChanges()) {
                  setShowCancelConfirm(true); // ask confirmation only if changed
                } else {
                  // no changes → just exit editing
                  setIsEditing(false);
                  setPreviewImage(null);
                  setIsSaved(false);
                  setEditedData(data);
                }
              }}
              className="px-3xx py-2 absolute top-0 right-0 bg-brwn text-white font-poppi p-2 rounded shadow-md hover:bg-gray-600"
            >
              Cancel
            </button>
          )}

          {/* 🔹 Content */}
          <div className="flex flex-col md:flex md:justify-center lg:flex-row-reverse items-center lg:items-start">
            <div className="lg:max-w-sm lg:ml-6 flex-shrink-0 mx-auto py-8 relative">
              <img
                className="h-[25vh] lg:h-[45vh] w-auto rounded-xl object-cover"
                src={previewImage || UrlParser("/static/images/principal_data/principal_photo.webp")}
                alt="Principal"
              />
              <div className='text-center w-full '>
                {isEditing && (
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-3 border"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setPreviewImage(URL.createObjectURL(file));
                        setEditedData((prev) => ({ ...prev, newImageFile: file }));
                      }
                    }}
                  />
                )}
              </div>
              <div className="text-center">
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

                {/* Social Links */}
                <div className="socialLinks flex flex-row gap-3 justify-center mt-4 text-xl">
                  {Object.entries(editedData?.social_links || {}).map(([key, val], idx) => {
                    const url = typeof val === "string" ? val : val.url;
                    const iconKey = typeof val === "string" ? null : val.icon;
                    return (
                      <div key={idx} className="flex items-center gap-1">
                        <a
                          href={url}
                          className="text-accn dark:text-drka hover:text-secd dark:hover:text-drks"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {renderIcon(key, iconKey)}
                        </a>
                        {isEditing && (
                          <button
                            onClick={() => handleDeleteLink(key)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdDelete />
                          </button>
                        )}
                      </div>
                    );
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

            {/* Text */}
            <div className="text-justify leading-relaxed max-w-[95%] lg:max-w-[60%] mx-auto">
              <p className="princ-tex text-lg lg:text-[24px] font-[poppins] font-bold mb-3 mt-2 text-brwn dark:text-prim inline-block border-b-2 border-[#FDCC03] dark:border-drks pb-1">
                From the Principal's Desk
              </p>
              {isEditing ? (
                <textarea
                  value={editedData?.message || ""}
                  onChange={(e) =>
                    setEditedData({ ...editedData, message: e.target.value })
                  }
                  className="w-full border p-2 rounded-md"
                  rows={6}
                />
              ) : (
                <q className="text-md font-[Poppins] lg:text-[16px] block">
                  {data?.message}
                </q>
              )}
            </div>
          </div>

          {/* 🔹 Save & Request flow */}
          {isEditing && (
            <div className="flex justify-end mt-4 gap-3">
              {!isSaved ? (
                <button
                  onClick={handleSave}
                  className="px-3 py-2 bg-yellow-400 text-black font-[poppins] rounded flex items-center gap-2 hover:bg-yellow-500"
                >
                  Save
                </button>
              ) : (
                getChanges().length > 0 && (
                  <button
                    onClick={handleConfirm}
                    className="px-3 py-2 bg-yellow-400 text-black font-[poppins] rounded flex items-center gap-2 hover:bg-yellow-500"
                  >
                    <FaPaperPlane /> Request
                  </button>
                )
              )}
            </div>
          )}
        </div>
      )}

      {/* 🔹 Modal for Social Links */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[400px]">
            <h2 className="text-lg font-bold mb-4">Add Social Links</h2>
            <input
              type="text"
              placeholder="Link Name"
              value={newLink.name}
              onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
              className="w-full mb-3 p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Link URL"
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              className="w-full mb-3 p-2 border rounded"
            />
            <select
              value={newLink.icon}
              onChange={(e) => setNewLink({ ...newLink, icon: e.target.value })}
              className="w-full mb-3 p-2 border rounded"
            >
              <option value="FaLinkedin">LinkedIn</option>
              <option value="FaGoogleScholar">Google Scholar</option>
              <option value="FaResearchgate">ResearchGate</option>
              <option value="FaBook">Scopus/Other</option>
            </select>
            <div className="flex justify-end gap-2 font-[poppins]">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 bg-brwn text-white rounded hover:bg-amber-900"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLink}
                className="px-3 py-1 bg-secd text-black  rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Confirm Changes Modal */}
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
                {getChanges().length > 0 ? (
                  getChanges().map((change, idx) => (
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
                <FaPaperPlane /> Final Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[400px]">
            <h2 className="text-lg font-bold mb-4">Cancel Changes?</h2>
            <p className="mb-4">Are you sure you want to discard all changes?</p>
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
    </>
  );
};

export default AdminPrinc;
