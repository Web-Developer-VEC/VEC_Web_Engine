// IicFacnir.jsx
import React, { useState, useEffect } from "react";
import { Pencil, Save, Send, Trash2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadComp from "../../LoadComp";
import { useAdminRequest } from "../../../hooks/useAdminRequest"; // expects { sendRequest, loading }

const deepCopy = (v) => JSON.parse(JSON.stringify(v));

export default function IicFacnir({ data }) {
  const [rows, setRows] = useState([]); // array of { heading, content: [{id,name,count}] }
  const [original, setOriginal] = useState([]); // committed
  const [pending, setPending] = useState(null); // saved draft
  const [editing, setEditing] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const { sendRequest, loading } = useAdminRequest();

  // mapping from UI heading to backend category key
  const headingToCategory = (heading) => {
    const key = String(heading || "")
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "_");
    // if you want explicit mapping override here:
    // if (heading === "Registration Statistics") return "registration_statistics";
    return key;
  };

  // initialize rows & original from incoming data
  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      const nirSectionsArray = [
        {
          heading: "Registration Statistics",
          content:
            (data[0]?.content || []).map((item, index) => ({
              id: item.id ?? `r-0-${index}`,
              name: item.name ?? "",
              count: item.count ?? "",
            })) || [],
        },
        {
          heading: "Innovation Metrics",
          content:
            (data[1]?.content || []).map((item, index) => ({
              id: item.id ?? `r-1-${index}`,
              name: item.name ?? "",
              count: item.count ?? "",
            })) || [],
        },
        {
          heading: "Impact Assessment",
          content:
            (data[2]?.content || []).map((item, index) => ({
              id: item.id ?? `r-2-${index}`,
              name: item.name ?? "",
              count: item.count ?? "",
            })) || [],
        },
      ];

      setRows(nirSectionsArray);
      setOriginal(deepCopy(nirSectionsArray));
      setPending(null);
      setEditing(false);
      setShowRequestModal(false);
    }
  }, [data]);

  // derived flags
  const isDirty = JSON.stringify(rows) !== JSON.stringify(original);
  const hasPending = !!pending && JSON.stringify(pending) !== JSON.stringify(original);

  // UI handlers
  const handleEdit = () => setEditing(true);

  const handleCountChange = (sIdx, iIdx, value) => {
    setRows((prev) => {
      const updated = deepCopy(prev);
      updated[sIdx].content[iIdx].count = value;
      return updated;
    });
  };

  const handleNameChange = (sIdx, iIdx, value) => {
    setRows((prev) => {
      const updated = deepCopy(prev);
      updated[sIdx].content[iIdx].name = value;
      return updated;
    });
  };

  const toggleSelection = (id) => {

    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );

  };

  const deleteSelected = () => {
    setRows(prev =>
      prev.map(section => ({
        ...section,
        content: section.content.filter(
          item => !selectedItems.includes(item.id)
        )
      }))
    );

    setSelectedItems([]);
    setShowDeleteModal(false);
  };

  const handleAddItem = (sectionIndex) => {
    setRows((prev) => {
      const updated = deepCopy(prev);

      updated[sectionIndex].content.push({
        id: `new-${Date.now()}`,
        name: "",
        count: "",
      });

      return updated;
    });
  };

  const handleDeleteItem = (sectionIndex, itemIndex) => {
    setRows((prev) => {
      const updated = deepCopy(prev);

      updated[sectionIndex].content.splice(itemIndex, 1);

      return updated;
    });
  };

  const handleSave = () => {

    const cleanedRows = rows.map(section => ({

      ...section,

      content: section.content.filter(item =>

        String(item.name).trim() !== "" ||
        String(item.count).trim() !== ""

      )

    }));

    setRows(deepCopy(cleanedRows));

    setPending(deepCopy(cleanedRows));

    setSelectedItems([]);

    setEditing(false);

  };

  const handleCancel = () => {
    if (pending) {
      // revert current working copy to last draft
      setRows(deepCopy(pending));
    } else {
      // revert to original
      setRows(deepCopy(original));
    }

    setSelectedItems([]);   // <-- Clear all selected checkboxes
    setShowDeleteModal(false);
    setEditing(false);
  };

  const handleDiscard = () => {
    setPending(null);
    setRows(deepCopy(original));
    setShowDeleteModal(false);
    setSelectedItems([]);   // <-- Clear selected checkboxes
  };

  const handleRequest = () => {
    if (!pending) {
      return;
    }
    setShowRequestModal(true);
  };

  // Build change list (for modal UI) based on pending vs original
  const getChanges = () => {
    if (!pending) return [];
    const changes = [];

    // for each section index
    for (let sIdx = 0; sIdx < Math.max(original.length, pending.length); sIdx++) {
      const origSection = original[sIdx];
      const pendSection = pending[sIdx];

      // if original section missing and pending exists => Insert whole section
      if (!origSection && pendSection) {
        changes.push({
          action: "Added",
          section: pendSection.heading,
          sIdx,
          name: null,
          oldValue: null,
          newValue: JSON.stringify(pendSection.content),
        });
        continue;
      }

      // if pending missing but original present => Deleted whole section
      if (origSection && !pendSection) {
        changes.push({
          action: "Deleted",
          section: origSection.heading,
          sIdx,
          name: null,
          oldValue: JSON.stringify(origSection.content),
          newValue: null,
        });
        continue;
      }

      if (!origSection || !pendSection) continue;

      // iterate items: assume same item order / id positions; if different length handle accordingly
      const origMap = new Map(
        origSection.content.map(item => [item.id, item])
      );

      const pendMap = new Map(
        pendSection.content.map(item => [item.id, item])
      );

      // Deleted
      for (const [id, oldItem] of origMap) {

        if (!pendMap.has(id)) {

          changes.push({
            action: "Deleted",
            section: origSection.heading,
            sIdx,
            id,
            name: oldItem.name,
            oldValue: oldItem.count,
            newValue: null
          });

        }

      }

      // Added
      for (const [id, newItem] of pendMap) {

        if (!origMap.has(id)) {

          changes.push({
            action: "Added",
            section: pendSection.heading,
            sIdx,
            id,
            name: newItem.name,
            oldValue: null,
            newValue: newItem.count
          });

        }

      }

      // Edited
      for (const [id, newItem] of pendMap) {

        if (!origMap.has(id)) continue;

        const oldItem = origMap.get(id);

        if (
          oldItem.name !== newItem.name ||
          String(oldItem.count) !== String(newItem.count)
        ) {

          changes.push({
            action: "Edited",
            section: pendSection.heading,
            sIdx,
            id,
            name: newItem.name,
            oldValue: oldItem.count,
            newValue: newItem.count
          });

        }

      }
    }

    return changes;
  };

  const changes = getChanges();

  // Revert a single change from the modal (change object from getChanges)
  const revertChange = (change) => {
    if (!pending) return;
    const updated = deepCopy(pending);

    // If whole section was added/removed, handle accordingly
    if (change.name === null) {
      // whole section add/delete
      if (change.action === "Added") {
        // remove pending section
        updated.splice(change.sIdx, 1);
      } else if (change.action === "Deleted") {
        // re-insert original section from `original`
        const origSec = original[change.sIdx];
        if (origSec) {
          updated.splice(change.sIdx, 0, deepCopy(origSec));
        }
      }
    } else {

      const pendingSection = updated[change.sIdx];
      const originalSection = original[change.sIdx];

      if (!pendingSection || !originalSection) return;

      if (change.action === "Edited") {

        const pendingItem = pendingSection.content.find(
          item => item.id === change.id
        );

        const originalItem = originalSection.content.find(
          item => item.id === change.id
        );

        if (pendingItem && originalItem) {
          pendingItem.name = originalItem.name;
          pendingItem.count = originalItem.count;
        }

      }

      else if (change.action === "Added") {

        pendingSection.content = pendingSection.content.filter(
          item => item.id !== change.id
        );

      }

      else if (change.action === "Deleted") {

        const originalItem = originalSection.content.find(
          item => item.id === change.id
        );

        if (originalItem) {
          pendingSection.content.push(deepCopy(originalItem));
        }

      }

    }

    setPending(updated);
    setRows(deepCopy(updated));

    // Check if there are any changes left
    const stillHasChanges =
      JSON.stringify(updated) !== JSON.stringify(original);

    if (!stillHasChanges) {
      setPending(null);
      setShowRequestModal(false);
      setEditing(false); // optional
    }

    // if pending now equals original, clear draft
    if (JSON.stringify(updated) === JSON.stringify(original)) {
      setPending(null);
      setShowRequestModal(false);
    }
  };

  // Final request: build payload(s) comparing original vs pending and call sendRequest
  const handleFinalRequestConfirm = async () => {
    if (!pending) {
      return;
    }

    // Build payload array. For simplicity: treat each section as a unit (insert/update/delete).
    // meta_data.content will be array of { name, count } for that section.
    const payload = [];
    const origMapByHeading = new Map((original || []).map((sec) => [sec.heading, sec]));
    const pendMapByHeading = new Map((pending || []).map((sec) => [sec.heading, sec]));

    for (const [heading, pendSec] of pendMapByHeading.entries()) {

      const origSec = origMapByHeading.get(heading);
      const category = headingToCategory(heading);

      // New section
      if (!origSec) {

        pendSec.content.forEach(item => {
          payload.push({
            collectionName: "iic",
            collection_type: "yukti",
            action: "insert",
            title: `Insert yukti ${category}`,
            category,

            meta_data: {
              name: item.name,
              count: item.count
            }
          });
        });

        continue;
      }
      // Compare every item individually

      const oldMap = new Map(
        origSec.content.map(item => [item.id, item])
      );

      const newMap = new Map(
        pendSec.content.map(item => [item.id, item])
      );

      // Deleted
      for (const [id, oldItem] of oldMap) {

        if (!newMap.has(id)) {

          payload.push({
            collectionName: "iic",
            collection_type: "yukti",
            action: "delete",
            title: `Delete yukti ${category}`,
            category,

            meta_data: {
              name: oldItem.name,
              count: oldItem.count
            }
          });

        }

      }

      // Added
      for (const [id, newItem] of newMap) {

        if (!oldMap.has(id)) {

          payload.push({
            collectionName: "iic",
            collection_type: "yukti",
            action: "insert",
            title: `Insert yukti ${category}`,
            category,

            meta_data: {
              name: newItem.name,
              count: newItem.count
            }
          });

        }

      }

      // Updated
      for (const [id, newItem] of newMap) {

        if (!oldMap.has(id)) continue;

        const oldItem = oldMap.get(id);

        if (
          oldItem.name !== newItem.name ||
          String(oldItem.count) !== String(newItem.count)
        ) {

          payload.push({
            collectionName: "iic",
            collection_type: "yukti",
            action: "update",
            title: `Update yukti ${category}`,
            category,

            meta_data: {
              name: newItem.name,
              count: newItem.count
            },

            original_data: {
              name: oldItem.name,
              count: oldItem.count
            }
          });

        }

      }
    }

    if (payload.length === 0) {
      setShowRequestModal(false);
      return;
    }

    // send payload (no files)
    try {
      console.info("Yukti payload ->", payload);
      const result = await sendRequest(payload, []); // sendRequest(payloadArray, filesArray)
      console.info("sendRequest result:", result);

      const ok =
        result === true ||
        (result && (result.success === true || result.status === "ok" || result.status === "success"));

      if (ok) {
        // commit locally
        setOriginal(deepCopy(pending));
        setRows(deepCopy(pending));
        setPending(null);

        setEditing(false);
        setSelectedItems([]);      // <-- Add this

        setShowRequestModal(false);
      } else {
        const msg = (result && (result.message || result.error)) || "Request failed. Check console for details.";
        console.error("Yukti request failed:", result);
        // toast.error(msg);
      }
    } catch (err) {
      console.error("Yukti request error:", err);
    }
  };

  // render NIR content
  const renderNIRContent = () => (
    <div className="nir-container">
      <div className="relative mb-6 w-full">

        <h2 className="text-4xl text-brwn dark:text-drkt font-bold text-center pr-32">
          Yukti National Innovation Repository (NIR)
        </h2>

        {!editing && (
          <div className="absolute right-0 top-2 md:top-1/2 md:-translate-y-1/2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-secd dark:bg-drks text-text dark:text-prim rounded hover:bg-accn hover:text-prim dark:hover:bg-brwn"
            >
              <Pencil size={18} /> Edit
            </button>
          </div>
        )}

      </div>

      {/* Sections */}
      {rows.map((section, sIdx) => (
        <div
          key={sIdx}
          className="nir-section mb-8 w-full max-w-[1250px] mx-auto"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="nir-heading text-xl font-semibold">
              {section.heading}
            </h3>

            {editing && (
              <button
                onClick={() => handleAddItem(sIdx)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                + Add
              </button>
            )}

          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center">
            {section.content.map((item, iIdx) => (
              <div
                key={item.id}
                className="relative bg-[#FDCC03] rounded-xl shadow-lg w-full max-w-[450px] mx-auto p-5 min-h-[100px] overflow-hidden"
              >
                {editing && (
                  <div className="absolute top-3 right-3">

                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleSelection(item.id)}
                      className="w-5 h-5 cursor-pointer"
                    />

                  </div>
                )}
                {editing ? (
                  <>
                    <div className="flex items-center w-full gap-4">

                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleNameChange(sIdx, iIdx, e.target.value)}
                        placeholder="Title"
                        className="flex-1 min-w-0 border rounded-lg px-3 py-2 bg-white"
                      />

                      <input
                        type="text"
                        value={item.count}
                        onChange={(e) => handleCountChange(sIdx, iIdx, e.target.value)}
                        placeholder="Count"
                        className="w-24 border rounded-lg px-3 py-2 text-center bg-white"
                      />

                    </div>
                  </>
                ) : (
                  <span>
                    {item.name}: {item.count}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {editing && selectedItems.length > 0 && (
        <div className="delete-selected-container">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="delete-selected-btn"
          >
            <Trash2 size={20} />
            Delete Selected ({selectedItems.length})
          </button>
        </div>
      )}

      <div className="w-full">
        {/* Edit mode (Cancel + Save) */}
        {editing && (
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={handleCancel} className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500">
              Cancel
            </button>
            {isDirty && (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 rounded bg-secd dark:bg-drks text-text dark:text-prim hover:bg-accn hover:text-prim dark:hover:bg-brwn"
              >
                <Save size={18} /> Save
              </button>
            )}
          </div>
        )}

        {/* Pending state (Discard + Request) */}
        {pending && !editing && (
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={handleDiscard} className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500">
              Discard Changes
            </button>
            {hasPending && (
              <button
                onClick={handleRequest}
                className="flex items-center gap-2 px-4 py-2 rounded bg-secd dark:bg-drks text-text dark:text-prim hover:bg-accn hover:text-prim dark:hover:bg-brwn"
              >
                <Send size={18} /> Request
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <>
      <div className="nirf-content mt-4">
        <div className="nirf-details dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,prim)] height">
          {renderNIRContent()}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-text/50 flex items-center justify-center z-[1000]">

            <div className="bg-white rounded-xl shadow-lg w-[560px]">

              {/* Header */}
              <div className="px-8 pt-8">
                <h2 className="text-2xl font-bold text-gray-800">
                  Confirm Delete
                </h2>
              </div>

              {/* Message */}
              <div className="px-8 pt-8">
                <p className="text-gray-600 text-lg">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">
                    {selectedItems.length}
                  </span>{" "}
                  selected row{selectedItems.length > 1 ? "s" : ""}?
                </p>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4 px-8 py-8">

                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="w-[130px] h-[52px] rounded-xl bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold"
                >
                  Cancel
                </button>

                <button
                  onClick={deleteSelected}
                  className="w-[130px] h-[52px] rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold"
                >
                  Delete
                </button>

              </div>

            </div>

          </div>
        )}

        {/* Final Request Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-text/70 flex items-center justify-center z-[1000]">
            <div className="bg-prim p-6 rounded-xl w-[800px] max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Final Request</h2>
              <p className="text-sm text-red-500 mb-4">
                Note: Your changes will stay pending until approved by the superior admin. Once approved will go on live.
              </p>

              {changes.length > 0 ? (
                <table className="w-full text-center text-sm border">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border p-2">Action</th>
                      <th className="border p-2">Section</th>
                      <th className="border p-2">Item</th>
                      <th className="border p-2">Old Value</th>
                      <th className="border p-2">New Value</th>
                      <th className="border p-2">Undo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {changes.map((ch, i) => (
                      <tr key={i}>
                        <td className="border p-2 text-blue-600">{ch.action}</td>
                        <td className="border p-2">{ch.section}</td>
                        <td className="border p-2">{ch.name ?? "-"}</td>
                        <td className="border p-2">{ch.oldValue ?? "-"}</td>
                        <td className="border p-2">{ch.newValue ?? "-"}</td>
                        <td className="border p-2">
                          <button
                            onClick={() => revertChange(ch)}
                            className="p-1 rounded hover:bg-gray-100"
                            title="Revert this change"
                          >
                            <Trash2 size={16} className="text-red-500" />
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
                <button onClick={() => setShowRequestModal(false)} className="px-4 py-2 rounded bg-gray-400 text-prim">
                  Cancel
                </button>
                {changes.length > 0 && (
                  <button
                    onClick={handleFinalRequestConfirm}
                    disabled={loading}
                    className="px-4 py-2 rounded bg-secd dark:bg-drks text-text dark:text-prim hover:bg-accn hover:text-prim dark:hover:bg-brwn"
                  >
                    {loading ? "Processing..." : "Final Request"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <ToastContainer position="bottom-right" autoClose={2000} />
      </div>
    </>
  );
}
