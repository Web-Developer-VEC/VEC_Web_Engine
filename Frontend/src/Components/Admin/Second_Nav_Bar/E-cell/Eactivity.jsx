import React, { useState, useEffect } from "react";
import "./Eactivity.css";
import LoadComp from "../../LoadComp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook } from "@fortawesome/free-solid-svg-icons";
import { FaUserEdit } from "react-icons/fa";
import { Trash2, Send, Pencil, Eye } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const UrlParser = (path) => {
  return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
};

const EcellActivity = ({ year, pdfspath }) => (
  <button
    onClick={() => window.open(pdfspath, "_blank")}
    className="flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-prim dark:bg-drkb border-2 border-secd dark:border-secd text-text dark:text-prim text-lg font-medium hover:bg-yellow-600 shadow-md transition-all duration-200 no-underline cursor-pointer bg-transparent"
    type="button"
  >
    <FontAwesomeIcon icon={faBook} className="text-secd dark:text-drks" />
    {year}
  </button>
);

export default function ImageGallery({ activity }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [data, setData] = useState([]); // baseline
  const [savedData, setSavedData] = useState([]); // draft
  const [tempData, setTempData] = useState([]); // working copy
  const [showChangesPopup, setShowChangesPopup] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(new Set());
  const { sendRequest, loading, error } = useAdminRequest();

  // Initialize data with unique IDs
  useEffect(() => {
    if (Array.isArray(activity) && activity.length > 0) {
      const withIds = activity.map((item, idx) => ({
        ...item,
        _id: item._id || idx + "-" + Date.now(),
      }));
      setData(withIds);
      setSavedData(withIds);
      setTempData(withIds);
    }
  }, [activity]);

  // Editing controls
  const handleEdit = () => {
    setIsEditing(true);
    setIsSaved(false);
  };

  const handleSave = () => {
    for (let i = 0; i < tempData.length; i++) {
      if (!tempData[i].year || !tempData[i].pdf_path) {
        toast.error("⚠️ Please fill both Year and PDF Path before saving.");
        return;
      }
    }
    setSavedData([...tempData]);
    setIsEditing(false);
    setIsSaved(true);
    // toast.success("✅ Changes saved. You can edit again or request.");
  };

  const handleCancel = () => {
    setTempData([...savedData]);
    setIsEditing(false);
    setSelectedImage(new Set());

    if (JSON.stringify(savedData) !== JSON.stringify(data)) {
      setIsSaved(true);
    } else {
      setIsSaved(false);
    }

    // toast.info("✖️ Current editing session cancelled.");
  };

  const handleDiscardChanges = () => {
    setTempData([...data]);
    setSavedData([...data]);
    setIsSaved(false);
    // toast.info("🗑️ All changes discarded (reset to original).");
  };

  const handleRequest = () => {
    setShowChangesPopup(true);
  };

  const normalizePdfPath = (path) => {
    if (!path) return "";
    if (path.startsWith("/static")) return path;
    return `/static/pdfs/e_cell/${path}`;
  };


  const handleFinalRequest = async () => {
    const changes = getChanges();

    if (changes.length === 0) {
      toast.info("No changes to submit");
      return;
    }

    const payload = changes.map((change) => {
      // 🔹 INSERT
      if (change.type === "Added") {
        return {
          action: "insert",
          collectionName: "ecell",
          title: "Activity Insert",
          collection_type: "activity",
          meta_data: {
            year: change.changes.year,
            pdf_path: normalizePdfPath(change.changes.pdf_path),
          },
        };
      }

      // 🔹 UPDATE
      if (change.type === "Edited") {
        const original = data.find((d) => d._id === change._id);

        const meta_data = {};
        if (change.changes.year) {
          meta_data.year = change.changes.year.new;
        }
        if (change.changes.pdf_path) {
          meta_data.pdf_path = normalizePdfPath(
            change.changes.pdf_path.new
          );
        }

        return {
          action: "update",
          collectionName: "ecell",
          title: "Activity Update",
          collection_type: "activity",
          original_data: {
            year: original.year,
            pdf_path: normalizePdfPath(original.pdf_path),
          },
          meta_data,
        };
      }

      // 🔹 DELETE
      if (change.type === "Deleted") {
        return {
          action: "delete",
          collectionName: "ecell",
          title: "Activity Delete",
          collection_type: "activity",
          meta_data: {
            year: change.changes.year,
            pdf_path: normalizePdfPath(change.changes.pdf_path),
          },
        };
      }

      return null;
    }).filter(Boolean);

    console.log("FINAL PAYLOAD 👉", payload);

    const files = tempData
      .filter(item => item.pdf_file instanceof File)
      .map(item => item.pdf_file);

    console.log("PDF FILES 👉", files);
    try {
      await sendRequest(payload, files);


      // toast.success("📩 Request sent for admin approval");

      // lock state
      setData([...savedData]);
      setShowChangesPopup(false);
      setIsSaved(false);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      // toast.error("Failed to submit request");
    }
  };


  const handleChanges = (index, key, value) => {
    setTempData((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  const handleAddNew = () => {
    setTempData((prev) => [
      ...prev,
      { year: "", pdf_path: "", _id: Date.now() + "-" + Math.random() },
    ]);
  };

  const handleCheckBox = (index) => {
    setSelectedImage((prev) => {
      const currentImg = new Set(prev);
      if (currentImg.has(index)) currentImg.delete(index);
      else currentImg.add(index);
      return currentImg;
    });
  };

  const handleDelete = () => {
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    setTempData((prev) => prev.filter((item) => !selectedImage.has(prev.indexOf(item))));
    setSelectedImage(new Set());
    setDeleteConfirmOpen(false);
    // toast.success("🗑️ Selected activities deleted.");
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
  };

  // Diff generator using _id
  const getChanges = () => {
    const changes = [];
    const dataMap = new Map(data.map((item) => [item._id, item]));

    // Check all tempData items
    tempData.forEach((newItem) => {
      const oldItem = dataMap.get(newItem._id);
      if (!oldItem) {
        changes.push({
          _id: newItem._id,
          type: "Added",
          changes: newItem,
        });
      } else if (
        oldItem.year !== newItem.year ||
        oldItem.pdf_path !== newItem.pdf_path
      ) {
        changes.push({
          _id: newItem._id,
          type: "Edited",
          changes: {
            year: { old: oldItem.year, new: newItem.year },
            pdf_path: { old: oldItem.pdf_path, new: newItem.pdf_path },
          },
        });
      }
      dataMap.delete(newItem._id);
    });

    // Remaining items in dataMap were deleted
    for (let [_, oldItem] of dataMap) {
      changes.push({
        _id: oldItem._id,
        type: "Deleted",
        changes: oldItem,
      });
    }

    return changes;
  };

  if (!Array.isArray(activity)) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  // Add this function inside ImageGallery
  const handleUndoChange = (change) => {
    let newTempData = [...tempData];

    if (change.type === "Added") {
      // Remove newly added row
      newTempData = newTempData.filter((item) => item._id !== change._id);
    } else if (change.type === "Edited") {
      // Revert edited row
      const idx = newTempData.findIndex((item) => item._id === change._id);
      if (idx !== -1) {
        newTempData[idx] = { ...data.find((item) => item._id === change._id) };
      }
    } else if (change.type === "Deleted") {
      // Restore deleted row
      newTempData.push(change.changes);
    }

    setTempData(newTempData);
  };

  const getPdfPreviewUrl = (act) => {
    // Case 2: newly uploaded file from local
    if (act.pdf_file) {
      return URL.createObjectURL(act.pdf_file);
    }
    // Case 1: existing PDF from cloud
    return UrlParser(act.pdf_path);
  };


  return (
    <>
      {activity && (
        <div className="flex flex-col items-center my-12 px-4">
          {/* Header */}
          <div className="flex justify-between w-full px-8 mb-4">
            <h2 className="text-[32px] font-semibold text-brwn dark:text-drkt">
              E-Cell Activities
            </h2>
            {!isEditing && (
              <button
                className="flex items-center bg-[#fdcc03] px-3 py-2 rounded text-black hover:bg-[#800000] hover:!text-white transition duration-200"
                onClick={handleEdit}
              >
                <Pencil className="mr-2" /> Edit
              </button>
            )}
          </div>

          {/* Activities Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center items-center">
            {tempData?.map((act, index) => (
              <div
                key={act._id}
                className="relative flex flex-col items-center justify-center p-4 border rounded shadow-md"
              >
                <div className={`${isEditing && "border-secd border-2 rounded flex flex-col px-4 py-2 m-auto"}`}>

                  {isEditing ?
                    (
                      <>
                        <input
                          type="text"
                          value={act?.year || ""}
                          placeholder="Enter year"
                          className="w-full mb-2 border rounded p-2"
                          onChange={(e) =>
                            handleChanges(index, "year", e.target.value)
                          }
                          required
                        />
                        <div className="flex flex-row justify-center items-center gap-2">
                          <div className="my-2 flex flex-row justify-center">
                            <input
                              id={`pdf-upload-${index}`}
                              type="file"
                              accept="application/pdf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  // store both file name and file object
                                  handleChanges(index, "pdf_path", file.name);
                                  handleChanges(index, "pdf_file", file); // new field
                                }
                              }}
                            />


                            <label
                              htmlFor={`pdf-upload-${index}`}
                              className="cursor-pointer bg-[#fdcc03] px-2 py-2 text-black hover:bg-[#800000] hover:!text-white rounded inline-block transition duration-200"
                            >
                              {act.pdf_path ? " Replace File " : "Upload File"}
                            </label>
                          </div>
                          <p className="text-xs text-gray-500">
                            {act?.pdf_path ? (
                              <div className="flex flex-row items-center justify-center">

                                <a
                                  href={getPdfPreviewUrl(act)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-blue-500 hover:underline hover:cursor-pointer"
                                >
                                  <Eye className="w-8 h-8 ml-1 mt-2" />
                                </a>

                              </div>
                            ) : (
                              ""
                            )}
                          </p>
                        </div>

                        <input
                          type="checkbox"
                          className="absolute top-2 right-2"
                          checked={selectedImage.has(index)}
                          onChange={() => handleCheckBox(index)}
                        />
                      </>
                    ) : (
                      <EcellActivity
                        year={act?.year}
                        pdfspath={getPdfPreviewUrl(act)}
                      />
                    )}
                </div>
              </div>
            ))}

            {isEditing && (
              <div className="w-120 h-44">
                <button
                  className="bg-gray-200 text-black px-3 py-8 rounded w-full h-full border-dashed border-2 hover:border-[#800000] transition duration-200"
                  onClick={handleAddNew}
                >
                  + Add New Activity
                </button>
              </div>
            )}
          </div>

          {/* Delete Button */}
          {isEditing && selectedImage.size > 0 && (
            <div className="mt-4">
              <button
                className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded flex items-center gap-2 shadow-lg"
                onClick={handleDelete}
              >
                <Trash2 /> Delete Selected
              </button>
            </div>
          )}

          {/* Global Buttons */}
          <div className="py-4 mt-4 flex justify-end gap-4 w-full px-8">
            {isEditing && (
              <>
                <button
                  className="flex items-center bg-gray-400 hover:bg-gray-600 px-3 py-2 rounded text-white transition duration-200"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                {getChanges().length > 0 && (
                  <button
                    className="flex items-center bg-[#fdcc03] hover:bg-[#800000] text-black hover:!text-white px-3 py-2 rounded-lg transition duration-200"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                )}
              </>
            )}
            {!isEditing && isSaved && (
              <>
                <button
                  className="flex items-center bg-gray-400 hover:bg-gray-600 px-3 py-2 rounded text-white transition duration-200"
                  onClick={handleDiscardChanges}
                >
                  Discard Changes
                </button>
                <button
                  className="bg-[#fdcc03] text-black px-3 py-2 flex flex-row rounded hover:bg-[#800000] hover:!text-white transition duration-200"
                  onClick={handleRequest}
                >
                  <Send className="mr-2" /> Request
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showChangesPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[530px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-drkt text-center">
              Request
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin. Once approved will go live.
            </p>

            {getChanges().length > 0 ? (
              <table className="w-full text-left text-gray-800 dark:text-drkt text-sm">
                <thead>
                  <tr>
                    <th className="py-2 px-3 border text-center">Action</th>
                    <th className="py-2 px-3 border text-center">Section</th>
                    <th className="py-2 px-3 border text-left">Changed Field</th>
                    <th className="py-2 px-3 border text-center">Undo</th>
                  </tr>
                </thead>
                <tbody>
                  {getChanges().map((change) => (
                    <tr key={change._id} className="even:bg-white odd:bg-gray-50">
                      <td className="py-1 border font-semibold text-center">
                        {change.type === "Added" && <span className="text-green-600">+ Added</span>}
                        {change.type === "Deleted" && <span className="text-red-600">🗑 Deleted</span>}
                        {change.type === "Edited" && <span className="text-blue-600">✎ Edited</span>}
                      </td>
                      <td className="py-1 border text-center">Activity</td>
                      <td className="py-1 border text-[13px] text-center">
                        {change.type === "Deleted"
                          ? `Year: ${change.changes.year}`
                          : change.type === "Added"
                            ? `Year: ${change.changes.year}`
                            : `Year: ${change.changes.year?.new}`}
                      </td>
                      <td className="py-1 border text-center">
                        <button
                          className="text-red-500 font-bold"
                          onClick={() => handleUndoChange(change)}
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            ) : (
              <p className="text-gray-500 text-center">No changes detected</p>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowChangesPopup(false);
                  // setIsSaved(false);
                }}
                className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-600 text-white transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalRequest}
                className="px-4 py-2 rounded bg-[#fdcc03] text-black hover:bg-[#800000] hover:!text-white transition duration-200"
              >
                Final Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[1000]">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[400px]">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              Confirm Delete
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete the selected activities?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-600 rounded text-white transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={2000} />
    </>
  );
}
