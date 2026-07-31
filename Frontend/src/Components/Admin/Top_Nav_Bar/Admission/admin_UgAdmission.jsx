import React, { useEffect, useRef, useState, useMemo } from "react";
import axios from "axios";
import "./admin_UgAdmission.css";
import { FaLink } from "react-icons/fa";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router-dom";
import { Pencil, Plus, Trash2, Eye, X, Send } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

const AdminUgAdmission = ({ theme, toggle }) => {
  const [ugData, setUgData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const navigate = useNavigate();

  const buildUgAdmissionPayload = ({
    action,
    year,
    level,
    newData,
    oldData = null,
  }) => {
    if (action === "Added") {
      return {
        collectionName: "admissions",
        collection_type: "ug",
        action: "insert",
        title: `Add ${newData.course} to ${level}`,
        category: null,
        meta_data: {
          year: String(year),
          [level]: [
            {
              [newData.course]: {
                "Government Quota Intakes": String(newData.government),
                "Management Quota Intakes": String(newData.management),
                "Total Intakes": String(newData.total),
              },
            },
          ],
        },
        original_data: null,
        admin: { status: "pending" },
      };
    }
    if (action === "Update_BE_Government") {
      return {
        collectionName: "admissions",
        collection_type: "ug",
        action: "update",
        title: "Update BE Government Link",
        category: null,
        meta_data: {
          year: String(year),
          BE_Government: {
            BE_Government_link_name: newData.link_name,
            pdf_path: newData.pdf_path,
          },
        },
        original_data: {
          year: String(year),
          BE_Government: {
            BE_Government_link_name: oldData.link_name,
            pdf_path: oldData.pdf_path,
          },
        },
        admin: {
          status: "pending",
        },
      };
    }
    if (action === "Update_BE_Management") {
      return {
        collectionName: "admissions",
        collection_type: "ug",
        action: "update",
        title: "Update BE Management Link",
        category: null,
        meta_data: {
          year: String(year),
          BE_Management: {
            BE_Management_link_name: newData.link_name,
            pdf_path: newData.pdf_path,
          },
        },
        original_data: {
          year: String(year),
          BE_Management: {
            BE_Management_link_name: oldData.link_name,
            pdf_path: oldData.pdf_path,
          },
        },
        admin: {
          status: "pending",
        },
      };
    }
    if (action === "Edited") {
      return {
        collectionName: "admissions",
        collection_type: "ug",
        action: "update",
        title: "Update UG Intake",
        category: null,
        meta_data: {
          data: {
            year: String(year),
            [level]: [
              {
                [newData.course]: {
                  "Government Quota Intakes": String(newData.government),
                  "Management Quota Intakes": String(newData.management),
                  "Total Intakes": String(newData.total),
                },
              },
            ],
          },
        },
        original_data: {
          data: {
            year: String(year),
            [level]: [
              {
                [oldData.course]: {
                  "Government Quota Intakes": String(oldData.government),
                  "Management Quota Intakes": String(oldData.management),
                  "Total Intakes": String(oldData.total),
                },
              },
            ],
          },
        },
        admin: { status: "pending" },
      };
    }
    if (action === "Deleted") {
      return {
        collectionName: "admissions",
        collection_type: "ug",
        action: "delete",
        title: `Delete ${newData.course} from ${level}`,
        category: null,
        meta_data: {
          year: String(year),
          [level]: [{ [newData.course]: {} }],
        },
        original_data: null,
        admin: { status: "pending" },
      };
    }
    return null;
  };

  const [beGovPreviewUrl, setBeGovPreviewUrl] = useState(null);
  const [beMgmtPreviewUrl, setBeMgmtPreviewUrl] = useState(null);

  const originalRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableYearUG, setEditableYearUG] = useState("");
  const [editableYearLateral, setEditableYearLateral] = useState("");
  const [editableUGRows, setEditableUGRows] = useState([]);
  const [editableLateralRows, setEditableLateralRows] = useState([]);
  const { sendRequest, loading } = useAdminRequest();
  const [deletedUGRows, setDeletedUGRows] = useState([]);
  const [deletedLateralRows, setDeletedLateralRows] = useState([]);

  const [beGovLinkName, setBeGovLinkName] = useState("");
  const [beGovLinkFile, setBeGovLinkFile] = useState(null);
  const [beMgmtLinkName, setBeMgmtLinkName] = useState("");
  const [beMgmtLinkFile, setBeMgmtLinkFile] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetTable, setDeleteTargetTable] = useState("UG");
  const [showPopup, setShowPopup] = useState(false);
  const [changeList, setChangeList] = useState([]);
  const [isSaved, setIsSaved] = useState(false);

  const BASE_URL = process.env.REACT_APP_BASE_URL || "";

  const UrlParser = (path) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const openGovPdf = () => {
    if (beGovPreviewUrl) {
      window.open(beGovPreviewUrl, "_blank", "noopener,noreferrer");
    } else if (ugData?.BE_Government?.preview_url) {
      window.open(ugData.BE_Government.preview_url, "_blank");
    } else if (ugData?.BE_Government?.pdf_path) {
      window.open(UrlParser(ugData.BE_Government.pdf_path), "_blank");
    } else {
      toast.warn("No PDF available");
    }
  };

  const openMgmtPdf = () => {
    if (beMgmtPreviewUrl) {
      window.open(beMgmtPreviewUrl, "_blank", "noopener,noreferrer");
    } else if (ugData?.BE_Management?.preview_url) {
      window.open(ugData.BE_Management.preview_url, "_blank");
    } else if (ugData?.BE_Management?.pdf_path) {
      window.open(UrlParser(ugData.BE_Management.pdf_path), "_blank");
    } else {
      toast.warn("No PDF available");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`/api/main-backend/admission`, {
          type: "ug",
        });
        const data = response.data?.data || {};
        setUgData(data);
        originalRef.current = data;

        setEditableYearUG(data?.year || "");
        setEditableYearLateral(data?.year_lateral ?? data?.year ?? "");

        setBeGovLinkName(data?.BE_Government?.BE_Government_link_name || "");
        setBeMgmtLinkName(data?.BE_Management?.BE_Management_link_name || "");

        const ugArray = Array.isArray(data?.UG) ? data.UG : [];
        const ugRowsInit = ugArray.map((item) => {
          const [courseName, courseDetails] = Object.entries(item)[0] || [
            "",
            {},
          ];
          return {
            originalCourse: courseName || "",
            course: courseName || "",
            governmentQuota: courseDetails["Government Quota Intakes"] ?? "",
            managementQuota: courseDetails["Management Quota Intakes"] ?? "",
            totalIntake: courseDetails["Total Intakes"] ?? "",
            isSelected: false,
          };
        });

        const lateralArray = Array.isArray(data?.UG_Lateral)
          ? data.UG_Lateral
          : [];
        const lateralRowsInit = lateralArray.map((item) => {
          const [courseName, courseDetails] = Object.entries(item)[0] || [
            "",
            {},
          ];
          return {
            originalCourse: courseName || "",
            course: courseName || "",
            governmentQuota: courseDetails["Government Quota Intakes"] ?? "",
            managementQuota: courseDetails["Management Quota Intakes"] ?? "",
            totalIntake: courseDetails["Total Intakes"] ?? "",
            isSelected: false,
          };
        });

        setEditableUGRows(
          ugRowsInit.length
            ? ugRowsInit
            : [
                {
                  originalCourse: null,
                  course: "",
                  governmentQuota: "",
                  managementQuota: "",
                  totalIntake: "",
                  isSelected: false,
                },
              ],
        );
        setEditableLateralRows(
          lateralRowsInit.length
            ? lateralRowsInit
            : [
                {
                  originalCourse: null,
                  course: "",
                  governmentQuota: "",
                  managementQuota: "",
                  totalIntake: "",
                  isSelected: false,
                },
              ],
        );

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setLoading(false);
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
        } else {
          toast.error("Failed to fetch UG admission data.");
        }
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

  const hasUnsavedChanges = useMemo(() => {
    if (!isEditing) return false;
    const original = ugData || {};

    if (editableYearUG !== (original.year || "")) return true;
    const originalLatYear = original.year_lateral ?? original.year ?? "";
    if (editableYearLateral !== originalLatYear) return true;

    if ((beGovLinkName || "") !== (original.BE_Government?.BE_Government_link_name || "")) return true;
    if (beGovLinkFile !== null) return true;

    if ((beMgmtLinkName || "") !== (original.BE_Management?.BE_Management_link_name || "")) return true;
    if (beMgmtLinkFile !== null) return true;

    if (deletedUGRows.length > 0 || deletedLateralRows.length > 0) return true;

    const originalUG = Array.isArray(original.UG) ? original.UG : [];
    if (originalUG.length !== editableUGRows.length) return true;
    for (let i = 0; i < originalUG.length; i++) {
      const [course, details] = Object.entries(originalUG[i])[0] || ["", {}];
      const row = editableUGRows[i];
      if (!row) return true;
      if (course !== row.course) return true;
      if (String(details["Government Quota Intakes"] || "") !== String(row.governmentQuota)) return true;
      if (String(details["Management Quota Intakes"] || "") !== String(row.managementQuota)) return true;
      if (String(details["Total Intakes"] || "") !== String(row.totalIntake)) return true;
    }

    const originalLat = Array.isArray(original.UG_Lateral) ? original.UG_Lateral : [];
    if (originalLat.length !== editableLateralRows.length) return true;
    for (let i = 0; i < originalLat.length; i++) {
      const [course, details] = Object.entries(originalLat[i])[0] || ["", {}];
      const row = editableLateralRows[i];
      if (!row) return true;
      if (course !== row.course) return true;
      if (String(details["Government Quota Intakes"] || "") !== String(row.governmentQuota)) return true;
      if (String(details["Management Quota Intakes"] || "") !== String(row.managementQuota)) return true;
      if (String(details["Total Intakes"] || "") !== String(row.totalIntake)) return true;
    }

    return false;
  }, [isEditing, ugData, editableYearUG, editableYearLateral, beGovLinkName, beGovLinkFile, beMgmtLinkName, beMgmtLinkFile, deletedUGRows, deletedLateralRows, editableUGRows, editableLateralRows]);

  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
  }

  const handlePdfOpen = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const collectChangeList = () => {
    const changes = [];
    const original = originalRef.current || {};

    if ((editableYearUG || "") !== (original?.year || "")) {
      changes.push({
        type: "edited",
        section: "Year (UG)",
        changes: "",
        origName: null,
      });
    }
    const originalLatYear = original?.year_lateral ?? original?.year ?? "";
    if ((editableYearLateral || "") !== (originalLatYear || "")) {
      changes.push({
        type: "edited",
        section: "Year (Lateral)",
        changes: "",
        origName: null,
      });
    }

    const govChanges = [];
    if (
      (beGovLinkName || "").trim() !==
      (original?.BE_Government?.BE_Government_link_name || "")
    )
      govChanges.push("Link Name");
    if (beGovLinkFile) govChanges.push("File Uploaded");
    if (govChanges.length)
      changes.push({
        type: "edited",
        section: "BE Government (UG)",
        changes: govChanges.join(", "),
        origName: null,
      });

    const mgmtChanges = [];
    if (
      (beMgmtLinkName || "").trim() !==
      (original?.BE_Management?.BE_Management_link_name || "")
    )
      mgmtChanges.push("Link Name");
    if (beMgmtLinkFile) mgmtChanges.push("File Uploaded");
    if (mgmtChanges.length)
      changes.push({
        type: "edited",
        section: "BE Management (UG)",
        changes: mgmtChanges.join(", "),
        origName: null,
      });

    deletedUGRows.forEach((r) => {
      if (r && r.course)
        changes.push({
          type: "deleted",
          section: `${r.course} (UG)`,
          changes: "",
          origName: r.course,
        });
    });
    deletedLateralRows.forEach((r) => {
      if (r && r.course)
        changes.push({
          type: "deleted",
          section: `${r.course} (Lateral)`,
          changes: "",
          origName: r.course,
        });
    });

    const originalUGRows = Array.isArray(original?.UG)
      ? original.UG.map((item) => {
          const [c, d] = Object.entries(item)[0] || ["", {}];
          return {
            course: c,
            governmentQuota: String(d["Government Quota Intakes"] ?? ""),
            managementQuota: String(d["Management Quota Intakes"] ?? ""),
            totalIntake: String(d["Total Intakes"] ?? ""),
          };
        })
      : [];

    const originalLateralRows = Array.isArray(original?.UG_Lateral)
      ? original.UG_Lateral.map((item) => {
          const [c, d] = Object.entries(item)[0] || ["", {}];
          return {
            course: c,
            governmentQuota: String(d["Government Quota Intakes"] ?? ""),
            managementQuota: String(d["Management Quota Intakes"] ?? ""),
            totalIntake: String(d["Total Intakes"] ?? ""),
          };
        })
      : [];

    const originalUG = Array.isArray(original?.UG) ? original.UG : [];

    const isUGChanged =
      originalUG.length !== editableUGRows.length ||
      originalUG.some((item, index) => {
        const [course, details] = Object.entries(item)[0] || ["", {}];
        const row = editableUGRows[index];
        if (!row) return true;

        return (
          course !== row.course ||
          Number(details["Government Quota Intakes"] || 0) !==
            Number(row.governmentQuota || 0) ||
          Number(details["Management Quota Intakes"] || 0) !==
            Number(row.managementQuota || 0) ||
          Number(details["Total Intakes"] || 0) !== Number(row.totalIntake || 0)
        );
      });

    if (isUGChanged) {
      changes.push({
        type: "edited",
        section: "UG",
        changes: "",
        origName: null,
      });
    }

    const originalLat = Array.isArray(original?.UG_Lateral)
      ? original.UG_Lateral
      : [];

    const isLatChanged =
      originalLat.length !== editableLateralRows.length ||
      originalLat.some((item, index) => {
        const [course, details] = Object.entries(item)[0] || ["", {}];
        const row = editableLateralRows[index];
        if (!row) return true;

        return (
          course !== row.course ||
          Number(details["Government Quota Intakes"] || 0) !==
            Number(row.governmentQuota || 0) ||
          Number(details["Management Quota Intakes"] || 0) !==
            Number(row.managementQuota || 0) ||
          Number(details["Total Intakes"] || 0) !== Number(row.totalIntake || 0)
        );
      });

    if (isLatChanged) {
      changes.push({
        type: "edited",
        section: "LATERAL",
        changes: "",
        origName: null,
      });
    }

    setChangeList(changes);
    return changes;
  };

  const handleRowChange = (table, index, field, value) => {
    if (table === "UG") {
      setEditableUGRows((prev) => {
        const updated = prev.map((r, i) =>
          i === index ? { ...r, [field]: value } : r,
        );
        if (field === "governmentQuota" || field === "managementQuota") {
          const row = updated[index];
          const gov = Number(row.governmentQuota) || 0;
          const man = Number(row.managementQuota) || 0;
          updated[index] = { ...row, totalIntake: gov + man };
        }
        return updated;
      });
    } else {
      setEditableLateralRows((prev) => {
        const updated = prev.map((r, i) =>
          i === index ? { ...r, [field]: value } : r,
        );
        if (field === "governmentQuota" || field === "managementQuota") {
          const row = updated[index];
          const gov = Number(row.governmentQuota) || 0;
          const man = Number(row.managementQuota) || 0;
          updated[index] = { ...row, totalIntake: gov + man };
        }
        return updated;
      });
    }
  };

  const handleAddNew = (table) => {
    const newRow = {
      originalCourse: null,
      course: "",
      governmentQuota: "",
      managementQuota: "",
      totalIntake: "",
      isSelected: false,
    };
    if (table === "UG") setEditableUGRows((prev) => [...prev, newRow]);
    else setEditableLateralRows((prev) => [...prev, newRow]);
  };

  const handleUGCheckboxChange = (index, checked) => {
    setEditableUGRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, isSelected: checked } : r)),
    );
  };

  const handleLateralCheckboxChange = (index, checked) => {
    setEditableLateralRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, isSelected: checked } : r)),
    );
  };

  const handleDeleteSelectedUG = () => {
    const toDelete = editableUGRows.filter((r) => r.isSelected);
    const deleted = toDelete
      .filter((t) => t.originalCourse)
      .map((t) => ({ course: t.originalCourse }));
    setDeletedUGRows((prev) => [...prev, ...deleted]);
    setEditableUGRows((prev) => prev.filter((r) => !r.isSelected));
  };

  const handleDeleteSelectedLateral = () => {
    const toDelete = editableLateralRows.filter((r) => r.isSelected);
    const deleted = toDelete
      .filter((t) => t.originalCourse)
      .map((t) => ({ course: t.originalCourse }));
    setDeletedLateralRows((prev) => [...prev, ...deleted]);
    setEditableLateralRows((prev) => prev.filter((r) => !r.isSelected));
  };

  const handleDeleteSelected = () => {
    if (deleteTargetTable === "UG") {
      handleDeleteSelectedUG();
    } else {
      handleDeleteSelectedLateral();
    }
    setShowDeleteModal(false);
  };

  const handleCancel = () => {
    if (!ugData && !originalRef.current) return;
    const current = ugData || originalRef.current || {};
    setEditableYearUG(current?.year || "");
    setEditableYearLateral(current?.year_lateral ?? current?.year ?? "");
    setBeGovLinkName(current?.BE_Government?.BE_Government_link_name || "");
    setBeMgmtLinkName(current?.BE_Management?.BE_Management_link_name || "");
    setBeGovLinkFile(null);
    setBeMgmtLinkFile(null);

    setDeletedUGRows([]);
    setDeletedLateralRows([]);
    setChangeList([]);

    const ugRowsReset = Array.isArray(current?.UG)
      ? current.UG.map((item) => {
          const [c, d] = Object.entries(item)[0] || ["", {}];
          return {
            originalCourse: c,
            course: c,
            governmentQuota: d["Government Quota Intakes"] ?? "",
            managementQuota: d["Management Quota Intakes"] ?? "",
            totalIntake: d["Total Intakes"] ?? "",
            isSelected: false,
          };
        })
      : [
          {
            originalCourse: null,
            course: "",
            governmentQuota: "",
            managementQuota: "",
            totalIntake: "",
            isSelected: false,
          },
        ];

    const lateralRowsReset = Array.isArray(current?.UG_Lateral)
      ? current.UG_Lateral.map((item) => {
          const [c, d] = Object.entries(item)[0] || ["", {}];
          return {
            originalCourse: c,
            course: c,
            governmentQuota: d["Government Quota Intakes"] ?? "",
            managementQuota: d["Management Quota Intakes"] ?? "",
            totalIntake: d["Total Intakes"] ?? "",
            isSelected: false,
          };
        })
      : [
          {
            originalCourse: null,
            course: "",
            governmentQuota: "",
            managementQuota: "",
            totalIntake: "",
            isSelected: false,
          },
        ];

    setEditableUGRows(ugRowsReset);
    setEditableLateralRows(lateralRowsReset);

    setIsEditing(false);
  };

  const handleSave = () => {
    if (!String(editableYearUG || "").trim()) {
      toast.error("Please fill in the UG year field.");
      return;
    }

    const hasEmptyUG = editableUGRows.some(
      (r) =>
        !String(r.course || "").trim() ||
        r.governmentQuota === "" ||
        r.managementQuota === "",
    );
    const hasEmptyLateral = editableLateralRows.some(
      (r) =>
        !String(r.course || "").trim() ||
        r.governmentQuota === "" ||
        r.managementQuota === "",
    );
    if (hasEmptyUG || hasEmptyLateral) {
      toast.error(
        "All course and intake fields must be filled out for both tables.",
      );
      return;
    }
    if (!beGovLinkName.trim() || !beMgmtLinkName.trim()) {
      toast.error("Both Government and Management link names are required.");
      return;
    }

    const newUgData = {
      ...(ugData || {}),
      year: editableYearUG.toString().trim(),
      year_lateral: editableYearLateral.toString().trim(),
      BE_Government: {
        ...(ugData?.BE_Government || {}),
        BE_Government_link_name: beGovLinkName.trim(),
        ...(beGovPreviewUrl ? { preview_url: beGovPreviewUrl } : {}),
      },

      BE_Management: {
        ...(ugData?.BE_Management || {}),
        BE_Management_link_name: beMgmtLinkName.trim(),
        ...(beMgmtPreviewUrl ? { preview_url: beMgmtPreviewUrl } : {}),
      },

      UG: editableUGRows.map((r) => ({
        [r.course]: {
          "Government Quota Intakes": Number(r.governmentQuota),
          "Management Quota Intakes": Number(r.managementQuota),
          "Total Intakes": Number(r.totalIntake),
        },
      })),
      UG_Lateral: editableLateralRows.map((r) => ({
        [r.course]: {
          "Government Quota Intakes": Number(r.governmentQuota),
          "Management Quota Intakes": Number(r.managementQuota),
          "Total Intakes": Number(r.totalIntake),
        },
      })),
    };

    setUgData(newUgData);
    collectChangeList();
    setIsEditing(false);
    setIsSaved(true);
  };

  const startEditing = () => {
    const current = ugData || originalRef.current || {};
    setEditableYearUG(current?.year || "");
    setEditableYearLateral(current?.year_lateral ?? current?.year ?? "");
    setBeGovLinkName(current?.BE_Government?.BE_Government_link_name || "");
    setBeMgmtLinkName(current?.BE_Management?.BE_Management_link_name || "");
    setBeGovLinkFile(null);
    setBeMgmtLinkFile(null);

    setDeletedUGRows([]);
    setDeletedLateralRows([]);
    setChangeList([]);

    const ugRowsInit = Array.isArray(current?.UG)
      ? current.UG.map((item) => {
          const [c, d] = Object.entries(item)[0] || ["", {}];
          return {
            originalCourse: c,
            course: c,
            governmentQuota: d["Government Quota Intakes"] ?? "",
            managementQuota: d["Management Quota Intakes"] ?? "",
            totalIntake: d["Total Intakes"] ?? "",
            isSelected: false,
          };
        })
      : [
          {
            originalCourse: null,
            course: "",
            governmentQuota: "",
            managementQuota: "",
            totalIntake: "",
            isSelected: false,
          },
        ];

    const lateralRowsInit = Array.isArray(current?.UG_Lateral)
      ? current.UG_Lateral.map((item) => {
          const [c, d] = Object.entries(item)[0] || ["", {}];
          return {
            originalCourse: c,
            course: c,
            governmentQuota: d["Government Quota Intakes"] ?? "",
            managementQuota: d["Management Quota Intakes"] ?? "",
            totalIntake: d["Total Intakes"] ?? "",
            isSelected: false,
          };
        })
      : [
          {
            originalCourse: null,
            course: "",
            governmentQuota: "",
            managementQuota: "",
            totalIntake: "",
            isSelected: false,
          },
        ];

    setEditableUGRows(ugRowsInit);
    setEditableLateralRows(lateralRowsInit);

    setIsEditing(true);
  };

  const handleDiscardChanges = () => {
    const original = originalRef.current || {};
    setEditableYearUG(original?.year || "");
    setEditableYearLateral(original?.year_lateral ?? original?.year ?? "");
    setBeGovLinkName(original?.BE_Government?.BE_Government_link_name || "");
    setBeMgmtLinkName(original?.BE_Management?.BE_Management_link_name || "");
    setBeGovLinkFile(null);
    setBeMgmtLinkFile(null);

    setDeletedUGRows([]);
    setDeletedLateralRows([]);
    setChangeList([]);

    const ugRowsReset = Array.isArray(original?.UG)
      ? original.UG.map((item) => {
          const [c, d] = Object.entries(item)[0] || ["", {}];
          return {
            originalCourse: c,
            course: c,
            governmentQuota: d["Government Quota Intakes"] ?? "",
            managementQuota: d["Management Quota Intakes"] ?? "",
            totalIntake: d["Total Intakes"] ?? "",
            isSelected: false,
          };
        })
      : [
          {
            originalCourse: null,
            course: "",
            governmentQuota: "",
            managementQuota: "",
            totalIntake: "",
            isSelected: false,
          },
        ];

    const lateralRowsReset = Array.isArray(original?.UG_Lateral)
      ? original.UG_Lateral.map((item) => {
          const [c, d] = Object.entries(item)[0] || ["", {}];
          return {
            originalCourse: c,
            course: c,
            governmentQuota: d["Government Quota Intakes"] ?? "",
            managementQuota: d["Management Quota Intakes"] ?? "",
            totalIntake: d["Total Intakes"] ?? "",
            isSelected: false,
          };
        })
      : [
          {
            originalCourse: null,
            course: "",
            governmentQuota: "",
            managementQuota: "",
            totalIntake: "",
            isSelected: false,
          },
        ];

    setEditableUGRows(ugRowsReset);
    setEditableLateralRows(lateralRowsReset);
    setUgData(original);

    setIsEditing(false);
    setIsSaved(false);
  };

  const handleUndoChange = (idx) => {
    const change = changeList[idx];
    const original = originalRef.current || {};
    if (!change) return;

    switch (change.type) {
      case "edited":
        if (change.section?.startsWith("Year")) {
          if (change.section.includes("(UG)")) {
            setEditableYearUG(original?.year || "");
          } else if (change.section.includes("(Lateral)")) {
            setEditableYearLateral(
              original?.year_lateral ?? original?.year ?? "",
            );
          }
        } else if (change.section?.startsWith("BE Government")) {
          setBeGovLinkName(
            original?.BE_Government?.BE_Government_link_name || "",
          );
          setBeGovLinkFile(null);
        } else if (change.section?.startsWith("BE Management")) {
          setBeMgmtLinkName(
            original?.BE_Management?.BE_Management_link_name || "",
          );
          setBeMgmtLinkFile(null);

        }  else if (change.section === "UG") {

    const originalUG = original?.UG || [];

    setEditableUGRows(
      originalUG.map((item) => {
        const [course, details] = Object.entries(item)[0] || ["", {}];

        return {
          originalCourse: course,
          course,
          governmentQuota: details["Government Quota Intakes"] ?? "",
          managementQuota: details["Management Quota Intakes"] ?? "",
          totalIntake: details["Total Intakes"] ?? "",
          isSelected: false,
        };
      })
    );

  } else if (change.section === "LATERAL") {

    const originalLat = original?.UG_Lateral || [];

    setEditableLateralRows(
      originalLat.map((item) => {
        const [course, details] = Object.entries(item)[0] || ["", {}];

        return {
          originalCourse: course,
          course,
          governmentQuota: details["Government Quota Intakes"] ?? "",
          managementQuota: details["Management Quota Intakes"] ?? "",
          totalIntake: details["Total Intakes"] ?? "",
          isSelected: false,
        };
      })
    );
 
     }   else {
          const section = change.section;
          const isUG = section.endsWith("(UG)");
          const isLat = section.endsWith("(Lateral)");
          const currentCourseName = section
            .replace(/\s*\(UG\)$|\s*\(Lateral\)$/, "")
            .trim();
          const origName = change.origName ?? null;

          if (isUG) {
            if (origName) {
              const origCourseObj = (original?.UG || []).find(
                (item) => Object.keys(item)[0] === origName,
              );
              const details = origCourseObj
                ? Object.values(origCourseObj)[0]
                : {
                    "Government Quota Intakes": "",
                    "Management Quota Intakes": "",
                    "Total Intakes": "",
                  };
              setEditableUGRows((prev) =>
                prev.map((r) =>
                  r.originalCourse === origName ||
                  r.course === currentCourseName
                    ? {
                        originalCourse: origName,
                        course: origName,
                        governmentQuota:
                          details["Government Quota Intakes"] ?? "",
                        managementQuota:
                          details["Management Quota Intakes"] ?? "",
                        totalIntake: details["Total Intakes"] ?? "",
                        isSelected: false,
                      }
                    : r,
                ),
              );
            } else {
              setEditableUGRows((prev) =>
                prev.filter(
                  (r) =>
                    !(
                      r.originalCourse === null &&
                      r.course === currentCourseName
                    ),
                ),
              );
            }
          } else if (isLat) {
            if (origName) {
              const origCourseObj = (original?.UG_Lateral || []).find(
                (item) => Object.keys(item)[0] === origName,
              );
              const details = origCourseObj
                ? Object.values(origCourseObj)[0]
                : {
                    "Government Quota Intakes": "",
                    "Management Quota Intakes": "",
                    "Total Intakes": "",
                  };
              setEditableLateralRows((prev) =>
                prev.map((r) =>
                  r.originalCourse === origName ||
                  r.course === currentCourseName
                    ? {
                        originalCourse: origName,
                        course: origName,
                        governmentQuota:
                          details["Government Quota Intakes"] ?? "",
                        managementQuota:
                          details["Management Quota Intakes"] ?? "",
                        totalIntake: details["Total Intakes"] ?? "",
                        isSelected: false,
                      }
                    : r,
                ),
              );
            } else {
              setEditableLateralRows((prev) =>
                prev.filter(
                  (r) =>
                    !(
                      r.originalCourse === null &&
                      r.course === currentCourseName
                    ),
                ),
              );
            }
          } else {
            if (origName) {
              const origCourseObj = (original?.UG || []).find(
                (item) => Object.keys(item)[0] === origName,
              );
              if (origCourseObj) {
                const details = Object.values(origCourseObj)[0] || {};
                setEditableUGRows((prev) =>
                  prev.map((r) =>
                    r.originalCourse === origName ||
                    r.course === currentCourseName
                      ? {
                          originalCourse: origName,
                          course: origName,
                          governmentQuota:
                            details["Government Quota Intakes"] ?? "",
                          managementQuota:
                            details["Management Quota Intakes"] ?? "",
                          totalIntake: details["Total Intakes"] ?? "",
                          isSelected: false,
                        }
                      : r,
                  ),
                );
              } else {
                const origLat = (original?.UG_Lateral || []).find(
                  (item) => Object.keys(item)[0] === origName,
                );
                const details = origLat ? Object.values(origLat)[0] : {};
                setEditableLateralRows((prev) =>
                  prev.map((r) =>
                    r.originalCourse === origName ||
                    r.course === currentCourseName
                      ? {
                          originalCourse: origName,
                          course: origName,
                          governmentQuota:
                            details["Government Quota Intakes"] ?? "",
                          managementQuota:
                            details["Management Quota Intakes"] ?? "",
                          totalIntake: details["Total Intakes"] ?? "",
                          isSelected: false,
                        }
                      : r,
                  ),
                );
              }
            } else {
              setEditableUGRows((prev) =>
                prev.filter(
                  (r) =>
                    !(
                      r.originalCourse === null &&
                      r.course === currentCourseName
                    ),
                ),
              );
              setEditableLateralRows((prev) =>
                prev.filter(
                  (r) =>
                    !(
                      r.originalCourse === null &&
                      r.course === currentCourseName
                    ),
                ),
              );
            }
          }
        }
        break;

      case "added":
        {
          const sectionName = change.section
            .replace(/\s*\(UG\)$|\s*\(Lateral\)$/, "")
            .trim();
          setEditableUGRows((prev) =>
            prev.filter(
              (r) => !(r.originalCourse === null && r.course === sectionName),
            ),
          );
          setEditableLateralRows((prev) =>
            prev.filter(
              (r) => !(r.originalCourse === null && r.course === sectionName),
            ),
          );
        }
        break;

      case "deleted":
        if (change.origName) {
          const name = change.origName;
          const origUG = (original?.UG || []).find(
            (item) => Object.keys(item)[0] === name,
          );
          if (origUG) {
            const details = Object.values(origUG)[0] || {
              "Government Quota Intakes": "",
              "Management Quota Intakes": "",
              "Total Intakes": "",
            };
            setEditableUGRows((prev) => [
              ...prev,
              {
                originalCourse: name,
                course: name,
                governmentQuota: details["Government Quota Intakes"] ?? "",
                managementQuota: details["Management Quota Intakes"] ?? "",
                totalIntake: details["Total Intakes"] ?? "",
                isSelected: false,
              },
            ]);
            setDeletedUGRows((prev) => prev.filter((d) => d.course !== name));
            break;
          }
          const origLat = (original?.UG_Lateral || []).find(
            (item) => Object.keys(item)[0] === name,
          );
          if (origLat) {
            const details = Object.values(origLat)[0] || {
              "Government Quota Intakes": "",
              "Management Quota Intakes": "",
              "Total Intakes": "",
            };
            setEditableLateralRows((prev) => [
              ...prev,
              {
                originalCourse: name,
                course: name,
                governmentQuota: details["Government Quota Intakes"] ?? "",
                managementQuota: details["Management Quota Intakes"] ?? "",
                totalIntake: details["Total Intakes"] ?? "",
                isSelected: false,
              },
            ]);
            setDeletedLateralRows((prev) =>
              prev.filter((d) => d.course !== name),
            );
            break;
          }
        } else {
        }
        break;
      default:
        break;
    }

    setChangeList((prev) => prev.filter((_, i) => i !== idx));
  };

  const buildPdfPath = (file) => `/static/images/admission_team/${file.name}`;

  const handleRequestConfirm = async () => {
    const changes = [...changeList];

    if (!changes.length && !beGovLinkFile && !beMgmtLinkFile) {
      toast.warn("No changes to submit");
      return;
    }

    const payloads = [];

    const hasUGChange =
  changes.some((c) => c.section === "UG") ||
  changes.some((c) => c.section === "Year (UG)");

if (hasUGChange) {
      payloads.push({
        collectionName: "admissions",
        collection_type: "ug",
        action: "update",
        title: "Update UG Intake",
        category: null,
        meta_data: {
          year: editableYearUG,
          UG: editableUGRows.map((r) => ({
            [r.course]: {
              "Government Quota Intakes": Number(r.governmentQuota),
              "Management Quota Intakes": Number(r.managementQuota),
              "Total Intakes": Number(r.totalIntake),
            },
          })),
        },
        original_data: {
          year: originalRef.current?.year,
          UG: originalRef.current?.UG || [],
        },
        admin: { status: "pending" },
     });
    }
    const hasLateralChange =
  changes.some((c) => c.section === "LATERAL") ||
  changes.some((c) => c.section === "Year (Lateral)");

if (hasLateralChange) {
      payloads.push({
        collectionName: "admissions",
        collection_type: "ug",
        action: "update",
        title: "Update Lateral Intake",
        category: null,
        meta_data: {
          year: editableYearLateral,
          UG_Lateral: editableLateralRows.map((r) => ({
            [r.course]: {
              "Government Quota Intakes": Number(r.governmentQuota),
              "Management Quota Intakes": Number(r.managementQuota),
              "Total Intakes": Number(r.totalIntake),
            },
          })),
        },
        original_data: {
          year:
            originalRef.current?.year_lateral ?? originalRef.current?.year,
          UG_Lateral: originalRef.current?.UG_Lateral || [],
        },
        admin: { status: "pending" },
      });
    }

    

    if (
      beGovLinkFile ||
      beGovLinkName !==
        originalRef.current?.BE_Government?.BE_Government_link_name
    ) {
      payloads.push(
        buildUgAdmissionPayload({
          action: "Update_BE_Government",
          year: editableYearUG,
          newData: {
            link_name: beGovLinkName,
            pdf_path: beGovLinkFile
              ? `/static/pdfs/admission/${beGovLinkFile.name}`
              : originalRef.current?.BE_Government?.pdf_path,
          },
          oldData: {
            link_name:
              originalRef.current?.BE_Government?.BE_Government_link_name || "",
            pdf_path: originalRef.current?.BE_Government?.pdf_path || "",
          },
        }),
      );
    }

    if (
      beMgmtLinkFile ||
      beMgmtLinkName !==
        originalRef.current?.BE_Management?.BE_Management_link_name
    ) {
      payloads.push(
        buildUgAdmissionPayload({
          action: "Update_BE_Management",
          year: editableYearUG,
          newData: {
            link_name: beMgmtLinkName,
            pdf_path: beMgmtLinkFile
              ? `/static/pdfs/admission/${beMgmtLinkFile.name}`
              : originalRef.current?.BE_Management?.pdf_path,
          },
          oldData: {
            link_name:
              originalRef.current?.BE_Management?.BE_Management_link_name ||
              "",
            pdf_path: originalRef.current?.BE_Management?.pdf_path || "",
          },
        }),
      );
    }

    const files = [];
    if (beGovLinkFile) files.push(beGovLinkFile);
    if (beMgmtLinkFile) files.push(beMgmtLinkFile);

    try {
      const finalPayloads = payloads.filter((item) => item !== null);
      await sendRequest(finalPayloads, files);

      const committedData = {
        ...(ugData || {}),
        year: editableYearUG,
        year_lateral: editableYearLateral,
        BE_Government: {
          ...(ugData?.BE_Government || {}),
          BE_Government_link_name: beGovLinkName,
        },
        BE_Management: {
          ...(ugData?.BE_Management || {}),
          BE_Management_link_name: beMgmtLinkName,
        },
        UG: editableUGRows.map((r) => ({
          [r.course]: {
            "Government Quota Intakes": Number(r.governmentQuota),
            "Management Quota Intakes": Number(r.managementQuota),
            "Total Intakes": Number(r.totalIntake),
          },
        })),
        UG_Lateral: editableLateralRows.map((r) => ({
          [r.course]: {
            "Government Quota Intakes": Number(r.governmentQuota),
            "Management Quota Intakes": Number(r.managementQuota),
            "Total Intakes": Number(r.totalIntake),
          },
        })),
      };

      setUgData(committedData);
      originalRef.current = committedData;

      setIsEditing(false);
      setIsSaved(false);
      setShowPopup(false);
      setChangeList([]);

    } catch (err) {
      console.error(err);
      toast.error("Failed to submit UG Admission request");
    }
  };

  const renderTable = (dataArray, title, subtitle, tableKey = "UG") => {
    const editableRows =
      tableKey === "UG" ? editableUGRows : editableLateralRows;
    const onAdd = () => handleAddNew(tableKey);

    return (
      <div className="table-container mt-5">
        <h4 className="text-accn dark:text-drkt Eligibility text-center">
          {title}
        </h4>
        <h6 className="text-accn dark:text-drkt Eligibility font-thin text-center">
          {subtitle}
        </h6>
        <div className="table-card overflow-x-auto">
          <table className="styled-table w-auto">
            <thead>
              <tr>
                <th className="ugHeader">UG COURSES</th>
                <th className="ugHeader">GOVERNMENT QUOTA INTAKE</th>
                <th className="ugHeader">MANAGEMENT QUOTA INTAKE</th>
                <th className="ugHeader">TOTAL INTAKE</th>
              </tr>
            </thead>
            <tbody>
              {isEditing
                ? editableRows.map((row, idx) => (
                    <tr
                      key={`${tableKey}-${idx}`}
                      className="bg-prim dark:bg-text"
                    >
                      <td>{row.course}</td>
                      <td>
                        <input
                          type="number"
                          className="admin-ugin"
                          value={row.governmentQuota}
                          onChange={(e) =>
                            handleRowChange(
                              tableKey,
                              idx,
                              "governmentQuota",
                              e.target.value,
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="admin-ugin"
                          value={row.managementQuota}
                          onChange={(e) =>
                            handleRowChange(
                              tableKey,
                              idx,
                              "managementQuota",
                              e.target.value,
                            )
                          }
                        />
                      </td>
                      <td>{row.totalIntake}</td>
                    </tr>
                  ))
                : (Array.isArray(dataArray) ? dataArray : []).map(
                    (item, rowIndex) => {
                      const [courseName, courseDetails] = Object.entries(
                        item,
                      )[0] || ["", {}];
                      return (
                        <tr
                          key={`${tableKey}-row-${rowIndex}`}
                          className="bg-prim dark:bg-text"
                        >
                          <td className="text-start text-center">
                            {courseName}
                          </td>
                          <td className="font-light text-center">
                            {courseDetails["Government Quota Intakes"]}
                          </td>
                          <td className="font-light text-center">
                            {courseDetails["Management Quota Intakes"]}
                          </td>
                          <td className="font-light text-center">
                            {courseDetails["Total Intakes"]}
                          </td>
                        </tr>
                      );
                    },
                  )}

              {isEditing && (
                <tr>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/admissionbanner.webp"
        headerText="UG Admission"
        subHeaderText="Empowering the next generation of leaders through access to world-class education and opportunities."
      />
      <div className="flex justify-end mt-4">
        {!isEditing && (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg mt-4 mr-10"
            onClick={startEditing}
          >
            <Pencil size={16} /> Edit
          </button>
        )}
      </div>
      {isLoading ? (
        <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
          <LoadComp txt={""} />
        </div>
      ) : (
        <div className="Admission">
          <div className="B-E">
            <h3 className="text-accn dark:text-drkt border-b-2 pb-2 w-fit border-[#fdcc03] dark:border-drks">
              B.E./B.Tech. Degree Programme
            </h3>
          </div>

          <div className="ADM-content bg-[#fffae6] dark:bg-drkb border-l-4 border-secd dark:border-drks">
            <div className="text-start text-accn dark:text-drkt mb-3 Eligibility font-bold border-b-2 pb-2 w-fit border-[#fdcc03] dark:border-drks">
              Eligibility
            </div>

            <p className="description-text">
              Candidates seeking admission should have passed the Higher
              Secondary Examinations of (10+2) Curriculum (Academic Stream)
              prescribed by the Government of Tamil Nadu with Mathematics,
              Physics, and Chemistry as three of the four subjects of study
              under Part-III or any examination of any other University or
              authority accepted by the Syndicate of Anna University as
              equivalent thereto.
            </p>
            <br />
            <p className="text-start description-text ">( OR )</p>
            <br />
            <p className="description-text">
              Should have passed the Higher Secondary Examination of Vocational
              stream (Vocational groups in Engineering / Technology) as
              prescribed by the Government of Tamil Nadu.
            </p>
            <br />
            <div>
              <p className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1 text-[24px] w-fit font-bold mb-2">
                GOVERNMENT QUOTA
              </p>
              <p className="text-text dark:text-drkt ml-8">
                B.E/ B.Tech : Apply through TNEA Counselling
              </p>
            </div>

            <div className="flex justify-center mt-4">
              <p className="text-text dark:text-drkt font-bold mr-8">
                INFORMATION TO…..
              </p>

              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-start gap-3">
                    <input
                      type="text"
                      className="admin-govtlugin"
                      value={beGovLinkName}
                      onChange={(e) => setBeGovLinkName(e.target.value)}
                      placeholder="Enter Link Name"
                    />
                    <label className="bg-secd w-[100px] text-text hover:bg-brwn hover:text-prim px-3 py-1 rounded cursor-pointer">
                      <span>Replace</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setBeGovLinkFile(file);
                            setBeGovPreviewUrl(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (beGovLinkFile) {
                          const fileURL = URL.createObjectURL(beGovLinkFile);
                          window.open(fileURL, "_blank", "noopener,noreferrer");
                        } else if (ugData?.BE_Government?.pdf_path) {
                          window.open(
                            UrlParser(ugData.BE_Government.pdf_path),
                            "_blank",
                            "noopener,noreferrer",
                          );
                        } else {
                          alert("No PDF available to view");
                        }
                      }}
                    >
                      <Eye color="blue" size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="text-blue-600 dark:text-drka"
                  onClick={openGovPdf}
                >
                  <FaLink className="inline size-5 mr-1 mb-1" />
                  {ugData?.BE_Government?.BE_Government_link_name || "View PDF"}
                </button>
              )}
            </div>

            <div>
              <p className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1 text-[24px] w-fit font-bold mb-2 mt-2">
                MANAGEMENT QUOTA
              </p>
              <p className="text-text dark:text-drkt ml-8">
                B.E/ B.Tech : Apply through Consortium of Self –Financing
                Professional, Arts and Science Colleges in Tamil Nadu
              </p>
            </div>

            <div className="flex justify-center mt-4">
              <p className="text-text dark:text-drkt font-bold mr-8">
                INFORMATION TO…..
              </p>

              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-start gap-3">
                    <input
                      type="text"
                      className="admin-nlugin w-full"
                      value={beMgmtLinkName}
                      onChange={(e) => setBeMgmtLinkName(e.target.value)}
                      placeholder="Enter Link Name"
                    />
                    <label className="bg-secd w-[100px] text-text hover:bg-brwn hover:text-prim px-3 py-1 rounded cursor-pointer">
                      <span>Replace</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setBeMgmtLinkFile(file);
                            setBeMgmtPreviewUrl(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (beMgmtLinkFile) {
                          const fileURL = URL.createObjectURL(beMgmtLinkFile);
                          window.open(fileURL, "_blank", "noopener,noreferrer");
                        } else if (ugData?.BE_Management?.BE_Management_link) {
                          window.open(
                            UrlParser(ugData.BE_Management.BE_Management_link),
                            "_blank",
                            "noopener,noreferrer",
                          );
                        } else {
                          alert("No PDF available to view");
                        }
                      }}
                    >
                      <Eye color="blue" size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="text-blue-600 dark:text-drka"
                  onClick={openMgmtPdf}
                >
                  <FaLink className="inline size-5 mr-1 mb-1" />* FIRST YEAR{" "}
                  {ugData?.BE_Management?.BE_Management_link_name || "View PDF"}
                </button>
              )}
            </div>

            {renderTable(
              ugData?.UG || [],
              isEditing ? (
                <>
                  UG COURSES - TOTAL INTAKE{" "}
                  <input
                    type="text"
                    value={editableYearUG}
                    onChange={(e) => setEditableYearUG(e.target.value)}
                    className="admin-uggin  inline-block text-center"
                  />
                </>
              ) : (
                <>UG COURSES - TOTAL INTAKE {ugData?.year || ""}</>
              ),
              "(For First Year Admissions)",
              "UG",
            )}
          </div>

          <div className="B-E">
            <h3 className="text-accn dark:text-drkt mt-5 border-b-2 pb-2 w-fit border-[#fdcc03] dark:border-drks">
              Lateral Entry
            </h3>
          </div>
          <div className="ADM-content lateral-entry bg-[#fffae6] dark:bg-drkb border-l-4 border-secd dark:border-drks">
            <div className="text-start text-accn dark:text-drkt mb-3 Eligibility font-bold border-b-2 pb-2 w-fit border-[#fdcc03] dark:border-drks">
              Eligibility
            </div>
            <p className="description-text">
              Candidates possessing a Diploma in Engineering/Technology awarded
              by the State Board of Technical Education, Tamilnadu or its
              equivalent are eligible for Lateral entry admission to the third
              semester of B.E./B.Tech. as per the rules fixed by the Govt. of
              Tamilnadu.
            </p>
            <br />
            <p className="description-text">( OR )</p>
            <br />
            <p className="description-text">
              Candidates possessing a Degree in Science (B.Sc.,) (10+2+3 stream)
              with Mathematics as a subject at the B.Sc. level are eligible for
              Lateral entry admission to the third semester of B.E./B.Tech.
            </p>

            {renderTable(
              ugData?.UG_Lateral || [],
              isEditing ? (
                <>
                  UG COURSES - TOTAL INTAKE{" "}
                  <input
                    type="text"
                    value={editableYearLateral}
                    onChange={(e) => setEditableYearLateral(e.target.value)}
                    className="admin-uggin w-20 inline-block text-center"
                  />
                </>
              ) : (
                <>
                  UG COURSES - TOTAL INTAKE{" "}
                  {(ugData?.year_lateral ?? ugData?.year) || ""}
                </>
              ),
              "(For Diploma Holders Only)",
              "UG_Lateral",
            )}
          </div>

          {isEditing && (
            <div className="flex gap-2 mt-4 justify-end mr-12">
              <button
                onClick={handleCancel}
                className="px-4 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              {hasUnsavedChanges && (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-secd text-text rounded-lg shadow-md hover:bg-brwn hover:text-prim transition"
                >
                  Save
                </button>
              )}
            </div>
          )}

          {!isEditing && isSaved && (
            <div className="flex justify-end gap-3 mt-6 mb-4 mr-12">
              <button
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                onClick={() => {
                  handleDiscardChanges();
                }}
              >
                Discard Changes
              </button>
              <button
                className="px-4 py-2 bg-secd text-text rounded flex items-center gap-2 hover:bg-brwn hover:text-prim transition"
                onClick={() => {
                  collectChangeList();
                  setShowPopup(true);
                }}
              >
                <Send size={16} /> Request
              </button>
            </div>
          )}

          {showDeleteModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
              <div className="bg-white p-6 rounded shadow-lg w-[350px]">
                <h2 className="font-semibold mb-4">Confirm Delete</h2>
                <p>
                  Are you sure you want to delete selected courses from{" "}
                  {deleteTargetTable === "UG" ? "UG" : "Lateral"}?
                </p>
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
                  <span className="font-medium">Note:</span> Your changes will
                  stay pending until approved by the superior admin. Once
                  approved, they will be applied automatically to the live site.
                </p>

                <table className="w-full text-sm border">
                  <thead className="bg-gry">
                    <tr className="border-b">
                      <th className="border p-2">Action</th>
                      <th className="border p-2">Section</th>
                      <th className="border p-2">Changes</th>
                      <th className="border p-2">Undo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {changeList.length === 0 ? (
                      <tr>
                        <td colSpan={4}>No pending changes.</td>
                      </tr>
                    ) : (
                      changeList.map((req, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="p-2">
                            <span style={{ textTransform: "capitalize" }}>
                              {req.type}
                            </span>
                          </td>
                          <td className="border p-2">UG</td>
                          <td className="p-2 border">{req.section}</td>
                          <td className="p-2 border">
                            <button onClick={() => handleUndoChange(idx)}>
                              <X size={16} className="text-red-500 hover:text-red-700" />
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
                    onClick={handleRequestConfirm}
                    disabled={loading}
                    className={`flex items-center gap-2 px-4 py-2 rounded bg-secd dark:drks text-text hover:text-drkt ${
                      loading ? "cursor-progress" : "hover:bg-[#800000]"
                    }`}
                  >
                    <Send size={16} />{" "}
                    {loading ? "Processing..." : "Final Request"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AdminUgAdmission;