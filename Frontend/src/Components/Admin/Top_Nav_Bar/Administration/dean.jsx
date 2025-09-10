import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dean.css";
import Banner from "../../../Banner";
import LoadComp from "../../../LoadComp";
import { Pencil, X, Plus, Trash } from "lucide-react";
import { FaPaperPlane } from "react-icons/fa";
import { MdUndo } from "react-icons/md";

const defaultData = [
  { heading: "Academics" },
  { heading: "Planning and Development" },
  { heading: "Student Development and Welfare" },
  { heading: "Faculty Development and Welfare" },
  { heading: "Research and Development" },
  { heading: "Accreditations and Ranking" },
  { heading: "Corporate Relations and Higher Studies" },
];

const AdminDean = ({ theme, toggle }) => {
  const [deanData, setDeanData] = useState([]);
  const [tempData, setTempData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [data] = useState(defaultData);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [deletedHistory, setDeletedHistory] = useState([]);
  const [editedData, setEditedData] = useState(null);

  const bottomRef = useRef(null);
  const navigate = useNavigate();

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) => {
    if (!path) return "";
    if (
      typeof path === "string" &&
      (path.startsWith("http") || path.startsWith("blob:") || path.startsWith("data:"))
    ) {
      return path;
    }
    return `${BASE_URL || ""}${path}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`/api/main-backend/administration`, {
          type: "dean_and_association",
        });
        setDeanData(response.data.data || []);
        setTempData(response.data.data || []);
      } catch (error) {
        console.error("Error fetching data:", error?.message);
        if (error?.response?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
        }
        // stop spinner even on error
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

  const handleChange = (e, position, field) => {
    const value = e.target.value;
    const updated = tempData.map((item) =>
      item.Position === position ? { ...item, [field]: value } : item
    );
    setTempData(updated);
  };

  const handleFileChange = (e, position, key) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    const updated = tempData.map((section) =>
      section.Position === position
        ? {
            ...section,
            [key]: previewUrl, // show immediate preview
            [`${key}_file`]: file, // keep file for upload
          }
        : section
    );

    setTempData(updated);
  };

  const handleDeleteRole = (position, role) => {
    const updated = tempData.map((item) =>
      item.Position === position
        ? {
            ...item,
            [role]: undefined,
            [`${role}_Image`]: undefined,
            [`${role}_Type`]: undefined,
            [`${role}_Designation`]: undefined,
            // clear file placeholders too
            [`${role}_Image_file`]: undefined,
          }
        : item
    );
    setTempData(updated);
  };

  const handleAddNewSection = () => {
    const newEntry = {
      Position: `New Section ${tempData.length + 1}`,
      Dean: "",
      Dean_Image: "",
      Dean_Type: "",
      Dean_Designation: "",
      Associate_Dean: "",
      Associate_Dean_Image: "",
      Ass_Dean_Type: "",
      Associate_Dean_Designation: "",
    };
    setTempData((prev) => [...prev, newEntry]);
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  };

  const handleSave = () => {
  if (getChanges().length === 0) {
    setEditMode(false);
    setIsSaved(false);
    return;
  }
  setIsSaved(true);
  setEditMode(false);
};

  const handleDeleteSection = (index) => {
  const sectionToDelete = tempData[index];
  setTempData((prev) => prev.filter((_, i) => i !== index));

  setDeletedHistory((prev) => [...prev, { section: sectionToDelete, index }]);
};


  const handleCancel = () => {
  setShowCancelModal(true); 
};


  const handleRequest = async () => {
    try {
      const formData = new FormData();
      formData.append("type", "dean_and_association");

      tempData.forEach((section, index) => {
        Object.keys(section).forEach((key) => {
          if (key.endsWith("_file") && section[key]) {
            // files: keep field name stable and index-suffixed
            // e.g., Dean_Image_file_0
            formData.append(`${key}_${index}`, section[key]);
          } else if (!key.endsWith("_file")) {
            formData.append(`${key}_${index}`, section[key] ?? "");
          }
        });
      });

      await axios.put(`/api/main-backend/update-dean`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setDeanData(tempData);
      setShowConfirmModal(false);
      setEditMode(false);
      alert("Request sent successfully!");
    } catch (error) {
      console.error("Error sending request:", error?.message);
      alert("Failed to send request!");
    }
  };

  const getChanges = () => {
    const changes = [];

    const originalByPos = new Map((deanData || []).map((s) => [s.Position, s]));
    const currentByPos = new Map((tempData || []).map((s) => [s.Position, s]));

    // Added or updated
    (tempData || []).forEach((section) => {
      const original = originalByPos.get(section.Position);
      if (!original) {
        changes.push({ action: "Added", section: section.Position });
        return;
      }

      // Dean changes
      if (
        section.Dean !== original.Dean ||
        section.Dean_Type !== original.Dean_Type ||
        section.Dean_Designation !== original.Dean_Designation ||
        section.Dean_Image !== original.Dean_Image
      ) {
        changes.push({
          action: section.Dean ? "Updated Dean" : "Removed Dean",
          section: section.Position,
        });
      }

      // Associate Dean changes
      if (
        section.Associate_Dean !== original.Associate_Dean ||
        section.Ass_Dean_Type !== original.Ass_Dean_Type ||
        section.Associate_Dean_Designation !== original.Associate_Dean_Designation ||
        section.Associate_Dean_Image !== original.Associate_Dean_Image
      ) {
        changes.push({
          action: section.Associate_Dean ? "Updated Associate Dean" : "Removed Associate Dean",
          section: section.Position,
        });
      }
    });

    // Deleted
    (deanData || []).forEach((section) => {
      if (!currentByPos.has(section.Position)) {
        changes.push({ action: "Deleted", section: section.Position });
      }
    });

    return changes;
  };
  
  const handleUndo = (change) => {
    let updated = [...tempData];

    if (change.action === "Added") {
      // remove newly added section by Position
      updated = updated.filter((s) => s.Position !== change.section);
    } else if (change.action === "Deleted") {
  const original = deanData.find((s) => s.Position === change.section);
  if (original) {
    const deletedEntry = deletedHistory.find((h) => h.section.Position === change.section);
    const insertIndex = deletedEntry?.index ?? updated.length;
    updated.splice(insertIndex, 0, original);
  }
}

else if (change.action.includes("Dean")) {
      const original = deanData.find((s) => s.Position === change.section);
      updated = updated.map((s) =>
        s.Position === change.section
          ? {
              ...s,
              Dean: original?.Dean,
              Dean_Image: original?.Dean_Image,
              Dean_Type: original?.Dean_Type,
              Dean_Designation: original?.Dean_Designation,
              Dean_Image_file: undefined,
            }
          : s
      );
    } else if (change.action.includes("Associate Dean")) {
      const original = deanData.find((s) => s.Position === change.section);
      updated = updated.map((s) =>
        s.Position === change.section
          ? {
              ...s,
              Associate_Dean: original?.Associate_Dean,
              Associate_Dean_Image: original?.Associate_Dean_Image,
              Ass_Dean_Type: original?.Ass_Dean_Type,
              Associate_Dean_Designation: original?.Associate_Dean_Designation,
              Associate_Dean_Image_file: undefined,
            }
          : s
      );
    }

    setTempData(updated);
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
        headerText="Deans & Associate Deans"
        subHeaderText="Shaping the future through leadership, collaboration, and academic excellence."
      />
      {loading ? (
        <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
          <LoadComp txt={""} />
        </div>
      ) : (
        <div className="deancontainer px-10">
          {/* --- Top Buttons (Edit / Add / Cancel) --- */}
          <div className="flex justify-end gap-3 pt-4">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 mr-2 bg-yellow-400 p-2 rounded shadow-md hover:bg-yellow-500"
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={handleAddNewSection}
                  className="hover:text-brwn text-gray-100  bg-brwn rounded-full p-2 hover:bg-secd"
                >
                  <Plus />
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-brwn hover:text-brwn text-gray-100 font-poppi p-2 rounded shadow-md hover:bg-secd hover:text-black-100"
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          {/* --- Sections --- */}
          <div className="de-container font-[poppins]">
            {tempData.map((section, index) => {
              const headingValue = section.Position || section.heading || data[index]?.heading || "";
              return (
                <div
                  className="de-box min-w-[20vw] bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)] 
                              dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] relative"
                  key={headingValue + index}
                >
                  {/* Heading */}
                  {editMode ? (
                    <div className="relative">
                      <input
                  type="text"
                  value={section.Position ?? ""}
                  onChange={(e) => {
                    const updated = [...tempData];
                    updated[index] = { ...updated[index], Position: e.target.value };
                    setTempData(updated);
                  }}
                  className="de-heading text-accn dark:text-drkt font-[poppins] bg-transparent 
                            border-b border-gray-400 outline-none w-full"
                  placeholder="Enter Section Heading"
                />

    </div>
  ) : (
    <h1 className="de-heading text-accn dark:text-drkt font-[poppins]">
      {headingValue}
    </h1>
  )}

  {/* Section Delete Button (always top-right in edit mode) */}
  {editMode && (
    <button
      onClick={() => handleDeleteSection(index)}
      className="absolute top-3 right-3 p-2 rounded-full hover:bg-red-200"
      title="Delete section"
    >
      <Trash size={16} className="text-red-600" />
    </button>
  )}
                  {/* Profiles */}
                  <div className="de-content">
                    {section && (
                      <div className="de-profiles-section flex flex-wrap lg:flex-nowrap justify-center gap-4 w-full font-[poppins]">
                        {/* Dean Profile */}
                        {section?.Dean !== undefined && (
                          <div
                            className="de-profile bg-prim dark:bg-drkp w-full lg:w-[26vw] 
                                    border-2 border-secd dark:border-drks relative"
                          >
                            {editMode && (
                              <label className="absolute top-2 right-2 bg-secd text-black text-xs px-2 py-1 cursor-pointer shadow-md hover:bg-brwn hover:text-prime">
                                Upload
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleFileChange(e, section.Position, "Dean_Image")
                                  }
                                  className="hidden"
                                />
                              </label>
                            )}

                            <img
                              src={
                                UrlParser(section.Dean_Image) ||
                                "https://via.placeholder.com/150"
                              }
                              alt={section.Dean || "Dean"}
                            />
                            <div className="de-profile-details">
                              {editMode ? (
                                <>
                                  <input
                                    value={section.Dean ?? ""}
                                    onChange={(e) =>
                                      handleChange(e, section.Position, "Dean")
                                    }
                                    placeholder="Name"
                                  />
                                  <input
                                    value={section.Dean_Type ?? ""}
                                    onChange={(e) =>
                                      handleChange(e, section.Position, "Dean_Type")
                                    }
                                    placeholder="Type"
                                  />
                                  <input
                                    value={section.Dean_Designation ?? ""}
                                    onChange={(e) =>
                                      handleChange(e, section.Position, "Dean_Designation")
                                    }
                                    placeholder="Designation"
                                  />

                                  <div className="absolute bottom-2 right-2 flex gap-2">
                                    <button
                                      onClick={() =>
                                        handleDeleteRole(section.Position, "Dean")
                                      }
                                    >
                                      <Trash className="text-red-600" size={16} />
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <strong>{section.Dean}</strong>
                                  <br />
                                  <span>{section.Dean_Type}</span>
                                  <br />
                                  <span className="text-text dark:text-drka">
                                    {section.Dean_Designation}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Associate Dean Profile */}
                        {section?.Associate_Dean !== undefined && (
                          <div
                            className="de-profile bg-prim dark:bg-drkp w-full lg:w-[26vw] 
                                        border-2 border-secd dark:border-drks relative"
                          >
                            {editMode && (
                              <>
                                <input
                                  id={`associate-dean-file-${section.Position}`}
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleFileChange(
                                      e,
                                      section.Position,
                                      "Associate_Dean_Image"
                                    )
                                  }
                                  className="hidden"
                                />
                                <label
                                  htmlFor={`associate-dean-file-${section.Position}`}
                                  className="absolute top-2 right-2 bg-secd text-black text-xs px-2 py-1 cursor-pointer shadow-md hover:bg-brwn hover:text-prime"
                                >
                                  Upload
                                </label>
                              </>
                            )}

                            <img
                              src={
                                UrlParser(section.Associate_Dean_Image) ||
                                "https://via.placeholder.com/150"
                              }
                              alt={section.Associate_Dean || "Associate Dean"}
                            />
                            <div className="de-profile-details">
                              {editMode ? (
                                <>
                                  <input
                                    value={section.Associate_Dean ?? ""}
                                    onChange={(e) =>
                                      handleChange(e, section.Position, "Associate_Dean")
                                    }
                                    placeholder="Name"
                                  />
                                  <input
                                    value={section.Ass_Dean_Type ?? ""}
                                    onChange={(e) =>
                                      handleChange(e, section.Position, "Ass_Dean_Type")
                                    }
                                    placeholder="Type"
                                  />
                                  <input
                                    value={section.Associate_Dean_Designation ?? ""}
                                    onChange={(e) =>
                                      handleChange(
                                        e,
                                        section.Position,
                                        "Associate_Dean_Designation"
                                      )
                                    }
                                    placeholder="Designation"
                                  />

                                  <div className="absolute bottom-2 right-2 flex gap-2">
                                    <button
                                      onClick={() =>
                                        handleDeleteRole(section.Position, "Associate_Dean")
                                      }
                                    >
                                      <Trash className="text-red-600" size={16} />
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <strong>{section.Associate_Dean}</strong>
                                  <br />
                                  <span>{section.Ass_Dean_Type}</span>
                                  <br />
                                  <span className="text-text dark:text-drka">
                                    {section.Associate_Dean_Designation}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* If neither exists → add both */}
                  {editMode &&
                    section.Dean === undefined &&
                    section.Associate_Dean === undefined && (
                      <div className="absolute bottom-2 right-2">
                        <button
                          onClick={() => {
                            const updated = [...tempData];
                            updated[index].Dean = "";
                            updated[index].Dean_Image = "";
                            updated[index].Dean_Type = "";
                            updated[index].Dean_Designation = "";
                            updated[index].Associate_Dean = "";
                            updated[index].Associate_Dean_Image = "";
                            updated[index].Ass_Dean_Type = "";
                            updated[index].Associate_Dean_Designation = "";
                            setTempData(updated);
                          }}
                          className=" px-2 py-2 bg-secd rounded-full hover:bg-brwn hover:text-secd text-brwn flex items-center gap-1"
                          title="Add profiles"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    )}

                  {/* If only Dean exists → add Associate Dean */}
                  {editMode &&
                    section.Dean !== undefined &&
                    section.Associate_Dean === undefined && (
                      <div className="absolute bottom-2 right-2">
                        <button
                          onClick={() => {
                            const updated = [...tempData];
                            updated[index].Associate_Dean = "";
                            updated[index].Associate_Dean_Image = "";
                            updated[index].Ass_Dean_Type = "";
                            updated[index].Associate_Dean_Designation = "";
                            setTempData(updated);
                          }}
                          className="absolute bottom-1 right-2 px-2 py-2 bg-secd rounded-full 
                  hover:bg-brwn hover:text-secd text-brwn flex items-center"
                          title="Add Associate Dean"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    )}

                  {/* If only Associate Dean exists → add Dean */}
                  {editMode &&
                    section.Dean === undefined &&
                    section.Associate_Dean !== undefined && (
                      <div className="absolute bottom-2 right-2">
                        <button
                          onClick={() => {
                            const updated = [...tempData];
                            updated[index].Dean = "";
                            updated[index].Dean_Image = "";
                            updated[index].Dean_Type = "";
                            updated[index].Dean_Designation = "";
                            setTempData(updated);
                          }}
                          className="px-3 py-1 bg-blue-100 rounded-full hover:bg-blue-200 text-blue-600 flex items-center gap-1"
                          title="Add Dean"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    )}
                </div>
              );
            })}
          </div>

          {/* --- Request Button --- */}
  
          {editMode && (
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="px-3 py-2 mb-3 bg-secd font-[poppins] rounded flex items-center gap-2 hover:bg-yellow-500"
              >
                Save
              </button>
            </div>
          )}
          
          {/* After Save: show Back to Edit + Request */}
          {isSaved && !editMode && getChanges().length > 0 && (
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsSaved(false);
                    setEditMode(true);
                  }}
                  className="px-3 py-2 mb-3 bg-brwn text-white font-[poppins] rounded flex items-center gap-2 hover:bg-brwn-500"
                >
                  Back to Edit
                </button>
                <button
                  onClick={() => {
                    setEditedData(tempData);
                    setShowConfirmModal(true);
                  }}
                  className="px-3 py-2 mb-3 bg-yellow-400 text-black font-[poppins] rounded flex items-center gap-2 hover:bg-yellow-500"
                >
                  <FaPaperPlane /> Request
                </button>
            </div>
          )}


          <div ref={bottomRef}></div>
        </div>
      )}

      {/* --- Cancel Confirm Modal --- */}
      {showCancelModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[400px]">
            <h2 className="text-lg font-bold mb-4">Discard Changes?</h2>
            <p className="text-red-600 mb-4">
              <span className="font-semibold">Note:</span> All unsaved changes will be lost if you cancel.
            </p>
            <div className="flex justify-between">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                No
              </button>
              <button
                onClick={() => {
                  setTempData(deanData); // reset
                  setEditMode(false);
                  setIsSaved(false);
                  setShowCancelModal(false);
                }}
                className="px-4 py-2 bg-brwn text-white rounded hover:bg-red-600"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}


      {/* --- Confirm Modal --- */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[450px]">
            <h2 className="text-lg font-bold mb-4">Final Request for the Changes</h2>

            <p className="text-red-600 mb-4">
              <span className="font-semibold">Note:</span> Your changes will stay pending
              until approved by the superior admin. Once approved, they will be applied
              automatically to the live site.
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
                    <tr key={`${change.action}-${change.section}-${idx}`} className="border-b">
                      <td className="py-2">{change.action}</td>
                      <td className="py-2">{change.section}</td>
                      <td className="py-2">
                        <button
                          onClick={() => handleUndo(change)}
                          className="px-3 py-1 bg-yellow-400 text-black rounded hover:bg-yellow-500 flex items-center gap-1"
                        >
                          <MdUndo /> Undo
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-gray-500">
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
                <FaPaperPlane /> Confirm Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDean;
