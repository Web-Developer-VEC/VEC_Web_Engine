import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import Carousel from "./Events";

function AdminEditableCarousel({ data }) {
  const [editMode, setEditMode] = useState(false);
  const [rows, setRows] = useState(data);
  const [originalRows, setOriginalRows] = useState(data);
  const [selected, setSelected] = useState([]);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState(false);

  // ✅ handle checkbox selection
  const toggleSelect = (index) => {
    setSelected((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
    setUnsavedChanges(true);
  };

  // ✅ handle value change
  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
    setUnsavedChanges(true);
  };

  // ✅ delete selected rows
  const handleDelete = () => {
    const updated = rows.filter((_, i) => !selected.includes(i));
    setRows(updated);
    setSelected([]);
    setUnsavedChanges(true);
  };

  // ✅ save temporary changes
  const handleSave = () => {
    setSaved(true);
    setUnsavedChanges(false);
  };

  // ✅ discard changes
  const handleDiscard = () => {
    setRows(originalRows);
    setUnsavedChanges(false);
    setSaved(false);
    setSelected([]);
    setEditMode(false);
  };

  return (
    <div className="relative">
      {/* 🔹 Top Right Edit Button */}
      {!editMode && !saved && (
        <button
          className="absolute top-4 right-4 px-4 py-2 bg-blue-500 text-white rounded z-[100]"
          onClick={() => setEditMode(true)}
        >
          Edit
        </button>
      )}

      {/* 🔹 Normal Carousel */}
      {!editMode ? (
        <Carousel data={rows} />
      ) : (
        <div className="p-4">
          {/* Editable Table */}
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th>Select</th>
                {Object.keys(rows[0]).map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t">
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(i)}
                      onChange={() => toggleSelect(i)}
                    />
                  </td>
                  {Object.keys(row).map((field) => (
                    <td key={field}>
                      <input
                        type="text"
                        value={row[field]}
                        onChange={(e) =>
                          handleChange(i, field, e.target.value)
                        }
                        className="border px-2 py-1 w-full"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-4">
            {!saved ? (
              <>
                <button
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded"
                >
                  Cancel
                </button>
                {unsavedChanges && (
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-500 text-white rounded"
                  >
                    Save
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={handleDiscard}
                  className="px-4 py-2 bg-gray-400 text-white rounded"
                >
                  Discard Changes
                </button>
                <button
                  onClick={() => setConfirmPopup(true)}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  Request
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 🔹 Final Request Popup */}
      {confirmPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white p-6 rounded-xl w-[450px]">
            <h2 className="text-xl font-bold mb-4">
              Final Request for the Changes
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior
              admin. Once approved, they will be applied automatically to the live
              site.
            </p>
            <div className="max-h-[200px] overflow-y-auto mb-4">
              {rows.length > 0 ? (
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Title</th>
                      <th>Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i}>
                        <td className="py-1">
                          <span className="text-blue-600">✎ Edited</span>
                        </td>
                        <td>{r.title}</td>
                        <td>{r.department}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No changes found.</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmPopup(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log("Final request sent!");
                  setConfirmPopup(false);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Final Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminEditableCarousel;