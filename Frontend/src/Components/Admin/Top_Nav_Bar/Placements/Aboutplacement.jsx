import React, { useEffect, useRef, useState } from "react";
import "./AdminAboutplacement.css";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import axios from "axios";
import { useNavigate } from "react-router";
import { Pencil, Send, Trash2, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ContentEditable = ({ html, onChange, tagName = "p", className, editable }) => {
  const ref = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused && ref.current) {
      const cur = ref.current;
      const curText = cur.innerText ?? "";
      const desired = html ?? "";
      if (curText !== desired) {
        cur.innerText = desired;
      }
    }
  }, [html, isFocused]);

  return React.createElement(
    tagName,
    {
      ref,
      className,
      contentEditable: !!editable,
      suppressContentEditableWarning: true,
      onInput: (e) => {
        onChange && onChange(e.currentTarget.innerText);
      },
      onFocus: () => setIsFocused(true),
      onBlur: (e) => {
        setIsFocused(false);
        onChange && onChange(e.currentTarget.innerText);
      },
    },
    null
  );
};

const AdminAboutplacement = ({ theme, toggle }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [placementData, setPlacementData] = useState(null);
  const [editedData, setEditedData] = useState(null);
  const [pendingData, setPendingData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [backupData, setBackupData] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showMultiDeleteConfirm, setShowMultiDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responce = await axios.post("/api/main-backend/placement", {
          type: "about_placement",
        });
        const data = responce.data.data;
        setPlacementData(data);
        setEditedData(data);
      } catch (error) {
        console.error("error fetching Placement Data", error);
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
        }
      }
    };
    fetchData();
  }, [navigate]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!editedData && placementData) setEditedData(placementData);
  }, [placementData, editedData]);

  const getHasUnsavedLocalChanges = () => {
    const base = editMode ? backupData || (pendingData ?? placementData) : (pendingData ?? placementData);
    return JSON.stringify(editedData) !== JSON.stringify(base);
  };

  const enterEditMode = () => {
    const base = pendingData ?? placementData;
    setBackupData(JSON.parse(JSON.stringify(base || {})));
    setEditedData(JSON.parse(JSON.stringify(base || {})));
    setEditMode(true);
  };

  const cancelEdit = () => {
    const base = pendingData ?? placementData;
    setEditedData(JSON.parse(JSON.stringify(base || {})));
    setEditMode(false);
  };

  const saveAsPending = () => {
    setPendingData(JSON.parse(JSON.stringify(editedData || {})));
    setEditMode(false);
  };

  const discardAllPending = () => {
    setPendingData(null);
    setEditedData(placementData ? JSON.parse(JSON.stringify(placementData)) : null);
    setEditMode(false);
toast.error("Change has been reverted");
  };

  const handleChange = (field, value, index = null) => {
    setEditedData((prev) => {
      if (!prev) return prev;
      if (field === "phone") {
        return {
          ...prev,
          phone: String(value)
            .replace("📞Phone:", "")
            .trim()
            .split("/")
            .map((num) => num.trim()),
        };
      }
      if (field === "email") {
        return {
          ...prev,
          email: String(value)
            .replace("✉️Email:", "")
            .trim()
            .split("/")
            .map((em) => em.trim()),
        };
      }
      if (Array.isArray(prev[field])) {
        const updated = [...prev[field]];
        updated[index] = value;
        return { ...prev, [field]: updated };
      }
      return { ...prev, [field]: value };
    });
  };

  const formatFieldName = (field) =>
    field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  /**
   * Mapping from field keys to display titles (card titles).
   * Modify if you add/remove fields or titles change.
   */
  const fieldKeyToTitle = {
    Training_Placement_Department: "Training & Placement Department",
    Our_Vision: "Our Vision",
    Our_Mission: "Our Mission",
    email: "Contact Placement Cell",
    phone: "Contact Placement Cell",
  };

  /**
   * Build change rows for the modal.
   * - Section column will always be "About Placement Department"
   * - Changes column will show only the card title (e.g. "Our Vision")
   * - If multiple keys map to the same card (e.g. phone + email -> Contact Placement Cell),
   *   they are grouped into a single change row per card title.
   */
  const getChangesForModal = () => {
    const base = placementData || {};
    const pending = pendingData || {};
    const keys = Array.from(new Set([...Object.keys(base), ...Object.keys(pending)]));
    // Temporary map keyed by card title to group changes
    const grouped = new Map();

    keys.forEach((k) => {
      const a = base[k];
      const b = pending[k];
      if (JSON.stringify(a) !== JSON.stringify(b)) {
        let action = "Edited";
        if (b === undefined || b === "" || (Array.isArray(b) && b.length === 0)) action = "Deleted";
        if (a === undefined || a === "" || (Array.isArray(a) && a.length === 0)) action = "Added";

        const title = fieldKeyToTitle[k] || formatFieldName(k);
        // use the title as grouping key
        const entry = grouped.get(title) || {
          action,
          section: "About Placement Department",
          title,
          keys: [],
        };

        // If any key indicates a stronger action (Added/Deleted) take it
        if (entry.action !== action) {
          // prioritize Added/Deleted over Edited
          if (action === "Added" || action === "Deleted") entry.action = action;
        }

        entry.keys.push(k);
        grouped.set(title, entry);
      }
    });

    // Convert grouped map to rows array
    const rows = [];
    for (const [, v] of grouped) {
      rows.push({
        action: v.action,
        section: v.section,
        title: v.title,
        keys: v.keys, // used when reverting (revert all keys for that title)
      });
    }

    return rows;
  };

  /**
   * Returns the array used by the modal (changeLog).
   * Each item contains:
   *  - action: "Edited" | "Added" | "Deleted"
   *  - section: "About Placement Department" (fixed)
   *  - title: card title to display in Changes column
   *  - keys: array of field keys that were changed for this card
   */
  const getChanges = () => {
    const rows = getChangesForModal();
    return rows.map((r) => ({
      action: r.action,
      section: r.section,
      title: r.title,
      keys: r.keys,
      // keep a data shape similar to previous code to avoid changing UI code drastically
      data: { name: r.title },
    }));
  };

  /**
   * Revert one or more keys in pendingData back to placementData values (or delete if not present in placementData).
   * Accepts a change object that has .keys (array).
   */
  const handleRevertChange = (change) => {
    const keys = Array.isArray(change.keys) ? change.keys : [change.key];
    setPendingData((prev) => {
      if (!prev) return prev;
      const newPending = JSON.parse(JSON.stringify(prev));
      keys.forEach((key) => {
        if (placementData && placementData[key] !== undefined) {
          newPending[key] = JSON.parse(JSON.stringify(placementData[key]));
        } else {
          delete newPending[key];
        }
      });
      // also update editedData to reflect revert immediately
      setEditedData(JSON.parse(JSON.stringify(newPending)));
      return newPending;
    });
  };

  const handleRequestConfirm = async () => {
    if (!pendingData) {
      return;
    }
           try {
             setShowRequestModal(false);
              setPendingData(null); 
             toast.success("Request submitted successfully!");
           } catch (err) {
             console.error(err);
             toast.error("Request failed. Please try again.");
           }
  };

  const toggleSelectItem = (idx) => {
    setSelectedItems((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleMultiDeleteConfirm = () => {
    if (!editMode) return;
    const arrField = "Training_Placement_Department";
    if (!Array.isArray(editedData?.[arrField])) return;
    const filtered = editedData[arrField].filter((_, idx) => !selectedItems.includes(idx));
    setEditedData((prev) => ({ ...prev, [arrField]: filtered }));
    setSelectedItems([]);
    setShowMultiDeleteConfirm(false);
  };

  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
  }

  const hasPending = Boolean(pendingData);
  const unsavedLocal = getHasUnsavedLocalChanges();

  // computed change list for the modal
  const changeLog = getChanges();

  // helper to revert by index (used by the modal's revert button)
  const revertChange = (idx) => {
    const ch = changeLog?.[idx];
    if (ch) handleRevertChange(ch);
  };

  return (
    <>
      <Banner
        theme={theme}
        toggle={toggle}
        backgroundImage="./Banners/placementbanner.webp"
        headerText="Placement Department"
        subHeaderText="Empowering students' career success by connecting talent with industry leaders and opportunities."
      />

      <div className="Admin-AP-main-container relative ">
<ToastContainer position="bottom-right" autoClose={3000} />
        {!editMode && (
          <button
            onClick={enterEditMode}
            className="absolute top-0 right-0 mt-[5px] flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim z-20"
            title="Edit Page"
          >
            <Pencil size={16} />
            Edit
          </button>
        )}

        <section className="AP-grid-TPD">
          <div className="AP-card bg-drkt dark:bg-drkb border-l-4 border-secd dark:border-drks relative">
            <h2 className="AP-card-title title text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks">
              Training & Placement Department
            </h2>
            <div>
              {editedData?.Training_Placement_Department?.map((line, i) => (
                <div key={i} className="flex items-start gap-2">
                  <ContentEditable
                    html={line}
                    editable={editMode}
                    className={`AP-card-text font-[poppins] ${editMode ? "editable-active" : ""}`}
                    onChange={(val) => handleChange("Training_Placement_Department", val, i)}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="AP-grid-VMC">
          <section className="AP-grid-VM">
            <div className="AP-card bg-drkt dark:bg-drkb border-l-4 border-secd dark:border-drks">
              <h2 className="AP-card-title font-[poppins] text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks">
                Our Vision
              </h2>
              <ContentEditable
                html={editedData?.Our_Vision}
                editable={editMode}
                className={`AP-card-text font-[poppins] ${editMode ? "editable-active" : ""}`}
                onChange={(val) => handleChange("Our_Vision", val)}
              />
            </div>

            <div className="AP-card bg-drkt dark:bg-drkb border-l-4 border-secd dark:border-drks">
              <h2 className="AP-card-title title text-brwn dark:text-drkt border-b-2 font-[poppins] border-secd dark:border-drks">
                Our Mission
              </h2>
              <ContentEditable
                html={editedData?.Our_Mission}
                editable={editMode}
                className={`AP-card-text font-[poppins] ${editMode ? "editable-active" : ""}`}
                onChange={(val) => handleChange("Our_Mission", val)}
              />
            </div>
          </section>

          <section className="AP-grid-CPC font-[poppins]">
            <div className="AP-card bg-drkt dark:bg-drkb border-l-4 border-secd dark:border-drks">
              <h2 className="AP-card-title title text-brwn dark:text-drkt border-b-2 border-secd font-[poppins] dark:border-drks">
                Contact Placement Cell
              </h2>
              <br />
              <h3 className="AP-contact-name font-[poppins] ">Head of Placement and Training</h3>
              <br />
              <ContentEditable
                html={editedData ? `✉️Email: ${editedData.email}` : "✉️Email:"}
                editable={editMode}
                className={`AP-card-text font-[poppins] ${editMode ? "editable-active" : ""}`}
                onChange={(val) => handleChange("email", val)}
              />
              <ContentEditable
                html={editedData ? `📞Phone: ${editedData.phone?.join(" / ")}` : "📞Phone:"}
                editable={editMode}
                className={`AP-card-text font-[poppins] ${editMode ? "editable-active" : ""}`}
                onChange={(val) => handleChange("phone", val)}
              />
            </div>
          </section>
        </section>

        {editMode && selectedItems.length > 0 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
            <button
              onClick={() => setShowMultiDeleteConfirm(true)}
              className="px-4 py-2 rounded bg-red-600 text-white flex items-center gap-2"
            >
              <Trash2 size={16} /> Delete ({selectedItems.length})
            </button>
          </div>
        )}

        <div className="absolute right-4 bottom-4 flex items-center gap-3 z-40">
          {editMode && (
            <button
              onClick={cancelEdit}
              className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
            >
              Cancel
            </button>
          )}

          {editMode && unsavedLocal && (
            <button
              onClick={saveAsPending}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
            >
              Save
            </button>
          )}

          {!editMode && hasPending && (
            <>
              <button
                onClick={discardAllPending}
                className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
              >
                Discard Changes
              </button>
              <button
                onClick={() => setShowRequestModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
              >
               <Send size={16}/> Request
              </button>
            </>
          )}
        </div>
      </div>

      {showMultiDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-[400px]">
            <h3 className="font-bold mb-3">Confirm Delete</h3>
            <p className="mb-4">Delete {selectedItems.length} selected items?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowMultiDeleteConfirm(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleMultiDeleteConfirm}
                className="px-4 py-2 rounded bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Request Modal (user reference style) */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-text/70 flex items-center justify-center z-[1000]">
          <div className="bg-prim p-6 rounded-xl w-[40%] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Final Request</h2>
            <p className="text-sm text-red-500 mb-4">
              Your changes will stay pending until approved by the superior admin. Once approved they will go live.
            </p>

            {changeLog.length > 0 ? (
              <table className="w-full text-center text-sm border">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border p-2">Action</th>
                    <th className="border p-2">Section</th>
                    <th className="border p-2">Changes</th>
                    <th className="border p-2">Revert</th>
                  </tr>
                </thead>
                <tbody>
                  {changeLog.map((ch, i) => (
                    <tr key={i}>
                      <td className="border p-2 text-blue-600">{ch.action}</td>
                      {/* Always "About Placement Department" */}
                      <td className="border p-2">{ch.section}</td>
                      {/* Show only the card title (e.g. "Our Vision") */}
                      <td className="border p-2 text-left whitespace-pre-wrap">
                        <p>{ch.title || ch.data?.name || "Unnamed"}</p>
                      </td>
                      <td className="border p-2">
                        <button
                          onClick={() => revertChange(i)}
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
              {changeLog.length > 0 && (
                <button
                  onClick={handleRequestConfirm}
                  className="px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
                >
                  Final Request
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminAboutplacement;
