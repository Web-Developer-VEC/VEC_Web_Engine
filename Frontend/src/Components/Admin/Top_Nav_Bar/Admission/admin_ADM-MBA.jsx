import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./ADM-MBA.css";
import { FaLink } from "react-icons/fa";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router-dom";
import {Trash2, CircleX,Send,Pencil,Plus,X,Eye, } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminMBA = ({ theme, toggle }) => {
  const [mbaData, setMbaData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const navigate = useNavigate();
 const [TableData,setTableData]=useState();
  const [isEditing, setIsEditing] = useState(false);
  const [editableYear, setEditableYear] = useState("");
  const [editableRows, setEditableRows] = useState([]);
  const [deletedRows, setDeletedRows] = useState([]);
  const [govLinkName, setGovLinkName] = useState("");
  const [govLinkFile, setGovLinkFile] = useState(null);
  const [mgmtLinkName, setMgmtLinkName] = useState("");
  const [mgmtLinkFile, setMgmtLinkFile] = useState(null);
  const [showDeleteModal,setShowDeleteModal] = useState();
  const [showPopup, setShowPopup] = useState(false);
  const [changeList, setChangeList] = useState([]);
  const [isSaved, setIsSaved] = useState(false);

  console.log(govLinkFile);
  

  const originalRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`/api/main-backend/admission`, {
          type: "mba",
        });

        const data = response.data?.data || {};
        setMbaData(data);
        originalRef.current = data;

        setEditableYear(data?.year || "");
        const initialRows = [
          {
            course: "Master of Business Administration (MBA)",
            governmentQuota: data?.MBA?.["Government Quota Intakes"] || "",
            managementQuota: data?.MBA?.["Management Quota Intakes"] || "",
            totalIntake: data?.MBA?.["Total Intakes"] || "",
          },
        ];
        setEditableRows(initialRows);
        setGovLinkName(data?.MBA_Government?.MBA_Government_link_name || "");
        setMgmtLinkName(data?.MBA_Management?.MBA_Management_link_name || "");
      } catch (error) {
        console.error("Error fetching data:", error?.message);
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

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
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
  }

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `${BASE_URL || ""}${path}`;
  };

  const mba = mbaData?.MBA || {};
  const year = mbaData?.year;
  const MBA_Government = mbaData?.MBA_Government || {};
  const MBA_Management = mbaData?.MBA_Management || {};

  const handlePdfOpen = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };
