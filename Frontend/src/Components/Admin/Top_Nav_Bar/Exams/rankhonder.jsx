import React, { useEffect, useState } from "react";
import { Send, Trash2, Plus, X, Pencil } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

const deepCopy = (v) => JSON.parse(JSON.stringify(v));
const deepCopyWithFiles = (arr) =>
  arr.map((item) => {
    const file = item._file; // keep File object
    const copy = JSON.parse(JSON.stringify(item));
    if (file) copy._file = file;
    return copy;
  });

const makeUid = (prefix = "uid") =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function AdminRankHonder() {
  const [rankholderRaw, setRankholderRaw] = useState([]); // raw response (categories)
  const [activeCategory, setActiveCategory] = useState(null);

  // states mirroring Newsletter flow
  const [tempData, setTempData] = useState([]); // working copy (flat list of items)
  const [originalData, setOriginalData] = useState([]); // original snapshot (flat)
  const [pendingData, setPendingData] = useState(null); // saved draft snapshot (flat)

  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedPdfs, setSelectedPdfs] = useState(new Set());

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState(""); // 'category' | 'pdf'

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [changes, setChanges] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [addingYear, setAddingYear] = useState(false);
  const [newYearInput, setNewYearInput] = useState("");

  const navigate = useNavigate();
  const {
    sendRequest,
    loading: requestLoading,
    error: requestError,
  } = useAdminRequest();

  const BASE_URL = process.env.REACT_APP_BASE_URL || "";

  const UrlParser = (path) =>
    path?.startsWith("http") ? path : `${BASE_URL}${path}`;

  // convert incoming API structure into flat list with stable ids
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("/api/main-backend/exam", {
          type: "rankholder",
        });
        const data = response.data?.data || [];
        setRankholderRaw(data);

        const flattened = [];
        data.forEach((cat) => {
          const content = Array.isArray(cat.content) ? cat.content : [];
          content.forEach((pdf, idx) => {
            const stableId = pdf.id
              ? `${pdf.id}-${idx}`
              : makeUid(`rh-${cat.category}-${idx}`);
            flattened.push({
              id: stableId,
              category: cat.category,
              name: pdf.name || `Rank list ${idx + 1}`,
              pdf_path: pdf.pdf_path || "",
              // keep other fields if needed
            });
          });
        });

        setTempData(flattened);
        setOriginalData(deepCopy(flattened)); // snapshot for change detection
        if (flattened.length > 0) setActiveCategory(flattened[0].category);
      } catch (error) {
        console.error("Error Fetching Rankholder data:", error);
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
        } else {
          toast.error("Failed to fetch rankholder data");
        }
      }
    };

    fetchData();
  }, [navigate]);

  // derived grouping
  const groupedByCategory = {};
  tempData.forEach((it) => {
    if (!groupedByCategory[it.category]) groupedByCategory[it.category] = [];
    groupedByCategory[it.category].push(it);
  });

  // --- Helpers for file path handling ---
  const getFilenameFromPath = (pdfPath) => {
    if (!pdfPath) return "";
    if (pdfPath.startsWith("blob:")) return "";
    return pdfPath.split("/").pop() || "";
  };

  const collectFiles = () => {
    const files = [];
    if (!pendingData) return files;
    for (const item of pendingData) {
      if (item._file && item._file instanceof File) {
        files.push(item._file);
      }
    }
    return files;
  };

  const buildRankHolderPayload = () => {
    const sourceData = pendingData || tempData; // 🔥 FIX

    if (!sourceData) return { payload: [], files: [] };

    const payload = [];
    const files = [];

    const oMap = new Map(originalData.map((i) => [i.id, i]));
    const pMap = new Map(sourceData.map((i) => [i.id, i]));

    // ------------------ INSERT + UPDATE ------------------
    for (const [id, newItem] of pMap.entries()) {
      const oldItem = oMap.get(id);

      // derive the filename to send in payload (do NOT use blob)
      const fileName =
        newItem._file instanceof File ? newItem._file.name : newItem.pdf_path;

      // if there's a real File attached, collect it for upload
      if (newItem._file instanceof File) {
        files.push(newItem._file);
      }

      // 🔹 INSERT
      if (!oldItem) {
        payload.push({
          collectionName: "exams",
          collection_type: "rankholder",
          action: "insert",
          title: "insert",
          category: newItem.category,
          meta_data: {
            name: newItem.name,
            pdf_path: fileName || "",
          },
        });
        continue;
      }

      // 🔹 UPDATE (name/category changed or file updated)
      // 🔹 UPDATE
      if (
        oldItem.name !== newItem.name ||
        oldItem.category !== newItem.category ||
        newItem._file instanceof File || // 🔥 THIS IS THE REAL FILE CHECK
        oldItem.pdf_path !== newItem.pdf_path
      ) {
        payload.push({
          collectionName: "exams",
          collection_type: "rankholder",
          action: "update",
          title: "update",
          category: newItem.category,
          meta_data: {
            name: newItem.name,
            pdf_path:
              newItem._file instanceof File
                ? newItem._file.name
                : newItem.pdf_path,
          },
          original_data: {
            name: oldItem.name,
            pdf_path: oldItem.pdf_path,
          },
        });
      }
    }

    // ------------------ DELETE ------------------

    // Group deleted PDFs by category
    const deletedByCategory = {};

    for (const [id, oldItem] of oMap.entries()) {
      if (!pMap.has(id)) {
        if (!deletedByCategory[oldItem.category]) {
          deletedByCategory[oldItem.category] = [];
        }

        deletedByCategory[oldItem.category].push(oldItem);
      }
    }

    // Build payloads
    Object.keys(deletedByCategory).forEach((category) => {
      const deletedItems = deletedByCategory[category];

      const totalOriginal = originalData.filter(
        (item) => item.category === category,
      ).length;

      // Entire year deleted
      if (deletedItems.length === totalOriginal) {
        payload.push({
          collectionName: "exams",
          collection_type: "rankholder",
          action: "delete",
          title: "delete",
          category,
          meta_data: {},
        });
      } else {
        // Individual PDF deletion
        deletedItems.forEach((item) => {
          payload.push({
            collectionName: "exams",
            collection_type: "rankholder",
            action: "delete",
            title: "delete",
            category,
            meta_data: {
              name: item.name,
              pdf_path: item.pdf_path,
            },
          });
        });
      }
    });

    return { payload, files };
  };
  // Submit request: send payload + files as FormData
  const handleRequestConfirm = async () => {
    try {
      setIsSubmitting(true);

      // buildRankHolderPayload now returns an object
      const { payload, files } = buildRankHolderPayload();

      console.log("Payload:", payload);
      console.log("Files:", files);

      if (!payload || payload.length === 0) {
        toast.error("No changes to submit!");
        setIsSubmitting(false);
        return;
      }

      // keep your required signature
      await sendRequest(payload, files);

      // update local state after success
      setOriginalData(deepCopy(pendingData));
      setTempData(deepCopyWithFiles(pendingData));
      setPendingData(null);
      setIsSaved(false);
      setShowRequestModal(false);
      setChanges([]);
    } catch (err) {
      console.error(err);
      toast.error("Request Failed!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // change detection relative to originalData (for modal)
  const getChanges = () => {
    if (!pendingData) return [];
    const out = [];
    const oMap = new Map(originalData.map((i) => [i.id, i]));
    const pMap = new Map(pendingData.map((i) => [i.id, i]));

    // Added / Edited
    for (const [id, newItem] of pMap.entries()) {
      const oldItem = oMap.get(id);
      if (!oldItem) {
        out.push({
          action: "Added",
          section: "RankHolder",
          changes: `${newItem.category} - ${newItem.name}`,
          rowId: id,
          isCategoryDelete: false,
        });
      } else if (
        oldItem.name !== newItem.name ||
        oldItem.category !== newItem.category ||
        newItem._file !== undefined || // ⭐ NEW PDF uploaded
        newItem.isUpdated === true || // ⭐ Existing PDF updated
        (!newItem.pdf_path?.startsWith("blob:") &&
          oldItem.pdf_path !== newItem.pdf_path)
      ) {
        out.push({
          action: "Edited",
          section: "RankHolder",
          changes: `${newItem.category} - ${newItem.name}`,
          rowId: id,
          isCategoryDelete: false,
        });
      }
    }

    // Deleted items grouped by category
    const deletedByCategory = {};
    for (const [id, oldItem] of oMap.entries()) {
      if (!pMap.has(id)) {
        if (!deletedByCategory[oldItem.category])
          deletedByCategory[oldItem.category] = [];
        deletedByCategory[oldItem.category].push(oldItem);
      }
    }

    for (const cat in deletedByCategory) {
      const totalOriginal = originalData.filter(
        (it) => it.category === cat,
      ).length;
      const deletedCount = deletedByCategory[cat].length;
      if (deletedCount === totalOriginal) {
        out.push({
          action: "Deleted",
          section: "RankHolder",
          changes: cat,
          rowId: cat, // use category name as rowId for full-category delete
          isCategoryDelete: true,
        });
      } else {
        deletedByCategory[cat].forEach((item) => {
          out.push({
            action: "Deleted",
            section: "RankHolder",
            changes: `${item.category} - ${item.name}`,
            rowId: item.id,
            isCategoryDelete: false,
          });
        });
      }
    }

    return out;
  };

  // Revert a change by rowId; supports category restore (isCategoryDelete)
  const revertChange = (rowId, isCategoryDelete = false) => {
    if (!pendingData) return;
    let newPending = [...pendingData];

    if (isCategoryDelete) {
      // restore all items of that category from originalData
      const restoreItems = originalData.filter((it) => it.category === rowId);
      // avoid duplicates: only add those not present
      const existingIds = new Set(newPending.map((p) => p.id));
      const toAdd = restoreItems
        .filter((r) => !existingIds.has(r.id))
        .map((r) => deepCopy(r));
      newPending = [...newPending, ...toAdd];
      toast.info(`Restored deleted category ${rowId}`);
    } else {
      const oldItem = originalData.find((o) => o.id === rowId);
      const wasAdded = !oldItem && pendingData.some((p) => p.id === rowId);
      const wasDeleted = oldItem && !pendingData.some((p) => p.id === rowId);
      const wasEdited = oldItem && pendingData.some((p) => p.id === rowId);

      if (wasAdded) {
        newPending = newPending.filter((item) => item.id !== rowId);
        toast.info("Removed added item.");
      } else if (wasDeleted) {
        newPending.push(deepCopy(oldItem));
        toast.info("Restored deleted item.");
      } else if (wasEdited) {
        newPending = newPending.map((item) =>
          item.id === rowId ? deepCopy(oldItem) : item,
        );
        toast.info("Reverted edited item.");
      } else {
        return; // nothing to do
      }
    }

    setPendingData(newPending);
    setTempData(deepCopyWithFiles(newPending));
    setIsDirty(true);

    // update selections
    setSelectedPdfs((prev) => {
      const nxt = new Set(prev);
      nxt.delete(rowId);
      return nxt;
    });

    // if restored category opened, make it active
    if (isCategoryDelete) setActiveCategory(rowId);
  };

  // --- UI actions ---

  const handleCategoryClick = (category) => {
    if (!selectedCategories.has(category)) setActiveCategory(category);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsSaved(false);
    setIsDirty(false);
    setSelectedCategories(new Set());
    setSelectedPdfs(new Set());
  };

  const handleCancel = () => {
    if (pendingData) {
      setTempData(deepCopyWithFiles(pendingData));
      toast.info("Cancelled edits. Draft preserved!");
    } else {
      setTempData(deepCopy(originalData));
      toast.info("Cancelled. Reverted to original data!");
    }
    setIsEditing(false);
    setIsDirty(false);
    setSelectedCategories(new Set());
    setSelectedPdfs(new Set());
    setIsSaved(!!pendingData);
  };

  const handleSaveAsDraft = () => {
    // 🚨 VALIDATION
    const invalid = tempData.find(
      (x) => !x.name?.trim() || !x.pdf_path?.trim(),
    );

    if (invalid) {
      toast.error("Enter Course Name and Upload PDF before saving!");
      return;
    }

    // Remove flags before saving
    const cleaned = tempData.map((it) => ({
      ...it,
      isNew: false,
      isUpdated: false,
    }));

    setPendingData(deepCopyWithFiles(cleaned));
    setTempData(cleaned);

    setIsSaved(true);
    setIsEditing(false);
    setIsDirty(false);
    setSelectedCategories(new Set());
    setSelectedPdfs(new Set());

    setChanges(getChanges());
  };

  const handleDiscardDraft = () => {
    setTempData(deepCopy(originalData));
    setPendingData(null);
    setIsSaved(false);
    setIsDirty(false);
    setSelectedCategories(new Set());
    setSelectedPdfs(new Set());
    toast.info("Changes discarded!");
  };

  const handleFileChange = (id, file) => {
    const blob = URL.createObjectURL(file);

    setTempData((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              pdf_path: blob, // only for preview
              _file: file, // 🔥 actual file to send
              isUpdated: true,
            }
          : it,
      ),
    );

    setIsDirty(true);
  };
  const handleAddPdf = (category) => {
    const yearItems = tempData.filter((it) => it.category === category);

    if (yearItems.length >= 2) {
      toast.error(`Year ${category} already has 2 PDFs!`);
      return;
    }

    const newItem = {
      id: makeUid(`rh-${category}-${yearItems.length}`),
      category,
      name: "",
      pdf_path: "",
      isNew: true, // ⭐ VERY IMPORTANT
    };

    setTempData((prev) => [...prev, newItem]);
    setIsDirty(true);
  };

  const toggleSelectCategory = (category) => {
    setSelectedCategories((prev) => {
      const nxt = new Set(prev);
      if (nxt.has(category)) {
        nxt.delete(category);
      } else {
        nxt.add(category);
        // deselect all pdfs of this category
        const nxtPdfs = new Set(selectedPdfs);
        (groupedByCategory[category] || []).forEach((pdf) =>
          nxtPdfs.delete(pdf.id),
        );
        setSelectedPdfs(nxtPdfs);
        setActiveCategory(null);
      }
      return nxt;
    });
  };

  const toggleSelectPdf = (id, category) => {
    setSelectedPdfs((prev) => {
      const nxt = new Set(prev);
      if (nxt.has(id)) nxt.delete(id);
      else {
        nxt.add(id);
        // if category was selected, remove it
        if (selectedCategories.has(category)) {
          const yrs = new Set(selectedCategories);
          yrs.delete(category);
          setSelectedCategories(yrs);
        }
      }
      return nxt;
    });
  };

  const openDeleteModal = (type) => {
    if (type === "category" && selectedCategories.size === 0) {
      toast.error("Select at least one category to delete.");
      return;
    }
    if (type === "pdf" && selectedPdfs.size === 0) {
      toast.error("Select at least one PDF to delete.");
      return;
    }
    setDeleteType(type);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteType === "category") {
      setTempData((prev) =>
        prev.filter((it) => !selectedCategories.has(it.category)),
      );
      setActiveCategory((a) => {
        if (selectedCategories.has(a)) {
          const remainingCats = [
            ...new Set(
              tempData
                .filter((i) => !selectedCategories.has(i.category))
                .map((i) => i.category),
            ),
          ];
          return remainingCats.length > 0 ? remainingCats[0] : null;
        }
        return a;
      });
      setSelectedCategories(new Set());
    } else if (deleteType === "pdf") {
      setTempData((prev) => prev.filter((it) => !selectedPdfs.has(it.id)));
      setSelectedPdfs(new Set());
    }
    setShowDeleteModal(false);
    setIsDirty(true);
  };

  const handleAddYear = () => {
    if (!newYearInput.trim()) {
      toast.error("Enter year to add.");
      return;
    }

    const year = newYearInput.trim();

    if (categories.includes(year)) {
      toast.error(`Year ${year} already exists!`);
      return;
    }

    const newItem = {
      id: makeUid(`rh-${year}-0`),
      category: year,
      name: "",
      pdf_path: "",
      isNew: true, // ⭐
    };

    setTempData((prev) => [...prev, newItem]);
    setActiveCategory(year);
    setIsDirty(true);
    setAddingYear(false);
    setNewYearInput("");
  };

  // Keep changes in sync when pendingData changes
  useEffect(() => {
    if (pendingData) setChanges(getChanges());
    else setChanges([]);
  }, [pendingData, originalData]);

  // UI rendering guards
  if (!Array.isArray(tempData)) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  // list of unique categories (keep original order if possible)
  const categories = Array.from(new Set(tempData.map((i) => i.category)));

  return (
    <div className="p-6 mt-4 pb-10 w-full min-h-[100vh]">
      <ToastContainer position="bottom-right" autoClose={2000} />
      <div className="relative mb-6 w-full">
        <h2 className="text-4xl text-brwn dark:text-drkt font-bold text-center">
          Rank list UG & PG
        </h2>

        {!isEditing && (
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim transition"
            >
              <Pencil size={18} /> Edit
            </button>
          </div>
        )}
      </div>

      {/* Category buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {categories.map((cat) => (
          <div key={cat} className="flex flex-col items-center relative">
            <button
              onClick={() => handleCategoryClick(cat)}
              className={`px-6 py-3 font-semibold rounded-xl hover:text-prim transition-all
                ${activeCategory === cat ? "bg-[#800000] text-prim" : "bg-secd dark:bg-drks"}
                hover:bg-[#a00000] ${selectedCategories.has(cat) ? "opacity-60 cursor-not-allowed" : ""}`}
              disabled={selectedCategories.has(cat)}
            >
              {cat}
            </button>

            {isEditing && (
              <div className="absolute -top-3 -right-3 z-10">
                <input
                  type="checkbox"
                  checked={selectedCategories.has(cat)}
                  disabled={(groupedByCategory[cat] || []).some((p) =>
                    selectedPdfs.has(p.id),
                  )}
                  onChange={(e) => {
                    e.stopPropagation();
                    const nxt = new Set(selectedCategories);
                    if (nxt.has(cat)) nxt.delete(cat);
                    else {
                      nxt.add(cat);
                      const nxtPdfs = new Set(selectedPdfs);
                      (groupedByCategory[cat] || []).forEach((pdf) =>
                        nxtPdfs.delete(pdf.id),
                      );
                      setSelectedPdfs(nxtPdfs);
                      setActiveCategory(null);
                    }
                    setSelectedCategories(nxt);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="h-5 w-5"
                />
              </div>
            )}
          </div>
        ))}
        {isEditing && !addingYear && (
          <button
            onClick={() => setAddingYear(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim transition"
          >
            <Plus size={18} /> Add Year
          </button>
        )}

        {isEditing && addingYear && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newYearInput}
              onChange={(e) => setNewYearInput(e.target.value)}
              placeholder="Enter Year"
              className="px-2 py-1 border rounded"
            />
            <button
              onClick={handleAddYear}
              className="bg-[#fdcc03] px-3 py-1 rounded"
            >
              Add
            </button>
            <button
              onClick={() => {
                setAddingYear(false);
                setNewYearInput("");
              }}
              className="bg-gray-400 text-white px-3 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Add Category button - optional (not adding UI to create new category name here) */}
      </div>

      {/* Show PDFs for selected category */}
      {activeCategory && groupedByCategory[activeCategory] && (
        <div className="relative border p-8 mt-6 w-[94%] mx-auto bg-prim dark:bg-drkp shadow-lg rounded-lg">
          <h3 className="text-xl font-bold mb-4 text-center">
            {activeCategory}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groupedByCategory[activeCategory].map((pdf) => (
              <div key={pdf.id} className="relative">
                <div className="flex justify-between items-center mb-2">
                  {pdf.isNew && isEditing ? (
                    <input
                      type="text"
                      placeholder="Enter Course Name (Ex: MBA)"
                      value={pdf.name}
                      onChange={(e) =>
                        setTempData((prev) =>
                          prev.map((it) =>
                            it.id === pdf.id
                              ? { ...it, name: e.target.value }
                              : it,
                          ),
                        )
                      }
                      className="border px-2 py-1 rounded w-full"
                    />
                  ) : (
                    <h4 className="font-semibold">{pdf.name}</h4>
                  )}
                  {isEditing && (
                    <input
                      type="checkbox"
                      checked={selectedPdfs.has(pdf.id)}
                      onChange={() => toggleSelectPdf(pdf.id, pdf.category)}
                      className="w-5 h-5 ml-2"
                    />
                  )}
                </div>

                {isEditing && (
                  <div className="mb-4 text-center">
                    <label className="bg-[#fdcc03] text-text px-3 py-2 rounded cursor-pointer hover:bg-[#800000] hover:text-prim transition">
                      {pdf.pdf_path ? "Change PDF" : "Upload PDF"}
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
                  <embed
                    src={
                      pdf.pdf_path.startsWith("blob:")
                        ? pdf.pdf_path
                        : UrlParser(pdf.pdf_path)
                    }
                    type="application/pdf"
                    width="100%"
                    height="500px"
                    className="border rounded"
                  />
                ) : (
                  <div className="border rounded h-[500px] flex items-center justify-center bg-gray-100">
                    <span className="text-gray-500">No PDF uploaded</span>
                  </div>
                )}
              </div>
            ))}

            {/* Add PDF card */}
            {isEditing && groupedByCategory[activeCategory].length < 2 && (
              <div
                className="border-2 border-dashed rounded-lg h-[500px] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100"
                onClick={() => handleAddPdf(activeCategory)}
              >
                <Plus size={48} className="text-gray-400 mb-2" />
                <span className="text-gray-500">Add PDF</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete buttons when editing */}
      {isEditing && (
        <div className="flex justify-center gap-4 mt-6">
          {selectedCategories.size > 0 && (
            <button
              onClick={() => openDeleteModal("category")}
              className="px-4 py-2 flex items-center gap-2 bg-red-500 text-prim rounded hover:bg-red-600"
            >
              <Trash2 size={18} /> Delete {selectedCategories.size} Category
              {selectedCategories.size > 1 ? "s" : ""}
            </button>
          )}
          {selectedPdfs.size > 0 && (
            <button
              onClick={() => openDeleteModal("pdf")}
              className="px-4 py-2 flex items-center gap-2 bg-red-500 text-prim rounded hover:bg-red-600"
            >
              <Trash2 size={18} /> Delete {selectedPdfs.size} PDF
              {selectedPdfs.size > 1 ? "s" : ""}
            </button>
          )}
        </div>
      )}

      {/* Save / Cancel (when editing) */}
      {isEditing && (
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          {isDirty && (
            <button
              onClick={handleSaveAsDraft}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim transition"
            >
              Save
            </button>
          )}
        </div>
      )}

      {/* Saved draft actions */}
      {isSaved && (
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleDiscardDraft}
            className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-600 transition"
          >
            Discard Changes
          </button>
          {changes.length > 0 && (
            <button
              onClick={() => {
                setShowRequestModal(true);
                setChanges(getChanges());
              }}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim transition"
            >
              <Send size={18} /> Request
            </button>
          )}
        </div>
      )}

      {/* Final Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-text/70 flex items-center justify-center z-[1000]">
          <div className="bg-prim p-6 rounded-xl w-[700px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Final Request
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the
              superior admin.
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
                          onClick={() =>
                            revertChange(ch.rowId, ch.isCategoryDelete)
                          }
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
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              {deleteType === "category"
                ? selectedCategories.size
                : selectedPdfs.size}{" "}
              {deleteType === "category" ? "category" : "PDF"}
              {deleteType === "category"
                ? selectedCategories.size > 1
                  ? "s"
                  : ""
                : selectedPdfs.size > 1
                  ? "s"
                  : ""}
              ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-400 rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-prim rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
