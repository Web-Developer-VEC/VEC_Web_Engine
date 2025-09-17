import React, { useEffect, useState, useRef } from "react";
import { FaUserEdit } from "react-icons/fa";
import { Send, Trash2, ArrowDown } from "lucide-react";
import LoadComp from "../../LoadComp";

export default function Facilities({ data }) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  // refs
  const originalRef = useRef([]);
  const savedDataRef = useRef([]);

  // state
  const [isEditing, setIsEditing] = useState(false);
  const [isSavedOnce, setIsSavedOnce] = useState(false);
  const [editableData, setEditableData] = useState([]);
  const [sessionChanges, setSessionChanges] = useState([]);
  const [allChanges, setAllChanges] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());

  // modals
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // add new form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImageName, setNewImageName] = useState("");

  useEffect(() => {
    if (Array.isArray(data)) {
      const normalized = data.map((item) => {
        if (typeof item === "string") {
          return { image: item, name: "" };
        }
        return {
          image: item.image ?? item.img ?? "",
          name: item.name ?? item.title ?? "",
        };
      });
      setEditableData(normalized);
      originalRef.current = normalized;
      savedDataRef.current = JSON.parse(JSON.stringify(normalized));
    }
  }, [data]);

  const UrlParser = (path) => {
    if (!path) return "";
    if (typeof path === "string") {
      return path.startsWith("http") ? path : `${BASE_URL}${path}`;
    }
    if (path instanceof File) return URL.createObjectURL(path);
    return "";
  };

  // ---- editing ----
  const handleFieldChange = (index, newName) => {
    const oldVal = editableData[index]?.name ?? "";
    setEditableData((prev) => {
      const copy = prev.map((it) => ({ ...it }));
      copy[index].name = newName;
      return copy;
    });

    setSessionChanges((prev) => {
      const cp = [...prev];
      const existingIndex = cp.findIndex((c) => c.index === index && c.action !== "delete");
      if (existingIndex >= 0) {
        cp[existingIndex] = {
          ...cp[existingIndex],
          action: cp[existingIndex].action === "add" ? "add" : "edit",
          changes: {
            ...cp[existingIndex].changes,
            name: { old: oldVal, new: newName },
          },
        };
      } else {
        cp.push({
          index,
          action: savedDataRef.current[index] ? "edit" : "add",
          changes: { name: { old: oldVal, new: newName } },
        });
      }
      return cp;
    });
  };

  const handleNewFileSelect = (e) => {
    const f = e.target.files?.[0] ?? null;
    setNewImageFile(f);
  };

  const handleAddNew = () => {
    if (!newImageFile) return;
    const newItem = { image: newImageFile, name: newImageName || "" };
    setEditableData((prev) => {
      const idx = prev.length;
      const arr = [...prev, newItem];
      setSessionChanges((ch) => [...ch, { index: idx, action: "add", item: newItem }]);
      return arr;
    });
    setNewImageFile(null);
    setNewImageName("");
    setShowAddForm(false);
  };

  const toggleSelectRow = (index) => {
    const nxt = new Set(selectedRows);
    nxt.has(index) ? nxt.delete(index) : nxt.add(index);
    setSelectedRows(nxt);
  };

  const openDeleteConfirm = () => {
    if (selectedRows.size === 0) return;
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    const toDelete = [...selectedRows];
    setEditableData((prev) => prev.filter((_, i) => !selectedRows.has(i)));
    setSessionChanges((prev) => [
      ...prev,
      ...toDelete.map((idx) => ({ index: idx, action: "delete", deletedItem: editableData[idx] })),
    ]);
    setSelectedRows(new Set());
    setDeleteConfirmOpen(false);
  };

  // ---- workflow ----
  const hasUnsavedChanges =
    JSON.stringify(editableData) !== JSON.stringify(savedDataRef.current);

  const handleSave = () => {
    if (!hasUnsavedChanges) return;
    savedDataRef.current = JSON.parse(JSON.stringify(editableData));
    setAllChanges((prev) => [...prev, ...sessionChanges]);
    setSessionChanges([]);
    setIsEditing(false);
    setIsSavedOnce(true);
  };

  const handleCancelSession = () => {
    setEditableData(JSON.parse(JSON.stringify(savedDataRef.current)));
    setSessionChanges([]);
    setIsEditing(false);
  };

  const handleDiscardAll = () => {
    setEditableData(JSON.parse(JSON.stringify(originalRef.current)));
    savedDataRef.current = JSON.parse(JSON.stringify(originalRef.current));
    setSessionChanges([]);
    setAllChanges([]);
    setIsEditing(false);
    setIsSavedOnce(false);
  };

  const handleRequest = () => setShowRequestModal(true);

  const handleFinalRequestConfirm = () => {
    console.log("Submitting changes:", allChanges);
    originalRef.current = JSON.parse(JSON.stringify(savedDataRef.current));
    setAllChanges([]);
    setIsSavedOnce(false);
    setShowRequestModal(false);
  };

  if (!Array.isArray(data)) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  // ---- render ----
  return (
    <div className="bg-prim dark:bg-drkp min-h-screen font-[Poppins,sans-serif]">
      {/* top right edit */}
      <div className="flex justify-end pr-8 pt-6">
        {!isEditing && (
          <button
            className="flex items-center bg-[#fdcc03] px-3 py-2 rounded text-black"
            onClick={() => setIsEditing(true)}
          >
            <FaUserEdit className="mr-2" /> Edit
          </button>
        )}
      </div>

      <section className="max-w-6xl mx-auto py-10 px-4">
        <h2 className="text-2xl font-bold text-brwn dark:text-drkt mb-6 text-center">
          Explore Facilities
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {editableData.map((f, idx) => (
            <div
              key={idx}
              className="relative bg-prim dark:bg-black rounded-lg shadow hover:shadow-lg overflow-hidden transition-shadow"
            >
              <img
                src={UrlParser(f.image)}
                alt={f.name || `Facility ${idx + 1}`}
                className="w-full h-48 object-cover"
              />

              {isEditing && (
                <input
                  type="checkbox"
                  className="absolute top-2 right-2 w-6 h-6 z-20"
                  checked={selectedRows.has(idx)}
                  onChange={() => toggleSelectRow(idx)}
                />
              )}

              <div className="p-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={f.name}
                    onChange={(e) => handleFieldChange(idx, e.target.value)}
                    placeholder="Enter facility name"
                    className="w-full text-center border rounded px-2 py-1 text-black"
                  />
                ) : (
                  <h3 className="text-lg text-center font-semibold mb-2 text-text dark:text-drkt">
                    {f.name || "-"}
                  </h3>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* editing controls */}
        {isEditing && (
          <div className="mt-4 flex gap-4 items-center">
            <button
              className="bg-gray-400 text-white px-3 py-2 rounded"
              onClick={() => setShowAddForm((s) => !s)}
            >
              + Add New Facility
            </button>
            {selectedRows.size > 0 && (
              <button
                className="bg-red-600 text-white px-3 py-2 rounded"
                onClick={openDeleteConfirm}
              >
                <Trash2 className="inline mr-2" /> Delete Selected
              </button>
            )}
          </div>
        )}

        {/* add form */}
        {isEditing && showAddForm && (
          <div className="mt-4 p-4 border rounded max-w-md">
            <label className="block mb-2 font-medium">Image</label>
            <input type="file" accept="image/*" onChange={handleNewFileSelect} />
            <label className="block mt-3 mb-2 font-medium">Name</label>
            <input
              type="text"
              value={newImageName}
              onChange={(e) => setNewImageName(e.target.value)}
              placeholder="Facility name"
              className="w-full border rounded px-2 py-1 text-black"
            />
            <div className="mt-3 flex gap-2">
              <button
                className="bg-secd px-3 py-2 rounded text-white"
                onClick={handleAddNew}
              >
                Add
              </button>
              <button
                className="bg-gray-300 px-3 py-2 rounded"
                onClick={() => {
                  setShowAddForm(false);
                  setNewImageFile(null);
                  setNewImageName("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* bottom right controls */}
        <div className="py-6 flex justify-end gap-4 mr-8">
          {isEditing && (
            <>
              <button
                className="bg-gray-500 px-3 py-2 rounded text-white"
                onClick={handleCancelSession}
              >
                Cancel
              </button>
              {hasUnsavedChanges && (
                <button
                  className="border-4 border-yellow-400 px-3 py-2 rounded-lg"
                  onClick={handleSave}
                >
                  Save
                </button>
              )}
            </>
          )}

          {!isEditing && isSavedOnce && (
            <>
                <button
                className="bg-gray-500 px-3 py-2 rounded text-prim"
                onClick={handleDiscardAll}
              >
                Discard All
              </button>
              <button
                className="bg-secd text-text px-3 py-2 flex flex-row rounded  hover:bg-brwn hover:text-prim "
                onClick={handleRequest}
              >
                <Send className="mr-2" /> Request
              </button>
            </>
          )}
        </div>

        {/* 🔹 Final Request Modal (like Patents) */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
            <div className="bg-white p-6 rounded-xl w-[560px] max-h-[80vh] overflow-y-auto shadow-lg">
              <h2 className="text-xl font-semibold mb-2 text-center">
                 Request 
              </h2>
               <p className="text-sm text-red-500 mb-4">
        Note: Your changes will stay pending until approved by the superior admin. Once approved will go live.
      </p>

              <div className="max-h-[320px] overflow-y-auto mb-4">
                <table className="w-full text-sm text-left border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-3 border">Action</th>
                      <th className="py-2 px-3 border">Section</th>
                      <th className="py-2 px-3 border">Changed Field</th>
                    </tr> 
                  </thead>
                  <tbody>
                    {allChanges.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-4">
                          No changes to submit
                        </td>
                      </tr>
                    ) : (
                      allChanges.map((change, idx) => (
                        <tr key={idx} className="even:bg-white odd:bg-gray-50">
                          <td className="py-2 px-3 border align-top">
                            {change.action === "edit" && (
                              <span className="text-blue-600">✎ Edited</span>
                            )}
                            {change.action === "add" && (
                              <span className="text-green-600">+ Added</span>
                            )}
                            {change.action === "delete" && (
                              <span className="text-red-600">🗑 Deleted</span>
                            )}
                          </td>
                          <td className="py-2 px-3 border align-top">Facilities</td>
                          <td className="py-2 px-3 border text-[13px]">
                            {change.action === "delete" ? (
                              <div>Deleted {change.deletedItem?.name || "Unnamed"}</div>
                            ) : Object.keys(change.changes || {}).length === 0 ? (
                              <div>Added/changed entire facility</div>
                            ) : (
                              Object.entries(change.changes).map(([field, values]) => (
                                <div key={field} className="mb-1">
                                  <strong className="capitalize">{field}:</strong>{" "}
                                  {values.old ?? "-"}
                                  <ArrowDown className="inline mx-2" size={14} />
                                  {values.new ?? "-"}
                                </div>
                              ))
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 rounded bg-gray-400 text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinalRequestConfirm}
                  className="px-4 py-2 rounded bg-yellow-400 text-black"
                >
                  Final Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* delete confirm */}
        {deleteConfirmOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[1100]">
            <div className="bg-white rounded-xl w-[380px] p-6 shadow-lg text-center">
              <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
              <p className="text-sm mb-4">
                {selectedRows.size > 1
                  ? "Are you sure you want to delete selected images?"
                  : "Are you sure you want to delete this image?"}
              </p>
              <div className="flex justify-center gap-4">
                <button
                  className="bg-gray-400 px-4 py-2 rounded text-white"
                  onClick={() => setDeleteConfirmOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-red-600 px-4 py-2 rounded text-white"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
