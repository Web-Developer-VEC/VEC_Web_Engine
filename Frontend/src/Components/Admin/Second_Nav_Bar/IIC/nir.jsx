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
    toast.info("Draft discarded.");
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

    // Detect deleted sections (present in original but not in pending)
    for (const [heading, origSec] of origMapByHeading.entries()) {
      if (!pendMapByHeading.has(heading)) {
        const cat = headingToCategory(heading);
        payload.push({
          collectionName: "iic",
          collection_type: "yukti",
          action: "delete",
          title: `Delete yukti ${cat}`,
          category: cat,
          meta_data: { content: deepCopy(origSec.content) },
        });
      }
    }

    // Detect inserts and updates
    for (const [heading, pendSec] of pendMapByHeading.entries()) {
      const origSec = origMapByHeading.get(heading) || null;
      const cat = headingToCategory(heading);
      if (!origSec) {
        // Insert whole section
        payload.push({
          collectionName: "iic",
          collection_type: "yukti",
          action: "insert",
          title: `Insert yukti ${cat}`,
          category: cat,
          meta_data: { content: deepCopy(pendSec.content) },
        });
      } else {
        // Compare serialized content; if different -> update
        const origContent = JSON.stringify(origSec.content || []);
        const pendContent = JSON.stringify(pendSec.content || []);
        if (origContent !== pendContent) {
          payload.push({
            collectionName: "iic",
            collection_type: "yukti",
            action: "update",
            title: `Update yukti ${cat}`,
            category: cat,
            meta_data: { content: deepCopy(pendSec.content) },
            original_data: { content: deepCopy(origSec.content) },
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
          Yukthi National Innovation Repository (NIR)
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
          <h3 className="nir-heading text-xl font-semibold mb-2">{section.heading}</h3>
          <div className="nir-buttons grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.content.map((item, iIdx) => (
              <div
                key={item.id}
                className="iic-action-button bg-secd text-center m-auto dark:bg-drks hover:bg-accn hover:text-prim dark:hover:bg-brwn rounded-xl border-2 border-accn dark:border-drka p-4"
              >
                {editing ? (
                  <>
                    <div className="font-semibold mb-2 p-2">{item.name}:</div>
                    <input
                      type="text"
                      value={item.count}
                      onChange={(e) => handleCountChange(sIdx, iIdx, e.target.value)}
                      className="border p-1 rounded text-center w-full bg-prim dark:bg-drkp hover:text-text"
                      placeholder="Count"
                    />
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
