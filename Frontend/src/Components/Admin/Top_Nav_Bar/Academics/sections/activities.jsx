import React, { useState, useEffect } from "react";
import "./Activities.css";
import LoadComp from "../../../LoadComp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCertificate,
  faChalkboardTeacher,
  faComments,
  faFileAlt,
  faHandshake,
  faIndustry,
  faLaptopCode,
  faTools,
  faUser,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { Eye, Pencil, Trash2, X } from "lucide-react";
import "./activitiestile.css";

const Activities = ({ data }) => {
  const [originalData, setOriginalData] = useState([]);
  const [departmentActivities, setDepartmentActivities] = useState([]);

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

  const defaultActivities = [
    "Guest Lecture",
    "Seminar",
    "Workshop",
    "Industrial Visit/ In-Plant Training",
    "Internship",
    "Symposium",
    "Conference",
    "Value Added Course",
  ];

  // Load initial data
  useEffect(() => {
    const depActs =
      data?.find((item) => item.category === "department_activities")?.content ||
      [];

    setOriginalData(depActs); // backup
    setDepartmentActivities(depActs.map((item) => ({ ...item }))); // working copy
    setYears(depActs.map((item) => item.year));
    if (depActs.length > 0 && !selectedYear) {
      setSelectedYear(depActs[0].year);
    }
  }, [data]);

  const selectedYearData =
    departmentActivities.find((item) => item.year === selectedYear) || {
      year: selectedYear,
      activities_tile: [],
    };

  const activitiesTileArray = selectedYearData?.activities_tile || [];

  // Toggle year selection
  const toggleYearSelection = (year) => {
    if (selectedYears.includes(year)) {
      setSelectedYears(selectedYears.filter((y) => y !== year));
    } else {
      setSelectedYears([...selectedYears, year]);
    }
  };

  // Add new year
  const handleAddYear = () => {
    if (newYearInput && !years.includes(newYearInput)) {
      const newYearData = {
        year: newYearInput,
        activities_tile: defaultActivities.map((name) => ({
          name,
          pdf_path: "",
        })),
      };

      const updated = [newYearData, ...departmentActivities];
      setDepartmentActivities(updated);
      setYears([newYearInput, ...years]);
      setSelectedYear(newYearInput);

      setAddingYear(false);
      setNewYearInput("");
      setHasChanges(true);

      setChangesLog((prev) => [
        ...prev,
        { id: Date.now(), action: "Add", section: "Year", title: newYearInput },
      ]);
    }
  };

  // Undo change log entry
  const handleUndoChange = (id) => {
    setChangesLog((prev) => prev.filter((c) => c.id !== id));
  };

  // Confirm request
  const handleRequestConfirm = () => {
    alert("Request submitted with changes!");
    setShowRequestModal(false);
    setChangesLog([]);
  };

  // Discard changes
  const handleDiscardChanges = () => {
    setDepartmentActivities(originalData.map((item) => ({ ...item })));
    setYears(originalData.map((item) => item.year));
    setSelectedYear(originalData[0]?.year || "");
    setHasChanges(false);
    setShowSaveOptions(false);
    setChangesLog([]);
  };

  if (!departmentActivities.length && years.length === 0) {
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
            className="bg-secd text-text hover:bg-brwn hover:text-prim flex gap-2 px-3 py-1 rounded mr-4"
            onClick={() => setIsEditing(true)}
          >
            <Pencil size={16} /> Edit
          </button>
        )}
      </div>

      <div className="deptevent-intro flex justify-center items-center">
        <h1 className="deptevent-header text-brwn dark:text-drkt text-[Poppins] text-[16px] md:text-[24px]">
          Department Activities
        </h1>
      </div>

      {/* Year Filter */}
      <div className="year-filter flex flex-wrap justify-center gap-4 my-4">
        {years?.map((year) => (
          <div key={year} className="relative">
            <button
              onClick={() => setSelectedYear(year)}
              className={`relative px-4 py-2 rounded deptevent-year-button ${
                selectedYear === year
                  ? "bg-accn text-prim"
                  : "bg-secd text-text dark:bg-drks"
              }`}
            >
              {year}

              {/* Checkbox in top-right corner */}
              {isEditing && (
                <input
                  type="checkbox"
                  checked={selectedYears.includes(year)}
                  onChange={() => toggleYearSelection(year)}
                  className="absolute top-0 right-0 m-1 w-4 h-4"
                  onClick={(e) => e.stopPropagation()} // prevents triggering year button click
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
            <FontAwesomeIcon icon={faPlus} /> New Year
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

      {/* Activities Tile Section */}
      {selectedYears.length === 0 && (
        <Activitiestile
          data={activitiesTileArray}
          isEditing={isEditing}
          setHasChanges={setHasChanges}
          setChangesLog={setChangesLog}
          departmentActivities={departmentActivities}
          setDepartmentActivities={setDepartmentActivities}
          selectedYear={selectedYear}
        />
      )}

      {/* Delete Selection */}
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
      {showSaveOptions && (
        <div className="bottom-0 left-0 w-full p-4 flex justify-end gap-4 border-t">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
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
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[600px] max-h-[80vh] overflow-y-auto">
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
                  className="px-4 py-2 rounded bg-secd text-text hover:bg-brwn hover:text-prim"
                >
                  Confirm Request
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
                  // Remove selected years
                  const updated = departmentActivities.filter(
                    (item) => !selectedYears.includes(item.year)
                  );
                  setDepartmentActivities(updated);
                  setYears(updated.map((item) => item.year));
                  setSelectedYear(updated[0]?.year || "");

                  // Log deletions
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
    </>
  );
};

const Activitiestile = ({
  data,
  isEditing,
  setHasChanges,
  setChangesLog,
  departmentActivities,
  setDepartmentActivities,
  selectedYear,
}) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") || path?.startsWith("blob")
      ? path
      : `${BASE_URL}${path}`;
  };

  const actionIcons = {
    "Guest Lecture": faChalkboardTeacher,
    Seminar: faUser,
    Workshop: faTools,
    "Industrial Visit/ In-Plant Training": faIndustry,
    Symposium: faComments,
    Conference: faHandshake,
    Internship: faLaptopCode,
    "Value Added Course": faCertificate,
  };

  const handlePdfOpen = (pdfPath) => {
    if (pdfPath) window.open(UrlParser(pdfPath), "_blank");
  };

  const handlePdfChange = (e, itemName) => {
    const file = e.target.files[0];
    if (file) {
      setHasChanges(true);

      setDepartmentActivities((prev) =>
        prev.map((yearItem) =>
          yearItem.year === selectedYear
            ? {
                ...yearItem,
                activities_tile: yearItem.activities_tile.map((act) =>
                  act.name === itemName
                    ? { ...act, pdf_path: URL.createObjectURL(file) }
                    : act
                ),
              }
            : yearItem
        )
      );

      setChangesLog((prev) => [
        ...prev,
        {
          id: Date.now(),
          action: "Upload/Replace PDF",
          section: "Activity",
          title: itemName,
        },
      ]);
    }
  };

  const handleRemovePdf = (itemName) => {
    setHasChanges(true);

    setDepartmentActivities((prev) =>
      prev.map((yearItem) =>
        yearItem.year === selectedYear
          ? {
              ...yearItem,
              activities_tile: yearItem.activities_tile.map((act) =>
                act.name === itemName ? { ...act, pdf_path: "" } : act
              ),
            }
          : yearItem
      )
    );

    setChangesLog((prev) => [
      ...prev,
      {
        id: Date.now(),
        action: "Remove PDF",
        section: "Activity",
        title: itemName,
      },
    ]);
  };

  return data ? (
    <div className="Rd-page mb-10">
      <div className="deptevent-content">
        <div className="deptevent-details">
          <div className="deptevent-year-actions">
            {Array.isArray(data) &&
              data?.map((item, index) => (
                <div
                  key={index}
                  className="deptevent-action-button flex items-center gap-2"
                >
                  <FontAwesomeIcon
                    icon={actionIcons[item?.name] || faFileAlt}
                    style={{ marginRight: "10px" }}
                  />
                  <span
                    className="cursor-pointer"
                    onClick={() => !isEditing && handlePdfOpen(item?.pdf_path)}
                  >
                    {item?.name}
                  </span>

                  {isEditing && (
                    <div className="flex gap-2 ml-4">
                      {/* Upload PDF */}
                      <label className="cursor-pointer bg-secd text-text hover:bg-brwn hover:text-prim px-3 py-1 rounded">
                        {item?.pdf_path ? "Replace PDF" : "Upload PDF"}
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => handlePdfChange(e, item?.name)}
                          hidden
                        />
                      </label>

                      {/* Eye Button */}
                      {item?.pdf_path && (
                        <>
                          <button
                            className="px-2 py-1 rounded text-blue-300"
                            onClick={() => handlePdfOpen(item?.pdf_path)}
                          >
                            <Eye />
                          </button>
                          {/* Remove PDF Button */}
                          <button
                            className="px-2 py-1 rounded text-red-500"
                            onClick={() => handleRemovePdf(item?.name)}
                          >
                            <X />
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
    </div>
  ) : (
    <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
      <LoadComp />
    </div>
  );
};

export default Activities;