import React, { useEffect, useState } from "react";
import "./Regulation.css";
import axios from "axios";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router";
import { Plus, Send, Pencil, Eye, X } from "lucide-react";

const AdminREGULATION = ({ theme, toggle }) => {
  const [regulationData, setRegulationData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [initialData, setInitialData] = useState([]); // 🔑 first baseline
  const [sessionBackup, setSessionBackup] = useState([]); // 🔑 snapshot for current edit session
  const [hasChanges, setHasChanges] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setLoading] = useState(true);
  const [deletedRegs, setDeletedRegs] = useState([]);

  // UI states
  const [isEditing, setIsEditing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Popup states
  const [showPopup, setShowPopup] = useState(false);
  const [newYear, setNewYear] = useState("");
  const [newLinks, setNewLinks] = useState([
    { name: "UG - B.E / B.Tech", pdf_path: "" },
    { name: "PG - ME", pdf_path: "" },
    { name: "PG - MBA", pdf_path: "" },
  ]);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  // Checkbox delete states
  const [selectedRegs, setSelectedRegs] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Request modal states
  const [showRequestModal, setShowRequestModal] = useState(false);

  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    if (!path) return "";
    if (path.startsWith("http") || path.startsWith("blob:")) return path;
    return `${BASE_URL}${path}`;
  };

  // Online/offline
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

  // Fetch regulation data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("/api/main-backend/exam", {
          type: "regulation",
        });
        const data = response.data.data || [];
        setRegulationData(data);
        setOriginalData(data);
        setInitialData(data); // 🔑 keep very first baseline
        setLoading(false);
      } catch (error) {
        console.error("Error Fetching Regulation data");
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
        }
        setLoading(true);
      }
    };
    fetchData();
  }, [navigate]);

  // Track changes relative to sessionBackup
  useEffect(() => {
    setHasChanges(
      JSON.stringify(regulationData) !== JSON.stringify(sessionBackup)
    );
  }, [regulationData, sessionBackup]);

  // Checkbox selection
  const handleCheckboxChange = (index) => {
    setSelectedRegs((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  // Add or update regulation
  const handleAddOrUpdateRegulation = (newReg, index = null) => {
    if (index !== null) {
      setRegulationData((prev) => {
        const updated = [...prev];
        updated[index] = newReg;
        return updated;
      });
    } else {
      setRegulationData((prev) => [newReg, ...prev]);
    }
  };

  // Start editing session
  const handleStartEditing = () => {
    setSessionBackup(JSON.parse(JSON.stringify(regulationData))); // deep copy snapshot
    setIsEditing(true);
  };

  // Cancel editing (restore snapshot of current session)
  const handleCancel = () => {
    setRegulationData(sessionBackup);
    setIsEditing(false);
    setSelectedRegs([]);
  };

  // Save changes (commit this session’s edits as new baseline)
  const handleSave = () => {
    setOriginalData(regulationData);
    setHasChanges(false);
    setIsEditing(false);
    setIsDone(true);
  };

  // Discard all changes (reset to very first fetch state)
  const handleDiscardChanges = () => {
    const clonedData = initialData.map((reg) => ({
      category: reg.category,
      links: reg.links.map((link) => ({ ...link })),
    }));

    setRegulationData(clonedData);
    setOriginalData(clonedData);
    setIsEditing(false);
    setIsDone(false);
    setShowPopup(false);
    setIsEditingItem(false);
    setEditIndex(null);
    setNewYear("");
    setNewLinks([
      { name: "UG - B.E / B.Tech", pdf_path: "" },
      { name: "PG - ME", pdf_path: "" },
      { name: "PG - MBA", pdf_path: "" },
    ]);
    setHasChanges(false);
    setSelectedRegs([]);
    setDeletedRegs([]);
  };

  // Undo a change for Request Modal
  const undoChange = (index) => {
  const cloned = [...regulationData];
  cloned[index] = { ...initialData[index] };  // 🔑 revert to very first baseline
  setRegulationData(cloned);
  if (selectedRegs.includes(index)) {
    setSelectedRegs(selectedRegs.filter(i => i !== index));
  }
};


  // Final submission from Request Changes modal
  const handleRequest = () => {
    console.log("Final submitted data:", regulationData);
    setIsDone(false);
  };

  // Add new popup
  const handleAddNew = () => {
    setIsEditingItem(false);
    setNewYear("");
    setNewLinks([
      { name: "UG - B.E / B.Tech", pdf_path: "" },
      { name: "PG - ME", pdf_path: "" },
      { name: "PG - MBA", pdf_path: "" },
    ]);
    setShowPopup(true);
  };

  // Edit existing popup
  const handleEditRegulation = (index) => {
    const item = regulationData[index];
    setIsEditingItem(true);
    setEditIndex(index);
    setNewYear(item.category);
    setNewLinks(item.links.map((l) => ({ ...l })));
    setShowPopup(true);
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
        backgroundImage="./Banners/examsbanner.webp"
        headerText="Regulations"
        subHeaderText="Establishing clear guidelines to foster transparency, compliance, and organizational integrity."
      />

      {isLoading ? (
        <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
          <LoadComp txt={""} />
        </div>
      ) : (
        <div className="regulation-container mt-10">
          {/* Top Edit Button */}
          {!isEditing && (
            <div className="flex justify-end pr-8 my-0 mr-10">
              <button
                className="flex items-center bg-[#fdcc03] px-3 py-2 rounded text-text gap-2 hover:bg-[#800000] hover:text-prim"
                onClick={handleStartEditing}
              >
                <Pencil size={16} /> Edit
              </button>
            </div>
          )}

          <h1 className="title text-brwn dark:text-drkt">Regulations</h1>

          <div className="regulation-grid">
            {regulationData?.map((reg, index) => (
              <div key={index} className="regulation-card relative">
                <div className="flex items-center justify-between">
                  <h2 className="regulation-year text-brwn dark:text-drkt text-md border-b-2 pb-2 w-fit border-[#fdcc03] dark:border-drks">
                    {reg.category}
                  </h2>

                  {isEditing && (
                    <div className="flex gap-2 items-center ml-4">
                      <input
                        type="checkbox"
                        checked={selectedRegs.includes(index)}
                        onChange={() => handleCheckboxChange(index)}
                        className="w-4 h-4"
                      />
                      <button
                        className="text-text bg-secd px-2 py-2 rounded text-sm"
                        onClick={() => handleEditRegulation(index)}
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <ul className="regulation-list mt-2">
                  {reg.links.map((link, idx) => (
                    <li key={idx}>
                      {link?.pdf_path ? (
                        <a
                          href={UrlParser(link.pdf_path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="dark:text-drkt font-[Poppins] hover:underline text-blue-600"
                        >
                          {link.name}
                        </a>
                      ) : (
                        <span className="text-text dark:text-drkt font-[Poppins]">
                          {link.name}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {isEditing && (
              <button
                className="bg-gray-100 my-auto ml-20 h-40 w-40 p-6 flex justify-center items-center border border-black rounded-md hover:bg-gray-200"
                onClick={handleAddNew}
              >
                <Plus className="mr-2" /> Add New
              </button>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end items-center pr-8 my-8 mr-10">
            {isEditing && (
              <>
                <button
                  className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300"
                  onClick={handleCancel}
                >
                  Cancel
                </button>

                {hasChanges && (
                  <button
                    className="px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] flex items-center gap-2 hover:text-prim"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                )}
              </>
            )}

            {isDone && !isEditing && (
              <>
                <button
                  className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300"
                  onClick={handleDiscardChanges}
                >
                  Discard Changes
                </button>

                <button
                  className="px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] flex items-center gap-2 hover:text-prim"
                  onClick={() => setShowRequestModal(true)}
                >
                  <Send size={16} className="mr-1" /> Request
                </button>
              </>
            )}
          </div>

          {/* Static Bottom-Center Delete Button */}
          {selectedRegs.length > 0 && (
            <div className="w-full flex justify-center mt-8">
              <button
                className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete {selectedRegs.length} Item
                {selectedRegs.length !== 1 ? "s" : ""}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[2147483647]">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-[420px]">
            <h2 className="text-lg font-semibold mb-4 text-center">
              {isEditingItem ? "Edit Regulation" : "Add New Regulation"}
            </h2>

            <input
              type="text"
              placeholder="Enter Regulation Year (e.g., 2024)"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              className="w-full mb-3 p-2 border rounded"
            />

            {newLinks.map((link, idx) => (
              <div key={idx} className="flex justify-between items-center mb-2">
                <span className="font-medium">{link.name}</span>
                <div className="flex gap-2 items-center">
                  <button
                    className="px-2 py-1 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
                    onClick={() =>
                      document.getElementById(`file-${idx}`).click()
                    }
                  >
                    Replace
                  </button>

                  {link.pdf_path && (
                    <button
                      className="px-2 py-1 rounded"
                      onClick={() => window.open(UrlParser(link.pdf_path), "_blank")}
                      title="Preview PDF"
                    >
                      <Eye size={16} color="blue" />
                    </button>
                  )}

                  <input
                    type="file"
                    accept="application/pdf"
                    id={`file-${idx}`}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const updatedLinks = [...newLinks];
                        updatedLinks[idx].pdf_path = URL.createObjectURL(file);
                        setNewLinks(updatedLinks);
                      }
                    }}
                  />
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
                onClick={() => {
                  const newReg = { category: newYear, links: newLinks };
                  handleAddOrUpdateRegulation(
                    newReg,
                    isEditingItem ? editIndex : null
                  );
                  setShowPopup(false);
                  setNewYear("");
                  setNewLinks([
                    { name: "UG - B.E / B.Tech", pdf_path: "" },
                    { name: "PG - ME", pdf_path: "" },
                    { name: "PG - MBA", pdf_path: "" },
                  ]);
                  setIsEditingItem(false);
                  setEditIndex(null);
                }}
              >
                {isEditingItem ? "Update" : "Submit"}
              </button>

              <button
                className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300"
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[2147483647]">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-[400px]">
            <h2 className="text-lg font-semibold mb-4 text-center">
              Confirm Deletion
            </h2>
            <p className="text-center mb-4">
              Are you sure you want to delete {selectedRegs.length} selected item(s)?
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"
                onClick={() => {
                  setDeletedRegs(selectedRegs);
                  setRegulationData((prev) =>
                    prev.filter((_, idx) => !selectedRegs.includes(idx))
                  );
                  setSelectedRegs([]);
                  setShowDeleteConfirm(false);
                }}
              >
                Yes, Delete
              </button>

              <button
                className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Changes Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white p-6 rounded-xl w-[800px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Request </h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin.Once approved will go live.
            </p>

            <table className="w-full border border-gray-300 text-sm text-center">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2">Action</th>
                  <th className="border p-2">Section</th>
                  <th className="border p-2">Changes</th>
                  <th className="border p-2">Undo</th>
                </tr>
              </thead>
              <tbody>
                {regulationData.map((reg, index) => {
                  const original = initialData[index] || { category: "", links: [] };
                  if (JSON.stringify(reg) !== JSON.stringify(original)) {
                    return (
                      <tr key={index}>
                        <td className="border p-2 text-blue-600">Updated</td>
                        <td className="border p-2">{reg.category}</td>
                        <td className="border p-2">
                          {reg.links.map(l => l.name).join(", ")}
                        </td>
                        <td className="border p-2">
                          <button
                            onClick={() => undoChange(index)}
                            className="p-1 rounded hover:bg-gray-100"
                          >
                            <X size={16} className="text-red-500" />
                          </button>
                        </td>
                      </tr>
                    );
                  }
                  return null;
                })}

                {deletedRegs.map((idx) => {
                  const reg = originalData[idx];
                  return (
                    <tr key={`deleted-${idx}`}>
                      <td className="border p-2 text-red-600">Deleted</td>
                      <td className="border p-2">{reg.category}</td>
                      <td className="border p-2">
                        {reg.links.map(l => l.name).join(", ")}
                      </td>
                      <td className="border p-2">
                        <button
                          onClick={() => {
                            const restored = [...regulationData];
                            restored.splice(idx, 0, reg);
                            setRegulationData(restored);
                            setDeletedRegs(deletedRegs.filter(i => i !== idx));
                          }}
                          className="p-1 rounded hover:bg-gray-100"
                          title="Restore deleted item"
                        >
                          <X size={16} className="text-green-500" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleRequest();
                  setShowRequestModal(false);
                }}
                className="px-4 py-2 rounded bg-[#fdcc03] text-white hover:bg-[#800000] flex items-center gap-2"
              >
                Confirm Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminREGULATION;
