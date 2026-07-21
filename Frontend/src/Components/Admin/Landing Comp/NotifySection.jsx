import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Trash2, FileText, Image as ImageIcon, Upload, Send, X } from "lucide-react";
import "./NotifySection.css";
import { useAdminRequest } from "../../hooks/useAdminRequest";
import api from "../../api/api";

const BASE_URL = process.env.REACT_APP_BASE_URL || "";
const DEFAULT_LANDING_PAGE_ENDPOINT = "/admin-backend/landing-page-details";
const SECTION_NAME = "Popup Notification";

const EMPTY_NOTICE = {
  title: "",
  type: "image",
  image_path: "",
  is_active: true,
};

const toBoolean = (value) =>
  value === true || value === "True" || value === "true";

const toStatusString = (value) => (value ? "True" : "False");

const normalizeNotice = (raw) => {
  if (!raw) return raw;

  const type = raw.type || (raw.pdf_path ? "pdf" : "image");
  const image_path =
    (type === "pdf" ? raw.pdf_path : raw.image_path) ??
    raw.image_path ??
    raw.pdf_path ??
    "";
  const is_active =
    typeof raw.is_active === "boolean" ? raw.is_active : toBoolean(raw.active);

  return { ...raw, type, image_path, is_active };
};

// -------------------- Stable identity helpers --------------------
// Every notice, the moment it enters app state, gets a permanent __uid.
// This is what fixes the "second delete overwrites the first" bug:
// keyFor no longer ever needs to fall back to an array index.
let uidCounter = 0;
const generateUid = () => `uid-${Date.now()}-${uidCounter++}`;

const ensureUid = (item) => {
  if (!item) return item;
  if (item.__uid) return item;
  return { ...item, __uid: item._id || item.id || generateUid() };
};

const ensureUids = (list) => (list || []).map(ensureUid);

const extractNoticesFromResponse = (data) => {
  const root = data?.data ?? data;
  const list =
    root?.notifyCards || root?.notify_cards || root?.notifications || [];
  return ensureUids(list.map(normalizeNotice).filter((item) => item.is_active));
};

// keyFor now relies on the permanent __uid first. The index fallback is kept
// only as a last-resort safety net (it should never actually be hit once
// ensureUid has run), so it no longer causes key collisions between
// consecutive deletes.
const keyFor = (notice, fallbackIdx) =>
  notice?.__uid || notice?._id || notice?.id || `new-${notice?.__tempId ?? fallbackIdx}`;

const findByKey = (list, key) =>
  list.find((item, idx) => keyFor(item, idx) === key);

const snapshotOf = (item) => {
  if (!item) return null;

  const type = item.type || (item.pdf_path ? "pdf" : "image");
  const mediaPath =
    type === "pdf"
      ? item.pdf_path ?? item.image_path ?? ""
      : item.image_path ?? item.pdf_path ?? "";

  return {
    type,
    image_path: type === "image" ? mediaPath || null : null,
    pdf_path: type === "pdf" ? mediaPath || null : null,
    active: toStatusString(
      typeof item.is_active === "boolean" ? item.is_active : toBoolean(item.active)
    ),
    title: item.title ?? "",
  };
};

const findChangeIndex = (list, action, key) =>
  list.findIndex((c) => c.action === action && c.section === SECTION_NAME && c.key === key);

const applyFieldChange = (prev, key, field, oldValue, newValue) => {
  const addIdx = findChangeIndex(prev, "add", key);
  if (addIdx !== -1) {
    const updated = [...prev];
    updated[addIdx] = {
      ...updated[addIdx],
      changes: { ...updated[addIdx].changes, [field]: { old: null, new: newValue } },
    };
    return updated;
  }

  const editIdx = findChangeIndex(prev, "edit", key);
  if (editIdx !== -1) {
    const updated = [...prev];
    const preservedOld = updated[editIdx].changes[field]?.old ?? oldValue;
    updated[editIdx] = {
      ...updated[editIdx],
      changes: { ...updated[editIdx].changes, [field]: { old: preservedOld, new: newValue } },
    };
    return updated;
  }

  return [
    ...prev,
    {
      action: "edit",
      section: SECTION_NAME,
      key,
      changes: { [field]: { old: oldValue, new: newValue } },
    },
  ];
};

