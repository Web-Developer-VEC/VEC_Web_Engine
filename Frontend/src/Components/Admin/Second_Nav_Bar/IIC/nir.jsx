import React, { useState, useEffect } from "react";
import { Pencil, Save, Send, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadComp from "../../LoadComp";

const deepCopy = (v) => JSON.parse(JSON.stringify(v));

export default function IicFacnir({ data }) {
  const [rows, setRows] = useState([]);
  const [original, setOriginal] = useState([]);
  const [pending, setPending] = useState(null);
  const [editing, setEditing] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Load data and set section headings
  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      const nirSectionsArray = [
        {
          heading: "Registration Statistics",
          content:
            data[0]?.content?.map((item, index) => ({
              id: item.id || `item-0-${index}`,
              name: item.name || "",
              count: item.count || "",
            })) || [],
        },
        {
          heading: "Innovation Metrics",
          content:
            data[1]?.content?.map((item, index) => ({
              id: item.id || `item-1-${index}`,
              name: item.name || "",
              count: item.count || "",
            })) || [],
        },
        {
          heading: "Impact Assessment",
          content:
            data[2]?.content?.map((item, index) => ({
              id: item.id || `item-2-${index}`,
              name: item.name || "",
              count: item.count || "",
            })) || [],
        },
      ];

      setRows(nirSectionsArray);
      setOriginal(deepCopy(nirSectionsArray));
    }
  }, [data]);

  const isDirty = JSON.stringify(rows) !== JSON.stringify(original);
  const hasPending = pending && JSON.stringify(pending) !== JSON.stringify(original);

  const handleEdit = () => setEditing(true);

const handleSave = () => {
  setPending(deepCopy(rows)); // Save current edits as draft
  setEditing(false);
  toast.success("Saved as draft!");
};

const handleDiscard = () => {
  if (pending) {
    setRows(deepCopy(original));
    setPending(null);
    toast.info("Draft discarded.");
  }
};


const handleCancel = () => {
  if (pending) {
    // If a draft exists, revert only current unsaved edits
    setRows(deepCopy(pending));
    toast.info("Cancelled edits. Draft preserved!");
  } else {
    // No draft, revert to original
    setRows(deepCopy(original));
    toast.info("Cancelled changes. Reverted to original data.");
  }
  setEditing(false);
};



  const handleRequest = () => setShowRequestModal(true);

  const confirmRequest = () => {
    setOriginal(deepCopy(pending));
    setRows(deepCopy(pending));
    setPending(null);
    setShowRequestModal(false);
    toast.success("Final request submitted!");
  };

  const handleCountChange = (sIdx, iIdx, value) => {
    setRows((prev) => {
      const updated = deepCopy(prev);
      updated[sIdx].content[iIdx].count = value;
      return updated;
    });
  };

  const getChanges = () => {
    if (!pending) return [];
    const changes = [];

    for (let sIdx = 0; sIdx < original.length; sIdx++) {
      const origSection = original[sIdx];
      const pendSection = pending[sIdx];
      if (!pendSection) continue;

      for (let iIdx = 0; iIdx < origSection.content.length; iIdx++) {
        const origItem = origSection.content[iIdx];
        const pendItem = pendSection.content[iIdx];

        if (pendItem && origItem.count !== pendItem.count) {
          changes.push({
            action: "Edited",
            section: origSection.heading,
            name: origItem.name,
            oldValue: origItem.count,
            newValue: pendItem.count,
            sIdx,
            iIdx,
          });
        }
      }
    }

    return changes;
  };

  const revertChange = (change) => {
    if (!pending) return;
    const updated = deepCopy(pending);
    updated[change.sIdx].content[change.iIdx].count = change.oldValue;
    setPending(updated);
    setRows(deepCopy(updated));
  };

  const changes = getChanges();

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
        <div key={sIdx} className="nir-section">
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
                  <span>{item.name}: {item.count}</span>
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
      <button
        onClick={handleCancel}
        className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500"
      >
        Cancel
      </button>
      {isDirty && (
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded bg-secd dark:bg-drks text-text dark:text-prim hover:bg-accn hover:text-prim dark:hover:bg-brwn"
        >
           Save
        </button>
      )}
    </div>
  )}

  {/* Pending state (Discard + Request) */}
  {pending && !editing && (
    <div className="flex justify-end gap-3 mt-6">
      <button
        onClick={handleDiscard}
        className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500"
      >
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

  return (
    <>
      {data ? (
        <div className="nirf-content mt-4">
          <div className="nirf-details dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,prim)] height">
            {renderNIRContent()}
          </div>

          {/* Final Request Modal */}
          {showRequestModal && (
            <div className="fixed inset-0 bg-text/70 flex items-center justify-center z-[1000]">
              <div className="bg-prim p-6 rounded-xl w-[600px] max-h-[80vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Final Request</h2>
                <p className="text-sm text-red-500 mb-4">
                  Note: Your changes will stay pending until approved by the superior admin.
                            Once approved will go on live.
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
                        <th className="border p-2">Revert</th>
                      </tr>
                    </thead>
                    <tbody>
                      {changes.map((ch, i) => (
                        <tr key={i}>
                          <td className="border p-2 text-blue-600">{ch.action}</td>
                          <td className="border p-2">{ch.section}</td>
                          <td className="border p-2">{ch.name}</td>
                          <td className="border p-2">{ch.oldValue}</td>
                          <td className="border p-2">{ch.newValue}</td>
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
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="px-4 py-2 rounded bg-gray-400 text-prim"
                  >
                    Cancel
                  </button>
                  {changes.length > 0 && (
                    <button
                      onClick={confirmRequest}
                      className="px-4 py-2 rounded bg-secd dark:bg-drks text-text dark:text-prim hover:bg-accn hover:text-prim dark:hover:bg-brwn"
                    >
                      Final Request
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <ToastContainer position="bottom-right" autoClose={2000} />
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp />
        </div>
      )}
    </>
  );
}
