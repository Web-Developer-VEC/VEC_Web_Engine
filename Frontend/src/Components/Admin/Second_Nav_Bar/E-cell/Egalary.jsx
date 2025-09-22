import React, { useEffect, useState, useRef } from "react";
import "./Egalary.css";
import LoadComp from "../../LoadComp";
import { FaUserEdit } from "react-icons/fa";
import { Trash2, Send, ArrowDown, Pencil } from "lucide-react";

export default function Gall({ gallery }) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const originalRef = useRef([]);
  const savedDataRef = useRef([]);

  const [isEditing, setIsEditing] = useState(false);
  const [isSavedOnce, setIsSavedOnce] = useState(false);
  const [editableData, setEditableData] = useState([]);
  const [sessionChanges, setSessionChanges] = useState([]);
  const [allChanges, setAllChanges] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());

  // modals
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    if (Array.isArray(gallery)) {
      setEditableData(gallery);
      originalRef.current = gallery;
      savedDataRef.current = JSON.parse(JSON.stringify(gallery));
    }
  }, [gallery]);

  const UrlParser = (path) => {
    if (!path) return "";
    if (typeof path === "string") {
      return path.startsWith("http") ? path : `${BASE_URL}${path}`;
    }
    if (path instanceof File) return URL.createObjectURL(path);
    return "";
  };

  const handleUndoChange = (change) => {
  let newEditableData = [...editableData];
  let newAllChanges = [...allChanges];

  if (change.action === "add") {
    // Remove newly added image
    newEditableData = newEditableData.filter((_, idx) => idx !== change.index);
  } else if (change.action === "delete") {
    // Restore deleted image
    newEditableData.splice(change.index, 0, change.deletedItem);
  } else if (change.action === "edit") {
    // Revert edited image (if you track edited fields)
    newEditableData[change.index] = change.oldItem;
  }

  // Remove undone change from allChanges
  newAllChanges = newAllChanges.filter((c) => c !== change);

  setEditableData(newEditableData);
  setAllChanges(newAllChanges);
};


  // ---- editing ----
  const handleAddNew = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newItem = file;
    setEditableData((prev) => {
      const idx = prev.length;
      const arr = [...prev, newItem];
      setSessionChanges((ch) => [...ch, { index: idx, action: "add", item: newItem }]);
      return arr;
    });
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

  if (!Array.isArray(gallery)) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  // ---- render ----
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl text-center text-brwn dark:text-drkt my-4">
          Gallery
        </h2>
        {!isEditing && (
          <button
            className="flex items-center bg-[#fdcc03] px-3 py-2 rounded text-black"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="mr-2" /> Edit
          </button>
        )}
      </div>

      <div className="gallery-images grid grid-cols-2 md:grid-cols-3 gap-4">
        {editableData.map((imgPath, index) => (
          <div className="gallery-item relative" key={index}>
            <img
              src={UrlParser(imgPath)}
              alt={`Gallery ${index + 1}`}
              className="gallery-image rounded-lg shadow-md"
            />
            {isEditing && (
              <input
                type="checkbox"
                className="absolute top-2 right-2 w-6 h-6"
                checked={selectedRows.has(index)}
                onChange={() => toggleSelectRow(index)}
              />
            )}
          </div>
        ))}
      </div>

      {isEditing && (
        <div className="mt-4 flex gap-4 items-center">
          <label className="bg-gray-300 w-[410px] h-[350px] flex justify-center items-center border-4 border-dashed hover:border-bg-secd border-bg-text text-text px-3 py-2 rounded cursor-pointer">
            + Add New Image
            <input
              type="file"
              accept="image/*"
              onChange={handleAddNew}
              className="hidden"
            />
          </label>

          {selectedRows.size > 0 && (
            <button
              className="bg-red-600  flex justify-end mr-auto ml-40 text-white px-3 py-2 rounded"
              onClick={openDeleteConfirm}
            >
              <Trash2 className="inline mr-2" /> Delete Selected
            </button>
          )}
        </div>
      )}

      <div className="py-4 mt-4 flex justify-end gap-4">
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
                className="flex items-center bg-secd hover:bg-brwn text-text hover:text-prim px-3 py-2 rounded-lg"
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
              className="flex items-center bg-gray-500 px-3 py-2 rounded text-white"
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

      {/* 🔹 Final Request Modal */}
      {showRequestModal && (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
  <div className="bg-white p-6 rounded-xl w-[560px] max-h-[80vh] overflow-y-auto shadow-lg">
    <h2 className="text-xl font-semibold mb-2 text-center">Request</h2>
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
                  <th className="py-2 px-3 border">Undo</th>
                </tr>
              </thead>
      <tbody>
  {allChanges.length === 0 ? (
    <tr>
      <td colSpan={4} className="text-center py-4">
        No changes to submit
      </td>
    </tr>
  ) : (
    allChanges.map((change, idx) => (
      <tr key={idx} className="even:bg-white odd:bg-gray-50">
        <td className="py-2 px-3 border text-center">
          {change.action === "edit" && <span className="text-blue-600">✎ Edited</span>}
          {change.action === "add" && <span className="text-green-600">+ Added</span>}
          {change.action === "delete" && <span className="text-red-600">🗑 Deleted</span>}
        </td>
        <td className="py-2 px-3 border text-center">Gallery</td>
        <td className="py-2 px-3 border text-[13px]">
          {change.action === "delete"
            ? "Deleted image"
            : change.action === "add"
            ? "Added new image"
            : "Edited image"}
        </td>
        <td className="py-2 px-3 border text-center">
          <button
            className="text-red-500 font-bold"
            onClick={() => handleUndoChange(change)}
          >
            X
          </button>
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
        className="px-4 py-2 rounded bg-secd hover:bg-brwn text-text hover:text-prim"
      >
        Final Request
      </button>
    </div>
  </div>
</div>

      )}

      {/* Delete Confirmation */}
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
    </div>
  );
}
