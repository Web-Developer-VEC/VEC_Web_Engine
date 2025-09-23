import React, { useState, useEffect } from "react";
import { Pencil, Save, Send, X, Trash2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadComp from "../../LoadComp";

const deepCopy = (v) => JSON.parse(JSON.stringify(v));

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

  useEffect(() => {
    if (data && data.length > 0) {
      const initial = { ...data[0], phone: String(data[0].phone || "") };
      setTempData(deepCopy(initial));
      setOriginalData(deepCopy(initial));
    }
  }, [data]);

  useEffect(() => {
    if (tempData && originalData) {
      setIsDirty(JSON.stringify(tempData) !== JSON.stringify(originalData));
    }
  }, [tempData, originalData]);

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
    if (field === "phone") value = value.toString();
    setTempData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!isDirty) {
      toast.info("No changes to save!");
      return;
    }

    const { name, designation, phone, gmail } = tempData;
    if (!name?.trim() || !designation?.trim() || !phone?.trim() || !gmail?.trim()) {
      toast.error("Please fill all fields before saving!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(gmail)) {
      toast.error("Please enter a valid email address!");
      return;
    }

    setPendingData(deepCopy(tempData));
    setIsSaved(true);
    setIsEditing(false);
    setIsDirty(false);
    toast.success("Changes saved as draft!");
  };

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

  const handleDiscard = () => {
    setTempData(deepCopy(originalData));
    setPendingData(null);
    setIsSaved(false);
    setIsDirty(false);
    toast.info("Changes discarded!");
  };

  const handleRequest = () => {
    setModalData(deepCopy(pendingData));
    setShowRequestModal(true);
  };

  const handleFinalRequestConfirm = () => {
    if (!modalData) return;
    setOriginalData(deepCopy(modalData));
    setTempData(deepCopy(modalData));
    setPendingData(null);
    setIsSaved(false);
    setShowRequestModal(false);
    toast.success("Final request submitted!");
  };

  const handleRevertChange = (field) => {
    if (!modalData || !originalData) return;

    // Revert the field value
    setModalData((prev) => ({ ...prev, [field]: originalData[field] }));

    // Also update pendingData to match
    setPendingData((prev) => {
      if (!prev) return null;
      const updated = { ...prev };
      updated[field] = originalData[field];
      return updated;
    });
  };

  const handleDeleteDraft = () => {
    setPendingData(null);
    setIsSaved(false);
    setTempData(deepCopy(originalData));
    setShowDeleteModal(false);
    toast.info("Draft deleted!");
  };

  // Compute modal changes dynamically
  const modalChanges = modalData
    ? Object.keys(modalData)
        .filter((key) => modalData[key] !== originalData[key])
        .map((key) => {
          let section = "";
          if (key === "name") section = "Name";
          else if (key === "designation") section = "Position";
          else if (key === "phone") section = "Mobile";
          else if (key === "gmail") section = "Email";
          return { section, field: key, old: originalData[key], new: modalData[key] };
        })
    : [];

    // Compute changes for main page (Request button)
const pendingChanges = pendingData
  ? Object.keys(pendingData).filter(
      (key) => pendingData[key] !== originalData[key]
    )
  : [];


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
    {field === "name"
      ? "Name:"
      : field === "designation"
      ? "Position:"
      : field === "phone"
      ? "Mobile:"
      : "Email:"}
  </span>
  {isEditing ? (
    <input
      type={field === "gmail" ? "email" : field === "phone" ? "number" : "text"}
      value={tempData?.[field] || ""}
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
    tempData?.[field]
  )}
</div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500"
          >
            Cancel
          </button>
          {isDirty && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
            >
              <Save size={18} /> Save
            </button>
          )}
        </div>
      )}

{!isEditing && pendingData && (
  <div className="flex justify-end gap-3 mt-6">
        <button
      onClick={handleDiscard}
      className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500"
    >
      Discard Changes
    </button>
    {pendingChanges.length > 0 && (
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
                      <td className="border p-2">{ch.old}</td>
                      <td className="border p-2">{ch.new}</td>
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
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 text-prim"
              >
                Cancel
              </button>
              {modalChanges.length > 0 && (
                <button
                  onClick={handleFinalRequestConfirm}
                  className="px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
                >
                  Final Request
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Draft Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-text/50 flex items-center justify-center z-50">
          <div className="bg-prim p-6 rounded-lg shadow-lg border w-[90%] max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your draft changes?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDraft}
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

export default IICContact;
