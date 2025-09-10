import React, { useState, useEffect } from "react";
import "./InfoHostel.css";
import LoadComp from "../../LoadComp";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditableInfoHostel = ({ hostelData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPageView, setIsPageView] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editData2, setEditData2] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [changeLog, setChangeLog] = useState([]);

  // Initialize when hostelData is loaded
  useEffect(() => {
    if (hostelData && hostelData.length >= 2) {
      const data = JSON.parse(JSON.stringify(hostelData[0] || {}));
      const data2 = JSON.parse(JSON.stringify(hostelData[1] || {}));
      setEditData(data);
      setEditData2(data2);
      setOriginalData([data, data2]);
    }
  }, [hostelData]);

  if (!hostelData || hostelData.length < 2 || !editData || !editData2) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  const logChange = (action, section, topic, oldValue, newValue) => {
    setChangeLog((prev) => [
      ...prev,
      { action, section, changes: topic, oldValue, newValue },
    ]);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsPageView(false);
    toast.info("You are now editing");
  };

  const handleCancel = () => {
    setEditData(JSON.parse(JSON.stringify(originalData?.[0] || {})));
    setEditData2(JSON.parse(JSON.stringify(originalData?.[1] || {})));
    setIsEditing(false);
    setIsPageView(false);
    setChangeLog([]);
    toast.info("Changes reverted");
  };

  const handlePageView = () => {
    setIsPageView(true);
    setIsEditing(false);
    toast.info("Switched to Page View mode");
  };

  const handleBackToEdit = () => {
    setIsEditing(true);
    setIsPageView(false);
    toast.info("Back to Edit mode");
  };

  const handleRequest = () => {
    setShowRequestModal(true);
  };

  const handleRequestConfirm = () => {
    setShowRequestModal(false);
    setIsPageView(false);
    toast.success("Request submitted successfully!");
    console.log("Change Log:", changeLog);
  };

  const handleCategoryChange = (e, index) => {
    const newValue = e.target.value;
    if (index === 0) {
      logChange("Edited", "General Info", "Category", editData?.category, newValue);
      setEditData({ ...editData, category: newValue });
    } else {
      logChange("Edited", "Menu", "Category", editData2?.category, newValue);
      setEditData2({ ...editData2, category: newValue });
    }
  };

  const handleSectionChange = (sectionIndex, field, value) => {
    const updatedContent = [...(editData?.content || [])];
    const oldValue = updatedContent?.[sectionIndex]?.[field] || "";
    if (updatedContent?.[sectionIndex]) {
      updatedContent[sectionIndex][field] = value;
    }
    setEditData({ ...editData, content: updatedContent });
    logChange("Edited", "General Info", field, oldValue, value);
  };

  const handleMealChange = (mealType, dayIndex, value) => {
    const updatedContent = [...(editData2?.content || [])];
    const updatedMenu = { ...(updatedContent?.[0]?.hostel_menu?.[0] || {}) };
    const oldValue = updatedMenu?.[mealType]?.[dayIndex] || "";

    if (!updatedMenu[mealType]) {
      updatedMenu[mealType] = Array(7).fill("");
    }

    updatedMenu[mealType][dayIndex] = value;
    if (updatedContent?.[0]?.hostel_menu) {
      updatedContent[0].hostel_menu[0] = updatedMenu;
    }
    setEditData2({ ...editData2, content: updatedContent });
    logChange("Edited", "Menu", mealType, oldValue, value);
  };

  const handleDayChange = (dayIndex, value) => {
    const updatedContent = [...(editData2?.content || [])];
    const updatedMenu = { ...(updatedContent?.[0]?.hostel_menu?.[0] || {}) };
    const oldValue = updatedMenu?.day?.[dayIndex] || "";

    if (!updatedMenu.day) {
      updatedMenu.day = Array(7).fill("");
    }

    updatedMenu.day[dayIndex] = value;
    if (updatedContent?.[0]?.hostel_menu) {
      updatedContent[0].hostel_menu[0] = updatedMenu;
    }
    setEditData2({ ...editData2, content: updatedContent });
    logChange("Edited", "Menu", "Day", oldValue, value);
  };

  return (
    <div className="infohostel-container bg-prim dark:bg-drkp font-[poppins] relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="infohostel-title text-brwn dark:text-drkt capitalize">
          {isEditing ? (
            <input
              type="text"
              value={editData?.category || ""}
              onChange={(e) => handleCategoryChange(e, 0)}
              className="text-input bg-prim dark:bg-drkb text-brwn dark:text-drkt text-2xl font-bold w-full"
            />
          ) : (
            editData?.category
          )}
        </h1>

        {isEditing && (
          <button
            onClick={handleCancel}
            className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        )}
        {!isEditing && !isPageView && (
          <button
            onClick={handleEdit}
            className="bg-[#fdcc06] text-white px-4 py-2 rounded-md hover:bg-[#800000] transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {/* Section 1 */}
      <section className="HI-grid">
        {(editData?.content || []).map((item, index) => (
          <div
            key={index}
            className="HI-card bg-prim dark:bg-drkb border-l-4 border-secd dark:border-drks"
          >
            <h2 className="HI-card-title text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks capitalize">
              {isEditing ? (
                <input
                  type="text"
                  value={item?.section || ""}
                  onChange={(e) => handleSectionChange(index, "section", e.target.value)}
                  className="text-input bg-prim dark:bg-drkb text-brwn dark:text-drkt w-full"
                />
              ) : (
                item?.section
              )}
            </h2>
            <p className="HI-card-text text-text dark:text-drkt">
              {isEditing ? (
                <>
                  <textarea
                    value={item?.breakfast || ""}
                    onChange={(e) => handleSectionChange(index, "breakfast", e.target.value)}
                    className="text-input bg-prim dark:bg-drkb text-text dark:text-drkt w-full mb-2"
                    rows="2"
                  />
                  <textarea
                    value={item?.lunch || ""}
                    onChange={(e) => handleSectionChange(index, "lunch", e.target.value)}
                    className="text-input bg-prim dark:bg-drkb text-text dark:text-drkt w-full mb-2"
                    rows="2"
                  />
                  <textarea
                    value={item?.dinner || ""}
                    onChange={(e) => handleSectionChange(index, "dinner", e.target.value)}
                    className="text-input bg-prim dark:bg-drkb text-text dark:text-drkt w-full"
                    rows="2"
                  />
                </>
              ) : (
                <>
                  {item?.breakfast}
                  <br />
                  {item?.lunch}
                  <br />
                  {item?.dinner}
                </>
              )}
            </p>
          </div>
        ))}
      </section>

      {/* Section 2 */}
      <section className="food-timetable mt-8">
        <h2 className="infohostel-title text-brwn dark:text-drkt capitalize">
          {isEditing ? (
            <input
              type="text"
              value={editData2?.category || ""}
              onChange={(e) => handleCategoryChange(e, 1)}
              className="text-input bg-prim dark:bg-drkb text-brwn dark:text-drkt text-2xl font-bold w-full"
            />
          ) : (
            editData2?.category
          )}
        </h2>

        <table className="food-table">
          <thead>
            <tr>
              <th>Day</th>
              {Object.keys(editData2?.content?.[0]?.hostel_menu?.[0] || {})
                .filter((key) => key !== "day")
                .map((mealKey, index) => (
                  <th key={index}>
                    {mealKey.charAt(0).toUpperCase() + mealKey.slice(1)}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {(editData2?.content?.[0]?.hostel_menu?.[0]?.day || []).map((day, i) => (
              <tr key={i}>
                <td>
                  {isEditing ? (
                    <input
                      type="text"
                      value={day || ""}
                      onChange={(e) => handleDayChange(i, e.target.value)}
                      className="text-input bg-prim dark:bg-drkb text-text dark:text-drkt w-full"
                    />
                  ) : (
                    day
                  )}
                </td>
                {Object.keys(editData2?.content?.[0]?.hostel_menu?.[0] || {})
                  .filter((key) => key !== "day")
                  .map((mealKey, j) => (
                    <td key={j}>
                      {isEditing ? (
                        <textarea
                          value={
                            editData2?.content?.[0]?.hostel_menu?.[0]?.[mealKey]?.[i] || ""
                          }
                          onChange={(e) => handleMealChange(mealKey, i, e.target.value)}
                          className="text-input bg-prim dark:bg-drkb text-text dark:text-drkt w-full"
                          rows="3"
                        />
                      ) : (
                        editData2?.content?.[0]?.hostel_menu?.[0]?.[mealKey]?.[i]
                      )}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Action buttons */}
      {!isPageView && isEditing && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handlePageView}
            className="bg-[#fdcc06] text-white px-6 py-2 rounded-md hover:bg-[#800000] transition-colors"
          >
            Save
          </button>
        </div>
      )}

      {isPageView && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handleBackToEdit}
            className="bg-[#fdcc06] text-white px-4 py-2 rounded-md hover:bg-[#800000] transition-colors mx-auto"
          >
            Back to Edit
          </button>
          <button
            onClick={handleRequest}
            className="bg-secd text-white px-4 py-2 rounded-md hover:bg-[#800000] transition-colors"
          >
            Request
          </button>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[530px]">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Final Request for the Changes
            </h2>

            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin.
              Once approved, they will be applied automatically to the live site.
            </p>

            <div className="max-h-[200px] overflow-y-auto mb-4">
              <table className="w-full text-center text-text dark:text-drkt">
                <thead>
                  <tr>
                    <th className="py-1">Action</th>
                    <th className="py-1">Section</th>
                    <th className="py-1 text-center">Changes</th>
                  </tr>
                </thead>
                <tbody>
                  {changeLog.length > 0 ? (
                    changeLog.map((log, idx) => (
                      <tr key={idx}>
                        <td className="py-1 text-blue-600">✎ {log.action}</td>
                        <td className="py-1">{log.section}</td>
                        <td className="py-1 text-[12px]">{log.changes}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-2 text-gray-400">
                        No changes detected
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestConfirm}
                className="px-4 py-2 rounded bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt"
              >
                Final Request
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default EditableInfoHostel;
