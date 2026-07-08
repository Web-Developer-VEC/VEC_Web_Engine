import React, { useState, useEffect } from "react";
import LoadComp from "../../LoadComp";
import { Plus, Trash2, Send, Save, Pencil } from "lucide-react";
import { useAdminRequest } from "../../../hooks/useAdminRequest";
import { ToastContainer, toast } from "react-toastify";

const Others = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [others, setOthers] = useState([]);
  const [tempOthers, setTempOthers] = useState([]);
  const [editOthers, setEditOthers] = useState(false);
  const [selected, setSelected] = useState([]);
  const { sendRequest, loading: loadings, error } = useAdminRequest();
  // Modal states
  const [showRequestButtons, setShowRequestButtons] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [changes, setChanges] = useState([]);
  const hasChanges=changes.length>0
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  // Format data on load
  useEffect(() => {
    if (!data) {
      setOthers([]);
      setTempOthers([]);
      return;
    }

    const formattedData = data.map((item, index) => ({
      id: index + 1,

      // 🟢 UI editable
      text: item?.title || "No Title",

      // 🔴 DB snapshot (never changes)
      original_text: item?.title || "No Title",

      image_path: item?.image_path,
      image: UrlParser(item?.image_path),
      newFile: null,
    }));

    setOthers(formattedData);
    setTempOthers(formattedData);
  }, [data]);

  // Carousel auto-slide
  useEffect(() => {
    if (isHovered || others.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % others.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovered, others]);

  const handlePrev = () => {
    if (others.length === 0) return;
    setActiveIndex(
      (prevIndex) => (prevIndex - 1 + others.length) % others.length,
    );
  };

  const handleNext = () => {
    if (others.length === 0) return;
    setActiveIndex((prevIndex) => (prevIndex + 1) % others.length);
  };

  const handleInputChange = (id, field, value) => {
    setTempOthers((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
    const originalItem = others.find((o) => o.id === id);
    if (!originalItem || originalItem.original_text === value) return;

    setChanges((prev) => {
      const existing = prev.find((c) => c.id === id && c.action === "Edited");

      if (existing) {
        // store old value only once
        if (!(field in existing.fields)) {
          existing.fields[field] = originalItem[field];
        }
        return [...prev];
      }

      return [
        ...prev,
        {
          id,
          action: "Edited",
          fields: {
            [field]: originalItem[field],
          },
        },
      ];
    });
  };
  const buildOthersAchievementsPayload = ({ action, newData, oldData }) => {
    // 🟢 INSERT
    if (action === "Added") {
      return {
        collectionName: "sports",
        collection_type: "achivements",
        action: "insert",
        title: "Insertion of Achievements",
        category: "others",
        meta_data: {
          title: newData.text,
          image_path: newData.image_path,
        },
        original_data: null,
      };
    }

    // 🔵 UPDATE
    if (action === "Edited") {
      return {
        collectionName: "sports",
        collection_type: "achivements",
        action: "update",
        title: "Updation of Achievements",
        category: "others",
        meta_data: {
          title: newData.text,
          image_path: newData.image_path,
        },
        original_data: {
          title: oldData.text,
          image_path: oldData.image_path,
        },
      };
    }

    // 🔴 DELETE
    if (action === "Deleted") {
      return {
        collectionName: "sports",
        collection_type: "achivements",
        action: "delete",
        title: "Deletion of Achievements",
        category: "others",
        meta_data: {
          title: oldData.text,
          image_path: oldData.image_path,
        },
        original_data: null,
      };
    }

    return null;
  };

  const handleImageUpload = (id, file) => {
  const previewUrl = URL.createObjectURL(file);

  setTempOthers(prev =>
    prev.map(item =>
      item.id === id
        ? {
            ...item,
            image: previewUrl,   // UI preview
            newFile: file,       // actual upload
          }
        : item
    )
  );

  setChanges(prev => {
    const existing = prev.find(c => c.id === id && c.action === "Edited");
    const originalItem = others.find(o => o.id === id);

    if (!originalItem) return prev;

    // already marked as edited → do nothing
    if (existing) return prev;

    return [
      ...prev,
      {
        id,
        action: "Edited",
        fields: {
          image_path: originalItem.image_path, // DB snapshot
        },
      },
    ];
  });
};

  const applyRevert = (data, change) => {
    if (change.action === "Edited") {
      return data.map((item) => {
        if (item.id !== change.id) return item;

        // 🔥 revoke blob image if exists
        if (item.newFile && item.image?.startsWith("blob:")) {
          URL.revokeObjectURL(item.image);
        }

        return {
          ...item,
          ...change.fields,
          newFile: null,
        };
      });
    }

    if (change.action === "Added") {
      return data.filter((item) => item.id !== change.id);
    }

    if (change.action === "Deleted") {
      return [...data, change.oldValue].sort((a, b) => a.id - b.id);
    }

    return data;
  };

  const handleAddRow = () => {
    const newId = tempOthers.length
      ? Math.max(...tempOthers.map((a) => a.id)) + 1
      : 1;
    const newRow = { id: newId, text: "", image: "", newFile: null };
    setTempOthers((prev) => [...prev, newRow]);

    setChanges((prev) => [
      ...prev,
      {
        id: newId,
        action: "Added",
        field: "image",
        original_text: null, // ✅ FIX
        oldValue: null,
        newValue: newRow,
      },
    ]);
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleDeleteSelected = () => {
    const deletedItems = tempOthers.filter((item) =>
      selected.includes(item.id),
    );

    // remove rows from temp data
    setTempOthers((prev) => prev.filter((item) => !selected.includes(item.id)));

    setChanges((prev) => {
      let updated = [...prev];

      deletedItems.forEach((item) => {
        // ❌ remove ANY existing changes for this item
        updated = updated.filter((c) => c.id !== item.id);

        // ✅ add ONLY delete action
        updated.push({
          id: item.id,
          action: "Deleted",
          fields: {
            image: item.image,
            text: item.text,
          },
          oldValue: item,
        });
      });

      return updated;
    });

    setSelected([]);
    setShowDeleteModal(false);
  };

  const handleRevertChange = (index) => {
    const change = changes[index];

    setTempOthers((prev) => applyRevert(prev, change));
    setOthers((prev) => applyRevert(prev, change)); // 🔥 THIS WAS MISSING

    setChanges((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const invalid = tempOthers.some((item) => !item.text.trim() || !item.image);
    if (invalid) {
      alert("All fields (Description and Image) are mandatory!");
      return;
    }
    setOthers(tempOthers);
    setEditOthers(false);
    setShowRequestButtons(true);
  };

  const handleCancel = () => {
    setTempOthers(others);
    setEditOthers(false);
  };

  const handleDiscardChanges = () => {
    const formattedData =
      data?.map((item, index) => ({
        id: index + 1,
        text: item?.title || "No Title",
        original_text: item?.title || "No Title",
        image_path: item?.image_path,
        image: UrlParser(item?.image_path),
        newFile: null,
      })) || [];

    setOthers(formattedData);
    setTempOthers(formattedData);
    setSelected([]);
    setEditOthers(false);
    setShowRequestButtons(false);
    setShowDiscardModal(false);
    setCurrentPage(1);
    setActiveIndex(0);
  };

  // Pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = tempOthers.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(tempOthers.length / rowsPerPage);
  const [formData, setFormData] = useState({});
  const [originalData] = useState({ title: "Old Title", image: "old.png" });

  const handleFinalRequestConfirm = async () => {
    if (!changes.length) {
      return;
    }

    const payload = [];
    const files = [];

    changes.forEach((change) => {
      // 🔎 current & original rows
      const currentItem = tempOthers.find((i) => i.id === change.id);
      const originalItem = others.find((i) => i.id === change.id);

      // 🆕 ADD
      if (change.action === "Added") {
        const imagePath = currentItem.newFile
          ? `/static/images/sports/others/${currentItem.newFile.name}`
          : currentItem.image_path; // ✅ DB value

        const req = buildOthersAchievementsPayload({
          action: "Added",
          newData: {
            text: currentItem.text,
            image_path: imagePath,
          },
        });

        payload.push(req);
        if (currentItem.newFile) files.push(currentItem.newFile);
      }

      // ✏️ EDIT
      if (change.action === "Edited") {
        const imagePath = currentItem.newFile
          ? `/static/images/sports/others/${currentItem.newFile.name}`
          : currentItem.image_path;

        const req = buildOthersAchievementsPayload({
          action: "Edited",
          newData: {
            text: currentItem.text,
            image_path: imagePath,
          },
          oldData: {
            text: originalItem.original_text, // ✅ DB snapshot
            image_path: originalItem.image_path,
          },
        });

        payload.push(req);
        if (currentItem.newFile) files.push(currentItem.newFile);
      }

      // ❌ DELETE
      if (change.action === "Deleted") {
        const req = buildOthersAchievementsPayload({
          action: "Deleted",
          oldData: {
            text: change.oldValue.original_text, // ✅ DB snapshot
            image_path: change.oldValue.image_path,
          },
        });

        payload.push(req);
      }
    });

    console.log("📦 OTHERS ACHIEVEMENTS PAYLOAD:", payload);
    console.log("🖼 FILES:", files);

    await sendRequest(payload, files);
    setShowRequestModal(false);
  };

  // ---- Inline Modal Component ----
  const Modal = ({ title, children, onClose, actions, width = "500px" }) => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
      <div
        className="bg-white dark:bg-drkp p-6 rounded-xl max-h-[80vh] overflow-y-auto shadow-lg"
        style={{ width }}
      >
        {title && (
          <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
            {title}
          </h2>
        )}
        <div>{children}</div>
        {actions && (
          <div className="flex justify-end gap-2 mt-4">{actions}</div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Edit Button */}
      <div className="admin-controls-ug flex justify-end mb-2">
        {!editOthers && (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg mr-20"
            onClick={() => {
              setEditOthers(true);
              setShowRequestButtons(true);
            }}
          >
            <Pencil size={16} />
            Edit
          </button>
        )}
      </div>

      {data ? (
        <div className="relative w-full max-w-4xl mx-auto mb-10 mt-10">
          <h2 className="text-center text-accn dark:text-drkt text-3xl font-bold mb-4">
            Other Achievements
          </h2>

          {/* Carousel */}
          {!editOthers &&
            (others.length > 0 ? (
              <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div className="relative overflow-hidden rounded-lg shadow-lg">
                  <div
                    className="flex transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                  >
                    {others.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex-shrink-0 w-full transition-opacity duration-500 ease-in-out"
                        style={{ opacity: activeIndex === index ? 1 : 0.5 }}
                      >
                        <img
                          src={item.image}
                          alt="Achievement"
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

                  {/* Prev / Next */}
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

                {/* Dots */}
                <div className="flex justify-center space-x-2 mt-4">
                  {others.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2.5 h-2.5 rounded-full ${
                        activeIndex === index ? "bg-blue-500" : "bg-gray-300"
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

          {/* Edit Mode */}
          {editOthers && (
            <div className="overflow-x-auto border rounded-lg shadow-md p-4 bg-white dark:bg-gray-800">
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
                        {item.image && (
                          <img
                            src={item.image}
                            alt="preview"
                            className="w-20 h-20 object-cover rounded"
                          />
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
                          onChange={() => toggleSelect(item.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {tempOthers.length > rowsPerPage && (
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
              )}

              {/* Actions */}
              <div className="flex justify-center items-center mt-4 gap-2">
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

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={handleCancel}
                  className="px-4 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
                {hasChanges && (<button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg"
                >
                  Save
                </button>)}
              </div>
            </div>
          )}

          {/* Request Buttons */}
          {showRequestButtons && !editOthers && (
            <div className="flex justify-end gap-3 mt-6 mb-4 mr-12">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
                onClick={() => {
                  setShowDiscardModal(true);
                }}
              >
                Discard Changes
              </button>
              <button
                className="px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded flex items-center gap-2"
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

      {/* Delete Modal */}
      {showDeleteModal && (
        <Modal
          title="Confirm Delete"
          width="400px"
          onClose={() => setShowDeleteModal(false)}
          actions={
            <>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </>
          }
        >
          <p>Are you sure you want to delete the selected items?</p>
        </Modal>
      )}
        {showDiscardModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/40 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[350px]">
            <h2 className="font-semibold mb-4">Discard Changes?</h2>
            <p>All your unsaved changes will be lost.</p>
            <div className="flex justify-end gap-3 mt-4">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowDiscardModal(false)}>Cancel</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={handleDiscardChanges}>Discard</button>
            </div>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <Modal
          title="Request"
          width="750px"
          onClose={() => setShowRequestModal(false)}
          actions={
            <>
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalRequestConfirm}
                 disabled={loadings}
                className={`px-4 py-2 rounded bg-secd dark:drks text-text hover:text-drkt ${
                            loadings ? "cursor-progress" : "hover:bg-[#800000]"
                        }`}
              >
                {loadings ? "Processing..." : "Final Request"}
              </button>
            </>
          }
        >
          <p className="text-sm text-red-600 mb-4">
            Note: Your changes will stay pending until approved by the superior
            admin. Once approved, they will be applied automatically to the live
            site.
          </p>

          <table className="w-full text-sm text-text dark:text-drkt border">
            <thead className="bg-gray-100 dark:bg-gray-800 text-center">
              <tr>
                <th className="py-2 border">Action</th>
                <th className="py-2 border">Section</th>
                <th className="py-2 border">Changes</th>
                <th className="py-2 border">undo</th>
              </tr>
            </thead>
            <tbody>
              {changes.map((change, index) => (
                <tr key={index} className="border text-center">
                  <td
                    className={`py-2 border font-semibold
                      ${change.action === "Added" ? "text-green-600" : ""}
                      ${change.action === "Edited" ? "text-blue-600" : ""}
                      ${change.action === "Deleted" ? "text-red-600" : ""}`}
                  >
                    {change.action}
                  </td>
                  <td className="py-2 border">Other Achievements</td>
                  <td className="py-2 border">
                    <span className="px-2 py-1 bg-yellow-100 text-black rounded-md">
                      {change.action === "Deleted"
                        ? `image-${change.id}`
                        : `image-${change.id}`}
                    </span>
                  </td>
                  <td className="py-2 border">
                    <button
                      onClick={() => handleRevertChange(index)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      )}
    </>
  );
};

export default Others;
