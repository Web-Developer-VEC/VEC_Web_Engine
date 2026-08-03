import React, { useState, useEffect } from "react";
import styles from "./InfoHostel.module.css";
import LoadComp from "../../LoadComp";
import { Pencil, Send, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";
import AutoResizeText from "../AutoResizeTextarea";

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
    const { sendRequest, loading, error } = useAdminRequest();

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

const buildTimingsPayload = (original, updated) => {
  const payloads = [];

  const origContent = original?.content || [];
  const updatedContent = updated?.content || [];

  updatedContent.forEach((item, index) => {
    const orig = origContent[index] || {};

    // detect if ANY timing field changed
    const hasChange = ["breakfast", "lunch", "dinner"].some(
      (field) => (item?.[field] || "") !== (orig?.[field] || "")
    );

    if (!hasChange) return;

    payloads.push({
      action: "update",
      collectionName: "hostel_details",
      title: "Update General Info",
      collection_type: "general_info",
      category: "Timings",

      // ORIGINAL SNAPSHOT
      original_data: {
        section: orig.section || "",
        breakfast: orig.breakfast || "",
        lunch: orig.lunch || "",
        dinner: orig.dinner || "",
      },

      // ✅ FULL UPDATED SNAPSHOT (NOT DIFF)
      meta_data: {
        breakfast: item?.breakfast || "",
        lunch: item?.lunch || "",
        dinner: item?.dinner || "",
      },
    });
  });

  return payloads;
};


const handleRevertGroup = (indices = []) => {
  // Important: revert from LAST index to FIRST
  // to avoid index shifting issues
  [...indices]
    .sort((a, b) => b - a)
    .forEach((i) => revertChange(i));
};

const buildDisplayChangeLog = (rawLog = []) => {
  const menuByDay = {}; // day -> { meals:Set, indices:[] }
  const output = [];
  const timingGroups = {
    "Mess timings": [],
    "Study timings": [],
  };

  rawLog.forEach((ch, index) => {
    // -------- MENU --------
    if (ch.field.startsWith("Mess (") && ch.field.includes("—")) {
      const match = ch.field.match(/^Mess \((.+?)\)\s+—\s+(.+)$/);
      if (!match) return;

      const day = match[1];
      const meal = match[2];

      if (!menuByDay[day]) {
        menuByDay[day] = { meals: new Set(), indices: [] };
      }

      menuByDay[day].meals.add(meal);
      menuByDay[day].indices.push(index);
      return;
    }

    // -------- TIMINGS --------
    if (ch.field === "Mess timings" || ch.field === "Study timings") {
      timingGroups[ch.field].push(index);
      return;
    }

    // -------- FALLBACK --------
    output.push({
      action: ch.action,
      section: ch.section,
      text: ch.field,
      indices: [index],
    });
  });

  // -------- PUSH TIMINGS (ONCE EACH) --------
  Object.entries(timingGroups).forEach(([label, indices]) => {
    if (indices.length > 0) {
      output.push({
        action: "Edited",
        section: "General Info",
        text: label,
        indices,
      });
    }
  });

  // -------- PUSH MENU GROUPS --------
  Object.entries(menuByDay).forEach(([day, data]) => {
    output.push({
      action: "Edited",
      section: "General Info",
      text: `Menu (${day}) – ${Array.from(data.meals).join(", ")}`,
      indices: data.indices,
    });
  });

  return output;
};



const buildMenuPayload = (original, updated) => {
  const origMenu = original?.content?.[0]?.hostel_menu?.[0];
  const updatedMenu = updated?.content?.[0]?.hostel_menu?.[0];

  if (!origMenu || !updatedMenu) return null;

  // detect any change
  const changed =
    JSON.stringify(origMenu) !== JSON.stringify(updatedMenu);

  if (!changed) return null;

  return {
    action: "update",
    collectionName: "hostel_details",
    category: "Menu",
    title: "Updated Menu",
    collection_type: "general_info",
    original_data: {
      day: origMenu.day || [],
      Breakfast: origMenu.breakfast || origMenu.Breakfast || [],
      lunch: origMenu.lunch || [],
      snacks: origMenu.snacks || [],
      dinner: origMenu.dinner || [],
    },
    meta_data: {
      day: updatedMenu.day || [],
      Breakfast: updatedMenu.breakfast || updatedMenu.Breakfast || [],
      lunch: updatedMenu.lunch || [],
      snacks: updatedMenu.snacks || [],
      dinner: updatedMenu.dinner || [],
    },
  };
};


const handleFinalRequestConfirm = async () => {
  const payloads = [];

  // ---- GENERAL TIMINGS ----
  payloads.push(
    ...buildTimingsPayload(
      originalData?.[0],
      savedData?.[0]
    )
  );

  // ---- MENU ----
  const menuPayload = buildMenuPayload(
    originalData?.[1],
    savedData?.[1]
  );

  if (menuPayload) payloads.push(menuPayload);

  if (payloads.length === 0) {
    toast.info("No changes to submit");
    return;
  }

  console.log("FINAL GENERAL INFO PAYLOADS:", payloads);

  await sendRequest(payloads, null); // no files

  

  setShowRequestModal(false);
  setRequestSent(true);
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
    
<div className={`${styles.container} bg-prim dark:bg-drkp font-[poppins] relative min-h-screen pt-19`}>
  <ToastContainer position="bottom-right" autoClose={3000} />

  <div className={`${styles.header} flex justify-between items-center mb-4`}>
    <h1 className={`${styles.title} text-brwn dark:text-drkt capitalize`}>
{isEditing ? savedData?.[0]?.category : savedData?.[0]?.category}

    </h1>

    {!isEditing && (
      <button
        onClick={handleEdit}
        className={`${styles.editButton} flex items-center gap-2 px-4 py-2 pr-11`}
      >
        <Pencil size={16} /> Edit
      </button>
    )}
  </div>

  <section className={styles.grid}>
    {(isEditing ? editData?.content : savedData?.[0]?.content || []).map((item, index) => (
      <div
        key={index}
        className={`${styles.card} bg-prim dark:bg-drkb border-l-4 border-secd dark:border-drks`}
      >
        <h2 className={`${styles.cardTitle} text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks capitalize`}>
          {isEditing ? (
            item?.section
          ) : (
            item?.section
          )}
        </h2>

        <p className={`${styles.cardText} text-text dark:text-drkt`}>
          {isEditing ? (
            <>
              <input
                value={item?.breakfast || ""}
                onChange={(e) => handleSectionChange(index, "breakfast", e.target.value)}
                className={`${styles.textInput} bg-prim dark:bg-drkb w-full mb-2`}
                rows="2"
              />
              <input
                value={item?.lunch || ""}
                onChange={(e) => handleSectionChange(index, "lunch", e.target.value)}
                className={`${styles.textInput} bg-prim dark:bg-drkb w-full mb-2`}
                rows="2"
              />
              <input
                value={item?.dinner || ""}
                onChange={(e) => handleSectionChange(index, "dinner", e.target.value)}
                className={`${styles.textInput} bg-prim dark:bg-drkb w-full`}
                rows="2"
              />
            </>
          ) : (
            <>
              {item?.breakfast}<br />
              {item?.lunch}<br />
              {item?.dinner}
            </>
          )}
        </p>
      </div>
    ))}
  </section>

  <section className={`${styles.foodTimetable} mt-8 pb-20`}>
    <h2 className={`${styles.title} text-brwn dark:text-drkt capitalize text-center`}>
      {isEditing ? (
savedData?.[1]?.category
      ) : (
        savedData?.[1]?.category
      )}
    </h2>

    <table className={styles.foodTable}>
      <thead>
        <tr>
          <th>Day</th>
          {Object.keys((isEditing ? editData2 : savedData?.[1])?.content?.[0]?.hostel_menu?.[0] || {})
            .filter((k) => k !== "day")
            .map((meal, i) => (
              <th key={i}>{capitalize(meal)}</th>
            ))}
        </tr>
      </thead>

      <tbody>
        {((isEditing ? editData2 : savedData?.[1])?.content?.[0]?.hostel_menu?.[0]?.day || []).map((day, i) => (
          <tr key={i}>
            <td>
              {isEditing ? (
                <input
                  value={day || ""}
                  onChange={(e) => handleDayChange(i, e.target.value)}
                  className={styles.textInput}
                />
              ) : day}
            </td>

            {Object.keys((isEditing ? editData2 : savedData?.[1])?.content?.[0]?.hostel_menu?.[0] || {})
              .filter((k) => k !== "day")
              .map((meal, j) => (
                <td key={j}>
                  {isEditing ? (
                    <AutoResizeText
                      value={editData2?.content?.[0]?.hostel_menu?.[0]?.[meal]?.[i] || ""}
                      onChange={(e) => handleMealChange(meal, i, e.target.value)}
                      className={styles.textInput}
                      rows="3"
                    />
                  ) : (
                    savedData?.[1]?.content?.[0]?.hostel_menu?.[0]?.[meal]?.[i]
                  )}
                </td>
              ))}
          </tr>
        ))}
      </tbody>
    </table>
  </section>


      {isEditing && (
        <div className="absolute bottom-0 mb-3 right-[10px] flex justify-end gap-2 w-full pr-9">
          <button onClick={handleCancel} className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500">Cancel</button>
          {hasChanges && <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim">Save</button>}
        </div>
      )}

      {!isEditing && changeLog.length > 0 && !requestSent && (
        <div className="absolute bottom-0 mb-3 right-[10px] flex justify-end gap-2 w-full pr-9">
          <button onClick={handleDiscard} className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500">Discard Changes</button>
          <button onClick={handleRequest} className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"><Send size={16} /> Request</button>
        </div>
      )}

      {showRequestModal && (
        <div className="fixed inset-0 bg-text/70 flex items-center justify-center z-[1000]">
          <div className="bg-prim p-6 rounded-xl w-[45%] max-h-[80vh] overflow-y-auto">
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
                  {buildDisplayChangeLog(changeLog).map((ch, i) => (

<tr key={i}>
  <td className="border p-2 text-blue-600">{ch.action}</td>
  <td className="border p-2">{ch.section}</td>
  <td className="border p-2 text-left">{ch.text}</td>
  <td className="border p-2">
<button
  onClick={() => handleRevertGroup(ch.indices)}
  className="text-red-500 hover:text-red-700 font-bold px-2 py-1"
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
