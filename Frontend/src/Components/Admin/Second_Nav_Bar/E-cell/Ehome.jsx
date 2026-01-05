/* AdminHome.jsx (fixed, payload diff by id)
   - Uses stable ids for mission items to prevent React list-shift when deleting
   - Diffing for mission is ID-based: inserts/updates/deletes determined by mission.id
   - Payloads include mission_id and mission text for clarity on backend
   - Keeps same public API as your original component: props.home = array
*/
import React, { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, Send, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadComp from "../../LoadComp";
import { useAdminRequest } from "../../../hooks/useAdminRequest";
import AutoResizeTextarea from "../AutoResizeTextarea";

const Autotextarea = ({ value, onChange, className, placeholder }) => (
  <AutoResizeTextarea
    className={className}
    value={value ?? ""}
    onChange={(e) => onChange && onChange(e.target.value)}
    placeholder={placeholder}
    rows={3}
  />
);

const deepCopy = (v) => JSON.parse(JSON.stringify(v));
const isDifferent = (a, b) => JSON.stringify(a) !== JSON.stringify(b);

const uuid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

// Helper: normalize mission arrays (strings -> {id,text})
const normalizeMission = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr.map((m) => (typeof m === "string" ? { id: uuid(), text: m } : { id: m.id ?? uuid(), text: m.text ?? "" }));
};

/**
 * AdminHome
 * props:
 *  - home: array (home[0] = { about, vision, mission })
 */
export default function AdminHome({ home }) {
  const { sendRequest, loading, error } = useAdminRequest();

  // Committed = live content (what is currently published)
  const [committedContent, setCommittedContent] = useState(null);
  // Content = editing buffer
  const [content, setContent] = useState(null);
  // pending draft saved locally (before final request)
  const [pendingContent, setPendingContent] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false); // derive from comparison
  const [isSaved, setIsSaved] = useState(false); // draft exists
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Init from prop
  useEffect(() => {
    if (Array.isArray(home) && home.length > 0) {
      const raw = deepCopy(home[0]);
      const init = {
        about: raw.about ?? "",
        vision: raw.vision ?? "",
        mission: normalizeMission(raw.mission),
      };
      setCommittedContent(init);
      setContent(deepCopy(init));
      setPendingContent(null);
      setIsEditing(false);
      setIsDirty(false);
      setIsSaved(false);
    }
  }, [home]);

  // Recompute isDirty whenever content / pending / committed change
  useEffect(() => {
    const base = pendingContent ?? committedContent ?? { about: "", vision: "", mission: [] };
    // compare by text values to avoid id noise
    const stripIds = (obj) => ({
      about: obj.about ?? "",
      vision: obj.vision ?? "",
      mission: (obj.mission || []).map((m) => m.text ?? ""),
    });
    setIsDirty(isDifferent(stripIds(content ?? {}), stripIds(base)));
  }, [content, pendingContent, committedContent]);

  // Start editing (use draft if exists)
  const handleStartEdit = () => {
    setContent(deepCopy(pendingContent ?? committedContent));
    setIsEditing(true);
  };

  // Generic field change. For mission pass id as `key`.
  const handleChangeField = (field, key, value) => {
    const next = deepCopy(content ?? {});
    if (field === "mission") {
      // key is id
      const idx = (next.mission || []).findIndex((m) => m.id === key);
      if (idx >= 0) {
        next.mission[idx].text = value;
      }
    } else {
      next[field] = value;
    }
    setContent(next);
  };

  const addMission = () => {
    const next = deepCopy(content ?? {});
    next.mission = [...(next.mission || []), { id: uuid(), text: "" }];
    setContent(next);
  };

  const removeMission = (id) => {
    const next = deepCopy(content ?? {});
    next.mission = (next.mission || []).filter((m) => m.id !== id);
    setContent(next);
  };

  // Save as draft (pendingContent)
  const handleSave = () => {
    // validation
    if (!content?.about?.trim()) {
      toast.error("About cannot be empty");
      return;
    }
    if (!content?.vision?.trim()) {
      toast.error("Vision cannot be empty");
      return;
    }
    if ((content.mission || []).some((m) => !m.text?.trim())) {
      toast.error("Please fill or remove empty mission points");
      return;
    }

    setPendingContent(deepCopy(content));
    setIsSaved(true);
    setIsEditing(false);
    setIsDirty(false);
    toast.success("Changes saved as draft");
  };

  // Cancel editing session (revert buffer to draft or committed)
  const handleCancel = () => {
    setContent(deepCopy(pendingContent ?? committedContent));
    setIsEditing(false);
    setIsDirty(false);
    toast.info("Edits cancelled");
  };

  // Discard draft
  const handleDiscard = () => {
    setPendingContent(null);
    setContent(deepCopy(committedContent));
    setIsSaved(false);
    setIsDirty(false);
    toast.info("Draft discarded");
  };

  // Prepare human-friendly changes list (for modal)
  const getChangesList = () => {
    const comm = committedContent ?? { about: "", vision: "", mission: [] };
    const pend = pendingContent ?? comm;
    const list = [];
    if (comm.about !== pend.about) {
      list.push({ action: "Edited", section: "About", changes: "Updated About", itemId: "about" });
    }
    if (comm.vision !== pend.vision) {
      list.push({ action: "Edited", section: "Vision", changes: "Updated Vision", itemId: "vision" });
    }
    const oldM = (comm.mission || []).map((m) => m.text ?? "");
    const newM = (pend.mission || []).map((m) => m.text ?? "");
    if (JSON.stringify(oldM) !== JSON.stringify(newM)) {
      list.push({ action: "Edited", section: "Mission", changes: "Updated mission points", itemId: "mission" });
    }
    return list;
  };

  // revert a section inside the draft back to committed
  const revertChange = (section) => {
    if (!pendingContent || !committedContent) return;
    const draft = deepCopy(pendingContent);
    if (section === "mission") {
      draft.mission = deepCopy(committedContent.mission || []);
    } else {
      draft[section] = deepCopy(committedContent[section]);
    }
    setPendingContent(draft);
    setContent(deepCopy(draft));
    toast.info(`${section} reverted`);
  };

  // Generate final payloads (insert/update/delete) — mission handled per-id (insert/delete/update)
