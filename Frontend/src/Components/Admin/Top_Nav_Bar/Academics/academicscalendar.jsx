import React, { useEffect, useState } from "react";
import axios from "axios";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import "../../Second_Nav_Bar/Accredation/nirf.css";
import { Pencil, Plus, Eye, Save, Trash2, Send } from "lucide-react";
import { toast,ToastContainer } from "react-toastify";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

const AdminAcadamiccal = ({ toggle, theme }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [academicCal, setAcademicData] = useState(null);
  const [editedData, setEditedData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [changes, setChanges] = useState([]);
  const { sendRequest, loading, error } = useAdminRequest();

  // ✅ For deletion
  const [selected, setSelected] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("blob:")
      ? path
      : path?.startsWith("http")
        ? path
        : `${BASE_URL}${path}`;
  };

  const getChanges = () => {
    const changes = [];

    const origMap = new Map(originalData.map((r) => [r.__uid, r]));
    const editMap = new Map(editedData.map((r) => [r.__uid, r]));

    // Added or Edited
    editedData.forEach((item) => {
      if (!origMap.has(item.__uid)) {
        changes.push({
          type: "add",
          year: item.year,
          __uid: item.__uid,
        });
      } else {
        const orig = origMap.get(item.__uid);

        if (orig.year !== item.year) {
          changes.push({
            type: "year",
            year: item.year,
            __uid: item.__uid,
          });
        }

        if (item.oddFile || item.oddRemoved) {
          changes.push({ type: "odd", year: item.year, __uid: item.__uid });
        }

        if (item.evenFile || item.evenRemoved) {
          changes.push({ type: "even", year: item.year, __uid: item.__uid });
        }
      }
    });

    // Deleted
    originalData.forEach((item) => {
      if (!editMap.has(item.__uid)) {
        changes.push({
          type: "delete",
          year: item.year,
          __uid: item.__uid,
        });
      }
    });

    return changes;
  };

  // Fetch academic calendar data
  const fetchData = async () => {
    try {
      const response = await axios.post("/api/main-backend/academics", {
        type: "academic_calendar",
      });
      const data = response.data.data;
      setAcademicData(data);
      const addUid = (arr) =>
        arr.map((item) => ({
          ...item,
          __uid: item.__uid || `${Date.now()}_${Math.random()}`,
        }));

      const withUid = addUid(data);

      setEditedData(JSON.parse(JSON.stringify(withUid)));
      setOriginalData(JSON.parse(JSON.stringify(withUid)));
    } catch (error) {
      console.error("Error fetching Calendar Data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const detectedChanges = getChanges();
    setChanges(detectedChanges);
    setHasChanges(detectedChanges.length > 0);
  }, [editedData]);

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

  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
  }

  // Handle year change
  const handleYearChange = (i, value) => {
    const updated = [...editedData];
    updated[i].year = value;
    setEditedData(updated);
    setHasChanges(true);

    setChanges((prev) => {
      const exists = prev.find((c) => c.index === i && c.type === "year");
      if (exists) {
        return prev.map((c) =>
          c.index === i && c.type === "year" ? { ...c, newValue: value } : c,
        );
      }
      return [...prev, { index: i, type: "year", newValue: value }];
    });
  };

  // Handle file replace/upload
  const handleFileReplace = (i, type, file) => {
    if (!file) return;
    const updated = [...editedData];
    const fakePath = URL.createObjectURL(file);

    if (type === "odd") {
      updated[i].oddFile = file;
      updated[i].oddPreview = fakePath;
      updated[i].oddRemoved = false;
    } else if (type === "even") {
      updated[i].evenFile = file;
      updated[i].evenPreview = fakePath;
      updated[i].evenRemoved = false;
    }

    setEditedData(updated);
    setHasChanges(true);

    setChanges((prev) => {
      const exists = prev.find((c) => c.index === i && c.type === type);
      if (exists) {
        return prev.map((c) =>
          c.index === i && c.type === type ? { ...c, newValue: file.name } : c,
        );
      }
      return [...prev, { index: i, type, newValue: file.name }];
    });
  };

  // Handle local save
  const handleGlobalSave = () => {
    setIsSaved(true);
    setIsEditing(false);
    setHasChanges(false);
  };

  // Discard all changes
  const handleDiscard = () => {
    setEditedData(JSON.parse(JSON.stringify(originalData)));
    setIsSaved(false);
    setHasChanges(false);
    setChanges([]);
    toast.info("Editing cancelled. Data reverted to original.");
  };
  const buildPayload = () => {
    const payload = [];
    const files = [];

    const origMap = new Map(originalData.map((r) => [r.__uid, r]));
    const editMap = new Map(editedData.map((r) => [r.__uid, r]));

    editedData.forEach((item) => {
      const orig = origMap.get(item.__uid);

      let newPdfPaths = [...(orig?.pdf_path || ["", ""])];

      // Ensure array always has 2 slots
      if (newPdfPaths.length < 2) {
        newPdfPaths = [newPdfPaths[0] || "", newPdfPaths[1] || ""];
      }

      // ---------- ODD FILE ----------
      if (item.oddFile) {
        newPdfPaths[0] = `/static/pdfs/academic_calendar/${item.oddFile.name}`;
        files.push(item.oddFile);
      } else if (item.oddRemoved) {
        newPdfPaths[0] = "";
      }

      // ---------- EVEN FILE ----------
      if (item.evenFile) {
        newPdfPaths[1] = `/static/pdfs/academic_calendar/${item.evenFile.name}`;
        files.push(item.evenFile);
      } else if (item.evenRemoved) {
        newPdfPaths[1] = "";
      }

      // ---------- INSERT ----------
      if (!orig) {
        payload.push({
          collectionName: "academics",
          collection_type: "academic_calendar",
          action: "insert",
          title: "insert academic calendar",
          meta_data: {
            year: item.year,
            pdf_path: newPdfPaths,
          },
        });
        return;
      }

      // ---------- UPDATE ----------
      if (
        orig.year !== item.year ||
        item.oddFile ||
        item.evenFile ||
        item.oddRemoved ||
        item.evenRemoved
      ) {
        payload.push({
          collectionName: "academics",
          collection_type: "academic_calendar",
          action: "update",
          title: "update academic calendar",
          meta_data: {
            year: item.year,
            pdf_path: newPdfPaths,
          },
          original_data: {
            year: orig.year,
            pdf_path: orig.pdf_path || [],
          },
        });
      }
    });

    // ---------- DELETE ----------
    originalData.forEach((item) => {
      if (!editMap.has(item.__uid)) {
        payload.push({
          collectionName: "academics",
          collection_type: "academic_calendar",
          action: "delete",
          title: "delete academic year",
          meta_data: {
            year: item.year,
          },
        });
      }
    });
    console.log("FINAL PAYLOAD");
    console.log(payload);
    console.log("FILES");
    console.log(files);

    return { payload, files };
  };

  // Handle final request from modal
  const handleRequestConfirm = async () => {
    console.log("handleRequestConfirm CALLED");
    const { payload, files } = buildPayload();

    if (!payload.length) {
      toast.error("No changes to submit!");
      return;
    }
    console.log("payload", payload);
    console.log("Files", files);
    

    try {
      await sendRequest(payload, files);

      toast.success("Request sent successfully!");
      setShowRequestModal(false);

      setChanges([]);
      setIsSaved(false);
      setHasChanges(false);
      setIsEditing(false);

      await fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to send request");
    }
  };

  // ✅ Toggle checkbox selection
  const toggleSelect = (i) => {
    setSelected((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
    );
  };

  // ✅ Delete selected cards
  const handleDeleteSelected = () => {
    const updated = editedData.filter((_, i) => !selected.includes(i));

    setEditedData(updated);
    setSelected([]);
    setShowDeleteConfirm(false);

    setIsEditing(true);
    setIsSaved(false);

  };

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/academicsbanner.webp"
        headerText="ACADEMIC CALENDAR"
        subHeaderText="Ensuring academic clarity and structured timelines for efficient learning."
      />
      <ToastContainer position="bottom-right" autoClose={3000} />
      {academicCal ? (
        <div className="nirf-page relative">
          {/* ✅ Edit Button always visible when not editing */}
          {!isEditing && (
            <div className="absolute top-6 right-6">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setIsSaved(false);
                }}
                className="flex items-center mr-4 gap-2 px-3 py-2 bg-[#FDCC03] text-text font-medium rounded-xl shadow-md hover:bg-[#800000] hover:text-prim hover:shadow-lg active:scale-95 transition-all duration-200"
              >
                <Pencil size={18} />
                <span>Edit</span>
              </button>
            </div>
          )}

          <h2 className="text-center text-[24px] text-brwn dark:text-drkt font-bold pt-[35px]">
            ACADEMIC CALENDAR
            <div className="w-[255px] h-0.5 bg-[#eab308] mx-auto mt-1 rounded"></div>
          </h2>

          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="grid grid-cols-3 md:grid-cols-3 gap-8 text-center">
              {editedData?.map((item, i) => {
                const oddPath = item.oddPreview || item.pdf_path?.[0] || "";

                const evenPath = item.evenPreview || item.pdf_path?.[1] || "";

                return (
                  <div
                    key={i}
                    className="relative bg-prim dark:bg-drkb border p-6 rounded-lg shadow hover:shadow-lg transition"
                  >
                    {/* ✅ Checkbox only in editing mode */}
                    {isEditing && (
                      <input
                        type="checkbox"
                        checked={selected.includes(i)}
                        onChange={() => toggleSelect(i)}
                        className="absolute top-1 right-2 w-5 h-5 cursor-pointer"
                      />
                    )}

                    {isEditing ? (
                      <input
                        type="text"
                        value={item.year}
                        onChange={(e) => handleYearChange(i, e.target.value)}
                        className="text-xl font-bold text-center w-full border rounded-md p-1"
                      />
                    ) : (
                      <h3 className="text-xl font-bold text-brwn dark:text-drkt mb-4 inline-block pb-1">
                        {item.year}
                      </h3>
                    )}

                    <div className="flex flex-col items-center space-y-3 text-blue-600 mt-4">
                      {isEditing && (
                        <>
                          {/* Odd Sem */}
                          <div className="flex flex-col items-center space-y-3 text-blue-600 mt-4">
                            {isEditing && (
                              <>
                                {/* Odd Sem */}
                                <div className="flex items-center gap-3">
                                  <span className="text-black dark:text-white">
                                    Odd Sem
                                  </span>
                                  <input
                                    type="file"
                                    accept="application/pdf"
                                    id={`odd-file-${i}`}
                                    className="hidden"
                                    onChange={(e) =>
                                      handleFileReplace(
                                        i,
                                        "odd",
                                        e.target.files[0],
                                      )
                                    }
                                  />
                                  <label
                                    htmlFor={`odd-file-${i}`}
                                    className="px-3 py-1 bg-[#FDCC03] text-text rounded-md shadow hover:bg-[#800000] hover:text-white cursor-pointer hover:text-prim"
                                  >
                                    {oddPath ? "Replace" : "Upload"}
                                  </label>
                                  {oddPath && (
                                    <>
                                      <button
                                        onClick={() =>
                                          window.open(
                                            UrlParser(oddPath),
                                            "_blank",
                                          )
                                        }
                                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                      >
                                        <Eye size={18} />
                                      </button>
                                      <button
                                        onClick={() => {
                                          const updated = [...editedData];
                                          updated[i].oddFile = null;
                                          updated[i].oddPreview = null;
                                          updated[i].pdf_path[0] = "";
                                          updated[i].oddRemoved = true;
                                          updated[i].evenRemoved =
                                            updated[i].evenRemoved || false;
                                          setEditedData(updated);
                                          setHasChanges(true);
                                        }}
                                        className="p-2 rounded-full hover:bg-red-200 dark:hover:bg-red-900 transition"
                                      >
                                        <Trash2
                                          size={18}
                                          className="text-red-600"
                                        />
                                      </button>
                                    </>
                                  )}
                                </div>

                                {/* Even Sem */}
                                <div className="flex items-center gap-3">
                                  <span className="text-black dark:text-white">
                                    Even Sem
                                  </span>
                                  <input
                                    type="file"
                                    accept="application/pdf"
                                    id={`even-file-${i}`}
                                    className="hidden"
                                    onChange={(e) =>
                                      handleFileReplace(
                                        i,
                                        "even",
                                        e.target.files[0],
                                      )
                                    }
                                  />
                                  <label
                                    htmlFor={`even-file-${i}`}
                                    className="px-3 py-1 bg-[#FDCC03] text-black rounded-md shadow hover:bg-[#800000] hover:text-white cursor-pointer"
                                  >
                                    {evenPath ? "Replace" : "Upload"}
                                  </label>
                                  {evenPath && (
                                    <>
                                      <button
                                        onClick={() =>
                                          window.open(
                                            UrlParser(evenPath),
                                            "_blank",
                                          )
                                        }
                                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                      >
                                        <Eye size={18} />
                                      </button>
                                      <button
                                        onClick={() => {
                                          const updated = [...editedData];
                                          updated[i].evenFile = null;
                                          updated[i].evenPreview = null;
                                          updated[i].pdf_path[1] = "";
                                          updated[i].evenRemoved = true;
                                          updated[i].oddRemoved =
                                            updated[i].oddRemoved || false;
                                          setEditedData(updated);
                                          setHasChanges(true);
                                        }}
                                        className="p-2 rounded-full hover:bg-red-200 dark:hover:bg-red-900 transition"
                                      >
                                        <Trash2
                                          size={18}
                                          className="text-red-600"
                                        />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </>
                            )}

                            {!isEditing && (
                              <>
                                {oddPath && (
                                  <a
                                    href={UrlParser(oddPath)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-blue-800 dark:text-drka"
                                  >
                                    Odd Sem
                                  </a>
                                )}
                                {evenPath && (
                                  <a
                                    href={UrlParser(evenPath)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-blue-800 dark:text-drka"
                                  >
                                    Even Sem
                                  </a>
                                )}
                              </>
                            )}
                          </div>
                        </>
                      )}

                      {!isEditing && (
                        <>
                          {oddPath && (
                            <a
                              href={UrlParser(oddPath)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-blue-800 dark:text-drka"
                            >
                              Odd Sem
                            </a>
                          )}
                          {evenPath && (
                            <a
                              href={UrlParser(evenPath)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-blue-800 dark:text-drka"
                            >
                              Even Sem
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {isEditing && (
                <div
                  onClick={() =>
                    setEditedData([
                      ...editedData,
                      {
                        __uid: `${Date.now()}_${Math.random()}`,
                        year: "New Year",
                        pdf_path: ["", ""],
                        oddFile: null,
                        evenFile: null,
                        oddRemoved: false,
                        evenRemoved: false,
                        oddPreview: null,
                        evenPreview: null,
                      },
                    ])
                  }
                  className="border-2 border-dashed border-gray-400 flex items-center justify-center p-6 rounded-lg cursor-pointer hover:border-yellow-500 transition"
                >
                  <Plus size={32} className="text-gray-600" />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
          <LoadComp txt={""} />
        </div>
      )}

      {selected.length > 0 && (
        <div className="w-full flex justify-center my-4">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-5 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition flex items-center gap-2"
          >
            <Trash2 size={18} /> Delete ({selected.length})
          </button>
        </div>
      )}

      {/* Action Buttons */}
      {isEditing && (
        <div className="w-full flex justify-end pr-6 pb-6 gap-4">
          <button
            onClick={() => {
              setEditedData(JSON.parse(JSON.stringify(originalData)));
              setIsEditing(false);
              setHasChanges(false);
              setChanges([]);
              //toast.info("Editing cancelled.");
            }}
            className="px-3 py-2 bg-gray-400 text-white rounded-lg shadow hover:bg-gray-500 transition"
          >
            Cancel
          </button>

          {hasChanges && (
            <button
              onClick={handleGlobalSave}
              className="flex items-center gap-2 px-3  mr-4 py-2 bg-[#fdcc03] text-text rounded-lg shadow hover:bg-[#800000] transition hover:text-prim"
            >
              
              <span>Save</span>
            </button>
          )}
        </div>
      )}

      {/* After Save */}
      {isSaved && !isEditing && (
        <div className="w-full flex justify-end pr-6 pb-6 gap-4">
          <button
            onClick={handleDiscard}
            className="px-5 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-400 transition"
          >
            Discard Changes
          </button>
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-2 px-5 py-2 mr-4 bg-[#fdcc03] text-text rounded-lg shadow hover:bg-[#800000] transition hover:text-prim"
          >
            <Send size={18} />
            Request
          </button>
        </div>
      )}

      {/* ✅ Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[400px]">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete <b>{selected.length}</b> selected
              item{selected.length > 1 ? "s" : ""}?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[750px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Request
            </h2>
            <p className="text-sm text-red-600 mb-4">
              Note: Your changes will stay pending until approved by the
              superior admin. Once approved, they will go live.
            </p>

            <table className="w-full text-sm text-text dark:text-drkt border">
              <thead className="bg-gray-100 dark:bg-gray-800 text-center">
                <tr>
                  <th className="py-2 border">Action</th>
                  <th className="py-2 border">Section</th>
                  <th className="py-2 border">Changes</th>
                  <th className="py-2 border">Undo</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((change, index) => (
                  <tr key={index} className="border text-center">
                    <td className="py-2 text-blue-600 font-semibold">
                      {change.type === "delete" ? "Deleted" : "Edited"}
                    </td>
                    <td className="py-2">Academic Year {change.year}</td>

                    <td className="py-2 flex items-center justify-center gap-2">
                      <span className="px-2 py-1 bg-yellow-100 text-black rounded-md">
                        {change.type === "year"
                          ? "Year"
                          : change.type === "delete"
                            ? "Deleted"
                            : change.type}
                      </span>
                    </td>
                    <td>
                      {/* ✅ X Button rollback */}
                      <button
                        onClick={() => {
                          const change = changes[index];

                          setEditedData((prev) => {
                            let updated = [...prev];

                            switch (change.type) {
                              // Undo newly added academic calendar
                              case "add":
                                updated = updated.filter(
                                  (item) => item.__uid !== change.__uid,
                                );
                                break;

                              // Undo year/name change
                              case "year": {
                                const row = updated.find(
                                  (item) => item.__uid === change.__uid,
                                );
                                if (row) {
                                  const original = originalData.find(
                                    (o) => o.__uid === row.__uid,
                                  );

                                  if (original) {
                                    row.year = original.year;
                                  }
                                }
                                break;
                              }

                              // Undo Odd PDF change
                              case "odd": {
                                const row = updated.find(
                                  (item) => item.__uid === change.__uid,
                                );
                                if (row) {
                                  const original = originalData.find(
                                    (o) => o.__uid === row.__uid,
                                  );

                                  if (original) {
                                    row.oddFile = null;
                                    row.oddPreview = null;
                                    row.oddRemoved = false;
                                    row.pdf_path[0] =
                                      original.pdf_path?.[0] || "";
                                  }
                                }
                                break;
                              }

                              // Undo Even PDF change
                              case "even": {
                                const row = updated.find(
                                  (item) => item.__uid === change.__uid,
                                );
                                if (row) {
                                  const original = originalData.find(
                                    (o) => o.__uid === row.__uid,
                                  );

                                  if (original) {
                                    row.evenFile = null;
                                    row.evenPreview = null;
                                    row.evenRemoved = false;
                                    row.pdf_path[1] =
                                      original.pdf_path?.[1] || "";
                                  }
                                }
                                break;
                              }

                              // Undo delete
                              case "delete": {
                                const original = originalData.find(
                                  (o) => o.__uid === change.__uid,
                                );
                                if (original) {
                                  updated.push(
                                    JSON.parse(JSON.stringify(original)),
                                  );
                                }
                                break;
                              }

                              default:
                                break;
                            }

                            return updated;
                          });
                        }}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestConfirm}
                className="px-4 py-2 bg-[#fdcc03] text-text rounded-lg hover:bg-[#800000] hover:text-prim transition"
              >
                Confirm Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminAcadamiccal;
