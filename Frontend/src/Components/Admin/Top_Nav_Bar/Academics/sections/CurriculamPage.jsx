import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { Send, Trash2 } from "react-feather";
import "./admin-CurriculumPage.css";
import LoadComp from "../../../LoadComp";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pencil } from "lucide-react";

const deepCopy = (v) => JSON.parse(JSON.stringify(v));

const CurriculumPage = ({ data }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const curriculamOrigFromProp =
    data?.find((item) => item.category === "curriculum")?.content || [];
  const [originalData, setOriginalData] = useState(deepCopy(curriculamOrigFromProp));

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [isChanged, setIsChanged] = useState(false);

  const [selectedItems, setSelectedItems] = useState([]);
  const [showMultiDeleteConfirm, setShowMultiDeleteConfirm] = useState(false);

  const [pendingData, setPendingData] = useState(null);
  const [pendingRequested, setPendingRequested] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    setOriginalData(deepCopy(curriculamOrigFromProp));
  }, [curriculamOrigFromProp]);

  useEffect(() => {
    if (!isEditing) {
      setEditedData(null);
      setIsChanged(false);
      setSelectedItems([]);
    }
  }, [isEditing, data]);

  const UrlParser = (pathOrFile) => {
    if (!pathOrFile) return null;
    if (typeof pathOrFile === "string") {
      return pathOrFile.startsWith("http") ? pathOrFile : `${BASE_URL}${pathOrFile}`;
    }
    if (pathOrFile instanceof File) {
      return URL.createObjectURL(pathOrFile);
    }
    return null;
  };

  const isValidForSave = (candidate) => {
    if (!candidate || !Array.isArray(candidate)) return false;

    for (let s = 0; s < candidate.length; s++) {
      const sec = candidate[s];
      if (!sec) return false;
      if (!sec.heading || String(sec.heading).trim() === "") return false;

      const list = sec.syllabus || [];
      if (!Array.isArray(list) || list.length === 0) return false;

      for (let i = 0; i < list.length; i++) {
        const row = list[i];
        if (!row) return false;
        if (!row.year || String(row.year).trim() === "") return false;
        // Accept existing pdf_path OR newly uploaded file
        if (!row.pdf_path && !row._uploadedFile) return false;
      }
    }

    return true;
  };

  const enterEdit = () => {
    const source = pendingData ? deepCopy(pendingData) : deepCopy(originalData);

    source.forEach((section) => {
      section.syllabus = section.syllabus || [];
      section.syllabus.forEach((s) => {
        if (!s._uploadedFile) s._uploadedFile = null;
        if (!s.pdf_path) s.pdf_path = s.pdf_path || "";
      });
    });
    setEditedData(source);
    setIsEditing(true);
    setIsChanged(false);
    setSelectedItems([]);
  };

  const cancelEdit = () => {
    setEditedData(null);
    setIsEditing(false);
    setIsChanged(false);
    setSelectedItems([]);
  };

  const discardPendingChanges = () => {
    setPendingData(null);
    setPendingRequested(false);
    setShowRequestModal(false);
    setIsEditing(false);
    setEditedData(null);
    setSelectedItems([]);
    setIsChanged(false);
    toast.error("Changes discarded.");
  };

  const handleInputChange = (sectionIndex, syllabusIndex, field, value) => {
    const updated = deepCopy(editedData);
    if (field === "heading") {
      updated[sectionIndex].heading = value;
    } else {
      updated[sectionIndex].syllabus[syllabusIndex][field] = value;
    }
    setEditedData(updated);
    setIsChanged(true);
  };

  const handleFileChange = (sectionIndex, syllabusIndex, file) => {
    if (!file) return;
    const updated = deepCopy(editedData);
    updated[sectionIndex].syllabus[syllabusIndex]._uploadedFile = file;
    updated[sectionIndex].syllabus[syllabusIndex].pdf_path = file.name;
    setEditedData(updated);
    setIsChanged(true);
  };

  const handleViewClick = (sectionIndex, syllabusIndex) => {
    const source = isEditing
      ? editedData?.[sectionIndex]?.syllabus?.[syllabusIndex]?._uploadedFile ||
        editedData?.[sectionIndex]?.syllabus?.[syllabusIndex]?.pdf_path
      : (pendingData?.[sectionIndex]?.syllabus?.[syllabusIndex]?.pdf_path ||
         originalData?.[sectionIndex]?.syllabus?.[syllabusIndex]?.pdf_path);
    const url = UrlParser(source);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    else toast.info("No PDF available to view.");
  };

  const toggleSelectItem = (sectionIndex, syllabusIndex) => {
    const key = `s-${sectionIndex}-l-${syllabusIndex}`;
    setSelectedItems((prev) => (prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]));
  };

  const confirmMultiDelete = () => {
    if (!editedData) return;
    const updated = deepCopy(editedData);
    const toRemove = selectedItems.map((k) => {
      const parts = k.split("-");
      return { sectionIndex: Number(parts[1]), syllabusIndex: Number(parts[3]) };
    });

    const grouped = {};
    toRemove.forEach(({ sectionIndex, syllabusIndex }) => {
      if (!grouped[sectionIndex]) grouped[sectionIndex] = [];
      grouped[sectionIndex].push(syllabusIndex);
    });

    Object.keys(grouped).forEach((secStr) => {
      const sec = Number(secStr);
      grouped[sec]
        .sort((a, b) => b - a)
        .forEach((idx) => {
          if (updated[sec] && updated[sec].syllabus && updated[sec].syllabus[idx]) {
            updated[sec].syllabus.splice(idx, 1);
          }
        });
    });

    setEditedData(updated);
    setSelectedItems([]);
    setShowMultiDeleteConfirm(false);
    setIsChanged(true);
    toast.success("Selected items deleted from draft.");
  };

  const handleSingleDeleteWithConfirm = (sectionIndex, syllabusIndex) => {
    setSelectedItems([`s-${sectionIndex}-l-${syllabusIndex}`]);
    setShowMultiDeleteConfirm(true);
  };

  const handleSave = async () => {
    if (!editedData) return;
    if (!isValidForSave(editedData)) {
      toast.error("Please fill all mandatory fields (section heading, year, and attach PDF) before saving.");
      return;
    }

    const payload = deepCopy(editedData);
    const filesToUpload = [];
    payload.forEach((sec, sIdx) => {
      sec.syllabus?.forEach((sy, syIdx) => {
        if (sy._uploadedFile)
          filesToUpload.push({
            sectionIndex: sIdx,
            syllabusIndex: syIdx,
            file: sy._uploadedFile,
          });
      });
    });

    console.log("Payload (pending):", payload);
    console.log("Files to upload (demo):", filesToUpload);
    setPendingData(payload);
    setIsEditing(false);
    setEditedData(null);
    setIsChanged(false);
    toast.success("Draft saved (pending).");
  };
  const displayData = isEditing ? editedData || [] : pendingData || originalData || [];
  const getChanges = () => {
    const changes = [];
    const base = originalData || [];
    const target = pendingData || [];

    const maxSections = Math.max(base.length, target.length);
    for (let s = 0; s < maxSections; s++) {
      const baseSec = base[s];
      const tgtSec = target[s];

      if (!baseSec && tgtSec) {
        if (tgtSec.heading) {
          changes.push({
            action: "Added",
            section: tgtSec.heading,
            data: { heading: tgtSec.heading },
            path: { sec: s, idx: null },
          });
        }
        (tgtSec.syllabus || []).forEach((item, idx) => {
          changes.push({
            action: "Added",
            section: tgtSec.heading || `Section ${s + 1}`,
            data: item,
            path: { sec: s, idx },
          });
        });
        continue;
      }
      if (baseSec && !tgtSec) {
        if (baseSec.heading) {
          changes.push({
            action: "Deleted",
            section: baseSec.heading,
            data: { heading: baseSec.heading },
            path: { sec: s, idx: null },
          });
        }
        (baseSec.syllabus || []).forEach((item, idx) => {
          changes.push({
            action: "Deleted",
            section: baseSec.heading || `Section ${s + 1}`,
            data: item,
            path: { sec: s, idx },
          });
        });
        continue;
      }

      if (baseSec && tgtSec && baseSec.heading !== tgtSec.heading) {
        changes.push({
          action: "Updated",
          section: tgtSec.heading || `Section ${s + 1}`,
          data: { before: baseSec.heading, after: tgtSec.heading },
          path: { sec: s, idx: null },
        });
      }

      const baseList = baseSec?.syllabus || [];
      const tgtList = tgtSec?.syllabus || [];
      const maxRows = Math.max(baseList.length, tgtList.length);

      for (let i = 0; i < maxRows; i++) {
        const b = baseList[i];
        const t = tgtList[i];

        if (!b && t) {
          changes.push({
            action: "Added",
            section: tgtSec.heading || `Section ${s + 1}`,
            data: t,
            path: { sec: s, idx: i },
          });
          continue;
        }
        if (b && !t) {
          changes.push({
            action: "Deleted",
            section: baseSec.heading || `Section ${s + 1}`,
            data: b,
            path: { sec: s, idx: i },
          });
          continue;
        }
        if (b && t) {
          const bStr = JSON.stringify({ year: b.year, pdf_path: b.pdf_path });
          const tStr = JSON.stringify({ year: t.year, pdf_path: t.pdf_path });
          if (bStr !== tStr) {
            changes.push({
              action: "Updated",
              section: tgtSec.heading || `Section ${s + 1}`,
              data: { before: b, after: t },
              path: { sec: s, idx: i },
            });
          }
        }
      }
    }

    return changes;
  };

  const handleRevertChange = (change) => {
    if (!pendingData) return;
    const updated = deepCopy(pendingData);
    const base = originalData || [];

    const { action, path } = change;
    const sec = path?.sec;
    const idx = path?.idx;

    if (action === "Added") {

      if (idx === null) {
        if (updated[sec]) updated.splice(sec, 1);
      } else {
        if (updated[sec] && updated[sec].syllabus) updated[sec].syllabus.splice(idx, 1);
      }
    } else if (action === "Deleted") {
      if (idx === null) {
        if (base[sec]) {
          updated.splice(sec, 0, deepCopy(base[sec]));
        }
      } else {
        if (!updated[sec]) updated[sec] = { heading: base[sec]?.heading || "", syllabus: [] };
        if (!updated[sec].syllabus) updated[sec].syllabus = [];
        updated[sec].syllabus.splice(idx, 0, deepCopy(base[sec].syllabus[idx]));
      }
    } else if (action === "Updated") {
      if (idx === null) {
        if (base[sec]) updated[sec].heading = base[sec].heading;
      } else {
        if (base[sec] && base[sec].syllabus && updated[sec] && updated[sec].syllabus) {
          updated[sec].syllabus[idx] = deepCopy(base[sec].syllabus[idx]);
        }
      }
    }

    setPendingData(updated);
    toast.success("Change reverted in pending draft.");
  };

  const handleRequestConfirm = () => {
    console.log("Requesting approval for changes:", pendingData);
    setShowRequestModal(false);
    setPendingRequested(true);
    setPendingData(null);
    toast.success("Request sent");
  };

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <div className="containers mt-5 relative pb-28">
      {/* Toast container */}
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />

      {!isEditing && (
        <div style={{ position: "absolute", top: -50, right: 15, zIndex: 50 }}>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
            onClick={enterEdit}
          >
            <Pencil size={16} />
            <span>Edit</span>
          </button>
        </div>
      )}

      {displayData?.length > 0 ? (
        <div className="row">
          <div className="col-md-6">
            {displayData.map((req, sectionIndex) => (
              <div
                className="content-section bg-prim dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]"
                key={sectionIndex}
              >
                <h2 className="text-bold text-[24px] text-brwn dark:text-drkt mb-8">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={req?.heading || ""}
                        onChange={(e) =>
                          handleInputChange(sectionIndex, null, "heading", e.target.value)
                        }
                        className={`edit-input heading-input ${(!req?.heading || String(req.heading).trim() === "") && isChanged ? "input-invalid" : ""}`}
                        placeholder="Section heading (required)"
                      />
                      {(!req?.heading || String(req.heading).trim() === "") && isChanged && (
                        <div className="text-xs text-red-500 mt-1">Heading is required.</div>
                      )}
                    </>
                  ) : (
                    req?.heading
                  )}
                </h2>

                {req?.syllabus?.map((item, syllabusIndex) => (
                  <div
                    key={syllabusIndex}
                    className="row-item rounded-lg dark:bg-drkp border-0 dark:hover:bg-drks flex items-center justify-between"
                  >
                    {isEditing ? (
                      <div className="syllabus-row w-full">
                        <div className="syllabus-left">
                          <input
                            type="text"
                            className={`year-input ${(!item?.year || String(item.year).trim() === "") && isChanged ? "input-invalid" : ""}`}
                            value={item?.year || ""}
                            onChange={(e) =>
                              handleInputChange(sectionIndex, syllabusIndex, "year", e.target.value)
                            }
                            placeholder=""
                          />
                          {(!item?.year || String(item.year).trim() === "") && isChanged && (
                            <div className="text-xs text-red-500 mt-1"></div>
                          )}
                        </div>

                        <div className="syllabus-middle">
                          <label className="upload-label">
                            {item?.pdf_path ? "Replace" : "Upload *"}
                            <input
                              type="file"
                              accept="application/pdf"
                              className="hidden-file-input"
                              onChange={(e) =>
                                handleFileChange(sectionIndex, syllabusIndex, e.target.files[0] || null)
                              }
                            />
                          </label>
                          {/* validation message */}
                          {(!item?.pdf_path && !item?._uploadedFile) && isChanged && (
                            <div className="text-xs text-red-500 mt-1"></div>
                          )}
                        </div>

                        <div className="syllabus-actions">
                          <button
                            className="action-btn"
                            onClick={() => handleViewClick(sectionIndex, syllabusIndex)}
                            title="View"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(`s-${sectionIndex}-l-${syllabusIndex}`)}
                            onChange={() => toggleSelectItem(sectionIndex, syllabusIndex)}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <div className="R-years">{item?.year}</div>
                        <div className="options-container">
                          <button
                            className="options-btn text-text bg-secd dark:text-drkt dark:bg-drks hover:bg-accn hover:text-prim dark:hover:bg-brwn"
                            onClick={() => handleViewClick(sectionIndex, syllabusIndex)}
                          >
                            <FontAwesomeIcon icon={faEye} style={{ marginRight: "5px" }} />
                            View
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* If editing, allow adding a new syllabus row for that section */}
                {isEditing && (
                  <div style={{ marginTop: 8 }}>
                    <button
                      onClick={() => {
                        const updated = deepCopy(editedData);
                        updated[sectionIndex].syllabus = updated[sectionIndex].syllabus || [];
                        updated[sectionIndex].syllabus.push({ year: "", pdf_path: "", _uploadedFile: null });
                        setEditedData(updated);
                        setIsChanged(true);
                      }}
                      className="px-3 py-2 rounded bg-[#fdcc03] hover:bg-[#800000]"
                    >
                      + Add
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp />
        </div>
      )}

      {isEditing && selectedItems.length > 0 && (
        <div className="multi-delete-center justify-center">
          <button onClick={() => setShowMultiDeleteConfirm(true)} className="multi-delete-btn">
            <Trash2 size={16} /> Delete ({selectedItems.length})
          </button>
        </div>
      )}

      {/* bottom floating edit controls (Cancel left, Save right if changes AND valid) */}
      {isEditing && (
        <div
          style={{
            position: "absolute",
            right: 20,
            bottom: 20,
            display: "flex",
            gap: 12,
            zIndex: 60,
          }}
        >
          <button
            onClick={cancelEdit}
            className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
          >
            Cancel
          </button>

          {/* Save button only appears when there are changes AND mandatory fields are filled */}
          {isChanged && editedData && isValidForSave(editedData) && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
            >
              Save
            </button>
          )}
        </div>
      )}

      {/* After saving (pendingData exists) show Discard + Request buttons bottom-right when NOT editing */}
      {!isEditing && pendingData && (
        <div
          className="pending-actions"
          style={{
            position: "absolute",
            right: 20,
            bottom: 20,
            display: "flex",
            gap: 12,
            zIndex: 60,
          }}
        >
          <button
            onClick={discardPendingChanges}
            className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
          >
            Discard Changes
          </button>

          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
          >
            <Send size={16} />
            Request
          </button>
        </div>
      )}

      {/* Multi-delete confirm modal */}
      {showMultiDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[350px]">
            <h2 className="text-lg font-bold mb-4 text-center">Confirm Delete</h2>
            <p className="text-sm mb-4 text-center">
              Are you sure you want to delete {selectedItems.length} item
              {selectedItems.length > 1 ? "s" : ""}?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowMultiDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmMultiDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Request Modal (your provided modal UI integrated) */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[600px]">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">Request</h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin. Once approved will go live.
            </p>

            <div className="max-h-[250px] overflow-y-auto mb-4">
              <table className="w-full text-center text-text dark:text-drkt border">
                <thead>
                  <tr className="bg-gray-200 dark:bg-drka">
                    <th className="py-1">Action</th>
                    <th className="py-1">Section</th>
                    <th className="py-1 text-center">Changes</th>
                  </tr>
                </thead>
                <tbody>
                  {getChanges().map((change, idx) => (
                    <tr key={idx} className="border-t">
                      {/* Action */}
                      <td
                        className={`py-1 ${
                          change.action === "Added" ? "text-green-600" : change.action === "Deleted" ? "text-red-600" : "text-blue-600"
                        }`}
                      >
                        {change.action}
                      </td>

                      {/* Section */}
                      <td className="py-1">{change.section || "Library Faculty"}</td>

                      {/* Data + revert button */}
                      <td className="py-1 text-[12px]">
                        <div className="flex items-center justify-center gap-2">
                          <span>
                            {change.action === "Updated"
                              ? change.data?.after?.year || change.data?.after?.pdf_path || "Updated"
                              : change.data?.year || change.data?.pdf_path || JSON.stringify(change.data)}
                          </span>
                          <button
                            onClick={() => handleRevertChange(change)}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {getChanges().length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-4">
                        No changes to request.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowRequestModal(false)} className="px-4 py-2 rounded bg-gray-400 text-white">
                Cancel
              </button>
              <button
                onClick={handleRequestConfirm}
                className="px-4 py-2 rounded bg-[#fdcc03] dark:drks hover:bg-[#800000] text-text hover:text-prim"
              >
                Final Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculumPage;
