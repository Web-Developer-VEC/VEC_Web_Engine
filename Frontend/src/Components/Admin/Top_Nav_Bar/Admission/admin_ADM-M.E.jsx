import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ADM-M.E.css";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router";
import {
  SaveAll,
  SquarePen,
  PlusCircle,
  Trash2,
  CircleX,
  Send,
  Pencil,
  Plus,
  X,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

const AdminME = ({ theme, toggle }) => {
  const [pgData, setpgData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const pg = pgData?.PG || [];
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();
  const [originalData, setOriginalData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState();
  const { sendRequest, loading, error } = useAdminRequest();

  const [pgedit, setpgEdit] = useState(false);
  const [savedOnce, setSavedOnce] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  // Popup & changes state
  const [showPopup, setShowPopup] = useState(false);
  const [changeList, setChangeList] = useState([]);
  const buildPgAdmissionPayloadConfirm = ({
    change,
    pendingData,
    committedData,
  }) => {
    const year = pendingData.year;

    /* ===========================
     INSERT (Add new PG course)
     =========================== */
    if (change.type === "added") {
      const row = pendingData.PG.find(
        (r) => Object.keys(r)[0] === Object.keys(change.row)[0],
      );
      if (!row) return null;

      const [course, d] = Object.entries(row)[0];

      return {
        collectionName: "admissions",
        collection_type: "pg",
        action: "insert",
        title: "Insert new PG department",
        meta_data: {
          year,
          PG: [
            {
              [course]: {
                "Government Quota Intakes": String(
                  d["Government Quota Intakes"],
                ),
                "Management Quota Intakes": String(
                  d["Management Quota Intakes"],
                ),
                "Total Intakes": String(d["Total Intakes"]),
              },
            },
          ],
        },
      };
    }

    /* ===========================
     UPDATE (Edit intake / rename)
     =========================== */
    if (change.type === "Edited" || change.type === "edited") {
      const course = change.type === "Edited" ? change.to : change.courseName;

      const newRow = pendingData.PG.find((r) => Object.keys(r)[0] === course);

      const oldRow = committedData.PG.find(
        (r) =>
          Object.keys(r)[0] ===
          (change.type === "Edited" ? change.from : course),
      );

      if (!newRow || !oldRow) return null;

      const [_, newData] = Object.entries(newRow)[0];
      const [__, oldData] = Object.entries(oldRow)[0];

      return {
        collectionName: "admissions",
        collection_type: "pg",
        action: "update",
        title: "Update PG Intake",
        meta_data: {
          data: {
            year,
            PG: [
              {
                [course]: {
                  "Government Quota Intakes": String(
                    newData["Government Quota Intakes"],
                  ),
                  "Management Quota Intakes": String(
                    newData["Management Quota Intakes"],
                  ),
                  "Total Intakes": String(newData["Total Intakes"]),
                },
              },
            ],
          },
        },
        original_data: {
          data: {
            year,
            PG: [
              {
                [Object.keys(oldRow)[0]]: {
                  "Government Quota Intakes": String(
                    oldData["Government Quota Intakes"],
                  ),
                  "Management Quota Intakes": String(
                    oldData["Management Quota Intakes"],
                  ),
                  "Total Intakes": String(oldData["Total Intakes"]),
                },
              },
            ],
          },
        },
      };
    }

    /* ===========================
     DELETE (Remove PG course)
     =========================== */
    if (change.type === "deleted") {
      return {
        collectionName: "admissions",
        collection_type: "pg",
        action: "delete",
        title: "Delete program from PG",
        meta_data: {
          year,
          PG: [
            {
              [Object.keys(change.row)[0]]: {},
            },
          ],
        },
      };
    }

    /* ===========================
     YEAR UPDATE
     =========================== */
    if (change.type === "YearEdited") {
      return {
        collectionName: "admissions",
        collection_type: "pg",
        action: "update",
        title: "Update Year",
        meta_data: {
          data: { year: pendingData.year },
        },
        original_data: {
          data: { year: committedData.year },
        },
      };
    }

    return null;
  };

  // Refactored helper for logging changes
  const logChange = (type, section, details) => {
    setChangeList((prev) => {
      const newChange = { type, section, ...details };

      const index = prev.findIndex((c) => {
        // Year: only ONE entry
        if (type === "YearEdited" && c.type === "YearEdited") return true;

        // Rename: only ONE per original course
        if (
          type === "Edited" &&
          c.type === "Edited" &&
          c.from === newChange.from
        ) {
          return true;
        }

        // Edited intake: only ONE per course
        if (
          type === "edited" &&
          c.type === "edited" &&
          c.courseName === newChange.courseName
        ) {
          return true;
        }

        // Added / Deleted
        if (
          ["added", "deleted"].includes(type) &&
          c.type === type &&
          c.row &&
          newChange.row &&
          Object.keys(c.row)[0] === Object.keys(newChange.row)[0]
        ) {
          return true;
        }

        return false;
      });

      if (index !== -1) {
        const updated = [...prev];
        updated[index] = { ...prev[index], ...newChange };
        return updated;
      }

      return [...prev, newChange];
    });
  };

  // ✅ fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`/api/main-backend/admission`, {
          type: "pg",
        });
        setpgData(response.data.data);
        setOriginalData(JSON.parse(JSON.stringify(response.data.data)));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setLoading(true);
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
        }
      }
    };
    fetchData();
  }, [navigate]);
  const handleDiscardChanges = () => {
    if (!originalData) return;

    setpgData(JSON.parse(JSON.stringify(originalData))); // Deep copy
    setChangeList([]); // Clear change logs
    setSelectedRows([]); // Clear selected rows
    setHasChanges(false); // Reset flag
    setpgEdit(false); // Exit edit mode
    setSavedOnce(false); // Reset save flag
    setShowDeleteModal(false); // Close delete modal if open

    toast.info("All changes discarded and original data restored.");
  };
  const handleAddNewRow = () => {
    const newRow = {
      "New Course": {
        "Government Quota Intakes": 0,
        "Management Quota Intakes": 0,
        "Total Intakes": 0,
      },
    };

    setpgData({ ...pgData, PG: [...pg, newRow] });

    // Save rowIndex in change log for reference
    logChange("added", "PG", { row: newRow, rowIndex: pg.length });
  };

  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) {
      toast.error("No rows selected to delete.");
      setShowDeleteModal(false);
      return;
    }

    const dataCopy = { ...pgData };
    let pgArray = [...dataCopy.PG];

    // Get rows before deleting for logging
    const removedRows = selectedRows.map((idx) => pgArray[idx]);

    // Filter out selected rows
    pgArray = pgArray.filter((_, idx) => !selectedRows.includes(idx));

    setpgData({ ...pgData, PG: pgArray });

    // Log each removed row
    removedRows.forEach((row) => {
      logChange("deleted", "PG", { row });
    });

    // Clear selection
    setSelectedRows([]);

    setShowDeleteModal(false);

    toast.info("Selected rows deleted. They will be removed on final request.");
  };

  // ✅ Delete row
  const handleDeleteRow = (rowIndex) => {
    const dataCopy = { ...pgData };
    const pgArray = [...dataCopy.PG];
    const removedRow = pgArray[rowIndex];
    pgArray.splice(rowIndex, 1);
    setpgData({ ...pgData, PG: pgArray });
    logChange("deleted", "PG", { row: removedRow });
    toast.info("Row deleted. It will be removed on final request.");
    setShowDeleteModal(false);
  };
  const handleCourseNameChange = (rowIndex, newName) => {
    const dataCopy = { ...pgData };
    const pgArray = [...dataCopy.PG];

    if (!pgArray[rowIndex]) return;

    const [oldName, details] = Object.entries(pgArray[rowIndex])[0];

    // Update UI
    pgArray[rowIndex] = { [newName]: details };
    setpgData({ ...dataCopy, PG: pgArray });

    // 🚫 DO NOT LOG RENAME FOR NEWLY ADDED ROWS
    const isAdded = changeList.some(
      (c) => c.type === "added" && c.rowIndex === rowIndex,
    );
    if (isAdded) return;

    // ✅ LOG RENAME ONLY ONCE
    logChange("Edited", "PG", {
      from: Object.keys(originalData.PG[rowIndex])[0],
      to: newName,
    });
  };

  const handleInputChange = (rowIndex, field, value) => {
    const updatedData = { ...pgData };
    const pgArray = [...updatedData.PG];
    const [courseName, details] = Object.entries(pgArray[rowIndex])[0];

    const oldValue = details[field];

    details[field] = value;

    const gov = parseInt(details["Government Quota Intakes"] || 0, 10);
    const mgmt = parseInt(details["Management Quota Intakes"] || 0, 10);
    details["Total Intakes"] = gov + mgmt;

    pgArray[rowIndex] = { [courseName]: details };
    setpgData({ ...updatedData, PG: pgArray });

    const isAdded = changeList.some(
      (c) => c.type === "added" && c.course === courseName,
    );

    if (!isAdded) {
      logChange("edited", "PG", {
        courseName,
        field,
        from: oldValue,
        to: value,
      });
    }
  };

  const handleCheckboxChange = (rowIndex, checked) => {
    setSelectedRows((prev) =>
      checked ? [...prev, rowIndex] : prev.filter((i) => i !== rowIndex),
    );

    setHasChanges(true); // 🔥 mark changes
  };

  // ✅ Undo change (restores state)
