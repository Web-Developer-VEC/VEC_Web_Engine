import React, { useEffect, useState } from 'react';
import axios from "axios";
import './AdminPlacementDetails.css';
import Banner from '../../Banner';
import LoadComp from '../../LoadComp';
import { useNavigate } from "react-router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pencil, Send } from 'lucide-react';
import { Eye } from "lucide-react";

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

export const AdminPlacementDetails = ({ theme, toggle }) => {
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfLink, setPdfLink] = useState("");

  const [originalData, setOriginalData] = useState(null);
  const [placementData, setPlacementData] = useState(null);
  const [editedData, setEditedData] = useState(null);
  const [editSnapshot, setEditSnapshot] = useState(null);
  const [pendingData, setPendingData] = useState(null);

  const [isLoading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [editMode, setEditMode] = useState(false);

  const [selectedTopYearIndexes, setSelectedTopYearIndexes] = useState([]);
  const [selectedCols, setSelectedCols] = useState({ department_wise: [], statistics: [] });
  const [selectedRowIndexesBySection, setSelectedRowIndexesBySection] = useState({ department_wise: [], statistics: [] });

  const [showYearPopup, setShowYearPopup] = useState(false);
  const [yearPopupIndex, setYearPopupIndex] = useState(null);
  const [yearPopupLabel, setYearPopupLabel] = useState("");
  const [yearPopupFile, setYearPopupFile] = useState(null);
  const [yearPopupPreviewUrl, setYearPopupPreviewUrl] = useState("");

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL || "";
  const UrlParser = (path) => (path?.startsWith("http") ? path : `${BASE_URL}${path}`);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await axios.post('/api/main-backend/placement', { type: 'placement_details' });
        const data = resp.data?.data || null;
        setPlacementData(data);
        setOriginalData(deepClone(data));
        setPendingData(null);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
  }

  const findDifferences = (base, compare) => {
    const differences = { modified: [], added: [], deleted: [] };
    if (!base || !compare) return differences;

    const pdfs1 = base.year_wise_pdfs || [];
    const pdfs2 = compare.year_wise_pdfs || [];

    pdfs1.forEach(p1 => {
      if (!pdfs2.find(p2 => p2.year === p1.year)) differences.deleted.push(`Year PDF removed: "${p1.year}"`);
    });
    pdfs2.forEach(p2 => {
      if (!pdfs1.find(p1 => p1.year === p2.year)) differences.added.push(`Year PDF added: "${p2.year}"`);
    });
    pdfs1.forEach(p1 => {
      const p2 = pdfs2.find(x => x.year === p1.year);
      if (p2 && p1.pdf_path !== p2.pdf_path) differences.modified.push(`Year PDF changed: "${p1.year}"`);
    });

    const sections = ['department_wise', 'statistics'];
    sections.forEach(section => {
      if (!base[section] || !compare[section]) return;
      const sec1 = base[section];
      const sec2 = compare[section];

      const rows1 = sec1.particulars || sec1.departments || [];
      const rows2 = sec2.particulars || sec2.departments || [];

      rows1.forEach(r => { if (!rows2.includes(r)) differences.deleted.push(`${section} row removed: "${r}"`); });
      rows2.forEach(r => { if (!rows1.includes(r)) differences.added.push(`${section} row added: "${r}"`); });

      const years1 = sec1.years || [];
      const years2 = sec2.years || [];
      years1.forEach(y1 => { if (!years2.find(y2 => y2.year === y1.year)) differences.deleted.push(`${section} column removed: "${y1.year}"`); });
      years2.forEach(y2 => { if (!years1.find(y1 => y1.year === y2.year)) differences.added.push(`${section} column added: "${y2.year}"`); });

      years1.forEach(y1 => {
        const y2 = years2.find(y => y.year === y1.year);
        if (!y2) return;
        rows1.forEach((rowName, idx1) => {
          if (!rows2.includes(rowName)) return;
          const idx2 = rows2.indexOf(rowName);
          const v1 = y1.values?.[idx1];
          const v2 = y2.values?.[idx2];
          if (v1 !== v2) differences.modified.push(`${section}: "${rowName}" changed in "${y1.year}"`);
        });
      });
    });

    return differences;
  };

  const getChangesBetweenOriginalAndPending = (base = originalData, compare = pendingData) => {
    if (!base || !compare) return { modified: [], added: [], deleted: [] };
    return findDifferences(base, compare);
  };

  const getChanges = () => {
    const diffs = getChangesBetweenOriginalAndPending();
    const out = [];

    const push = (action, sectionKey, type, name, extra = {}) => {
      const sectionLabel = "Placement Details";
      let changeText = '';
      if (sectionKey === 'year_wise') {
        changeText = `Placement Details Year Wise : ${name}`;
      } else if (sectionKey === 'department_wise') {
        changeText = `Placement Details in % - Department Wise: ${name}`;
      } else if (sectionKey === 'statistics') {
        changeText = `Placement Statistics: ${name}`;
      } else {
        changeText = name;
      }
      out.push({
        action,
        section: sectionLabel,
        type,
        name,
        changeText,
        extra
      });
    };

    diffs.added.forEach(s => {
      const mYearAdd = s.match(/^Year PDF added: "(.+)"$/);
      if (mYearAdd) { push("Added", "year_wise", "year", mYearAdd[1]); return; }

      const mRowAdd = s.match(/^(department_wise|statistics) row added: "(.+)"$/);
      if (mRowAdd) {
        const sec = mRowAdd[1] === 'department_wise' ? 'department_wise' : 'statistics';
        push("Added", sec, "row", mRowAdd[2]);
        return;
      }

      const mColAdd = s.match(/^(department_wise|statistics) column added: "(.+)"$/);
      if (mColAdd) {
        const sec = mColAdd[1] === 'department_wise' ? 'department_wise' : 'statistics';
        push("Added", sec, "column", mColAdd[2]);
        return;
      }

      push("Added", "unknown", "unknown", s);
    });

    diffs.deleted.forEach(s => {
      const mYearDel = s.match(/^Year PDF removed: "(.+)"$/);
      if (mYearDel) { push("Deleted", "year_wise", "year", mYearDel[1]); return; }

      const mRowDel = s.match(/^(department_wise|statistics) row removed: "(.+)"$/);
      if (mRowDel) {
        const sec = mRowDel[1] === 'department_wise' ? 'department_wise' : 'statistics';
        push("Deleted", sec, "row", mRowDel[2]);
        return;
      }

      const mColDel = s.match(/^(department_wise|statistics) column removed: "(.+)"$/);
      if (mColDel) {
        const sec = mColDel[1] === 'department_wise' ? 'department_wise' : 'statistics';
        push("Deleted", sec, "column", mColDel[2]);
        return;
      }

      push("Deleted", "unknown", "unknown", s);
    });

    diffs.modified.forEach(s => {
      const mYearMod = s.match(/^Year PDF changed: "(.+)"$/);
      if (mYearMod) { push("Edited", "year_wise", "year", mYearMod[1]); return; }

      const mCellMod = s.match(/^(department_wise|statistics): "(.+)" changed in "(.+)"$/);
      if (mCellMod) {
        const sec = mCellMod[1] === 'department_wise' ? 'department_wise' : 'statistics';
        const rowName = mCellMod[2];
        const yearName = mCellMod[3];
        push("Edited", sec, "cell", `${rowName} (in ${yearName})`, { rowName, yearName });
        return;
      }

      push("Edited", "unknown", "unknown", s);
    });

    return out;
  };

  const enterEditMode = () => {
    const src = pendingData ? pendingData : placementData;
    const cloneSrc = deepClone(src);
    setEditedData(cloneSrc);
    setEditSnapshot(deepClone(cloneSrc));
    setSelectedTopYearIndexes([]);
    setSelectedCols({ department_wise: [], statistics: [] });
    setSelectedRowIndexesBySection({ department_wise: [], statistics: [] });
    setEditMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    const item = editedData.year_wise_pdfs[index] || { year: '', pdf_path: '' };
    setYearPopupIndex(index);
    setYearPopupLabel(item.year || '');
    setYearPopupPreviewUrl(item.pdf_path || '');
    setYearPopupFile(null);
    setShowYearPopup(true);
  };

  const openYearPopupToAdd = () => {
    setYearPopupIndex(null);
    setYearPopupLabel('');
    setYearPopupPreviewUrl('');
    setYearPopupFile(null);
    setShowYearPopup(true);
  };

  const handleYearPopupFileChange = (file) => {
    if (!file) return;
    setYearPopupFile(file);
    setYearPopupPreviewUrl(URL.createObjectURL(file));
  };

  const applyYearPopup = () => {
    if (!yearPopupLabel || yearPopupLabel.trim() === '') {
      toast.error('Please enter a Year (e.g. 2024-25)');
      return;
    }
    setEditedData(prev => {
      const copy = deepClone(prev) || { year_wise_pdfs: [], department_wise: { departments: [], years: [] }, statistics: { particulars: [], years: [] } };
      copy.year_wise_pdfs = copy.year_wise_pdfs || [];

      if (yearPopupIndex === null) {
        const newObj = { year: yearPopupLabel, pdf_path: yearPopupFile ? URL.createObjectURL(yearPopupFile) : '' };
        copy.year_wise_pdfs = copy.year_wise_pdfs || [];
        copy.year_wise_pdfs.unshift(newObj);
        setSelectedTopYearIndexes([]);
        setSelectedCols({ department_wise: [], statistics: [] });
        setSelectedRowIndexesBySection({ department_wise: [], statistics: [] });
      } else {
        copy.year_wise_pdfs[yearPopupIndex] = copy.year_wise_pdfs[yearPopupIndex] || { year: '', pdf_path: '' };
        copy.year_wise_pdfs[yearPopupIndex].year = yearPopupLabel;
        if (yearPopupFile) {
          copy.year_wise_pdfs[yearPopupIndex].pdf_path = URL.createObjectURL(yearPopupFile);
        }
      }
      return copy;
    });

    setShowYearPopup(false);
    setYearPopupFile(null);
    setYearPopupPreviewUrl('');
    setYearPopupIndex(null);
    setYearPopupLabel('');

  };

  const toggleSelectTopYearIndex = (idx) => {
    setSelectedTopYearIndexes(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const toggleSelectColInSection = (section, colIdx) => {
    setSelectedCols(prev => {
      const arr = prev[section] || [];
      return { ...prev, [section]: arr.includes(colIdx) ? arr.filter(i => i !== colIdx) : [...arr, colIdx] };
    });
  };

  const openPdfModal = (link) => {
    setPdfLink(UrlParser(link));
    setShowPdfModal(true);
  };

  const closePdfModal = () => {
    setPdfLink('');
    setShowPdfModal(false);
  };

  const toggleSelectRow = (section, idx) => {
    setSelectedRowIndexesBySection(prev => {
      const arr = prev[section] || [];
      return {
        ...prev,
        [section]: arr.includes(idx) ? arr.filter(i => i !== idx) : [...arr, idx]
      };
    });
  };

  const adjustIndexAfterRemovals = (index, removedSortedAsc) => {
    const removedBefore = removedSortedAsc.filter(r => r < index).length;
    return index - removedBefore;
  };

  const deleteSelectedYears = () => {
    if (!editedData) return;
    const indexes = (selectedTopYearIndexes || []).slice();
    if (indexes.length === 0) return;
    setDeleteConfirm({ action: 'deleteYears', indexes });
  };

  const deleteSelectedColumnsInSection = (section) => {
    if (!editedData) return;
    const indexes = (selectedCols[section] || []).slice().sort((a,b)=>b-a);
    if (indexes.length === 0) return;
    setDeleteConfirm({ action: 'deleteColumns', section, indexes });
  };

  const deleteSelectedRows = (section) => {
    if (!editedData) return;
    const indexes = (selectedRowIndexesBySection[section] || []).slice().sort((a,b)=>b-a);
    if (indexes.length === 0) return;
    setDeleteConfirm({ action: 'deleteRows', section, indexes });
  };

  const deleteRow = (section, index) => {
    setDeleteConfirm({ action: 'deleteSingleRow', section, index });
  };

  const handleCellChange = (section, rowIndex, colIndex, value) => {
    setEditedData(prev => {
      const copy = deepClone(prev);
      if (!copy[section]?.years?.[colIndex]) return prev;
      copy[section].years[colIndex].values[rowIndex] = value;
      return copy;
    });
  };

  const addRow = (section) => {
    setEditedData(prev => {
      const copy = deepClone(prev);
      if (copy[section].particulars) copy[section].particulars.push('');
      else copy[section].departments.push('');
      copy[section].years.forEach(y => y.values.push(''));
      return copy;
    });
  };

  
  const addColumn = (section) => {
    setEditedData(prev => {
      const copy = deepClone(prev);
      const len = copy[section].particulars ? copy[section].particulars.length : copy[section].departments.length;
      copy[section].years.push({ year: '', values: new Array(len).fill('') });
      return copy;
    });
  };

  const deleteColumn = (section, index) => {
    setEditedData(prev => {
      const copy = deepClone(prev);
      copy[section].years.splice(index,1);
      return copy;
    });
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    const { action, section, indexes, index } = deleteConfirm;

    if (action === 'deleteYears') {
      const idxs = (indexes || []).slice().sort((a,b)=>b-a);
      if (editMode && editedData) {
        setEditedData(prev => {
          const copy = deepClone(prev);
          idxs.forEach(i => {
            if (Array.isArray(copy.year_wise_pdfs)) copy.year_wise_pdfs.splice(i,1);
          });
          return copy;
        });
      } else {
        setPlacementData(prev => {
          const copy = deepClone(prev);
          idxs.forEach(i => {
            if (Array.isArray(copy.year_wise_pdfs)) copy.year_wise_pdfs.splice(i,1);
          });
          return copy;
        });
      }
      setSelectedTopYearIndexes([]);
      setSelectedCols({ department_wise: [], statistics: [] });
    }

    else if (action === 'deleteColumns') {
      const idxs = (indexes || []).slice().sort((a,b)=>b-a);
      if (editMode && editedData) {
        setEditedData(prev => {
          const copy = deepClone(prev);
          if (!copy || !copy[section] || !Array.isArray(copy[section].years)) return prev;
          idxs.forEach(i => { copy[section].years.splice(i,1); });
          return copy;
        });
      } else {
        setPlacementData(prev => {
          const copy = deepClone(prev);
          if (!copy || !copy[section] || !Array.isArray(copy[section].years)) return prev;
          idxs.forEach(i => { copy[section].years.splice(i,1); });
          return copy;
        });
      }
      setSelectedCols(prev => ({ ...prev, [section]: [] }));
    }

    else if (action === 'deleteRows') {
      const idxs = (indexes || []).slice().sort((a,b)=>b-a);
      if (editMode && editedData) {
        setEditedData(prev => {
          const copy = deepClone(prev);
          idxs.forEach(i => {
            if (Array.isArray(copy[section].departments)) copy[section].departments.splice(i,1);
            if (Array.isArray(copy[section].particulars)) copy[section].particulars.splice(i,1);
            if (Array.isArray(copy[section].years)) {
              copy[section].years.forEach(y => { if (Array.isArray(y.values)) y.values.splice(i,1); });
            }
          });
          return copy;
        });
      } else {
        setPlacementData(prev => {
          const copy = deepClone(prev);
          idxs.forEach(i => {
            if (Array.isArray(copy[section].departments)) copy[section].departments.splice(i,1);
            if (Array.isArray(copy[section].particulars)) copy[section].particulars.splice(i,1);
            if (Array.isArray(copy[section].years)) {
              copy[section].years.forEach(y => { if (Array.isArray(y.values)) y.values.splice(i,1); });
            }
          });
          return copy;
        });
      }
      setSelectedRowIndexesBySection(prev => ({ ...prev, [section]: [] }));
    }

    else if (action === 'deleteSingleRow') {
      const idx = index;
      if (idx === undefined || idx === null) {
        setDeleteConfirm(null);
        return;
      }
      if (editMode && editedData) {
        setEditedData(prev => {
          const copy = deepClone(prev);
          if (!copy || !copy[section]) return prev;
          if (Array.isArray(copy[section].departments)) copy[section].departments.splice(idx,1);
          else if (Array.isArray(copy[section].particulars)) copy[section].particulars.splice(idx,1);
          if (Array.isArray(copy[section].years)) copy[section].years.forEach(y => { if (Array.isArray(y.values)) y.values.splice(idx,1); });
          return copy;
        });
        setSelectedRowIndexesBySection(prev => {
          const arr = prev[section] || [];
          return { ...prev, [section]: arr.filter(i => i !== idx).map(i => (i > idx ? i - 1 : i)) };
        });
      } else {
        setPlacementData(prev => {
          const copy = deepClone(prev);
          if (!copy || !copy[section]) return prev;
          if (Array.isArray(copy[section].departments)) copy[section].departments.splice(idx,1);
          else if (Array.isArray(copy[section].particulars)) copy[section].particulars.splice(idx,1);
          if (Array.isArray(copy[section].years)) copy[section].years.forEach(y => { if (Array.isArray(y.values)) y.values.splice(idx,1); });
          return copy;
        });
      }
    }

    setDeleteConfirm(null);
  };

  const handleSave = () => {
    if (!editedData) return;
    const diffs = findDifferences(originalData || {}, editedData);
    const has = diffs.added.length || diffs.modified.length || diffs.deleted.length;
    if (!has) return;

    setPendingData(deepClone(editedData));
    setPlacementData(deepClone(editedData));
    setEditedData(null);
    setEditSnapshot(null);
    setEditMode(false);
    setSelectedTopYearIndexes([]);
    setSelectedCols({ department_wise: [], statistics: [] });
    setSelectedRowIndexesBySection({ department_wise: [], statistics: [] });
  };

  const discardAllPending = () => {
    setPendingData(null);
    setPlacementData(deepClone(originalData));
    setEditedData(null);
    setEditSnapshot(null);
    setEditMode(false);
    setSelectedTopYearIndexes([]);
    setSelectedCols({ department_wise: [], statistics: [] });
    setSelectedRowIndexesBySection({ department_wise: [], statistics: [] });
    toast.error('changes discarded');
  };

  const handleRequest = () => {
    if (!pendingData) return;
    const diffs = getChangesBetweenOriginalAndPending();
    if (!diffs.added.length && !diffs.modified.length && !diffs.deleted.length) return;
    setShowRequestModal(true);
  };

  const handleRequestConfirm = async () => {
        try {
          setShowRequestModal(false);
           setPendingData(null); 
          toast.success("Request submitted successfully!");
        } catch (err) {
          console.error(err);
          toast.error("Request failed. Please try again.");
        }
  };

  const handleRevertChange = (change) => {
    if (!pendingData || !originalData) return;
    const c = change;
    const copy = deepClone(pendingData);

    if (c.type === 'year') {
      const yearLabel = c.name;
      if (c.action === 'Added') {
        if (Array.isArray(copy.year_wise_pdfs)) {
          const idx = copy.year_wise_pdfs.findIndex(x => x.year === yearLabel);
          if (idx !== -1) copy.year_wise_pdfs.splice(idx, 1);
        }
      } else if (c.action === 'Deleted') {
        const origIdx = (originalData.year_wise_pdfs || []).findIndex(x => x.year === yearLabel);
        if (origIdx !== -1 && Array.isArray(originalData.year_wise_pdfs)) {
          const origEntry = deepClone(originalData.year_wise_pdfs[origIdx]);
          copy.year_wise_pdfs = copy.year_wise_pdfs || [];
          if (origIdx >= copy.year_wise_pdfs.length) copy.year_wise_pdfs.push(origEntry);
          else copy.year_wise_pdfs.splice(origIdx, 0, origEntry);
        }
      } else if (c.action === 'Edited') {
        const orig = (originalData.year_wise_pdfs || []).find(x => x.year === yearLabel);
        const pendingIdx = (copy.year_wise_pdfs || []).findIndex(x => x.year === yearLabel);
        if (orig && pendingIdx !== -1) {
          copy.year_wise_pdfs[pendingIdx] = deepClone(orig);
        }
      }
    }

    else if (c.type === 'row') {
      const sec = (c.changeText && c.changeText.includes('Department Wise')) ? 'department_wise' : 'statistics';
      const rowName = c.name;
      if (!copy[sec]) { }
      else {
        if (c.action === 'Added') {
          const arrName = copy[sec].departments ? 'departments' : 'particulars';
          const idx = (copy[sec][arrName] || []).findIndex(r => r === rowName);
          if (idx !== -1) {
            copy[sec][arrName].splice(idx, 1);
            if (Array.isArray(copy[sec].years)) {
              copy[sec].years.forEach(y => { if (Array.isArray(y.values)) y.values.splice(idx, 1); });
            }
          }
        } else if (c.action === 'Deleted') {
          const arrName = originalData[sec].departments ? 'departments' : 'particulars';
          const origIdx = (originalData[sec][arrName] || []).findIndex(r => r === rowName);
          if (origIdx !== -1) {
            copy[sec][arrName] = copy[sec][arrName] || [];
            if (origIdx >= copy[sec][arrName].length) copy[sec][arrName].push(deepClone(originalData[sec][arrName][origIdx]));
            else copy[sec][arrName].splice(origIdx, 0, deepClone(originalData[sec][arrName][origIdx]));
            copy[sec].years = copy[sec].years || [];
            originalData[sec].years = originalData[sec].years || [];
            originalData[sec].years.forEach((origYearObj) => {
              const yearLabel = origYearObj.year;
              const pendingYearIdx = (copy[sec].years || []).findIndex(y => y.year === yearLabel);
              const origRowIdx = originalData[sec][arrName].indexOf(rowName);
              if (pendingYearIdx !== -1 && origRowIdx !== -1) {
                const val = originalData[sec].years[pendingYearIdx]?.values?.[origRowIdx] ?? '';
                copy[sec].years[pendingYearIdx].values.splice(origIdx, 0, val);
              }
            });
          }
        } else if (c.action === 'Edited') {
          const arrName = copy[sec].departments ? 'departments' : 'particulars';
          const origArrName = originalData[sec].departments ? 'departments' : 'particulars';
          const origRowIdx = (originalData[sec][origArrName] || []).indexOf(rowName);
          const pendingRowIdx = (copy[sec][arrName] || []).indexOf(rowName);
          if (origRowIdx !== -1 && pendingRowIdx !== -1) {
            (copy[sec].years || []).forEach((yObj, yIdx) => {
              const yearLabel = yObj.year;
              const origYearIdx = (originalData[sec].years || []).findIndex(o => o.year === yearLabel);
              if (origYearIdx !== -1) {
                const newVal = originalData[sec].years[origYearIdx].values?.[origRowIdx] ?? '';
                copy[sec].years[yIdx].values[pendingRowIdx] = newVal;
              }
            });
          }
        }
      }
    }

    else if (c.type === 'column') {
      const yearLabel = c.name;
      const sec = (c.changeText && c.changeText.includes('Department Wise')) ? 'department_wise' : 'statistics';
      if (!copy[sec]) { }
      else {
        if (c.action === 'Added') {
          const idx = (copy[sec].years || []).findIndex(y => y.year === yearLabel);
          if (idx !== -1) copy[sec].years.splice(idx, 1);
        } else if (c.action === 'Deleted') {
          const origIdx = (originalData[sec].years || []).findIndex(y => y.year === yearLabel);
          if (origIdx !== -1) {
            const origYearObj = deepClone(originalData[sec].years[origIdx]);
            copy[sec].years = copy[sec].years || [];
            if (origIdx >= copy[sec].years.length) copy[sec].years.push(origYearObj);
            else copy[sec].years.splice(origIdx, 0, origYearObj);
          }
        } else if (c.action === 'Edited') {
          const pendingIdx = (copy[sec].years || []).findIndex(y => y.year === yearLabel);
          const origIdx = (originalData[sec].years || []).findIndex(y => y.year === yearLabel);
          if (pendingIdx !== -1 && origIdx !== -1) {
            copy[sec].years[pendingIdx] = deepClone(originalData[sec].years[origIdx]);
          }
        }
      }
    }

    else if (c.type === 'cell') {
      const sec = (c.changeText && c.changeText.includes('Department Wise')) ? 'department_wise' : 'statistics';
      const { rowName, yearName } = c.extra || {};
      if (sec && rowName && yearName && copy[sec]) {
        const rowIdx = (copy[sec].departments || copy[sec].particulars || []).indexOf(rowName);
        const yearIdx = (copy[sec].years || []).findIndex(y => y.year === yearName);
        if (rowIdx !== -1 && yearIdx !== -1) {
          const origYearIdx = (originalData[sec].years || []).findIndex(y => y.year === yearName);
          const origRowIdx = (originalData[sec].departments || originalData[sec].particulars || []).indexOf(rowName);
          if (origYearIdx !== -1 && origRowIdx !== -1) {
            const origVal = originalData[sec].years[origYearIdx].values?.[origRowIdx] ?? '';
            copy[sec].years[yearIdx].values[rowIdx] = origVal;
          }
        }
      }
    }

    setPendingData(copy);
    setPlacementData(deepClone(copy));
  };

  const view = editMode ? editedData : placementData;

  const deptSelectedColsCount = selectedCols.department_wise?.length || 0;
  const deptSelectedRowsCount = selectedRowIndexesBySection.department_wise?.length || 0;
  const statSelectedColsCount = selectedCols.statistics?.length || 0;
  const statSelectedRowsCount = selectedRowIndexesBySection.statistics?.length || 0;

  const showDeptDelete = editMode && (deptSelectedColsCount + deptSelectedRowsCount) > 0;
  const showStatDelete = editMode && (statSelectedColsCount + statSelectedRowsCount) > 0;

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
            <button onClick={enterEditMode} className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim">
              <Pencil size={16} /> Edit
            </button>
          ) : (
            <button />
          )}
        </div>

        {isLoading ? (
          <div className="h-screen flex items-center justify-center md:mt-[10%] md:block"><LoadComp txt={""} /></div>
        ) : (
          <>
            <div className="placement-yearwise font-[poppins] card-plc bg-prim dark:bg-drkts mt-4 relative">
              <h4 className='text-text bg-secd dark:drks'>Placement Details Year Wise</h4>
              <div className="place-Sylgrid">
                {editMode && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button className="place-course-button bg-secd text-text" onClick={openYearPopupToAdd}>+</button>
                  </div>
                )}

                {(view?.year_wise_pdfs || []).map((y, idx) => (
                  <div key={idx} className="year-button-wrapper" style={{ position: 'relative' }}>
                    <button
                      className="place-course-button bg-secd dark:bg-drks text-text"
                      onClick={() => editMode ? openYearPopupToEdit(idx) : openPdfModal(UrlParser(y.pdf_path))}
                      style={{ padding: '10px 22px', minWidth: 120 }}
                    >
                      <div className="place-course">{y.year}</div>
                    </button>

                    {editMode && (
                      <input
                        type="checkbox"
                        checked={selectedTopYearIndexes.includes(idx)}
                        onChange={() => toggleSelectTopYearIndex(idx)}
                        style={{ position: 'absolute', top: 6, right: 6 }}
                        title="Select year for global delete"
                      />
                    )}
                  </div>
                ))}
              </div>

              {editMode && selectedTopYearIndexes.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                  <button onClick={deleteSelectedYears} className="px-4 py-2 rounded bg-red-600 text-white">Delete Years ({selectedTopYearIndexes.length})</button>
                </div>
              )}
            </div>

            {showYearPopup && (
              <div className="popup-overlay" onClick={() => setShowYearPopup(false)}>
                <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                  <h3>{yearPopupIndex === null ? 'Add Year PDF' : 'Edit Year'}</h3>

                  <label className="block mt-2">Year label</label>
                  <input type="text" value={yearPopupLabel} onChange={(e) => setYearPopupLabel(e.target.value)} className="edit-input" placeholder="e.g. 2024-25" />

                  <div className="mt-3">
                    {yearPopupPreviewUrl ? (
                      <>
                        <div style={{  alignItems: 'center' }}>
                          <label className="bg-[#fdcc03] text-white px-3 py-1 rounded cursor-pointer mr-2 ">
                            Replace
                            <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleYearPopupFileChange(e.target.files[0])} />
                          </label>
                          <button className="px-3 py-1 rounded bg-gray-100" onClick={() => openPdfModal(yearPopupPreviewUrl)}><Eye size={18} /></button>
                        </div>
                      </>
                    ) : (
                      <label className="bg-[#fdcc03] text-white px-3 py-1 rounded cursor-pointer inline-block mt-2">
                        Upload
                        <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleYearPopupFileChange(e.target.files[0])} />
                      </label>
                    )}
                  </div>

                  <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button className="cancel-btn-t" onClick={() => { setShowYearPopup(false); setYearPopupFile(null); setYearPopupIndex(null); setYearPopupLabel(''); setYearPopupPreviewUrl(''); }}>Cancel</button>
                    <button className="save-btn" onClick={applyYearPopup}>Apply</button>
                  </div>
                </div>
              </div>
            )}

            <div className="admin-placement-percent font-[poppins] card-plc mt-6">
              <h4 className="place-section-title text-brwn dark:text-drkt">Placement Details in % - Department Wise</h4>
              <div className="table-container overflow-x-auto relative">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="table-header">DEPARTMENT</th>
                      {(view?.department_wise?.years || []).map((col, cIdx) => (
                        <th key={cIdx} className="table-header" style={{ position: 'relative' }}>
                          {editMode && (
                            <input
                              type="checkbox"
                              checked={selectedCols.department_wise?.includes(cIdx)}
                              onChange={() => toggleSelectColInSection('department_wise', cIdx)}
                              title="Select column for this table"
                              style={{ position: 'absolute', top: 8, right: 8 }}
                            />
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {editMode ? (
                              <input className="edit-input" value={col.year} onChange={(e) => {
                                setEditedData(prev => {
                                  const copy = deepClone(prev);
                                  copy.department_wise.years[cIdx].year = e.target.value;
                                  return copy;
                                });
                              }} />
                            ) : col.year}
                          </div>
                        </th>
                      ))}
                      {editMode && <th><button className="save-btn" onClick={() => addColumn('department_wise')}>+ Column</button></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {(view?.department_wise?.departments || []).map((dept, rIdx) => (
                      <tr key={rIdx}>
                        <td style={{ position: 'relative' }}>
                          {editMode && (
                            <input
                              type="checkbox"
                              checked={selectedRowIndexesBySection.department_wise?.includes(rIdx)}
                              onChange={() => toggleSelectRow('department_wise', rIdx)}
                              title="Select row for batch actions"
                              style={{ position: 'absolute', top: 6, right: 6 }}
                            />
                          )}
                          <div style={{ paddingRight: 28 }}>
                            {editMode ? (<input className="edit-input" value={dept} onChange={(e) => {
                              setEditedData(prev => { const copy = deepClone(prev); copy.department_wise.departments[rIdx] = e.target.value; return copy; });
                            }} />) : dept}
                          </div>
                        </td>

                        {(view?.department_wise?.years || []).map((col, cIdx) => (
                          <td key={cIdx}>
                            {editMode ? <input className="edit-input" value={col.values[rIdx] ?? ''} onChange={(e) => handleCellChange('department_wise', rIdx, cIdx, e.target.value)} /> : col.values[rIdx]}
                          </td>
                        ))}

                      </tr>
                    ))}
                    {editMode && (
                      <tr>
                        <td colSpan={999}><button className="save-btn" onClick={() => addRow('department_wise')}>+ Row</button></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {showDeptDelete && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 12 }}>
                  <button onClick={() => setDeleteConfirm({ action: 'deleteRows', section: 'department_wise', indexes: selectedRowIndexesBySection.department_wise })} className="px-4 py-2 rounded bg-red-600 text-white">
                    Delete Selected Rows ({deptSelectedRowsCount})
                  </button>
                  <button onClick={() => setDeleteConfirm({ action: 'deleteColumns', section: 'department_wise', indexes: selectedCols.department_wise })} className="px-4 py-2 rounded bg-red-700 text-white">
                    Delete Selected Columns ({deptSelectedColsCount})
                  </button>
                </div>
              )}
            </div>

            <div className="admin-placement-percent font-[poppins] card-plc mt-6">
              <h4 className="place-section-title text-brwn dark:text-drkt">Placement Statistics</h4>
              <div className="table-container overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="table-header">PARTICULARS</th>
                      {(view?.statistics?.years || []).map((col, cIdx) => (
                        <th key={cIdx} className="table-header" style={{ position: 'relative' }}>
                          {editMode && (
                            <input
                              type="checkbox"
                              checked={selectedCols.statistics?.includes(cIdx)}
                              onChange={() => toggleSelectColInSection('statistics', cIdx)}
                              title="Select column for this table"
                              style={{ position: 'absolute', top: 8, right: 8 }}
                            />
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {editMode ? <input className="edit-input" value={col.year} onChange={(e) => { setEditedData(prev => { const copy = deepClone(prev); copy.statistics.years[cIdx].year = e.target.value; return copy; }); }} /> : col.year}
                          </div>
                        </th>
                      ))}
                      {editMode && <th><button className="save-btn" onClick={() => addColumn('statistics')}>+ Column</button></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {(view?.statistics?.particulars || []).map((p, rIdx) => (
                      <tr key={rIdx}>
                        <td style={{ position: 'relative' }}>
                          {editMode && (
                            <input
                              type="checkbox"
                              checked={selectedRowIndexesBySection.statistics?.includes(rIdx)}
                              onChange={() => toggleSelectRow('statistics', rIdx)}
                              title="Select row for batch actions"
                              style={{ position: 'absolute', top: 6, right: 6 }}
                            />
                          )}
                          <div style={{ paddingRight: 28 }}>
                            {editMode ? (<input className="edit-input" value={p} onChange={(e) => { setEditedData(prev => { const copy = deepClone(prev); copy.statistics.particulars[rIdx] = e.target.value; return copy; }); }} />) : p}
                          </div>
                        </td>
                        {(view?.statistics?.years || []).map((col, cIdx) => (
                          <td key={cIdx}>{editMode ? (<input className="edit-input" value={col.values[rIdx] ?? ''} onChange={(e) => handleCellChange('statistics', rIdx, cIdx, e.target.value)} />) : col.values[rIdx]}</td>
                        ))}
                      </tr>
                    ))}
                    {editMode && (<tr><td colSpan={999}><button className="save-btn" onClick={() => addRow('statistics')}>+ Row</button></td></tr>)}
                  </tbody>
                </table>
              </div>

              {showStatDelete && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 12 }}>
                  <button onClick={() => setDeleteConfirm({ action: 'deleteRows', section: 'statistics', indexes: selectedRowIndexesBySection.statistics })} className="px-4 py-2 rounded bg-red-600 text-white">
                    Delete Selected Rows ({statSelectedRowsCount})
                  </button>
                  <button onClick={() => setDeleteConfirm({ action: 'deleteColumns', section: 'statistics', indexes: selectedCols.statistics })} className="px-4 py-2 rounded bg-red-700 text-white">
                    Delete Selected Columns ({statSelectedColsCount})
                  </button>
                </div>
              )}
            </div>

            <div className="absolute right-6 bottom-0 mb-5 z-[60] flex items-center gap-3">
              {editMode ? (
                <>
                  <button onClick={cancelEdit} className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500">Cancel</button>
                  {isDirty() && (
                    <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim">Save</button>
                  )}
                </>
              ) : (
                (pendingData && !requestSent) ? (
                  <>
                    <button onClick={discardAllPending} className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500">Discard Changes</button>
                    <button onClick={handleRequest} className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"><Send size={14} /> Request</button>
                  </>
                ) : null
              )}
            </div>

            {showRequestModal && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
                <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[600px]">
                  <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">Request</h2>
                  <p className="text-sm text-red-500 mb-4">Note: Your changes will stay pending until approved by the superior admin. Once approved will go live.</p>

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
                        {getChanges().map((change, idx) => (
                          <tr key={idx} className="border-t">
                            <td className={`py-1 ${ change.action === "Added" ? "text-green-600" : change.action === "Deleted" ? "text-red-600" : "text-blue-600" }`}>{change.action}</td>
                            <td className="py-1">{change.section}</td>
                            <td className="py-1 text-[12px]">
                              <div className="flex items-center justify-center gap-2">
                                <span>{change.changeText}</span>
                               
                              </div>
                            </td>
                            <td> <button onClick={() => handleRevertChange(change)} className="text-red-500 hover:text-red-700 font-bold">✕</button></td>
                          </tr>
                        ))}
                        {getChanges().length === 0 && (<tr><td colSpan={3} className="py-3">No changes found</td></tr>)}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowRequestModal(false)} className="px-4 py-2 rounded bg-gray-400 text-white">Cancel</button>
                    <button onClick={handleRequestConfirm} className="px-4 py-2 rounded bg-[#fdcc03] dark:drks hover:bg-[#800000] text-text hover:text-prim">
                      Final Request
                    </button>
                  </div>
                </div>
              </div>
            )}

            {deleteConfirm && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
                <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[350px]">
                  <h2 className="text-lg font-bold mb-4 text-center">Confirm Delete</h2>
                  <p className="text-sm mb-4 text-center">
                    {(() => {
                      const a = deleteConfirm.action;
                      if (a === 'deleteYears') return `Are you sure you want to delete ${deleteConfirm.indexes?.length || 0} year`;
                      if (a === 'deleteColumns') return `Are you sure you want to delete ${deleteConfirm.indexes?.length || 0} column`;
                      if (a === 'deleteRows') return `Are you sure you want to delete ${deleteConfirm.indexes?.length || 0} row`;
                      if (a === 'deleteSingleRow') return `Are you sure you want to delete this row`;
                      return 'Are you sure you want to delete?';
                    })()}
                  </p>
                  <div className="flex justify-center gap-3">
                    <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 bg-gray-400 text-white rounded">Cancel</button>
                    <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                  </div>
                </div>
              </div>
            )}

            {showPdfModal && (
              <div className="place-modal-overlay" onClick={() => setShowPdfModal(false)}>
                <div className="place-modal-content" onClick={(e) => e.stopPropagation()}>
                  <button className="place-close-button" onClick={() => setShowPdfModal(false)}>X</button>
                  <iframe src={pdfLink} title="PDF Viewer" className="place-pdf-viewer"></iframe>
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
