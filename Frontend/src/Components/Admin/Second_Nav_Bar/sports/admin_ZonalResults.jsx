import React, { useState } from "react";
import LoadComp from "../../LoadComp";
import { Pencil, Trash2, Send, Plus, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ZonalResults = ({ data, year: initialYear }) => {
  const [editMode, setEditMode] = useState(false);
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showRequestButtons, setShowRequestButtons] = useState(false);
  const [changes, setChanges] = useState([]);
  
  
  const [results, setResults] = useState(
    Array.isArray(data)
    ? data.map((item) => ({
      game: item?.game || "",
      position: item?.position || "",
      selected: false,
    }))
    : []
  );
  const [originalResults, setOriginalResults] = useState(results);
    const positionOptions = ["Winner", "Runner", "Third"];

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  // Split results into pairs for desktop view
  const resultPairs = [];
  for (let i = 0; i < results.length; i += 2) {
    resultPairs.push([results[i], results[i + 1]]);
  }

 const handleInputChange = (index, field, value) => {
  const updatedResults = [...results];
  updatedResults[index][field] = value;
  setResults(updatedResults);

  const originalItem = originalResults[index];
  if (originalItem && originalItem[field] !== value) {
    setChanges((prev) => {
      const exists = prev.find(
        (c) => c.type === "updated" && c.index === index
      );
      if (exists) {
        return prev.map((c) =>
          c.index === index
            ? { ...c, fields: [...new Set([...c.fields, field])] }
            : c
        );
      }
      return [
        ...prev,
        {
          type: "updated",
          section: "Zonal Results",
          index,
          fields: [field],
        },
      ];
    });
  }
};
const handleRevertChange = (index) => {
  const change = changes[index];
  if (!change) return;

  if (change.type === "added") {
    setResults((prev) => prev.filter((r) => r !== change.data));
  } else if (change.type === "deleted") {
    // Restore deleted row
    setResults((prev) => [...prev, { game: "", position: "", selected: false }]);
  } else if (change.type === "updated") {
    const orig = originalResults[change.index];
    if (orig) {
      setResults((prev) =>
        prev.map((r, i) => (i === change.index ? orig : r))
      );
    }
  }

  setChanges((prev) => prev.filter((_, i) => i !== index));
};

  const handleSelectRow = (index) => {
    const updatedResults = [...results];
    updatedResults[index].selected = !updatedResults[index].selected;
    setResults(updatedResults);
  };

  const handleSave = () => {
    for (const row of results) {
      if (!row.game.trim() || !row.position.trim()) {
        toast.error("All fields are mandatory!");
        return;
      }
    }
    if (!currentYear) {
      toast.error("Year is mandatory!");
      return;
    }
    setEditMode(false);
    setShowRequestButtons(true);
    toast.success("Changes saved successfully!");
  };

 const handleDeleteSelected = () => {
  const deletedItems = results.filter((r) => r.selected);
  setResults(results.filter((r) => !r.selected));
  setChanges((prev) => [
    ...prev,
    ...deletedItems.map((d) => ({
      type: "deleted",
      section: "Zonal Results",
      fields: [`Game: ${d.game}, Position: ${d.position}`],
    }))
  ]);
  setShowDeleteModal(false);
  toast.success("Selected rows deleted successfully!");
};


const handleAddRow = () => {
  const newRow = { game: "", position: "", selected: false, isNew: true };
  setResults([...results, newRow]);
  setChanges((prev) => [
    ...prev,
    { type: "added", section: "Zonal Results", data: newRow }
  ]);
};


  const confirmDiscard = () => {
    setResults(
      Array.isArray(data)
        ? data.map((item) => ({
            game: item?.game || "",
            position: item?.position || "",
            selected: false,
          }))
        : []
    );
    setCurrentYear(initialYear);
    setShowRequestButtons(false);
    setShowDiscardModal(false);
    toast.info("Changes discarded!");
  };

  const selectedCount = results.filter((r) => r.selected).length;

  return (
    <div className="container3 mx-auto p-4 mb-6">
      {/* Edit Button */}
      <div className="admin-controls-ug flex justify-end mb-2">
        {!editMode && (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg mr-20"
            onClick={() =>{ setEditMode(true);
              setShowRequestButtons(true)
            }}
          >
            <Pencil size={16} /> Edit
          </button>
        )}
      </div>

      {/* Year Header */}
        <h1 className="md:text-4xl text-2xl font-bold text-accn dark:text-drkt text-center mb-4 sm:mb-6">
            {editMode ? (
              <input
                type="text"
                value={currentYear}
                onChange={(e) => setCurrentYear(e.target.value)}
                className="border px-2 py-1 rounded text-center w-25"
                placeholder="YYYY-YYYY"
              />
            ) : (
              `Zonal Results ${currentYear}`
            )}
        </h1>


      {/* Table */}
      {!editMode ? (
        <div className="hidden sm:block overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full table-auto text-sm sm:text-base">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4 text-left font-medium text-gray-700">
                  Game
                </th>
                <th className="py-2 px-4 text-left font-medium text-gray-700">
                  Position
                </th>
                <th className="py-2 px-4 text-left font-medium text-gray-700">
                  Game
                </th>
                <th className="py-2 px-4 text-left font-medium text-gray-700">
                  Position
                </th>
              </tr>
            </thead>
            <tbody>
              {resultPairs.map((pair, index) => (
                <tr key={index} className="border-t border-gray-200">
                  <td className="py-3 px-4 text-left">{pair[0]?.game}</td>
                  <td className="py-3 px-4 text-left">{pair[0]?.position}</td>
                  <td className="py-3 px-4 text-left">{pair[1]?.game}</td>
                  <td className="py-3 px-4 text-left">{pair[1]?.position}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Edit Mode: Single-column stacked layout for mobile/desktop
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full table-auto text-sm sm:text-base">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4 text-left font-medium text-gray-700">
                  Game
                </th>
                <th className="py-2 px-4 text-left font-medium text-gray-700">
                  Position
                </th>
                <th className="py-2 px-4 text-left font-medium text-gray-700">
                  Select
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((item, index) => (
                <tr key={index} className="border-t border-gray-200">
                  <td className="py-3 px-4 text-left">
                    <input
                      type="text"
                      value={item.game}
                      onChange={(e) =>
                        handleInputChange(index, "game", e.target.value)
                      }
                      className="border px-2 py-1 rounded w-full"
                      placeholder="Game"
                    />
                  </td>
                   <td className="py-3 px-4 text-left">
                    <select
                      value={item.position}
                      onChange={(e) =>
                        handleInputChange(index, "position", e.target.value)
                      }
                      className="border px-2 py-1 rounded w-full"
                    >
                      <option value="">Select Position</option>
                      {positionOptions.map((pos) => (
                        <option key={pos} value={pos}>
                          {pos}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-left">
                    <input
                      type="checkbox"
                      checked={item.selected || false}
                      onChange={() => handleSelectRow(index)}
                    />
                  </td>
                </tr>
              ))}
              <tr>
             <td colSpan={3} className="text-center py-3">
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={handleAddRow}
                    className="px-4 py-2 bg-yellow-400 text-white rounded flex items-center gap-2"
                  >
                    <Plus size={16} /> Add New Row
                  </button>

                  {selectedCount > 0 && (
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded flex items-center gap-2"
                    >
                      <Trash2 size={16} /> Delete ({selectedCount})
                    </button>
                  )}
                </div>
             </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Action Buttons */}
      {editMode && (
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => setEditMode(false)}
            className="px-4 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1 bg-[#800000] text-white rounded"
          >
            Save
          </button>
        </div>
      )}

      {/* Request/Discard Buttons */}
      {showRequestButtons && !editMode && (
        <div className="flex justify-end gap-3 mt-6 mb-4">
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded"
            onClick={() => confirmDiscard(true)}
          >
            Discard Changes
          </button>
          <button
            className="px-4 py-2 bg-yellow-400 text-white rounded flex items-center gap-2"
            onClick={() => setShowRequestModal(true)}
          >
            <Send size={16} /> Request
          </button>
        </div>
      )}

      {/* Modals */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[350px]">
            <h2 className="font-semibold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete the selected items?</p>
            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button> <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={handleDeleteSelected}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showRequestModal && (
       <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white p-6 rounded-xl w-[600px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl text-center font-bold mb-4 text-gray-800">
              Final Request
            </h2>
            <p className="text-sm text-red-500 mb-4">
                 Note: Your changes will stay pending until approved by the superior
              admin. Once approved, they will go live.
            </p>
            <div className="max-h-[200px] overflow-y-auto mb-4">
             {changes.length > 0 ? (
                  <table className="w-full text-center text-sm border">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="p-2 border">Action</th>
                        <th className="p-2 border">Section</th>
                        <th className="p-2 border">Changed</th>
                        <th className="p-2 border">Undo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {changes.map((ch, i) => (
                        <tr key={i}>
                          <td
                            className={`p-2 border font-semibold
                              ${ch.type === "added" ? "text-green-600" : ""}
                              ${ch.type === "updated" ? "text-blue-600" : ""}
                              ${ch.type === "deleted" ? "text-red-600" : ""}`}
                          >
                            {ch.type}
                          </td>
                          <td className="p-2 border">{ch.section}</td>
                          <td className="p-2 border">
                            {ch.fields ? ch.fields.join(", ") : "New Row"}
                          </td>
                          <td className="p-2 border">
                            <button
                              onClick={() => handleRevertChange(i)}
                              className="p-1 rounded hover:bg-gray-100"
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
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
              >
                Final Request
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
};

export default ZonalResults;