const applyRemoval = (prev, key, item) => {
  const addIdx = findChangeIndex(prev, "add", key);
  if (addIdx !== -1) {
    const updated = [...prev];
    updated.splice(addIdx, 1);
    return updated;
  }

  const withoutEdits = prev.filter(
    (c) => !(c.action === "edit" && c.section === SECTION_NAME && c.key === key)
  );
  return [
    ...withoutEdits,
    { action: "delete", section: SECTION_NAME, key, changes: { deleted: item } },
  ];
};

const mergeSessionIntoAll = (allChanges, sessionChanges) => {
  const updated = [...allChanges];

  for (const change of sessionChanges) {
    const existingIndex = updated.findIndex(
      (c) => c.key === change.key && c.section === change.section
    );

    if (existingIndex === -1) {
      updated.push(change);
      continue;
    }

    const existing = updated[existingIndex];

    if (existing.action === "add" && change.action === "delete") {
      // Added then deleted within the same pending request: cancels out.
      updated.splice(existingIndex, 1);
      continue;
    }

    if (existing.action === "delete" && change.action === "add") {
      updated[existingIndex] = { action: "edit", section: change.section, key: change.key, changes: change.changes };
      continue;
    }

    if (existing.action === change.action || (existing.action === "add" && change.action === "edit")) {
      updated[existingIndex] = { ...existing, changes: { ...existing.changes, ...change.changes } };
      continue;
    }

    updated.push(change);
  }

  return updated;
};

const NotifySection = ({ data: pageData }) => {
  const fileInputRef = useRef(null);
  const { sendRequest, loading: sendingRequest } = useAdminRequest();
  const refreshIntervalMs = 15000;
  const initialNotices = useMemo(() => {
    const raw =
      pageData?.notifyCards || pageData?.notify_cards || pageData?.notifications || pageData || [];
    return ensureUids(raw.map(normalizeNotice));
  }, [pageData]);

  const [notices, setNotices] = useState([]);
  const [draftNotices, setDraftNotices] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSavedOnce, setIsSavedOnce] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState(false);

  // change tracking, same pattern as AdminFunded
  const [sessionChanges, setSessionChanges] = useState([]);
  const [allChanges, setAllChanges] = useState([]);

  const originalRef = useRef([]);
  const savedDataRef = useRef([]);
  const hasFetchedOnceRef = useRef(false);

  const objectUrlCacheRef = useRef(new Map());

  useEffect(() => {
    return () => {
      objectUrlCacheRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlCacheRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (hasFetchedOnceRef.current) return;
    if (initialNotices.length === 0) return;

    const cloned = structuredClone(initialNotices);
    setNotices(cloned);
    setDraftNotices(cloned);
    originalRef.current = structuredClone(cloned);
    savedDataRef.current = structuredClone(cloned);
  }, [initialNotices]);

  const applyApprovedNotices = useCallback((freshList) => {
    const cloned = structuredClone(ensureUids(freshList || []));
    setNotices(cloned);
    setDraftNotices(cloned);
    originalRef.current = structuredClone(cloned);
    savedDataRef.current = structuredClone(cloned);
  }, []);

  const fetchPublishedNotices = useCallback(async () => {
    try {
      const res = await api.get(DEFAULT_LANDING_PAGE_ENDPOINT);
      applyApprovedNotices(extractNoticesFromResponse(res.data));
      hasFetchedOnceRef.current = true;
    } catch (err) {
      console.error("Failed to refresh popup notification data:", err);
    }
  }, [applyApprovedNotices]);

  useEffect(() => {
    fetchPublishedNotices();

    const runRefresh = () => {
      if (isEditing || confirmPopup) return; // don't disrupt an active editing session
      fetchPublishedNotices();
    };

    const intervalId = setInterval(runRefresh, refreshIntervalMs);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") runRefresh();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", runRefresh);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", runRefresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshIntervalMs]);

  const urlParser = (path) => {
    if (!path) return "";

    if (path instanceof File) {
      const cache = objectUrlCacheRef.current;
      if (!cache.has(path)) {
        cache.set(path, URL.createObjectURL(path));
      }
      return cache.get(path);
    }

    if (path.startsWith("http")) return path;

    return `${BASE_URL}${path}`;
  };

  const pdfUrlParser = (path) => {
    const src = urlParser(path);
    if (!src) return "";
    const toolbarParams = "toolbar=0&navpanes=0&scrollbar=0";
    return src.includes("#") ? `${src}&${toolbarParams}` : `${src}#${toolbarParams}`;
  };

  const visibleNotices = isEditing ? draftNotices : notices.filter((item) => item.is_active);
  const currentNotice = visibleNotices[activeIndex] || visibleNotices[0];
  const hasSlides = visibleNotices.length > 0;

  useEffect(() => {
    if (activeIndex >= visibleNotices.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, visibleNotices.length]);

  // -------------------- Edit mode control --------------------
  const startEdit = () => {
    setDraftNotices(structuredClone(savedDataRef.current));
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraftNotices(structuredClone(savedDataRef.current));
    setSessionChanges([]);
    setIsEditing(false);
    setActiveIndex(0);
  };

  // -------------------- Slide CRUD (tracked like AdminFunded) --------------------
  const addSlide = () => {
    const tempId = Date.now();
    const newNotice = { ...EMPTY_NOTICE, __tempId: tempId, __uid: `new-${tempId}` };
    const next = [...draftNotices, newNotice];
    const key = keyFor(newNotice, next.length - 1);

    setDraftNotices(next);
    setIsEditing(true);
    setActiveIndex(next.length - 1);

    setSessionChanges((prev) => [
      ...prev,
      {
        action: "add",
        section: SECTION_NAME,
        key,
        changes: {
          title: { old: null, new: newNotice.title },
          type: { old: null, new: newNotice.type },
          image_path: { old: null, new: newNotice.image_path },
          is_active: { old: null, new: newNotice.is_active },
        },
      },
    ]);
  };

  const updateNotice = (index, field, value) => {
    const oldEntry = draftNotices[index];
    const oldValue = oldEntry?.[field];
    const key = keyFor(oldEntry, index);

    setDraftNotices((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
    setSessionChanges((prev) => applyFieldChange(prev, key, field, oldValue, value));
  };

  const removeCurrentNotice = () => {
    const item = draftNotices[activeIndex];
    const key = keyFor(item, activeIndex);

    setDraftNotices((prev) => {
      const filtered = prev.filter((_, i) => i !== activeIndex);
      setActiveIndex((idx) => Math.max(0, Math.min(idx, filtered.length - 1)));
      return filtered;
    });

    setSessionChanges((prev) => applyRemoval(prev, key, item));
  };

  const removeAllNotices = () => {
    if (!draftNotices.length) return;

    setSessionChanges((prev) =>
      draftNotices.reduce((acc, item, idx) => applyRemoval(acc, keyFor(item, idx), item), prev)
    );

    setDraftNotices([]);
    setActiveIndex(0);
  };

  const handleFileUpload = (file) => {
    if (!file || !isEditing) return;
    const type = file.type === "application/pdf" ? "pdf" : "image";

    updateNotice(activeIndex, "type", type);
    updateNotice(activeIndex, "image_path", file);
  };

  // -------------------- Save (session) --------------------
  const handleSaveSession = () => {
    if (sessionChanges.length === 0) {
      setIsEditing(false);
      return;
    }

    setAllChanges((prev) => mergeSessionIntoAll(prev, sessionChanges));

    savedDataRef.current = structuredClone(draftNotices.map(({ __tempId, ...rest }) => rest));
    setNotices(structuredClone(draftNotices));
    setSessionChanges([]);
    setIsEditing(false);
    setIsSavedOnce(true);
  };

  const handleDiscardAll = () => {
    setNotices(structuredClone(originalRef.current));
    setDraftNotices(structuredClone(originalRef.current));
    savedDataRef.current = structuredClone(originalRef.current);
    setSessionChanges([]);
    setAllChanges([]);
    setIsEditing(false);
    setIsSavedOnce(false);
  };

  const buildPayload = () => {
    const payload = [];
    const filesToUpload = [];

    const attachMedia = (meta, resolvedType, media) => {
      if (!media) return;
      if (media instanceof File) {
        const target = `/static/newscard/${media.name}`;
        if (resolvedType === "image") meta.image_path = target;
        else meta.pdf_path = target;
        filesToUpload.push(media);
      } else if (resolvedType === "image") {
        meta.image_path = media;
      } else {
        meta.pdf_path = media;
      }
    };

    allChanges.forEach((change) => {
      const c = change.changes || {};

      if (change.action === "add") {
        const resolvedType = c.type?.new ?? "image";
        const meta = {
          type: resolvedType,
          image_path: null,
          pdf_path: null,
          active: toStatusString(c.is_active?.new ?? true),
          title: c.title?.new ?? "",
        };
        attachMedia(meta, resolvedType, c.image_path?.new);

        payload.push({
          collectionName: "landing_page_details",
          collection_type: "news_card",
          action: "insert",
          title: "insert in news_card",
          meta_data: meta,
        });
        return;
      }

      if (change.action === "edit") {
        const current =
          findByKey(originalRef.current, change.key) ||
          findByKey(notices, change.key) ||
          findByKey(savedDataRef.current, change.key);

        const base = snapshotOf(current) || snapshotOf(c.deleted) || {
          type: c.type?.old ?? "image",
          image_path: null,
          pdf_path: null,
          active: "True",
          title: "",
        };

        const resolvedType = c.type?.new ?? base.type ?? "image";
        const nextMedia =
          c.image_path?.new ?? (resolvedType === base.type ? base.image_path || base.pdf_path : null);

        const meta = {
          type: resolvedType,
          image_path: null,
          pdf_path: null,
          active: c.is_active ? toStatusString(c.is_active.new) : base.active,
          title: c.title ? c.title.new : base.title,
        };
        attachMedia(meta, resolvedType, nextMedia);

        payload.push({
          collectionName: "landing_page_details",
          collection_type: "news_card",
          action: "update",
          title: "update in news_card",
          original_data: base,
          meta_data: meta,
        });
        return;
      }

      if (change.action === "delete") {
        const deletedItem =
          c.deleted ||
          findByKey(originalRef.current, change.key) ||
          findByKey(notices, change.key) ||
          findByKey(savedDataRef.current, change.key);

        const snap = snapshotOf(deletedItem);
        if (!snap) return;

        payload.push({
          collectionName: "landing_page_details",
          collection_type: "news_card",
          action: "delete",
          title: "delete in news_card",
          meta_data: snap,
        });
      }
    });

    return { payload, filesToUpload };
  };

  const handleFinalRequestConfirm = async () => {
    if (!allChanges.length) {
      setConfirmPopup(false);
      return;
    }

    const { payload, filesToUpload } = buildPayload();

    try {
      const result = await sendRequest(payload, filesToUpload);
      if (!result) return;

      setConfirmPopup(false);
      setAllChanges([]);
      setSessionChanges([]);
      setIsEditing(false);
      setIsSavedOnce(false);

      const approvedSnapshot = structuredClone(originalRef.current);
      setNotices(approvedSnapshot);
      setDraftNotices(approvedSnapshot);
      savedDataRef.current = structuredClone(approvedSnapshot);
      setActiveIndex(0);

      await fetchPublishedNotices();
      // if (onSave) {
      //   await onSave({ notifyCards: approvedSnapshot, pendingRequestSubmitted: true });
      // }
    } catch (err) {
      console.error("Final request failed:", err);
    }
  };

  const handleUndoChange = (idx) => {
    setAllChanges((prev) => {
      const change = prev[idx];
      if (change) {
        setNotices((data) => {
          let newData = [...data];

          if (change.action === "edit") {
            const targetIndex = newData.findIndex((d, i) => keyFor(d, i) === change.key);
            if (targetIndex !== -1) {
              const revertedFields = Object.fromEntries(
                Object.entries(change.changes).map(([field, { old }]) => [field, old])
              );
              newData[targetIndex] = { ...newData[targetIndex], ...revertedFields };
            }
          }

          if (change.action === "add") {
            newData = newData.filter((d, i) => keyFor(d, i) !== change.key);
          }

          if (change.action === "delete") {
            newData = [...newData, change.changes.deleted];
          }

          return newData;
        });
      }
      return prev.filter((_, i) => i !== idx);
    });
  };

  const goPrev = () => {
    if (!visibleNotices.length) return;
    setActiveIndex((prev) => (prev === 0 ? visibleNotices.length - 1 : prev - 1));
  };

  const goNext = () => {
    if (!visibleNotices.length) return;
    setActiveIndex((prev) => (prev + 1) % visibleNotices.length);
  };

  return (
    <>
      <section className="notify-section-admin">
        <div className="notify-toolbar">
          {isEditing ? (
            <button className="notify-icon-btn notify-add-btn" onClick={addSlide}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </button>
          ) : (
            <button className="notify-edit-btn" onClick={startEdit}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                <path d="m15 5 4 4" />
              </svg>
              <span>Edit</span>
            </button>
          )}
        </div>

        <div className="notify-section-card">
          <div className="notify-section-content">
            <h2>POPUP NOTIFICATION SECTION</h2>

            {hasSlides ? (
              <div className="notify-carousel">
                {visibleNotices.length > 1 && (
                  <button className="notify-slider-btn notify-slider-btn-left" onClick={goPrev}>
                    ◀
                  </button>
                )}

                <div className="notify-slide">
                  <div className={`notify-slide-media ${currentNotice.type === "pdf" ? "is-pdf" : "is-image"}`}>
                    <span className={`notify-media-badge ${currentNotice.type === "pdf" ? "badge-pdf" : "badge-image"}`}>
                      {currentNotice.type === "pdf" ? <FileText size={14} /> : <ImageIcon size={14} />}
                      {currentNotice.type === "pdf" ? "PDF" : "Image"}
                    </span>

                    {currentNotice.type === "pdf" ? (
                      currentNotice.image_path ? (
                        <iframe src={pdfUrlParser(currentNotice.image_path)} title={currentNotice.title} />
                      ) : (
                        <div className="notify-empty-media">
                          <FileText size={40} strokeWidth={1.4} />
                          <span>Upload PDF</span>
                        </div>
                      )
                    ) : currentNotice.image_path ? (
                      <img src={urlParser(currentNotice.image_path)} alt={currentNotice.title} />
                    ) : (
                      <div className="notify-empty-media">
                        <ImageIcon size={40} strokeWidth={1.4} />
                        <span>Upload Image</span>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="notify-inline-editor">
                      <input
                        type="text"
                        value={currentNotice.title}
                        placeholder="Enter title "
                        onChange={(e) => updateNotice(activeIndex, "title", e.target.value)}
                      />

                      <div className="notify-editor-controls">
                        <button className="notify-upload-btn" onClick={() => fileInputRef.current?.click()}>
                          <Upload size={18} />
                          {currentNotice.image_path ? "Replace" : "Upload"}
                        </button>

                        <input
                          ref={fileInputRef}
                          hidden
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            handleFileUpload(e.target.files?.[0]);
                            e.target.value = ""; // allow re-selecting the same file later
                          }}
                        />

                        <label className="notify-toggle">
                          <input
                            type="checkbox"
                            checked={Boolean(currentNotice.is_active)}
                            onChange={(e) => updateNotice(activeIndex, "is_active", e.target.checked)}
                          />
                          <span />
                          Active
                        </label>

                        <button className="notify-delete-btn" onClick={removeCurrentNotice}>
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <h3>{currentNotice.title}</h3>
                  )}
                </div>

                {visibleNotices.length > 1 && (
                  <button className="notify-slider-btn notify-slider-btn-right" onClick={goNext}>
                    ▶
                  </button>
                )}
              </div>
            ) : (
              <div className="notify-empty-state">
                {isEditing ? "No slides yet — tap + above to add one." : "No active popup notification added."}
              </div>
            )}

            {isEditing && (
              <div className="notify-save-row">
                <button className="notify-cancel-btn" onClick={cancelEdit}>
                  Cancel
                </button>
                {hasSlides && draftNotices.length > 1 && (
                  <button className="notify-discard-btn" onClick={removeAllNotices}>
                    <Trash2 size={16} /> Delete All
                  </button>
                )}
                {sessionChanges.length > 0 && (
                  <button className="notify-save-btn" onClick={handleSaveSession}>
                    Save Changes
                  </button>
                )}
              </div>
            )}

            {!isEditing && isSavedOnce && (
              <div className="notify-request-row">
                <button className="notify-discard-btn" onClick={handleDiscardAll}>
                  Discard All
                </button>
                <button className="notify-request-btn" onClick={() => setConfirmPopup(true)}>
                  <Send size={18} /> Request
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {confirmPopup && (
        <div className="notify-popup-overlay">
          <div className="notify-popup">
            <div className="notify-popup-header">
              <h2>Request</h2>
              <p className="notify-popup-note">
                Note: Your changes will stay pending until approved by the superior admin. Once approved will go live.
              </p>
            </div>

            <div className="notify-popup-body">
              <table className="notify-popup-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Section</th>
                    <th>Changes</th>
                    <th>Undo</th>
                  </tr>
                </thead>
                <tbody>
                  {allChanges.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "16px" }}>
                        No changes to submit
                      </td>
                    </tr>
                  ) : (
                    allChanges.map((change, idx) => (
                      <tr key={change.key || idx}>
                        <td>
                          {change.action === "add" && <span className="notify-action notify-action-add">+ Added</span>}
                          {change.action === "edit" && <span className="notify-action notify-action-edit">✎ Edited</span>}
                          {change.action === "delete" && <span className="notify-action notify-action-delete">🗑 Deleted</span>}
                        </td>

                        <td>Popup Notification</td>

                        <td>
                          {change.action === "delete" && <span>{change.changes?.deleted?.title || "Untitled"}</span>}

                          {change.action === "add" && <span>{change.changes?.title?.new || "Untitled"}</span>}

                          {change.action === "edit" &&
                            (() => {
                              const c = change.changes || {};
                              const parts = [];

                              if (c.title && c.title.old !== c.title.new) {
                                parts.push(`${c.title.old || "—"} → ${c.title.new}`);
                              }
                              if (c.image_path && c.image_path.old !== c.image_path.new) {
                                parts.push("File updated");
                              }
                              if (c.type && c.type.old !== c.type.new) {
                                parts.push(`Type: ${c.type.old || "—"} → ${c.type.new}`);
                              }
                              if (c.is_active && c.is_active.old !== c.is_active.new) {
                                parts.push(c.is_active.new ? "Activated" : "Deactivated");
                              }

                              return parts.length ? (
                                parts.map((p, i) => <div key={i}>{p}</div>)
                              ) : (
                                <span>Updated</span>
                              );
                            })()}
                        </td>

                        <td>
                          <button className="notify-undo-btn" onClick={() => handleUndoChange(idx)}>
                            <X size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="notify-popup-footer">
              <button className="notify-popup-cancel" onClick={() => setConfirmPopup(false)}>
                Cancel
              </button>
              <button className="notify-popup-request" onClick={handleFinalRequestConfirm} disabled={sendingRequest}>
                {sendingRequest ? "Sending..." : "Final Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotifySection;