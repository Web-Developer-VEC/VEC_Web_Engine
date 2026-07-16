// IICContact.jsx
import React, { useState, useEffect } from "react";
import { Pencil, Save, Send, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadComp from "../../LoadComp";
import { useAdminRequest } from "../../../hooks/useAdminRequest"; // must exist in your project

const deepCopy = (v) => JSON.parse(JSON.stringify(v));

/**
 * IICContact
 * Props:
 *  - data: expected array where data[0] contains contact object { name, designation, phone, gmail, ... }
 *
 * Behavior:
 *  - Edit -> allows editing the contact
 *  - Save -> stores draft (pendingData)
 *  - Cancel -> revert to draft (if present) or original
 *  - Discard Changes -> remove draft
 *  - Request -> open modal with field diffs; Final Request -> send payload to backend using useAdminRequest
 */
const IICContact = ({ data }) => {
  const [tempData, setTempData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [pendingData, setPendingData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // hook to send request to admin backend
  const { sendRequest, loading } = useAdminRequest();

  // initialize from incoming data
  useEffect(() => {
    if (data && data.length > 0) {
      // ensure phone stored as string for consistent editing
      const initial = {
        ...data[0],
        phone: data[0].phone !== undefined && data[0].phone !== null ? String(data[0].phone) : "",
      };
      setTempData(deepCopy(initial));
      setOriginalData(deepCopy(initial));
      setPendingData(null);
      setIsEditing(false);
      setIsDirty(false);
      setIsSaved(false);
    }
  }, [data]);

  // track dirty relative to original
  useEffect(() => {
    if (!tempData || !originalData) {
      setIsDirty(false);
      return;
    }
    setIsDirty(JSON.stringify(tempData) !== JSON.stringify(originalData));
  }, [tempData, originalData]);

  // helper: compute diffs between a source object and originalData
  const computeChanges = (source) => {
    if (!source || !originalData) return [];
    return Object.keys(source)
      .filter((k) => {
        return ["name", "designation", "phone", "gmail"].includes(k) && String(source[k]) !== String(originalData[k]);
      })
      .map((key) => {
        let section = "";
        if (key === "name") section = "Name";
        else if (key === "designation") section = "Position";
        else if (key === "phone") section = "Mobile";
        else if (key === "gmail") section = "Email";
        return { section, field: key, old: originalData[key], new: source[key] };
      });
  };

  // compute diffs for draft/pending (used to enable the Request button)
  const pendingChanges = computeChanges(pendingData);
  // compute diffs for modalData (used inside the modal)
  const modalChanges = computeChanges(modalData);

  // start editing: if draft exists, let user continue editing draft; else use original
  const handleEdit = () => {
    if (pendingData) {
      setTempData(deepCopy(pendingData));
      setIsSaved(true);
    } else {
      setTempData(deepCopy(originalData));
      setIsSaved(false);
    }
    setIsEditing(true);
    setIsDirty(false);
  };

  const handleChange = (e, field) => {
    let value = e.target.value;
    // keep phone as string while editing
    if (field === "phone") value = value.toString();
    setTempData((prev) => ({ ...prev, [field]: value }));
  };

  const validateContact = (obj) => {
    if (!obj) return false;
    const { name, designation, phone, gmail } = obj;
    if (!name?.toString().trim() || !designation?.toString().trim() || !phone?.toString().trim() || !gmail?.toString().trim()) {
      toast.error("Please fill all fields before saving!");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(gmail)) {
      toast.error("Please enter a valid email address!");
      return false;
    }
    return true;
  };

  // Save as draft
  const handleSave = () => {
    if (!isDirty) {
      return;
    }
    if (!validateContact(tempData)) return;

    setPendingData(deepCopy(tempData));
    setIsSaved(true);
    setIsEditing(false);
    setIsDirty(false);
  };

  // Cancel edits (if draft exists, go back to draft; else revert to original)
  const handleCancel = () => {
    if (pendingData) {
      setTempData(deepCopy(pendingData));
      setIsSaved(true);
    } else {
      setTempData(deepCopy(originalData));
      setIsSaved(false);
    }
    setIsEditing(false);
    setIsDirty(false);
  };

  // Discard draft entirely -> revert to original
  const handleDiscard = () => {
    setTempData(deepCopy(originalData));
    setPendingData(null);
    setIsSaved(false);
    setIsDirty(false);
  };

  // Open request modal; modalData is a copy of pendingData (draft) for UI manipulations
  const handleRequest = () => {
    if (!pendingData) {
      return;
    }
    setModalData(deepCopy(pendingData));
    setShowRequestModal(true);
  };

  // Revert a single field in modal (restores value from originalData)
  const handleRevertChange = (field) => {
    if (!modalData || !originalData) return;
    setModalData((prev) => ({ ...prev, [field]: originalData[field] }));
    setPendingData((prev) => {
      if (!prev) return prev;
      const updated = { ...prev };
      updated[field] = originalData[field];
      return updated;
    });
    // Also update tempData if not editing (or keep UI in sync)
    setTempData((prev) => (prev ? { ...prev, [field]: originalData[field] } : prev));
  };

  // Delete draft completely (via delete modal)
  const handleDeleteDraft = () => {
    setPendingData(null);
    setIsSaved(false);
    setTempData(deepCopy(originalData));
    setShowDeleteModal(false);
  };

  // Build payload exactly as your sample expects (single update item)
  const buildPayload = () => {
    if (!pendingData || !originalData) return null;

    // Convert phone back to number if numeric-looking
    const phoneValue = pendingData.phone;
    const phoneNum = phoneValue !== "" && !Number.isNaN(Number(phoneValue)) ? Number(phoneValue) : pendingData.phone;

    const payloadItem = {
      collectionName: "iic",
      collection_type: "contact",
      action: "update",
      title: "Update contact item",
      meta_data: {
        name: pendingData.name,
        designation: pendingData.designation,
        phone: phoneNum,
        gmail: pendingData.gmail,
      },
      original_data: {
        name: originalData.name,
        designation: originalData.designation,
        phone:
          originalData.phone !== undefined && originalData.phone !== null
            ? Number.isNaN(Number(originalData.phone))
              ? originalData.phone
              : Number(originalData.phone)
            : originalData.phone,
        gmail: originalData.gmail,
      },
    };

    return [payloadItem];
  };

  // Final Request: send payload with useAdminRequest
  const handleFinalRequestConfirm = async () => {
    if (!modalData) {
      return;
    }

    const payload = buildPayload();
    if (!payload || payload.length === 0) {
      setShowRequestModal(false);
      return;
    }

    try {
      // sendRequest(payloadArray, filesArray)
      const res = await sendRequest(payload, []);
      // accept multiple shapes for success (your hook may return true or an object)
      const ok = res === true || (res && (res.success === true || res.status === "ok" || res.status === "success"));
      if (ok) {
        // commit
        toast.success("Request sent successfully!");
        setOriginalData(deepCopy(modalData));
        setTempData(deepCopy(modalData));
        setPendingData(null);
        setIsSaved(false);
        setShowRequestModal(false);
        setIsEditing(false);
      } else {
        const errMsg = (res && (res.message || res.error)) || "Request failed. Check console for details.";
        console.error("IICContact request response:", res);
        // toast.error(errMsg);
      }
    } catch (err) {
      console.error("IICContact request error:", err);
    }
  };

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <div className="p-6 mt-4 pb-20">
      <ToastContainer position="bottom-right" autoClose={2000} />

      {/* Header with Edit button */}
      <div className="flex justify-end mb-4">
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
          >
            <Pencil size={18} /> Edit
          </button>
        )}
      </div>

      {/* Contact Card */}
      <div className="border-l-4 border-secd dark:border-drks rounded-2xl shadow-md p-6 max-w-md mx-auto my-10 dark:bg-drkb relative">
        <h2 className="text-[32px] font-bold text-center text-brwn dark:text-drkt mb-4">IIC Contact</h2>

        <div className="space-y-4 text-[16px]">
          {["name", "designation", "phone", "gmail"].map((field) => (
            <div key={field}>
              <span className="font-semibold block mb-1">
                {field === "name" ? "Name:" : field === "designation" ? "Position:" : field === "phone" ? "Mobile:" : "Email:"}
              </span>

              {isEditing ? (
                <input
                  type={field === "gmail" ? "email" : field === "phone" ? "text" : "text"}
                  value={tempData?.[field] ?? ""}
                  onChange={(e) => handleChange(e, field)}
                  className="border p-2 rounded w-full"
                  placeholder={field}
                />
              ) : field === "phone" ? (
                <a href={`tel:${tempData?.phone}`} className="dark:text-drka hover:underline">
                  {tempData?.phone}
                </a>
              ) : field === "gmail" ? (
                <a href={`mailto:${tempData?.gmail}`} className="dark:text-drka hover:underline">
                  {tempData?.gmail}
                </a>
              ) : (
                <div>{tempData?.[field]}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={handleCancel} className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500">
            Cancel
          </button>
          {isDirty && (
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim">
              <Save size={18} /> Save
            </button>
          )}
        </div>
      )}

      {/* When not editing and draft exists -> Discard + Request */}
      {!isEditing && pendingData && (
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={handleDiscard} className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500">
            Discard Changes
          </button>

          {pendingChanges.length > 0 ? (
            <button onClick={handleRequest} className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim">
              <Send size={18} /> Request
            </button>
          ) : (
            <button disabled className="px-4 py-2 rounded bg-gray-300 text-gray-600">
              No changes to request
            </button>
          )}
        </div>
      )}

      {/* Final Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-text/70 flex items-center justify-center z-[1000]">
          <div className="bg-prim p-6 rounded-xl w-[600px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Final Request</h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin.
            </p>

            {modalChanges.length > 0 ? (
              <table className="w-full text-center text-sm border">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border p-2">Section</th>
                    <th className="border p-2">Old Value</th>
                    <th className="border p-2">New Value</th>
                    <th className="border p-2">Undo</th>
                  </tr>
                </thead>
                <tbody>
                  {modalChanges.map((ch, i) => (
                    <tr key={i}>
                      <td className="border p-2 font-semibold">{ch.section}</td>
                      <td className="border p-2">{ch.old ?? "-"}</td>
                      <td className="border p-2">{ch.new ?? "-"}</td>
                      <td className="border p-2">
                        <button
                          onClick={() => handleRevertChange(ch.field)}
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
              <button onClick={() => setShowRequestModal(false)} className="px-4 py-2 rounded bg-gray-400 text-prim">
                Cancel
              </button>

              {modalChanges.length > 0 && (
                <button
                  onClick={handleFinalRequestConfirm}
                  disabled={loading}
                  className="px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
                >
                  {loading ? "Processing..." : "Final Request"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete draft confirm modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-text/50 flex items-center justify-center z-50">
          <div className="bg-prim p-6 rounded-lg shadow-lg border w-[90%] max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete your draft changes?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">
                Cancel
              </button>
              <button onClick={handleDeleteDraft} className="px-4 py-2 bg-red-600 text-prim rounded-lg hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IICContact;
