import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Banner from "../../Banner";
import { Eye, Pencil, X } from "lucide-react";
import "./AbtYr.css";
import axios from "axios";
import AisheSideNav from "./aishe_nav";
import { useAdminRequest } from "../../../hooks/useAdminRequest"; // ✅ adjust path if needed
import { toast, ToastContainer } from "react-toastify";

const FALLBACK_DEFAULT_BTNS = [
  "Certificate",
  "Data Capture Format",
  "Teaching Staff Details",
];

// Deep clone that preserves File objects
const deepClone = (value) => {
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(value);
    } catch {
      // fall through
    }
  }

  const seen = new WeakMap();
  const cloneRec = (v) => {
    if (v === null || typeof v !== "object") return v;
    if (v instanceof File) return v;
    if (v instanceof Date) return new Date(v.getTime());
    if (v instanceof Blob) return v;

    if (seen.has(v)) return seen.get(v);

    if (Array.isArray(v)) {
      const arr = [];
      seen.set(v, arr);
      v.forEach((item, i) => (arr[i] = cloneRec(item)));
      return arr;
    }

    const obj = {};
    seen.set(v, obj);
    Object.keys(v).forEach((k) => {
      obj[k] = cloneRec(v[k]);
    });
    return obj;
  };

  return cloneRec(value);
};

