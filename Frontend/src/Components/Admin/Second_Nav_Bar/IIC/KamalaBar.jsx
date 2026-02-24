// KapilaPage.jsx
import React, { useState, useEffect } from "react";
import { Send, Trash2, Plus, Save, X, Pencil } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadComp from "../../LoadComp";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

const deepCopy = (arr) =>
  arr.map((item) => ({
    ...item,
    file: item.file || null, // ✅ preserve File reference
  }));


const KapilaPage = ({ data, title = "Kapila PDFs" }) => {
  const [activePdf, setActivePdf] = useState(null);
  const [tempData, setTempData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingData, setPendingData] = useState(null);
  const { sendRequest, loading: loadings , error } = useAdminRequest();

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  // Load initial data
  useEffect(() => {
    if (Array.isArray(data)) {
      const formattedData = data.map((item, idx) => ({
        id: item.id || Date.now() + idx,
        name: item.name || "",
        pdf_path: item.pdf_path || "",
        selected: false,
      }));
      setTempData(formattedData);
      setOriginalData(deepCopy(formattedData));
    }
  }, [data]);

  // ✅ Sync activePdf with tempData so edits update immediately
  useEffect(() => {
    if (activePdf) {
      const updated = tempData.find((x) => x.id === activePdf.id);
      if (updated) setActivePdf(updated);
    }
  }, [tempData]);

  const capitalizeWords = (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  };

  const handleButtonClick = (pdfObj) => setActivePdf(pdfObj);

  const handleEdit = () => {
    setIsEditing(true);
    setIsSaved(false);
    setIsDirty(false);
    setSelectedRows(new Set());
  };

const handleSave = () => {
  const invalidItem = tempData.find(
    (item) =>
      !item.name?.trim() ||
      (!item.pdf_path?.trim() && !item.file)
  );

  if (invalidItem) {
    toast.error("Please upload a PDF file for all items before saving!");
    return;
  }

  setPendingData(deepCopy(tempData));
  setIsSaved(true);
  setIsEditing(false);
  setIsDirty(false);
  setSelectedRows(new Set());
};



const handleCancel = () => {
  if (pendingData) {
    // ✅ If a draft exists, keep it and just revert current edits
    setTempData(deepCopy(pendingData));

    if (activePdf) {
      const resetPdf = pendingData.find((x) => x.id === activePdf.id);
      setActivePdf(resetPdf || null);
    }
  } else {
    // ❌ No draft yet → revert to original
    const resetData = deepCopy(originalData);
    setTempData(resetData);

    if (activePdf) {
      const resetPdf = resetData.find((x) => x.id === activePdf.id);
      setActivePdf(resetPdf || null);
    }
  }

  setIsEditing(false);
  setIsDirty(false);
  setSelectedRows(new Set());
  // Show discard/request buttons only if draft exists
  setIsSaved(!!pendingData);
};


  const handleDiscard = () => {
    setTempData(deepCopy(originalData));
    setPendingData(null);
    setIsSaved(false);
    setIsDirty(false);
    setSelectedRows(new Set());
    toast.info("Changes discarded!");
  };

  const handleRequest = () => setShowRequestModal(true);

const buildKapilaPayload = () => {
  if (!pendingData) return { payload: [], files: [] };

  const payload = [];
  const files = [];

  const originalMap = new Map(originalData.map((i) => [i.id, i]));
  const pendingMap = new Map(pendingData.map((i) => [i.id, i]));

  // INSERT & UPDATE
  for (const [id, newItem] of pendingMap.entries()) {
    const oldItem = originalMap.get(id);

    // final server path
    const serverPath = `/static/pdfs/iic/kapila/${newItem.file?.name || newItem.pdf_path?.split("/").pop()}`;

    // INSERT
    if (!oldItem) {
      payload.push({
        collectionName: "iic",
        collection_type: "kapila",
        action: "insert",
        title: "Insert kapila item",
        meta_data: {
          name: newItem.name,
          pdf_path: serverPath,
        },
      });

      if (newItem.file) files.push(newItem.file);
    }

    // UPDATE
    else if (
      oldItem.name !== newItem.name ||
      oldItem.pdf_path !== newItem.pdf_path
    ) {
      payload.push({
        collectionName: "iic",
        collection_type: "kapila",
        action: "update",
        title: "Update kapila item",
        meta_data: {
          name: newItem.name,
          pdf_path: serverPath,
        },
        original_data: {
          name: oldItem.name,
          path: oldItem.pdf_path,
        },
      });

      if (newItem.file) files.push(newItem.file);
    }
  }

  // DELETE
  for (const [id, oldItem] of originalMap.entries()) {
    if (!pendingMap.has(id)) {
      payload.push({
        collectionName: "iic",
        collection_type: "kapila",
        action: "delete",
        title: "Delete kapila item",
        meta_data: {
          name: oldItem.name,
          path: oldItem.pdf_path,
        },
      });
    }
  }

  return { payload, files };
};


const handleFinalRequestConfirm = async () => {
  if (!pendingData) return;

  const { payload, files } = buildKapilaPayload();

  if (payload.length === 0) {
    return;
  }

  console.log("📦 Payload:", payload);
  console.log("📁 Files:", files);
files.forEach((f, i) => {
  console.log(`File ${i}:`, f instanceof File, f?.name);
});

  try {
    const result = await sendRequest(payload, files);

    if (result) {
      setOriginalData(deepCopy(pendingData));
      setTempData(deepCopy(pendingData));
      setPendingData(null);
      setIsSaved(false);
      setShowRequestModal(false);
    }
  } catch (err) {
  }
};


  const handleChange = (index, key, value) => {
    setTempData((prev) => {
      const updated = [...prev];
      if (key === "name") value = capitalizeWords(value);
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
    setIsDirty(true);
  };

const handleFileChange = (index, file) => {
  const previewUrl = URL.createObjectURL(file);

  setTempData((prev) => {
    const updated = [...prev];
    updated[index] = {
      ...updated[index],
      pdf_path: previewUrl, // preview only
      file: file,           // ✅ REAL FILE
    };
    return updated;
  });

  setIsDirty(true);
};

const handleAddPdf = () => {
  const updated = [
    ...tempData,
    { id: Date.now(), name: "New pdf", pdf_path: "", selected: false },
  ];

  setTempData(updated);
  setIsDirty(hasRealChanges(updated, originalData));
};


  const toggleSelectRow = (index) => {
    const nxt = new Set(selectedRows);
    if (nxt.has(index)) nxt.delete(index);
    else nxt.add(index);
    setSelectedRows(nxt);
  };

  const hasRealChanges = (current, original) => {
  if (current.length !== original.length) return true;

  const map = new Map(original.map((i) => [i.id, i]));

  return current.some((item) => {
    const old = map.get(item.id);
    if (!old) return true;
    return (
      old.name !== item.name ||
      old.pdf_path !== item.pdf_path
    );
  });
};


const confirmDelete = () => {
  setTempData((prev) => {
    const updated = prev.filter((_, i) => !selectedRows.has(i));

    if (activePdf && !updated.some((item) => item.id === activePdf.id)) {
      setActivePdf(null);
    }

    // 🔥 FIX: recompute isDirty
    setIsDirty(hasRealChanges(updated, originalData));

    return updated;
  });

  setSelectedRows(new Set());
  setShowDeleteModal(false);
};


  // Compare by IDs, not index
  const getChanges = () => {
    if (!pendingData) return [];
    const changes = [];

    const originalMap = new Map(originalData.map((item) => [item.id, item]));
    const pendingMap = new Map(pendingData.map((item) => [item.id, item]));

    for (const [id, newItem] of pendingMap.entries()) {
      const oldItem = originalMap.get(id);
      if (!oldItem) {
        changes.push({ action: "Added", section: "PDF Details", changes: newItem.name, rowId: id });
      } else if (oldItem.name !== newItem.name || oldItem.pdf_path !== newItem.pdf_path) {
        changes.push({ action: "Edited", section: "PDF Details", changes: newItem.name, rowId: id });
      }
    }

    for (const [id, oldItem] of originalMap.entries()) {
      if (!pendingMap.has(id)) {
        changes.push({ action: "Deleted", section: "PDF Details", changes: oldItem.name, rowId: id });
      }
    }

    return changes;
  };

  const revertChange = (rowId) => {
    if (!pendingData) return;
    const oldItem = originalData.find((o) => o.id === rowId);
    let reverted;
    if (oldItem) {
      reverted = pendingData.map((item) =>
  item.id === rowId ? { ...oldItem, file: null } : item
);

    } else {
      const originalItem = originalData.find((o) => o.id === rowId);
      reverted = [...pendingData, deepCopy(originalItem)];
    }
    setPendingData(reverted);
    setTempData(deepCopy(reverted));
  };

  const changes = getChanges();

  if (!Array.isArray(data)) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <div className="p-6 mt-4 pb-20">
      <ToastContainer position="bottom-right" autoClose={2000} />

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-4xl text-brwn dark:text-drkt p-2 text-center font-bold">
          {/* {title} */}
        </h2>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
          >
            <Pencil size={18} />
            Edit
          </button>
        )}
      </div>

      {/* PDF Buttons */}
      <div className="flex flex-col md:flex-row justify-center gap-8 mb-6">
        {tempData.map((item, i) => (
          <div key={item.id} className="flex flex-col items-center relative">
            <button
              type="button"
              onClick={() => handleButtonClick(item)}
              className={`px-6 py-3 font-semibold rounded-xl hover:text-prim transition-all
                ${
                  activePdf?.id === item?.id
                    ? "bg-[#800000] text-prim"
                    : "bg-secd dark:bg-drks"
                }
                hover:bg-[#a00000]`}
            >
              {isEditing ? (
                <div className="relative uppercase">
                  <span>{item.name}</span>
                </div>
              ) : (
                item.name
              )}
              {isEditing && (
                <input
                  type="checkbox"
                  checked={selectedRows.has(i)}
                  onChange={() => toggleSelectRow(i)}
                  className="absolute top-0 right-0 w-5 h-5"
                />
              )}
            </button>
          </div>
        ))}
        {isEditing && (
          <button
            onClick={handleAddPdf}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
          >
            <Plus size={18} /> Add PDF
          </button>
        )}
      </div>

      {/* Show PDF */}
      {activePdf && (
        <div className="relative border p-8 mt-6 w-[94%] mx-auto bg-prim dark:bg-drkp shadow-lg rounded-lg">
          <h3 className="text-xl font-bold mb-4 text-center">
            {isEditing ? (
              <input
                type="text"
                placeholder="New pdf name"
                value={activePdf.name}
                onChange={(e) => {
                  const index = tempData.findIndex((x) => x.id === activePdf.id);
                  if (index !== -1) handleChange(index, "name", e.target.value.toUpperCase());
                }}
                className="border p-1 rounded text-center uppercase w-1/2"
              />
            ) : (
              activePdf.name
            )}
          </h3>

          {/* Change PDF in edit mode */}
          {isEditing && (
            <div className="mb-4 text-center">
              <label className="bg-[#fdcc03] text-text px-3 py-2 rounded cursor-pointer hover:bg-[#800000] hover:text-prim">
                Change PDF
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const fileURL = URL.createObjectURL(file);
                      const index = tempData.findIndex(
                        (x) => x.id === activePdf.id
                      );
                      if (index !== -1) {
                        handleFileChange(index, file);
                        setActivePdf((prev) => ({
                          ...prev,
                          pdf_path: fileURL,
                        }));
                      }
                    }
                  }}
                />
              </label>
            </div>
          )}

          <embed
            src={
              activePdf?.pdf_path?.startsWith("blob:")
                ? activePdf.pdf_path
                : UrlParser(activePdf?.pdf_path)
            }
            type="application/pdf"
            width="100%"
            height="600px"
            className="border rounded"
          />
        </div>
      )}

      {/* Action Buttons */}
      {isEditing && (
        <>
          <div className="flex justify-center pt-5">
            {selectedRows.size > 0 && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 flex items-center gap-2 bg-red-500 text-prim rounded hover:bg-red-600"
              >
                <Trash2 size={18} /> Delete Selected ({selectedRows.size})
              </button>
            )}
          </div>
          <div className="flex justify-between items-center mt-6">
            <div className="flex gap-3 items-right ml-auto">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500"
              >
                Cancel
              </button>
              {isDirty&& (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
                >
                   Save
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {isSaved && (
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleDiscard}
            className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500"
          >
            Discard Changes
          </button>
          {changes.length > 0 && (
            <button
              onClick={handleRequest}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
            >
              <Send size={18} /> Request
            </button>
          )}
        </div>
      )}

      {/* Final Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-text/70 flex items-center justify-center z-[1000]">
          <div className="bg-prim p-6 rounded-xl w-[600px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Final Request
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin.
                            Once approved will go on live.
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
                    <tr key={i}>
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
                className="px-4 py-2 rounded bg-gray-400 text-prim"
              >
                Cancel
              </button>
              {changes.length > 0 && (
                <button
  onClick={handleFinalRequestConfirm}
  disabled={loadings}
  className={`px-4 py-2 rounded flex items-center gap-2
    ${
      loadings
        ? "bg-gray-400 cursor-not-allowed text-white"
        : "bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
    }
  `}
>
  {loadings ? "Processing..." : "Final Request"}
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
              Are you sure you want to delete {selectedRows.size} selected PDF
              {selectedRows.size > 1 ? "s" : ""}?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-prim rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KapilaPage;
