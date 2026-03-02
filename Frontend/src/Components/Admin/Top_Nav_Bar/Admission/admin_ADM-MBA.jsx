import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./ADM-MBA.css";
import { FaLink } from "react-icons/fa";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router-dom";
import { Trash2, CircleX, Send, Pencil, Plus, X, Eye } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

const AdminMBA = ({ theme, toggle }) => {
  const [mbaData, setMbaData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const { sendRequest, loading, error } = useAdminRequest();
  const [govPreviewUrl, setGovPreviewUrl] = useState(null);
  const [mgmtPreviewUrl, setMgmtPreviewUrl] = useState(null);

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const navigate = useNavigate();
  const [TableData, setTableData] = useState();
  const [isEditing, setIsEditing] = useState(false);
  const [editableYear, setEditableYear] = useState("");
  const [editableRows, setEditableRows] = useState([]);
  const [deletedRows, setDeletedRows] = useState([]);
  const [govLinkName, setGovLinkName] = useState("");
  const [govLinkFile, setGovLinkFile] = useState(null);
  const [mgmtLinkName, setMgmtLinkName] = useState("");
  const [mgmtLinkFile, setMgmtLinkFile] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState();
  const [showPopup, setShowPopup] = useState(false);
  const [changeList, setChangeList] = useState([]);
  const [isSaved, setIsSaved] = useState(false);

  console.log(govLinkFile);

  // ================= MBA PAYLOAD BUILDER =================
  const buildMbaAdmissionPayload = ({
    action,
    year,
    newData = {},
    oldData = {},
  }) => {
    /* -------------------- ADD / INSERT -------------------- */
    if (action === "Added") {
      return {
        collectionName: "admissions",
        collection_type: "mba",
        action: "insert",
        title: "Insert MBA Intake Data",
        meta_data: {
            year,
       
                MBA: {
                  "Government Quota Intakes": String(newData.government),
                  "Management Quota Intakes": String(newData.management),
                  "Total Intakes": String(newData.total),
                },
            
          },
      };
    }

    /* -------------------- EDIT / UPDATE INTAKE -------------------- */
    if (action === "Edited") {
      return {
        collectionName: "admissions",
        collection_type: "mba",
        action: "update",
        title: "Update MBA Intake Numbers",

        meta_data: {
            year,
           
                MBA: {
                  "Government Quota Intakes": String(newData.government),
                  "Management Quota Intakes": String(newData.management),
                  "Total Intakes": String(newData.total),
                },
             
        },

        original_data: {
            year,
          
            
                MBA: {
                  "Government Quota Intakes": String(oldData.government),
                  "Management Quota Intakes": String(oldData.management),
                  "Total Intakes": String(oldData.total),
                },
           
          },
      };
    }

    /* -------------------- YEAR UPDATE -------------------- */
    if (action === "YearEdited") {
      return {
        collectionName: "admissions",
        collection_type: "mba",
        action: "update",
        title: "Update MBA Year Only",

        meta_data: {
            year: newData.year,
        },

        original_data: {
            year: oldData.year,
        },
      };
    }

if (action === "GovLinkEdited") {
  return {
    collectionName: "admissions",
    collection_type: "mba",
    action: "update",
    title: "Update MBA Government Link",

    meta_data: {
      year,
      MBA_Government: {
        MBA_Government_link_name: newData.linkName,
        pdf_path: newData.pdfPath ?? oldData.pdfPath,
      },
    },

    original_data: {
      year,
      MBA_Government: {
        MBA_Government_link_name: oldData.linkName,
        pdf_path: oldData.pdfPath,
      },
    },
  };
}


   /* -------------------- MANAGEMENT LINK UPDATE -------------------- */
if (action === "MgmtLinkEdited") {
  return {
    collectionName: "admissions",
    collection_type: "mba",
    action: "update",
    title: "Update MBA Management Link",

    meta_data: {
      year,
      MBA_Management: {
        MBA_Management_link_name: newData.linkName,
        pdf_path: newData.pdfPath ?? oldData.pdfPath,
      },
    },

    original_data: {
      year,
      MBA_Management: {
        MBA_Management_link_name: oldData.linkName,
        pdf_path: oldData.pdfPath,
      },
    },
  };
}


    /* -------------------- DELETE MBA -------------------- */
    if (action === "Deleted") {
      return {
        collectionName: "admissions",
        collection_type: "mba",
        action: "delete",
        title: "Delete MBA Program for Year",
        meta_data: {
          year,
          MBA: [
            {
              MBA: {},
            },
          ],
        },
      };
    }

    return null;
  };

  // const files = [
  //   { field: "mba_gov_pdf", file: govLinkFile },
  //   { field: "mba_mgmt_pdf", file: mgmtLinkFile },
  // ];

  // await sendRequest(payloads, files);

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
  const openGovPdf = () => {
    if (govPreviewUrl) {
      window.open(govPreviewUrl, "_blank");
    } else if (MBA_Government?.pdf_path) {
      window.open(UrlParser(MBA_Government.pdf_path), "_blank");
    } else {
      toast.warn("No PDF available");
    }
  };

  const openMgmtPdf = () => {
    if (mgmtPreviewUrl) {
      window.open(mgmtPreviewUrl, "_blank");
    } else if (MBA_Management?.pdf_path) {
      window.open(UrlParser(MBA_Management.pdf_path), "_blank");
    } else {
      toast.warn("No PDF available");
    }
  };

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

    const originalRow = {
      course: "Master of Business Administration (MBA)",
      governmentQuota: original?.MBA?.["Government Quota Intakes"] || "",
      managementQuota: original?.MBA?.["Management Quota Intakes"] || "",
      totalIntake: original?.MBA?.["Total Intakes"] || "",
    };

    const currentRow = editableRows[0];

    /* ---------------- YEAR ---------------- */
    if (editableYear !== original?.year) {
      changes.push({ type: "edited", section: "Year" });
    }

    /* ---------------- INTAKE ---------------- */
    if (
      currentRow.governmentQuota !== originalRow.governmentQuota ||
      currentRow.managementQuota !== originalRow.managementQuota ||
      currentRow.totalIntake !== originalRow.totalIntake
    ) {
      changes.push({
        type: "edited",
        section: "Master of Business Administration (MBA)",
      });
    }

    /* ---------------- GOVERNMENT LINK ---------------- */
    if (
      govLinkName.trim() !==
        (original?.MBA_Government?.MBA_Government_link_name || "") ||
      govLinkFile
    ) {
      changes.push({
        type: "edited",
        section: "Government Quota",
      });
    }

    /* ---------------- MANAGEMENT LINK ---------------- */
    if (
      mgmtLinkName.trim() !==
        (original?.MBA_Management?.MBA_Management_link_name || "") ||
      mgmtLinkFile
    ) {
      changes.push({
        type: "edited",
        section: "Management Quota",
      });
    }

    /* ---------------- DELETE MBA ---------------- */
    if (deletedRows.length > 0) {
      changes.push({
        type: "deleted",
        section: "Master of Business Administration (MBA)",
      });
    }

    return changes;
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
  const handlePdfChange = (file, type) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const futurePath = `/static/pdfs/admission/${file.name}`;

    if (type === "GOV") {
      setGovLinkFile(file);
      setGovPreviewUrl(previewUrl);

      // ✅ Update UI data immediately
      setMbaData((prev) => ({
        ...prev,
        MBA_Government: {
          ...prev?.MBA_Government,
          pdf_path: futurePath,
          preview_url: previewUrl,
        },
      }));
    }

    if (type === "MGMT") {
      setMgmtLinkFile(file);
      setMgmtPreviewUrl(previewUrl);

      setMbaData((prev) => ({
        ...prev,
        MBA_Management: {
          ...prev?.MBA_Management,
          pdf_path: futurePath,
          preview_url: previewUrl,
        },
      }));
    }
  };
const handleCancel = () => {
  setIsEditing(false);
  toast.info("Exited edit mode.");
};

  const handleSave = () => {
    if (!editableYear.trim()) {
      toast.error("Please fill in the year field.");
      return;
    }

    const isEmptyRow = editableRows.some(
      (row) =>
        !row.course.trim() ||
        row.governmentQuota === "" ||
        row.managementQuota === "",
    );

    if (isEmptyRow) {
      toast.error("All course and intake fields must be filled out.");
      return;
    }

    if (!govLinkName.trim() || !mgmtLinkName.trim()) {
      toast.error("Both government and management link names are required.");
      return;
    }

    // ✅ IMPORTANT: compute changes BEFORE mutating anything
    const changes = collectChangeList();

    if (changes.length === 0) {
      toast.info("No changes detected.");
      return;
    }

    setChangeList(changes); // ✅ store diff
    setIsEditing(false);
    setIsSaved(true);

    toast.success("Changes saved locally. Submit for approval when ready.");
  };

  const handleCheckboxChange = (index, checked) => {
    setEditableRows((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, isSelected: checked } : row,
      ),
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
            (row) => !prevDeleted.some((dRow) => dRow.course === row.course),
          )
          .map((row) => ({
            type: "deleted",
            section: row.course,
          })),
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
          setGovLinkName(
            original?.MBA_Government?.MBA_Government_link_name || "",
          );
          setGovLinkFile(null);
          // Also reset the editable row quotas
          setEditableRows((prev) =>
            prev.map((row, i) =>
              i === 0
                ? {
                    ...row,
                    governmentQuota:
                      original?.MBA?.["Government Quota Intakes"] || "",
                  }
                : row,
            ),
          );
        } else if (change.section === "Management Quota") {
          setMgmtLinkName(
            original?.MBA_Management?.MBA_Management_link_name || "",
          );
          setMgmtLinkFile(null);
          // Also reset the editable row quotas
          setEditableRows((prev) =>
            prev.map((row, i) =>
              i === 0
                ? {
                    ...row,
                    managementQuota:
                      original?.MBA?.["Management Quota Intakes"] || "",
                  }
                : row,
            ),
          );
        } else {
          // Revert individual course edits
          setEditableRows((prev) =>
            prev.map((row) => {
              if (row.course === change.section) {
                return {
                  ...row,
                  governmentQuota:
                    original?.MBA?.["Government Quota Intakes"] ||
                    row.governmentQuota,
                  managementQuota:
                    original?.MBA?.["Management Quota Intakes"] ||
                    row.managementQuota,
                  totalIntake:
                    original?.MBA?.["Total Intakes"] || row.totalIntake,
                };
              }
              return row;
            }),
          );
        }
        break;

      case "added":
        // Remove the added row
        setEditableRows((prev) =>
          prev.filter((row) => row.course !== change.section),
        );
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
        setDeletedRows((prev) =>
          prev.filter((row) => row.course !== change.section),
        );
        break;

      default:
        break;
    }

    // Remove the change from the list
    setChangeList((prev) => prev.filter((_, i) => i !== idx));
    toast.info("Change reverted to original data.");
  };