const AdminAishe = ({ toggle, theme }) => {
  const navigate = useNavigate();
  const { sendRequest, loading: requestLoading } = useAdminRequest();

  const [section, setAbtyear] = useState("2021-2022");
  const [aboutYearData, setAboutYearData] = useState([]);
  const [editMode, setEditMode] = useState(false);

  // Year add/delete
  const [showYearModal, setShowYearModal] = useState(false);
  const [newYear, setNewYear] = useState("");
  const [showYearDeleteConfirm, setShowYearDeleteConfirm] = useState(false);
  const [yearToDelete, setYearToDelete] = useState(null);

  // PDFs
  const [pdfModal, setPdfModal] = useState({
    open: false,
    yearIdx: null,
    index: null,
    name: "",
    file: null,
    error: "",
    initialIdentity: "empty",
  });
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [pdfModalChanged, setPdfModalChanged] = useState(false);

  const [selectedPdfNames, setSelectedPdfNames] = useState([]); // Use names instead of indices
  const [showPdfDeleteConfirm, setShowPdfDeleteConfirm] = useState(false);

  // Change tracking
  const [changed, setChanged] = useState(false);
  const [savedChanges, setSavedChanges] = useState(false);

  // Snapshots
  const [originalSnapshot, setOriginalSnapshot] = useState(null);
  const [editSessionSnapshot, setEditSessionSnapshot] = useState(null);
  const [postSaveSnapshot, setPostSaveSnapshot] = useState(null);

  // Baseline snapshot
  const [pendingBaselineSnapshot, setPendingBaselineSnapshot] = useState(null);

  // Confirm popups
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Request modal
  const [confirmpopup, setConfirmPopup] = useState(false);

  // Default buttons
  const [defaultButtons, setDefaultButtons] = useState([]);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    if (!path || typeof path !== "string") return "";
    if (path.startsWith("http")) return path;
    if (path.startsWith("blob:")) return path;
    return `${BASE_URL}${path}`;
  };

  const getDefaultBtns = () =>
    defaultButtons.length ? defaultButtons : FALLBACK_DEFAULT_BTNS;

  // Identity helpers
  const fileIdentity = (file) => {
    if (!(file instanceof File)) return "";
    return `file:${file.name}|${file.size}|${file.type}|${file.lastModified}`;
  };

  const entryPdfIdentity = (entry) => {
    if (!entry) return "empty";
    if (entry.file instanceof File) return fileIdentity(entry.file);
    if (entry.pdf_path) return `path:${entry.pdf_path}`;
    return "empty";
  };

  const normalizeYearData = (data) => {
    const arr = Array.isArray(data) ? data : [];
    return arr.map((y) => ({
      ...y,
      category: y?.category || "",
      content: Array.isArray(y?.content)
        ? y.content.map((c) => ({
            ...c,
            name: c?.name || "",
            pdf_path: c?.pdf_path || "",
            file: c?.file || null,
          }))
        : [],
    }));
  };

  // ✅ Reset page to original mode (used after undo-all)
  const resetToOriginalMode = () => {
    const restored = originalSnapshot ? deepClone(originalSnapshot) : [];
    setAboutYearData(restored);
    setAbtyear(restored.length ? restored[0]?.category || "" : "");

    setEditMode(false);
    setChanged(false);
    setSavedChanges(false);
    setSelectedPdfNames([]);
    setEditSessionSnapshot(null);
    setPostSaveSnapshot(null);
    setPendingBaselineSnapshot(null);
    setConfirmPopup(false);
  };

  // --------------------- Build request payload + files ---------------------
  const buildAisheRequestPayload = (baseline, current) => {
    const baseArr = Array.isArray(baseline) ? baseline : [];
    const currArr = Array.isArray(current) ? current : [];

    const baseMap = new Map(baseArr.map((y) => [y.category, y]));
    const currMap = new Map(currArr.map((y) => [y.category, y]));

    const docs = [];
    const files = [];

    const buildNameToEntry = (yearObj) => {
      const map = new Map();
      (Array.isArray(yearObj?.content) ? yearObj.content : []).forEach((c) => {
        const k = (c?.name || "").trim();
        if (!k) return;
        map.set(k, c);
      });
      return map;
    };

    // Year inserts - send all default buttons together
    currArr.forEach((y) => {
      if (!y?.category) return;
      if (baseMap.has(y.category)) return;

      // New year inserted - collect all buttons with their states
      const btns = getDefaultBtns();
      const allButtonsData = [];
      const yearContent = Array.isArray(y.content) ? y.content : [];

      btns.forEach((btnName) => {
        const entry = yearContent.find((c) => c.name === btnName);
        const hasPdf = entryPdfIdentity(entry) !== "empty";

        if (!hasPdf) {
          allButtonsData.push({ name: btnName, pdf_path: "" });
        } else {
          const isFile = entry?.file instanceof File;
          const pdf_path = isFile
            ? `uploads/${y.category}/${entry?.file.name}`
            : entry?.pdf_path || "";

          allButtonsData.push({ name: btnName, pdf_path });
          if (isFile) files.push(entry.file);
        }
      });

      docs.push({
        collectionName: "about_us",
        collection_type: "AISHE",
        action: "insert",
        title: `Insert Year ${y.category}`,
        category: y.category,
        meta_data: {
          category: y.category,
          content: allButtonsData,
        },
      });
    });

    // Year deletes
    baseArr.forEach((y) => {
      if (!y?.category) return;
      if (currMap.has(y.category)) return;

      docs.push({
        collectionName: "about_us",
        collection_type: "AISHE",
        action: "delete",
        title: `Delete AISHE Year ${y.category}`,
        category: y.category,
        meta_data: {
          category: y.category,
          content: (Array.isArray(y.content) ? y.content : []).map((c) => ({
            name: c?.name || "",
            pdf_path: c?.pdf_path || "",
          })),
        },
      });
    });

    // Per-year diffs
    currArr.forEach((y) => {
      if (!y?.category) return;
      const oldY = baseMap.get(y.category);
      if (!oldY) return;

      const oldEntries = buildNameToEntry(oldY);
      const newEntries = buildNameToEntry(y);
      const names = new Set([...oldEntries.keys(), ...newEntries.keys()]);

      names.forEach((name) => {
        const oldEntry = oldEntries.get(name) || null;
        const newEntry = newEntries.get(name) || null;

        const oldId = entryPdfIdentity(oldEntry);
        const newId = entryPdfIdentity(newEntry);

        if (oldId === "empty" && newId !== "empty") {
          const isFile = newEntry?.file instanceof File;

          const pdf_path = isFile
            ? `uploads/${y.category}/${newEntry.file.name}`
            : newEntry?.pdf_path || "";

          docs.push({
            collectionName: "about_us",
            collection_type: "AISHE",
            action: "insert",
            title: `Insert AISHE ${name} ${y.category}`,
            category: y.category,
            meta_data: {
              name,
              pdf_path,
            },
          });

          if (isFile) files.push(newEntry.file);

          return;
        }

        if (oldId !== "empty" && newId === "empty") {
          docs.push({
            collectionName: "about_us",
            collection_type: "AISHE",
            action: "delete",
            title: `Delete AISHE ${name} ${y.category}`,
            category: y.category,
            meta_data: { name, pdf_path: oldEntry?.pdf_path || "" },
          });
          return;
        }

        if (oldId !== "empty" && newId !== "empty" && oldId !== newId) {
          const isFile = newEntry?.file instanceof File;
          const new_pdf_path = isFile
            ? `uploads/${y.category}/${newEntry?.file.name}`
            : newEntry?.pdf_path || "";

          docs.push({
            collectionName: "about_us",
            collection_type: "AISHE",
            action: "update",
            title: `Update AISHE ${name} ${y.category}`,
            category: y.category,
            meta_data: { name, pdf_path: new_pdf_path },
            original_data: { name, pdf_path: oldEntry?.pdf_path || "" },
          });

          if (isFile) files.push(newEntry.file);
        }
      });
    });

    return { docs, files };
  };

  // --------------------- Fetch AISHE data ---------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("/api/main-backend/about_us", {
          type: "AISHE",
        });

        const normalized = normalizeYearData(response.data?.data || []);
        setAboutYearData(normalized);
        setOriginalSnapshot(deepClone(normalized));

        setEditMode(false);
        setChanged(false);
        setSavedChanges(false);
        setSelectedPdfNames([]);
        setEditSessionSnapshot(null);
        setPostSaveSnapshot(null);
        setPendingBaselineSnapshot(null);
        setConfirmPopup(false);

        if (normalized.length > 0) {
          setAbtyear((prev) =>
            normalized.some((x) => x.category === prev)
              ? prev
              : normalized[0].category,
          );
        } else setAbtyear("");
      } catch (error) {
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
        }
      }
    };

    fetchData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [navigate]);

  useEffect(() => {
    document.body.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    document.documentElement.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  // Fetch default buttons
  useEffect(() => {
    const fetchDefaultButtons = async () => {
      try {
        const response = await axios.get(
          "/api/main-backend/aishe_default_buttons",
        );
        setDefaultButtons(response.data?.buttons || []);
      } catch {
        setDefaultButtons(FALLBACK_DEFAULT_BTNS);
      }
    };
    fetchDefaultButtons();
  }, []);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl);
    };
  }, [previewPdfUrl]);

  // ----------------------- getAisheRequestRows (diff rows) -----------------------
  const getAisheRequestRows = () => {
    const baseline = Array.isArray(pendingBaselineSnapshot)
      ? pendingBaselineSnapshot
      : Array.isArray(originalSnapshot)
        ? originalSnapshot
        : [];

    const current = Array.isArray(postSaveSnapshot)
      ? postSaveSnapshot
      : Array.isArray(aboutYearData)
        ? aboutYearData
        : [];

    const baseMap = new Map(baseline.map((y) => [y.category, y]));
    const currMap = new Map(current.map((y) => [y.category, y]));
    const rows = [];

    const buildNameToEntry = (yearObj) => {
      const map = new Map();
      (Array.isArray(yearObj?.content) ? yearObj.content : []).forEach((c) => {
        const k = (c?.name || "").trim();
        if (!k) return;
        map.set(k, c);
      });
      return map;
    };

    // Year inserted
    current.forEach((y) => {
      if (!y?.category) return;
      if (!baseMap.has(y.category)) {
        rows.push({
          key: `year-insert:${y.category}`,
          action: "insert",
          category: "Year",
          year: y.category,
          name: "",
          originalYear: null,
          originalEntry: null,
        });
      }
    });

    // Year deleted
    baseline.forEach((y) => {
      if (!y?.category) return;
      if (!currMap.has(y.category)) {
        rows.push({
          key: `year-delete:${y.category}`,
          action: "delete",
          category: "Year",
          year: y.category,
          name: "",
          originalYear: deepClone(y),
          originalEntry: null,
        });
      }
    });

    // PDFs changed
    current.forEach((y) => {
      if (!y?.category) return;

      const oldY = baseMap.get(y.category);
      if (!oldY) return;

      const oldEntries = buildNameToEntry(oldY);
      const newEntries = buildNameToEntry(y);
      const names = new Set([...oldEntries.keys(), ...newEntries.keys()]);

      names.forEach((name) => {
        const oldEntry = oldEntries.get(name) || null;
        const newEntry = newEntries.get(name) || null;

        const oldId = entryPdfIdentity(oldEntry);
        const newId = entryPdfIdentity(newEntry);

        if (oldId === "empty" && newId !== "empty") {
          rows.push({
            key: `pdf-insert:${y.category}:${name}`,
            action: "insert",
            category: "PDF",
            year: y.category,
            name,
            originalEntry: null,
            currentEntry: deepClone(newEntry),
          });
        } else if (oldId !== "empty" && newId === "empty") {
          rows.push({
            key: `pdf-delete:${y.category}:${name}`,
            action: "delete",
            category: "PDF",
            year: y.category,
            name,
            originalEntry: deepClone(oldEntry),
          });
        } else if (oldId !== "empty" && newId !== "empty" && oldId !== newId) {
          rows.push({
            key: `pdf-update:${y.category}:${name}`,
            action: "update",
            category: "PDF",
            year: y.category,
            name,
            originalEntry: deepClone(oldEntry),
            currentEntry: deepClone(newEntry),
          });
        }
      });
    });

    return rows;
  };

  // ✅ derived boolean: "do we currently have any pending changes?"
  const hasPendingChanges = useMemo(() => {
    // compute rows once per render; avoid multiple calls in JSX
    return getAisheRequestRows().length > 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    aboutYearData,
    postSaveSnapshot,
    pendingBaselineSnapshot,
    originalSnapshot,
    defaultButtons,
  ]);

  // ✅ If user undone all changes (diff becomes empty), auto-hide Request/Discard + go original
  useEffect(() => {
    // Only auto-reset when user is in "savedChanges" state (request/discard UI area)
    if (!savedChanges) return;

    if (!hasPendingChanges) {
      resetToOriginalMode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedChanges, hasPendingChanges]);

  // --------- FLOW ---------
  const handleEditClick = () => {
    setEditSessionSnapshot(deepClone(aboutYearData));
    setEditMode(true);
    setChanged(false);
    setSelectedPdfNames([]);
  };

  const handleCancel = () => {
    if (changed) setShowCancelConfirm(true);
    else {
      setEditMode(false);
      setSelectedPdfNames([]);
      setChanged(false);
    }
  };

  const confirmCancel = () => {
    if (postSaveSnapshot) {
      setAboutYearData(deepClone(postSaveSnapshot));
      setSavedChanges(true);
    } else if (editSessionSnapshot) {
      setAboutYearData(deepClone(editSessionSnapshot));
      setSavedChanges(false);
    } else if (originalSnapshot) {
      setAboutYearData(deepClone(originalSnapshot));
      setSavedChanges(false);
    }

    setChanged(false);
    setEditMode(false);
    setSelectedPdfNames([]);
    setShowCancelConfirm(false);
  };

  const handleSave = () => {
    if (!pendingBaselineSnapshot) {
      setPendingBaselineSnapshot(deepClone(originalSnapshot || []));
    }

    setPostSaveSnapshot(deepClone(aboutYearData));
    setSavedChanges(true);
    setChanged(false);
    setEditMode(false);
    setSelectedPdfNames([]);
  };

  const handleDiscardAll = () => setShowDiscardConfirm(true);
  const confirmDiscardAll = () => resetToOriginalMode();

  const handleRequest = () => setConfirmPopup(true);

  // --------- Year add/delete ---------
  const openYearModal = () => setShowYearModal(true);
  const closeYearModal = () => {
    setShowYearModal(false);
    setNewYear("");
  };

  const confirmAddYear = () => {
    const year = newYear.trim();
    if (!year) return;

    const btns = getDefaultBtns();

    setAboutYearData((prev) => [
      ...prev,
      {
        category: year,
        content: btns.map((btn) => ({ name: btn, pdf_path: "", file: null })),
      },
    ]);

    setChanged(true);
    setSavedChanges(false);
    setShowYearModal(false);
    setNewYear("");
    setAbtyear(year);
    setSelectedPdfNames([]);
  };

  const openYearDeleteConfirm = (year) => {
    setYearToDelete(year);
    setShowYearDeleteConfirm(true);
  };

  const confirmYearDelete = () => {
    const idx = aboutYearData.findIndex(
      (item) => item.category === yearToDelete,
    );
    const filtered = aboutYearData.filter(
      (item) => item.category !== yearToDelete,
    );

    setAboutYearData(filtered);
    setChanged(true);
    setSavedChanges(false);
    setShowYearDeleteConfirm(false);
    setYearToDelete(null);

    if (filtered.length > 0) {
      const nextIdx = idx < filtered.length ? idx : filtered.length - 1;
      setAbtyear(filtered[nextIdx]?.category || "");
    } else setAbtyear("");
  };

  // --------- PDF open/preview ---------
  const openPdfFromEntry = (entry) => {
    if (!entry) return;

    if (entry.file instanceof File) {
      const blobUrl = URL.createObjectURL(entry.file);
      window.open(blobUrl, "_blank");
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      return;
    }

    if (entry.pdf_path) window.open(UrlParser(entry.pdf_path), "_blank");
  };

  const getEntryForModal = () => {
    if (!pdfModal.open) return null;
    const { yearIdx, index, name } = pdfModal;
    if (yearIdx == null) return null;

    const y = aboutYearData?.[yearIdx];
    if (!y?.content) return null;

    if (index === null) return y.content.find((c) => c.name === name) || null;
    return y.content[index] || null;
  };

  const openPdfModal = (yearIdx, pdfIdx = null, name = "") => {
    if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl);
    setPreviewPdfUrl(null);
    setPdfModalChanged(false);

    const y = aboutYearData?.[yearIdx];
    const entry =
      pdfIdx === null
        ? y?.content?.find((c) => c.name === name) || null
        : y?.content?.[pdfIdx] || null;

    setPdfModal({
      open: true,
      yearIdx,
      index: pdfIdx,
      name: pdfIdx === null ? name : entry?.name || "",
      file: null,
      error: "",
      initialIdentity: entryPdfIdentity(entry),
    });
  };

  const closePdfModal = () => {
    setPdfModal({
      open: false,
      yearIdx: null,
      index: null,
      name: "",
      file: null,
      error: "",
      initialIdentity: "empty",
    });
    setPdfModalChanged(false);

    if (previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl);
      setPreviewPdfUrl(null);
    }
  };

  const onPdfFileSelected = (file) => {
    setPdfModal((prev) => ({ ...prev, file, error: "" }));
    setPdfModalChanged(!!file);

    if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl);
    setPreviewPdfUrl(file ? URL.createObjectURL(file) : null);
  };

  const savePdfModal = () => {
    const { yearIdx, index, name, file } = pdfModal;

    if (!name) {
      setPdfModal((s) => ({ ...s, error: "Please enter a PDF name." }));
      return;
    }

    if (!(file instanceof File)) {
      setPdfModal((s) => ({
        ...s,
        error: "Please upload/replace a PDF file to save.",
      }));
      return;
    }

    const newData = deepClone(aboutYearData);
    const y = newData[yearIdx];
    if (!y?.content) y.content = [];

    if (index === null) {
      const btnIdx = y.content.findIndex((c) => c.name === name);
      if (btnIdx !== -1) y.content[btnIdx].file = file;
    } else {
      const old = y.content[index] || {};
      y.content[index] = { ...old, file, pdf_path: old.pdf_path || "" };
    }

    setAboutYearData(newData);
    setChanged(true);
    setSavedChanges(false);
    closePdfModal();
  };

  // --------- selection delete ---------
  const toggleSelectPdf = (pdfName) => {
    setSelectedPdfNames((prev) =>
      prev.includes(pdfName)
        ? prev.filter((n) => n !== pdfName)
        : [...prev, pdfName],
    );
  };

  const openPdfDeleteConfirm = () => setShowPdfDeleteConfirm(true);

  const confirmPdfDelete = () => {
    const yearIdx = aboutYearData.findIndex(
      (item) => item.category === section,
    );
    if (yearIdx === -1) return;

    const btns = getDefaultBtns();
    const newData = deepClone(aboutYearData);
    const y = newData[yearIdx];
    if (!y?.content) y.content = [];

    const isDefaultFormat =
      y.content.length === btns.length &&
      y.content.every((c) => btns.includes(c.name));

    if (isDefaultFormat) {
      // For default format: clear pdf_path and file instead of removing
      y.content = y.content.map((c) => {
        if (!selectedPdfNames.includes(c.name)) return c;
        return { ...c, pdf_path: "", file: null };
      });
    } else {
      // For custom format: filter by name instead of index
      y.content = y.content.filter((c) => !selectedPdfNames.includes(c.name));
    }

    setAboutYearData(newData);
    setSelectedPdfNames([]);
    setChanged(true);
    setSavedChanges(false);
    setShowPdfDeleteConfirm(false);
  };

  // --------- Undo helpers ---------
  const restoreEntryInYear = (yearObj, name, restoredEntryOrNull, mode) => {
    const btns = getDefaultBtns();
    const isDefaultFormat =
      Array.isArray(yearObj?.content) &&
      yearObj.content.length === btns.length &&
      yearObj.content.every((item) => item?.name && btns.includes(item.name));

    if (!Array.isArray(yearObj.content)) yearObj.content = [];

    const idx = yearObj.content.findIndex(
      (c) => (c?.name || "").trim() === (name || "").trim(),
    );

    if (isDefaultFormat) {
      if (idx === -1) return;
      if (mode === "empty") {
        yearObj.content[idx] = {
          ...yearObj.content[idx],
          pdf_path: "",
          file: null,
        };
      } else if (mode === "restore") {
        yearObj.content[idx] = {
          ...yearObj.content[idx],
          pdf_path: restoredEntryOrNull?.pdf_path || "",
          file: restoredEntryOrNull?.file || null,
        };
      }
      return;
    }

    // custom format
    if (mode === "empty") {
      if (idx !== -1) yearObj.content.splice(idx, 1);
      return;
    }

    if (mode === "restore") {
      if (idx === -1) {
        yearObj.content.push({
          name,
          pdf_path: restoredEntryOrNull?.pdf_path || "",
          file: restoredEntryOrNull?.file || null,
        });
      } else {
        yearObj.content[idx] = {
          ...yearObj.content[idx],
          pdf_path: restoredEntryOrNull?.pdf_path || "",
          file: restoredEntryOrNull?.file || null,
        };
      }
    }
  };

  const undoRequestRow = (row) => {
    const baseline = Array.isArray(pendingBaselineSnapshot)
      ? pendingBaselineSnapshot
      : Array.isArray(originalSnapshot)
        ? originalSnapshot
        : [];

    const current = deepClone(
      Array.isArray(postSaveSnapshot) ? postSaveSnapshot : aboutYearData,
    );

    const findYearIndex = (arr, year) =>
      arr.findIndex((y) => y?.category === year);

    const sortByBaselineOrder = (arr) => {
      const order = new Map(baseline.map((y, idx) => [y.category, idx]));
      return arr
        .slice()
        .sort(
          (a, b) =>
            (order.get(a.category) ?? 99999) - (order.get(b.category) ?? 99999),
        );
    };

    if (row.category === "Year" && row.action === "insert") {
      const next = current.filter((y) => y?.category !== row.year);
      setAboutYearData(next);
      setPostSaveSnapshot(deepClone(next));
      if (section === row.year) {
        setAbtyear(next.length ? next[0]?.category || "" : "");
      }
      return;
    }

    if (
      row.category === "Year" &&
      row.action === "delete" &&
      row.originalYear
    ) {
      const exists = current.some((y) => y?.category === row.year);
      let next = exists ? current : [...current, deepClone(row.originalYear)];
      next = sortByBaselineOrder(next);
      setAboutYearData(next);
      setPostSaveSnapshot(deepClone(next));
      return;
    }

    if (row.category === "PDF" && row.action === "insert") {
      const yIdx = findYearIndex(current, row.year);
      if (yIdx !== -1) {
        restoreEntryInYear(current[yIdx], row.name, null, "empty");
      }
      setAboutYearData(current);
      setPostSaveSnapshot(deepClone(current));
      return;
    }

    if (
      row.category === "PDF" &&
      row.action === "delete" &&
      row.originalEntry
    ) {
      const yIdx = findYearIndex(current, row.year);
      if (yIdx !== -1) {
        restoreEntryInYear(
          current[yIdx],
          row.name,
          row.originalEntry,
          "restore",
        );
      }
      setAboutYearData(current);
      setPostSaveSnapshot(deepClone(current));
      return;
    }

    if (
      row.category === "PDF" &&
      row.action === "update" &&
      row.originalEntry
    ) {
      const yIdx = findYearIndex(current, row.year);
      if (yIdx !== -1) {
        restoreEntryInYear(
          current[yIdx],
          row.name,
          row.originalEntry,
          "restore",
        );
      }
      setAboutYearData(current);
      setPostSaveSnapshot(deepClone(current));
    }
  };

  // ✅ Request send
  const handleConfirmRequest = async () => {
    try {
      const baseline = pendingBaselineSnapshot || originalSnapshot || [];
      const current = postSaveSnapshot || aboutYearData || [];

      const { docs, files } = buildAisheRequestPayload(baseline, current);

      console.log(docs, files);

      if (!docs.length) {
        setConfirmPopup(false);
        return;
      }

      const ok = await sendRequest(docs, files);
      if (!ok) return;

      setConfirmPopup(false);

      setSavedChanges(false);
      setChanged(false);
      setEditMode(false);
      setPostSaveSnapshot(null);
      setEditSessionSnapshot(null);
      setPendingBaselineSnapshot(null);
    } catch (e) {
      console.error(e);
    }
  };

  // --------- render ---------
  const renderYearContent = (selectedYear) => {
    const yearIdx = aboutYearData.findIndex(
      (item) => item.category === selectedYear,
    );
    const yearData = aboutYearData[yearIdx];

    if (!yearData)
      return (
        <p style={{ textAlign: "center" }}>
          No data available for {selectedYear}
        </p>
      );

    const btns = getDefaultBtns();
    const isDefaultFormat =
      Array.isArray(yearData.content) &&
      yearData.content.length === btns.length &&
      yearData.content.every((item) => item?.name && btns.includes(item.name));

    const actionButtons = (
      <div className="w-full">
        {editMode && selectedPdfNames.length > 0 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={openPdfDeleteConfirm}
              className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded flex items-center gap-2 shadow-lg"
            >
              Delete Selected
            </button>
          </div>
        )}

        {editMode && (
          <div className="flex justify-end gap-4 p-2 mr-9 mt-20">
            <button
              onClick={handleCancel}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded flex items-center gap-2 shadow-lg"
            >
              Cancel
            </button>

            {changed && (
              <button
                onClick={handleSave}
                className="bg-secd hover:bg-yellow-500 text-black px-4 py-2 rounded flex items-center gap-2 shadow-lg"
              >
                Save
              </button>
            )}
          </div>
        )}

        {/* ✅ This is the ONLY place Request/Discard buttons appear */}
        {!editMode && savedChanges && hasPendingChanges && (
          <div className="flex justify-end gap-4 pt-4 pb-8 mr-10">
            <button
              onClick={handleDiscardAll}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded flex items-center gap-2 shadow-lg"
              disabled={requestLoading}
            >
              Discard All Changes
            </button>

            <button
              onClick={handleRequest}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded flex items-center gap-2 shadow-lg"
              disabled={requestLoading}
            >
              Request
            </button>
          </div>
        )}
      </div>
    );

    if (isDefaultFormat) {
      return (
        <div className="mt:[15px] py-[10px] min-h-[400px]">
          <div style={{ textAlign: "center" }}>
            <h1 className="yr-title mt-[30px] font-[poppins]">
              {yearData.category}
            </h1>

            <div className="btn-yr text-black flex flex-wrap justify-center gap-2">
              {yearData.content.map((btnEntry, idx) => {
                const hasPdf = entryPdfIdentity(btnEntry) !== "empty";
                const isSelected = selectedPdfNames.includes(btnEntry.name);

                return (
                  <div
                    key={btnEntry.name}
                    className="relative flex items-center"
                  >
                    {editMode && (
                      <input
                        type="checkbox"
                        checked={selectedPdfNames.includes(btnEntry.name)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelectPdf(btnEntry.name);
                        }}
                        className="custom-checkbox w-3 h-3 absolute top-1 right-1 z-10"
                        style={{ position: "absolute" }}
                      />
                    )}

                    <button
                      className="button-yr font-[poppins] relative overflow-visible text-md"
                      style={{
                        minWidth: editMode ? "180px" : "150px",
                        minHeight: editMode ? "52px" : "42px",
                        fontSize: editMode ? "1.08rem" : "1rem",
                        padding: editMode ? "12px 18px" : "8px 12px",
                        position: "relative",
                        backgroundColor: editMode
                          ? hasPdf
                            ? "#fdc200"
                            : "#fff3cd"
                          : "",
                        color: editMode ? (hasPdf ? "#222" : "#aaa") : "",
                        border:
                          editMode && !hasPdf ? "1px solid #ffe066" : undefined,
                        opacity: editMode && !hasPdf ? 0.7 : 1,
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        if (editMode) openPdfModal(yearIdx, idx, btnEntry.name);
                        else if (hasPdf) openPdfFromEntry(btnEntry);
                      }}
                      disabled={!editMode && !hasPdf}
                    >
                      {btnEntry.name}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {actionButtons}
        </div>
      );
    }

    return (
      <div className="mt:[15px] py-[10px] min-h-[400px]">
        <div style={{ textAlign: "center" }}>
          <h1 className="yr-title mt-[30px] font-[poppins]">
            {yearData.category}
          </h1>

          <div className="btn-yr text-black flex flex-wrap justify-center gap-2">
            {yearData.content.map((entry, index) => (
              <div
                key={`${entry.name}-${index}`}
                className="relative flex items-center"
              >
                {editMode && (
                  <input
                    type="checkbox"
                    checked={selectedPdfNames.includes(entry.name)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelectPdf(entry.name);
                    }}
                    className="custom-checkbox w-3 h-3 absolute top-1 right-1 z-10"
                    style={{ position: "absolute" }}
                  />
                )}

                <button
                  className="button-yr font-[poppins] relative overflow-visible text-md"
                  style={{
                    minWidth: editMode ? "180px" : "150px",
                    minHeight: editMode ? "52px" : "42px",
                    fontSize: editMode ? "1.08rem" : "1rem",
                    padding: editMode ? "12px 18px" : "8px 12px",
                    position: "relative",
                  }}
                  onClick={() => {
                    if (editMode) openPdfModal(yearIdx, index);
                    else openPdfFromEntry(entry);
                  }}
                >
                  {entry.name}
                </button>
              </div>
            ))}
          </div>
        </div>

        {actionButtons}
      </div>
    );
  };

  const navData = useMemo(() => {
    return aboutYearData.reduce((acc, item) => {
      if (item?.category) acc[item.category] = renderYearContent(item.category);
      return acc;
    }, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    aboutYearData,
    editMode,
    selectedPdfNames,
    changed,
    savedChanges,
    defaultButtons,
    hasPendingChanges,
  ]);

  const sideNavExtra = (
    <div className="flex gap-2 items-center absolute top-4 right-10 z-20">
      {!editMode && (
        <button
          onClick={handleEditClick}
          className="p-2 bg-secd hover:bg-yellow-500 font-semibold text-black rounded flex items-center gap-2 flex items-center"
        >
          <Pencil size={16} />
          Edit
        </button>
      )}
    </div>
  );

  return (
    <>
      <Banner
        theme={theme}
        toggle={toggle}
        backgroundImage="./Banners/aboutvec.webp"
        headerText="AISHE"
        subHeaderText="A center for academic excellence and innovation, nurturing minds to create a brighter future through education and empowerment."
      />
      <ToastContainer position="bottom-right" autoClose={3000} />

      <div className="relative">
        <AisheSideNav
          navData={navData}
          sts={section}
          setSts={setAbtyear}
          backButton={true}
          sidNavEdit={editMode}
          openModel={openYearModal}
          onDeleteYear={openYearDeleteConfirm}
        />
        {sideNavExtra}
      </div>

      {/* Year Modal */}
      {showYearModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96 flex flex-col items-center">
            <h2 className="text-lg font-bold mb-4">Add New Year</h2>
            <input
              type="text"
              placeholder="Year (e.g. 2025-2026)"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              className="w-full border p-2 mb-4 rounded"
            />
            <div className="flex justify-end gap-3 w-full">
              <button
                onClick={closeYearModal}
                className="px-3 py-1 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddYear}
                className="px-3 py-1 bg-secd text-black rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Year Delete Confirm */}
      {showYearDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96 text-center">
            <h2 className="text-lg text-brwn font-bold mb-4">Delete Year</h2>
            <p>Are you sure you want to delete the year {yearToDelete}?</p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setShowYearDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmYearDelete}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Modal */}
      {pdfModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96 flex flex-col items-center">
            <h2 className="text-lg font-bold mb-4">
              {pdfModal.initialIdentity !== "empty"
                ? "Replace PDF"
                : "Upload PDF"}
            </h2>

            <input
              type="text"
              placeholder="Name"
              value={pdfModal.name}
              onChange={(e) =>
                setPdfModal((s) => ({ ...s, name: e.target.value }))
              }
              className="w-full border p-2 mb-4 rounded"
              readOnly={pdfModal.name !== ""}
            />

            <div className="flex items-center mb-4 gap-2">
              <label className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded cursor-pointer mb-0 flex-grow flex items-center">
                {pdfModal.initialIdentity !== "empty"
                  ? "Replace PDF"
                  : "Upload PDF"}
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) =>
                    onPdfFileSelected(e.target.files?.[0] || null)
                  }
                />
              </label>

              {(previewPdfUrl ||
                getEntryForModal()?.file ||
                getEntryForModal()?.pdf_path) && (
                <button
                  className="ml-2 px-2 py-2 rounded text-blue-400 flex items-center"
                  onClick={() => {
                    if (previewPdfUrl) window.open(previewPdfUrl, "_blank");
                    else openPdfFromEntry(getEntryForModal());
                  }}
                  type="button"
                  title="Preview PDF"
                >
                  <Eye size={19} />
                </button>
              )}
            </div>

            {pdfModal.error && (
              <p className="text-red-600 text-sm mb-2">{pdfModal.error}</p>
            )}

            <div className="flex justify-end gap-3 w-full">
              <button
                onClick={closePdfModal}
                className="px-3 py-1 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>

              {pdfModalChanged && (
                <button
                  onClick={savePdfModal}
                  className="px-3 py-1 bg-secd text-black rounded"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PDF Delete Confirm */}
      {showPdfDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96 text-center">
            <h2 className="text-lg text-brwn font-bold mb-4">Delete PDFs</h2>
            <p>
              Are you sure you want to delete {selectedPdfNames.length} selected
              PDF(s)?
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setShowPdfDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmPdfDelete}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel confirm */}
      {showCancelConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96 text-center">
            <h2 className="text-lg text-orange-600 font-bold mb-4">
              Confirm Cancel
            </h2>
            <p className="mb-6">
              Are you sure you want to cancel? All unsaved changes will be lost.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Continue Editing
              </button>
              <button
                onClick={confirmCancel}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discard all changes confirm */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96 text-center">
            <h2 className="text-lg text-brwn font-bold mb-4">
              Confirm Discard All Changes
            </h2>
            <p className="mb-6">
              Are you sure you want to discard all saved changes? This will
              revert everything to the original state.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDiscardConfirm(false)}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded"
              >
                No
              </button>
              <button
                onClick={() => {
                  setShowDiscardConfirm(false);
                  confirmDiscardAll();
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Yes, Discard all
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Confirm request modal */}
      {confirmpopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[450px]">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Final Request for the Changes
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the
              superior admin. Once approved, they will be applied automatically
              to the live site.
            </p>

            <div className="max-h-[200px] overflow-y-auto mb-4">
              {getAisheRequestRows().length > 0 ? (
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
                    {getAisheRequestRows().map((r, i) => (
                      <tr key={r.key || i}>
                        <td className="py-1">
                          {r.action === "insert" && (
                            <span className="text-green-600">+ Added</span>
                          )}
                          {r.action === "update" && (
                            <span className="text-blue-600">✎ Edited</span>
                          )}
                          {r.action === "delete" && (
                            <span className="text-red-600">– Deleted</span>
                          )}
                        </td>

                        <td className="py-1">{r.category}</td>

                        <td className="py-1">
                          {r.category === "Year" ? (
                            <span className="text-[12px]">{r.year}</span>
                          ) : (
                            <span className="text-[12px]">
                              {r.year} → {r.name}
                            </span>
                          )}
                        </td>

                        <td className="py-1">
                          <button
                            type="button"
                            onClick={() => undoRequestRow(r)}
                            disabled={requestLoading}
                            title="Undo change"
                            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-60"
                          >
                            <X size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-400">No AISHE changes found.</p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmPopup(false)}
                className={`px-4 py-2 rounded bg-gray-400 text-white ${
                  requestLoading ? "cursor-not-allowed" : ""
                }`}
                disabled={requestLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRequest}
                className={`px-4 py-2 rounded bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt ${
                  requestLoading ? "cursor-progress" : "hover:bg-[#800000]"
                }`}
                disabled={requestLoading}
              >
                {requestLoading ? "Processing..." : "Final Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminAishe;
