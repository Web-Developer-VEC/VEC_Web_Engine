import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./ADM-MBA.css";
import { FaLink } from "react-icons/fa";
import Banner from "../../../Banner";
import LoadComp from "../../../LoadComp";
import { useNavigate } from "react-router-dom";
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

const AdminMBA = ({ theme, toggle }) => {
  const [mbaData, setMbaData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editableYear, setEditableYear] = useState("");
  const [editableRows, setEditableRows] = useState([]);

  const [govLinkName, setGovLinkName] = useState("");
  const [govLinkFile, setGovLinkFile] = useState(null);
  const [mgmtLinkName, setMgmtLinkName] = useState("");
  const [mgmtLinkFile, setMgmtLinkFile] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [changeList, setChangeList] = useState([]);
  const [isSaved, setIsSaved] = useState(false);

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

  const collectChangeList = (nextData) => {
    const changes = [];
    const original = originalRef.current || {};
    const originalRows = [
        {
          course: "Master of Business Administration (MBA)",
          governmentQuota: original?.MBA?.["Government Quota Intakes"] || "",
          managementQuota: original?.MBA?.["Management Quota Intakes"] || "",
          totalIntake: original?.MBA?.["Total Intakes"] || "",
        },
    ];

    if (original?.year !== nextData?.year) {
      changes.push({ type: "edited", section: "Year" });
    }

    if (govLinkName.trim() !== (original?.MBA_Government?.MBA_Government_link_name || "")) {
        changes.push({ type: "edited", section: "Government Quota Link Name" });
    }
    if (govLinkFile) {
        changes.push({ type: "edited", section: "Government Quota Link (File Uploaded)" });
    }
    if (mgmtLinkName.trim() !== (original?.MBA_Management?.MBA_Management_link_name || "")) {
        changes.push({ type: "edited", section: "Management Quota Link Name" });
    }
    if (mgmtLinkFile) {
        changes.push({ type: "edited", section: "Management Quota Link (File Uploaded)" });
    }

    if (editableRows.length > originalRows.length) {
        changes.push({ type: "added", section: "New Course" });
    } else if (editableRows.length < originalRows.length) {
        changes.push({ type: "deleted", section: "Course Removed" });
    }

    if (editableRows.length > 0) {
        const currentMBA = editableRows[0];
        const originalMBA = originalRows[0];
        if (
            currentMBA.governmentQuota !== originalMBA.governmentQuota ||
            currentMBA.managementQuota !== originalMBA.managementQuota
        ) {
            changes.push({ type: "edited", section: "MBA Intake" });
        }
    }
    
    setChangeList(changes);
  };

  const handleSave = () => {
    if (!editableYear.trim()) {
      toast.error("Please fill in the year field.");
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

  const handleUndoChange = (idx) => {
    setChangeList((prev) => prev.filter((_, i) => i !== idx));
    toast.info("Change removed from the list.");
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
              <button
                className="admin-edit-ug flex gap-1"
                onClick={() => setIsEditing((v) => !v)}
              >
                {isEditing ? (
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
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setGovLinkFile(e.target.files?.[0] || null)}
                  />
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
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setMgmtLinkFile(e.target.files?.[0] || null)}
                  />
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
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDelete(index)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {isEditing && (
                <div className="flex justify-end mt-3">
                  <button onClick={handleAddNew} className="admin-edit-pg flex items-center gap-1">
                    <PlusCircle />
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Save button */}
          {isEditing && (
            <div className="admin-controls-ug flex justify-end gap-2 mt-4">
              <button
                onClick={handleSave}
                className="admin-edit-ug active flex items-center gap-1"
              >
                <SaveAll />
                <span className="btn-text">Save</span>
              </button>
              <ToastContainer position="bottom-right" autoClose={3000} />
            </div>
          )}

          {/* Request changes button */}
          {!isEditing && isSaved && (
            <div className="admin-controls-ug flex justify-end mb-2">
              <button className="admin-edit-ug flex gap-1" onClick={() => setShowPopup(true)}>
                <Send /> Request changes
              </button>
            </div>
          )}
        </div>
      )}

      {/* Final request popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-[400px]">
            <h2 className="text-lg font-semibold mb-4">Final Request for the Changes</h2>
            <p className="text-red-600 mb-4">
              <span className="font-medium">Note:</span> Your changes will stay pending until approved by the superior admin.
            </p>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th>Action</th>
                  <th>Section</th>
                  <th>Undo</th>
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
                        {req.type === "added" && <PlusCircle className="text-green-600" size={16} />}
                        {req.type === "deleted" && <Trash2 className="text-red-600" size={16} />}
                        {req.type === "edited" && <SquarePen className="text-blue-600" size={16} />}
                        <span className="capitalize">{req.type}</span>
                      </td>
                      <td className="p-2 capitalize">{req.section}</td>
                      <td className="p-2">
                        <button onClick={() => handleUndoChange(idx)} className="nss-btn nss-btn-undo">
                          Undo
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