const collectChangeList = () => {
  const changes = [];
  const original = originalRef.current || {};

  // Original rows
  const originalRows = [
    {
      course: "Master of Business Administration (MBA)",
      governmentQuota: original?.MBA?.["Government Quota Intakes"] || "",
      managementQuota: original?.MBA?.["Management Quota Intakes"] || "",
      totalIntake: original?.MBA?.["Total Intakes"] || "",
    },
  ];

  // 1️⃣ Edited Year
  if (editableYear !== original?.year) {
    changes.push({ type: "edited", section: "Year" });
  }

  // 2️⃣ Government quota changes
  const govChanges = [];
  if (govLinkName.trim() !== (original?.MBA_Government?.MBA_Government_link_name || "")) govChanges.push("Link Name");
  if (govLinkFile) govChanges.push("File Uploaded");
  if (govChanges.length > 0) changes.push({ type: "edited", section: "Government Quota", changes: govChanges.join(", ") });

  // 3️⃣ Management quota changes
  const mgmtChanges = [];
  if (mgmtLinkName.trim() !== (original?.MBA_Management?.MBA_Management_link_name || "")) mgmtChanges.push("Link Name");
  if (mgmtLinkFile) mgmtChanges.push("File Uploaded");
  if (mgmtChanges.length > 0) changes.push({ type: "edited", section: "Management Quota", changes: mgmtChanges.join(", ") });

  // 4️⃣ Deleted rows
  deletedRows.forEach(row => {
    changes.push({
      type: "deleted",
      section: row.course || row.section || "Unknown Course"
    });
  });

  // 5️⃣ Added rows
  editableRows.forEach(row => {
    const existsInOriginal = originalRows.some(orig => orig.course === row.course);
    if (!existsInOriginal) {
      changes.push({ type: "added", section: row.course });
    }
  });

  // 6️⃣ Edited rows in table
  editableRows.forEach(row => {
    const orig = originalRows.find(o => o.course === row.course);
    if (orig) {
      if (
        row.governmentQuota !== orig.governmentQuota ||
        row.managementQuota !== orig.managementQuota ||
        row.totalIntake !== orig.totalIntake
      ) {
        changes.push({ type: "edited", section: row.course });
      }
    }
  });

  setChangeList(changes);
};



  const handleRowChange = (index, field, value) => {
    const updatedRows = [...editableRows];
    updatedRows[index][field] = value;

    if (field === "governmentQuota" || field === "managementQuota") {
      const gov = Number(updatedRows[index].governmentQuota) || 0;
      const man = Number(updatedRows[index].managementQuota) || 0;
      updatedRows[index].totalIntake = gov + man;
    }

    setEditableRows(updatedRows);
  };

  const handleAddNew = () => {
    setEditableRows((prev) => [
      ...prev,
      {
        course: "",
        governmentQuota: "",
        managementQuota: "",
        totalIntake: "",
      },
    ]);
  };

  const handleDelete = (index) => {
    const updatedRows = editableRows.filter((_, i) => i !== index);
    setEditableRows(updatedRows);
  };

 

  const handleSave = () => {
    if (!editableYear.trim()) {
      toast.error("Please fill in the year field.");
      collectChangeList(newMBAData);
setIsEditing(false);
setIsSaved(true);
  setChangeList((prev) => [...prev, ...deletedRows]);

      return;

    }

    const isEmptyRow = editableRows.some(row =>
      !row.course.trim() ||
      row.governmentQuota === "" ||
      row.managementQuota === ""
    );

    if (isEmptyRow) {
      toast.error("All course and intake fields must be filled out.");
      return;
    }

    if (!govLinkName.trim() || !mgmtLinkName.trim()) {
        toast.error("Both government and management link names are required.");
        return;
    }
    
    const newMBAData = {
      ...mbaData,
      year: editableYear.trim(),
      MBA: {},
      MBA_Government: {
        ...(mbaData?.MBA_Government || {}),
        MBA_Government_link_name: govLinkName.trim(),
      },
      MBA_Management: {
        ...(mbaData?.MBA_Management || {}),
        MBA_Management_link_name: mgmtLinkName.trim(),
      },
    };

    if (editableRows.length > 0) {
      const first = editableRows[0];
      newMBAData.MBA = {
        "Government Quota Intakes": Number(first.governmentQuota),
        "Management Quota Intakes": Number(first.managementQuota),
        "Total Intakes": Number(first.totalIntake),
      };
    }
    
    if (govLinkFile) {
        newMBAData.MBA_Government.MBA_Government_link = "/uploads/" + govLinkFile.name;
    }
    if (mgmtLinkFile) {
        newMBAData.MBA_Management.MBA_Management_link = "/uploads/" + mgmtLinkFile.name;
    }

    setMbaData(newMBAData);
    collectChangeList(newMBAData);
    setIsEditing(false);
    setIsSaved(true);
    toast.success("Changes saved locally. Submit for approval when ready.");
  };
const handleCheckboxChange = (index, checked) => {
  setEditableRows((prev) =>
    prev.map((row, i) =>
      i === index ? { ...row, isSelected: checked } : row
    )
  );
};
const handleDeleteSelected = () => {
  setEditableRows((prev) => {
    const rowsToDelete = prev.filter((row) => row.isSelected);

    // Only add deleted rows that are not already in deletedRows
    setDeletedRows((prevDeleted) => [
      ...prevDeleted,
      ...rowsToDelete
        .filter(
          (row) => !prevDeleted.some((dRow) => dRow.course === row.course)
        )
        .map((row) => ({
          type: "deleted",
          section: row.course,
        }))
    ]);
    setShowDeleteModal(false);

    // Remove selected rows from table
    return prev.filter((row) => !row.isSelected);
  });
};


