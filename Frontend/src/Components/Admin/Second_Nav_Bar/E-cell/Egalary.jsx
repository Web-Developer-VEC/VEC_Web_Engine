import React, { useEffect, useState, useRef, useCallback } from "react";
import "./Egalary.css";
import LoadComp from "../../LoadComp";
import { Trash2, Send, Pencil } from "lucide-react";
import { useAdminRequest } from "../../../hooks/useAdminRequest";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Gall({ gallery }) {
  // Base URL (no trailing slash). Fallback to origin if not provided.
  const RAW_BASE = process.env.REACT_APP_BASE_URL || "";
  const BASE_URL = RAW_BASE.replace(/\/$/, "") || window.location.origin;

  // refs for original and saved normalized (string) arrays
  const originalRef = useRef([]);
  const savedDataRef = useRef([]);

  // state
  const [isEditing, setIsEditing] = useState(false);
  const [isSavedOnce, setIsSavedOnce] = useState(false);
  const [editableData, setEditableData] = useState([]); // items are string paths or File objects
  const [sessionChanges, setSessionChanges] = useState([]); // changes since last Save
  const [allChanges, setAllChanges] = useState([]); // persisted changes after Save
  const [selectedRows, setSelectedRows] = useState(new Set());

  // modals
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const { sendRequest } = useAdminRequest();

  // Map to keep object URLs for File previews (so we can revoke later)
  const objectUrlMap = useRef(new Map());

  // --- Utilities ---

  // Normalize an entry for comparisons/payloads:
  // - File -> "/static/images/e_cell/<filename>"
  // - string -> if startsWith("/static") return as-is; if startsWith("http") return as-is; else if filename -> "/static/images/e_cell/<filename>"
  const normalizeImagePath = (path) => {
    if (!path && path !== "") return "";
    if (path instanceof File) return `/static/images/e_cell/${path.name}`;
    if (typeof path === "string") {
      if (path.startsWith("/static")) return path;
      if (path.startsWith("http")) return path;
      // bare filename or "static/..." but no leading slash
      if (path.startsWith("static/")) return `/${path.replace(/^\/?/, "")}`;
      return `/static/images/e_cell/${path}`;
    }
    return "";
  };

  // normalize array of items (string or File) into array of server paths (strings)
  const toNormalizedArray = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map((it) => normalizeImagePath(it));
  };

  // Build a src URL for <img> given either a File or a string path
  const buildSrc = useCallback(
    (item) => {
      if (!item && item !== "") return "";

      // File -> local preview object URL (cache per-file)
      if (item instanceof File) {
        if (!objectUrlMap.current.has(item)) {
          const url = URL.createObjectURL(item);
          objectUrlMap.current.set(item, url);
        }
        return objectUrlMap.current.get(item);
      }

      // string handling
      if (typeof item === "string") {
        if (item.startsWith("http")) return item;

        if (item.startsWith("/")) {
          // server-relative path: prepend BASE_URL
          return `${BASE_URL}${item}`;
        }

        // bare filename or relative path -> assume under /static/images/e_cell/
        return `${BASE_URL}/static/images/e_cell/${item}`;
      }

      return "";
    },
    [BASE_URL]
  );

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      for (const url of objectUrlMap.current.values()) {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          // ignore
        }
      }
      objectUrlMap.current.clear();
    };
  }, []);

  // --- Initialize editableData from incoming prop `gallery` ---
  useEffect(() => {
    // gallery may be:
    //  - an array: ["/static/...", ...] OR array of strings
    //  - an object: { image_path: [...] }
    //  - an object: { data: { image_path: [...] }, type: 'gallery' }
    let initial = [];

    if (Array.isArray(gallery)) {
      initial = gallery;
    } else if (gallery && typeof gallery === "object") {
      if (Array.isArray(gallery.image_path)) {
        initial = gallery.image_path;
      } else if (gallery.data && Array.isArray(gallery.data.image_path)) {
        initial = gallery.data.image_path;
      } else {
        // defensive: try to find nested image_path anywhere
        const maybe = (gallery.data && gallery.data.image_path) || gallery.image_path;
        if (Array.isArray(maybe)) initial = maybe;
      }
    }

    if (!Array.isArray(initial)) initial = [];

    setEditableData(initial.slice()); // keep original types (strings)
    originalRef.current = toNormalizedArray(initial);
    savedDataRef.current = toNormalizedArray(initial);
    setSessionChanges([]);
    setAllChanges([]);
    setSelectedRows(new Set());
    setIsEditing(false);
    setIsSavedOnce(false);

    // Debugging helpful logs — remove in production
    // console.debug("[Admin Gall] init editableData:", initial);
  }, [gallery]);

  // has unsaved changes compared using normalized arrays (so File vs string compare correctly)
  const hasUnsavedChanges =
    JSON.stringify(toNormalizedArray(editableData)) !== JSON.stringify(savedDataRef.current);

  // --- Edit actions ---

  const handleAddNew = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditableData((prev) => {
      const idx = prev.length;
      const arr = [...prev, file];
      setSessionChanges((ch) => [...ch, { index: idx, action: "add", item: file }]);
      return arr;
    });
    // reset input so same file can be picked again if needed
    e.target.value = "";
  };

  const toggleSelectRow = (index) => {
    const nxt = new Set(selectedRows);
    if (nxt.has(index)) nxt.delete(index);
    else nxt.add(index);
    setSelectedRows(nxt);
  };

  const openDeleteConfirm = () => {
    if (selectedRows.size === 0) return;
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    // capture indices to delete
    const indices = [...selectedRows].sort((a, b) => a - b);
    setEditableData((prev) => {
      // record deleted items with their index relative to current prev
      const deletedRecords = indices.map((idx) => ({ index: idx, deletedItem: prev[idx] }));
      // new array without selected indices
      const newArr = prev.filter((_, i) => !selectedRows.has(i));
      // append delete changes to session
      setSessionChanges((prevCh) => [
        ...prevCh,
        ...deletedRecords.map((d) => ({ index: d.index, action: "delete", deletedItem: d.deletedItem })),
      ]);
      return newArr;
    });

    setSelectedRows(new Set());
    setDeleteConfirmOpen(false);
  };

  const handleUndoChange = (change) => {
    // Undo an item from allChanges (only works for persisted changes)
    const newEditable = [...editableData];
    let newAll = [...allChanges];

    if (change.action === "add") {
      // remove by recorded index if exists
      if (typeof change.index === "number" && change.index >= 0 && change.index < newEditable.length) {
        newEditable.splice(change.index, 1);
      } else {
        // fallback: remove first matching normalized path
        const target = normalizeImagePath(change.item);
        const idx = newEditable.findIndex((it) => normalizeImagePath(it) === target);
        if (idx !== -1) newEditable.splice(idx, 1);
      }
    } else if (change.action === "delete") {
      // re-insert deletedItem at recorded index (clamped)
      const insertAt = Math.min(Math.max(change.index, 0), newEditable.length);
      newEditable.splice(insertAt, 0, change.deletedItem);
    } else if (change.action === "edit") {
      newEditable[change.index] = change.oldItem;
    }

    newAll = newAll.filter((c) => c !== change);
    setEditableData(newEditable);
    setAllChanges(newAll);
  };

  // --- Workflow (save / cancel / request) ---

  const handleSave = () => {
    if (!hasUnsavedChanges) return;
    savedDataRef.current = toNormalizedArray(editableData); // persist normalized strings
    setAllChanges((prev) => [...prev, ...sessionChanges]);
    setSessionChanges([]);
    setIsEditing(false);
    setIsSavedOnce(true);
  };

  const handleCancelSession = () => {
    // revert to last saved (strings)
    setEditableData(savedDataRef.current.slice()); // savedDataRef is array of strings
    setSessionChanges([]);
    setIsEditing(false);
    setSelectedRows(new Set());
  };

  const handleDiscardAll = () => {
    const orig = originalRef.current.slice();
    setEditableData(orig.slice());
    savedDataRef.current = orig.slice();
    setSessionChanges([]);
    setAllChanges([]);
    setIsEditing(false);
    setIsSavedOnce(false);
    setSelectedRows(new Set());
  };

  const handleRequest = () => setShowRequestModal(true);

  // Build payload matching your backend shape — ensure image_path is an array
  const generatePayload = (files) => {
    return allChanges
      .map((change) => {
        if (change.action === "add") {

          let imagePath = "";

          if (change.item instanceof File) {

            const uniqueName = change.item.name;

            const renamedFile = new File(
              [change.item],
              uniqueName,
              {
                type: change.item.type,
              }
            );

            files.push(renamedFile);

            imagePath = `/static/images/e_cell/${uniqueName}`;
          }

          return {
            action: "insert",
            collectionName: "ecell",
            title: "gallery insert",
            collection_type: "gallery",
            meta_data: {
              image_path: [imagePath],

            },
          };
        }

        if (change.action === "edit") {
          return {
            action: "update",
            collectionName: "ecell",
            title: "gallery update",
            collection_type: "gallery",
            original_data: {
              image_path: [normalizeImagePath(change.oldItem)],
            },
            meta_data: {
              image_path: [normalizeImagePath(change.item)],
            },
          };
        }

        if (change.action === "delete") {
          return {
            action: "delete",
            collectionName: "ecell",
            title: "gallery delete",
            collection_type: "gallery",
            meta_data: {
              image_path: [normalizeImagePath(change.deletedItem)],
            },
          };
        }

        return null;
      })
      .filter(Boolean);
  };

  const handleFinalRequestConfirm = async () => {
    const files = [];
    const payload = generatePayload(files);
    if (!payload.length) {
      toast.info("No changes to submit");
      return;
    }

    try {
      await sendRequest(payload, files); // your hook will POST to admin

      // Update original references and clear persisted changes
      originalRef.current = savedDataRef.current.slice();
      setAllChanges([]);
      setIsSavedOnce(false);
      setShowRequestModal(false);
    } catch (err) {
      console.error("Request failed", err);
      toast.error("Failed to submit request");
    }
  };

  // --- Render / Guard ---

  // Show loader until editableData is an array (it will be a normalized array after init)
  if (!Array.isArray(editableData)) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <div className="p-8">
      <ToastContainer position="bottom-right" autoClose={2500} />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl text-center text-brwn dark:text-drkt my-4">Gallery</h2>
        {!isEditing && (
          <button className="flex items-center bg-[#fdcc03] px-3 py-2 rounded text-black hover:bg-[#800000] hover:!text-white transition duration-200" onClick={() => setIsEditing(true)}>
            <Pencil className="mr-2" /> Edit
          </button>
        )}
      </div>

      <div className="gallery-images grid grid-cols-2 md:grid-cols-3 gap-4">
        {editableData.map((imgPath, index) => (
          <div
            className="gallery-item relative"
            key={index + "-" + (typeof imgPath === "string" ? imgPath : imgPath.name)}
          >
            <img
              src={buildSrc(imgPath)}
              alt={`Gallery ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
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

        {/* ADD NEW IMAGE CARD */}
        {isEditing && (
          <label className="gallery-item bg-gray-300 rounded-lg border-4 border-dashed border-gray-400 hover:border-yellow-500 cursor-pointer flex items-center justify-center h-[250px]">
            <span className="text-lg font-semibold">
              + Add New Image
            </span>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAddNew}
            />
          </label>
        )}
      </div>

      <div className="py-4 mt-4 flex justify-end gap-4">

        {/* Action Buttons */}
        <div className="w-full mt-6">

          {isEditing && selectedRows.size > 0 && (
            <div className="w-full flex justify-center mb-6">
              <button
                onClick={openDeleteConfirm}
                className="px-8 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition flex items-center gap-2"
              >
                <Trash2 size={18} />
                Delete Selected ({selectedRows.size})
              </button>
            </div>
          )}

          {isEditing && (
            <div className="w-full flex justify-end gap-4">
              <button
                className="px-6 py-2 rounded-md bg-gray-400 text-white shadow-md hover:bg-gray-500 transition"
                onClick={handleCancelSession}
              >
                Cancel
              </button>

              {hasUnsavedChanges && (
                <button
                  className="flex items-center gap-2 px-6 py-2 rounded-md bg-[#fdcc03] text-black shadow-md hover:bg-[#800000] hover:!text-white transition"
                  onClick={handleSave}
                >
                  Save
                </button>
              )}
            </div>
          )}

          {!isEditing && isSavedOnce && (
            <div className="w-full flex justify-end gap-4">
              <button
                className="px-6 py-2 rounded-md bg-gray-400 text-white shadow-md hover:bg-gray-500 transition"
                onClick={handleDiscardAll}
              >
                Discard Changes
              </button>

              <button
                className="flex items-center gap-2 px-6 py-2 bg-[#fdcc03] text-black rounded-lg shadow-md hover:bg-[#800000] hover:!text-white transition"
                onClick={handleRequest}
              >
                <Send size={18} />
                Request
              </button>
            </div>
          )}

        </div>
      </div>
      {/* Final Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white p-6 rounded-xl w-[560px] max-h-[80vh] overflow-y-auto shadow-lg">
            <h2 className="text-xl font-semibold mb-2 text-center">Request</h2>
            <p className="text-sm text-red-500 mb-4">Note: Your changes will stay pending until approved by the superior admin. Once approved will go live.</p>
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
                          {change.action === "delete" ? "Deleted image" : change.action === "add" ? "Added new image" : "Edited image"}
                        </td>
                        <td className="py-2 px-3 border text-center">
                          <button className="text-red-500 font-bold" onClick={() => handleUndoChange(change)}>
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
              <button onClick={() => setShowRequestModal(false)} className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-600 text-white transition duration-200">
                Cancel
              </button>
              <button onClick={handleFinalRequestConfirm} className="px-4 py-2 rounded bg-secd hover:bg-brwn text-text hover:text-prim">
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
            <p className="text-sm mb-4">{selectedRows.size > 1 ? "Are you sure you want to delete selected images?" : "Are you sure you want to delete this image?"}</p>
            <div className="flex justify-center gap-4">
              <button className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-600 text-white transition duration-200" onClick={() => setDeleteConfirmOpen(false)}>
                Cancel
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}