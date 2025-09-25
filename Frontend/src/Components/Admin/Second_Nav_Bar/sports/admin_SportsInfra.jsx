import React, { useState, useEffect } from "react";
import "./admin_SportsInfra.css";
import { Plus, Pencil, Trash2, Save, Send, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SportsInfra = ({ data: initialData }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) =>
    path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  const [editMode, setEditMode] = useState(false);
  const [sportsData, setSportsData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [initialSnapshot, setInitialSnapshot] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showRequestButtons, setShowRequestButtons] = useState(false);
  const [imagePreviews, setImagePreviews] = useState({});
  const [changes, setChanges] = useState([]);

  console.log('====================================');
  console.log("Ajith",changes);
  console.log('====================================');

  useEffect(() => {
    const dataWithId = (initialData || []).map((item) => ({
      ...item,
      id: item.id || Date.now() + Math.random(),
    }));
    setSportsData(dataWithId);
    setOriginalData(dataWithId);
    setInitialSnapshot(dataWithId);
  }, [initialData]);

  const handleSelect = (id, isChecked) => {
    setSelectedItems((prev) =>
      isChecked ? [...prev, id] : prev.filter((itemId) => itemId !== id)
    );
  };
  const addNewCard = () => {
    const newCard = {
      id: Date.now(),
      title: "",
      description: "",
      isNew: true,
    };

    // Add to sportsData
    setSportsData((prev) => [...prev, newCard]);

    // Add to changes immediately as "Added"
    setChanges((prev) => [
      ...prev,
      {
        type: "added",
        section: "Untitled",
        data: newCard,
      },
    ]);
  };



  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) {
      toast.info("No items selected to delete.");
      return;
    }
    const deletedItems = sportsData.filter((item) =>
      selectedItems.includes(item.id)
    );
    setSportsData((prev) =>
      prev.filter((item) => !selectedItems.includes(item.id))
    );
    setChanges((prev) => [
      ...prev,
      ...deletedItems.map((d) => ({
        type: "deleted",
        section: d.title || "Untitled",
        fields: ["Deleted item"],
      })),
    ]);
    setSelectedItems([]);
    setShowDeleteModal(false);
    toast.success("Selected items deleted.");
  };

  // -------------------- SAVE --------------------
  const handleSave = () => {
    setOriginalData(sportsData);
    setEditMode(false);
    toast.success("Changes saved! Now you can request or discard.");
    setShowRequestButtons(true);
  };

  // -------------------- DISCARD --------------------
  const handleDiscard = () => {
    setSportsData(initialSnapshot);
    setSelectedItems([]);
    setShowRequestButtons(false);
    setChanges([]);
    setImagePreviews({});
    toast.info("All changes discarded. Page reset to initial data.");
  };
  const confirmDiscard = () => {
    handleDiscard();
    setShowDiscardModal(false);
  };
  const handleRequestChanges = () => {
    const newChanges = [];

    const currentMap = new Map(sportsData.map((item) => [item.id, item]));
    const originalMap = new Map(originalData.map((item) => [item.id, item]));
    sportsData.forEach((item) => {
      if (!originalMap.has(item.id)) {
        newChanges.push({
          type: "added",
          section: item.title || "Untitled",
          fields: ["New item added"],
        });
      }
    });

    originalData.forEach((item) => {
      if (!currentMap.has(item.id)) {
        newChanges.push({
          type: "deleted",
          section: item.title || "Untitled",
          fields: ["Deleted item"],
        });
      }
    });

    // Updated
    sportsData.forEach((item) => {
      const orig = originalMap.get(item.id);
      if (orig) {
        const changedFields = [];
        if (orig.title !== item.title) changedFields.push("Title");
        if (orig.description !== item.description)
          changedFields.push("Description");
        if (orig.image_path !== item.image_path) changedFields.push("Image");

        if (changedFields.length > 0) {
          newChanges.push({
            type: "updated",
            section: item.title || "Untitled",
            fields: changedFields,
          });
        }
      }
    });

    setChanges(newChanges);
    setShowRequestModal(true);
  };

  const handleRequestConfirm = () => {
    toast.success("Your changes have been requested for approval!");
    setShowRequestModal(false);
    setShowRequestButtons(false);
    setChanges([]);
  };

  const handleRevertChange = (index) => {
    const changeToRevert = changes[index];
    if (!changeToRevert) return;

    if (changeToRevert.type === "updated") {
      const itemToUpdate = sportsData.find(
        (item) => item.title === changeToRevert.section
      );
      const originalItem = originalData.find(
        (item) => item.title === changeToRevert.section
      );
      if (itemToUpdate && originalItem) {
        const updatedItem = { ...itemToUpdate };
        changeToRevert.fields.forEach((field) => {
          if (field === "Title") updatedItem.title = originalItem.title;
          if (field === "Description")
            updatedItem.description = originalItem.description;
          if (field === "Image") updatedItem.image_path = originalItem.image_path;
        });
        setSportsData((prev) =>
          prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
        );
      }
    } else if (changeToRevert.type === "deleted") {
      const originalItem = originalData.find(
        (item) => item.title === changeToRevert.section
      );
      if (originalItem) setSportsData((prev) => [...prev, originalItem]);
    } else if (changeToRevert.type === "added") {
      setSportsData((prev) =>
        prev.filter((item) => item.title !== changeToRevert.section)
      );
    }

    setChanges((prev) => prev.filter((_, i) => i !== index));
  };

