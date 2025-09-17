import React from "react";
import { toast } from "react-toastify";

// Popup to confirm discard, delete, etc.
export function ConfirmPopup({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[350px]">
        <h3 className="text-lg font-semibold mb-4">{message}</h3>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}


export const ShowPopup = ({ changes = [], handleUndo, handleRequest, setShowPopup }) => {
  const formatChange = (change) => {
    switch (change.type) {
      case "added":
        return `Added ${change.targetType}: ${change.name}`;
      case "deleted":
        return `Deleted ${change.targetType}: ${change.name}`;
      case "edited":
        if (change.field === "name") {
          return `Renamed ${change.targetType}: "${change.oldValue}" → "${change.newValue}"`;
        } else if (change.field === "responsibility") {
          return `Changed responsibility: "${change.oldValue}" → "${change.newValue}"`;
        } else if (change.field === "dept") {
          return `Changed department: "${change.oldValue}" → "${change.newValue}"`;
        } else if (change.field === "year") {
          return `Changed year: "${change.oldValue}" → "${change.newValue}"`;
        }
        return `Edited ${change.field} for ${change.name}`;
      default:
        return change.description || "Change made";
    }
  };

  const getChangeColor = (type) => {
    switch (type) {
      case "added": return "text-green-600";
      case "deleted": return "text-red-600";
      case "edited": return "text-blue-600";
      default: return "text-gray-600";
    }
  };

  const getChangeIcon = (type) => {
    switch (type) {
      case "added": return "➕";
      case "deleted": return "🗑️";
      case "edited": return "✏️";
      default: return "📝";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[90%] md:w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Review Changes Before Submission
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          The following changes will be submitted for approval:
        </p>

        <div className="flex-1 overflow-auto mb-4 border rounded-lg">
          {changes.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No changes to review</div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="p-3 text-left text-sm font-medium">Type</th>
                  <th className="p-3 text-left text-sm font-medium">Change Description</th>
                  <th className="p-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((change, index) => (
                  <tr
                    key={index}
                    className="border-t border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="p-3">
                      <span className={`text-sm font-medium ${getChangeColor(change.type)}`}>
                        {getChangeIcon(change.type)} {change.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        {formatChange(change)}
                        {change.timestamp && (
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(change.timestamp).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleUndo(change.id || index)}
                        className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 rounded text-black text-sm transition-colors"
                        title="Undo this change"
                      >
                        Undo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-300">
              Total changes: <strong>{changes.length}</strong>
            </span>
            {changes.length > 0 && (
              <span className="text-sm text-gray-500">
                {changes.filter(c => c.type === "added").length} added,{" "}
                {changes.filter(c => c.type === "edited").length} edited,{" "}
                {changes.filter(c => c.type === "deleted").length} deleted
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded text-gray-800 transition-colors"
            onClick={() => setShowPopup(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={handleRequest}
            disabled={changes.length === 0}
          >
            Submit Request ({changes.length})
          </button>
        </div>
      </div>
    </div>
  );
}
// Toast notifications
export function discardChanges() {
  toast.info("Changes discarded", {
    position: "top-right",
    autoClose: 3000,
  });
}

export function saveChanges() {
  toast.success("Changes saved", {
    position: "top-right",
    autoClose: 3000,
  });
}
