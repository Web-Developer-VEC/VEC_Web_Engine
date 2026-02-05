import React, { useState, useEffect, useRef } from "react";
import "./admin_SportsInfra.css";
import { Plus, Pencil, Trash2, Save, Send, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";
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
  const { sendRequest, loading, error } = useAdminRequest();
  const filesRef = useRef([]);

  console.log('====================================');
  console.log("Ajith", changes);
  console.log('====================================');

  useEffect(() => {
    const dataWithId = (initialData || []).map(item => ({
      ...item,
      id: item.id || Date.now() + Math.random(),
    }));

    setSportsData(dataWithId);
    setOriginalData(JSON.parse(JSON.stringify(dataWithId))); // deep copy
    setInitialSnapshot(JSON.parse(JSON.stringify(dataWithId)));
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

    setSportsData((prev) => {
      const next = [...prev, newCard];

      // 🧷 Register the change using the same state update
      setChanges((prevChanges) => [
        ...prevChanges,
        {
          id: newCard.id,
          type: "added",
          section: "Untitled",
          data: newCard,
          originalIndex: sportsData.length,   // 🧷 insertion point
        }

      ]);

      return next;
    });
  };

  const getCardAction = (id) => {
    const change = changes.find(c => c.id === id);
    return change?.type || null;  // "added" | "updated" | "deleted" | null
  };

  const buildSportsInfrastructurePayload = ({
    action,
    newData = {},
    oldData = {},
  }) => {

    /* -------------------- INSERT -------------------- */
    if (action === "Added") {
      return {
        collectionName: "sports",
        collection_type: "infrastructure",
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
        collection_type: "infrastructure",
        action: "update",
        title: "Updation of Infrastructure",

        meta_data: {
          title: newData.title,
          description: newData.description,
          image_path: newData.image_path,
        },

        original_data: {
          title: oldData.original_data?.title || oldData.meta_data?.title || oldData.title,
          description: oldData.original_data?.description || oldData.meta_data?.description || oldData.description,
          image_path: oldData.original_data?.image_path || oldData.meta_data?.image_path || oldData.image_path,
        },
      };
    }

    /* -------------------- DELETE -------------------- */
    if (action === "Deleted") {
      return {
        collectionName: "sports",
        collection_type: "infrastructure",
        action: "delete",
        title: "Deletion of Infrastructure",

        meta_data: {
          title: oldData.original_data?.title || oldData.meta_data?.title || oldData.title,
          description: oldData.original_data?.description || oldData.meta_data?.description || oldData.description,
          image_path: oldData.original_data?.image_path || oldData.meta_data?.image_path || oldData.image_path,
        },

        original_data: null,
      };
    }

    return null;
  };


  const handleDeleteSelected = () => {

    // 🚫 Block delete if card is already being edited or newly added
    const locked = selectedItems.filter(id => {
      const action = getCardAction(id);
      return action === "added" || action === "updated";
    });

    if (locked.length) {
      toast.error("Finish editing the selected cards before deleting them.");
      return;
    }

    if (selectedItems.length === 0) {
      toast.info("No items selected to delete.");
      return;
    }

    const deletedItems = sportsData.filter(item =>
      selectedItems.includes(item.id)
    );

    setSportsData(prev =>
      prev.filter(item => !selectedItems.includes(item.id))
    );

    setChanges(prev => [
      ...prev,
      ...deletedItems.map(d => {
        const originalIndex = sportsData.findIndex(item => item.id === d.id);
        return {
          id: d.id,
          type: "deleted",
          section: d.title || "Untitled",
          data: d,
          originalIndex
        };
      })
    ]);

    setSelectedItems([]);
    setShowDeleteModal(false);
    toast.success("Selected items deleted.");
  };


  // -------------------- SAVE --------------------
  const handleSave = () => {
    const invalidNewCards = sportsData.filter(c => c.isNew && !isCardValid(c));
    if (invalidNewCards.length) {
      toast.error("Fill all fields before saving");
      return;
    }

    // Update baseline for next edits
    setOriginalData(JSON.parse(JSON.stringify(sportsData.map(c => ({ ...c, isNew: false })))));

    setEditMode(false);
    setShowRequestButtons(true);
    setChanges([]);

    toast.success("Changes saved!");
  };

  // -------------------- DISCARD --------------------
  const handleDiscard = () => {
    setSportsData(initialSnapshot);
    setOriginalData(initialSnapshot);
    setSelectedItems([]);
    setChanges([]);
    setImagePreviews({});
    filesRef.current = [];
    setEditMode(false);
    setShowRequestButtons(false);
    toast.info("All changes since page load were discarded.");
  };

  // const confirmDiscard = () => {
  //   handleDiscard();
  //   setShowDiscardModal(false);
  // };
  // const handleRequestChanges = () => {
  //   const newChanges = [];

  //   const currentMap = new Map(sportsData.map((item) => [item.id, item]));
  //   const originalMap = new Map(originalData.map((item) => [item.id, item]));
  //   sportsData.forEach((item) => {
  //     if (!originalMap.has(item.id)) {
  //       newChanges.push({
  //         type: "added",
  //         section: item.title || "Untitled",
  //         fields: ["New item added"],
  //       });
  //     }
  //   });

  //   originalData.forEach((item) => {
  //     if (!currentMap.has(item.id)) {
  //       newChanges.push({
  //         type: "deleted",
  //         section: item.title || "Untitled",
  //         fields: ["Deleted item"],
  //       });
  //     }
  //   });

  //   // Updated
  //   sportsData.forEach((item) => {
  //     const orig = originalMap.get(item.id);
  //     if (orig) {
  //       const changedFields = [];
  //       if (orig.title !== item.title) changedFields.push("Title");
  //       if (orig.description !== item.description)
  //         changedFields.push("Description");
  //       if (orig.image_path !== item.image_path) changedFields.push("Image");

  //       if (changedFields.length > 0) {
  //         newChanges.push({
  //           type: "updated",
  //           section: item.title || "Untitled",
  //           fields: changedFields,
  //         });
  //       }
  //     }
  //   });

  //   setChanges(newChanges);
  //   setShowRequestModal(true);
  // };

  const isCardValid = (card) => {
    return (
      card.title?.trim() &&
      card.description?.trim() &&
      card.image_path
    );
  };


  const generatePayloadsAuto = () => {
    const payloads = [];

    // UPDATE & ADD
    sportsData.forEach(item => {
      const original = initialSnapshot.find(o => o.id === item.id);

      // ADD
      if (!original) {
        payloads.push(
          buildSportsInfrastructurePayload({
            action: "Added",
            newData: item,
          })
        );
        return;
      }

      // UPDATE
      if (
        item.title !== original.title ||
        item.description !== original.description ||
        item.image_path !== original.image_path
      ) {
        payloads.push(
          buildSportsInfrastructurePayload({
            action: "Edited",
            newData: item,
            oldData: original,
          })
        );
      }
    });

    // DELETE
    initialSnapshot.forEach(orig => {
      if (!sportsData.find(s => s.id === orig.id)) {
        payloads.push(
          buildSportsInfrastructurePayload({
            action: "Deleted",
            oldData: orig,
          })
        );
      }
    });

    return payloads;
  };

  //   const map = new Map();

  //   for (const ch of changes) {
  //     const prev = map.get(ch.id);

  //     // First time seen
  //     if (!prev) {
  //       map.set(ch.id, ch);
  //       continue;
  //     }

  //     // ADD ➜ DELETE  → remove completely
  //     if (prev.type === "added" && ch.type === "deleted") {
  //       map.delete(ch.id);
  //       continue;
  //     }

  //     // UPDATE ➜ DELETE → keep DELETE
  //     if (prev.type === "updated" && ch.type === "deleted") {
  //       map.set(ch.id, ch);
  //       continue;
  //     }

  //     // ADD ➜ UPDATE → keep ADD with latest data
  //     if (prev.type === "added" && ch.type === "updated") {
  //       map.set(ch.id, { ...prev, data: ch.data });
  //       continue;
  //     }

  //     // UPDATE ➜ UPDATE → keep latest
  //     if (prev.type === "updated" && ch.type === "updated") {
  //       map.set(ch.id, ch);
  //       continue;
  //     }

  //     // Otherwise latest action wins
  //     map.set(ch.id, ch);
  //   }

  //   return Array.from(map.values());
  // };
  const handleFinalRequest = async () => {
    const payloads = generatePayloadsAuto();
    const files = [];

    sportsData.forEach(item => {
      if (item.image_file) {
        files.push(item.image_file);
      }
    });

    if (!payloads.length) {
      toast.warn("No changes to submit");
      return;
    }

    console.log("FINAL PAYLOADS:", payloads);
    console.log("FILES:", files);

    await sendRequest(payloads, files);

    toast.success("Sports Infrastructure request submitted!");

    // ✅ Mark current state as new baseline
    setInitialSnapshot(JSON.parse(JSON.stringify(sportsData)));
    setOriginalData(JSON.parse(JSON.stringify(sportsData)));

    // ✅ Clear UI states
    setShowRequestModal(false);
    setShowRequestButtons(false);
    setChanges([]);
    filesRef.current = [];

  };




  const handleRevertChange = (index) => {
    setChanges(prevChanges => {
      const change = prevChanges[index];
      if (!change) return prevChanges;

      setSportsData(prevData => {
        let data = [...prevData];

        // 🔴 Undo ADD → remove new card
        if (change.type === "added") {
          return data.filter(item => item.id !== change.id);
        }

        // 🔵 Undo UPDATE → replace edited with original
        if (change.type === "updated") {
          return data.map(item =>
            item.id === change.id ? { ...change.original } : item
          );
        }

        // ⚫ Undo DELETE → restore in correct position
        if (change.type === "deleted") {
          const before = data.slice(0, change.originalIndex);
          const after = data.slice(change.originalIndex);
          return [...before, change.data, ...after];
        }

        return data;
      });

      return prevChanges.filter((_, i) => i !== index);
    });
  };

  const handleInputChange = (id, index, field, value) => {

    const action = getCardAction(id);
    if (action === "deleted") {
      toast.warn("Undo delete before editing this card.");
      return;
    }

    setSportsData(prev => {
      const next = prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );

      const updatedCard = next[index];
      const originalItem = originalData.find(o => o.id === id);

      setChanges(prevChanges => {

        // 🟡 NEW CARD — always keep it "added"
        if (updatedCard.isNew) {
          return prevChanges.map(c =>
            c.type === "added" && c.id === id
              ? { ...c, section: updatedCard.title || "Untitled", data: updatedCard }
              : c
          );
        }

        // 🧹 AUTO-REMOVE UPDATE IF BACK TO ORIGINAL
        if (
          updatedCard.title === originalItem.title &&
          updatedCard.description === originalItem.description &&
          updatedCard.image_path === originalItem.image_path
        ) {
          return prevChanges.filter(c => !(c.type === "updated" && c.id === id));
        }

        const existing = prevChanges.find(c => c.type === "updated" && c.id === id);

        if (existing) {
          return prevChanges.map(c =>
            c.id === id
              ? {
                ...c,
                section: updatedCard.title || "Untitled",
                fields: Array.from(new Set([...c.fields, field])),
                data: updatedCard,
                original: c.original || { ...originalItem }
              }
              : c
          );
        }

        return [
          ...prevChanges,
          {
            id,
            type: "updated",
            section: updatedCard.title || "Untitled",
            fields: [field],
            data: updatedCard,
            original: { ...originalItem }
          }
        ];
      });

      return next;
    });
  };
  const handleCancel = () => {
    setSportsData(originalData);
    setSelectedItems([]);
    setChanges([]);
    setImagePreviews({});
    filesRef.current = [];
    setEditMode(false);
    setShowRequestButtons(false);
    toast.info("Changes since last save were cancelled.");
  };

  const handleImageChange = (index, file) => {

    const id = sportsData[index].id;
    const action = getCardAction(id);

    if (action === "deleted") {
      toast.warn("Undo delete before editing this card.");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    const serverPath = `/static/images/sports/infrastructure/${file.name}`;

    setSportsData((prev) => {
      const next = prev.map((item, i) =>
        i === index
          ? {
            ...item,
            image_path: serverPath,
            image_file: file   // ⭐ ADD THIS LINE
          }
          : item
      );

      const updatedCard = next[index];

      setImagePreviews((prevImg) => ({
        ...prevImg,
        [updatedCard.id]: previewUrl,
      }));

      setChanges((prevChanges) => {
        // 🟡 NEW CARD
        if (updatedCard.isNew) {
          return prevChanges.map((c) =>
            c.type === "added" && c.id === updatedCard.id
              ? { ...c, data: updatedCard }
              : c
          );
        }
        // 🟢 EXISTING CARD
        const originalItem = originalData.find((o) => o.id === updatedCard.id);
        const existing = prevChanges.find(
          (c) => c.type === "updated" && c.id === updatedCard.id
        );

        if (existing) {
          return prevChanges.map((c) =>
            c.id === updatedCard.id
              ? {
                ...c,
                fields: Array.from(new Set([...c.fields, "Image"])),
                data: updatedCard,
                original: c.original || { ...originalItem },
              }
              : c
          );
        }

        return [
          ...prevChanges,
          {
            id: updatedCard.id,
            type: "updated",
            section: updatedCard.title || "Untitled",
            fields: ["Image"],
            data: updatedCard,
            original: { ...originalItem },
          },
        ];
      });

      return next;
    });

    filesRef.current.push({ field: "sports_infra_image", file });
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
            className="flex items-center gap-2 px-4 py-2 mt-4 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg mr-20"
            onClick={() => {
              setEditMode(true);
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
                            disabled={["added", "updated"].includes(getCardAction(card.id))}
                            checked={selectedItems.includes(card.id)}
                            onChange={(e) => handleSelect(card.id, e.target.checked)}
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
            onClick={handleCancel}
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
            onClick={() => handleDiscard()}
          >
            Discard Changes
          </button>
          <button
            className="px-4 py-2 bg-[#FDCC03] text-white rounded flex items-center gap-2"
            onClick={() => {
              const payloads = generatePayloadsAuto();

              const autoChanges = payloads.map((p, i) => ({
                id: i,
                type:
                  p.action === "insert" ? "added" :
                    p.action === "update" ? "updated" :
                      "deleted",
                data: p.meta_data,
                original: p.original_data,
                originalIndex: i
              }));

              setChanges(autoChanges);
              setShowRequestModal(true);
            }}
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
      {showRequestModal && (() => {
        const payloads = generatePayloadsAuto();
        return (
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
                      <th className="border p-2">Title</th>
                      <th className="border p-2">Undo</th> {/* ✅ ADD */}
                    </tr>
                  </thead>
                  <tbody>
                    {changes.map((change, i) => (
                      <tr key={i}>
                        <td className="border p-2 font-semibold">
                          {change.type === "added"
                            ? "Added"
                            : change.type === "updated"
                              ? "Edited"
                              : "Deleted"}
                        </td>

                        <td className="border p-2">Infrastructure</td>

                        <td className="border p-2">
                          {change.data?.title || "Untitled"}
                        </td>

                        {/* ✅ UNDO BUTTON */}
                        <td className="border p-2">
                          <button
                            onClick={() => handleRevertChange(i)}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            ✕
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
                  disabled={loading}
                    onClick={handleFinalRequest}
                    className="px-4 py-2 rounded bg-[#fdcc03] text-black hover:bg-[#800000] hover:text-white"
                  >
                    Final Request
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
};

export default SportsInfra;