const handleInputChange = (id, index, field, value) => {
  // Update card in sportsData
  setSportsData((prev) =>
    prev.map((item, idx) =>
      idx === index ? { ...item, [field]: value } : item
    )
  );

  const updatedCard = { ...sportsData[index], [field]: value };

  if (updatedCard.isNew) {
    // 🟡 For new cards: always keep them as "added"
    setChanges((prev) =>
      prev.map((change) =>
        change.type === "added" && change.data.id === id
          ? {
              ...change,
              section: updatedCard.title || "Untitled",
              data: updatedCard,
            }
          : change
      )
    );
    return; // exit early so the rest only runs for existing cards
  }

  // 🟢 For existing cards: mark as updated
  setChanges((prev) => {
    const existingIndex = prev.findIndex(
      (c) => c.id === id && c.fields?.includes(field)
    );

    // Add your logic for updating "updated" changes here
    // Example: simply add a new change if not found
    if (existingIndex === -1) {
      return [
        ...prev,
        {
          id,
          type: "updated",
          section: updatedCard.title || "Untitled",
          fields: [field],
        },
      ];
    }

    // Otherwise, update the existing change
    const next = [...prev];
    next[existingIndex].fields.push(field);
    return next;
  });
};

  const handleImageChange = (index, file) => {
    const url = URL.createObjectURL(file);
    const updated = [...sportsData];
    updated[index].image_path = url;
    setSportsData(updated);
    setImagePreviews((prev) => ({ ...prev, [updated[index].id]: url }));
    setChanges((prev) => [
      ...prev,
      {
        type: "updated",
        section: updated[index].title || "Untitled",
        fields: ["Image"],
      },
    ]);
  };

  const formatAction = (type) => {
    if (!type) return "";
    if (type === "added") return "Added";
    if (type === "updated") return "Edited";
    if (type === "deleted") return "Deleted";
    return type;
  };

  return (
    <>
      {/* EDIT BUTTON */}
      <div className="admin-controls-ug flex justify-end mb-2">
        {!editMode && (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg mr-20"
            onClick={() => {setEditMode(true);
              setShowRequestButtons(false)
            }}
          >
            <Pencil size={16} /> Edit
          </button>
        )}
      </div>

      {/* CARDS */}
      <div className="sports-container">
        {sportsData.map((item, index) =>
          index % 2 === 0 ? (
            <div key={index} className="sports-row flex gap-6 mb-6">
              {[0, 1].map((i) => {
                if (index + i >= sportsData.length) return null;
                const card = sportsData[index + i];
                return (
                  <div
                    key={card.id}
                    className="sports-item relative border border-gray-300 rounded-lg shadow-md flex-1 p-3"
                  >
                    <img
                      className="sport-img w-full h-40 object-cover rounded-t-lg"
                      src={imagePreviews[card.id] || UrlParser(card.image_path)}
                      alt={card.title}
                    />
                    {editMode ? (
                      <>
                        <div className="mt-2">
                          <label className="bg-secd text-text hover:bg-brwn hover:text-prim px-3 py-1 rounded cursor-pointer">
                            <span>{card.image_path ? "Replace" : "Upload"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                e.target.files[0] &&
                                handleImageChange(index + i, e.target.files[0])
                              }
                            />
                          </label>
                        </div>
                        <input
                          type="text"
                          value={card.title}
                         onChange={(e) =>
                                  handleInputChange(card.id, index + i, "title", e.target.value.toUpperCase())
                                }
                          className="w-full border p-2 rounded mt-2"
                        />
                        <textarea
                          value={card.description}
                          onChange={(e) =>
                          handleInputChange(card.id, index + i, "description", e.target.value)
                        }
                          className="w-full border p-2 rounded mt-2"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(card.id)}
                            onChange={(e) =>
                              handleSelect(card.id, e.target.checked)
                            }
                            className="w-6 h-8 accent-blue-500 cursor-pointer"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <h2 className="sports-title text-lg font-bold mt-2 px-3">
                          {card.title}
                        </h2>
                        <p className="sports-description text-sm px-3 pb-3">
                          {card.description}
                        </p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ) : null
        )}

        {/* ADD NEW CARD */}
        {editMode && (
          <div
            className="sports-item border-2 border-dashed border-gray-400 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 mt-4 py-6"
            onClick={addNewCard}
          >
            <Plus className="size-[30px] text-gray-500" />
            <span className="mt-2 text-gray-500">Add New</span>
          </div>
        )}
      </div>

      {/* DELETE SELECTED */}
      {editMode && selectedItems.length > 0 && (
        <div className="flex justify-center mt-4">
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md flex items-center gap-2"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 size={16} /> Delete Selected
          </button>
        </div>
      )}
      {editMode && !showRequestButtons && (
        <div className="flex justify-end gap-3 mt-6 mb-4 mr-12">
          <button
            className="px-4 py-2 bg-gray-400 text-white rounded"
            onClick={() => setShowDiscardModal(true)}
          >
            Cancel
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      )}

      {showRequestButtons && (
        <div className="flex justify-end gap-3 mt-6 mb-4 mr-12">
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded"
            onClick={() =>handleDiscard()}
          >
            Discard Changes
          </button>
          <button
            className="px-4 py-2 bg-[#FDCC03] text-white rounded flex items-center gap-2"
            onClick={() => setShowRequestModal(true)
            }
          >
            <Send size={16} /> Request
          </button>
        </div>
      )}

      {/* ---------------- MODALS ---------------- */}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[350px]">
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

      {/* REQUEST MODAL */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white p-6 rounded-xl w-[600px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl text-center font-bold mb-4 text-gray-800">
              Final Request
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior
              admin. Once approved, they will go live.
            </p>

            {changes.length > 0 ? (
              <table className="w-full text-center text-sm border">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border p-2">Action</th>
                    <th className="border p-2">Section</th>
                    <th className="border p-2"> Changed</th>
                    <th className="border p-2">Undo</th>
                  </tr>
                </thead>
                <tbody>
                  {changes.map((ch, i) => (
                    <tr key={i}>
                      <td className="border p-2 text-blue-600">
                        {formatAction(ch.type)}
                      </td>
                      <td className="border p-2">Infrastructure</td>
                      <td className="border p-2">
                       {ch.section }
                      </td>
                      <td className="border p-2">
                        <button
                          onClick={() => handleRevertChange(i)}
                          className="p-1 rounded hover:bg-gray-100"
                          title="Revert this change"
                        >
                          <X size={16} className="text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-600">No changes detected.</p>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              {changes.length > 0 && (
                <button
                  onClick={handleRequestConfirm}
                  className="px-4 py-2 rounded bg-[#fdcc03] text-black hover:bg-[#800000] hover:text-white"
                >
                  Final Request
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
};

export default SportsInfra;