const handleDiscardChanges = () => {
  if (window.confirm("Discard all unsaved changes?")) {
    const original = originalRef.current || {};

    setEditableYear(original?.year || "");

    const resetRows = [
      {
        course: "Master of Business Administration (MBA)",
        governmentQuota: original?.MBA?.["Government Quota Intakes"] || "",
        managementQuota: original?.MBA?.["Management Quota Intakes"] || "",
        totalIntake: original?.MBA?.["Total Intakes"] || "",
        isSelected: false,
      },
    ];
    setEditableRows(resetRows);

    setGovLinkName(original?.MBA_Government?.MBA_Government_link_name || "");
    setGovLinkFile(null);
    setMgmtLinkName(original?.MBA_Management?.MBA_Management_link_name || "");
    setMgmtLinkFile(null);

    setChangeList([]);
    setDeletedRows([]); // clear deleted rows
    setIsSaved(false);
    setIsEditing(false);

    toast.info("All changes discarded");
  }
};



 const handleUndoChange = (idx) => {
  const change = changeList[idx];
  const original = originalRef.current || {};

  if (!change) return;

  // Handle different types of changes
  switch (change.type) {
    case "edited":
      if (change.section === "Year") {
        setEditableYear(original?.year || "");
      } else if (change.section === "Government Quota") {
        setGovLinkName(original?.MBA_Government?.MBA_Government_link_name || "");
        setGovLinkFile(null);
        // Also reset the editable row quotas
        setEditableRows((prev) =>
          prev.map((row, i) => i === 0
            ? { ...row, governmentQuota: original?.MBA?.["Government Quota Intakes"] || "" }
            : row
          )
        );
      } else if (change.section === "Management Quota") {
        setMgmtLinkName(original?.MBA_Management?.MBA_Management_link_name || "");
        setMgmtLinkFile(null);
        // Also reset the editable row quotas
        setEditableRows((prev) =>
          prev.map((row, i) => i === 0
            ? { ...row, managementQuota: original?.MBA?.["Management Quota Intakes"] || "" }
            : row
          )
        );
      } else {
        // Revert individual course edits
        setEditableRows((prev) =>
          prev.map((row) => {
            if (row.course === change.section) {
              return {
                ...row,
                governmentQuota: original?.MBA?.["Government Quota Intakes"] || row.governmentQuota,
                managementQuota: original?.MBA?.["Management Quota Intakes"] || row.managementQuota,
                totalIntake: original?.MBA?.["Total Intakes"] || row.totalIntake,
              };
            }
            return row;
          })
        );
      }
      break;

    case "added":
      // Remove the added row
      setEditableRows((prev) => prev.filter((row) => row.course !== change.section));
      break;

    case "deleted":
      // Restore the deleted row
      setEditableRows((prev) => [
        ...prev,
        {
          course: change.section,
          governmentQuota: original?.MBA?.["Government Quota Intakes"] || "",
          managementQuota: original?.MBA?.["Management Quota Intakes"] || "",
          totalIntake: original?.MBA?.["Total Intakes"] || "",
          isSelected: false,
        },
      ]);
      // Remove from deletedRows
      setDeletedRows((prev) => prev.filter((row) => row.course !== change.section));
      break;

    default:
      break;
  }

  // Remove the change from the list
  setChangeList((prev) => prev.filter((_, i) => i !== idx));
  toast.info("Change reverted to original data.");
};


  const handleFinalRequest = async () => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(mbaData));
    formData.append("changes", JSON.stringify(changeList));
    if (govLinkFile) {
        formData.append("govPdf", govLinkFile);
    }
    if (mgmtLinkFile) {
        formData.append("mgmtPdf", mgmtLinkFile);
    }

    try {
        const response = await axios.post("/api/admin/request-mba-changes", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        
        if (response.data.success) {
            toast.success("Request submitted successfully!");
            setShowPopup(false);
            setIsSaved(false);
        } else {
            toast.error(response.data.message || "Failed to submit request.");
        }
    } catch (err) {
        console.error("Error submitting request:", err);
        toast.error("Failed to submit request. Please try again.");
    }
  };
  console.log("Changes",changeList);
  

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/admissionbanner.webp"
        headerText="MBA Admission"
        subHeaderText="Empowering future business leaders through strategic thinking, innovation, and global opportunities."
      />

      {isLoading ? (
        <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
          <LoadComp txt={""} />
        </div>
      ) : (
        <div className="mba-page">
          <div className="MBA">
            <h3 className="text-accn dark:text-drkt ml-4 font-bold pb-2 w-fit dark:border-drks text-[32px]">
              M.B.A Admission
            </h3>
          </div>
          <div className="mba-container bg-[#fffae6] dark:bg-drkb border-l-4 border-secd dark:border-drks">
            <div className="text-start text-accn dark:text-drkt mb-3 Eligibility font-bold border-b-2 pb-2 w-fit border-[#fdcc03] dark:border-drks">
              Eligibility
            </div>
            <p className="description-text">
               Learners for admission to the first semester of the MBA Programme
              shall be required to have passed an appropriate Under-Graduate
              Degree Examination of Anna University or equivalent as specified
              under qualification for admission as per the Tamil Nadu single
              window counselling process. The Government of Tamil Nadu releases
              the updated eligibility criteria for the admission. Admission
              shall be offered only to candidates who possess the qualification
              prescribed and the eligibility criteria for the programme.
            </p>
        <div className="flex justify-end mt-4">
        {!isEditing && (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg mt-4 mr-10"
            onClick={() => setIsEditing(true)} 
          >
            <Pencil size={16} /> Edit
          </button>
        )}
      </div>
            {/* GOVERNMENT QUOTA */}
            <div>
              <p className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1 text-[24px] w-fit font-bold mb-2 mt-2">
                GOVERNMENT QUOTA
              </p>
              <p className="text-text dark:text-drkt ml-8">
                MBA : Apply through TANCET/TANCA
              </p>
            </div>
            <div className="flex justify-center mt-4">
              <p className="text-text dark:text-drkt font-bold mr-8">INFORMATION TO.....</p>
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    className="admin-govtlugin"
                    value={govLinkName}
                    onChange={(e) => setGovLinkName(e.target.value)}
                    placeholder="Enter Link Name"
                  />
                  <label className="bg-secd w-[100px] text-text hover:bg-brwn hover:text-prim px-3 py-1 rounded cursor-pointer">
                  <span>Replace</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => setGovLinkFile(e.target.files?.[0] || null)}
                  />
                  </label>
                  <div className="w-[100px]">
                   <button
                            type="button"
                            onClick={() => {
                              if (govLinkFile) {
                                console.log("Ajith");
                                
                                // If new file selected
                                const fileURL = URL.createObjectURL(govLinkFile);
                                window.open(fileURL, "_blank");
                              } else if (MBA_Government?.MBA_Government_link) {
                                console.log("Aji");
                                
                                // If backend link exists
                                window.open(UrlParser(MBA_Government.MBA_Government_link), "_blank");
                              } else {
                                alert("No PDF available to view");
                              }
                            }}
                            className="text-blue"
                          >
                            <Eye  color="blue"
                            size={18} />
                          </button>
                  </div>
                </div>
              ) : (
                <button
                  className="text-blue-600 dark:text-drka"
                  onClick={() => handlePdfOpen(UrlParser(MBA_Government?.MBA_Government_link))}
                >
                  <FaLink className="inline size-5 mr-1 mb-1" />
                  {govLinkName || MBA_Government?.MBA_Government_link_name || "View PDF"}
                </button>
              )}
            </div>

            {/* MANAGEMENT QUOTA */}
            <div>
              <p className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1 text-[24px] w-fit font-bold mb-2 mt-2">
                MANAGEMENT QUOTA
              </p>
              <p className="text-text dark:text-drkt ml-8">
                MBA : Apply through Common Entrance Test (CET)...
              </p>
            </div>
            <div className="flex justify-center mt-4">
              <p className="text-text dark:text-drkt font-bold mr-8">INFORMATION TO.....</p>
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    className="admin-nlugin w-full"
                    value={mgmtLinkName}
                    onChange={(e) => setMgmtLinkName(e.target.value)}
                    placeholder="Enter Link Name"
                  />
                  <label className="bg-secd w-[100px] text-text hover:bg-brwn hover:text-prim px-3 py-1 rounded cursor-pointer">
                   <span>Replace</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => setMgmtLinkFile(e.target.files?.[0] || null)}
                  />
                  </label>
                    <div className="w-[100px]">
                  <button
                    type="button"
                    onClick={() => {
                      // If a new file has been uploaded, show it
                      if (mgmtLinkFile) {
                        const fileURL = URL.createObjectURL(mgmtLinkFile);
                        window.open(fileURL, "_blank", "noopener,noreferrer");
                      } 
                      // Otherwise show the old PDF from backend
                      else if (MBA_Management?.MBA_Management_link) {
                        const url = MBA_Management.MBA_Management_link.startsWith("http")
                          ? MBA_Management.MBA_Management_link
                          : `${BASE_URL || ""}${MBA_Management.MBA_Management_link}`;
                        window.open(url, "_blank", "noopener,noreferrer");
                      } 
                      // If no PDF exists
                      else {
                        alert("No PDF available to view");
                      }
                    }}
                    className="text-blue"
                  >
                    <Eye color="blue" size={18} />
                  </button>
                </div>
                </div>
              ) : (
                <button
                  className="text-blue-600 dark:text-drka"
                  onClick={() => handlePdfOpen(UrlParser(MBA_Management?.MBA_Management_link))}
                >
                  <FaLink className="inline size-5 mr-1 mb-1" />
                  {mgmtLinkName || MBA_Management?.MBA_Management_link_name || "View PDF"}
                </button>
              )}
            </div>

            {/* Intake Table */}
            <div className="mba-content">
              <center>
                <h4 className="text-accn dark:text-drka font-bold">
                  MBA - Total Intake{" "}
                  {isEditing ? (
                    <input
                      type="text"
                      value={editableYear}
                      onChange={(e) => setEditableYear(e.target.value)}
                      className="admin-mbain w-20 inline-block text-center"
                    />
                  ) : (
                    year || ""
                  )}
                </h4>
              </center>
              <table className="mba-intake-table">
                <thead>
                  <tr>
                    <th>PG Courses</th>
                    <th>Government Quota Intake</th>
                    <th>Management Quota Intake</th>
                    <th>Total Intake</th>
                    {isEditing && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {editableRows.map((row, index) => (
                    <tr key={index}>
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            value={row.course}
                            onChange={(e) =>
                              handleRowChange(index, "course", e.target.value)
                            }
                            className="admin-nlugin"
                          />
                        ) : (
                          row.course
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            value={row.governmentQuota}
                            onChange={(e) =>
                              handleRowChange(
                                index,
                                "governmentQuota",
                                e.target.value
                              )
                            }
                            className="admin-ugin"
                          />
                        ) : (
                          row.governmentQuota
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            value={row.managementQuota}
                            onChange={(e) =>
                              handleRowChange(
                                index,
                                "managementQuota",
                                e.target.value
                              )
                            }
                            className="admin-ugin"
                          />
                        ) : (
                          row.managementQuota
                        )}
                      </td>
                      <td>{row.totalIntake}</td>
                      {isEditing && (
                        <td className="text-center">
                          <input
                            type="checkbox"
                            checked={row.isSelected || false} // track selected rows
                            onChange={(e) =>
                              handleCheckboxChange(index, e.target.checked)
                            }
                            className="w-4 h-4 cursor-pointer"
                          />
                        </td>
                      )}
                    </tr>
                  ))}
                  {isEditing && (
                        <tr>
                          <td colSpan={5}>
                            <div className="flex justify-center items-center gap-2">
                              <button
                                onClick={handleAddNew}
                                className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                              >
                                <Plus size={16} /> Add
                              </button>

                             {editableRows.some((row) => row.isSelected) && (
                              <button
                                onClick={() => setShowDeleteModal(true)} // Open modal
                                className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                              >
                                <Trash2 size={16} /> Delete
                              </button>
                            )}
                            </div>
                          </td>
                        </tr>
                      )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Save button */}
          {isEditing && (
            <div className="flex gap-2 mt-4 justify-end mr-12">
              <button
                  // onClick={handleCancel}
                className="px-4 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
               onClick={() => { handleSave(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#FDCC03] text-black rounded-lg shadow-md hover:bg-yellow-500 transition "
              >
                Save
              </button>
            </div>
          )}

          {/* Request changes button */}
          {!isEditing && isSaved && (
             <div className="flex justify-end gap-3 mt-6 mb-4 mr-12">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
          onClick={() =>{ 
                  handleDiscardChanges()
                }}
              >
                Discard Changes
              </button>
              <button
                className="px-4 py-2 bg-[#FDCC03] text-white rounded flex items-center gap-2"
                onClick={() => {setShowPopup(true);}}
              >
                <Send size={16} /> Request 
              </button>
            </div>
          )}
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
                onClick={handleDeleteSelected }
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Final request popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[750px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Final Request </h2>
            <p className="text-red-600 mb-4">
              <span className="font-medium">Note:</span>  Your changes will stay
              pending until approved by the superior admin. Once approved, they
              will be applied automatically to the live site.
            </p>

            <table className="w-full text-sm border">
              <thead>
                <tr className="border-b">
                  <th className="border p-2 ">Action</th>
                  <th className="border p-2">Section</th>
                  <th className="border p-2">chnages</th>
                  <th className="border p-2">Undo</th>
                </tr>
              </thead>
              <tbody>
                {changeList.length === 0 ? (
                  <tr>
                    <td colSpan={3}>No pending changes.</td>
                  </tr>
                ) : (
                  changeList.map((req, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2 flex items-center space-x-2">
                        {req.type === "added"  }
                        {req.type === "deleted" }
                        {req.type === "edited" }
                        <span className="capitalize">{req.type}</span>
                      </td>
                      <td className="border p-2"> MBA</td>
                      <td className="p-2 capitalize border">{req.section}</td>
                      <td className="p-2 border">
                        <button onClick={() => handleUndoChange(idx)} className="">
                         <X/>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowPopup(false)} className="px-4 py-2 bg-gray-300 rounded-md">
                Cancel
              </button>
              <button
                onClick={handleFinalRequest}
                className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
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

export default AdminMBA;