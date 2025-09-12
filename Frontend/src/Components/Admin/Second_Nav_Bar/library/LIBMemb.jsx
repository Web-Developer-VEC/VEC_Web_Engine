import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Save, ArrowDown, Plus } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadComp from "../../LoadComp";

const LIBMemb = ({ data }) => {
  const members = data.find(sec => sec.category === "Member Details")?.content || [];
  const books = data.find(sec => sec.category === "no_of_books")?.content || [];
  const cds = data.find(sec => sec.category === "periodical_back_volumes_cd")?.content || [];

  const [rows, setRows] = useState([]);

  useEffect(() => {
    const merged = members.map((m, idx) => ({
      member: m,
      book: books[idx],
      cd: cds[idx],
    }));
    setRows(merged);
  }, [data]);

  const [editRow, setEditRow] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [deleteIndex, setDeleteIndex] = useState(null);

  // For request flow
  const [showRequestButton, setShowRequestButton] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [changeSummary, setChangeSummary] = useState(null);

  const handleEdit = (idx) => {
    setEditRow(idx);
    setEditedValues(rows[idx]);
  };

  const handleSave = (idx) => {
    // ✅ Validation: show warning if any field is empty
    if (!editedValues.member || !editedValues.book || !editedValues.cd) {
      toast.warning("⚠️ All fields are required!");
      return;
    }

    const oldRow = rows[idx];
    const updated = [...rows];
    updated[idx] = editedValues;
    setRows(updated);
    setEditRow(null);

    // Save the changes summary for modal
    setChangeSummary({ old: oldRow, new: editedValues, index: idx + 1 });
    setShowRequestButton(true);
  };

  const confirmDelete = () => {
    const updated = rows.filter((_, i) => i !== deleteIndex);
    setRows(updated);
    setDeleteIndex(null);
  };

  const handleChange = (e, field) => {
    setEditedValues({ ...editedValues, [field]: e.target.value });
  };

  const handleRequestConfirm = () => {
    console.log("Final Request Submitted:", changeSummary);
    setShowRequestModal(false);
    setShowRequestButton(false);
  };

  const handleAddRow = () => {
    const newRow = { member: "", book: "", cd: "" };
    const updated = [...rows, newRow];
    setRows(updated);
    setEditRow(updated.length - 1); // put the last row in edit mode
    setEditedValues(newRow);
  };

  if (!data) {
    return (
      <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
        <LoadComp />
      </div>
    );
  }

  return (
    <div className="block overflow-x-auto px-4 sm:px-8 py-10 font-[Poppins] relative">
      {rows.length > 0 && (
        <>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#800000] text-center mb-8">
            Membership Details
          </h2>
          <div className="flex justify-center md:justify-start">
            <table className="lg:w-full w-[600px] mx-auto border border-gray-300 text-center text-sm relative">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2">S. No</th>
                  <th className="border p-2">Member Details</th>
                  <th className="border p-2">No. of Books</th>
                  <th className="border p-2">Periodical / Back Volume / CD</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border p-2">{idx + 1}</td>

                    <td className="border p-2">
                      {editRow === idx ? (
                        <input
                          className="border p-1 w-full"
                          value={editedValues.member}
                          onChange={(e) => handleChange(e, "member")}
                        />
                      ) : (
                        row.member
                      )}
                    </td>

                    <td className="border p-2">
                      {editRow === idx ? (
                        <input
                          className="border p-1 w-full"
                          value={editedValues.book}
                          onChange={(e) => handleChange(e, "book")}
                        />
                      ) : (
                        row.book
                      )}
                    </td>

                    <td className="border p-2">
                      {editRow === idx ? (
                        <input
                          className="border p-1 w-full"
                          value={editedValues.cd}
                          onChange={(e) => handleChange(e, "cd")}
                        />
                      ) : (
                        row.cd
                      )}
                    </td>

                    <td className="border p-2">
                      {editRow === idx ? (
                        <button
                          onClick={() => handleSave(idx)}
                          className="text-green-600"
                        >
                          <Save />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(idx)}
                            className="text-blue-600 mr-2"
                          >
                            
                          </button>
                          <button
                            onClick={() => setDeleteIndex(idx)}
                            className="text-red-600"
                          >
                            <Trash2 />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}

                {/* Add Row Button Row */}
                <tr>
                  <td colSpan="5" className="border p-2 text-center">
                    <button
                      onClick={handleAddRow}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500 mx-auto"
                    >
                      <Plus size={18} /> Add Row
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Request Button */}
          {showRequestButton && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowRequestModal(true)}
                className="px-6 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500"
              >
                Request
              </button>
            </div>
          )}

          {/* Delete Confirmation Popup */}
          {deleteIndex !== null && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                            bg-white p-6 rounded-lg shadow-lg border z-50 w-[90%] max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Confirm Delete
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this row?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteIndex(null)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* Request Modal */}
          {showRequestModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
              <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[530px]">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-drkt">
                  Final Request for the Changes
                </h2>
                <p className="text-sm text-red-500 mb-4">
                  Note: Your changes will stay pending until approved by the superior admin. 
                  Once approved, they will be applied automatically to the live site.
                </p>

                {changeSummary && (
                  <div className="max-h-[200px] overflow-y-auto mb-4">
                    <table className="w-full text-center text-gray-800 dark:text-drkt text-sm">
                      <thead>
                        <tr>
                          <th className="py-1">Action</th>
                          <th className="py-1">Row</th>
                          <th className="py-1 text-center">Changes</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-1 text-blue-600">Edited</td>
                          <td className="py-1">Row {changeSummary.index}</td>
                          <td className="py-1 text-[12px] flex flex-col items-center">
                            <span>{changeSummary.old.member} | {changeSummary.old.book} | {changeSummary.old.cd}</span>
                            <ArrowDown className="my-1" />
                            <span>{changeSummary.new.member} | {changeSummary.new.book} | {changeSummary.new.cd}</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="px-4 py-2 rounded bg-gray-400 text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestConfirm}
                    className="px-4 py-2 rounded bg-[#800000] text-white hover:bg-[#a00000]"
                  >
                    Final Request
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Toasts */}
          <ToastContainer position="bottom-right" autoClose={2000} />
        </>
      )}
    </div>
  );
};

export default LIBMemb;
