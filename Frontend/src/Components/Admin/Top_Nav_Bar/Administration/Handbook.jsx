import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faPlus } from "@fortawesome/free-solid-svg-icons";
import Banner from "../../Banner";
import axios from "axios";
import "./Handbook.css";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router";
import { FaPaperPlane } from "react-icons/fa";
import { Eye } from "lucide-react";
import { MdUndo } from "react-icons/md";
import { Pencil } from "lucide-react";
import { X } from "lucide-react";
import { useAdminRequest } from "../../../hooks/useAdminRequest";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const UrlParser = (path) => (path?.startsWith("http") ? path : `${BASE_URL}${path}`);
const generateId = () => `hb_${Date.now().toString(36)}_${Math.floor(Math.random() * 10000)}`;

/* ---------- Confirm Modal ---------- */
const ConfirmModal = ({ show, message, onCancel, onConfirm, type = "confirm" }) => {
  if (!show) return null;
  const isDelete = type === "delete";
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[2000] scrabble-bg bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[420px] max-w-[92vw] relative">
        <p className="text-lg font-semibold mb-6 text-center text-brwn">{message}</p>
        <div className="flex justify-center gap-4">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded ${isDelete ? "bg-red-500 text-white hover:bg-red-600" : "bg-yellow-400 text-black hover:bg-yellow-500"}`}
          >
            {isDelete ? "Delete" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};


/* ---------- Handbook Card ---------- */
const HandbookButton = ({ year, pdfspath, editable, onOpen, onEdit, onToggleSelect, checked }) => (
  <div className="relative flex flex-col items-center">
    <button
      onClick={() => onOpen(year, pdfspath)}
      className="flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-prim dark:bg-drkb border-2 border-secd dark:border-drks text-text dark:text-prim text-lg font-medium hover:bg-yellow-100 shadow-md transition-all duration-200 no-underline cursor-pointer w-48 whitespace-nowrap"
    >
      <FontAwesomeIcon icon={faBook} className="text-secd dark:text-drks" />
      {year}
    </button>

    {editable && (
      <div className="absolute right-1 top-2 flex items-center gap-1">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => { e.stopPropagation(); onToggleSelect(); }}
          className="w-4 h-4"
          title="Select"
        />
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="px-2 text-brwn rounded-full"
          title="Edit"
        >
          <Pencil size={14} />
        </button>
      </div>
    )}
  </div>
);

/* ---------- Add/Edit Modal ---------- */
const EditModal = ({ initialData, onClose, onSave }) => {
  const [form, setForm] = useState(initialData || { year: "", pdf_path: "" });
  const fileInputRef = useRef();

  useEffect(() => {
    setForm(initialData || { year: "", pdf_path: "" });
  }, [initialData]);

  const triggerFileInput = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      const blobUrl = URL.createObjectURL(f);
      setForm((prev) => ({ ...prev, pdf_path: blobUrl, _file: f }));
    }
  };

  const handlePreview = () => {
    if (form.pdf_path && form.pdf_path !== "#") window.open(UrlParser(form.pdf_path), "_blank", "noopener,noreferrer");
  };

  const handleSave = () => {
    const payload = { ...form };
    if (!payload.id) payload.id = generateId();
    onSave(payload);
  };

  const isExisting = !!initialData;
  const isHr = initialData?.kind === "hr";
  const title = isHr ? (isExisting ? "Edit HR Handbook" : "Add HR Handbook") : (isExisting ? "Edit Handbook" : "Add PDF");

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[2000]">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[420px] max-w-[92vw] shadow-lg">
        <h2 className="text-brwn text-lg font-bold mb-4 text-center">{title}</h2>

        <div className="mb-4">
          <input
            type="text"
            name="year"
            value={form.year}
            onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))}
            className="w-full border p-2 rounded"
            placeholder="Name / Year"
          />
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div className="flex-1">
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={triggerFileInput}
                className="px-3 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500 flex items-center gap-2 whitespace-nowrap"
                title={isExisting ? "Replace PDF" : "Upload PDF"}
              >
                {isExisting ? "Replace PDF" : "Upload PDF"}
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); handlePreview(); }}
                className="px-3 py-2 text-blue-400 gap-2"
                title="Preview current PDF"
                disabled={!form.pdf_path}
              >
                <Eye size={20} />
              </button>

              <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-3 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 whitespace-nowrap">Cancel</button>
          <button onClick={handleSave} className="px-3 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500 whitespace-nowrap">Save</button>
        </div>
      </div>
    </div>
  );
};

/* ---------- Helpers ---------- */
const buildSafeName = (file) => {
  try {
    if (!file) return null;
    if (typeof file === "object" && file.name) {
      return `${Date.now()}_${String(file.name).replace(/\s+/g, "_")}`;
    }
    if (typeof file === "string") {
      const base = file.split("/").pop();
      return `${Date.now()}_${String(base || "file").replace(/\s+/g, "_")}`;
    }
    return `${Date.now()}_file`;
  } catch {
    return `${Date.now()}_file`;
  }
};

/* ---------- Main Component ---------- */
const AdminHandbook = ({ theme, toggle }) => {
  const [handBook, setHandbook] = useState(null);
  const [originalHandbook, setOriginalHandbook] = useState(null);
  const [hrHandbook, setHrHandbook] = useState(null);
  const [originalHrHandbook, setOriginalHrHandbook] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const [editModeChanges, setEditModeChanges] = useState([]);
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);

  const [pendingChanges, setPendingChanges] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const navigate = useNavigate();
  const { sendRequest, loading: reqLoading } = useAdminRequest();

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const response = await axios.post("/api/main-backend/administration", { type: "HandBook" });
        const data = (response.data.data || []).map((it) => ({ id: it.id || generateId(), ...it }));
        setHandbook(data);
        setOriginalHandbook(JSON.parse(JSON.stringify(data)));
      } catch (error) {
        console.error("Error fetching handbook data", error);
        if (error?.response?.data?.status === 429) navigate("/ratelimit", { state: { msg: error.response?.data?.message } });
      }

      try {
        const hrRes = await axios.post("/api/main-backend/administration", { type: "HRHandBook" });
        const hrDataArr = hrRes.data.data || [];
        const hrItem = hrDataArr.length ? ({ id: hrDataArr[0].id || generateId(), ...hrDataArr[0] }) : null;
        setHrHandbook(hrItem);
        setOriginalHrHandbook(hrItem ? JSON.parse(JSON.stringify(hrItem)) : null);
      } catch (error) {
        console.error("Error fetching HR handbook data", error);
        if (error?.response?.data?.status === 429) navigate("/ratelimit", { state: { msg: error.response?.data?.message } });
      }
    };
    fetchdata();
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

  const addChange = (change) => setEditModeChanges((prev) => [...prev, change]);

  const startEditMode = () => {
    setOriginalHandbook((prev) => prev || (handBook ? JSON.parse(JSON.stringify(handBook)) : null));
    setOriginalHrHandbook((prev) => prev || (hrHandbook ? JSON.parse(JSON.stringify(hrHandbook)) : null));
    setEditMode(true);
    setEditModeChanges([]);
    setSelectedIds([]);
  };

  const handleAdd = () => { setEditData(null); setShowModal(true); };
  const handleEdit = (item, index) => { setEditData({ ...item, index, kind: "handbook" }); setShowModal(true); };
  const handleEditHr = () => {
    if (!hrHandbook) setEditData({ year: "HR Handbook", pdf_path: "#", kind: "hr" });
    else setEditData({ ...hrHandbook, kind: "hr", prevItem: hrHandbook });
    setShowModal(true);
  };

  const handleDelete = (index) => {
    const prevItem = handBook[index];
    addChange({ type: "delete", label: `Handbook ${prevItem?.year || index + 1}`, index, prevItem });
    setHandbook((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSelect = (index) => {
    setSelectedIds((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  };

  const handleSaveModal = (form) => {
    if (!form.id) form.id = generateId();

    if (editData && editData.kind === "hr") {
      const prev = hrHandbook;
      const newHr = { ...prev, ...form };
      if (form._file) newHr._file = form._file;
      setHrHandbook(newHr);
      if (prev && prev.id) addChange({ type: "update", label: "HR Handbook", prevItem: prev, newItem: newHr, collection_type: "HRHandBook" });
      else addChange({ type: "insert", label: "HR Handbook", item: newHr, collection_type: "HRHandBook" });
      setShowModal(false);
      return;
    }

    if (editData) {
      const updated = [...(handBook || [])];
      const prev = updated[editData.index];
      const newItem = { ...prev, ...form };
      if (form._file) newItem._file = form._file;
      updated[editData.index] = newItem;
      setHandbook(updated);
      addChange({ type: "update", label: form.year || prev.year, index: editData.index, prevItem: prev, newItem });
    } else {
      const newItem = { ...form };
      if (form._file) newItem._file = form._file;
      setHandbook((p) => [...(p || []), newItem]);
      addChange({ type: "insert", label: form.year, item: newItem });
    }
    setShowModal(false);
  };

  const handleSaveSession = () => {
    if (!editModeChanges.length) { setEditMode(false); setEditModeChanges([]); setSelectedIds([]); return; }
    setPendingChanges((p) => [...p, ...editModeChanges]);
    setEditMode(false);
    setEditModeChanges([]);
    setSelectedIds([]);
    setIsSaved(true);
  };

  const handleCancelEdit = () => {
    if (editModeChanges.length > 0) setShowConfirmCancelModal(true);
    else { setEditMode(false); setEditModeChanges([]); setSelectedIds([]); }
  };

  const handleConfirmCancel = () => {
    let reverted = [...(handBook || [])];
    for (let i = editModeChanges.length - 1; i >= 0; i--) {
      const c = editModeChanges[i];
      if (c.type === "insert") {
        reverted = reverted.filter((it) => it.id !== c.item?.id);
      } else if (c.type === "update") {
        if (typeof c.index === "number" && reverted[c.index]) reverted[c.index] = c.prevItem;
        else if (c.prevItem?.id) {
          const idx = reverted.findIndex((it) => it.id === c.prevItem.id);
          if (idx !== -1) reverted[idx] = c.prevItem;
        }
      } else if (c.type === "delete") {
        const insertIndex = c.index <= reverted.length ? c.index : reverted.length;
        reverted.splice(insertIndex, 0, c.prevItem);
      }
    }
    setHandbook(reverted);
    if (originalHrHandbook) setHrHandbook(originalHrHandbook);
    setEditMode(false);
    setEditModeChanges([]);
    setShowConfirmCancelModal(false);
    setSelectedIds([]);
  };

  const handleAbortCancel = () => setShowConfirmCancelModal(false);

  // Build grouped payloads (separate for HandBook and HRHandBook) and collect files
  const buildGroupedPayloads = (changes) => {
    const groups = { HandBook: { entries: [], files: [] }, HRHandBook: { entries: [], files: [] } };
    if (!Array.isArray(changes) || changes.length === 0) return groups;

    changes.forEach((c) => {
      const collectionType = c.collection_type || (c.label === "HR Handbook" ? "HRHandBook" : "HandBook");
      const target = groups[collectionType] || groups.HandBook;
      const pdfFolder = collectionType === "HRHandBook" ? "hr_handbook" : "handbook";

      if (c.type === "insert") {
        const item = c.item || {};
        const meta = { year: item.year || "" };
        if (item._file && typeof item._file === "object") {
          const safe = buildSafeName(item._file);
          meta.pdf_path = safe ? `/static/pdfs/${pdfFolder}/${safe}` : item.pdf_path || item.url || "";
          if (safe) target.files.push(new File([item._file], safe, { type: item._file.type }));
        } else {
          meta.pdf_path = item.pdf_path || item.url || "";
        }
        target.entries.push({
          collectionName: "administration",
          collection_type: collectionType,
          action: "insert",
          title: `Add ${collectionType} - ${meta.year}`,
          category: "administration",
          meta_data: meta,
          original_data: {},
        });
      } else if (c.type === "update") {
        const prev = c.prevItem || {};
        const nw = c.newItem || {};
        const meta = {};
        const original = {};
        if ((prev.year || "") !== (nw.year || ""))
           { meta.year = nw.year || ""; original.year = prev.year || ""; }

        if (nw._file && typeof nw._file === "object") {
          const safe = buildSafeName(nw._file);
          if (safe) {
            meta.pdf_path = `/static/pdfs/${pdfFolder}/${safe}`;
            target.files.push(new File([nw._file], safe, { type: nw._file.type }));
            original.pdf_path = prev.pdf_path || prev.url || "";
          }
        } else if ((prev.pdf_path || prev.url || "") !== (nw.pdf_path || nw.url || "")) {
          meta.pdf_path = nw.pdf_path || nw.url || "";
          original.pdf_path = prev.pdf_path || prev.url || "";
        }
   
       
      
        

        if (Object.keys(meta).length) {
          target.entries.push({
            collectionName: "administration",
            collection_type: collectionType,
            action: "update",
            title: `Update ${collectionType} - ${nw.year || ""}`,
            category: "administration",
            meta_data: meta,
            original_data: original,
          });
        }
      } else if (c.type === "delete") {
        const prev = c.prevItem || {};
        target.entries.push({
          collectionName: "administration",
          collection_type: collectionType,
          action: "delete",
          title: `Delete ${collectionType} - ${prev.year || ""}`,
          category: "administration",
          meta_data: { year: prev.year || "", pdf_path: "" },
          original_data: { year: prev.year || "", pdf_path: prev.pdf_path || prev.url || "" },
        });
      }
    });

    return groups;
  };

  // Use combined changes: pendingChanges + editModeChanges (in case user didn't save session)
  const handleRequest = async () => {
    const combined = [...(pendingChanges || []), ...(editModeChanges || [])];
    if (!combined.length) { setShowConfirmModal(false); return; }

    const grouped = buildGroupedPayloads(combined);

    try {
      // Send HandBook group
      if (grouped.HandBook.entries.length) {
        const res1 = await sendRequest(grouped.HandBook.entries, grouped.HandBook.files.length ? grouped.HandBook.files : null);
        if (!res1?.success) {
          if (res1?.status === 429 || res1?.data?.status === 429) {
            navigate("/ratelimit", { state: { msg: res1?.message || res1?.data?.message || "Rate limit exceeded" } });
            return;
          }
          toast.error(res1?.message || "Failed to submit handbook changes.");
          return;
        }
      }

      // Send HRHandBook group
      if (grouped.HRHandBook.entries.length) {
        const res2 = await sendRequest(grouped.HRHandBook.entries, grouped.HRHandBook.files.length ? grouped.HRHandBook.files : null);
        if (!res2?.success) {
          if (res2?.status === 429 || res2?.data?.status === 429) {
            navigate("/ratelimit", { state: { msg: res2?.message || res2?.data?.message || "Rate limit exceeded" } });
            return;
          }
          toast.error(res2?.message || "Failed to submit HR handbook changes.");
          return;
        }
      }

      // Both succeeded: optimistic updates for file paths
      const updatedHandbook = (handBook || []).map((it) => {
        const added = combined.find((c) => c.type === "insert" && c.item?.id === it.id);
        const upd = combined.find((c) => c.type === "update" && ((c.newItem?.id && c.newItem.id === it.id) || (c.prevItem?.id && c.prevItem.id === it.id)));
        if (added && added.item && added.item._file) {
          const safe = buildSafeName(added.item._file);
          return { ...it, pdf_path: `/static/pdfs/handbook/${safe}`, _new: false };
        }
        if (upd && upd.newItem && upd.newItem._file) {
          const safe = buildSafeName(upd.newItem._file);
          return { ...it, pdf_path: `/static/pdfs/handbook/${safe}` };
        }
        return it;
      });

      let updatedHr = hrHandbook;
      const hrAdded = combined.find((c) => (c.collection_type === "HRHandBook" || c.label === "HR Handbook") && c.type === "insert");
      const hrUpdated = combined.find((c) => (c.collection_type === "HRHandBook" || c.label === "HR Handbook") && c.type === "update");
      if (hrAdded && hrAdded.item && hrAdded.item._file) {
        const safe = buildSafeName(hrAdded.item._file);
        updatedHr = { ...(hrHandbook || {}), pdf_path: `/static/pdfs/hr_handbook/${safe}` };
      } else if (hrUpdated && hrUpdated.newItem && hrUpdated.newItem._file) {
        const safe = buildSafeName(hrUpdated.newItem._file);
        updatedHr = { ...(hrHandbook || {}), pdf_path: `/static/pdfs/hr_handbook/${safe}` };
      }

      // Clear pending and session changes
      setPendingChanges([]);
      setEditModeChanges([]);
      setOriginalHandbook(updatedHandbook);
      setHandbook(updatedHandbook);
      setOriginalHrHandbook(updatedHr);
      setHrHandbook(updatedHr);
      setIsSaved(false);
      setShowConfirmModal(false);
      toast.success("Request submitted successfully.");
    } catch (err) {
      console.error("Error while sending admin request:", err);
      toast.error("Request failed.");
    }
  };

  const confirmDeleteSelected = () => {
    const indices = [...selectedIds].sort((a, b) => b - a);
    indices.forEach((idx) => {
      const prevItem = handBook[idx];
      addChange({ type: "delete", label: `Handbook ${prevItem?.year || idx + 1}`, index: idx, prevItem });
    });
    setHandbook((prev) => prev.filter((_, i) => !selectedIds.includes(i)));
    setSelectedIds([]);
    setShowDeleteModal(false);
  };

  const getChanges = () => (pendingChanges || []).map((c, idx) => {
    if (c.type === "insert") return { id: idx, action: "insert", category: c.label || c.item?.year || "New Handbook", files: c.item?._file ? [c.item._file] : [], links: (c.item?.pdf_path || c.item?.url) ? [c.item.pdf_path || c.item.url] : [], raw: c };
    if (c.type === "update") return { id: idx, action: "update", category: c.label || c.newItem?.year || "Updated Handbook", files: c.newItem?._file ? [c.newItem._file] : [], links: (c.newItem?.pdf_path || c.newItem?.url) ? [c.newItem.pdf_path || c.newItem.url] : [], raw: c, original: c.prevItem };
    if (c.type === "delete") return { id: idx, action: "delete", category: c.label || c.prevItem?.year || "Deleted Handbook", files: [], links: [], raw: c, original: c.prevItem };
    return { id: idx, action: "update", category: c.label || "Change", files: [], links: [], raw: c };
  });

  const handleUndo = (changeEntry) => {
    const idx = changeEntry.id;
    const c = changeEntry.raw;

    setPendingChanges((prev) => {
      const newArr = [...prev];
      if (idx >= 0 && idx < newArr.length) newArr.splice(idx, 1);
      return newArr;
    });

    setHandbook((prev) => {
      if (!prev) return prev;
      const copy = [...prev];
      if (c.type === "insert") return copy.filter((it) => !(it.id === c.item?.id));
      if (c.type === "update") {
        if (c.prevItem?.id) {
          const idx2 = copy.findIndex((it) => it.id === c.prevItem.id);
          if (idx2 !== -1) { copy[idx2] = c.prevItem; return copy; }
        } else if (typeof c.index === "number" && copy[c.index]) { copy[c.index] = c.prevItem; return copy; }
      }
      if (c.type === "delete") {
        const insertIndex = c.index <= copy.length ? c.index : copy.length;
        copy.splice(insertIndex, 0, c.prevItem);
        return copy;
      }
      return copy;
    });

    if (c.collection_type === "HRHandBook") {
      if (c.type === "insert") setHrHandbook(null);
      else if (c.type === "update") setHrHandbook(c.prevItem || null);
      else if (c.type === "delete") setHrHandbook(c.prevItem || null);
    }
  };

  // ---- NEW: Auto close request modal + return to original page (Edit button visible) when no changes left
  useEffect(() => {
    if (!showConfirmModal) return;
    if (getChanges().length === 0) {
      setShowConfirmModal(false);
      setIsSaved(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showConfirmModal, pendingChanges, editModeChanges]);
  // ---- END NEW

  const confirmDiscardAll = () => {
    setHandbook(originalHandbook);
    setHrHandbook(originalHrHandbook);
    setPendingChanges([]);
    setShowDiscardModal(false);
    setIsSaved(false);
  };

  if (!isOnline) {
    return <div className="h-screen flex items-center justify-center md:mt-[10%] md:block"><LoadComp txt={"You are offline"} /></div>;
  }

  const hasSessionChanges = () => editModeChanges.length > 0;
  const hasPending = () => pendingChanges.length > 0;

  const HrHandbookCard = () => {
    const label = hrHandbook?.year || "HR Handbook";
    const pdfPath = hrHandbook?.pdf_path ? UrlParser(hrHandbook.pdf_path) : "#";
    return (
      <div className="w-full max-w-[900px] mt-4 mb-14 flex flex-col items-center">
        <h2 className="text-[32px] font-semibold mb-8 mt-5 text-brwn dark:text-drkt">HR Handbook</h2>
        <div className="flex items-center gap-4">
          <button onClick={handleEditHr} className="flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-prim dark:bg-drkb border-2 border-secd dark:border-drks text-text dark:text-prim text-lg font-medium hover:bg-yellow-100 shadow-md transition-all duration-200 no-underline cursor-pointer w-80 whitespace-nowrap" title="Edit HR Handbook">
            <FontAwesomeIcon icon={faBook} className="text-secd dark:text-drks" />
            {label}
          </button>
          <div>
            {hrHandbook?.pdf_path && (
              <button onClick={() => { if (pdfPath && pdfPath !== "#") window.open(pdfPath, "_blank", "noopener,noreferrer"); }} className="px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 whitespace-nowrap ml-2" title="Preview HR Handbook">
                Preview
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Banner toggle={toggle} theme={theme} backgroundImage="./Banners/administrationbanner.webp" headerText="Handbook" subHeaderText="Comprehensive manual for students and staff" />

      {!editMode && (
        <div className="justify-end mt-3 mr-10 bottom-6 right-6 flex gap-3 z-[1000]">
          <button onClick={startEditMode} className="px-4 py-2 font-poppi bg-yellow-400 text-black rounded hover:bg-yellow-500 whitespace-nowrap shadow">Edit</button>
        </div>
      )}

      {handBook ? (
        <div className="flex flex-col items-center my-px-1">
          <h2 className="text-[32px] font-semibold mb-8 mt-5 text-brwn dark:text-drkt">Handbook</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 mb-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 justify-center items-center px-4">
            {handBook.map((year, idx) => (
              <HandbookButton
                key={year.id || idx}
                year={year?.year}
                pdfspath={year?.pdf_path ? UrlParser(year?.pdf_path) : "#"}
                editable={editMode}
                onOpen={(y, p) => { if (p && p !== "#") window.open(p, "_blank", "noopener,noreferrer"); }}
                onEdit={() => handleEdit(year, idx)}
                onToggleSelect={() => toggleSelect(idx)}
                checked={selectedIds.includes(idx)}
              />
            ))}
            {editMode && (
              <button onClick={handleAdd} className="flex items-center justify-center gap-2 px-6 py-4 rounded-lg border-2 border-dashed border-secd dark:border-drks text-secd dark:text-drks text-lg font-medium hover:bg-yellow-50 shadow-md transition-all duration-200 w-48 whitespace-nowrap">
                <FontAwesomeIcon icon={faPlus} /> Add
              </button>
            )}
          </div>

          {showConfirmCancelModal && <ConfirmModal show={true} message="Discard changes for this edit session?" onCancel={handleAbortCancel} onConfirm={handleConfirmCancel} type="confirm" />}

          {showDeleteModal && <ConfirmModal show={true} message={`Are you sure you want to delete the selected handbook${selectedIds.length > 1 ? "s" : ""}?`} onCancel={() => setShowDeleteModal(false)} onConfirm={confirmDeleteSelected} type="delete" />}

          {editMode && selectedIds.length > 0 && (
            <div className="justify-center mb-1 flex gap-3 z-[1000]">
              <button onClick={() => setShowDeleteModal(true)} className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 shadow-lg whitespace-nowrap">Delete Selected</button>
            </div>
          )}

          {editMode && <HrHandbookCard />}
        </div>
      ) : <div className="h-screen flex items-center justify-center md:mt-[10%] md:block"><LoadComp txt={""} /></div>}

      {showModal && <EditModal initialData={editData} onClose={() => setShowModal(false)} onSave={handleSaveModal} />}

      {editMode && (
        <div className="mr-10 mb-3 justify-end bottom-6 right-6 flex gap-3 z-[1000]">
          <button onClick={handleCancelEdit} className="px-4 py-2 bg-gray-400 text-white font-[poppins] rounded hover:bg-gray-500 shadow whitespace-nowrap" disabled={reqLoading}>Cancel</button>
          {hasSessionChanges() && <button onClick={handleSaveSession} className="px-4 py-2 bg-secd text-white font-[poppins] rounded hover:bg-yellow-500 shadow whitespace-nowrap" disabled={reqLoading}>{reqLoading ? "Processing..." : "Save"}</button>}
        </div>
      )}

      {!editMode && hasPending() && (
        <div className="justify-end mb-3 mr-10 bottom-6 right-6 flex gap-3 z-[1000]">
          <button onClick={() => setShowDiscardModal(true)} className="px-4 py-2 bg-gray-400 text-white font-[poppins] rounded hover:bg-gray-500 shadow whitespace-nowrap" disabled={reqLoading}>Discard All Changes</button>
          <button onClick={() => setShowConfirmModal(true)} className="px-4 py-2 bg-yellow-400 text-black font-[poppins] rounded hover:bg-yellow-500 shadow flex items-center gap-2 whitespace-nowrap" disabled={reqLoading}><FaPaperPlane /> Request</button>
        </div>
      )}

      <ConfirmModal show={showDiscardModal} message="Are you sure you want to discard all changes?" onCancel={() => setShowDiscardModal(false)} onConfirm={confirmDiscardAll} type="confirm" />

      {/* Confirm request modal (REPLACED as per your provided code) */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[600px]">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Final Request for the Changes
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the
              superior admin. Once approved, they will be applied automatically
              to the live site.
            </p>
            <div className="max-h-[200px] overflow-y-auto mb-4">
              {getChanges().length > 0 ? (
                <table className="w-full text-left text-text dark:text-drkt">
                  <thead>
                    <tr>
                      <th className="py-1">Action</th>
                      <th className="py-1">Section</th>
                      <th className="py-1">Changes</th>
                      <th className="py-1">Undo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getChanges().map((g, i) => (
                      <tr key={i}>
                        <td className="py-1">
                          {g.action === "insert" && (
                            <span className="text-green-600">+ Added</span>
                          )}
                          {g.action === "update" && (
                            <span className="text-blue-600">✎ Edited</span>
                          )}
                          {g.action === "delete" && (
                            <span className="text-red-600">– Deleted</span>
                          )}
                        </td>
                        <td className="py-1">{g.category}</td>
                        <td className="py-1">
                          {g.files.length} images
                          {g.links.length > 0
                            ? `, ${g.links.length} links`
                            : ""}
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              // Remove this change from pendingChanges
                              setPendingChanges(prev => prev.filter((_, idx) => idx !== g.id));

                              // Restore UI state for handbook/HR handbook
                              const c = g.raw;

                              // If it was an "insert", remove the added item from handbook
                              if (g.action === "insert") {
                                setHandbook(prev => (prev || []).filter(it => it.id !== c.item?.id));
                              }

                              // If it was a "delete", restore the deleted item
                              if (g.action === "delete" && g.original) {
                                setHandbook(prev => {
                                  const copy = [...(prev || [])];
                                  const insertIndex = (c.index <= copy.length ? c.index : copy.length);
                                  copy.splice(insertIndex, 0, g.original);
                                  return copy;
                                });
                              }

                              // If it was an "update", restore original item
                              if (g.action === "update" && g.original) {
                                setHandbook(prev => {
                                  const copy = [...(prev || [])];
                                  const idx2 = copy.findIndex(it => it.id === g.original.id);
                                  if (idx2 !== -1) copy[idx2] = g.original;
                                  return copy;
                                });
                              }

                              // HR Handbook undo handling
                              if (c.collection_type === "HRHandBook") {
                                if (c.type === "insert") setHrHandbook(null);
                                else if (c.type === "update") setHrHandbook(c.prevItem || null);
                                else if (c.type === "delete") setHrHandbook(c.prevItem || null);
                              }
                            }}
                          >
                            <X />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-400">No changes found.</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className={`px-4 py-2 rounded bg-gray-400 text-white ${reqLoading ? "cursor-not-allowed" : ""}`}
                disabled={reqLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleRequest}
                className={`px-4 py-2 rounded bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt ${reqLoading ? "cursor-progress" : "hover:bg-[#800000]"}`}
                disabled={reqLoading}
              >
                {reqLoading ? "Processing..." : "Final Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminHandbook;