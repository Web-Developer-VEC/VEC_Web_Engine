import React, { useState, useEffect } from "react";
import "./InfoHostel.css";
import LoadComp from "../../LoadComp";
import { Pencil, Send, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const deepClone = (v) => JSON.parse(JSON.stringify(v || {}));

const isMessSectionName = (name = "") => /mess/i.test(name);
const isStudySectionName = (name = "") => /study/i.test(name);

const capitalize = (s = "") => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const EditableInfoHostel = ({ hostelData = [] }) => {
  const [originalData, setOriginalData] = useState([null, null]);
  const [savedData, setSavedData] = useState([null, null]);
  const [editData, setEditData] = useState(null);
  const [editData2, setEditData2] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [changeLog, setChangeLog] = useState([]);

  useEffect(() => {
    if (hostelData && hostelData.length >= 2) {
      const a = deepClone(hostelData[0]);
      const b = deepClone(hostelData[1]);
      setOriginalData([a, b]);
      setSavedData([deepClone(a), deepClone(b)]);
      setEditData(deepClone(a));
      setEditData2(deepClone(b));
      setChangeLog([]);
      setRequestSent(false);
      setIsEditing(false);
      setHasChanges(false);
    }
  }, [hostelData]);

  const computeChangeLog = (orig, saved) => {
    const log = [];
    if (!orig || !saved) return log;

    try {
      // GENERAL INFO (index 0) - Section always "General Info"
      if ((orig[0]?.category || "") !== (saved[0]?.category || "")) {
        log.push({
          action: "Edited",
          section: "General Info",
          field: "Category",
          oldValue: (orig[0]?.category || "").trim() || "(empty)",
          newValue: (saved[0]?.category || "").trim() || "(empty)",
          path: { type: "general", key: "category" },
        });
      }

      const origContent = orig[0]?.content || [];
      const savedContent = saved[0]?.content || [];
      const maxGeneral = Math.max(origContent.length, savedContent.length);

      for (let i = 0; i < maxGeneral; i++) {
        const o = origContent[i] || {};
        const s = savedContent[i] || {};
        const sectionName = (s.section || o.section || `Item ${i + 1}`).toString();

        const watched = ["section", "breakfast", "lunch", "dinner"];
        watched.forEach((field) => {
          const ov = (o[field] || "").toString().trim();
          const nv = (s[field] || "").toString().trim();
          if (ov !== nv) {
            // If the section name contains 'mess' or 'study', show Mess timings or Study timings.
            // But user requested that for timings we show Mess/Study as label only (not Breakfast/Lunch)
            let fieldLabel = "";
            if (field === "section") {
              if (isMessSectionName(sectionName)) fieldLabel = "Mess timings";
              else if (isStudySectionName(sectionName)) fieldLabel = "Study timings";
              else fieldLabel = `Section title (${sectionName})`;
            } else {
              if (isMessSectionName(sectionName)) fieldLabel = "Mess timings";
              else if (isStudySectionName(sectionName)) fieldLabel = "Study timings";
              else fieldLabel = `${capitalize(field)} (${sectionName})`;
            }

            log.push({
              action: "Edited",
              section: "General Info",
              field: fieldLabel,
              oldValue: ov || "(empty)",
              newValue: nv || "(empty)",
              path: { type: "general", index: i, field },
            });
          }
        });
      }
    } catch (err) {
      console.error("gen diff err", err);
    }

    try {
      // MENU (index 1) - but still show Section as "General Info"
      if ((orig[1]?.category || "") !== (saved[1]?.category || "")) {
        log.push({
          action: "Edited",
          section: "General Info",
          field: "Mess - Category",
          oldValue: (orig[1]?.category || "").trim() || "(empty)",
          newValue: (saved[1]?.category || "").trim() || "(empty)",
          path: { type: "menu", key: "category" },
        });
      }

      const origMenu = orig[1]?.content?.[0]?.hostel_menu?.[0] || {};
      const savedMenu = saved[1]?.content?.[0]?.hostel_menu?.[0] || {};

      const origDays = Array.isArray(origMenu.day) ? origMenu.day : [];
      const savedDays = Array.isArray(savedMenu.day) ? savedMenu.day : [];
      const maxDays = Math.max(origDays.length, savedDays.length);

      for (let i = 0; i < maxDays; i++) {
        const ov = (origDays[i] || "").toString().trim();
        const nv = (savedDays[i] || "").toString().trim();
        if (ov !== nv) {
          const dayLabel = nv || ov || `Day ${i + 1}`;
          log.push({
            action: "Edited",
            section: "General Info",
            field: `Mess (${dayLabel}) - Day name`,
            oldValue: ov || "(empty)",
            newValue: nv || "(empty)",
            path: { type: "menu", key: "day", dayIndex: i },
          });
        }
      }

      const mealKeysSet = new Set([
        ...Object.keys(origMenu || {}),
        ...Object.keys(savedMenu || {}),
      ]);
      mealKeysSet.delete("day");

      mealKeysSet.forEach((mealKey) => {
        const origArr = Array.isArray(origMenu[mealKey]) ? origMenu[mealKey] : [];
        const savedArr = Array.isArray(savedMenu[mealKey]) ? savedMenu[mealKey] : [];
        const maxM = Math.max(origArr.length, savedArr.length);
        for (let i = 0; i < maxM; i++) {
          const ov = (origArr[i] || "").toString().trim();
          const nv = (savedArr[i] || "").toString().trim();
          if (ov !== nv) {
            const dayLabel = savedMenu.day?.[i] || origMenu.day?.[i] || `Day ${i + 1}`;
            // include actual meal name (Breakfast/Lunch/Snacks/Dinner)
            const mealLabel = capitalize(mealKey);
            log.push({
              action: "Edited",
              section: "General Info",
              field: `Mess (${dayLabel}) — ${mealLabel}`,
              oldValue: ov || "(empty)",
              newValue: nv || "(empty)",
              path: { type: "menu", mealKey, dayIndex: i },
            });
          }
        }
      });
    } catch (err) {
      console.error("menu diff err", err);
    }

    return log;
  };

  useEffect(() => {
    setChangeLog(computeChangeLog(originalData, savedData));
  }, [originalData, savedData]);

  const handleEdit = () => {
    setEditData(deepClone(savedData?.[0] || {}));
    setEditData2(deepClone(savedData?.[1] || {}));
    setIsEditing(true);
    setHasChanges(false);
  };

  const handleCancel = () => {
    setEditData(deepClone(savedData?.[0] || {}));
    setEditData2(deepClone(savedData?.[1] || {}));
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleSave = () => {
    setSavedData([deepClone(editData || {}), deepClone(editData2 || {})]);
    setIsEditing(false);
    setHasChanges(false);
    setRequestSent(false);
  };

  const handleDiscard = () => {
    const a = deepClone(originalData?.[0] || {});
    const b = deepClone(originalData?.[1] || {});
    setSavedData([a, b]);
    setEditData(a);
    setEditData2(b);
    setIsEditing(false);
    setHasChanges(false);
    setRequestSent(false);
    setChangeLog([])
toast.info("All Change has been reverted");
  };

  const handleRequest = () => {
    setShowRequestModal(true);
  };

  const handleFinalRequestConfirm = () => {
    // send savedData + changeLog to backend here
    setShowRequestModal(false);
    setRequestSent(true);
    toast.success("Request submitted successfully!");
  };

  const handleCategoryChange = (e, index) => {
    const v = e.target.value;
    if (index === 0) setEditData({ ...editData, category: v });
    else setEditData2({ ...editData2, category: v });
    setHasChanges(true);
  };

  const handleSectionChange = (sectionIndex, field, value) => {
    const updated = [...(editData?.content || [])];
    if (!updated[sectionIndex]) updated[sectionIndex] = {};
    updated[sectionIndex][field] = value;
    setEditData({ ...editData, content: updated });
    setHasChanges(true);
  };

  const handleMealChange = (mealType, dayIndex, value) => {
    const updatedContent = [...(editData2?.content || [])];
    if (!updatedContent[0]) updatedContent[0] = { hostel_menu: [{}] };
    const menu = { ...(updatedContent[0].hostel_menu?.[0] || {}) };
    if (!Array.isArray(menu[mealType])) menu[mealType] = Array(7).fill("");
    menu[mealType][dayIndex] = value;
    updatedContent[0].hostel_menu[0] = menu;
    setEditData2({ ...editData2, content: updatedContent });
    setHasChanges(true);
  };

  const handleDayChange = (dayIndex, value) => {
    const updatedContent = [...(editData2?.content || [])];
    if (!updatedContent[0]) updatedContent[0] = { hostel_menu: [{}] };
    const menu = { ...(updatedContent[0].hostel_menu?.[0] || {}) };
    if (!Array.isArray(menu.day)) menu.day = Array(7).fill("");
    menu.day[dayIndex] = value;
    updatedContent[0].hostel_menu[0] = menu;
    setEditData2({ ...editData2, content: updatedContent });
    setHasChanges(true);
  };

  const revertChange = (index) => {
    const ch = changeLog[index];
    if (!ch) return;
    const newSaved = deepClone(savedData);

    if (ch.path?.type === "general") {
      if (ch.path.key === "category") {
        newSaved[0].category = originalData[0]?.category || "";
      } else if (typeof ch.path.index !== "undefined") {
        const idx = ch.path.index;
        if (!newSaved[0].content) newSaved[0].content = [];
        if (!newSaved[0].content[idx]) newSaved[0].content[idx] = {};
        newSaved[0].content[idx][ch.path.field] = originalData[0]?.content?.[idx]?.[ch.path.field] || "";
      }
    } else if (ch.path?.type === "menu") {
      if (ch.path.key === "category") {
        newSaved[1].category = originalData[1]?.category || "";
      } else if (ch.path.key === "day") {
        if (!newSaved[1].content) newSaved[1].content = [{ hostel_menu: [{}] }];
        if (!newSaved[1].content[0].hostel_menu) newSaved[1].content[0].hostel_menu = [{}];
        const menu = newSaved[1].content[0].hostel_menu[0];
        if (!Array.isArray(menu.day)) menu.day = [];
        menu.day[ch.path.dayIndex] = originalData[1]?.content?.[0]?.hostel_menu?.[0]?.day?.[ch.path.dayIndex] || "";
      } else if (ch.path.mealKey) {
        if (!newSaved[1].content) newSaved[1].content = [{ hostel_menu: [{}] }];
        if (!newSaved[1].content[0].hostel_menu) newSaved[1].content[0].hostel_menu = [{}];
        const menu = newSaved[1].content[0].hostel_menu[0];
        if (!Array.isArray(menu[ch.path.mealKey])) menu[ch.path.mealKey] = [];
        menu[ch.path.mealKey][ch.path.dayIndex] = originalData[1]?.content?.[0]?.hostel_menu?.[0]?.[ch.path.mealKey]?.[ch.path.dayIndex] || "";
      }
    }

    setSavedData(newSaved);
    setEditData(deepClone(newSaved[0]));
    setEditData2(deepClone(newSaved[1]));
  };

  if (!savedData || !editData || !editData2) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    
    <div className="admin-placement-percent bg-prim dark:bg-drkp font-[poppins] relative min-h-screen">
      <ToastContainer position="bottom-right" autoClose={3000} />
      <div className="flex justify-between items-center mb-4">
        <h1 className="infohostel-title-admin text-brwn dark:text-drkt capitalize">
          {isEditing ? (
            <input
              type="text"
              value={editData?.category || ""}
              onChange={(e) => handleCategoryChange(e, 0)}
              className="text-input bg-prim dark:bg-drkb text-brwn dark:text-drkt text-2xl font-bold w-full"
            />
          ) : (
            savedData?.[0]?.category
          )}
        </h1>
        <div className="absolute top-2 right-2 flex gap-2 items-center">
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
            >
              <Pencil size={16} /> Edit
            </button>
          )}
        </div>
      </div>

      <section className="HI-grid">
        {(isEditing ? editData?.content : savedData?.[0]?.content || []).map((item, index) => (
          <div key={index} className="HI-card bg-prim dark:bg-drkb border-l-4 border-secd dark:border-drks">
            <h2 className="HI-card-title text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks capitalize">
              {isEditing ? (
                <input type="text" value={item?.section || ""} onChange={(e) => handleSectionChange(index, "section", e.target.value)} className="text-input bg-prim dark:bg-drkb text-brwn dark:text-drkt w-full" />
              ) : (
                item?.section
              )}
            </h2>
            <p className="HI-card-text text-text dark:text-drkt">
              {isEditing ? (
                <>
                  <textarea value={item?.breakfast || ""} onChange={(e) => handleSectionChange(index, "breakfast", e.target.value)} className="text-input bg-prim dark:bg-drkb text-text dark:text-drkt w-full mb-2" rows="2" />
                  <textarea value={item?.lunch || ""} onChange={(e) => handleSectionChange(index, "lunch", e.target.value)} className="text-input bg-prim dark:bg-drkb text-text dark:text-drkt w-full mb-2" rows="2" />
                  <textarea value={item?.dinner || ""} onChange={(e) => handleSectionChange(index, "dinner", e.target.value)} className="text-input bg-prim dark:bg-drkb text-text dark:text-drkt w-full" rows="2" />
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

      <section className="food-timetable mt-8 pb-20">
        <h2 className={`infohostel-title text-brwn dark:text-drkt capitalize ${!isEditing ? "w-full text-center" : ""}`}>
          {isEditing ? (
            <input type="text" value={editData2?.category || ""} onChange={(e) => handleCategoryChange(e, 1)} className="text-input bg-prim dark:bg-drkb text-brwn dark:text-drkt text-2xl font-bold w-full" />
          ) : (
            savedData?.[1]?.category
          )}
        </h2>

        <table className="food-table">
          <thead>
            <tr>
              <th>Day</th>
              {Object.keys((isEditing ? editData2 : savedData?.[1])?.content?.[0]?.hostel_menu?.[0] || {})
                .filter((key) => key !== "day")
                .map((mealKey, index) => (
                  <th key={index}>{capitalize(mealKey)}</th>
                ))}
            </tr>
          </thead>
          <tbody>
            {((isEditing ? editData2 : savedData?.[1])?.content?.[0]?.hostel_menu?.[0]?.day || []).map((day, i) => (
              <tr key={i}>
                <td>
                  {isEditing ? (
                    <input type="text" value={day || ""} onChange={(e) => handleDayChange(i, e.target.value)} className="text-input bg-prim dark:bg-drkb text-text dark:text-drkt w-full" />
                  ) : (
                    day
                  )}
                </td>
                {Object.keys((isEditing ? editData2 : savedData?.[1])?.content?.[0]?.hostel_menu?.[0] || {})
                  .filter((key) => key !== "day")
                  .map((mealKey, j) => (
                    <td key={j}>
                      {isEditing ? (
                        <textarea value={(editData2?.content?.[0]?.hostel_menu?.[0]?.[mealKey]?.[i]) || ""} onChange={(e) => handleMealChange(mealKey, i, e.target.value)} className="text-input bg-prim dark:bg-drkb text-text dark:text-drkt w-full" rows="3" />
                      ) : (
                        savedData?.[1]?.content?.[0]?.hostel_menu?.[0]?.[mealKey]?.[i]
                      )}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {isEditing && (
        <div className="absolute bottom-0 mb-3 right-[10px] flex justify-end gap-2 w-full">
          <button onClick={handleCancel} className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500">Cancel</button>
          {hasChanges && <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim">Save</button>}
        </div>
      )}

      {!isEditing && changeLog.length > 0 && !requestSent && (
        <div className="absolute bottom-0 mb-3 right-[10px] flex justify-end gap-2 w-full">
          <button onClick={handleDiscard} className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500">Discard Changes</button>
          <button onClick={handleRequest} className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"><Send size={16} /> Request</button>
        </div>
      )}

      {showRequestModal && (
        <div className="fixed inset-0 bg-text/70 flex items-center justify-center z-[1000]">
          <div className="bg-prim p-6 rounded-xl w-[55%] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Final Request</h2>
            <p className="text-sm text-red-500 mb-4">Your changes will stay pending until approved by the superior admin. Once approved they will go live.</p>

            {changeLog.length > 0 ? (
              <table className="w-full text-center text-sm border">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border p-2">Action</th>
                    <th className="border p-2">Section</th>
                    <th className="border p-2">Changes</th>
                    <th className="border p-2">Revert</th>
                  </tr>
                </thead>
                <tbody>
                  {changeLog.map((ch, i) => (
                    <tr key={i}>
                      <td className="border p-2 text-blue-600">{ch.action}</td>
                      <td className="border p-2">{ch.section}</td>
                      <td className="border p-2 text-left whitespace-pre-wrap">
                        <p>{ch.field}</p>
                      </td>
                      <td className="border p-2">
                        <button onClick={() => revertChange(i)} className="p-1 rounded hover:bg-gray-100" title="Revert this change">
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
              <button onClick={() => setShowRequestModal(false)} className="px-4 py-2 rounded bg-gray-400 text-prim">Cancel</button>
              {changeLog.length > 0 && <button onClick={handleFinalRequestConfirm} className="px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim">Final Request</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditableInfoHostel;
