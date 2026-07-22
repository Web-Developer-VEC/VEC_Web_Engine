import React, { useEffect, useState } from "react";
import "./admin-mou.css";
import LoadComp from "../../../LoadComp";
import { Pencil, Send, Trash2, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { useAdminRequest } from "../../../../hooks/useAdminRequest";
import "react-toastify/dist/ReactToastify.css";

const generateUid = () =>
  `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;

const addUids = (arr) =>
  (arr || []).map((it) => ({ ...it, __uid: it.__uid || generateUid() }));

const MOU = ({ data }) => {
  const initialDetails =
    data?.find((item) => item.category === "mous_details")?.content || [];

  const [deptId, setDeptId] = useState("");
  const [approvedDetails, setApprovedDetails] = useState(addUids(initialDetails));
  const [mousDetails, setMousDetails] = useState(addUids(initialDetails));
  const [editMode, setEditMode] = useState(false);
  const [tempDetails, setTempDetails] = useState(addUids(initialDetails));
  const [originalSnapshot, setOriginalSnapshot] = useState(addUids(initialDetails));
  const [hasChanges, setHasChanges] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showMultiDeleteConfirm, setShowMultiDeleteConfirm] = useState(false);
  const [savedOnce, setSavedOnce] = useState(false);
  const { sendRequest, loading } = useAdminRequest();

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

  // Extract dept_id from banner data
  useEffect(() => {
    const bannerData = data?.find((item) => item.category === "banner_name_and_image")?.content?.[0];
    if (bannerData?.dept_id) {
      setDeptId(bannerData.dept_id);
    }
  }, [data]);

  // Keep local states in sync if data prop changes
  useEffect(() => {
    const withUids = addUids(initialDetails);
    setApprovedDetails(withUids);
    setMousDetails(withUids);
    setTempDetails(withUids);
    setOriginalSnapshot(withUids);
    setHasChanges(false);
    setSavedOnce(false);
    setSelectedItems([]);
  }, [data]); // eslint-disable-line

  const openEdit = () => {
    setOriginalSnapshot(addUids(mousDetails));
    setTempDetails(addUids(mousDetails));
    setEditMode(true);
    setHasChanges(false);
  };

  const handleEdit = () => {
    openEdit();
  };

  const handleCancel = () => {
    // revert only this editing session to originalSnapshot
    setTempDetails(addUids(originalSnapshot));
    setEditMode(false);
    setHasChanges(false);
    setSelectedItems([]);
    // DO NOT clear savedOnce here — so previously-saved pending remains
  };
  const validateFields = () => {
  for (let i = 0; i < tempDetails.length; i++) {
    const row = tempDetails[i];

    if (!row.ORGANISATION_NAME?.trim()) {
      toast.error(`Row ${i + 1}: Organisation Name is required.`);
      return false;
    }

    if (!row.MONTH_AND_YEAR?.trim()) {
      toast.error(`Row ${i + 1}: Start Date is required.`);
      return false;
    }

    if (!row.VALIDITY?.trim()) {
      toast.error(`Row ${i + 1}: End Date is required.`);
      return false;
    }
  }

  return true;
};

  const handleSave = () => {
  if (!validateFields()) return;
  const cleaned = addUids(tempDetails);
  setMousDetails(cleaned);
  setHasChanges(false);
  setSavedOnce(true);
  setEditMode(false);
  setSelectedItems([]);
};

  const handleDiscard = () => {
    // Revert everything back to last approved (live) data
    const approvedCopy = addUids(approvedDetails);
    setMousDetails(approvedCopy);
    setTempDetails(approvedCopy);
    setOriginalSnapshot(approvedCopy);
    setHasChanges(false);
    setEditMode(false);
    setSelectedItems([]);
    setSavedOnce(false);
  };

  const handleChange = (index, field, value) => {
    const updated = [...tempDetails];
    updated[index] = { ...(updated[index] || {}), [field]: value, __uid: updated[index]?.__uid || generateUid() };
    setTempDetails(updated);
    setHasChanges(true);
  };

  const handleCheckbox = (index) => {
    setSelectedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleDeleteSelected = () => {
    // Remove selected rows from tempDetails - they'll appear as Deleted in diff
    const updated = tempDetails.filter((_, idx) => !selectedItems.includes(idx));
    setTempDetails(updated);
    setSelectedItems([]);
    setHasChanges(true);
    setShowMultiDeleteConfirm(false);
  };

  const handleAddRow = () => {
    const newRow = { ORGANISATION_NAME: "", MONTH_AND_YEAR: "", VALIDITY: "", __uid: generateUid() };
    if (!editMode) {
      // start editing with current mousDetails + new row
      setOriginalSnapshot(addUids(mousDetails));
      setTempDetails([...mousDetails.map((r) => ({ ...r })), newRow]);
      setEditMode(true);
      setHasChanges(true);
      return;
    }
    setTempDetails((prev) => [...prev.map((r) => ({ ...r })), newRow]);
    setHasChanges(true);
  };

  // produce changes between approvedDetails and tempDetails
  const getChanges = () => {
    const ap = approvedDetails || [];
    const tmp = tempDetails || [];

    const mapApproved = new Map(ap.map((r) => [r.__uid, r]));
    const mapTemp = new Map(tmp.map((r) => [r.__uid, r]));

    const changes = [];

    // Added or Edited in temp
    for (const t of tmp) {
      if (!mapApproved.has(t.__uid)) {
        changes.push({ action: "Added", section: "MOU", data: t });
      } else {
        const a = mapApproved.get(t.__uid);
        const isEdited =
          (a.ORGANISATION_NAME || "").trim() !== (t.ORGANISATION_NAME || "").trim() ||
          (a.MONTH_AND_YEAR || "").trim() !== (t.MONTH_AND_YEAR || "").trim() ||
          (a.VALIDITY || "").trim() !== (t.VALIDITY || "").trim();
        if (isEdited) {
          changes.push({ action: "Edited", section: "MOU", data: { before: a, after: t } });
        }
      }
    }

    // Deleted: present in approved but not in temp
    for (const a of ap) {
      if (!mapTemp.has(a.__uid)) {
        changes.push({ action: "Deleted", section: "MOU", data: a });
      }
    }

    return changes;
  };

  const handleRequestConfirm = async () => {
    if (!validateFields()) return;

    const payload = buildPayload();

    if (payload.length === 0) {
      toast.error("No changes to submit!");
      return;
    }

    console.log("Payload:", payload);

    const result = await sendRequest(payload, null);

    if (result) {
      const updatedApproved = addUids(tempDetails); 
      
      setApprovedDetails(updatedApproved);
      setMousDetails(updatedApproved);
      setTempDetails(updatedApproved);
      setOriginalSnapshot(updatedApproved);

      setShowRequestModal(false);
      setEditMode(false);
      setHasChanges(false);
      setSelectedItems([]);
      setSavedOnce(false);
    }
  };

  const buildPayload = () => {
    const payload = [];
    const collectionName = deptMap[deptId] || "UNKNOWN";
    const changes = getChanges();

    for (const change of changes) {
      if (change.action === "Added") {
        payload.push({
          collectionName,
          collection_type: "mous",
          action: "insert",
          title: "Insertion of MOU",
          category: "mous_details",
          meta_data: {
            ORGANISATION_NAME: change.data?.ORGANISATION_NAME || "",
            MONTH_AND_YEAR: change.data?.MONTH_AND_YEAR || "",
            VALIDITY: change.data?.VALIDITY || ""
          },
          original_data: null
        });
      } else if (change.action === "Edited") {
        payload.push({
          collectionName,
          collection_type: "mous",
          action: "update",
          title: "Updation of MOU",
          category: "mous_details",
          meta_data: {
            ORGANISATION_NAME: change.data?.after?.ORGANISATION_NAME || "",
            MONTH_AND_YEAR: change.data?.after?.MONTH_AND_YEAR || "",
            VALIDITY: change.data?.after?.VALIDITY || ""
          },
          original_data: {
            ORGANISATION_NAME: change.data?.before?.ORGANISATION_NAME || "",
            MONTH_AND_YEAR: change.data?.before?.MONTH_AND_YEAR || "",
            VALIDITY: change.data?.before?.VALIDITY || ""
          }
        });
      } else if (change.action === "Deleted") {
        payload.push({
          collectionName,
          collection_type: "mous",
          action: "delete",
          title: "Deletion of MOU",
          category: "mous_details",
          meta_data: {
            ORGANISATION_NAME: change.data?.ORGANISATION_NAME || "",
            MONTH_AND_YEAR: change.data?.MONTH_AND_YEAR || "",
            VALIDITY: change.data?.VALIDITY || ""
          },
          original_data: null
        });
      }
    }

    return payload;
  };

  const removeChangeEntry = (idx) => {
    const changes = getChanges();
    const entry = changes[idx];
    if (!entry) return;

    if (entry.action === "Added") {
      setTempDetails((prev) => prev.filter((r) => r.__uid !== entry.data.__uid));
    } else if (entry.action === "Deleted") {
      setTempDetails((prev) => [...prev, entry.data]);
    } else if (entry.action === "Edited") {
      const uid = entry.data.before.__uid;
      setTempDetails((prev) => prev.map((r) => (r.__uid === uid ? entry.data.before : r)));
    }
    setHasChanges(true);
  };

  const columnsCount = editMode ? 5 : 4;

  return (
    <div className="mou-page relative">
      {mousDetails?.length >= 0 ? (
        <>
          <div className="mou-header flex justify-between items-center">
            <h1 className="text-accn dark:text-drkt font-bold">
              Memorandum of Understanding (MOU)
            </h1>
            {!editMode && !hasChanges && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
              >
                <Pencil size={16} /> Edit
              </button>
            )}
          </div>

          <div className="mou-details">
            <div className="mou-table-container">
              <table className="mou-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Name of Organisation</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    {editMode && <th>Select</th>}
                  </tr>
                </thead>
                <tbody>
                  {(editMode || savedOnce ? tempDetails : mousDetails)?.map(
                    (detail, index) => (
                      <tr key={detail.__uid || index}>
                        <td>{index + 1}</td>
                        <td>
                          {editMode ? (
                            <input
                              type="text"
                              value={detail?.ORGANISATION_NAME || ""}
                              onChange={(e) =>
                                handleChange(index, "ORGANISATION_NAME", e.target.value)
                              }
                              className="border px-2 py-1 rounded"
                            />
                          ) : (
                            detail?.ORGANISATION_NAME
                          )}
                        </td>
                        <td>
                          {editMode ? (
                            <input
                              type="text"
                              value={detail?.MONTH_AND_YEAR || ""}
                              onChange={(e) =>
                                handleChange(index, "MONTH_AND_YEAR", e.target.value)
                              }
                              className="border px-2 py-1 rounded"
                            />
                          ) : (
                            detail?.MONTH_AND_YEAR
                          )}
                        </td>
                        <td>
                          {editMode ? (
                            <input
                              type="text"
                              value={detail?.VALIDITY || ""}
                              onChange={(e) =>
                                handleChange(index, "VALIDITY", e.target.value)
                              }
                              className="border px-2 py-1 rounded"
                            />
                          ) : detail?.VALIDITY ? (
                            detail?.VALIDITY
                          ) : (
                            <span className="text-center">-</span>
                          )}
                        </td>
                        {editMode && (
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(index)}
                              onChange={() => handleCheckbox(index)}
                            />
                          </td>
                        )}
                      </tr>
                    )
                  )}
                </tbody>

                {/* Add New Row as last row inside table border - shown only in edit mode */}
                {editMode && (
                  <tfoot>
                    <tr className="add-row-tr">
                      <td colSpan={columnsCount} className="add-row-td">
                        <button onClick={handleAddRow} className="add-row-btn-inside">
                          + Add New Row
                        </button>
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Centered multi-delete button (shows only in edit mode when items selected) */}
          {editMode && selectedItems.length > 0 && (
            <div className="multi-delete-center">
              <button
                onClick={() => setShowMultiDeleteConfirm(true)}
                className="multi-delete-btn"
              >
                <Trash2 size={16} /> Delete ({selectedItems.length})
              </button>
            </div>
          )}

          {/* Action bar placed after table so it doesn't overlap content */}
          <div className="action-bar">
            <div className="action-left" />

            <div className="action-right">
              {editMode ? (
                <>
                  <button onClick={handleCancel} className="btn-cancel">
                    Cancel
                  </button>

                  {hasChanges && (
                    <button onClick={handleSave} className="btn-save">
                      Save
                    </button>
                  )}
                </>
              ) : savedOnce ? (
                <>
                  <button onClick={handleDiscard} className="btn-cancel">
                    Discard Changes
                  </button>
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="btn-save inline-flex items-center gap-2 px-4 py-2 rounded"
                  >
                    <Send size={16} />Request
                  </button>
                </>
              ) : null}
            </div>
          </div>

          {/* Multi Delete Confirm */}
          {showMultiDeleteConfirm && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
              <div className="bg-white dark:bg-drkp p-6 rounded-xl">
                <h2 className="font-bold mb-4">Confirm Delete</h2>
                <p className="mb-4">
                  Are you sure you want to delete {selectedItems.length} items?
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowMultiDeleteConfirm(false)}
                    className="px-4 py-2 rounded bg-gray-400 text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    className="px-4 py-2 rounded bg-red-600 text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Final Request Modal */}
          {showRequestModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
              <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[600px]">
                <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
                  Request
                </h2>
                <p className="text-sm text-red-500 mb-4">
                  Note: Your changes will stay pending until approved by the superior admin.
                  Once approved will go live.
                </p>

                <div className="max-h-[350px] overflow-y-auto mb-4">
                  <table className="w-full text-center text-text dark:text-drkt border">
                    <thead>
                      <tr className="bg-gray-200 dark:bg-drka">
                        <th className="py-1">Action</th>
                        <th className="py-1">Section</th>
                        <th className="py-1 text-center">Changes</th>
                        <th className="py-1">Undo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getChanges().map((change, idx) => (
                        <tr key={idx} className="border-t">
                          <td
                            className={`py-1 ${change.action === "Added"
                                ? "text-green-600"
                                : change.action === "Deleted"
                                  ? "text-red-600"
                                  : "text-blue-600"
                              }`}
                          >
                            {change.action}
                          </td>
                          <td className="py-1">{change.section}</td>
                          <td className="py-1 text-[12px]">
                            <div className="flex flex-col items-start gap-1">
                              {change.action === "Edited" ? (
                                <>
                                  <div>
                                    {" "}
                                    {change.data.before?.ORGANISATION_NAME || "-"}
                                  </div>
                                </>
                              ) : (
                                <div>{change.data?.ORGANISATION_NAME || "-"}</div>
                              )}
                            </div>
                          </td>
                          <td className="py-1">
                            <button
                              onClick={() => removeChangeEntry(idx)}
                              className="text-red-500 hover:text-red-700 font-bold"
                            >
                              <X />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {getChanges().length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-sm">
                            No changes to request.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestConfirm}
                    disabled={loading}
                    className={`px-4 py-2 rounded bg-[#fdcc03] dark:drks hover:bg-[#800000] text-text hover:text-prim inline-flex items-center gap-2 ${loading ? 'cursor-progress' : ''}`}
                  >
                    <Send size={16} /> {loading ? "Processing..." : "Final Request"}
                  </button>
                </div>
              </div>
            </div>
          )}
          <ToastContainer position="bottom-right" autoClose={3000} />
        </>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp />
        </div>
      )}
    </div>
  );
};

export default MOU;