const handleUndoChange = (label) => {
  if (!originalData) return;

  let updated = { ...pgData };

  /* -------------------- UNDO YEAR -------------------- */
  if (label === "Year") {
    updated.year = originalData.year;
  }

  /* -------------------- UNDO INTAKE -------------------- */
  if (label === "Intake") {
    updated.PG = JSON.parse(JSON.stringify(originalData.PG));
  }

  setpgData(updated);
  toast.info(`${label} reverted`);
};

const handleFinalRequestConfirm = async () => {
  if (!originalData) return;

  const payloads = [];

  const originalPG = JSON.stringify(originalData.PG || []);
  const currentPG = JSON.stringify(pgData.PG || []);

  const originalYear = originalData.year;
  const currentYear = pgData.year;

  /* -------------------- INTAKE UPDATE -------------------- */
  if (originalPG !== currentPG) {
    payloads.push({
      collectionName: "admissions",
      collection_type: "pg",
      action: "update",
      title: "Update PG Intake",

      meta_data: {
        data: {
          year: currentYear,
          PG: pgData.PG,
        },
      },

      original_data: {
        data: {
          year: originalYear,
          PG: originalData.PG,
        },
      },

      admin: { status: "pending" },
    });
  }

  /* -------------------- YEAR UPDATE -------------------- */
  if (originalYear !== currentYear) {
    payloads.push({
      collectionName: "admissions",
      collection_type: "pg",
      action: "update",
      title: "Update Year",

      meta_data: {
        data: { year: currentYear },
      },

      original_data: {
        data: { year: originalYear },
      },

      admin: { status: "pending" },
    });
  }

  if (!payloads.length) {
    toast.warn("No changes to submit");
    return;
  }

  console.log("📦 FINAL PAYLOAD:", payloads);

  try {
    await sendRequest(payloads);

    toast.success("PG Admission request submitted successfully!");

    setOriginalData(JSON.parse(JSON.stringify(pgData)));
    setChangeList([]);
    setSavedOnce(false);
    setShowPopup(false);
  } catch (error) {
    toast.error("Failed to submit request");
  }
};


  const handleCancel = () => {
    setpgData(originalData); // restore the original fetched data
    setChangeList([]); // clear change logs
    setSelectedRows([]); // clear any selected checkboxes
    setpgEdit(false); // exit edit mode
    setSavedOnce(false); // reset save flag
    toast.info("All changes discarded.");
  };

  // ✅ Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleSaveClick = () => {
    if (!pgData.year || pgData.year.trim() === "") {
      toast.error("Please fill in the year field.");
      return;
    }

    const isAnyFieldEmpty = pg.some((item) => {
      const [courseName, courseDetails] = Object.entries(item)[0];
      return (
        courseName.trim() === "" ||
        courseDetails["Government Quota Intakes"] === "" ||
        courseDetails["Management Quota Intakes"] === ""
      );
    });

    if (isAnyFieldEmpty) {
      toast.error("All course fields must be filled out to save.");
      return;
    }

    setpgEdit(false);
    setSavedOnce(true);
    toast.success("Changes saved locally!");
  };

  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
  }
  console.log("new", pg.year);

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/admissionbanner.webp"
        headerText="ME Admission"
        subHeaderText="Shaping future engineers through advanced learning, research, and transformative opportunities."
      />

      {isLoading ? (
        <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
          <LoadComp txt={""} />
        </div>
      ) : (
        <div className="me-page">
          <div className="ME">
            <h3 className="text-accn dark:text-drkt font-bold border-b-2 pb-2 w-fit border-[#fdcc03] dark:border-drks">
              M.E. Degree Programme
            </h3>
          </div>
          <div className="me-contents bg-[#fffae6] dark:bg-drkb border-l-4 border-secd dark:border-drks">
            <h3 className="text-accn dark:text-drkt Eligibility text-center">
              Candidates seeking Admission to the First Semester of the
              Four-Semester M.E. Degree Programme:
            </h3>

            <br />
            <p>
              Candidates seeking admission for the Post-Graduate Degree
              Programme shall be required to have passed an appropriate
              Under-Graduate Degree Examination of Anna University or equivalent
              as per the Tamil Nadu Common Admission (TANCA) criteria.
            </p>
            <br />
            <p>
              <strong>Note:</strong> TANCA releases the updated criteria during
              the admissions every academic year. Admission shall be offered
              only to the candidates who possess the qualification prescribed
              against each programme.
            </p>
            <br />
            <p>
              Any other relevant qualification which is not prescribed against
              each programme shall be considered for equivalence by the
              committee constituted for the purpose. Admission to such degrees
              shall be offered only after obtaining equivalence to such degrees.
            </p>
            <div>
              <p className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1 text-[24px] w-fit font-bold mb-2 mt-2">
                GOVERNMENT QUOTA
              </p>
              <p className="ml-8">M.E : Apply through TANCET/TANCA</p>
            </div>
            <div>
              <p className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1 text-[24px] w-fit font-bold mb-2 mt-2">
                MANAGEMENT QUOTA
              </p>
              <p className="ml-8">
                M.E : Apply through Common Entrance Test (CET) conducted by the
                Consortium of Self –Financing Professional, Arts and Science
                Colleges in Tamil Nadu
              </p>
              {!pgedit && (
                <div className="flex justify-end">
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg mt-4 mr-10"
                    onClick={() => setpgEdit(true)}
                  >
                    <Pencil size={16} /> Edit
                  </button>
                </div>
              )}
            </div>
            <div className="me-container">
              <center>
                <h4 className="text-accn dark:text-drkt Eligibility mt-5 font-bold">
                  {pgedit ? (
                    <>
                      {"M.E - Total Intake "}
                      <input
                        type="text"
                        className="admin-mbain w-20 inline-block text-center"
                        value={pgData.year || ""}
                        /* UI updates while typing */
                        onChange={(e) => {
                          setpgData({ ...pgData, year: e.target.value });
                        }}
                        /* 🔥 LOG ONLY ON FINISH (ONE TIME) */
                        onBlur={(e) => {
                          const newYear = e.target.value;

                          if (newYear !== originalData.year) {
                            logChange("YearEdited", "year", {
                              from: originalData.year,
                              to: newYear,
                            });
                          }
                        }}
                      />
                    </>
                  ) : (
                    `M.E - Total Intake ${pgData.year}`
                  )}
                </h4>
              </center>

              <table className="intake-table">
                <thead>
                  <tr>
                    <th>PG Courses</th>
                    <th>Government Quota Intake</th>
                    <th>Management Quota Intake</th>
                    <th>Total Intake</th>
                    {/* {pgedit && <th>Actions</th>} */}
                  </tr>
                </thead>
                <tbody>
                  {pg.map((item, rowIndex) => {
                    const [courseName, courseDetails] = Object.entries(item)[0];
                    return (
                      <tr key={rowIndex} className="bg-prim dark:bg-drkp">
                        <td>
                          {/* {pgedit ? (
                            <input
                              type="text"
                              value={courseName}
                              className="admin-mein"
                              onBlur={(e) =>
                                handleCourseNameChange(rowIndex, e.target.value)
                              }
                              onChange={(e) => {
                                const dataCopy = { ...pgData };
                                const pgArray = [...dataCopy.PG];
                                const [, details] = Object.entries(
                                  pgArray[rowIndex],
                                )[0];
                                pgArray[rowIndex] = {
                                  [e.target.value]: details,
                                };
                                setpgData({ ...dataCopy, PG: pgArray });
                              }}
                            />
                          ) : ( */}
                          {/* )} */}
                            {courseName}
                        </td>
                        <td>
                          {pgedit ? (
                            <input
                              type="number"
                              value={
                                courseDetails["Government Quota Intakes"] || ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  rowIndex,
                                  "Government Quota Intakes",
                                  e.target.value,
                                )
                              }
                              className="admin-ugin"
                            />
                          ) : (
                            courseDetails["Government Quota Intakes"]
                          )}
                        </td>
                        <td>
                          {pgedit ? (
                            <input
                              type="number"
                              value={
                                courseDetails["Management Quota Intakes"] || ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  rowIndex,
                                  "Management Quota Intakes",
                                  e.target.value,
                                )
                              }
                              className="admin-ugin"
                            />
                          ) : (
                            courseDetails["Management Quota Intakes"]
                          )}
                        </td>
                        <td>{courseDetails["Total Intakes"]}</td>
                        {/* {pgedit && (
                          <td className="text-center">
                            <input
                              type="checkbox"
                              checked={selectedRows?.includes(rowIndex)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedRows((prev) => [
                                    ...prev,
                                    rowIndex,
                                  ]);
                                } else {
                                  setSelectedRows((prev) =>
                                    prev.filter((i) => i !== rowIndex),
                                  );
                                }
                              }}
                            />
                          </td>
                        )} */}
                      </tr>
                    );
                  })}
                  {pgedit && (
                    <tr>
                      {/* <td colSpan={5}>
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={handleAddNewRow}
                            className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                          >
                            <Plus size={16} /> Add
                          </button>

                          {selectedRows.length > 0 && (
                            <button
                              onClick={() => setShowDeleteModal(true)}
                              className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              <Trash2 size={16} /> Delete
                            </button>
                          )}
                        </div>
                      </td> */}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ✅ Save button only in edit mode */}
          {pgedit && (
            <div className="flex gap-2 mt-4 justify-end mr-12">
              <button
                onClick={handleCancel}
                className="px-4 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSaveClick();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#FDCC03] text-black rounded-lg shadow-md hover:bg-yellow-500 transition "
              >
                Save
              </button>
            </div>
          )}

          {/* ✅ Request Changes button only after Save */}
          {!pgedit && savedOnce && (
            <div className="flex justify-end gap-3 mt-6 mb-4 mr-12">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
                onClick={() => handleDiscardChanges()}
              >
                Discard Changes
              </button>
              <button
                className="px-4 py-2 bg-[#FDCC03] text-white rounded flex items-center gap-2"
                onClick={() => {
                  setShowPopup(true);
                }}
              >
                <Send size={16} /> Request
              </button>
            </div>
          )}

          <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[350px]">
            <h2 className="font-semibold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete selected faculties?</p>
            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={handleDeleteSelected}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[750px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Final Request</h2>
            <p className="text-red-600 mb-4">
              <span className="font-medium">Note:</span> Your changes will stay
              pending until approved by the superior admin. Once approved, they
              will be applied automatically to the live site.
            </p>

            <table className=" border w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className=" border p-2">Action</th>
                  <th className=" border p-2">field</th>
                  <th className="border p-2 ">changes</th>
                  <th className=" border p-2">Undo</th>
                </tr>
              </thead>
              <tbody>
  {(() => {
    const rows = [];

    if (JSON.stringify(originalData?.PG) !== JSON.stringify(pgData?.PG)) {
      rows.push({ type: "edited", label: "Intake" });
    }

    if (originalData?.year !== pgData?.year) {
      rows.push({ type: "YearEdited", label: "Year" });
    }

    if (!rows.length) {
      return (
        <tr>
          <td colSpan={4}>No pending changes.</td>
        </tr>
      );
    }

    return rows.map((row, idx) => (
      <tr key={idx}>
        <td className="border p-2 capitalize">{row.type}</td>
        <td className="border p-2">M.E</td>
        <td className="border p-2">
          <b>{row.label}</b>
        </td>
        <td className="p-2 border">
                        <button onClick={() => handleUndoChange(row.label)}>
  <X size={16} className="text-red-500 hover:text-red-700" />
</button>
                      </td>
      </tr>
    ));
  })()}
</tbody>

            </table>

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-md"
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded bg-secd dark:drks text-text hover:text-drkt ${
                  loading ? "cursor-progress" : "hover:bg-[#800000]"
                }`}
                onClick={handleFinalRequestConfirm}
                disabled={loading}
              >
                {loading ? "Processing..." : "Final Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminME;