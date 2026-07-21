import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faPencil,
  faPlus,
  faXmark,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { Send, X, Plus, Pencil, Trash2 } from "lucide-react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useParams } from "react-router";
import LoadComp from "../../../LoadComp";
import { useAdminRequest } from "../../../../hooks/useAdminRequest";

const deepCopy = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map((section) => ({
    ...section,
    syllabus:
      section.syllabus?.map((item) => ({
        ...item,
        file: item.file ?? null,
        docs:
          item.docs?.map((doc) => ({
            ...doc,
            file: doc.file ?? null,
          })) || [],
      })) || [],
  }));
};

const CurriculumPage = ({ data, deptId }) => {
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const { sendRequest, loading, error } = useAdminRequest();
  console.log("Loading state check", loading);
  

  const UrlParser = (path) => {
    if (typeof path !== "string" || !path) return "";
    return path.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  // State variables
  const [originalData, setOriginalData] = useState([]);
  const [tempData, setTempData] = useState([]);
  const [pendingData, setPendingData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedYears, setSelectedYears] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const toggleSelectYear = (sectionIndex, itemIndex) => {
    const key = `${sectionIndex}-${itemIndex}`;
    setSelectedYears((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // Popup state
  const [popupData, setPopupData] = useState({
    sectionIndex: null,
    itemIndex: null,
    docIndex: null,
    year: "",
    pdf_path: "",
    docName: "",
    file: null,
    isEditing: false,
    isDoc: false,
    isCurriculum: false,
    deletePdf: false,
  });

  const fileInputRef = useRef(null);

  // Fetch initial data
  useEffect(() => {
    const curriculum =
      data?.find((item) => item.category === "curriculum")?.content || [];
    const formattedData = curriculum.map((section) => ({
      ...section,
      syllabus:
        section.syllabus?.map((item) => ({
          ...item,
          id: item.pdf_path || Date.now() + Math.random(),
          docs:
            item.docs?.map((doc) => ({
              ...doc,
              id: doc.pdf_path || Date.now() + Math.random(),
            })) || [],
        })) || [],
    }));

    setTempData(deepCopy(formattedData));
    setOriginalData(deepCopy(formattedData));
    setIsLoading(false);
  }, [data]);

  // Online/Offline handling
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



  const handleViewClick = (pdfUrl) => {
    const url = UrlParser(pdfUrl);

    console.log("VIEW 1 URL:", url);
    console.log("Original pdf_path:", pdfUrl);

    window.open(url, "_blank");
  };



  const handleViewWithFile = (item) => {
    console.log("OBJECT:", item);

    if (!item) return;

    if (typeof item.url === "string" && item.url.startsWith("blob:")) {
      console.log("Opening Blob");
      window.open(item.url, "_blank");
      return;
    }

    if (typeof item.pdf_path === "string" && item.pdf_path.length > 0) {
      console.log("Opening PDF:", item.pdf_path);
      window.open(UrlParser(item.pdf_path), "_blank");
      return;
    }

    console.log("No PDF");
  };



  // Edit mode handlers
  const handleEdit = () => {
    setIsEditing(true);
    setIsSaved(false);
    setIsDirty(false);
    setSelectedYears(new Set());
  };

  const handleRevertChange = (changeToRemove) => {
    if (!originalData) return;
    const allChanges = getChanges(pendingData);
    const remainingChanges = allChanges.filter(
      (ch) =>
        !(
          ch.action === changeToRemove.action &&
          ch.section === changeToRemove.section &&
          ch.year === changeToRemove.year &&
          ch.docName === changeToRemove.docName
        ),
    );

    let rebuiltData = deepCopy(originalData);

    remainingChanges.forEach((change) => {
      rebuiltData.forEach((section) => {
        if (change.section.startsWith(section.heading)) {
          section.syllabus?.forEach((item) => {
            if (item.year === change.year) {
              if (change.docName) {
                if (change.action === "Added") {
                  item.docs.push({
                    id: Date.now() + Math.random(),
                    name: change.docName,
                    pdf_path: change.pdf_path || "",
                    file: change.file || null,
                  });
                }
                if (change.action === "Edited") {
                  const doc = item.docs.find(
                    (d) => d.name === change.original_data?.name,
                  );
                  if (doc) {
                    doc.name = change.docName;
                    doc.pdf_path = change.pdf_path || doc.pdf_path;
                  }
                }
                if (change.action === "Deleted") {
                  item.docs = item.docs.filter(
                    (d) => d.name !== change.docName,
                  );
                }
              } else {
                if (change.action === "Added") {
                  section.syllabus.push({
                    id: Date.now() + Math.random(),
                    year: change.year,
                    docs: change.docs || [],
                  });
                }
                if (change.action === "Edited") {
                  item.year = change.year;
                }
                if (change.action === "Deleted") {
                  section.syllabus = section.syllabus.filter(
                    (s) => s.year !== change.year,
                  );
                }
              }
            }
          });
        }
      });
    });

    setPendingData(rebuiltData);
    setTempData(deepCopy(rebuiltData));
    toast.info("Change discarded successfully");
  };

  const handleSave = () => {
    const changes = getChanges(tempData);
    if (changes.length === 0) {
      toast.info("No changes to save!");
      return;
    }

    const allItems = tempData.flatMap(
      (section) =>
        section.syllabus?.flatMap((item) =>
          item.docs?.length ? item.docs : [item],
        ) || [],
    );

    const invalidItem = allItems.find(
      (item) => !item.name?.trim() && !item.year?.trim(),
    );

    if (invalidItem) {
      toast.error("Please fill all required fields before saving!");
      return;
    }

    setPendingData(deepCopy(tempData));
    setIsSaved(true);
    setIsEditing(false);
    setIsDirty(false);
    toast.success("Changes saved as draft!");
  };

  const handleCancel = () => {
    if (pendingData) {
      setTempData(deepCopy(pendingData));
      toast.info("Cancelled changes. Draft preserved!");
    } else {
      setTempData(deepCopy(originalData));
      toast.info("Cancelled changes. Reverted to original!");
    }
    setIsEditing(false);
    setIsSaved(!!pendingData);
    setIsDirty(false);
    setShowPopup(false);
  };

  const confirmDeleteYears = () => {
    setTempData((prev) => {
      const updatedData = prev.map((section, sectionIndex) => {
        const filteredSyllabus = section.syllabus.filter((_, itemIndex) => {
          const key = `${sectionIndex}-${itemIndex}`;
          return !selectedYears.has(key);
        });
        return {
          ...section,
          syllabus: filteredSyllabus,
        };
      });
      return updatedData;
    });

    setSelectedYears(new Set());
    setShowDeleteModal(false);
    setIsDirty(true);
    toast.success("Selected year(s) deleted successfully");
  };

  const handleDiscard = () => {
    setTempData(deepCopy(originalData));
    setPendingData(null);
    setIsSaved(false);
    setIsDirty(false);
    toast.info("Changes discarded!");
  };

  // Popup handlers
  const romanNumerals = [
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
    "XI",
    "XII",
  ];

  const handleAddExtraSemester = (sectionIndex, itemIndex) => {
    const existingCount =
      tempData[sectionIndex].syllabus[itemIndex].docs?.length || 0;

    const nextRoman = romanNumerals[existingCount] || `${existingCount + 1}`;

    setPopupData({
      sectionIndex,
      itemIndex,
      docIndex: null,
      docName: "", // IX Semester auto
      file: null,
      isEditing: false,
      isDoc: true,
      isSemester: true,
      isExtraSemester: true,
      deletePdf: false,
    });

    setShowPopup(true);
  };

  const handleEditUGYear = (sectionIndex, itemIndex) => {
    const item = tempData[sectionIndex].syllabus[itemIndex];
    setPopupData({
      sectionIndex,
      itemIndex,
      docIndex: null,
      year: item.year,
      pdf_path: "",
      docName: "",
      file: null,
      isEditing: true,
      isDoc: false,
      isSemester: false,
      isCurriculum: false,
    });
    setShowPopup(true);
  };

  const handleEditDoc = (
    sectionIndex,
    itemIndex,
    docIndex,
    isSemester = false,
  ) => {
    if (!isEditing) {
      const docOrSemester = isSemester
        ? tempData[sectionIndex].syllabus[itemIndex]
        : tempData[sectionIndex].syllabus[itemIndex].docs[docIndex];
      const url = docOrSemester?.url || docOrSemester?.pdf_path;
      if (url) {
        handleViewWithFile(docOrSemester);
      } else {
        toast.info("No PDF available to preview");
      }
      return;
    }

    const docOrSemester = isSemester
      ? tempData[sectionIndex].syllabus[itemIndex]
      : tempData[sectionIndex].syllabus[itemIndex].docs[docIndex];

    setPopupData({
      sectionIndex,
      itemIndex,
      docIndex,
      year: isSemester ? docOrSemester.year : "",
      pdf_path: docOrSemester.pdf_path || "", // backend truth
      docName: isSemester ? "" : docOrSemester.name,
      file: null,
      isEditing: true,
      isDoc: !isSemester,
      isSemester,
      deletePdf: false,
    });

    setShowPopup(true);
  };

  const handleDeleteUGYear = (sectionIndex, itemIndex) => {
    setTempData((prev) => {
      const newData = [...prev];
      newData[sectionIndex].syllabus = newData[sectionIndex].syllabus.filter(
        (_, i) => i !== itemIndex,
      );
      return newData;
    });
    setIsDirty(true);
    toast.success("Item deleted");
  };

  const handleDeleteDoc = (sectionIndex, itemIndex, docIndex) => {
    setTempData((prev) => {
      const newData = [...prev];
      newData[sectionIndex].syllabus[itemIndex].docs = newData[
        sectionIndex
      ].syllabus[itemIndex].docs.filter((_, i) => i !== docIndex);
      return newData;
    });
    setIsDirty(true);
    toast.success("Document deleted");
  };

  // File handlers
  const triggerFileInput = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      e.target.value = "";
      return;
    }

    setPopupData((prev) => ({ ...prev, file }));
  };

  const handleDeletePdf = () => {
  setPopupData((prev) => ({
    ...prev,
    file: null,
    pdf_path: "",
    deletePdf: true,
  }));

  toast.success("PDF removed");
};

  const handlePopupView = () => {
    const {
      file,
      pdf_path,
      isEditing,
      sectionIndex,
      itemIndex,
      docIndex,
      isDoc,
    } = popupData;
    let url = null;

    if (file) {
      url = URL.createObjectURL(file);
    } else if (isEditing && pdf_path) {
      url = UrlParser(pdf_path);
    } else if (!isEditing && !file) {
      toast.info("No PDF available to preview");
      return;
    }

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };



  const handlePopupSubmit = () => {
    const {
      sectionIndex,
      itemIndex,
      docIndex,
      year,
      docName,
      file,
      isEditing,
      isDoc,
      isSemester,
      isCurriculum,
      semesters,
    } = popupData;

    // 🔴 EXTRA SEMESTER VALIDATION
    if (popupData.isDoc && !popupData.isEditing) {
      if (!popupData.docName.trim()) {
        toast.error("Please enter semester name");
        return;
      }

      if (!popupData.file) {
        toast.error("Please upload semester PDF");
        return;
      }
    }

    // 🔴 CURRICULUM ADD
    if (isCurriculum) {
      if (!year.trim()) {
        toast.error("Please enter curriculum name");
        return;
      }

      setTempData((prev) => {
        const newData = [...prev];

        const newYear = {
          id: Date.now() + Math.random(),
          year: year.trim(),
          docs: semesters.map((sem, idx) => ({
            id: Date.now() + Math.random() + idx,
            name: sem.name,
            pdf_path: "",
            file: sem.file || null,
            url: sem.file ? URL.createObjectURL(sem.file) : "",
            _isNew: !!sem.file,
          })),
        };

        // ✅ ADD AT THE END (BOTTOM OF PAGE)
        newData[0] = {
          ...newData[0],
          syllabus: [newYear, ...(newData[0].syllabus || [])],
        };
        return newData;
      });

      setIsDirty(true);
      setShowPopup(false);
      toast.success("Curriculum year added successfully!");
      return;
    }

    if (!isDoc && !isSemester && !year.trim()) {
      toast.error("Please enter year");
      return;
    }

    setTempData((prev) => {
      const newData = [...prev];

      // ===================== DOC =====================
      if (isDoc) {
        if (isEditing && docIndex !== null) {
          const oldDoc =
            newData[sectionIndex].syllabus[itemIndex].docs[docIndex];

          newData[sectionIndex].syllabus[itemIndex].docs[docIndex] = {
            ...oldDoc,
            name: docName.trim(),

            // ✅ FIX: preserve backend pdf_path
            pdf_path: popupData.deletePdf ? "" : oldDoc.pdf_path,
            deletePdf: popupData.deletePdf,

            url: file ? URL.createObjectURL(file) : oldDoc.url,
            file: file || null,
            _isNew: !!file,
          };
        } else {
          const newDoc = {
            id: Date.now() + Math.random(),
            name: docName.trim(),
            pdf_path: "",
            url: file ? URL.createObjectURL(file) : "",
            file: file || null,
            _isNew: !!file,
          };

          if (!newData[sectionIndex].syllabus[itemIndex].docs) {
            newData[sectionIndex].syllabus[itemIndex].docs = [];
          }

          newData[sectionIndex].syllabus[itemIndex].docs.push(newDoc);
        }
      }
      // ===================== YEAR / SEMESTER =====================
      else {
        if (isEditing && itemIndex !== null) {
          const oldItem = newData[sectionIndex].syllabus[itemIndex];

          newData[sectionIndex].syllabus[itemIndex] = {
            ...oldItem,
            year: year.trim(),

            // ✅ FIX: preserve backend pdf_path
            pdf_path: popupData.deletePdf ? "" : oldItem.pdf_path,
            deletePdf: popupData.deletePdf,

            url: file ? URL.createObjectURL(file) : oldItem.url,
            file: file || null,
            docs: oldItem.docs || [],
            _isNew: !!file,
          };
        } else {
          const newItem = {
            id: Date.now() + Math.random(),
            year: year.trim(),
            pdf_path: "",
            url: file ? URL.createObjectURL(file) : "",
            file: file || null,
            docs: [],
            _isNew: !!file,
          };

          if (!newData[sectionIndex].syllabus) {
            newData[sectionIndex].syllabus = [];
          }

          newData[sectionIndex].syllabus.push(newItem);
        }
      }

      return newData;
    });

    setIsDirty(true);
    setShowPopup(false);

    setPopupData({
      sectionIndex: null,
      itemIndex: null,
      docIndex: null,
      year: "",
      pdf_path: "",
      docName: "",
      file: null,
      isEditing: false,
      isDoc: false,
      isCurriculum: false,
      semesters: [],
      deletePdf: false,
    });
  };

  // Request handlers
  const handleRequest = () => setShowRequestModal(true);

  const getChanges = (sourceData = tempData) => {
    if (!sourceData || !originalData.length) return [];

    const changes = [];

    sourceData.forEach((section, sIdx) => {
      const originalSection = originalData[sIdx];

      section.syllabus?.forEach((item) => {
        const originalItem = originalSection?.syllabus?.find(
          (oItem) => oItem.id === item.id,
        );

        if (!originalItem) {
          // 🔹 New Year Added
          changes.push({
            action: "Added",
            section: section.heading,
            year: item.year,
            pdf_path: "",
            file: item.file instanceof File ? item.file : null,
          });

          // 🔹 Now create separate changes for each semester
          item.docs?.forEach((doc) => {
            if (doc.file instanceof File) {
              changes.push({
                action: "Added",
                section: `${section.heading} - ${item.year}`,
                year: item.year,
                docName: doc.name,
                pdf_path: "",
                file: doc.file, // ✅ THIS ensures file goes to buildPayload
              });
            }
          });
        } else {
          // Edited Year
          if (item.year !== originalItem.year || item.file instanceof File || item.deletePdf) {
            changes.push({
              action: "Edited",
              section: section.heading,
              year: item.year,
              pdf_path: originalItem.pdf_path || "",
              deletePdf: item.deletePdf || false,
              original_data: {
                year: originalItem.year,
                pdf_path: originalItem.pdf_path || "",
              },
              file: item.file instanceof File ? item.file : null,
            });
          }

          // Docs changes
          item.docs?.forEach((doc) => {
            const originalDoc = originalItem?.docs?.find(
              (oDoc) => oDoc.id === doc.id,
            );

            if (!originalDoc) {
              // New doc
              changes.push({
                action: "Added",
                section: `${section.heading} - ${item.year}`,
                year: item.year,
                docName: doc.name,
                pdf_path: doc.pdf_path || "",
                file: doc.file instanceof File ? doc.file : null,
              });
            } else if (
              doc.name !== originalDoc.name ||
              doc.file instanceof File ||
              doc.deletePdf

            ) {
              // Edited doc
              changes.push({
                action: "Edited",
                section: `${section.heading} - ${item.year}`,
                year: item.year,
                docName: doc.name,
                pdf_path: originalDoc.pdf_path || "",
                deletePdf: doc.deletePdf || false,
                original_data: {
                  name: originalDoc.name,
                  pdf_path: originalDoc.pdf_path || "",
                },
                file: doc.file instanceof File ? doc.file : null,
              });
            }
          });

          // Deleted Docs
          originalItem?.docs?.forEach((originalDoc) => {
            const exists = item.docs?.some((doc) => doc.id === originalDoc.id);
            if (!exists) {
              changes.push({
                action: "Deleted",
                section: `${section.heading} - ${item.year}`,
                year: item.year,
                docName: originalDoc.name,
                pdf_path: originalDoc.pdf_path || "",
              });
            }
          });
        }
      });

      // Deleted Years
      originalSection?.syllabus?.forEach((originalItem) => {
        const exists = section.syllabus?.some(
          (item) => item.id === originalItem.id,
        );
        if (!exists) {
          changes.push({
            action: "Deleted",
            section: section.heading,
            year: originalItem.year,
            pdf_path: originalItem.pdf_path || "",
          });
        }
      });
    });

    return changes;
  };
  const deptidmap = {
    "001": "AIDS_001",
    "002": "AUTO_002",
    "003": "CHEMISTRY_003",
    "004": "CIVIL_004",
    "005": "CSE_005",
    "006": "CSECS_006",
    "007": "EEE_007",
    "008": "EIE_008",
    "009": "ECE_009",
    "010": "ENGLISH_010",
    "011": "IT_011",
    "012": "MATHS_012",
    "013": "MECH_013",
    "014": "TAMIL_014",
    "015": "PHYSICS_015",
    "016": "MECSE_016",
    "017": "MBA_017",
    "018": "PS_018",
  };

  const buildPayload = (dataSource = pendingData) => {
    if (!dataSource) return { payload: [], files: [] };

    // ✅ Extract dept_id safely from data prop
    const dynamicCollectionName = deptidmap[deptId];

    if (!dynamicCollectionName) {
      toast.error("Invalid Department ID");
      return { payload: [], files: [] };
    }

    const changes = getChanges(dataSource);
    const payload = [];
    const files = [];

    changes.forEach((change) => {
      const base = {
        collectionName: dynamicCollectionName, // ✅ FIXED HERE
        collection_type: "curriculum_and_syllabus",
        category: "curriculum",
      };

      let entry = null;

      // ================= INSERT =================
      // ================= INSERT =================
      if (change.action === "Added") {
        const isFileAttached = change.file instanceof File;

        const newPath = isFileAttached
          ? `/staticpdf/curriculum/${change.file.name}`
          : "";

        entry = {
          ...base,
          action: "insert",
          title: change.docName ? "insert semester" : "insert year",
          meta_data: {
            year: change.year,
            name: change.docName || undefined,
            pdf_path: newPath, // ✅ same pattern as update
          },
        };

        if (isFileAttached) {
          entry.file = change.file;
          files.push(change.file);
        }
      }

      // ================= UPDATE =================
      if (change.action === "Edited") {
        const isFileReplaced = change.file instanceof File;

        let newPath;

        if (change.deletePdf) {
          // User clicked the dustbin
          newPath = "";
        } else if (isFileReplaced) {
          // User uploaded a new PDF
          newPath = `/staticpdf/curriculum/${change.file.name}`;
        } else {
          // Keep the existing PDF
          newPath = change.original_data?.pdf_path || "";
        }

        entry = {
          ...base,
          action: "update",
          title: change.docName ? "update semester" : "update year",
          meta_data: {
            year: change.year,
            name: change.docName || undefined,
            pdf_path: newPath,
          },
          original_data: {
            year: change.original_data?.year || undefined,
            name: change.original_data?.name || undefined,
            pdf_path: change.original_data?.pdf_path || "",
          },
        };

        if (isFileReplaced) {
          entry.file = change.file;
          files.push(change.file);
        }
      }

      // ================= DELETE =================
      if (change.action === "Deleted") {
        entry = {
          ...base,
          action: "delete",
          title: change.docName ? "delete semester" : "delete year",
          meta_data: {
            year: change.year,
            name: change.docName || undefined,
            pdf_path: change.pdf_path || "",
          },
        };
      }

      if (entry) payload.push(entry);
    });

    console.log("FINAL PAYLOAD:", payload);
    return { payload, files };
  };

  const handleFinalRequestConfirm = async () => {
  console.log("Final Request Button clicked");

  const sourceData = pendingData || tempData;
  const { payload, files } = buildPayload(sourceData);

  if (!payload.length) {
    toast.error("No valid changes detected to send");
    return;
  }

  try {
    const response = await sendRequest(payload, files);

    // ✅ Remove temporary frontend flags after successful request
    const cleanedData = deepCopy(sourceData).map((section) => ({
      ...section,
      syllabus: (section.syllabus || []).map((item) => ({
        ...item,
        file: null,
        url: item.pdf_path ? UrlParser(item.pdf_path) : "",
        _isNew: false,
        deletePdf: false,
        docs: (item.docs || []).map((doc) => ({
          ...doc,
          file: null,
          url: doc.pdf_path ? UrlParser(doc.pdf_path) : "",
          _isNew: false,
          deletePdf: false,
        })),
      })),
    }));

    setOriginalData(cleanedData);
    setTempData(deepCopy(cleanedData));

    setPendingData(null);
    setIsSaved(false);
    setIsDirty(false);
    setShowRequestModal(false);

    // toast.success("Changes request sent successfully!");

    console.log("Backend response:", response);
  } catch (err) {
    console.error("Request failed:", err);
    toast.error(err?.response?.data?.message || "Failed to process request");
  }
};

  // Check if popup has existing PDF
  const popupHasExistingPdf = (() => {
    if (!popupData.isEditing) return false;
    return !!(popupData.pdf_path || popupData.file);
  })();

  const showPopupEye = !!(popupData.file || popupData.pdf_path);

  // Check if edit modal has changes
  const editModalHasChanges = (() => {
    if (!popupData.isEditing) return true;

    if (popupData.isDoc) {
      const originalDoc =
        popupData.sectionIndex !== null &&
          popupData.itemIndex !== null &&
          popupData.docIndex !== null
          ? tempData[popupData.sectionIndex]?.syllabus[popupData.itemIndex]
            ?.docs[popupData.docIndex]
          : null;

      if (!originalDoc) return true;

      const nameChanged =
        (popupData.docName || "").trim() !== (originalDoc.name || "").trim();
      const pdfChanged = popupData.file instanceof File;
      return nameChanged || pdfChanged;
    } else {
      const originalItem =
        popupData.sectionIndex !== null && popupData.itemIndex !== null
          ? tempData[popupData.sectionIndex]?.syllabus[popupData.itemIndex]
          : null;

      if (!originalItem) return true;

      const yearChanged =
        (popupData.year || "").trim() !== (originalItem.year || "").trim();
      const pdfChanged = popupData.file instanceof File;
      return yearChanged || pdfChanged;
    }
  })();

  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadComp txt="You are offline" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadComp txt="Loading curriculum..." />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="h-screen flex items-center justify-center text-red-600 font-semibold">
        {errorMsg}
      </div>
    );
  }

  const changes = getChanges(pendingData || tempData);
  const editingChanges = getChanges(tempData);

  const handleAddCurriculum = () => {
    const romanSemesters = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

    const timestamp = Date.now();

    setPopupData({
      sectionIndex: 0, // UG section (first section)
      itemIndex: null,
      docIndex: null,
      year: "",
      pdf_path: "",
      docName: "",
      file: null,
      isEditing: false,
      isDoc: false,
      isSemester: false,
      isCurriculum: true,
      deletePdf: false,

      // ✅ Auto create 8 semesters
      semesters: romanSemesters.map((roman, index) => ({
        id: `${timestamp}-${index}`,
        name: `${roman} Semester`,
        pdf_path: "",
        file: null,
        url: "",
        _isNew: true,
      })),
    });

    setShowPopup(true);
  };

  return (
    <div className="containers mt-5">
      <ToastContainer position="bottom-right" autoClose={2000} />

      {/* Header */}
      <div className="flex justify-between items-center mb-8 px-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white"></h1>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2  px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
          >
            <Pencil size={18} />
            Edit
          </button>
        )}
      </div>

      {/* Main Content */}
      {tempData.length > 0 ? (
        <div className="row">
          <div className="col-md-6">
            {tempData.map((section, sectionIndex) => {
              const isUG = sectionIndex === 0;

              return (
                <div
                  key={sectionIndex}
                  className="content-section bg-prim dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] mb-10"
                >
                  <h2 className="text-bold text-[24px] text-brwn dark:text-drkt mb-8">
                    {section.heading}
                  </h2>

                  {section?.syllabus?.map((item, itemIndex) => {
                    const key = `${sectionIndex}-${itemIndex}`;
                    const hasDocs = item.docs?.length > 0;

                    if (isUG) {
                      const docs = hasDocs
                        ? item.docs
                        : item.pdf_path
                          ? [
                            {
                              name: "View",
                              pdf_path: item.pdf_path,
                              isView: true,
                            },
                          ]
                          : [];

                      return (
                        <div
                          key={key}
                          className="row-item dark:bg-drkp border-0 flex flex-col mb-4 relative"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="R-years self-start">
                              {item.year}
                            </div>

                            {isEditing && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    handleEditUGYear(sectionIndex, itemIndex)
                                  }
                                  className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                                  title="Edit"
                                >
                                  <Pencil size={16} />
                                </button>
                                <input
                                  type="checkbox"
                                  checked={selectedYears.has(
                                    `${sectionIndex}-${itemIndex}`,
                                  )}
                                  onChange={() =>
                                    toggleSelectYear(sectionIndex, itemIndex)
                                  }
                                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                              </div>
                            )}
                          </div>

                          <div className="overflow-hidden w-[90%] mx-auto mt-4">
                            <div className="grid grid-cols-3 gap-6 text-center">
                              {docs.map((doc, docIndex) => (
                                <button
                                  key={docIndex}
                                  onClick={() => {
                                    if (isEditing) {
                                      handleEditDoc(
                                        sectionIndex,
                                        itemIndex,
                                        docIndex,
                                        !hasDocs,
                                      );
                                    } else {
                                      handleViewWithFile(doc); // ✅ PASS FULL OBJECT
                                    }
                                  }}
                                  className={`px-4 py-2 rounded flex items-center justify-center gap-2 
          ${hasDocs
                                      ? "bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
                                      : "bg-secd hover:bg-brwn text-text hover:text-prim cursor-pointer"
                                    }`}
                                >
                                  {doc.isView && (
                                    <FontAwesomeIcon icon={faEye} />
                                  )}
                                  {doc.name}
                                </button>
                              ))}
                            </div>

                            {/* Move button here, outside of docs grid */}
                            {isEditing && (
                              <div className="mt-4 flex justify-center">
                                <button
                                  onClick={() =>
                                    handleAddExtraSemester(
                                      sectionIndex,
                                      itemIndex,
                                    )
                                  }
                                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-yellow-500 text-yellow-600 rounded hover:bg-yellow-50"
                                >
                                  <Plus size={16} />
                                  Add New Semester
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={key}
                        className="row-item rounded-lg dark:bg-drkp border-0 flex flex-row justify-between items-center mt-6"
                      >
                        <div className="R-years">{item.year}</div>

                        <div className="flex items-center gap-2">
                          {isEditing && (
                            <>
                              <button
                                onClick={() =>
                                  handleEditUGYear(sectionIndex, itemIndex)
                                }
                                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                                title="Edit"
                              >
                                <Pencil size={16} />
                              </button>
                              <input
                                type="checkbox"
                                checked={selectedYears.has(
                                  `${sectionIndex}-${itemIndex}`,
                                )}
                                onChange={() =>
                                  toggleSelectYear(sectionIndex, itemIndex)
                                }
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </>
                          )}

                          {item.pdf_path && (
                            <button
                              className="options-btn text-text bg-secd dark:text-drkt dark:bg-drks hover:bg-accn hover:text-prim dark:hover:bg-brwn"
                              onClick={() => handleViewWithFile(item)}
                            >
                              <FontAwesomeIcon
                                icon={faEye}
                                style={{ marginRight: "6px" }}
                              />
                              View
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Add New Curriculum Button */}
                  {isEditing && (
                    <button
                      onClick={handleAddCurriculum}
                      className="w-full mt-6 px-4 py-3 border-2  rounded-lg text-gray-600 dark:text-gray-400 hover:border-yellow-500 hover:text-yellow-600 dark:hover:border-yellow-400 dark:hover:text-yellow-400 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={20} />
                      Add New Curriculum
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center">
          <LoadComp />
        </div>
      )}

      {/* Delete Selected Button */}
      {isEditing && selectedYears.size > 0 && (
        <div className="relative mt-6 flex justify-center z-40">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 flex items-center gap-2 bg-red-500 text-prim rounded hover:bg-red-600"
          >
            <Trash2 size={20} />
            Delete Selected ({selectedYears.size})
          </button>
        </div>
      )}

      {/* Edit Mode Action Buttons */}
      {isEditing && (
        <div className="flex justify-end gap-3 mt-6 m-8">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500"
          >
            Cancel
          </button>
          {editingChanges.length > 0 && (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-secd text-text rounded hover:bg-brwn hover:text-prim transition-colors"
            >
              Save Changes
            </button>
          )}
        </div>
      )}

      {/* Saved Draft Actions */}
      {isSaved && (
        <div className="flex justify-end gap-3 mt-6 m-8">
          <button
            onClick={handleDiscard}
            className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500"
          >
            Discard Changes
          </button>
          {changes.length > 0 && (
            <button
              onClick={handleRequest}
              className="flex items-center px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
            >
              <Send size={18} />
              Request
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              {popupData.isEditing
                ? popupData.isDoc
                  ? "Edit Document"
                  : popupData.isSemester
                    ? "Edit Semester"
                    : "Edit Year"
                : popupData.isDoc
                  ? "Add Document"
                  : "Add Curriculum"}
            </h2>

            {/* Input Fields */}
            {/* Semester Name */}
            {popupData.isDoc &&
              (popupData.isEditing ? (
                // 🔒 EDIT MODE → static text
                <div className="w-full px-3 py-2 mb-4 border rounded bg-gray-100 text-gray-700">
                  {popupData.docName}
                </div>
              ) : (
                // ➕ ADD MODE → input box
                <input
                  type="text"
                  placeholder="Enter Semester Name"
                  value={popupData.docName || ""}
                  onChange={(e) =>
                    setPopupData((prev) => ({
                      ...prev,
                      docName: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 mb-4 border rounded"
                />
              ))}

            {/* Year Input */}
            {!popupData.isDoc && !popupData.isSemester && (
              <input
                type="text"
                placeholder="Enter Year (e.g., R-2023)"
                value={popupData.year}
                onChange={(e) =>
                  setPopupData((prev) => ({ ...prev, year: e.target.value }))
                }
                className="w-full px-3 py-2 mb-4 border rounded"
              />
            )}

            {/* File Upload Section */}
            {(popupData.isDoc || popupData.isSemester) && (
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">

                  {/* Upload */}
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="px-3 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500"
                  >
                    {popupData.file || popupData.pdf_path
                      ? "Replace PDF"
                      : "Upload PDF"}
                  </button>

                  {/* Preview */}
                  {(popupData.file || popupData.pdf_path) && (
                    <button
                      type="button"
                      onClick={handlePopupView}
                      className="px-3 py-2 rounded bg-[#fdcc03] hover:bg-[#800000] hover:text-white"
                      title="Preview PDF"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                  )}

                  {/* Delete PDF */}
                  {(popupData.file || popupData.pdf_path) && (
                    <button
                      type="button"
                      onClick={handleDeletePdf}
                      className="p-2 rounded hover:bg-gray-100 transition-colors duration-200"
                      title="Delete PDF"
                    >
                      <Trash2
                        size={22}
                        className="text-red-500"
                      />
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                </div>
                {popupData.file && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✓ {popupData.file.name}
                  </p>
                )}
                {!popupData.file && popupData.pdf_path && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Existing PDF: {popupData.pdf_path.split("/").pop()}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 m-8">
              <button
                onClick={() => {
                  setShowPopup(false);
                  setPopupData({
                    sectionIndex: null,
                    itemIndex: null,
                    docIndex: null,
                    year: "",
                    pdf_path: "",
                    docName: "",
                    file: null,
                    isEditing: false,
                    isDoc: false,
                    isSemester: false,
                    isCurriculum: false,
                    deletePdf: false,
                  });
                }}
                className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500"
              >
                Cancel
              </button>
              {(!popupData.isEditing || editModalHasChanges) && (
                <button
                  onClick={handlePopupSubmit}
                  className="px-4 py-2 bg-secd text-text rounded hover:bg-brwn hover:text-prim transition-colors"
                  disabled={
                    popupData.isDoc
                      ? !popupData.isEditing && !popupData.file
                      : popupData.isSemester
                        ? !popupData.file && !popupData.isEditing
                        : !popupData.year.trim()
                  }
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Review Changes
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Note: Your changes will stay pending until approved by the
              superior admin.
            </p>

            {changes.length > 0 ? (
              <div className="max-h-96 overflow-y-auto mb-4">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">
                        Action
                      </th>
                      <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">
                        Section
                      </th>
                      <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">
                        Changes
                      </th>
                      <th className="px-4 py-2 text-center text-gray-700 dark:text-gray-300">
                        Revert
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {changes.map((ch, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-200 dark:border-gray-700"
                      >
                        <td className="px-4 py-2">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium
                            ${ch.action === "Added"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                : ch.action === "Edited"
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                              }`}
                          >
                            {ch.action}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                          {ch.section}
                        </td>
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                          {ch.docName || ch.year}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => handleRevertChange(ch)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Revert this change"
                          >
                            <X size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No changes detected.
              </p>
            )}

            <div className="flex justify-end gap-3 mt-6 m-8">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500"
              >
                Cancel
              </button>
              {changes.length > 0 && (
                <button
                  onClick={handleFinalRequestConfirm}
                  className={`flex items-center px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim ${loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  disabled={loading}
                >
                  Final Request
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Confirm Delete
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete {selectedYears.size} selected
              year(s)? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 mt-6 m-8">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteYears}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default CurriculumPage;
