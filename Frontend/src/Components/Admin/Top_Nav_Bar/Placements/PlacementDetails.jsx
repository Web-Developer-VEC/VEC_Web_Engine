import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminPlacementDetails.css";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pencil, Send } from "lucide-react";
import { Eye } from "lucide-react";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

const YEAR_RE = /^\d{4}-\d{2}$/;

const isValidYearLabel = (value) => {
  return YEAR_RE.test(String(value).trim());
};

const normalizeYearInput = (value) => {
  return value.replace(/[^\d-]/g, "").slice(0, 10);
};
export const AdminPlacementDetails = ({ theme, toggle }) => {
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfLink, setPdfLink] = useState("");

  const [originalData, setOriginalData] = useState(null);
  const [placementData, setPlacementData] = useState(null);
  const [editedData, setEditedData] = useState(null);
  const [editSnapshot, setEditSnapshot] = useState(null);
  const [pendingData, setPendingData] = useState(null);
  const [yearPdfFiles, setYearPdfFiles] = useState({});

  const [isLoading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [editMode, setEditMode] = useState(false);

  const [selectedTopYearIndexes, setSelectedTopYearIndexes] = useState([]);
  const [selectedCols, setSelectedCols] = useState({
    department_wise: [],
    statistics: [],
  });
  const [selectedRowIndexesBySection, setSelectedRowIndexesBySection] =
    useState({ department_wise: [], statistics: [] });
  const { sendRequest, loading, error } = useAdminRequest();
  const [showYearPopup, setShowYearPopup] = useState(false);
  const [yearPopupIndex, setYearPopupIndex] = useState(null);
  const [yearPopupLabel, setYearPopupLabel] = useState("");
  const [yearPopupFile, setYearPopupFile] = useState(null);
  const [yearPopupPreviewUrl, setYearPopupPreviewUrl] = useState("");

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const BASE_PAYLOAD = {
    collectionName: "placement",
    collection_type: "placement_details",
  };

  /* ------------------------ payload builders (match JSON) ------------------------ */

  const buildInsertPlacementDetailsPayload = (metaData) => ({
    ...BASE_PAYLOAD,
    action: "insert",
    title: "insert details",
    meta_data: metaData,
  });

  const buildUpdateSectionPayload = ({
    section,
    year,
    values,
    original_values,
  }) => ({
    ...BASE_PAYLOAD,
    action: "update",
    title: "update details",
    original_data: {
      section,
      year,
      ...(original_values !== undefined ? { values: original_values } : {}),
    },
    meta_data: {
      section,
      year,
      values,
    },
  });

  const buildUpdatePdfPayload = ({
    year,
    new_year,
    pdf_path,
    original_pdf_path,
  }) => ({
    action: "update",
    collectionName: "placement",
    title: "update details",
    collection_type: "placement_details",

    original_data: {
      section: "year_wise_pdfs",
      year: year,
      pdf_path: original_pdf_path,
    },

    meta_data: {
      section: "year_wise_pdfs",
      year: new_year ?? year,
      pdf_path: pdf_path,
    },
  });

  const buildDeletePayload = ({ section, id, year, values, pdf_path }) => ({
    ...BASE_PAYLOAD,
    action: "delete",
    title: "delete details",
    meta_data: {
      section,
      ...(id !== undefined ? { id } : {}), // ✅ add id
      year,
      ...(values !== undefined ? { values } : {}),
      ...(pdf_path !== undefined ? { pdf_path } : {}),
    },
  });

  const buildInsertYearPdfPayload = ({ year, pdf_path }) => ({
    action: "insert",
    collectionName: "placement",
    title: "insert details",
    collection_type: "placement_details",
    meta_data: {
      section: "year_wise_pdfs",
      year,
      pdf_path,
    },
  });

  /* ------------------------ utils / URL ------------------------ */

  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL || "";
  const UrlParser = (path) => {
    if (!path) return "";
    if (
      path.startsWith("http") ||
      path.startsWith("blob:") ||
      path.startsWith("data:")
    ) {
      return path;
    }
    return `${BASE_URL}${path}`;
  };

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const resp = await axios.post("/api/main-backend/placement", {
          type: "placement_details",
        });

        const data = resp.data?.data || null;

        console.log("pdf item:", placementData?.year_wise_pdfs?.[0]);
        if (!mounted) return;

        setPlacementData(data);
        setOriginalData(deepClone(data));
        // IMPORTANT: don't blindly clear pendingData here unless you really want to wipe pending UI
        // setPendingData(null);
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchData();

    // ✅ refresh when tab becomes active again (helps after admin approval)
    const onFocus = () => fetchData();
    window.addEventListener("focus", onFocus);

    return () => {
      mounted = false;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
  }

  /* --------------------- diff helpers (FIX: insert+delete -> update) --------------------- */

  const arraysEqual = (a, b) => {
    if (a === b) return true;
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  };

  /**
   * FIX:
   * If user edits an existing table "column year label", previous logic interpreted it as:
   *   delete(oldYear) + insert(newYear)
   * But you want:
   *   update (same column index, year label changed and/or values changed)
   *
   * So for department_wise/statistics we match columns by index primarily,
   * and treat changes at same index as UPDATE, not delete+insert.
   *
   * Only when column count changes, we emit inserts/deletes for extra columns.
   */
  // ---- year_wise_pdfs: match by id/year, not index
const computeStructuredChanges = (base, compare) => {
  const changes = [];
const basePdfs = Array.isArray(base.year_wise_pdfs) ? base.year_wise_pdfs : [];
const compPdfs = Array.isArray(compare.year_wise_pdfs) ? compare.year_wise_pdfs : [];

const getPdfKey = (item) => item?.id || item?.year;

const basePdfMap = new Map(basePdfs.map((p) => [getPdfKey(p), p]));
const compPdfMap = new Map(compPdfs.map((p) => [getPdfKey(p), p]));

compPdfs.forEach((p2) => {
  const key = getPdfKey(p2);
  const p1 = basePdfMap.get(key);

  if (!p1) {
    changes.push({
      kind: "year_pdf",
      action: "insert",
      id: p2.id,
      year: p2.year ?? "",
      pdf_path: p2.pdf_path ?? "",
    });
    return;
  }

  if ((p1.year ?? "") !== (p2.year ?? "") || (p1.pdf_path ?? "") !== (p2.pdf_path ?? "")) {
    changes.push({
      kind: "year_pdf",
      action: "update",
      id: p2.id,
      year: p1.year,
      new_year: p2.year,
      pdf_path: p2.pdf_path,
      original_pdf_path: p1.pdf_path,
    });
  }
});

basePdfs.forEach((p1) => {
  const key = getPdfKey(p1);

  if (!compPdfMap.has(key)) {
    changes.push({
      kind: "year_pdf",
      action: "delete",
      id: p1.id,
      year: p1.year ?? "",
      original_pdf_path: p1.pdf_path ?? "",
    });
  }
});
    // ---- sections: department_wise + statistics (match by index to prevent insert+delete on edits)
    // ---- sections: department_wise + statistics
const sections = ["department_wise", "statistics"];

sections.forEach((section) => {
  const bSec = base?.[section];
  const cSec = compare?.[section];
  if (!bSec || !cSec) return;

  const baseYears = Array.isArray(bSec.years) ? bSec.years : [];
  const compYears = Array.isArray(cSec.years) ? cSec.years : [];

  const matchedBaseIndexes = new Set();

  compYears.forEach((y2, compIndex) => {
    const year2 = y2.year ?? "";
    const v2 = Array.isArray(y2.values) ? y2.values : [];

    let baseIndex = baseYears.findIndex(
      (y1, idx) => !matchedBaseIndexes.has(idx) && y1.year === year2
    );

    if (baseIndex === -1 && baseYears[compIndex] && !matchedBaseIndexes.has(compIndex)) {
      baseIndex = compIndex;
    }

    if (baseIndex === -1) {
      changes.push({
        kind: "section_year",
        action: "insert",
        section,
        year: year2,
        values: v2,
      });
      return;
    }

    matchedBaseIndexes.add(baseIndex);

    const y1 = baseYears[baseIndex];
    const year1 = y1.year ?? "";
    const v1 = Array.isArray(y1.values) ? y1.values : [];

    if (year1 !== year2 || JSON.stringify(v1) !== JSON.stringify(v2)) {
      changes.push({
        kind: "section_year",
        action: "update",
        section,
        year: year1,
        new_year: year2,
        values: v2,
        original_values: v1,
      });
    }
  });

  baseYears.forEach((y1, idx) => {
    if (!matchedBaseIndexes.has(idx)) {
      changes.push({
        kind: "section_year",
        action: "delete",
        section,
        year: y1.year ?? "",
        original_values: Array.isArray(y1.values) ? y1.values : [],
      });
    }
  });
});
        

    return changes;
  };

  const getChangesBetweenOriginalAndPending = () => {
    const base = originalData;
    const compare = pendingData || placementData;
    if (!base || !compare) return [];
    return computeStructuredChanges(base, compare);
  };

  const getChanges = () => getChangesBetweenOriginalAndPending();

  /* --------------------- payload generation (FIXED actions) --------------------- */

  const buildPlacementDetailsPayloadsFromChanges = () => {
    const payloads = [];
    const changes = getChanges();

    changes.forEach((c) => {
      // YEAR PDF changes
      if (c.kind === "year_pdf") {
        if (c.action === "insert") {
          payloads.push(
            buildInsertYearPdfPayload({
              id: c.id,
              year: c.year,
              pdf_path: c.pdf_path ?? "",
            }),
          );
        } else if (c.action === "update") {
          payloads.push(
            buildUpdatePdfPayload({
              id: c.id,
              year: c.year,
              new_year: c.new_year,
              pdf_path: c.pdf_path ?? "",
              original_pdf_path: c.original_pdf_path ?? "",
            }),
          );
        } else if (c.action === "delete") {
          payloads.push(
            buildDeletePayload({
              section: "year_wise_pdfs",
              id: c.id,
              year: c.year,
              pdf_path: c.original_pdf_path ?? "",
            }),
          );
        }
        return;
      }

      // Section changes
      if (c.kind === "section_year") {
        if (c.action === "insert") {
          payloads.push(
            buildInsertPlacementDetailsPayload({
              [c.section]: {
                years: [
                  {
                    year: c.year,
                    values: Array.isArray(c.values) ? c.values : [],
                  },
                ],
              },
            }),
          );
          return;
        }

        if (c.action === "delete") {
          payloads.push(
            buildDeletePayload({
              section: c.section,
              year: c.year,
              values: Array.isArray(c.original_values) ? c.original_values : [],
            }),
          );
          return;
        }

        if (c.action === "update") {
          /**
           * IMPORTANT:
           * Your payload JSON examples for update show:
           *   original_data: { section, year, values: [...] }
           *   meta_data: { section, year, values: [...] }
           *
           * But when year label is edited, we must carry "new year" too.
           * In your payload file, there isn't an explicit example of renaming year.
           * The safest way for your backend to locate row is original_data.year
           * and set new meta_data.year (updated year).
           */
          payloads.push({
            ...BASE_PAYLOAD,
            action: "update",
            title: "update details",
            original_data: {
              section: c.section,
              year: c.year, // original year (target)
              values: Array.isArray(c.original_values) ? c.original_values : [],
            },
            meta_data: {
              section: c.section,
              year: c.new_year ?? c.year, // new year (if renamed) else same
              values: Array.isArray(c.values) ? c.values : [],
            },
          });
          return;
        }
      }
    });

    return payloads;
  };

  /* ---------------------- existing UI logic (unchanged) ---------------------- */

  const enterEditMode = () => {
    const src = pendingData ? pendingData : placementData;
    const cloneSrc = deepClone(src);
    setEditedData(cloneSrc);
    setEditSnapshot(deepClone(cloneSrc));
    setSelectedTopYearIndexes([]);
    setSelectedCols({ department_wise: [], statistics: [] });
    setSelectedRowIndexesBySection({ department_wise: [], statistics: [] });
    setEditMode(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditedData(null);
    setEditSnapshot(null);
    setEditMode(false);
    setSelectedTopYearIndexes([]);
    setSelectedCols({ department_wise: [], statistics: [] });
    setSelectedRowIndexesBySection({ department_wise: [], statistics: [] });
  };

  const isDirty = () => {
    if (!editMode) return false;
    if (!editedData && !editSnapshot) return false;
    try {
      return JSON.stringify(editedData) !== JSON.stringify(editSnapshot);
    } catch (e) {
      return true;
    }
  };

  const openYearPopupToEdit = (index) => {
    if (!editedData?.year_wise_pdfs) return;
    const item = editedData.year_wise_pdfs[index] || { year: "", pdf_path: "" };
    setYearPopupIndex(index);
    setYearPopupLabel(item.year || "");
    setYearPopupPreviewUrl(item.pdf_path || "");
    setYearPopupFile(null);
    setShowYearPopup(true);
  };

  const openYearPopupToAdd = () => {
    setYearPopupIndex(null);
    setYearPopupLabel("");
    setYearPopupPreviewUrl("");
    setYearPopupFile(null);
    setShowYearPopup(true);
  };

  const handleYearPopupFileChange = (file) => {
    if (!file) return;

    if (yearPopupPreviewUrl && yearPopupPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(yearPopupPreviewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setYearPopupFile(file);
    setYearPopupPreviewUrl(objectUrl);
  };

  const applyYearPopup = () => {
    if (!yearPopupLabel?.trim()) {
      toast.error("Please enter a Year");
      return;
    }

    setEditedData((prev) => {
      const copy = deepClone(prev) || {
        year_wise_pdfs: [],
        department_wise: { departments: [], years: [] },
        statistics: { particulars: [], years: [] },
      };

      copy.year_wise_pdfs ||= [];

      const id =
        yearPopupIndex !== null && copy.year_wise_pdfs[yearPopupIndex]?.id
          ? copy.year_wise_pdfs[yearPopupIndex].id
          : crypto.randomUUID();

      const finalPdfPath = yearPopupFile
        ? `/static/pdfs/placement_docs/${yearPopupFile.name}`
        : copy.year_wise_pdfs[yearPopupIndex]?.pdf_path || "";

      const entry = {
        id,
        year: yearPopupLabel,
        pdf_path: finalPdfPath,
        __file: yearPopupFile || null,
      };

      if (yearPopupIndex === null) {
        copy.year_wise_pdfs.unshift(entry);
      } else {
        copy.year_wise_pdfs[yearPopupIndex] = entry;
      }

      return copy;
    });

    setShowYearPopup(false);
    setYearPopupFile(null);
    setYearPopupPreviewUrl("");
  };

  const collectPlacementDetailPdfFiles = () => {
    if (!pendingData?.year_wise_pdfs) return [];
    return pendingData.year_wise_pdfs
      .filter((y) => y.__file instanceof File)
      .map((y) => y.__file);
  };

  const toggleSelectTopYearIndex = (idx) => {
    setSelectedTopYearIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  const toggleSelectColInSection = (section, colIdx) => {
    setSelectedCols((prev) => {
      const arr = prev[section] || [];
      return {
        ...prev,
        [section]: arr.includes(colIdx)
          ? arr.filter((i) => i !== colIdx)
          : [...arr, colIdx],
      };
    });
  };

  const openPdfModal = (link) => {
    setPdfLink(UrlParser(link));
    setShowPdfModal(true);
  };

  const closePdfModal = () => {
    if (pdfLink && pdfLink.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(pdfLink);
      } catch (e) {
        /* ignore */
      }
    }
    setPdfLink("");
    setShowPdfModal(false);
  };

  const onCloseYearPopup = () => {
    if (yearPopupPreviewUrl && yearPopupPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(yearPopupPreviewUrl);
    }
    setShowYearPopup(false);
    setYearPopupFile(null);
    setYearPopupPreviewUrl("");
    setYearPopupIndex(null);
    setYearPopupLabel("");
  };

  const toggleSelectRow = (section, idx) => {
    setSelectedRowIndexesBySection((prev) => {
      const arr = prev[section] || [];
      return {
        ...prev,
        [section]: arr.includes(idx)
          ? arr.filter((i) => i !== idx)
          : [...arr, idx],
      };
    });
  };

  const adjustIndexAfterRemovals = (index, removedSortedAsc) => {
    const removedBefore = removedSortedAsc.filter((r) => r < index).length;
    return index - removedBefore;
  };

  const deleteSelectedYears = () => {
    if (!editedData) return;
    const indexes = (selectedTopYearIndexes || []).slice();
    if (indexes.length === 0) return;
    setDeleteConfirm({ action: "deleteYears", indexes });
  };

  const deleteSelectedColumnsInSection = (section) => {
    if (!editedData) return;
    const indexes = (selectedCols[section] || []).slice().sort((a, b) => b - a);
    if (indexes.length === 0) return;
    setDeleteConfirm({ action: "deleteColumns", section, indexes });
  };

  const deleteSelectedRows = (section) => {
    if (!editedData) return;
    const indexes = (selectedRowIndexesBySection[section] || [])
      .slice()
      .sort((a, b) => b - a);
    if (indexes.length === 0) return;
    setDeleteConfirm({ action: "deleteRows", section, indexes });
  };

  const deleteRow = (section, index) => {
    setDeleteConfirm({ action: "deleteSingleRow", section, index });
  };

  const handleCellChange = (section, rowIndex, colIndex, value) => {
    setEditedData((prev) => {
      const copy = deepClone(prev);
      if (!copy[section]?.years?.[colIndex]) return prev;
      copy[section].years[colIndex].values[rowIndex] = value;
      return copy;
    });
  };

  const addRow = (section) => {
    setEditedData((prev) => {
      const copy = deepClone(prev);
      if (copy[section].particulars) copy[section].particulars.push("");
      else copy[section].departments.push("");
      copy[section].years.forEach((y) => y.values.push(""));
      return copy;
    });
  };

  const addColumn = (section) => {
    setEditedData((prev) => {
      const copy = deepClone(prev);
      const len = copy[section].particulars
        ? copy[section].particulars.length
        : copy[section].departments.length;
      copy[section].years.push({ year: "", values: new Array(len).fill("") });
      return copy;
    });
  };

  const deleteColumn = (section, index) => {
    setEditedData((prev) => {
      const copy = deepClone(prev);
      copy[section].years.splice(index, 1);
      return copy;
    });
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    const { action, section, indexes, index } = deleteConfirm;

    if (action === "deleteYears") {
      const idxs = (indexes || []).slice().sort((a, b) => b - a);
      if (editMode && editedData) {
        setEditedData((prev) => {
          const copy = deepClone(prev);
          idxs.forEach((i) => {
            if (Array.isArray(copy.year_wise_pdfs))
              copy.year_wise_pdfs.splice(i, 1);
          });
          return copy;
        });
      } else {
        setPlacementData((prev) => {
          const copy = deepClone(prev);
          idxs.forEach((i) => {
            if (Array.isArray(copy.year_wise_pdfs))
              copy.year_wise_pdfs.splice(i, 1);
          });
          return copy;
        });
      }
      setSelectedTopYearIndexes([]);
      setSelectedCols({ department_wise: [], statistics: [] });
    } else if (action === "deleteColumns") {
      const idxs = (indexes || []).slice().sort((a, b) => b - a);
      if (editMode && editedData) {
        setEditedData((prev) => {
          const copy = deepClone(prev);
          if (!copy || !copy[section] || !Array.isArray(copy[section].years))
            return prev;
          idxs.forEach((i) => {
            copy[section].years.splice(i, 1);
          });
          return copy;
        });
      } else {
        setPlacementData((prev) => {
          const copy = deepClone(prev);
          if (!copy || !copy[section] || !Array.isArray(copy[section].years))
            return prev;
          idxs.forEach((i) => {
            copy[section].years.splice(i, 1);
          });
          return copy;
        });
      }
      setSelectedCols((prev) => ({ ...prev, [section]: [] }));
    } else if (action === "deleteRows") {
      const idxs = (indexes || []).slice().sort((a, b) => b - a);
      if (editMode && editedData) {
        setEditedData((prev) => {
          const copy = deepClone(prev);
          idxs.forEach((i) => {
            if (Array.isArray(copy[section].departments))
              copy[section].departments.splice(i, 1);
            if (Array.isArray(copy[section].particulars))
              copy[section].particulars.splice(i, 1);
            if (Array.isArray(copy[section].years)) {
              copy[section].years.forEach((y) => {
                if (Array.isArray(y.values)) y.values.splice(i, 1);
              });
            }
          });
          return copy;
        });
      } else {
        setPlacementData((prev) => {
          const copy = deepClone(prev);
          idxs.forEach((i) => {
            if (Array.isArray(copy[section].departments))
              copy[section].departments.splice(i, 1);
            if (Array.isArray(copy[section].particulars))
              copy[section].particulars.splice(i, 1);
            if (Array.isArray(copy[section].years)) {
              copy[section].years.forEach((y) => {
                if (Array.isArray(y.values)) y.values.splice(i, 1);
              });
            }
          });
          return copy;
        });
      }
      setSelectedRowIndexesBySection((prev) => ({ ...prev, [section]: [] }));
    } else if (action === "deleteSingleRow") {
      const idx = index;
      if (idx === undefined || idx === null) {
        setDeleteConfirm(null);
        return;
      }
      if (editMode && editedData) {
        setEditedData((prev) => {
          const copy = deepClone(prev);
          if (!copy || !copy[section]) return prev;
          if (Array.isArray(copy[section].departments))
            copy[section].departments.splice(idx, 1);
          else if (Array.isArray(copy[section].particulars))
            copy[section].particulars.splice(idx, 1);
          if (Array.isArray(copy[section].years))
            copy[section].years.forEach((y) => {
              if (Array.isArray(y.values)) y.values.splice(idx, 1);
            });
          return copy;
        });
        setSelectedRowIndexesBySection((prev) => {
          const arr = prev[section] || [];
          return {
            ...prev,
            [section]: arr
              .filter((i) => i !== idx)
              .map((i) => (i > idx ? i - 1 : i)),
          };
        });
      } else {
        setPlacementData((prev) => {
          const copy = deepClone(prev);
          if (!copy || !copy[section]) return prev;
          if (Array.isArray(copy[section].departments))
            copy[section].departments.splice(idx, 1);
          else if (Array.isArray(copy[section].particulars))
            copy[section].particulars.splice(idx, 1);
          if (Array.isArray(copy[section].years))
            copy[section].years.forEach((y) => {
              if (Array.isArray(y.values)) y.values.splice(idx, 1);
            });
          return copy;
        });
      }
    }

    setDeleteConfirm(null);
  };

  const handleSave = () => {
    if (!editedData) return;

    const changes = computeStructuredChanges(originalData || {}, editedData);
    if (!changes.length) return;

    // ✅ DO NOT deepClone here because it will drop File objects (__file)
    setPendingData(editedData);
    setPlacementData(editedData);

    // ✅ FIX: allow "Request" button to show again for new saved edits
    setRequestSent(false);

    setEditedData(null);
    setEditSnapshot(null);
    setEditMode(false);
    setSelectedTopYearIndexes([]);
    setSelectedCols({ department_wise: [], statistics: [] });
    setSelectedRowIndexesBySection({ department_wise: [], statistics: [] });
  };

  const discardAllPending = () => {
    setPendingData(null);
    setPlacementData(deepClone(originalData)); // originalData from backend has no File objects

    // ✅ recommended: reset request state
    setRequestSent(false);
    setEditedData(null);
    setEditSnapshot(null);
    setEditMode(false);
    setSelectedTopYearIndexes([]);
    setSelectedCols({ department_wise: [], statistics: [] });
    setSelectedRowIndexesBySection({ department_wise: [], statistics: [] });
    toast.error("changes discarded");
  };

  const handleRequest = () => {
    const changes = getChangesBetweenOriginalAndPending();
    if (!changes.length) {
      toast.warn("No changes to request");
      return;
    }
    setShowRequestModal(true);
  };

  const handleRequestConfirm = async () => {
    try {
      const payload = buildPlacementDetailsPayloadsFromChanges();
      if (!payload.length) {
        toast.warn("No changes to submit");
        return;
      }

      console.log("REQUEST PAYLOAD:", payload);

      const files = collectPlacementDetailPdfFiles();

      await sendRequest(payload, files);

      
      setShowRequestModal(false);
      setPendingData(null);
      setRequestSent(true);

      // ✅ REFRESH from DB after submitting
      const resp = await axios.post("/api/main-backend/placement", {
        type: "placement_details",
      });
      const data = resp.data?.data || null;
      setPlacementData(data);
      setOriginalData(deepClone(data));
    } catch (err) {
      console.error(err);
      toast.error("Request failed. Please try again.");
    }
  };

  // ✅ Request modal should show insert/update/delete ONLY (no double entries)
  function buildYearWiseRequestRows() {
    const changes = getChanges();

    const actionLabel = (a) =>
      a === "insert" ? "Insert" : a === "update" ? "Update" : "Delete";

    const changeLabel = (c) => {
      if (c.kind === "year_pdf") return `Year Wise PDF: "${c.year}"`;
      if (c.kind === "section_year") {
        const secLabel =
          c.section === "department_wise"
            ? "Department Wise"
            : c.section === "statistics"
              ? "Statistics"
              : c.section;

        // If year renamed, show old -> new for clarity
        if (
          c.action === "update" &&
          c.new_year !== undefined &&
          c.new_year !== c.year
        ) {
          return `${secLabel} : "${c.year}" → "${c.new_year}"`;
        }
        return `${secLabel} : "${c.year}"`;
      }
      return "Unknown change";
    };

    return changes.map((c) => ({
      action: actionLabel(c.action),
      section: "Placement Details",
      year: "",
      changes: [changeLabel(c)],
      rawChanges: [c],
    }));
  }

  const handleRevertChange = (change) => {
    if (!pendingData || !originalData) return;
    const c = change;
    const copy = deepClone(pendingData);

    if (c.kind === "year_pdf") {
      const yearLabel = c.year;

      if (c.action === "insert") {
        const idx = (copy.year_wise_pdfs || []).findIndex(
          (x) => x.year === yearLabel,
        );
        if (idx !== -1) copy.year_wise_pdfs.splice(idx, 1);
      } else if (c.action === "delete") {
        const orig = (originalData.year_wise_pdfs || []).find(
          (x) => x.year === yearLabel,
        );
        if (orig) {
          copy.year_wise_pdfs = copy.year_wise_pdfs || [];
          copy.year_wise_pdfs.push(deepClone(orig));
        }
      } else if (c.action === "update") {
        const orig = (originalData.year_wise_pdfs || []).find(
          (x) => x.year === yearLabel,
        );
        const idx = (copy.year_wise_pdfs || []).findIndex(
          (x) => x.year === yearLabel,
        );
        if (orig && idx !== -1) copy.year_wise_pdfs[idx] = deepClone(orig);
      }

      setPendingData(copy);
      setPlacementData(deepClone(copy));
      return;
    }

    if (c.kind === "section_year") {
      const sec = c.section;

      const origYears = Array.isArray(originalData?.[sec]?.years)
        ? originalData[sec].years
        : [];
      const pendingYears = Array.isArray(copy?.[sec]?.years)
        ? copy[sec].years
        : [];

      if (c.action === "insert") {
        // remove inserted column by matching last known year label
        const idx = pendingYears.findIndex((y) => y.year === c.year);
        if (idx !== -1) pendingYears.splice(idx, 1);
      } else if (c.action === "delete") {
        // add back deleted column by finding it in original
        const origIdx = origYears.findIndex((y) => y.year === c.year);
        if (origIdx !== -1) {
          pendingYears.splice(origIdx, 0, deepClone(origYears[origIdx]));
        }
      } else if (c.action === "update") {
        // revert by column index: find original column by original year label
        const origIdx = origYears.findIndex((y) => y.year === c.year);
        if (origIdx !== -1) {
          // If pending index exists at same position, replace; else try find by new year
          if (pendingYears[origIdx])
            pendingYears[origIdx] = deepClone(origYears[origIdx]);
          else {
            const idx = pendingYears.findIndex(
              (y) => y.year === (c.new_year ?? c.year),
            );
            if (idx !== -1) pendingYears[idx] = deepClone(origYears[origIdx]);
          }
        }
      }

      copy[sec].years = pendingYears;
      setPendingData(copy);
      setPlacementData(deepClone(copy));
      return;
    }
  };

  const view = editMode ? editedData : placementData;

  const deptSelectedColsCount = selectedCols.department_wise?.length || 0;
  const deptSelectedRowsCount =
    selectedRowIndexesBySection.department_wise?.length || 0;
  const statSelectedColsCount = selectedCols.statistics?.length || 0;
  const statSelectedRowsCount =
    selectedRowIndexesBySection.statistics?.length || 0;

  const showDeptDelete =
    editMode && deptSelectedColsCount + deptSelectedRowsCount > 0;
  const showStatDelete =
    editMode && statSelectedColsCount + statSelectedRowsCount > 0;

  return (
    <>
      <Banner
        theme={theme}
        toggle={toggle}
        backgroundImage="./Banners/placementbanner.webp"
        headerText="Placement Details"
        subHeaderText="Providing essential placement information and resources to guide students toward successful careers."
      />

      <ToastContainer position="bottom-right" autoClose={3000} />

      <div className="placement-wrapper relative pb-20">
        <div className="flex justify-end pr-6 pt-6">
          {!editMode ? (
            <button
              onClick={enterEditMode}
              className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
            >
              <Pencil size={16} /> Edit
            </button>
          ) : (
            <button />
          )}
        </div>

        {isLoading ? (
          <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
            <LoadComp txt={""} />
          </div>
        ) : (
          <>
            <div className="placement-yearwise font-[poppins] card-plc bg-prim dark:bg-drkts mt-4 relative">
              <h4 className="text-text bg-secd dark:drks">
                Placement Details Year Wise
              </h4>
              <div className="place-Sylgrid">
                {editMode && (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <button
                      className="place-course-button bg-secd text-text"
                      onClick={openYearPopupToAdd}
                    >
                      +
                    </button>
                  </div>
                )}

                {(view?.year_wise_pdfs || []).map((y, idx) => (
                  <div
                    key={idx}
                    className="year-button-wrapper"
                    style={{ position: "relative" }}
                  >
                    <button
                      className="place-course-button bg-secd dark:bg-drks text-text"
                      onClick={() =>
                        editMode
                          ? openYearPopupToEdit(idx)
                          : openPdfModal(UrlParser(y.pdf_path))
                      }
                      style={{ padding: "10px 22px", minWidth: 120 }}
                    >
                      <div className="place-course">{y.year}</div>
                    </button>

                    {editMode && (
                      <input
                        type="checkbox"
                        checked={selectedTopYearIndexes.includes(idx)}
                        onChange={() => toggleSelectTopYearIndex(idx)}
                        style={{ position: "absolute", top: 6, right: 6 }}
                        title="Select year for global delete"
                      />
                    )}
                  </div>
                ))}
              </div>

              {editMode && selectedTopYearIndexes.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 16,
                  }}
                >
                  <button
                    onClick={deleteSelectedYears}
                    className="px-4 py-2 rounded bg-red-600 text-white"
                  >
                    Delete Years ({selectedTopYearIndexes.length})
                  </button>
                </div>
              )}
            </div>

            {showYearPopup && (
              <div
                className="popup-overlay"
                onClick={() => setShowYearPopup(false)}
              >
                <div
                  className="popup-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3>
                    {yearPopupIndex === null ? "Add Year PDF" : "Edit Year"}
                  </h3>

                  <label className="block mt-2">Year label</label>
                  <input
                    type="text"
                    value={yearPopupLabel}
                    onChange={(e) =>
                      setYearPopupLabel(normalizeYearInput(e.target.value))
                    }
                    className="edit-input"
                    placeholder="e.g. 2024-25"
                  />

                  <div className="mt-3">
                    {yearPopupPreviewUrl ? (
                      <>
                        <div style={{ alignItems: "center" }}>
                          <label className="bg-[#fdcc03] text-white px-3 py-1 rounded cursor-pointer mr-2 ">
                            Replace
                            <input
                              type="file"
                              accept="application/pdf"
                              className="hidden"
                              onChange={(e) =>
                                handleYearPopupFileChange(e.target.files[0])
                              }
                            />
                          </label>
                          <button
                            className="px-3 py-1 rounded bg-gray-100"
                            onClick={() => openPdfModal(yearPopupPreviewUrl)}
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <label className="bg-[#fdcc03] text-white px-3 py-1 rounded cursor-pointer inline-block mt-2">
                        Upload
                        <input
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) =>
                            handleYearPopupFileChange(e.target.files[0])
                          }
                        />
                      </label>
                    )}
                  </div>

                  <div
                    style={{
                      marginTop: 16,
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 8,
                    }}
                  >
                    <button
                      className="popup-btn"
                      onClick={() => {
                        setShowYearPopup(false);
                        setYearPopupFile(null);
                        setYearPopupIndex(null);
                        setYearPopupLabel("");
                        setYearPopupPreviewUrl("");
                      }}
                    >
                      Cancel
                    </button>
                    <button className="popup-btn" onClick={applyYearPopup}>
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="admin-placement-percent font-[poppins] card-plc mt-6">
              <h4 className="place-section-title text-brwn dark:text-drkt">
                Placement Details in % - Department Wise
              </h4>
              <div className="table-container overflow-x-auto relative">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="table-header">DEPARTMENT</th>
                      {(view?.department_wise?.years || []).map((col, cIdx) => (
                        <th
                          key={cIdx}
                          className="table-header"
                          style={{ position: "relative" }}
                        >
                          {editMode && (
                            <input
                              type="checkbox"
                              checked={selectedCols.department_wise?.includes(
                                cIdx,
                              )}
                              onChange={() =>
                                toggleSelectColInSection(
                                  "department_wise",
                                  cIdx,
                                )
                              }
                              title="Select column for this table"
                              style={{ position: "absolute", top: 8, right: 8 }}
                            />
                          )}

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {editMode ? (
                              <input
                                className="edit-input"
                                value={col.year}
                                onChange={(e) => {
                                  setEditedData((prev) => {
                                    const copy = deepClone(prev);
                                    copy.department_wise.years[cIdx].year =
                                      normalizeYearInput(e.target.value);
                                    return copy;
                                  });
                                }}
                              />
                            ) : (
                              col.year
                            )}
                          </div>
                        </th>
                      ))}
                      {editMode && (
                        <th>
                          <button
                            className="save-btn"
                            onClick={() => addColumn("department_wise")}
                          >
                            + Column
                          </button>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {(view?.department_wise?.departments || []).map(
                      (dept, rIdx) => (
                        <tr key={rIdx}>
                          <td style={{ position: "relative" }}>
                            {editMode && (
                              <input
                                type="checkbox"
                                checked={selectedRowIndexesBySection.department_wise?.includes(
                                  rIdx,
                                )}
                                onChange={() =>
                                  toggleSelectRow("department_wise", rIdx)
                                }
                                title="Select row for batch actions"
                                style={{
                                  position: "absolute",
                                  top: 6,
                                  right: 6,
                                }}
                              />
                            )}
                            <div style={{ paddingRight: 28 }}>
                              {editMode ? (
                                <input
                                  className="edit-input"
                                  value={dept}
                                  onChange={(e) => {
                                    setEditedData((prev) => {
                                      const copy = deepClone(prev);
                                      copy.department_wise.departments[rIdx] =
                                        e.target.value;
                                      return copy;
                                    });
                                  }}
                                />
                              ) : (
                                dept
                              )}
                            </div>
                          </td>

                          {(view?.department_wise?.years || []).map(
                            (col, cIdx) => (
                              <td key={cIdx}>
                                {editMode ? (
                                  <input
                                    className="edit-input"
                                    value={col.values[rIdx] ?? ""}
                                    onChange={(e) =>
                                      handleCellChange(
                                        "department_wise",
                                        rIdx,
                                        cIdx,
                                        e.target.value,
                                      )
                                    }
                                  />
                                ) : (
                                  col.values[rIdx]
                                )}
                              </td>
                            ),
                          )}
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              {showDeptDelete && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 12,
                    marginTop: 12,
                  }}
                >
                  <button
                    onClick={() =>
                      setDeleteConfirm({
                        action: "deleteRows",
                        section: "department_wise",
                        indexes: selectedRowIndexesBySection.department_wise,
                      })
                    }
                    className="px-4 py-2 rounded bg-red-600 text-white"
                  >
                    Delete Selected Rows ({deptSelectedRowsCount})
                  </button>
                  <button
                    onClick={() =>
                      setDeleteConfirm({
                        action: "deleteColumns",
                        section: "department_wise",
                        indexes: selectedCols.department_wise,
                      })
                    }
                    className="px-4 py-2 rounded bg-red-700 text-white"
                  >
                    Delete Selected Columns ({deptSelectedColsCount})
                  </button>
                </div>
              )}
            </div>

            <div className="admin-placement-percent font-[poppins] card-plc mt-6">
              <h4 className="place-section-title text-brwn dark:text-drkt">
                Placement Statistics
              </h4>
              <div className="table-container overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="table-header">PARTICULARS</th>
                      {(view?.statistics?.years || []).map((col, cIdx) => (
                        <th
                          key={cIdx}
                          className="table-header"
                          style={{ position: "relative" }}
                        >
                          {editMode && (
                            <input
                              type="checkbox"
                              checked={selectedCols.statistics?.includes(cIdx)}
                              onChange={() =>
                                toggleSelectColInSection("statistics", cIdx)
                              }
                              title="Select column for this table"
                              style={{ position: "absolute", top: 8, right: 8 }}
                            />
                          )}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {editMode ? (
                              <input
                                className="edit-input"
                                value={col.year}
                                onChange={(e) => {
                                  setEditedData((prev) => {
                                    const copy = deepClone(prev);
                                    copy.statistics.years[cIdx].year =
                                      normalizeYearInput(e.target.value);
                                    return copy;
                                  });
                                }}
                              />
                            ) : (
                              col.year
                            )}
                          </div>
                        </th>
                      ))}
                      {editMode && (
                        <th>
                          <button
                            className="save-btn"
                            onClick={() => addColumn("statistics")}
                          >
                            + Column
                          </button>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {(view?.statistics?.particulars || []).map((p, rIdx) => (
                      <tr key={rIdx}>
                        <td style={{ position: "relative" }}>
                          {editMode && (
                            <input
                              type="checkbox"
                              checked={selectedRowIndexesBySection.statistics?.includes(
                                rIdx,
                              )}
                              onChange={() =>
                                toggleSelectRow("statistics", rIdx)
                              }
                              title="Select row for batch actions"
                              style={{ position: "absolute", top: 6, right: 6 }}
                            />
                          )}
                          <div style={{ paddingRight: 28 }}>
                            {editMode ? (
                              <input
                                className="edit-input"
                                value={p}
                                onChange={(e) => {
                                  setEditedData((prev) => {
                                    const copy = deepClone(prev);
                                    copy.statistics.particulars[rIdx] =
                                      e.target.value;
                                    return copy;
                                  });
                                }}
                              />
                            ) : (
                              p
                            )}
                          </div>
                        </td>
                        {(view?.statistics?.years || []).map((col, cIdx) => (
                          <td key={cIdx}>
                            {editMode ? (
                              <input
                                className="edit-input"
                                value={col.values[rIdx] ?? ""}
                                onChange={(e) =>
                                  handleCellChange(
                                    "statistics",
                                    rIdx,
                                    cIdx,
                                    e.target.value,
                                  )
                                }
                              />
                            ) : (
                              col.values[rIdx]
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {showStatDelete && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 12,
                    marginTop: 12,
                  }}
                >
                  <button
                    onClick={() =>
                      setDeleteConfirm({
                        action: "deleteRows",
                        section: "statistics",
                        indexes: selectedRowIndexesBySection.statistics,
                      })
                    }
                    className="px-4 py-2 rounded bg-red-600 text-white"
                  >
                    Delete Selected Rows ({statSelectedRowsCount})
                  </button>
                  <button
                    onClick={() =>
                      setDeleteConfirm({
                        action: "deleteColumns",
                        section: "statistics",
                        indexes: selectedCols.statistics,
                      })
                    }
                    className="px-4 py-2 rounded bg-red-700 text-white"
                  >
                    Delete Selected Columns ({statSelectedColsCount})
                  </button>
                </div>
              )}
            </div>

            <div className="absolute right-6 bottom-0 mb-5 z-[60] flex items-center gap-3">
              {editMode ? (
                <>
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  {isDirty() && (
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
                    >
                      Save
                    </button>
                  )}
                </>
              ) : pendingData && !requestSent ? (
                <>
                  <button
                    onClick={discardAllPending}
                    className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
                  >
                    Discard Changes
                  </button>
                  <button
                    onClick={handleRequest}
                    className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
                  >
                    <Send size={14} /> Request
                  </button>
                </>
              ) : null}
            </div>

            {showRequestModal && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
                <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[600px]">
                  <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
                    Request
                  </h2>
                  <p className="text-sm text-red-500 mb-4">
                    Note: Your changes will stay pending until approved by the
                    superior admin. Once approved will go live.
                  </p>

                  <div className="max-h-[250px] overflow-y-auto mb-4">
                    <table className="w-full text-center text-text dark:text-drkt border">
                      <thead>
                        <tr className="bg-gray-200 dark:bg-drka">
                          <th className="py-1">Action</th>
                          <th className="py-1">Section</th>
                          <th className="py-1 text-center">Changes</th>
                          <th className="py-1 mr-2">Undo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const requestRows = buildYearWiseRequestRows();

                          if (requestRows.length === 0) {
                            return (
                              <tr>
                                <td colSpan={4} className="py-4 text-center">
                                  No changes found
                                </td>
                              </tr>
                            );
                          }

                          return requestRows.map((row, idx) => (
                            <tr key={idx} className="border-t">
                              <td
                                className={`py-2 font-semibold ${
                                  row.action === "Insert"
                                    ? "text-green-600"
                                    : row.action === "Delete"
                                      ? "text-red-600"
                                      : "text-blue-600"
                                }`}
                              >
                                {row.action}
                              </td>

                              <td className="py-2">{row.section}</td>

                              <td className="py-2 text-[12px] text-left">
                                <div className="font-semibold">{row.year}</div>
                                {row.changes.length > 0 && (
                                  <ul className="mt-1 list-disc list-inside">
                                    {row.changes.map((c, i) => (
                                      <li key={i}>{c}</li>
                                    ))}
                                  </ul>
                                )}
                              </td>

                              <td className="py-2">
                                <button
                                  onClick={() =>
                                    row.rawChanges.forEach((c) =>
                                      handleRevertChange(c),
                                    )
                                  }
                                  className="text-red-500 hover:text-red-700 font-bold"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowRequestModal(false)}
                      className="px-4 py-2 rounded bg-gray-400 text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRequestConfirm}
                      disabled={loading}
                      className={`px-4 py-2 rounded bg-secd dark:drks text-text hover:text-drkt ${
                        loading ? "cursor-progress" : "hover:bg-[#800000]"
                      }`}
                    >
                      {loading ? "Processing..." : "Final Request"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {deleteConfirm && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
                <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[350px]">
                  <h2 className="text-lg font-bold mb-4 text-center">
                    Confirm Delete
                  </h2>
                  <p className="text-sm mb-4 text-center">
                    {(() => {
                      const a = deleteConfirm.action;
                      if (a === "deleteYears")
                        return `Are you sure you want to delete ${deleteConfirm.indexes?.length || 0} year`;
                      if (a === "deleteColumns")
                        return `Are you sure you want to delete ${deleteConfirm.indexes?.length || 0} column`;
                      if (a === "deleteRows")
                        return `Are you sure you want to delete ${deleteConfirm.indexes?.length || 0} row`;
                      if (a === "deleteSingleRow")
                        return `Are you sure you want to delete this row`;
                      return "Are you sure you want to delete?";
                    })()}
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-4 py-2 bg-gray-400 text-white rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showPdfModal && (
              <div
                className="place-modal-overlay"
                onClick={() => setShowPdfModal(false)}
              >
                <div
                  className="place-modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="place-close-button"
                    onClick={() => setShowPdfModal(false)}
                  >
                    X
                  </button>
                  <iframe
                    src={pdfLink}
                    title="PDF Viewer"
                    className="place-pdf-viewer"
                  ></iframe>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default AdminPlacementDetails;