const handleFinalRequest = async () => {
  const changes = collectChangeList();
  if (!changes.length) {
    toast.warn("No changes to submit");
    return;
  }

  const payloads = [];
  const files = [];
  const original = originalRef.current || {};
  const row = editableRows[0];

  /* ---------------- CHECK WHAT CHANGED ---------------- */

  const hasYearChange = changes.some(c => c.section === "Year");

  const hasIntakeChange = changes.some(
    c => c.section === "Master of Business Administration (MBA)"
  );

  const hasGovLinkChange = changes.some(
    c => c.section === "Government Quota"
  );

  const hasMgmtLinkChange = changes.some(
    c => c.section === "Management Quota"
  );

  const hasDelete = changes.some(c => c.type === "deleted");

  /* ---------------- COMBINED YEAR + INTAKE ---------------- */

  if (hasYearChange || hasIntakeChange) {
    payloads.push({
      collectionName: "admissions",
      collection_type: "mba",
      action: "update",
      title: "Update MBA Admission",

      meta_data: {
          year: editableYear,
              MBA: {
                "Government Quota Intakes": String(row.governmentQuota),
                "Management Quota Intakes": String(row.managementQuota),
                "Total Intakes": String(row.totalIntake),
              },
          
      },

      original_data: {
          year: original.year,
            
              MBA: {
                "Government Quota Intakes":
                  original?.MBA?.["Government Quota Intakes"],
                "Management Quota Intakes":
                  original?.MBA?.["Management Quota Intakes"],
                "Total Intakes":
                  original?.MBA?.["Total Intakes"],
              },
      },

      admin: { status: "pending" },
    });
  }

  /* ---------------- GOVERNMENT LINK ---------------- */

  if (hasGovLinkChange) {
    payloads.push(
      buildMbaAdmissionPayload({
        action: "GovLinkEdited",
        year: editableYear,
        newData: {
          linkName: govLinkName,
          pdfPath: govLinkFile
            ? `/static/pdfs/admission/${govLinkFile.name}`
            : undefined,
        },
        oldData: {
          linkName: original?.MBA_Government?.MBA_Government_link_name,
          pdfPath: original?.MBA_Government?.pdf_path,
        },
      })
    );

    if (govLinkFile) {
      files.push({  file: govLinkFile });
    }
  }

  /* ---------------- MANAGEMENT LINK ---------------- */

  if (hasMgmtLinkChange) {
    payloads.push(
      buildMbaAdmissionPayload({
        action: "MgmtLinkEdited",
        year: editableYear,
        newData: {
          linkName: mgmtLinkName,
          pdfPath: mgmtLinkFile
            ? `/static/pdfs/admission/${mgmtLinkFile.name}`
            : undefined,
        },
        oldData: {
          linkName: original?.MBA_Management?.MBA_Management_link_name,
          pdfPath: original?.MBA_Management?.pdf_path,
        },
      })
    );

    if (mgmtLinkFile) {
      files.push({  file: mgmtLinkFile });
    }
  }

  /* ---------------- DELETE ---------------- */

  if (hasDelete) {
    payloads.push(
      buildMbaAdmissionPayload({
        action: "Deleted",
        year: editableYear,
      })
    );
  }

  console.log("FINAL MBA PAYLOADS:", payloads);
  console.log("FILES:", files);

  await sendRequest(payloads, files);

  toast.success("MBA Admission request submitted successfully!");
  setShowPopup(false);
  setIsSaved(false);
};


  // console.log("Changes", changeList);

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
              <p className="text-text dark:text-drkt font-bold mr-8">
                INFORMATION TO.....
              </p>
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-start gap-3">
                  <input
                    type="text"
                    className="admin-mba"
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
                        onChange={(e) =>
                          handlePdfChange(e.target.files?.[0], "GOV")
                        }
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
                          } else if (MBA_Government?.pdf_path) {
                            console.log("Aji");

                            // If backend link exists
                            window.open(
                              UrlParser(MBA_Government.pdf_path),
                              "_blank",
                            );
                          } else {
                            alert("No PDF available to view");
                          }
                        }}
                        className="text-blue"
                      >
                        <Eye color="blue" size={18} />
                      </button>
                    </div>
                  </div>
                  </div>
                
              ) : (
                <button
                  className="text-blue-600 dark:text-drka"
                  onClick={openGovPdf}
                >
                  <FaLink className="inline size-5 mr-1 mb-1" />
                  {govLinkName ||
                    MBA_Government?.MBA_Government_link_name ||
                    "View PDF"}
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
              <p className="text-text dark:text-drkt font-bold mr-8">
                INFORMATION TO.....
              </p>
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-start gap-3">
                  <input
                    type="text"
                    className="admin-mba"
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
                        onChange={(e) =>
                          handlePdfChange(e.target.files?.[0], "MGMT")
                        }
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
                          else if (MBA_Management?.pdf_path) {
                            const url = MBA_Management.pdf_path.startsWith("http")
                              ? MBA_Management.pdf_path
                              : `${BASE_URL || ""}${MBA_Management.pdf_path}`;
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
                  </div>
              
              ) : (
                <button
                  className="text-blue-600 dark:text-drka"
                  onClick={openMgmtPdf}
                >
                  <FaLink className="inline size-5 mr-1 mb-1" />
                  {mgmtLinkName ||
                    MBA_Management?.MBA_Management_link_name ||
                    "View PDF"}
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
                    {/* {isEditing && <th>Actions</th>} */}
                  </tr>
                </thead>
                <tbody>
                  {editableRows.map((row, index) => (
                    <tr key={index}>
                      <td>
                        {/* {isEditing ? (
                          <input
                            type="text"
                            value={row.course}
                            onChange={(e) =>
                              handleRowChange(index, "course", e.target.value)
                            }
                            className="admin-mbanu"
                          />
                        ) : ( */}
                          {row.course}
                        {/* )} */}
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
                                e.target.value,
                              )
                            }
                            className="admin-mbain"
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
                                e.target.value,
                              )
                            }
                            className="admin-mbain"
                          />
                        ) : (
                          row.managementQuota
                        )}
                      </td>
                      <td>{row.totalIntake}</td>
                      {/* {isEditing && (
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
                      )} */}
                    </tr>
                  ))}
                  {isEditing && (
                    <tr>
                      {/* <td colSpan={5}>
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
                      </td> */}
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
                onClick={handleCancel}
                className="px-4 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSave(true);
                }}
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
                onClick={() => {
                  handleDiscardChanges();
                }}
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
      {/* Final request popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[750px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Final Request </h2>
            <p className="text-red-600 mb-4">
              <span className="font-medium">Note:</span> Your changes will stay
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
                        {req.type === "added"}
                        {req.type === "deleted"}
                        {req.type === "edited"}
                        <span className="capitalize">{req.type}</span>
                      </td>
                      <td className="border p-2"> MBA</td>
                      <td className="p-2 capitalize border">{req.section}</td>
                      <td className="p-2 border">
                        <button
                          onClick={() => handleUndoChange(idx)}
                          className=""
                        >
                          <X />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalRequest}
                disabled={loading}
                className={`px-4 py-2 rounded bg-secd dark:drks text-text hover:text-drkt ${
                  loading ? "cursor-progress" : "hover:bg-[#800000]"
                }`}
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

export default AdminMBA;
