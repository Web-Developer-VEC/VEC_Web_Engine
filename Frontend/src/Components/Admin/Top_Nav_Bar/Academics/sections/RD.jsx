import React, { useState, useEffect } from "react";
import "./RD.css";
import LoadComp from "../../../LoadComp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt,
  faBook,
  faClipboard,
  faLightbulb,
  faIndustry,
  faChartBar,
  faCogs,
  faCodeBranch,
} from "@fortawesome/free-solid-svg-icons";
import { Eye, Pencil, Trash2, X } from "lucide-react";
import { useAdminRequest } from "../../../../hooks/useAdminRequest";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Research = ({ data }) => {
  const [originalData, setOriginalData] = useState([]);
  const [departmentResearch, setDepartmentResearch] = useState([]);
  const [deptId, setDeptId] = useState("");

  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [selectedYears, setSelectedYears] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [changesLog, setChangesLog] = useState([]);

  const [addingYear, setAddingYear] = useState(false);
  const [newYearInput, setNewYearInput] = useState("");
  const [showDeletePdfModal, setShowDeletePdfModal] = useState(false);
  const [pdfToDelete, setPdfToDelete] = useState(null);
  
  const { sendRequest, loading, error } = useAdminRequest();
  console.log("RD data:", data);
  const deptMap = {
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
    "018": "PS_018"
  };

  const defaultResearch = [
    "Book",
    "Funded Proposal",
    "Journal Publications",
    "Patent",
    "International and National Conferences",
    "Consultancy",
    "Internship",
    "Product Development",
    "Startup and Technology Transfer",
  ];

  // Load initial data
  useEffect(() => {
    const depResearch =
      data?.find((item) => item.category === "department_research")?.content ||
      [];
    
    const bannerData = data?.find((item) => item.category === "banner_name_and_image")?.content?.[0];
    if (bannerData?.dept_id) {
      setDeptId(bannerData.dept_id);
    }

    setOriginalData(depResearch);
    console.log("Original Data:", depResearch);
    setDepartmentResearch(depResearch.map((item) => ({ ...item })));
    setYears(depResearch.map((item) => item.year));
    if (depResearch.length > 0 && !selectedYear) {
      setSelectedYear(depResearch[0].year);
    }
  }, [data]);

  const selectedYearData =
    departmentResearch.find((item) => item.year === selectedYear) || {
      year: selectedYear,
      research: [],
    };

  const researchTileArray = selectedYearData?.research || [];

  const toggleYearSelection = (year) => {
    if (selectedYears.includes(year)) {
      setSelectedYears(selectedYears.filter((y) => y !== year));
    } else {
      setSelectedYears([...selectedYears, year]);
    }
  };

  // Add new year (append at end)
  const handleAddYear = () => {
    if (newYearInput && !years.includes(newYearInput)) {
      const newYearData = {
        year: newYearInput,
        research: defaultResearch.map((name) => ({
          name,
          pdf_path: "",
        }
      
      )),
      };
      console.log(newYearData);


      const updated = [...departmentResearch, newYearData]; // append
      setDepartmentResearch(updated);
      setYears([...years, newYearInput]);
      setSelectedYear(newYearInput);

      setAddingYear(false);
      setNewYearInput("");
      setHasChanges(true);

      setChangesLog((prev) => [
        ...prev,
        {
          id: Date.now(),
          action: "Add",
          section: "Year",
          title: newYearInput,
          prevValue: null,
          newValue: newYearData,
        },
      ]);
    }
  };

  const handleUndoChange = (id) => {
    const change = changesLog.find((c) => c.id === id);
    if (!change) return;

    if (change.section === "Research") {
      setDepartmentResearch((prev) =>
        prev.map((yearItem) =>
          yearItem.year === selectedYear
            ? {
                ...yearItem,
                research: yearItem.research.map((r) =>
                  r.name === change.title
                    ? { ...r, pdf_path: change.prevValue }
                    : r
                ),
              }
            : yearItem
        )
      );
    }

    if (change.section === "Year") {
      if (change.action === "Add") {
        // Remove the year again
        setDepartmentResearch((prev) =>
          prev.filter((y) => y.year !== change.newValue.year)
        );
        setYears((prev) => prev.filter((y) => y !== change.newValue.year));
      } else if (change.action === "Delete") {
        // Restore deleted year
        setDepartmentResearch((prev) => [...prev, change.prevValue]);
        setYears((prev) => [...prev, change.prevValue.year]);
      }
    }

    // Remove from log
    setChangesLog((prev) => prev.filter((c) => c.id !== id));
  };

  const buildPayload = () => {
    const payload = [];
    const collectionName = deptMap[deptId] || "UNKNOWN";
  
    // Helper function to get proper PDF path
    const getPdfPath = (research, year) => {
      if (!research.pdf_path) return "";
      
      // If it's a blob URL (newly uploaded file), generate the static path
      if (research.pdf_path.startsWith("blob:") && research._file) {
        // Convert year "2024 - 2025" to "2425"
        const yearShort = year.replace(/\s/g, "").replace("-", "").slice(2);
        return `/static/pdfs/research/${deptId}/${yearShort}/${research._file.name}`;
      }
      
      // Otherwise, use the existing path from database
      return research.pdf_path;
    };

    // Track which years are processed
    const processedYears = new Set();

    // Check each year in current departmentResearch
    departmentResearch.forEach((currentYear) => {
      processedYears.add(currentYear.year);
      const originalYear = originalData.find(y => y.year === currentYear.year);

      if (!originalYear) {
        // NEW YEAR - Insert action
        const researchWithPdf = currentYear.research.filter(r => r.pdf_path);
        if (researchWithPdf.length > 0) {
          payload.push({
            collectionName,
            collection_type: "research",
            action: "insert",
            title: `Insert Research ${currentYear.year}`,
            category: "department_research",
            meta_data: {
              year: currentYear.year,
              research: researchWithPdf.map(r => ({
                name: r.name,
                pdf_path: getPdfPath(r, currentYear.year)
              }))
            },
            original_data: null
          }
        );
        }
      } else {
        // EXISTING YEAR - Check if anything changed (Update action)
        const currentResearch = currentYear.research.filter(r => r.pdf_path);
        const originalResearch = originalYear.research;

        // Check if there are any changes
        const hasChanges = 
          currentResearch.length !== originalResearch.length ||
          currentResearch.some((current) => {
            const original = originalResearch.find(o => o.name === current.name);
            return !original || original.pdf_path !== current.pdf_path;
          }) ||
          originalResearch.some((original) => {
            const current = currentResearch.find(c => c.name === original.name);
            return !current;
          });

        if (hasChanges) {
          payload.push({
            collectionName,
            collection_type: "research",
            action: "update",
            title: `Update Research ${currentYear.year}`,
            category: "department_research",
            meta_data: {
              year: currentYear.year,
              research: currentResearch.map(r => ({
                name: r.name,
                pdf_path: getPdfPath(r, currentYear.year)
              }))
            },
            original_data: {
              year: originalYear.year,
              research: originalResearch.map(r => ({
                name: r.name,
                pdf_path: r.pdf_path // Original always has proper path
              }))
            }
          });
        }
      }
    });
console.log("Payload after processing current years:", payload);
    // Check for deleted years (in original but not in current) - Delete action
    originalData.forEach((originalYear) => {
      if (!processedYears.has(originalYear.year)) {
        // DELETED WHOLE YEAR - delete entire year
        payload.push({
          collectionName,
          collection_type: "research",
          action: "delete",
          title: `Delete Whole Research ${originalYear.year}`,
          category: "department_research",
          meta_data: {
            year: originalYear.year,
            research: originalYear.research.map(r => ({
              name: r.name,
              pdf_path: r.pdf_path
            }))
          },
          original_data: null
        });
      }
    });

    return payload;
  };

  const handleRequestConfirm = async () => {
    const payload = buildPayload();

    if (payload.length === 0) {
      alert("No changes to submit!");
      return;
    }

    // Collect files from departmentResearch
    const files = [];
    departmentResearch.forEach((yearData) => {
      yearData.research.forEach((item) => {
        if (item.pdf_path && item.pdf_path.startsWith("blob:")) {
          // This is a new file upload
          files.push(item._file);
        }
      });
    });

    console.log(payload, files);
    

    const result = await sendRequest(payload, files.length > 0 ? files : null);

    if (result) {
      setShowRequestModal(false);
      setChangesLog([]);
      setHasChanges(false);
      setShowSaveOptions(false);
    }
  };

  const handleDiscardChanges = () => {
    setDepartmentResearch(originalData.map((item) => ({ ...item })));
    setYears(originalData.map((item) => item.year));
    setSelectedYear(originalData[0]?.year || "");
    setHasChanges(false);
    setShowSaveOptions(false);
    setChangesLog([]);
  };

  if (!departmentResearch.length && years.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp txt="" />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex justify-end">
        {!isEditing && (
          <button
            className="bg-secd text-text hover:bg-brwn hover:text-prim flex gap-2 px-3 py-1 rounded mr-4 items-center"
            onClick={() => {
              setIsEditing(true);
              setShowSaveOptions(false); // ✅ Reset bottom bar
            }}
          >
            <Pencil size={16} /> Edit
          </button>
        )}
      </div>

      <div className="RD-intro flex justify-center items-center">
        <h1 className="RD-header text-brwn dark:text-drkt font-[Poppins]">
          RESEARCH DATA
        </h1>
      </div>

      {/* Year Filter */}
      <div className="RD-years-horizontal flex flex-wrap justify-center gap-4 my-4">
        {years?.map((year) => (
          <div key={year} className="relative">
            <button
              onClick={() => setSelectedYear(year)}
              className={`relative px-4 py-2 rounded RD-year-button ${
                selectedYear === year
                  ? "bg-accn text-prim"
                  : "bg-secd text-text dark:bg-drks"
              }`}
            >
              {year}
              {isEditing && (
                <input
                  type="checkbox"
                  checked={selectedYears.includes(year)}
                  onChange={() => toggleYearSelection(year)}
                  className="absolute top-0 right-0 m-1 w-4 h-4"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </button>
          </div>
        ))}

        {/* Add Year Button */}
        {isEditing && !addingYear && (
          <button
            className="flex items-center gap-2 px-4 py-2 rounded bg-secd text-text hover:bg-brwn hover:text-prim"
            onClick={() => setAddingYear(true)}
          >
            + New Year
          </button>
        )}

        {addingYear && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newYearInput}
              onChange={(e) => setNewYearInput(e.target.value)}
              placeholder="Enter year"
              className="px-2 py-1 border rounded"
            />
            <button
              onClick={handleAddYear}
              className="bg-secd text-text hover:bg-brwn hover:text-prim px-3 py-1 rounded"
            >
              Add
            </button>
            <button
              onClick={() => {
                setAddingYear(false);
                setNewYearInput("");
              }}
              className="bg-gray-400 text-white px-3 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Research Tile Section */}
      {selectedYears.length === 0 && (
        <ResearchTile
          data={researchTileArray}
          isEditing={isEditing}
          setHasChanges={setHasChanges}
          setChangesLog={setChangesLog}
          departmentResearch={departmentResearch}
          setDepartmentResearch={setDepartmentResearch}
          selectedYear={selectedYear}
        />
      )}

      {/* Delete Years */}
      {isEditing && selectedYears.length > 0 && (
        <div className="bottom-0 left-0 w-full p-4 flex justify-center border-t">
          <button
            className="bg-red-600 text-white px-6 py-2 rounded flex items-center gap-2"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 /> Delete Selection
          </button>
        </div>
      )}

      {/* Bottom Bar (Edit Mode Actions) */}
      {isEditing && !showSaveOptions && (
        <div className="bottom-0 left-0 w-full p-4 flex justify-end gap-4 border-t">
          <button
            className="bg-gray-400 text-white px-4 py-2 rounded"
            onClick={() => {
              setIsEditing(false);
              setHasChanges(false);
              setSelectedYears([]);
            }}
          >
            Cancel
          </button>
          {hasChanges && (
            <button
              className="bg-secd text-text hover:bg-brwn hover:text-prim px-4 py-2 rounded"
              onClick={() => {
                // Filter out empty tiles before saving
                setDepartmentResearch((prev) =>
                  prev.map((yearItem) => ({
                    ...yearItem,
                    research: yearItem.research.filter((r) => r.pdf_path), // keep only with PDFs
                  }))
                );

                setShowSaveOptions(true);
                setIsEditing(false);
              }}
            >
              Save
            </button>
          )}
        </div>
      )}

      {/* After Save: Discard / Request */}
      {showSaveOptions && !isEditing && (
        <div className="bottom-0 left-0 w-full p-4 flex justify-end gap-4 border-t">
          <button
            className="bg-gray-400 text-white px-4 py-2 rounded"
            onClick={handleDiscardChanges}
          >
            Discard Changes
          </button>
          <button
            className="bg-secd text-text hover:bg-brwn hover:text-prim px-4 py-2 rounded"
            onClick={() => setShowRequestModal(true)}
          >
            Request
          </button>
        </div>
      )}

      {/* Request Popup */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] overflow-y-auto">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[900px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-center">Request Changes</h2>
            <p className="text-sm text-red-500 mb-4 text-center">
              Note: Changes stay pending until approved by the superior admin.
            </p>

            <table className="w-full border mb-4">
              <thead className="bg-gry">
                <tr>
                  <th className="px-2 py-1 text-center">Action</th>
                  <th className="px-2 py-1 text-center">Section</th>
                  <th className="px-2 py-1 text-center">Changes</th>
                  <th className="px-2 py-1 text-center">Undo</th>
                </tr>
              </thead>
              <tbody>
                {changesLog.map((c) => (
                  <tr key={c.id}>
                    <td className="px-2 py-1 text-center">{c.action}</td>
                    <td className="px-2 py-1 text-center">{c.section}</td>
                    <td className="px-2 py-1 text-center">{c.title}</td>
                    <td className="px-2 py-1 text-center">
                      <button
                        onClick={() => handleUndoChange(c.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {changesLog.length === 0 && (
              <p className="text-center text-gray-500">No changes to request.</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              {changesLog.length > 0 && (
                <button
                  onClick={handleRequestConfirm}
                  className={`px-4 py-2 rounded bg-secd text-text hover:bg-brwn hover:text-prim ${loading ? 'cursor-progress' : ''}`}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Confirm Request"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[400px]">
            <h2 className="text-lg font-bold mb-4 text-center text-red-600">
              Confirm Delete
            </h2>
            <p className="text-center mb-6">
              Are you sure you want to delete year(s):{" "}
              <span className="font-semibold">{selectedYears.join(", ")}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded bg-gray-400 text-white"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white"
                onClick={() => {
                  const updated = departmentResearch.filter(
                    (item) => !selectedYears.includes(item.year)
                  );
                  setDepartmentResearch(updated);
                  setYears(updated.map((item) => item.year));
                  setSelectedYear(updated[0]?.year || "");

                  setChangesLog((prev) => [
                    ...prev,
                    ...selectedYears.map((yr) => ({
                      id: Date.now() + Math.random(),
                      action: "Delete",
                      section: "Year",
                      title: yr,
                    })),
                  ]);

                  setSelectedYears([]);
                  setHasChanges(true);
                  setShowDeleteModal(false);
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
};

const ResearchTile = ({
  data,
  isEditing,
  setHasChanges,
  setChangesLog,
  departmentResearch,
  setDepartmentResearch,
  selectedYear,
}) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [showDeletePdfModal, setShowDeletePdfModal] = useState(false);
  const [pdfToDelete, setPdfToDelete] = useState(null);

  const UrlParser = (path) => {
    return path?.startsWith("http") || path?.startsWith("blob")
      ? path
      : `${BASE_URL}${path}`;
  };

  const defaultResearch = [
    "Book",
    "Funded Proposal",
    "Journal Publications",
    "Publication",
    "Patent",
    "International and National Conferences",
    "Consultancy",
    "Internship",
    "Product Development",
    "Startup and Technology Transfer",
    "Book And Book Chapter",
    "Sponsored Research",
    "Conference"
  ];

  const actionIcons = {
    Book: faBook,
    "Funded Proposal": faFileAlt,
    "Journal Publications": faBook,
    Patent: faClipboard,
    "International and National Conferences": faChartBar,
    Consultancy: faCogs,
    Internship: faIndustry,
    "Product Development": faLightbulb,
    "Startup and Technology Transfer": faCodeBranch,
  };

  // Merge: all tiles in edit mode, only uploaded in view mode
  const mergedResearch = isEditing
    ? defaultResearch.map((name) => {
        const existing = data?.find((r) => r.name === name);
        return existing || { name, pdf_path: "" };
      })
    : data.filter((r) => r.pdf_path);

  const handlePdfOpen = (pdfPath) => {
    if (pdfPath) window.open(UrlParser(pdfPath), "_blank");
  };

  const handlePdfChange = (e, itemName) => {
    const file = e.target.files[0];
    if (file) {
      setHasChanges(true);

      setDepartmentResearch((prev) =>
        prev.map((yearItem) =>
          yearItem.year === selectedYear
            ? {
                ...yearItem,
                research: yearItem.research
                  .filter((r) => r.name !== itemName)
                  .concat({
                    name: itemName,
                    pdf_path: URL.createObjectURL(file),
                    _file: file
                  }),
              }
            : yearItem
        )
      );

      setChangesLog((prev) => [
        ...prev,
        {
          id: Date.now(),
          action: "Upload/Replace PDF",
          section: "Research",
          title: itemName,
        },
      ]);
    }
  };

  const confirmRemovePdf = (itemName) => {
    setPdfToDelete(itemName);
    setShowDeletePdfModal(true);
  };

  const handleRemovePdf = () => {
    const itemName = pdfToDelete;
    
    // Get the current item to check if it's a blob URL
    const currentYear = departmentResearch.find(y => y.year === selectedYear);
    const currentItem = currentYear?.research.find(r => r.name === itemName);
    const isNewUpload = currentItem?.pdf_path?.startsWith("blob:");

    setHasChanges(true);

    setDepartmentResearch((prev) =>
      prev.map((yearItem) =>
        yearItem.year === selectedYear
          ? {
              ...yearItem,
              research: yearItem.research.map((r) =>
                r.name === itemName ? { ...r, pdf_path: "" } : r
              ),
            }
          : yearItem
      )
    );

    if (isNewUpload) {
      // If it's a blob URL (newly uploaded), remove the corresponding upload log entry
      // This way: upload + immediate remove = no net change
      setChangesLog((prev) =>
        prev.filter(log => !(log.title === itemName && log.action === "Upload/Replace PDF"))
      );
    } else {
      // If it's an existing PDF from database, log the removal
      setChangesLog((prev) => [
        ...prev,
        {
          id: Date.now(),
          action: "Remove PDF",
          section: "Research",
          title: itemName,
        },
      ]);
    }

    setShowDeletePdfModal(false);
    setPdfToDelete(null);
  };

  return (
    <div className="Rd-page mb-10">
      <div className="RD-content">
        <div className="RD-details">
          <div className="RD-year-actions">
            {mergedResearch.map((item, index) => (
              <div
                key={index}
                className="RD-action-button relative flex items-center gap-2"
                onClick={() => !isEditing && handlePdfOpen(item?.pdf_path)}
              >
                <FontAwesomeIcon
                  icon={actionIcons[item?.name] || faFileAlt}
                  style={{ marginRight: "10px" }}
                />
                <span
                  className="cursor-pointer"
                >
                  {item?.name}
                </span>

                {isEditing && (
                  <div className="flex gap-2 ml-4 items-center">
                    {/* Upload/Replace PDF */}
                    <label className="cursor-pointer bg-secd text-text hover:bg-brwn hover:text-prim px-3 py-1 rounded flex items-center text-[13px] justify-center">
                      {item?.pdf_path ? "Replace PDF" : "Upload PDF"}
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => handlePdfChange(e, item?.name)}
                        hidden
                      />
                    </label>

                    {/* Eye + Remove buttons */}
                    {item?.pdf_path && (
                      <>
                        <button
                          className="px-2 py-1 rounded text-blue-300"
                          onClick={() => handlePdfOpen(item?.pdf_path)}
                        >
                          <Eye size={16}/>
                        </button>
                        <button
                          className="px-2 py-1 rounded text-red-400 hover:text-red-600"
                          onClick={() => confirmRemovePdf(item?.name)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete PDF Confirmation Modal */}
      {showDeletePdfModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[2000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[400px]">
            <h2 className="text-lg font-bold mb-4 text-center text-red-600">
              Confirm Delete PDF
            </h2>
            <p className="text-center mb-6">
              Are you sure you want to remove the PDF for <span className="font-semibold">{pdfToDelete}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
                onClick={() => {
                  setShowDeletePdfModal(false);
                  setPdfToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={handleRemovePdf}
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Research;