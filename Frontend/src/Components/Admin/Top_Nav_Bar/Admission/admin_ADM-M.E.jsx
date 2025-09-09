import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ADM-M.E.css";
import Banner from "../../../Banner";
import LoadComp from "../../../LoadComp";
import { useNavigate } from "react-router";
import {
  SaveAll,
  SquarePen,
  PlusCircle,
  Trash2,
  CircleX,
  Send,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminME = ({ theme, toggle }) => {
  const [pgData, setpgData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const pg = pgData?.PG || [];
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();

  const [pgedit, setpgEdit] = useState(false);
  const [savedOnce, setSavedOnce] = useState(false);

  // Popup & changes state
  const [showPopup, setShowPopup] = useState(false);
  const [changeList, setChangeList] = useState([]);

  // Refactored helper for logging changes
  const logChange = (type, section, details) => {
    setChangeList((prev) => {
      // Create a new change object.
      const newChange = { type, section, ...details };

      // Find if a similar change already exists.
      const existingIndex = prev.findIndex(c => {
        // For 'added' or 'deleted' changes, check by the row's key.
        if (["added", "deleted"].includes(c.type) && c.row && newChange.row) {
          return Object.keys(c.row)[0] === Object.keys(newChange.row)[0];
        }
        // For 'edited' changes, check by the course name and field.
        if (c.type === "edited" && c.courseName === newChange.courseName && c.field === newChange.field) {
          return true;
        }
        return false;
      });

      // If an existing change is found, update it. Otherwise, add the new change.
      if (existingIndex !== -1) {
        const updatedList = [...prev];
        updatedList[existingIndex] = newChange;
        return updatedList;
      } else {
        return [...prev, newChange];
      }
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

  // ✅ Add row
  const handleAddNewRow = () => {
    const newRow = {
      "": {
        "Government Quota Intakes": 0,
        "Management Quota Intakes": 0,
        "Total Intakes": 0,
      },
    };
    setpgData({ ...pgData, PG: [...pg, newRow] });
    logChange("added", "PG", { row: newRow });
  };

  // ✅ Delete row
  const handleDeleteRow = (rowIndex) => {
    if (window.confirm("Are you sure you want to delete this row?")) {
      const dataCopy = { ...pgData };
      const pgArray = [...dataCopy.PG];
      const removedRow = pgArray[rowIndex];
      pgArray.splice(rowIndex, 1);
      setpgData({ ...pgData, PG: pgArray });
      logChange("deleted", "PG", { row: removedRow });
      toast.info("Row deleted. It will be removed on final request.");
    }
  };

  // ✅ Edit course name
  const handleCourseNameChange = (rowIndex, newName) => {
    const dataCopy = { ...pgData };
    const pgArray = [...dataCopy.PG];
    const [oldName, details] = Object.entries(pgArray[rowIndex])[0];
    pgArray[rowIndex] = { [newName]: details };
    setpgData({ ...pgData, PG: pgArray });
    logChange("renamed", "PG", { from: oldName, to: newName });
  };

  // ✅ Edit intake values
  const handleInputChange = (rowIndex, field, value) => {
    const updatedData = { ...pgData };
    const pgArray = [...updatedData.PG];
    const [courseName, details] = Object.entries(pgArray[rowIndex])[0];
    const oldValue = details[field];

    const updated = { ...details, [field]: value === "" ? 0 : Number(value) };
    const gov = Number(updated["Government Quota Intakes"]) || 0;
    const man = Number(updated["Management Quota Intakes"]) || 0;
    updated["Total Intakes"] = gov + man;

    pgArray[rowIndex] = { [courseName]: updated };
    setpgData({ ...updatedData, PG: pgArray });
    logChange("edited", "PG", { courseName, field, from: oldValue, to: updated[field] });
  };

  // ✅ Undo change (restores state)
  const handleUndoChange = (idx) => {
    const change = changeList[idx];
    let updatedData = { ...pgData };
    let pgArray = [...updatedData.PG];

    if (change.type === "added") {
      updatedData.PG = pgArray.filter(
        (row) => Object.keys(row)[0] !== Object.keys(change.row)[0]
      );
    } else if (change.type === "deleted") {
      updatedData.PG = [...pgArray, change.row];
    } else if (change.type === "renamed") {
      pgArray.forEach((row, i) => {
        if (Object.keys(row)[0] === change.to) {
          const details = Object.values(row)[0];
          pgArray[i] = { [change.from]: details };
        }
      });
      updatedData.PG = pgArray;
    } else if (change.type === "edited") {
      pgArray.forEach((row, i) => {
        if (Object.keys(row)[0] === change.courseName) {
          const details = Object.values(row)[0];
          details[change.field] = change.from;
          details["Total Intakes"] = (details["Government Quota Intakes"] || 0) + (details["Management Quota Intakes"] || 0);
        }
      });
      updatedData.PG = pgArray;
    }

    setpgData(updatedData);
    setChangeList((prev) => prev.filter((_, i) => i !== idx));
    toast.info("Change undone");
  };

  // ✅ Final request
  const handleFinalRequest = async () => {
    try {
      await axios.post("/api/admin/request-changes", {
        changes: changeList,
        data: pgData,
      });
      toast.success("Request submitted for approval!");
      setChangeList([]);
      setShowPopup(false);
      setSavedOnce(false); // reset after request
    } catch (err) {
      toast.error("Failed to submit request!");
    }
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
              <div className="flex justify-end">
                <button
                  className="admin-pgedit flex gap-1"
                  onClick={() => setpgEdit(!pgedit)}
                >
                  {pgedit ? (
                    <>
                      <CircleX /> Cancel
                    </>
                  ) : (
                    <>
                      <SquarePen /> Edit
                    </>
                  )}
                </button>
              </div>
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
                        onChange={(e) =>
                          setpgData({ ...pgData, year: e.target.value })
                        }
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
                    {pgedit && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {pg.map((item, rowIndex) => {
                    const [courseName, courseDetails] = Object.entries(item)[0];
                    return (
                      <tr key={rowIndex} className="bg-prim dark:bg-drkp">
                        <td>
                          {pgedit ? (
                            <input
                              type="text"
                              value={courseName}
                              className="admin-nlugin"
                              onChange={(e) =>
                                handleCourseNameChange(rowIndex, e.target.value)
                              }
                            />
                          ) : (
                            courseName
                          )}
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
                                  e.target.value
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
                                  e.target.value
                                )
                              }
                              className="admin-ugin"
                            />
                          ) : (
                            courseDetails["Management Quota Intakes"]
                          )}
                        </td>
                        <td>{courseDetails["Total Intakes"]}</td>
                        {pgedit && (
                          <td className="text-center">
                            <button
                              className="text-red-600 hover:text-red-800"
                              onClick={() => handleDeleteRow(rowIndex)}
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {pgedit && (
                <div className="flex justify-end mt-3">
                  <button
                    className="admin-edit-pg flex items-center gap-1"
                    onClick={handleAddNewRow}
                  >
                    <PlusCircle size={16} />
                    <span className="btn-text">Add New</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ✅ Save button only in edit mode */}
          {pgedit && (
            <div className="admin-controls flex flex-col items-end gap-2 mt-4">
              <button
                className="admin-edit-ug active flex items-center gap-1"
                onClick={handleSaveClick}
              >
                <SaveAll size={16} />
                <span className="btn-text">Save</span>
              </button>
            </div>
          )}

          {/* ✅ Request Changes button only after Save */}
          {!pgedit && savedOnce && (
            <div className="admin-controls flex justify-end mt-4">
              <button
                className="admin-edit-ug flex gap-1"
                onClick={() => setShowPopup(true)}
              >
                <Send /> Request changes
              </button>
            </div>
          )}

          <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
      )}

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-[500px]">
            <h2 className="text-lg font-semibold mb-4">
              Final Request for the Changes
            </h2>
            <p className="text-red-600 mb-4">
              <span className="font-medium">Note:</span> Your changes will stay
              pending until approved by the superior admin. Once approved, they
              will be applied automatically to the live site.
            </p>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Action</th>
                  <th className="text-left p-2">Details</th>
                  <th className="text-left p-2">Undo</th>
                </tr>
              </thead>
              <tbody>
                {changeList.length === 0 ? (
                  <tr>
                    <td className="p-2" colSpan={3}>
                      No pending changes.
                    </td>
                  </tr>
                ) : (
                  changeList.map((req, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2 capitalize">{req.type}</td>
                      <td className="p-2">
                        {req.type === "edited" ? (
                          <>
                            <b>{req.courseName} - {req.field}</b>: {req.from} → {req.to}
                          </>
                        ) : req.type === "renamed" ? (
                            <>Renamed <b>{req.from}</b> to <b>{req.to}</b></>
                        ) : req.type === "added" ? (
                          <>
                            Added: <b>{Object.keys(req.row)[0]}</b>
                          </>
                        ) : req.type === "deleted" ? (
                          <>
                            Deleted: <b>{Object.keys(req.row)[0]}</b>
                          </>
                        ) : null}
                      </td>
                      <td className="p-2">
                        <button
                          className="nss-btn nss-btn-undo flex items-center gap-1"
                          onClick={() => handleUndoChange(idx)}
                        >
                          <CircleX size={16} className="text-red-500 hover:text-red-700" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
                onClick={handleFinalRequest}
              >
                Final Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminME;