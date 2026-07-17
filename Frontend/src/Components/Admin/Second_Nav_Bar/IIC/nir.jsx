// IicFacnir.jsx
import React, { useState, useEffect } from "react";
import { Pencil, Save, Send, X } from "lucide-react";
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
    // basic validation: ensure counts are present (do not block if zeros allowed)
    // Here we treat empty string as allowed (you can change to require numeric)
    setPending(deepCopy(rows));
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
    setEditing(false);
  };

  const handleDiscard = () => {
    // clear draft and revert working copy to original
    setPending(null);
    setRows(deepCopy(original));
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
      const maxItems = Math.max(origSection.content.length, pendSection.content.length);
      for (let iIdx = 0; iIdx < maxItems; iIdx++) {
        const origItem = origSection.content[iIdx];
        const pendItem = pendSection.content[iIdx];

        if (!origItem && pendItem) {
          changes.push({
            action: "Added",
            section: pendSection.heading,
            sIdx,
            iIdx,
            name: pendItem.name,
            oldValue: null,
            newValue: pendItem.count,
          });
          continue;
        }
        if (origItem && !pendItem) {
          changes.push({
            action: "Deleted",
            section: origSection.heading,
            sIdx,
            iIdx,
            name: origItem.name,
            oldValue: origItem.count,
            newValue: null,
          });
          continue;
        }
        // both exist -> check count change
        if (origItem && pendItem && String(origItem.count) !== String(pendItem.count)) {
          changes.push({
            action: "Edited",
            section: origSection.heading,
            sIdx,
            iIdx,
            name: origItem.name,
            oldValue: origItem.count,
            newValue: pendItem.count,
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
      // item-level revert
      if (change.action === "Edited") {
        updated[change.sIdx].content[change.iIdx].count = change.oldValue;
      } else if (change.action === "Added") {
        // remove added item
        updated[change.sIdx].content.splice(change.iIdx, 1);
      } else if (change.action === "Deleted") {
        // re-insert original item (find from original)
        const origItem = original[change.sIdx]?.content?.[change.iIdx];
        if (origItem) {
          updated[change.sIdx].content.splice(change.iIdx, 0, deepCopy(origItem));
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

      const maxLength = Math.max(
        origSec.content.length,
        pendSec.content.length
      );

      for (let i = 0; i < maxLength; i++) {

        const oldItem = origSec.content[i];
        const newItem = pendSec.content[i];

        // Added
        if (!oldItem && newItem) {

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

          continue;
        }

        // Deleted
        if (oldItem && !newItem) {

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

          continue;
        }

        // Updated
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
        setShowRequestModal(false);
        setEditing(false);
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
        {/* Title centered */}
        <h2 className="text-4xl text-brwn dark:text-drkt font-bold text-center">
          Yukti National Innovation Repository (NIR)
        </h2>

        {/* Edit button on right */}
        {!editing && (
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
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
        <div key={sIdx} className="nir-section mb-6">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {section.content.map((item, iIdx) => (
              <div
                key={item.id}
                className="relative bg-[#FDCC03] rounded-xl shadow-lg w-full max-w-[380px] mx-auto p-4 min-h-[90px] flex items-center"
              >
                {editing && (
                  <button
                    onClick={() => handleDeleteItem(sIdx, iIdx)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-700"
                  >
                    ✕
                  </button>
                )}
                {editing ? (
                  <>
                    <div className="flex items-center w-full gap-3">

                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleNameChange(sIdx, iIdx, e.target.value)}
                        placeholder="Title"
                        className="flex-1min-w-0 border rounded-lg px-3 py-2 bg-white"
                      />

                      <input
                        type="text"
                        value={item.count}
                        onChange={(e) => handleCountChange(sIdx, iIdx, e.target.value)}
                        placeholder="Count"
                        className="w-28 border rounded-lg px-3 py-2 text-center bg-white shrink-0"
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
