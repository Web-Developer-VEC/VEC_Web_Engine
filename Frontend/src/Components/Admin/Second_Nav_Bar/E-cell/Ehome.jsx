import React, { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, Send, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadComp from "../../LoadComp";
import { useAdminRequest } from "../../../hooks/useAdminRequest";
import AutoResizeTextarea from "../AutoResizeTextarea";

/* small wrapper to keep your existing AutoResizeTextarea usage */
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

/**
 * Normalize mission array of strings -> [{id,text}] for editing convenience.
 * If input already contains objects with text, preserve id if present.
 */
const normalizeMission = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr.map((m) =>
    typeof m === "string" ? { id: uuid(), text: m } : { id: m.id ?? uuid(), text: m.text ?? "" }
  );
};

export default function AdminHome({ home }) {
  const { sendRequest, loading, error } = useAdminRequest();

  // Committed = live content (what is currently published) -> shape: {about,vision,mission:[{id,text}]}
  const [committedContent, setCommittedContent] = useState(null);
  // Content = editing buffer (same shape)
  const [content, setContent] = useState(null);
  // pending draft saved locally (before final request)
  const [pendingContent, setPendingContent] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaved, setIsSaved] = useState(false); // draft exists
  const [showRequestModal, setShowRequestModal] = useState(false);

  // --- Initialize from prop `home` ---
  // `home` is an array of typed documents; find the about doc
  useEffect(() => {
    if (!Array.isArray(home) || home.length === 0) return;

    // find the about doc (defensive if ordering changes)
    const aboutDoc = home.find((h) => h.type === "about") || home[0];

    // Backend stores about under data: [ {...} ]
    const rawObj = (aboutDoc && aboutDoc.data && aboutDoc.data[0]) || aboutDoc || {};

    // Prepare shape for UI: mission as array of {id,text}
    const init = {
      about: rawObj.about ?? "",
      vision: rawObj.vision ?? "",
      mission: normalizeMission(rawObj.mission ?? []),
    };

    setCommittedContent(init);
    setContent(deepCopy(init));
    setPendingContent(null);
    setIsEditing(false);
    setIsDirty(false);
    setIsSaved(false);
  }, [home]);

  // Recompute isDirty whenever content / pending / committed change
  useEffect(() => {
    const base = pendingContent ?? committedContent ?? { about: "", vision: "", mission: [] };

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
      const idx = (next.mission || []).findIndex((m) => m.id === key);
      if (idx >= 0) next.mission[idx].text = value;
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

  // -------------------------
  // Fixed getChangesList()
  // -------------------------
  const getChangesList = () => {
    const comm = committedContent ?? { about: "", vision: "", mission: [] };
    const pend = pendingContent ?? comm;
    const list = [];

    // About
    if ((comm.about ?? "") !== (pend.about ?? "")) {
      list.push({
        action: "Edited",
        section: "About",
        itemId: "about",
        original: comm.about ?? "",
        current: pend.about ?? "",
      });
    }

    // Vision
    if ((comm.vision ?? "") !== (pend.vision ?? "")) {
      list.push({
        action: "Edited",
        section: "Vision",
        itemId: "vision",
        original: comm.vision ?? "",
        current: pend.vision ?? "",
      });
    }

    // Missions: compare by id
    const commMap = Object.fromEntries((comm.mission || []).map((m) => [m.id, m]));
    const pendMap = Object.fromEntries((pend.mission || []).map((m) => [m.id, m]));

    // Added & Edited
    for (const id of Object.keys(pendMap)) {
      if (!commMap[id]) {
        // Added
        list.push({
          action: "Added",
          section: "Mission",
          itemId: id,
          original: null,
          current: pendMap[id].text ?? "",
        });
      } else if ((commMap[id].text ?? "") !== (pendMap[id].text ?? "")) {
        // Edited
        list.push({
          action: "Edited",
          section: "Mission",
          itemId: id,
          original: commMap[id].text ?? "",
          current: pendMap[id].text ?? "",
        });
      }
    }

    // Deleted
    for (const id of Object.keys(commMap)) {
      if (!pendMap[id]) {
        list.push({
          action: "Deleted",
          section: "Mission",
          itemId: id, // <-- now includes the real mission id (not null)
          original: commMap[id].text ?? "",
          current: null,
        });
      }
    }

    return list;
  };

  // -------------------------
  // Fixed revertChange()
  // -------------------------
  const revertChange = (itemId) => {
    if (!itemId) {
      toast.error("Invalid revert target");
      return;
    }
    if (!committedContent) {
      toast.error("No committed content to revert to");
      return;
    }

    // Ensure there's a draft object
    const draft = deepCopy(pendingContent ?? committedContent);

    // about / vision
    if (itemId === "about" || itemId === "vision") {
      draft[itemId] = deepCopy(committedContent[itemId]);
      setPendingContent(draft);
      setContent(deepCopy(draft));
      toast.info(`${itemId} reverted`);
      return;
    }

    // mission id handling
    const commMap = Object.fromEntries((committedContent.mission || []).map((m) => [m.id, m]));
    const draftMap = Object.fromEntries((draft.mission || []).map((m) => [m.id, m]));

    const isInCommitted = !!commMap[itemId];
    const isInDraft = !!draftMap[itemId];

    if (isInCommitted && !isInDraft) {
      // was deleted in draft -> restore it (insert back)
      draft.mission = [...(draft.mission || []), deepCopy(commMap[itemId])];
      // maintain order: try to insert at original index
      const originalIndex = (committedContent.mission || []).findIndex((m) => m.id === itemId);
      if (originalIndex >= 0) {
        draft.mission = draft.mission.filter((m) => m.id !== itemId);
        draft.mission.splice(originalIndex, 0, deepCopy(commMap[itemId]));
      }
      setPendingContent(draft);
      setContent(deepCopy(draft));
      toast.info("Mission restored to draft (reverted deletion)");
      return;
    }

    if (!isInCommitted && isInDraft) {
      // was newly added in draft -> remove it
      draft.mission = (draft.mission || []).filter((m) => m.id !== itemId);
      setPendingContent(draft);
      setContent(deepCopy(draft));
      toast.info("New mission removed from draft (reverted addition)");
      return;
    }

    if (isInCommitted && isInDraft) {
      // edited mission -> revert text to committed
      draft.mission = (draft.mission || []).map((m) => (m.id === itemId ? deepCopy(commMap[itemId]) : m));
      setPendingContent(draft);
      setContent(deepCopy(draft));
      toast.info("Mission reverted to original text");
      return;
    }

    toast.info("Nothing to revert for that item");
  };

  /**
   * GENERATE PAYLOAD
   *
   * Produce a single 'update' payload for the full about document when any of
   * about/vision/mission changed. This matches your backend updateData('about').
   */
  const generatePayload = () => {
    const comm = committedContent ?? { about: "", vision: "", mission: [] };
    const pend = pendingContent ?? content ?? comm;

    const toMissionStrings = (arr) => (arr || []).map((m) => (m && m.text ? m.text : ""));

    const changed =
      (comm.about ?? "") !== (pend.about ?? "") ||
      (comm.vision ?? "") !== (pend.vision ?? "") ||
      JSON.stringify(toMissionStrings(comm.mission)) !== JSON.stringify(toMissionStrings(pend.mission));

    if (!changed) return [];

    const original_data = {
      about: comm.about ?? "",
      vision: comm.vision ?? "",
      mission: toMissionStrings(comm.mission),
    };

    const meta_data = {
      about: pend.about ?? "",
      vision: pend.vision ?? "",
      mission: toMissionStrings(pend.mission),
    };

    return [
      {
        action: "update",
        collectionName: "ecell",
        title: "About update",
        collection_type: "about",
        original_data,
        meta_data,
      },
    ];
  };

  const handleFinalRequestConfirm = async () => {
    const payload = generatePayload();
    if (!payload.length) {
      toast.info("No changes to submit");
      return;
    }

    try {
      await sendRequest(payload);
      toast.success("📩 Request sent for admin approval");

      // After sending, treat pending as committed locally
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

  // Show draft in preview if available
  const display = pendingContent ?? committedContent ?? { about: "", vision: "", mission: [] };

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
            <p className="admin-about-text ic-centered-text text-text dark:text-drkt mt-3">{display.about}</p>
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
              <p className="admin-about-text mt-3">{display.vision}</p>
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
                {(display?.mission || []).map((m) => (
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
                      <td className={`p-2 border ${ch.action === "Deleted" ? "text-red-600" : ch.action === "Added" ? "text-green-700" : "text-blue-600"}`}>{ch.action}</td>
                      <td className="p-2 border">{ch.section}</td>
                      <td className="p-2 border">
                        {ch.section === "Mission" ? (
                          ch.action === "Edited" ? (
                            <span><strong></strong> {ch.current}</span>
                          ) : ch.action === "Added" ? (
                            <span><strong></strong> {ch.current}</span>
                          ) : (
                            <span><strong></strong> {ch.original}</span>
                          )
                        ) : (
                          <>
                            <strong></strong> {ch.current}
                          </>
                        )}
                      </td>
                      <td className="p-2 border text-center">
                        <button onClick={() => revertChange(ch.itemId)} className="p-1 rounded hover:bg-gray-100">
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