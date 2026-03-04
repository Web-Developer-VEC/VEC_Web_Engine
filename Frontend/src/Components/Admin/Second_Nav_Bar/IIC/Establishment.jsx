// Components/Second_Nav_Bar/IIC/IicEst.jsx
import React, { useState, useEffect } from "react";
import LoadComp from "../../LoadComp";
import { Pencil, Trash2, Plus, Save, Send, X, PlusCircle } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

const deepCopy = (v) => JSON.parse(JSON.stringify(v));

/* -----------------------
   IicEco (small subcomponent)
   - Controlled by parent via props (data, isEditing, onUpdate)
   - Preserves class names/markup you provided
   - View mode does not render bullet for empty points
   ----------------------- */
function IicEco({ data, isEditing, onUpdate }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  const handleChange = (index, value) => {
    const newData = [...data];
    newData[index] = value;
    onUpdate(newData);
  };

  const handleAddPoint = () => {
    const newData = [...data, ""];
    onUpdate(newData);
  };

  const handleRemovePoint = (index) => {
    const newData = data.filter((_, i) => i !== index);
    onUpdate(newData);
  };

  return (
    <div className="mb-10">
      <div className="card-plc functions-info-panel border-l-4 border-secd dark:border-drks dark:bg-drkb">
        <h1 className="text-accn dark:text-drkt text-4xl">I & E Ecosystem</h1>
        <h2 className="text-[30px] iic-eco">Functions of IIC</h2>

        {isEditing ? (
          <div className="py-2">
            {data.map((point, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <div className="w-full">
                  <div className="flex items-center mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Function Point {i + 1} <span className="text-red-500">*</span>
                    </label>
                    {!point.trim() && (
                      <span className="ml-2 text-xs text-red-500">(Required)</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => handleChange(i, e.target.value)}
                    className={`w-full p-2 border rounded ${
                      !point.trim() ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="Function point (required)"
                    required
                  />
                </div>
                <button
                  onClick={() => handleRemovePoint(i)}
                  className="p-2 text-red-500 hover:text-red-700 mt-6"
                  title="Remove point"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
            {/* Keep Add UI commented (as per original) - uncomment if needed */}
            {/* <button onClick={handleAddPoint} className="flex items-center gap-1 mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                <Plus size={16} /> Add Point
              </button> */}
          </div>
        ) : (
          <p className="text-justify">
            {data
              .filter((p) => String(p || "").trim() !== "")
              .map((point, i) => (
                <span key={i}>
                  <br />• {point}
                </span>
              ))}
          </p>
        )}
      </div>
    </div>
  );
}

/* -----------------------
   IicEst (main exported component)
   - Integrates editing, draft, final request
   - Builds payloads using the structure you provided
   - Uses useAdminRequest to send payload array (no files in these payloads)
   - Preserves your commented validation block (left intact, commented)
   - Removes empty points from payload & view mode bullets
   ----------------------- */
function IicEst({ data }) {
  const [items, setItems] = useState([]); // array of { category, content }
  const [committedItems, setCommittedItems] = useState([]);
  const [pendingItems, setPendingItems] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [emptyFields, setEmptyFields] = useState({});

  const { sendRequest, loading } = useAdminRequest();

  // Initialize data into items: expect `data` to be array of objects { category, content } (as your earlier code)
  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      const copy = deepCopy(data);
      setCommittedItems(copy);
      setItems(deepCopy(copy));
      setPendingItems(null);
      setIsEditing(false);
      setIsDirty(false);
      setIsSaved(false);
      setEmptyFields({});
    }
  }, [data]);

  // Helpers to get content by category
  const getCategory = (list, category) => {
    const item = (list || []).find((it) => it.category === category);
    return item ? item.content : [];
  };

  // Check for empty fields across all categories
  const checkEmptyFields = (itemsList) => {
    const empty = {};
    
    itemsList.forEach(item => {
      if (item.category === "vision" || item.category === "mission") {
        // Single text field
        if (!String(item.content || "").trim()) {
          empty[item.category] = true;
        }
      } else {
        // Array fields
        if (Array.isArray(item.content)) {
          const emptyIndices = item.content.reduce((acc, val, idx) => {
            if (!String(val || "").trim()) {
              acc.push(idx);
            }
            return acc;
          }, []);
          if (emptyIndices.length > 0) {
            empty[item.category] = emptyIndices;
          }
        }
      }
    });
    
    return empty;
  };

  // Start editing (load pending draft if exists)
  const handleStartEdit = () => {
    if (pendingItems) {
      setItems(deepCopy(pendingItems));
      setIsSaved(!!pendingItems);
      setEmptyFields(checkEmptyFields(pendingItems));
    } else {
      setItems(deepCopy(committedItems));
      setIsSaved(false);
      setEmptyFields(checkEmptyFields(committedItems));
    }
    setIsEditing(true);
    setIsDirty(false);
  };

  // Generic change handler for category content (works for array or simple string)
  const handleChange = (category, index, value) => {
    const updated = items.map((it) => {
      if (it.category !== category) return it;
      if (Array.isArray(it.content)) {
        const nc = [...it.content];
        nc[index] = value;
        return { ...it, content: nc };
      } else {
        // single value (vision/mission) treat index 0
        return { ...it, content: value };
      }
    });
    setItems(updated);
    setIsDirty(true);
    
    // Update empty fields
    setEmptyFields(checkEmptyFields(updated));
  };

  const handleAddPoint = (category) => {
    const updated = items.map((it) => {
      if (it.category !== category) return it;
      const contentArr = Array.isArray(it.content) ? [...it.content, ""] : [it.content || "", ""];
      return { ...it, content: contentArr };
    });
    setItems(updated);
    setIsDirty(true);
    setEmptyFields(checkEmptyFields(updated));
  };

  const handleRemovePoint = (category, index) => {
    const updated = items.map((it) => {
      if (it.category !== category) return it;
      if (!Array.isArray(it.content)) return it;
      const contentArr = it.content.filter((_, i) => i !== index);
      return { ...it, content: contentArr };
    });
    setItems(updated);
    setIsDirty(true);
    setEmptyFields(checkEmptyFields(updated));
  };

  const handleCancel = () => {
    if (pendingItems) {
      setItems(deepCopy(pendingItems));
      setIsSaved(true);
      setEmptyFields(checkEmptyFields(pendingItems));
    } else {
      setItems(deepCopy(committedItems));
      setIsSaved(false);
      setEmptyFields(checkEmptyFields(committedItems));
    }
    setIsEditing(false);
    setIsDirty(false);
  };

  const handleSave = () => {
    // Validate all fields are filled
    const emptyFieldsObj = checkEmptyFields(items);
    const hasEmptyFields = Object.keys(emptyFieldsObj).length > 0;
    
    if (hasEmptyFields) {
      // Create detailed error message
      const emptyMessages = [];
      
      Object.entries(emptyFieldsObj).forEach(([category, value]) => {
        if (category === "vision") {
          emptyMessages.push("Vision statement");
        } else if (category === "mission") {
          emptyMessages.push("Mission statement");
        } else if (category === "majorfocus") {
          if (Array.isArray(value)) {
            emptyMessages.push(`Major Focus (paragraphs ${value.map(v => v + 1).join(', ')})`);
          }
        } else if (category === "function") {
          if (Array.isArray(value)) {
            emptyMessages.push(`Functions of IIC (points ${value.map(v => v + 1).join(', ')})`);
          }
        }
      });
      
      toast.error(`Please fill all required fields: ${emptyMessages.join(', ')}`);
      return;
    }

    // Clean empty points from array-type content before saving as draft
    const cleaned = items.map((it) => {
      if (Array.isArray(it.content)) {
        return { ...it, content: it.content.filter((p) => String(p || "").trim() !== "") };
      }
      return { ...it, content: typeof it.content === "string" ? it.content.trim() : it.content };
    });

    const pending = deepCopy(cleaned);
    setPendingItems(pending);
    setItems(deepCopy(cleaned));
    setIsSaved(true);
    setIsEditing(false);
    setIsDirty(false);
    setEmptyFields({});
    toast.success("Changes saved successfully!");
  };

  const handleDiscard = () => {
    setItems(deepCopy(committedItems));
    setPendingItems(null);
    setIsSaved(false);
    setIsDirty(false);
    setEmptyFields({});
    toast.info("Changes discarded!");
  };

  const handleRequest = () => {
    // Check for empty fields in pending items
    if (pendingItems) {
      const emptyFieldsObj = checkEmptyFields(pendingItems);
      if (Object.keys(emptyFieldsObj).length > 0) {
        toast.error("Cannot request with empty fields. Please edit and fill all required fields.");
        return;
      }
    }
    setShowRequestModal(true);
  };

  // Build changes array used in modal UI
  const getChanges = () => {
    if (!pendingItems) return [];
    const changes = [];

    const committedMap = new Map((committedItems || []).map((it) => [it.category, it]));
    const pendingMap = new Map((pendingItems || []).map((it) => [it.category, it]));

    // For each pending category compare serialized content to committed content
    for (const [category, newItem] of pendingMap.entries()) {
      const oldItem = committedMap.get(category) || { content: [] };
      const oldContent = Array.isArray(oldItem.content) ? oldItem.content : [oldItem.content];
      const newContent = Array.isArray(newItem.content) ? newItem.content : [newItem.content];

      // compare after trimming and filtering empties on both sides
      const normOld = oldContent.map((s) => String(s || "").trim()).filter((s) => s !== "");
      const normNew = newContent.map((s) => String(s || "").trim()).filter((s) => s !== "");

      if (JSON.stringify(normOld) !== JSON.stringify(normNew)) {
        changes.push({
          action: "Edited",
          section: `${category.charAt(0).toUpperCase() + category.slice(1)}`,
          changes: "Updated content",
          category,
        });
      }
    }

    return changes;
  };

  const changes = getChanges();

  // Final request: send only categories that changed (build payloads as in your sample)
  const handleFinalRequestConfirm = async () => {
    if (!pendingItems) {
      return;
    }

    // Final check for empty fields
    const emptyFieldsObj = checkEmptyFields(pendingItems);
    if (Object.keys(emptyFieldsObj).length > 0) {
      toast.error("Cannot submit request with empty fields. Please go back and fill all required fields.");
      setShowRequestModal(false);
      return;
    }

    const committedMap = new Map((committedItems || []).map((it) => [it.category, it]));
    const pendingMap = new Map((pendingItems || []).map((it) => [it.category, it]));

    const payload = [];

    for (const [category, newItem] of pendingMap.entries()) {
      const oldItem = committedMap.get(category) || null;

      const oldContentArray = oldItem ? (Array.isArray(oldItem.content) ? oldItem.content : [oldItem.content]) : [];
      const newContentArray = Array.isArray(newItem.content) ? newItem.content : [newItem.content];

      // Normalize by trimming and removing empty points
      const normOld = oldContentArray.map((s) => String(s || "").trim()).filter((s) => s !== "");
      const normNew = newContentArray.map((s) => String(s || "").trim()).filter((s) => s !== "");

      // Only push payload if changed
      if (JSON.stringify(normOld) !== JSON.stringify(normNew)) {
        payload.push({
          collectionName: "iic",
          collection_type: "establishment",
          action: "update",
          title: `Update ${category} - establishment`,
          category: category,
          meta_data: { content: deepCopy(normNew) },
          original_data: { content: deepCopy(normOld) },
        });
      }
    }

    if (payload.length === 0) {
      setShowRequestModal(false);
      return;
    }

    try {
      const result = await sendRequest(payload, []); // no files for these payloads
      if (result) {
        // commit locally
        // commit normalized (trimmed & filtered) version
        const normalizedPending = pendingItems.map((it) => {
          if (Array.isArray(it.content)) {
            return { ...it, content: it.content.map((s) => String(s || "").trim()).filter((s) => s !== "") };
          }
          return { ...it, content: typeof it.content === "string" ? it.content.trim() : it.content };
        });

        setCommittedItems(deepCopy(normalizedPending));
        setItems(deepCopy(normalizedPending));
        setPendingItems(null);
        setIsSaved(false);
        setShowRequestModal(false);
        setIsEditing(false);
        setIsDirty(false);
        setEmptyFields({});
        toast.success("Request submitted successfully!");
      }
    } catch (err) {
      console.error("IIC establishment final request error:", err);
      toast.error("Failed to submit request. Please try again.");
    }
  };

  const revertChange = (category) => {
    if (!pendingItems) return;
    const committedItem = committedItems.find((it) => it.category === category);
    const updated = (pendingItems || []).map((it) =>
      it.category === category ? deepCopy(committedItem || { category, content: [] }) : it
    );
    setPendingItems(updated);
    setItems(deepCopy(updated));
    setEmptyFields(checkEmptyFields(updated));
    
    // if no remaining differences, clear draft
    const remaining = (() => {
      const cm = new Map((committedItems || []).map((it) => [it.category, it]));
      const pm = new Map((updated || []).map((it) => [it.category, it]));
      for (const [cat, newIt] of pm.entries()) {
        const oldIt = cm.get(cat) || { content: [] };
        const oldC = Array.isArray(oldIt.content) ? oldIt.content : [oldIt.content];
        const newC = Array.isArray(newIt.content) ? newIt.content : [newIt.content];
        const normOld = oldC.map((s) => String(s || "").trim()).filter((s) => s !== "");
        const normNew = newC.map((s) => String(s || "").trim()).filter((s) => s !== "");
        if (JSON.stringify(normOld) !== JSON.stringify(normNew)) return true;
      }
      return false;
    })();

    if (!remaining) {
      setPendingItems(null);
      setIsSaved(false);
    }
    toast.info(`${category} changes reverted!`);
  };

  // Category convenience variables for rendering
  const majorFocus = getCategory(items, "majorfocus");
  const vision = getCategory(items, "vision");
  const mission = getCategory(items, "mission");
  const functions = getCategory(items, "function");

  // Check if save button should be disabled
  const hasEmptyFields = Object.keys(emptyFields).length > 0;

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <div className="about-section">
      <ToastContainer position="bottom-right" autoClose={3000} />

      {/* Header */}
      <div className="relative mb-4 flex items-center">
        <h1 className="absolute left-1/2 -translate-x-1/2 text-brwn dark:text-drkt text-4xl font-bold">
          Establishment of IIC
        </h1>

        <div className="ml-auto">
          {!isEditing && (
            <button
              onClick={handleStartEdit}
              className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
            >
              <Pencil size={18} />
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="naac-info-panel-icc border-l-4 border-secd dark:border-drks dark:bg-drkb">
        <h2 className="text-[30px] text-brwn dark:text-drkt iic-establishment border-b-2 border-secd dark:border-drks pb-1">
          Major Focus of IIC
        </h2>

        {isEditing ? (
          <div className="py-2">
            {Array.isArray(majorFocus) &&
              majorFocus.map((point, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <div className="w-full">
                    <div className="flex items-center mb-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Major Focus Point {i + 1} <span className="text-red-500">*</span>
                      </label>
                      {!point.trim() && (
                        <span className="ml-2 text-xs text-red-500">(Required)</span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => handleChange("majorfocus", i, e.target.value)}
                      className={`w-full p-2 border rounded ${
                        !point.trim() ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="Major focus point (required)"
                      required
                    />
                  </div>
                  <button 
                    onClick={() => handleRemovePoint("majorfocus", i)} 
                    className="p-2 text-red-500 hover:text-red-700 mt-6"
                    title="Remove point"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            {/* Add button intentionally commented per original layout */}
            {/* <button onClick={() => handleAddPoint("majorfocus")} className="flex items-center gap-1 mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"><Plus size={16} /> Add Point</button> */}
          </div>
        ) : (
          <p className="text-justify">
            {Array.isArray(majorFocus) &&
              majorFocus
                .filter((p) => String(p || "").trim() !== "")
                .map((point, i) => (
                  <span key={i}>
                    <br />• {point}
                  </span>
                ))}
          </p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row justify-between gap-6 mt-6">
        {/* Vision */}
        <div className="iqac-info-panel border-l-4 border-secd dark:border-drks w-full lg:w-1/2 dark:bg-drkb">
          <h2 className="text-[30px] text-brwn dark:text-drkt iic-establishment border-b-2 border-secd dark:border-drks pb-1">
            Vision <span className="text-red-500 text-sm">*</span>
          </h2>
          {isEditing ? (
            <div className="mt-2">
              <div className="flex items-center mb-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Vision Statement <span className="text-red-500">*</span>
                </label>
                {!String(Array.isArray(vision) ? vision[0] || "" : vision || "").trim() && (
                  <span className="ml-2 text-xs text-red-500">(Required)</span>
                )}
              </div>
              <textarea
                value={Array.isArray(vision) ? vision[0] || "" : vision || ""}
                onChange={(e) => handleChange("vision", 0, e.target.value)}
                className={`w-full p-2 border rounded min-h-[100px] ${
                  !String(Array.isArray(vision) ? vision[0] || "" : vision || "").trim() 
                    ? "border-red-500 bg-red-50" 
                    : "border-gray-300"
                }`}
                placeholder="Vision statement (required)"
                required
              />
            </div>
          ) : (
            <p className="mt-2">{Array.isArray(vision) ? (vision[0] || "") : vision || ""}</p>
          )}
        </div>

        {/* Mission */}
        <div className="iqac-info-panel border-l-4 border-secd dark:border-drks w-full lg:w-1/2 dark:bg-drkb">
          <h2 className="text-[30px] iic-establishment border-b-2 border-secd dark:border-drks pb-1 text-brwn dark:text-drkt">
            Mission <span className="text-red-500 text-sm">*</span>
          </h2>
          {isEditing ? (
            <div className="mt-2">
              <div className="flex items-center mb-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mission Statement <span className="text-red-500">*</span>
                </label>
                {!String(Array.isArray(mission) ? mission[0] || "" : mission || "").trim() && (
                  <span className="ml-2 text-xs text-red-500">(Required)</span>
                )}
              </div>
              <textarea
                value={Array.isArray(mission) ? mission[0] || "" : mission || ""}
                onChange={(e) => handleChange("mission", 0, e.target.value)}
                className={`w-full p-2 border rounded min-h-[100px] ${
                  !String(Array.isArray(mission) ? mission[0] || "" : mission || "").trim() 
                    ? "border-red-500 bg-red-50" 
                    : "border-gray-300"
                }`}
                placeholder="Mission statement (required)"
                required
              />
            </div>
          ) : (
            <p className="mt-2">{Array.isArray(mission) ? (mission[0] || "") : mission || ""}</p>
          )}
        </div>
      </div>

      {/* I&E Ecosystem */}
      <div className="mt-6">
        <IicEco
          data={Array.isArray(functions) ? functions : functions ? [functions] : []}
          isEditing={isEditing}
          onUpdate={(newData) => {
            const updatedItems = items.map((it) => (it.category === "function" ? { ...it, content: newData } : it));
            setItems(updatedItems);
            setIsDirty(true);
            setEmptyFields(checkEmptyFields(updatedItems));
          }}
        />
      </div>

      {/* Edit Mode Buttons */}
      {isEditing && (
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={handleCancel} className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500">
            Cancel
          </button>
          {isDirty && (
            <button 
              onClick={handleSave} 
              className={`flex items-center gap-2 px-4 py-2 rounded ${
                hasEmptyFields 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
              }`}
              disabled={hasEmptyFields}
            >
              <Save size={18} /> Save
            </button>
          )}
        </div>
      )}

      {/* Empty fields warning */}
      {isEditing && hasEmptyFields && (
        <p className="text-xs text-red-500 mt-2 text-right">
          Please fill all required fields before saving
        </p>
      )}

      {/* Discard/Request buttons when saved draft exists */}
      {isSaved && !isEditing && (
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={handleDiscard} className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500">
            Discard Changes
          </button>
          {changes.length > 0 && (
            <button onClick={handleRequest} className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim">
              <Send size={18} /> Request
            </button>
          )}
        </div>
      )}

      {/* Final Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-text/70 flex items-center justify-center z-[1000]">
          <div className="bg-prim p-6 rounded-xl w-[600px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Final Request</h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin. Once approved will go live.
            </p>
            {changes.length > 0 ? (
              <table className="w-full text-center text-sm border">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border p-2">Action</th>
                    <th className="border p-2">Section</th>
                    <th className="border p-2">Changes</th>
                    <th className="border p-2">Undo</th>
                  </tr>
                </thead>
                <tbody>
                  {changes.map((ch, i) => (
                    <tr key={i}>
                      <td className="border p-2 text-blue-600">{ch.action}</td>
                      <td className="border p-2">{ch.section}</td>
                      <td className="border p-2">{ch.changes}</td>
                      <td className="border p-2">
                        <button onClick={() => revertChange(ch.category)} className="p-1 rounded hover:bg-gray-100" title="Revert this change">
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
                <button onClick={handleFinalRequestConfirm} className="px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim" disabled={loading}>
                  {loading ? "Processing..." : "Final Request"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IicEst;