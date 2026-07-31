import React, { useState, useEffect } from "react";
import { Send, Trash2, Plus, X, Pencil } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadComp from "../../../LoadComp";
import { useAdminRequest } from "../../../../hooks/useAdminRequest";

const deepCopy = (v) => JSON.parse(JSON.stringify(v));

/**
 * Newsletter component — fixed change detection and revert logic.
 * Key fix: stable item `id` is created once and never mutated.
 */
export default function Newsletter({ data }) {
  // Payload & file handling
  const { sendRequest } = useAdminRequest();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const groupByYear = (list) => {
    const grouped = new Map();

    list.forEach((item) => {
      if (!grouped.has(item.year)) {
        grouped.set(item.year, []);
      }

      grouped.get(item.year).push(item);
    });

    return grouped;
  };

  const deepCopyWithFiles = (arr) => {
    return arr.map((item) => {
      const file = item._file; // Preserve File object
      const copy = JSON.parse(JSON.stringify(item)); // Deep copy everything else
      if (file) copy._file = file; // Restore File object
      return copy;
    });
  };

  const deptMap = {
    "001": "AIDS_001",
    "002": "AUTO_002",
    "003": "CHEMISTRY_003",
    "004": "CIVIL_004",
    "005": "CSE_005",
    "006": "CSECS_006",
    "007": "EEE_007",
    "008": "EIE_008",
    "009": "ECE_009",
    "010": "ENGLISH_010",
    "011": "IT_011",
    "012": "MATHS_012",
    "013": "MECH_013",
    "014": "TAMIL_014",
    "015": "PHYSICS_015",
    "016": "MECSE_016",
    "017": "MBA_017",
    "018": "PS_018"
  };

  // Extract deptId from data/banner
const deptId = data
  ?.find((item) => item.category === "banner_name_and_image")
  ?.content?.[0]?.dept_id;
  const collectionName = deptMap[deptId] ;

  // UI / state
  const [activeYear, setActiveYear] = useState(null);
  const [tempData, setTempData] = useState([]); // current working copy
  const [originalData, setOriginalData] = useState([]); // original loaded snapshot
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false); // draft saved
  const [isDirty, setIsDirty] = useState(false); // changes since last save
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedYears, setSelectedYears] = useState(new Set());
  const [selectedNewsletters, setSelectedNewsletters] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingData, setPendingData] = useState(null); // draft snapshot used for "request"
  const [deleteType, setDeleteType] = useState(""); // "year" or "newsletter"

  // small helpers for adding years
  const [addingYear, setAddingYear] = useState(false);
  const [newYearInput, setNewYearInput] = useState("");
  const [changes, setChanges] = useState([]);

  useEffect(() => {
    if (pendingData) setChanges(getChanges());
  }, [pendingData, originalData]);

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) => {
    if (!path) return "";

    if (path.startsWith("http")) {
      return encodeURI(path);
    }

    return encodeURI(`${BASE_URL}${path}`);
  };
  // Convert blob URL to filename, or get filename from static path
  const getFilenameFromPath = (pdfPath) => {
    if (!pdfPath) return "";
    // If it's a blob URL, extract the filename from the File object
    if (pdfPath.startsWith("blob:")) {
      return ""; // Will be handled via _file property
    }
    // If it's a static path, extract filename
    return pdfPath.split("/").pop() || "";
  };

  // Build payload from changes - WITHOUT blob URLs, only with proper filenames
  const buildPayload = () => {
    if (!pendingData) return [];

    const payload = [];

    const originalYears = groupByYear(originalData);
    const pendingYears = groupByYear(pendingData);

    const allYears = new Set([
      ...originalYears.keys(),
      ...pendingYears.keys(),
    ]);

    for (const year of allYears) {
      const originalItems = originalYears.get(year) || [];
      const pendingItems = pendingYears.get(year) || [];

      const oldFiles = originalItems
        .map(item => {
          const filename = getFilenameFromPath(item.pdf_path);
          return `/static/pdfs/newsletter/${deptId}/${filename}`;
        })
        .sort();

      const newFiles = pendingItems
        .map(item => {
          const filename = item._file
            ? item._file.name
            : getFilenameFromPath(item.pdf_path);

          return `/static/pdfs/newsletter/${deptId}/${filename}`;
        })
        .sort();

      // INSERT
      if (originalItems.length === 0 && pendingItems.length > 0) {
        payload.push({
          collectionName,
          collection_type: "newsletter",
          action: "insert",
          title: "insert for newsletter",
          category: "newsletter",
          meta_data: {
            year,
            pdf_path: newFiles,
          },
        });

        continue;
      }

      // DELETE
      if (originalItems.length > 0 && pendingItems.length === 0) {
        payload.push({
          collectionName,
          collection_type: "newsletter",
          action: "delete",
          title: "delete for newsletter",
          category: "newsletter",
          meta_data: {
            year,
            pdf_path: oldFiles,
          },
        });

        continue;
      }

      // UPDATE
      const changed =
        year !== originalItems[0]?.year ||
        JSON.stringify(oldFiles) !== JSON.stringify(newFiles);

      if (changed) {
        payload.push({
          collectionName,
          collection_type: "newsletter",
          action: "update",
          title: "update for newsletter",
          category: "newsletter",
          meta_data: {
            year,
            pdf_path: newFiles,
          },
          original_data: {
            year: originalItems[0]?.year,
            pdf_path: oldFiles,
          },
        });
      }
    }

    return payload;
  };

  // Collect File objects from pendingData (for upload)
  const collectFiles = () => {
    const files = [];
    if (!pendingData) {
      console.log("collectFiles: pendingData is empty");
      return files;
    }

    for (const item of pendingData) {
      // Only collect new File objects (from blob URLs)
      if (item._file && item._file instanceof File) {
        console.log("collectFiles: Found file -", item._file.name);
        files.push(item._file);
      }
    }

    console.log("collectFiles: Total files collected -", files.length);
    return files;
  };

  // Submit request to admin hook
  const handleRequestConfirm = async () => {
    if (!pendingData || changes.length === 0) {
      toast.error("No changes to submit");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = buildPayload();
      const files = collectFiles();
      const result = await sendRequest(payload, files.length > 0 ? files : null);

      if (result.success) {

        setOriginalData(deepCopy(pendingData));
        setTempData(deepCopyWithFiles(pendingData));
        setPendingData(null);
        setIsSaved(false);
        setShowRequestModal(false);
      } else {
        toast.error(result.message || "Failed to submit request");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Error submitting request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const capitalizeWords = (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  };

  // Create a stable uid for newly-created items
  const makeUid = (prefix = "uid") => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // --- Load / normalize incoming data once ---
  useEffect(() => {
    if (!data) return;
    const newsletter = data?.find((item) => item.category === "newsletter")?.content || [];

    // Flatten content -> items with stable id (preserve backend id if present)
    const flattened = [];
    newsletter.forEach((yearEntry) => {
      const year = String(yearEntry.year);
      // make sure pdf_path is an array
      const paths = Array.isArray(yearEntry.pdf_path) ? yearEntry.pdf_path : [yearEntry.pdf_path].filter(Boolean);
      paths.forEach((pdfPath, idx) => {
        // preserve provided id if any (rare). otherwise generate stable uid.
        const stableId = yearEntry.id ? `${yearEntry.id}-${idx}` : makeUid(`nl-${year}-${idx}`);
        flattened.push({
          id: stableId,
          year,
          name: `Newsletter ${idx + 1}`,
          pdf_path: pdfPath || "",
          // other fields you may need
        });
      });
    });

    setTempData(flattened);
    setOriginalData(deepCopy(flattened));
    if (flattened.length > 0) setActiveYear(flattened[0].year);
  }, [data]);

  // Group by year (computed from tempData)
  const groupedByYear = {};
  tempData.forEach((it) => {
    if (!groupedByYear[it.year]) groupedByYear[it.year] = [];
    groupedByYear[it.year].push(it);
  });

  // ---------- UI actions ----------
  const handleYearClick = (year) => {
    // only open if year is not selected (checkbox)
    if (!selectedYears.has(year)) setActiveYear(year);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsSaved(false);
    setIsDirty(false);
    setSelectedYears(new Set());
    setSelectedNewsletters(new Set());
  };

  const handleSave = () => {
    if (!isDirty) {
      return;
    }

    // Validate exactly up to 2 per year — if you require exactly 2, enforce here.
    // If you allow 1 or 2, adjust validation accordingly. Example below ensures max 2:
    for (const year of Object.keys(groupedByYear)) {
      const count = groupedByYear[year]?.length || 0;
      if (count > 2) {
        toast.error(`Year ${year} cannot have more than 2 newsletters.`);
        return;
      }
    }

    // Ensure all names & PDF paths are present (if your UX requires)
    const invalid = tempData.find((x) => !x.name?.trim() || !x.pdf_path?.trim());
    if (invalid) {
      toast.error("Please fill all newsletter names and upload files before saving!");
      return;
    }

    // Save as pending draft
    setPendingData(deepCopyWithFiles(tempData));
    setIsSaved(true);
    setIsEditing(false);
    setIsDirty(false);
    setSelectedYears(new Set());
    setSelectedNewsletters(new Set());

  };

  const handleCancel = () => {
    if (pendingData) {
      setTempData(deepCopyWithFiles(pendingData));
    } else {
      setTempData(deepCopy(originalData));
    }
    setIsEditing(false);
    setIsDirty(false);
    setSelectedYears(new Set());
    setSelectedNewsletters(new Set());
    setIsSaved(!!pendingData);
  };

  const handleDiscard = () => {
    setTempData(deepCopy(originalData));
    setPendingData(null);
    setIsSaved(false);
    setIsDirty(false);
    setSelectedYears(new Set());
    setSelectedNewsletters(new Set());
  };

  const handleRequest = () => setShowRequestModal(true);

  // Change single field on an item (by stable id)
  const handleChange = (id, key, value) => {
    setTempData((prev) => {
      const updated = prev.map((it) => (it.id === id ? { ...it, [key]: key === "name" ? capitalizeWords(value) : value } : it));
      return updated;
    });
    setIsDirty(true);
  };

  // File change: set a blob URL and track File object
  const handleFileChange = (id, file) => {
    const fakePath = URL.createObjectURL(file);
    setTempData((prev) => prev.map((it) => (it.id === id ? { ...it, pdf_path: fakePath, _file: file } : it)));
    setIsDirty(true);
  };

  // Add a new year (single empty newsletter entry — user can add the 2nd)
  const handleAddYear = () => {
    if (!newYearInput.trim()) {
      toast.error("Please enter a year to add.");
      return;
    }
    const year = newYearInput.trim();

    if (Object.keys(groupedByYear).includes(year)) {
      toast.error(`Year ${year} already exists!`);
      return;
    }

    const uid = makeUid(`nl-${year}-0`);
    const newItem = { id: uid, year, name: "Newsletter 1", pdf_path: "" };
    setTempData((prev) => [...prev, newItem]);
    setActiveYear(year);
    setIsDirty(true);
    setAddingYear(false);
    setNewYearInput("");
  };

  // Add a newsletter to an existing year (max 2)
  const handleAddNewsletter = (year) => {
    const yearItems = tempData.filter((it) => it.year === year);
    if (yearItems.length >= 2) {
      toast.error(`Year ${year} already has 2 newsletters!`);
      return;
    }
    const newId = makeUid(`nl-${year}-${yearItems.length}`);
    const newItem = { id: newId, year, name: `Newsletter ${yearItems.length + 1}`, pdf_path: "" };
    setTempData((prev) => [...prev, newItem]);
    setIsDirty(true);
  };

  // Toggle selection sets
  const toggleSelectYear = (year) => {
    setSelectedYears((prev) => {
      const nxt = new Set(prev);
      if (nxt.has(year)) nxt.delete(year);
      else nxt.add(year);
      return nxt;
    });
  };
  const toggleSelectNewsletter = (id, year) => {
    const nxt = new Set(selectedNewsletters);
    if (nxt.has(id)) {
      nxt.delete(id);
    } else {
      nxt.add(id);

      // If selecting a newsletter, disable its year checkbox by removing it from selectedYears
      const yearCheckboxSelected = selectedYears.has(year);
      if (yearCheckboxSelected) {
        const yearsCopy = new Set(selectedYears);
        yearsCopy.delete(year);
        setSelectedYears(yearsCopy);
      }
    }
    setSelectedNewsletters(nxt);
  };


  // Delete confirmation
  const confirmDelete = () => {
    if (deleteType === "year") {
      setTempData((prev) => {
        const updated = prev.filter((it) => !selectedYears.has(it.year));
        if (selectedYears.has(activeYear)) {
          const remainingYears = [...new Set(updated.map((i) => i.year))];
          setActiveYear(remainingYears.length > 0 ? remainingYears[0] : null);
        }
        return updated;
      });
      setSelectedYears(new Set());
    } else if (deleteType === "newsletter") {
      setTempData((prev) => prev.filter((it) => !selectedNewsletters.has(it.id)));
      setSelectedNewsletters(new Set());
    }
    setShowDeleteModal(false);
    setIsDirty(true);
  };

  const openDeleteModal = (type) => {
    if (type === "year" && selectedYears.size === 0) {
      toast.error("Select at least one year to delete.");
      return;
    }
    if (type === "newsletter" && selectedNewsletters.size === 0) {
      toast.error("Select at least one newsletter to delete.");
      return;
    }
    setDeleteType(type);
    setShowDeleteModal(true);
  };

  

  // --- Compute changes relative to originalData ---
  const getChanges = () => {
    if (!pendingData) return [];
    const changes = [];

    const originalMap = new Map(originalData.map((it) => [it.id, it]));
    const pendingMap = new Map(pendingData.map((it) => [it.id, it]));

    // Added or Edited items
    for (const [id, newItem] of pendingMap.entries()) {
      const oldItem = originalMap.get(id);
      if (!oldItem) {
        changes.push({
          action: "Added",
          section: "Newsletter",
          changes: `${newItem.year} - ${newItem.name}`,
          rowId: id,
        });
      } else if (
        oldItem.name !== newItem.name ||
        oldItem.pdf_path !== newItem.pdf_path ||
        oldItem.year !== newItem.year
      ) {
        changes.push({
          action: "Edited",
          section: "Newsletter",
          changes: `${newItem.year} - ${newItem.name}`,
          rowId: id,
        });
      }
    }

    // Deleted items (group by year)
    const deletedByYear = {};
    for (const [id, oldItem] of originalMap.entries()) {
      if (!pendingMap.has(id)) {
        if (!deletedByYear[oldItem.year]) deletedByYear[oldItem.year] = [];
        deletedByYear[oldItem.year].push(oldItem);
      }
    }

    for (const year in deletedByYear) {
      const totalOriginal = originalData.filter((it) => it.year === year).length;
      const deletedCount = deletedByYear[year].length;

      if (deletedCount === totalOriginal) {
        // all newsletters of this year deleted → show year only
        changes.push({
          action: "Deleted",
          section: "Newsletter",
          changes: year,
          rowId: null, // no specific row
        });
      } else {
        // partial deletion → show individual newsletters
        deletedByYear[year].forEach((item) => {
          changes.push({
            action: "Deleted",
            section: "Newsletter",
            changes: `${item.year} - ${item.name}`,
            rowId: item.id,
          });
        });
      }
    }

    return changes;
  };



  // --- Revert a change by rowId ---
  const revertChange = (rowId) => {
    if (!pendingData) return;

    const oldItem = originalData.find((o) => o.id === rowId);
    const isAdded = !oldItem && pendingData.some((p) => p.id === rowId); // added item
    const isDeleted = oldItem && !pendingData.some((p) => p.id === rowId); // deleted item
    const isEdited = oldItem && pendingData.some((p) => p.id === rowId); // edited item

    let newPending = [...pendingData];

    if (isAdded) {
      // Remove newly added item
      newPending = newPending.filter((item) => item.id !== rowId);
    } else if (isDeleted) {
      // Restore deleted item
      newPending.push(deepCopy(oldItem));
    } else if (isEdited) {
      // Revert edited item
      newPending = newPending.map((item) =>
        item.id === rowId ? deepCopy(oldItem) : item
      );
    } else {
      return; // should not happen
    }

    // Update state
    setPendingData(newPending);
    setTempData(deepCopy(newPending));
    setIsDirty(true);

    // Remove from selectedNewsletters to immediately reflect modal changes
    setSelectedNewsletters((prev) => {
      const nxt = new Set(prev);
      nxt.delete(rowId);
      return nxt;
    });

    // Reopen year if it was restored
    if (isDeleted && oldItem.year) setActiveYear(oldItem.year);
  };





  // const changes = getChanges();

  // ---------- render ----------
  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <div className="p-6 mt-4 pb-20">
      <ToastContainer position="bottom-right" autoClose={2000} />

      <div className="relative mb-6 w-full">
        <h2 className="text-4xl text-brwn dark:text-drkt font-bold text-center">Newsletter</h2>

        {!isEditing && (
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
            <button onClick={handleEdit} className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim transition">
              <Pencil size={18} /> Edit
            </button>
          </div>
        )}
      </div>

      {/* Year buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {Object.keys(groupedByYear)
          .sort((a, b) => b - a)
          .map((year) => (
            <div key={year} className="flex flex-col items-center relative">
              <button
                type="button"
                onClick={() => {
                  // only open if not selected
                  if (!selectedYears.has(year)) handleYearClick(year);
                }}
                className={`px-6 py-3 font-semibold rounded-xl hover:text-prim transition-all
                  ${activeYear === year ? "bg-[#800000] text-prim" : "bg-secd dark:bg-drks"}
                  hover:bg-[#a00000] ${selectedYears.has(year) ? "opacity-60 cursor-not-allowed" : ""}`}
                disabled={selectedYears.has(year)}
              >
                {year}
              </button>

              {isEditing && (
                <div className="absolute -top-3 -right-3 z-10">
                  <input
                    type="checkbox"
                    checked={selectedYears.has(year)}
                    disabled={groupedByYear[year].some(pdf => selectedNewsletters.has(pdf.id))} // disable if any newsletter is selected
                    onChange={(e) => {
                      e.stopPropagation();
                      const nxt = new Set(selectedYears);
                      if (nxt.has(year)) {
                        nxt.delete(year);
                      } else {
                        nxt.add(year);

                        // Deselect all newsletters of this year when selecting year
                        const nxtNewsletters = new Set(selectedNewsletters);
                        groupedByYear[year].forEach(pdf => nxtNewsletters.delete(pdf.id));
                        setSelectedNewsletters(nxtNewsletters);

                        // Close active year
                        setActiveYear(null);
                      }
                      setSelectedYears(nxt);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="h-5 w-5"
                  />
                </div>
              )}

            </div>
          ))}

        {/* Add Year UI */}
        {isEditing && !addingYear && (
          <button onClick={() => setAddingYear(true)} className="flex items-center justify-center gap-2 px-4 py-3 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim transition">
            <Plus size={18} /> Add Year
          </button>
        )}

        {isEditing && addingYear && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newYearInput}
              onChange={(e) => setNewYearInput(e.target.value)}
              placeholder="Enter year"
              className="px-2 py-1 border rounded"
            />
            <button onClick={handleAddYear} className="bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim px-3 py-1 rounded transition">
              Add
            </button>
            <button
              onClick={() => {
                setAddingYear(false);
                setNewYearInput("");
              }}
              className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Show newsletters for selected year */}
      {activeYear && groupedByYear[activeYear] && (
        <div className="relative border p-8 mt-6 w-[94%] mx-auto bg-prim dark:bg-drkp shadow-lg rounded-lg">
          <h3 className="text-xl font-bold mb-4 text-center">{activeYear}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groupedByYear[activeYear].map((pdf) => (
              <div key={pdf.id} className="relative">
                <div className="flex justify-between items-center mb-2">

                  {isEditing && (
                    <input type="checkbox" checked={selectedNewsletters.has(pdf.id)} onChange={() => toggleSelectNewsletter(pdf.id)} className="w-5 h-5 ml-2" />
                  )}
                </div>

                {isEditing && activeYear === pdf.year && (
                  <div className="mb-4 text-center">
                    <label className="bg-[#fdcc03] text-text px-3 py-2 rounded cursor-pointer hover:bg-[#800000] hover:text-prim transition">
                      {pdf.pdf_path ? "Change Newsletter" : "Upload Newsletter"}
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) handleFileChange(pdf.id, file);
                        }}
                      />
                    </label>
                  </div>
                )}

                {pdf.pdf_path ? (
                  <iframe
                    src={pdf.pdf_path.startsWith("blob:")
                      ? pdf.pdf_path
                      : UrlParser(pdf.pdf_path)}
                    title={pdf.name}
                    width="100%"
                    height="400"
                    className="border rounded"
                    style={{ border: "none" }}
                  />) : (
                  <div className="border rounded h-[400px] flex items-center justify-center bg-gray-100">
                    <span className="text-gray-500">No PDF uploaded</span>
                  </div>
                )}
              </div>
            ))}

            {/* Add newsletter card if < 2 */}
            {isEditing && groupedByYear[activeYear].length < 2 && (
              <div className="border-2 border-dashed rounded-lg h-[400px] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100" onClick={() => handleAddNewsletter(activeYear)}>
                <Plus size={48} className="text-gray-400 mb-2" />
                <span className="text-gray-500">Add Newsletter</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete buttons when editing */}
      {isEditing && (
        <div className="flex justify-center gap-4 mt-6">
          {selectedYears.size > 0 && (
            <button onClick={() => openDeleteModal("year")} className="px-4 py-2 flex items-center gap-2 bg-red-500 text-prim rounded hover:bg-red-600">
              <Trash2 size={18} /> Delete {selectedYears.size} Year{selectedYears.size > 1 ? "s" : ""}
            </button>
          )}
          {selectedNewsletters.size > 0 && (
            <button onClick={() => openDeleteModal("newsletter")} className="px-4 py-2 flex items-center gap-2 bg-red-500 text-prim rounded hover:bg-red-600">
              <Trash2 size={18} /> Delete {selectedNewsletters.size} Newsletter{selectedNewsletters.size > 1 ? "s" : ""}
            </button>
          )}
        </div>
      )}

      {/* Save / Cancel */}
      {isEditing && (
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={handleCancel} className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-600 transition">Cancel</button>
          {isDirty && (
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim transition">
              Save
            </button>
          )}
        </div>
      )}

      {/* Saved draft actions */}
      {isSaved && (
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={handleDiscard} className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-600 transition">Discard Changes</button>
          {changes.length > 0 && (
            <button onClick={handleRequest} className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim transition">
              <Send size={18} /> Request
            </button>
          )}
        </div>
      )}

      {/* Final Request modal (shows changes and revert) */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-text/70 flex items-center justify-center z-[1000]">
          <div className="bg-prim p-6 rounded-xl w-[600px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Final Request</h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin.
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
                    <tr key={ch.rowId || i}>
                      <td className="border p-2 text-blue-600">{ch.action}</td>
                      <td className="border p-2">{ch.section}</td>
                      <td className="border p-2">{ch.changes}</td>
                      <td className="border p-2">
                        <button
                          onClick={() => revertChange(ch.rowId)}
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
                className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500"
              >
                Cancel
              </button>
              {changes.length > 0 && (
                <button
                  onClick={handleRequestConfirm}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isSubmitting ? "Processing..." : "Confirm Request"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-text/50 flex items-center justify-center z-50">
          <div className="bg-prim p-6 rounded-lg shadow-lg border w-[90%] max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {deleteType === "year" ? selectedYears.size : selectedNewsletters.size} {deleteType}
              {deleteType === "year" ? (selectedYears.size > 1 ? "s" : "") : (selectedNewsletters.size > 1 ? "s" : "")}?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-400 rounded-lg hover:bg-gray-600 transition">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-prim rounded-lg hover:bg-red-700 transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}