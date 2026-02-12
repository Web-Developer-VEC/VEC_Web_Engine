import React, { useState, useEffect } from "react";
import LoadComp from "../../LoadComp";
import "./admin_SportsInfra.css";
import { Pencil, Trash2, Plus, Send, Save } from "lucide-react";
import { useAdminRequest } from "../../../hooks/useAdminRequest";
import { toast, ToastContainer } from "react-toastify";

const Intramural = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [initialSnapshot, setInitialSnapshot] = useState([]);
  const [editintra, setEditintra] = useState(false);
  const [selected, setSelected] = useState([]);
  const [tempAchievements, setTempAchievements] = useState([]);
  const [imagePreviews, setImagePreviews] = useState({});
  const { sendRequest, loading, error } = useAdminRequest();
  const [isDirty, setIsDirty] = useState(false);


  // New states
  const [showRequestButtons, setShowRequestButtons] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [changes, setChanges] = useState([]); // ✅ track changes
  const hasChanges = changes.length > 0;

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    if (!path) return "";

    // If already relative
    if (path.startsWith("/static")) return path;

    // Convert S3 full URL to relative path
    const staticIndex = path.indexOf("/static");
    if (staticIndex !== -1) {
      return path.substring(staticIndex);
    }

    return path;
  };


  const isSameAsOriginal = (id, currentRow) => {
    const original = initialSnapshot.find(o => o.id === id);
    if (!original) return false;

    return (
      original.text === currentRow.text &&
      original.image === currentRow.image
    );
  };


  // Initialize data
  useEffect(() => {
    if (!data) {
      setAchievements([]);
      setTempAchievements([]);
      setInitialSnapshot([]);
      return;
    }

    const formattedData = data?.map((image, index) => {
      const serverPath = UrlParser(image?.image_path);

      return {
        id: image._id || index + 1,
        text: image?.title || "No Title",
        image: serverPath,
        preview: `${BASE_URL}${serverPath}`,

        isNew: false,
        isEdited: false,
        isDeleted: false,
      };

    });


    const deepCopy = JSON.parse(JSON.stringify(formattedData));

    setAchievements(formattedData);
    setTempAchievements(deepCopy);
    setInitialSnapshot(deepCopy);
  }, [data]);

  // Carousel auto-play
  useEffect(() => {
    if (isHovered || achievements.length === 0) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % achievements.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered, achievements]);

  const handlePrev = () => {
    if (achievements.length === 0) return;
    setActiveIndex(
      (prevIndex) => (prevIndex - 1 + achievements.length) % achievements.length
    );
  };

  const handleNext = () => {
    if (achievements.length === 0) return;
    setActiveIndex((prevIndex) => (prevIndex + 1) % achievements.length);
  };

  // ---- Edit Mode Handlers ----
  const handleInputChange = (id, field, value) => {
    setIsDirty(true); // 🔥 mark changed

    setTempAchievements(prev =>
      prev.map(item => {
        if (item.id !== id) return item;

        if (selected.includes(id)) {
          toast.warn("You cannot edit a selected item. Unselect it first.");
          return item;
        }

        const updated = { ...item, [field]: value };
        const reverted = isSameAsOriginal(id, updated);

        return {
          ...updated,
          isEdited: !reverted,
        };
      })
    );
  };



  const handleImageUpload = (id, file) => {
    if (selected.includes(id)) {
      toast.warn("You cannot edit a selected item. Unselect it first.");
      return;
    }
    setIsDirty(true);
    const previewUrl = URL.createObjectURL(file);
    const serverPath = `/static/images/sports/intramural/${file.name}`;

    setTempAchievements(prev =>
      prev.map(item => {
        if (item.id !== id) return item;

        const updated = {
          ...item,
          image: serverPath,
          preview: previewUrl,
          newFile: file,
        };

        return {
          ...updated,
          isEdited: !isSameAsOriginal(id, updated),
        };
      })
    );
  };





  const handleAddRow = () => {
    const newId = tempAchievements.length
      ? Math.max(...tempAchievements.map((a) => a.id)) + 1
      : 1;
    const newRow = {
      id: newId,
      text: "",
      image: "",
      preview: "",
      newFile: null,
      isNew: true,
      isEdited: false,
      isDeleted: false,
    };
    setIsDirty(true);
    setTempAchievements((prev) => [...prev, newRow]);

    setChanges((prev) => [
      ...prev,
      { action: "Added", section: "Intramural Achievements", field: `image - ${newId}` },
    ]);
  };
  const handleDeleteSelected = () => {
    if (selected.length === 0) return;

    // mark dirty
    setIsDirty(true);

    // 🔥 ADD DELETE LOGS TO REQUEST BOX
    setChanges(prev => [
      ...prev,
      ...selected.map(id => ({
        action: "Deleted",
        section: "Intramural Achievements",
        field: `image - ${id}`,
      }))
    ]);

    // 🔥 REMOVE FROM TEMP DATA
    setTempAchievements(prev =>
      prev.filter(item => !selected.includes(item.id))
    );

    setSelected([]);
    setShowDeleteModal(false);
  };




  const handleSave = () => {
    if (!isDirty) {
      toast.warn("No changes made!");
      return;
    }

    const updatedChanges = [];
    toast.success("Changes saved locally. Please submit a request to apply.");

    tempAchievements.forEach(item => {
      const original = initialSnapshot.find(o => o.id === item.id);

      if (!original) {
        updatedChanges.push({ action: "Added", section: "Intramural Achievements", field: `image - ${item.id}` });
      }
      else if (original.text !== item.text || original.image !== item.image) {
        updatedChanges.push({ action: "Edited", section: "Intramural Achievements", field: `image - ${item.id}` });
      }
    });

    initialSnapshot.forEach(item => {
      if (!tempAchievements.find(t => t.id === item.id)) {
        updatedChanges.push({ action: "Deleted", section: "Intramural Achievements", field: `image - ${item.id}` });
      }
    });

    setChanges(updatedChanges);
    setAchievements(tempAchievements);
    setEditintra(false);
    setShowRequestButtons(true);
    setIsDirty(false);
  };



  const handleCancel = () => {
    setTempAchievements(achievements);
    setEditintra(false);
    setIsDirty(false);
  };

  const confirmDiscard = () => {
    const deepCopy = JSON.parse(JSON.stringify(initialSnapshot));

    setAchievements(deepCopy);
    setTempAchievements(deepCopy);
    setSelected([]);
    setCurrentPage(1);
    setShowRequestButtons(false);
    setEditintra(false);
    setChanges([]);
    setIsDirty(false);
    setShowDiscardModal(false);
  };

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = tempAchievements.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(tempAchievements.length / rowsPerPage);

  /* ==================== BUILD PAYLOAD ==================== */
  const buildSportsInfrastructurePayload = ({
    action,
    newData = {},
    oldData = {},
  }) => {
    /* -------------------- INSERT -------------------- */
    if (action === "Added") {
      return {
        collectionName: "sports",
        collection_type: "intramural",
        action: "insert",
        title: "Insertion of Infrastructure",

        meta_data: {
          title: newData.title,
          description: newData.description,
          image_path: newData.image_path,
        },

        original_data: null,
      };
    }

    /* -------------------- UPDATE -------------------- */
    if (action === "Edited") {
      return {
        collectionName: "sports",
        collection_type: "intramural",
        action: "update",
        title: "Updation of Infrastructure",

        meta_data: {
          title: newData.title,
          description: newData.description,
          image_path: newData.image_path,
        },

        original_data: {
          title: oldData.title,
          description: oldData.description,
          image_path: oldData.image_path,
        },
      };
    }

    /* -------------------- DELETE -------------------- */
    if (action === "Deleted") {
      return {
        collectionName: "sports",
        collection_type: "intramural",
        action: "delete",
        title: "Deletion of Infrastructure",

        meta_data: {
          title: oldData.title,
          description: oldData.description,
          image_path: oldData.image_path,
        },

        original_data: null,
      };
    }

    return null;
  };

  /* ==================== HANDLE FINAL REQUEST ==================== */
  const handleFinalRequest = async () => {
    if (!tempAchievements.length && !initialSnapshot.length) {
      toast.warn("No changes to submit");
      console.log("N changs");

      return;
    }
    console.log("TEMP ACHIEVEMENTS:", tempAchievements);
    const payloads = [];
    const files = [];

    // Compare tempAchievements with initialSnapshot to build payloads
    const snapshotMap = new Map(initialSnapshot.map(a => [a.id, a]));
    const tempMap = new Map(tempAchievements.map(t => [t.id, t]));

    const validItems = tempAchievements.filter(item => {
      // 🚫 ignore added then deleted
      if (item.isNew && item.isDeleted) return false;
      return true;
    });


    // ---- ADDED ----
    validItems.forEach((item) => {
      if (!snapshotMap.has(item.id)) {
        payloads.push(
          buildSportsInfrastructurePayload({
            action: "Added",
            newData: {
              title: item.text,
              image_path: item.image,
            },
          })
        );

        if (item.newFile) {
          files.push(item.newFile);
        }
      }
    });

    // ---- UPDATED ----
    validItems.forEach((item) => {
      const original = snapshotMap.get(item.id);
      if (original && (original.text !== item.text || original.image !== item.image)) {
        payloads.push(
          buildSportsInfrastructurePayload({
            action: "Edited",
            newData: {
              title: item.text,
              image_path: item.image,
            },
            oldData: {
              title: original.text,
              description: original.text,
              image_path: original.image,
            },
          })
        );

        if (item.newFile) {
          files.push(item.newFile);
        }
      }
    });

    // ---- DELETED ----
    initialSnapshot.forEach((item) => {
      if (!tempMap.has(item.id)) {
        payloads.push(
          buildSportsInfrastructurePayload({
            action: "Deleted",
            oldData: {
              title: item.text,
              image_path: item.image,
            },
          })
        );
      }
    });

    console.log("FINAL PAYLOADS:", payloads);
    console.log("FILES TO UPLOAD:", files);

    if (!payloads.length) {
      toast.warn("No changes to submit");
      console.log("Hello");

      return;
    }

    try {
      await sendRequest(payloads, files);

      toast.success("Request submitted!");

      // ✅ NEW baseline = current edited data
      const deepCopy = JSON.parse(JSON.stringify(tempAchievements));

      setInitialSnapshot(deepCopy);
      setAchievements(deepCopy);
      setTempAchievements(deepCopy);

      // Reset UI states
      setShowRequestModal(false);
      setShowRequestButtons(false);
      setChanges([]);
      setSelected([]);
      setIsDirty(false);

    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Failed to submit request");
    }



  };

  return (
    <>
      {/* Edit Button */}
      <div className="admin-controls-ug flex justify-end mb-5 p-4">
        {!editintra && (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg mr-20"
            onClick={() => {
              setEditintra(true);
              setShowRequestButtons(true);
            }}
          >
            <Pencil size={16} /> Edit
          </button>
        )}
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
      {data ? (
        <div className="relative w-full max-w-4xl mx-auto mb-10 mt-10">
          <h2 className="text-center text-accn dark:text-drkt text-3xl font-bold mb-4">
            Intramural Achievements {data?.year}
          </h2>

          {/* ---- Carousel View ---- */}
          {!editintra &&
            (achievements.length > 0 ? (
              <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div className="relative overflow-hidden rounded-lg shadow-lg">
                  <div
                    className="flex transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                  >
                    {achievements.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex-shrink-0 w-full transition-opacity duration-500 ease-in-out"
                        style={{ opacity: activeIndex === index ? 1 : 0.5 }}
                      >
                        <img
                          src={item.preview || `${BASE_URL}${item.image}`}
                          alt="preview"
                          className="w-full h-80 object-contain rounded-t-lg"
                        />
                        <div className="p-4 text-center rounded-b-lg">
                          <p className="text-lg font-semibold text-text dark:text-drkt">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handlePrev}
                    className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-all"
                  >
                    &#10094;
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-all"
                  >
                    &#10095;
                  </button>
                </div>

                <div className="flex justify-center space-x-2 mt-4">
                  {achievements.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2.5 h-2.5 rounded-full ${activeIndex === index ? "bg-blue-500" : "bg-gray-300"
                        } transition-all`}
                      onClick={() => setActiveIndex(index)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500">
                No achievements available
              </p>
            ))}

          {/* ---- Edit Mode ---- */}
          {editintra && (
            <div className="overflow-x-auto border rounded-lg shadow-md p-4 bg-white dark:bg-gray-800 ">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="p-2">Description</th>
                    <th className="p-2">Image</th>
                    <th className="p-2">Select</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.text}
                          onChange={(e) =>
                            handleInputChange(item.id, "text", e.target.value)
                          }
                          className="border p-1 w-full rounded"
                        />
                      </td>
                      <td className="p-2 flex items-center gap-2">
                        {item.preview || item.image ? (
                          <img
                            src={item.preview || item.image}
                            alt="preview"
                            className="w-20 h-20 object-cover rounded"
                          />
                        ) : (
                          <span className="text-gray-400">No image</span>
                        )}
                        <label className="bg-yellow-500 text-white px-3 py-1 rounded cursor-pointer">
                          <span>{item.image ? "Replace" : "Upload"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleImageUpload(item.id, e.target.files[0])
                            }
                          />
                        </label>
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={selected.includes(item.id)}
                          disabled={item.isEdited && !item.isNew} // 🔥 disable if edited
                          onChange={() =>
                            setSelected(prev =>
                              prev.includes(item.id)
                                ? prev.filter(s => s !== item.id)
                                : [...prev, item.id]
                            )
                          }
                        />


                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              <div className="flex justify-between items-center mt-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>

              {/* Table Bottom Controls */}
              <div className="flex justify-center items-center mt-4">
                <div className="flex gap-2">
                  <button
                    onClick={handleAddRow}
                    className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded"
                  >
                    <Plus size={16} /> Add New
                  </button>
                  {selected.length > 0 && (
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {editintra && (
            <div className="flex gap-2 mt-4 justify-end mr-12">
              <button
                onClick={handleCancel}
                className="px-4 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              {editintra && isDirty && (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-[#FDCC03] text-black rounded-lg shadow-md hover:bg-yellow-500 transition"
                >
                  Save
                </button>
              )}


            </div>
          )}
          {showDeleteModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white p-6 rounded shadow-lg w-[350px]">
                <h2 className="font-semibold mb-4">Confirm Delete</h2>
                <p>Are you sure you want to delete the selected items?</p>
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded"
                    onClick={handleDeleteSelected}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
          {showDiscardModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-white/40 z-50">
              <div className="bg-white p-6 rounded shadow-lg w-[350px]">
                <h2 className="font-semibold mb-4">Discard Changes?</h2>
                <p>All your unsaved changes will be lost.</p>
                <div className="flex justify-end gap-3 mt-4">
                  <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowDiscardModal(false)}>Cancel</button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={confirmDiscard}>Discard</button>
                </div>
              </div>
            </div>
          )}

          {/* ---- Request Buttons ---- */}
          {showRequestButtons && !editintra && (
            <div className="flex justify-end gap-3 mt-6 mb-4 mr-12">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
                onClick={() => setShowDiscardModal(true)}
              >
                Discard Changes
              </button>
              <button
                className="px-4 py-2 bg-[#FDCC03] text-white rounded flex items-center gap-2"
                onClick={() => setShowRequestModal(true)}
              >
                <Send size={16} /> Request
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp />
        </div>
      )}

      {/* ---- Request Modal ---- */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[750px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Request Changes
            </h2>
            <p className="text-sm text-red-600 mb-4">
              Note: Your changes will stay pending until approved by the superior admin.
              Once approved, they will be applied automatically to the live site.
            </p>

            <table className="w-full text-sm text-text dark:text-drkt border">
              <thead className="bg-gray-100 dark:bg-gray-800 text-center">
                <tr>
                  <th className="py-2 border">Action</th>
                  <th className="py-2 border">Section</th>
                  <th className="py-2 border">Item</th>
                  <th className="py-2 border">Remove</th>
                </tr>
              </thead>
              <tbody>
                {changes.length > 0 ? (
                  changes.map((change, index) => (
                    <tr key={index} className="border text-center">
                      <td
                        className={`py-2 font-semibold ${change.action === "Added"
                          ? "text-green-600"
                          : change.action === "Updated"
                            ? "text-blue-600"
                            : "text-red-600"
                          }`}
                      >
                        {change.action}
                      </td>
                      <td className=" border py-2">{change.section}</td>
                      <td className=" border py-2">{change.field}</td>
                      <td className="py-2 border ">
                        <button
                          onClick={() =>
                            setChanges((prev) => prev.filter((_, i) => i !== index))
                          }
                          className="text-red-500 hover:text-red-700 font-bold"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-4 text-gray-500">
                      No changes detected
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalRequest}
                className="px-4 py-2 rounded bg-[#FDCC03] hover:bg-yellow-500 text-black font-medium"
                disabled={loading || changes.length === 0}
              >
                Final Request
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default Intramural;