// Generate payload in clean CRT/JSON format
// Generate final payloads in CRT-friendly format
const generatePayload = () => {
  const payloads = [];
  const comm = committedContent ?? { about: "", vision: "", mission: [] };
  const pend = pendingContent ?? content ?? comm; // <-- use content if pendingContent is null

  // Map old missions by ID
  const oldMap = Object.fromEntries((comm.mission || []).map((m) => [m.id, m]));
  const newMap = Object.fromEntries((pend.mission || []).map((m) => [m.id, m]));

  // Check for inserts & updates
  (pend.mission || []).forEach((m) => {
    if (!oldMap[m.id]) {
      payloads.push({
        action: "insert",
        collectionName: "ecell",
        title: "About us",
        collection_type: "about",
        meta_data: { mission: m.text },
      });
    } else if (oldMap[m.id].text !== m.text) {
      payloads.push({
        action: "update",
        collectionName: "ecell",
        title: "About us",
        collection_type: "about",
        original_data: { mission: oldMap[m.id].text },
        meta_data: { mission: m.text },
      });
    }
  });

  // Check for deletions
  (comm.mission || []).forEach((m) => {
    if (!newMap[m.id]) {
      payloads.push({
        action: "delete",
        collectionName: "ecell",
        title: "About us",
        collection_type: "about",
        meta_data: { mission: m.text },
      });
    }
  });

  // Also check about and vision
  if (comm.about !== (pend.about ?? "")) {
    payloads.push({
      action: "update",
      collectionName: "ecell",
      title: "coolie",
      collection_type: "about",
      original_data: { about: comm.about },
      meta_data: { about: pend.about },
    });
  }

  if (comm.vision !== (pend.vision ?? "")) {
    payloads.push({
      action: "update",
      collectionName: "ecell",
      title: "coolie",
      collection_type: "about",
      original_data: { vision: comm.vision },
      meta_data: { vision: pend.vision },
    });
  }

  return payloads;
};






  // Final request: send payloads to admin via sendRequest
  const handleFinalRequestConfirm = async () => {
    const payload = generatePayload();
    if (!payload.length) {
      toast.info("No changes to submit");
      return;
    }

    try {
      await sendRequest(payload);
      toast.success("📩 Request sent for admin approval");

      // After sending, commit changes locally (we assume backend will apply after approval)
      const newCommitted = deepCopy(pendingContent ?? committedContent);
      setCommittedContent(newCommitted);
      setContent(deepCopy(newCommitted));
      setPendingContent(null);
      setIsSaved(false);
      setShowRequestModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit request");
    }
  };

  const changes = getChangesList();

  if (!Array.isArray(home))
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={2000} />

      <div className="admin-about-header relative flex items-center justify-center mt-6 mr-7 pt-2">
        <h2 className="admin-about-heading text-3xl font-bold"></h2>
        {!isEditing && (
          <div className="absolute right-0">
            <button
              onClick={handleStartEdit}
              className="admin-about-btn-edit flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded"
            >
              <Pencil size={18} /> Edit
            </button>
          </div>
        )}
      </div>

      <div className="admin-about-container mt-6 px-4">
        {/* About */}
        <div className="admin-about-section admin-about-card border-l-4 border-secd dark:border-drks p-4 mb-4 rounded-[10px]">
          <h3 className="admin-about-title text-brwn dark:text-drkt border-b-2 border-secd pb-1">About Us</h3>
          {isEditing ? (
            <Autotextarea
              className="admin-about-textarea w-full p-2 border rounded mt-3"
              value={content?.about}
              onChange={(val) => handleChangeField("about", null, val)}
              placeholder="About text"
            />
          ) : (
            <p className="admin-about-text ic-centered-text text-text dark:text-drkt mt-3">{committedContent?.about}</p>
          )}
        </div>

        {/* Vision & Mission */}
        <div className="admin-about-grid grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="admin-about-card border-l-4 border-secd p-4 rounded-[10px]">
            <h3 className="admin-about-title text-brwn dark:text-drkt border-b-2 border-secd pb-1">Our Vision</h3>
            {isEditing ? (
              <Autotextarea
                className="admin-about-textarea w-full p-2 border rounded mt-3"
                value={content?.vision}
                onChange={(val) => handleChangeField("vision", null, val)}
                placeholder="Vision text"
              />
            ) : (
              <p className="admin-about-text mt-3">{committedContent?.vision}</p>
            )}
          </div>

          <div className="admin-about-card border-l-4 border-secd p-4 rounded-[10px]">
            <h3 className="admin-about-title text-brwn dark:text-drkt border-b-2 border-secd pb-1">Our Mission</h3>

            {isEditing ? (
              <>
                <div className="admin-about-mission-list mt-3">
                  {(content?.mission || []).map((m) => (
                    <div key={m.id} className="admin-about-mission-row flex items-start gap-2 mb-2">
                      <Autotextarea
                        className="admin-about-textarea flex-1 p-2 border rounded"
                        value={m.text}
                        onChange={(val) => handleChangeField("mission", m.id, val)}
                        placeholder={`Mission`}
                      />
                      <button
                        className="admin-about-btn-del p-2"
                        onClick={() => removeMission(m.id)}
                        aria-label={`Remove mission`}
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>

                <button onClick={addMission} className="admin-about-btn-add inline-flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded mt-2">
                  <Plus size={14} /> Add Mission
                </button>
              </>
            ) : (
              <ol className="admin-about-mission-list mt-3 list-decimal list-inside">
                {(committedContent?.mission || []).map((m) => (
                  <li key={m.id} className="mb-1">{m.text}</li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="admin-about-actions mt-6 flex justify-end gap-3 px-6 py-2">
          {isEditing && (
            <>
              <button onClick={handleCancel} className="admin-about-btn-cancel px-4 py-2 rounded bg-gray-400 text-prim">Cancel</button>

              {isDirty && (
                <button onClick={handleSave} className="admin-about-btn-save flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text">
                  Save
                </button>
              )}
            </>
          )}

          {!isEditing && isSaved && (
            <>
              <button onClick={handleDiscard} className="admin-about-btn-discard px-4 py-2 rounded bg-gray-400 text-prim">Discard Changes</button>

              {changes.length > 0 && (
                <button onClick={() => setShowRequestModal(true)} className="admin-about-btn-request flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text">
                  <Send size={16} /> Request
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="admin-about-modal-backdrop fixed inset-0 bg-black/60 flex items-center justify-center z-[1000]">
          <div className="admin-about-modal bg-white p-6 rounded-xl w-[720px] max-h-[80vh] overflow-y-auto">
            <h2 className="admin-about-modal-title text-xl font-semibold mb-2">Final Request</h2>
            <p className="text-sm text-red-500 mb-4">Note: Your changes will stay pending until approved by the superior admin. Once approved, they will go live.</p>

            {changes.length > 0 ? (
              <table className="admin-about-modal-table w-full text-sm text-left border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Action</th>
                    <th className="p-2 border">Section</th>
                    <th className="p-2 border">Changes</th>
                    <th className="p2 border">Revert</th>
                  </tr>
                </thead>
                <tbody>
                  {changes.map((ch, idx) => (
                    <tr key={idx} className="even:bg-white odd:bg-gray-50">
                      <td className="p-2 border text-blue-600">{ch.action}</td>
                      <td className="p-2 border">{ch.section}</td>
                      <td className="p-2 border">{ch.changes}</td>
                      <td className="p-2 border text-center">
                        <button onClick={() => revertChange(ch.itemId)} className="p-1 rounded hover:bg-gray-100"><X size={16} className="text-red-500" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-600">No changes detected.</p>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowRequestModal(false)} className="admin-about-btn-cancel px-4 py-2 rounded bg-gray-400 text-prim">Cancel</button>
              {changes.length > 0 && (
                <button onClick={handleFinalRequestConfirm} className="admin-about-btn-final px-4 py-2 rounded bg-[#fdcc03] text-text">Final Request</button>
              )}
            </div>
          </div>
        </div>
      )}

    </>
  );
}
