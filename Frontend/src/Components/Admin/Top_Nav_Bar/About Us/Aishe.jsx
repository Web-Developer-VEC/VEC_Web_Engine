import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Banner from "../../Banner";
import { Plus, Eye } from "lucide-react";
import "./AbtYr.css";
import axios from "axios";
import AisheSideNav from "./aishe_nav";

const AdminAishe = ({ toggle, theme }) => {
  const navigate = useNavigate();
  const [section, setAbtyear] = useState("2021-2022");
  const [aboutYearData, setAboutYearData] = useState([]);
  const [editMode, setEditMode] = useState(false);

  // For year add/delete
  const [showYearModal, setShowYearModal] = useState(false);
  const [newYear, setNewYear] = useState("");
  const [showYearDeleteConfirm, setShowYearDeleteConfirm] = useState(false);
  const [yearToDelete, setYearToDelete] = useState(null);
  const [deletedYearIndex, setDeletedYearIndex] = useState(null);

  // For PDFs
  const [pdfModal, setPdfModal] = useState({
    open: false,
    index: null,
    name: "",
    file: null,
    error: "",
    yearIdx: null,
  });
  const [selectedPdfs, setSelectedPdfs] = useState([]);
  const [showPdfDeleteConfirm, setShowPdfDeleteConfirm] = useState(false);

  // Change tracking
  const [changed, setChanged] = useState(false);
  const [savedChanges, setSavedChanges] = useState(false);

  // Snapshots
  const [editSessionSnapshot, setEditSessionSnapshot] = useState(null);

  // Confirm popups
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Default buttons from backend
  const [defaultButtons, setDefaultButtons] = useState([]);

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) =>
    path?.startsWith("http") ? path : `${BASE_URL}${path}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("/api/main-backend/about_us", {
          type: "AISHE",
        });
        setAboutYearData(response.data.data);
        setEditSessionSnapshot(null);
        setChanged(false);
        setSavedChanges(false);
      } catch (error) {
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
        }
      }
    };
    fetchData();
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.body.scrollTo({ top: 0, behavior: "smooth" });
    document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
  }, [navigate]);

  // Fetch default buttons from backend on mount
  useEffect(() => {
    const fetchDefaultButtons = async () => {
      try {
        const response = await axios.get(
          "/api/main-backend/aishe_default_buttons"
        );
        setDefaultButtons(response.data?.buttons || []);
      } catch {
        setDefaultButtons([
          "Certificate",
          "Data Capture Format",
          "Teaching Staff Details",
        ]);
      }
    };
    fetchDefaultButtons();
  }, []);

  // Enter edit mode: take snapshot for restoring
  const handleEditClick = () => {
    setEditSessionSnapshot(JSON.parse(JSON.stringify(aboutYearData)));
    setEditMode(true);
    setChanged(false);
    setSavedChanges(false);
    setSelectedPdfs([]);
  };

  // Cancel logic (undo)
  const handleCancel = () => {
    if (changed) {
      setShowCancelConfirm(true);
    } else {
      setEditMode(false);
      setSelectedPdfs([]);
    }
  };
  const confirmCancel = () => {
    if (editSessionSnapshot) {
      setAboutYearData(JSON.parse(JSON.stringify(editSessionSnapshot)));
      if (yearToDelete && deletedYearIndex !== null) {
        setAbtyear(yearToDelete);
      }
    }
    setChanged(false);
    setSavedChanges(false);
    setEditMode(false);
    setSelectedPdfs([]);
    setShowCancelConfirm(false);
  };

  // Save logic
  const handleSave = () => {
    setEditSessionSnapshot(JSON.parse(JSON.stringify(aboutYearData)));
    setSavedChanges(true);
    setChanged(false);
    setEditMode(false);
    setSelectedPdfs([]);
  };

  // Discard all changes logic (undo all)
  const handleDiscardAll = () => setShowDiscardConfirm(true);
  const confirmDiscardAll = () => {
    if (editSessionSnapshot) {
      setAboutYearData(JSON.parse(JSON.stringify(editSessionSnapshot)));
      if (yearToDelete && deletedYearIndex !== null) {
        setAbtyear(yearToDelete);
      }
    }
    setChanged(false);
    setSavedChanges(false);
    setEditMode(false);
    setSelectedPdfs([]);
    setShowDiscardConfirm(false);
  };

  // Request logic
  const handleRequest = () => setShowRequestModal(true);
  const confirmRequest = () => {
    setShowRequestModal(false);
    setSavedChanges(false);
    setEditMode(false);
  };

  // Add new year (with empty content array)
  const openYearModal = () => setShowYearModal(true);
  const closeYearModal = () => {
    setShowYearModal(false);
    setNewYear("");
  };
  const confirmAddYear = () => {
    if (!newYear.trim()) return;
    setAboutYearData([
      ...aboutYearData,
      { category: newYear.trim(), content: [] },
    ]);
    setChanged(true);
    setSavedChanges(false);
    setShowYearModal(false);
    setNewYear("");
    setAbtyear(newYear.trim());
  };

  // Delete year
  const openYearDeleteConfirm = (year) => {
    setYearToDelete(year);
    setDeletedYearIndex(aboutYearData.findIndex((item) => item.category === year));
    setShowYearDeleteConfirm(true);
  };
  const confirmYearDelete = () => {
    const idx = aboutYearData.findIndex((item) => item.category === yearToDelete);
    const filtered = aboutYearData.filter(
      (item) => item.category !== yearToDelete
    );
    setAboutYearData(filtered);
    setChanged(true);
    setSavedChanges(false);
    setShowYearDeleteConfirm(false);
    if (filtered.length > 0) {
      let nextIdx = idx < filtered.length ? idx : filtered.length - 1;
      setAbtyear(filtered[nextIdx]?.category || "");
    }
  };

  // PDF logic
  const openPdfModal = (yearIdx, pdfIdx = null, name = "") => {
    if (pdfIdx === null) {
      setPdfModal({
        open: true,
        index: null,
        name,
        file: null,
        error: "",
        yearIdx,
      });
    } else {
      const item = aboutYearData[yearIdx].content[pdfIdx];
      setPdfModal({
        open: true,
        index: pdfIdx,
        name: item.name,
        file: null,
        error: "",
        yearIdx,
      });
    }
  };
  const closePdfModal = () =>
    setPdfModal({
      open: false,
      index: null,
      name: "",
      file: null,
      error: "",
      yearIdx: null,
    });
  const savePdfModal = () => {
    const { index, name, file, yearIdx } = pdfModal;
    if (!name) {
      setPdfModal((s) => ({ ...s, error: "Please enter a PDF name." }));
      return;
    }
    if (index === null && !file) {
      setPdfModal((s) => ({ ...s, error: "Please upload a PDF file." }));
      return;
    }
    setPdfModal((s) => ({ ...s, error: "" }));
    let newData = JSON.parse(JSON.stringify(aboutYearData));
    if (index === null) {
      newData[yearIdx].content.push({ name, pdf_path: "", file });
    } else {
      newData[yearIdx].content[index] = {
        ...newData[yearIdx].content[index],
        name,
        file: file || newData[yearIdx].content[index].file,
      };
    }
    setAboutYearData(newData);
    setChanged(true);
    setSavedChanges(false);
    closePdfModal();
  };

  // PDF selection and deletion
  const toggleSelectPdf = (pdfIdx) => {
    setSelectedPdfs((prev) =>
      prev.includes(pdfIdx)
        ? prev.filter((i) => i !== pdfIdx)
        : [...prev, pdfIdx]
    );
  };
  const openPdfDeleteConfirm = () => setShowPdfDeleteConfirm(true);
  const confirmPdfDelete = () => {
    const yearIdx = aboutYearData.findIndex(
      (item) => item.category === section
    );
    let newData = JSON.parse(JSON.stringify(aboutYearData));
    newData[yearIdx].content = newData[yearIdx].content.filter(
      (_, idx) => !selectedPdfs.includes(idx)
    );
    setAboutYearData(newData);
    setSelectedPdfs([]);
    setChanged(true);
    setSavedChanges(false);
    setShowPdfDeleteConfirm(false);
  };

  // Eye icon conditional logic for modal
  const getPdfPathForModal = () => {
    if (!pdfModal.open) return null;
    const { yearIdx, index, name } = pdfModal;
    if (yearIdx == null) return null;
    if (index === null) {
      const yearData = aboutYearData[yearIdx];
      if (!yearData) return null;
      const entry =
        yearData.content &&
        yearData.content.find((c) => c.name === name && c.pdf_path);
      return entry?.pdf_path || null;
    } else {
      const yearData = aboutYearData[yearIdx];
      if (!yearData) return null;
      const entry = yearData.content[index];
      return entry?.pdf_path || null;
    }
  };

  // Main render function for year content
  const renderYearContent = (selectedYear) => {
    const yearIdx = aboutYearData.findIndex(
      (item) => item.category === selectedYear
    );
    const yearData = aboutYearData[yearIdx];
    if (!yearData) {
      return (
        <p style={{ textAlign: "center" }}>
          No data available for {selectedYear}
        </p>
      );
    }

    // If no PDFs for this year, show default buttons from backend
    if (yearData.content.length === 0) {
      return (
        <div className="mt:[15px] py-[10px] min-h-[400px]">
          <div style={{ textAlign: "center" }}>
            <h1 className="yr-title mt-[30px] font-[poppins]">
              {yearData.category}
            </h1>
            <div className="btn-yr text-black flex flex-wrap justify-center gap-2">
              {(defaultButtons.length
                ? defaultButtons
                : [
                    "Certificate",
                    "Data Capture Format",
                    "Teaching Staff Details",
                  ]
              ).map((btnText, idx) => (
                <div key={btnText} className="relative flex items-center">
                  {editMode && (
                    <input
                      type="checkbox"
                      checked={selectedPdfs.includes(idx)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelectPdf(idx);
                      }}
                      className="custom-checkbox w-3 h-3 absolute top-1 right-1 z-10"
                      style={{ position: "absolute" }}
                    />
                  )}
                  <button
                    className="button-yr font-[poppins] relative overflow-visible text-md"
                    style={{
                      minWidth: editMode ? "180px" : "150px",
                      minHeight: editMode ? "52px" : "42px",
                      fontSize: editMode ? "1.08rem" : "1rem",
                      padding: editMode ? "12px 18px" : "8px 12px",
                      position: "relative",
                    }}
                    onClick={() => {
                      if (editMode) openPdfModal(yearIdx, null, btnText);
                    }}
                    disabled={!editMode}
                  >
                    {btnText}
                  </button>
                </div>
              ))}
            </div>
          </div>
          {/* Action buttons */}
          <div className="w-full">
              {editMode && selectedPdfs.length > 0 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={openPdfDeleteConfirm}
                className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded flex items-center gap-2 shadow-lg"
              >
                Delete Selected
              </button>
            </div>
          )}
            {editMode && (
              <div className="flex justify-end gap-4 p-2 mr-9 mt-20">
                <button
                  onClick={handleCancel}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded flex items-center gap-2 shadow-lg"
                >
                  Cancel
                </button>
                {changed && (
                  <button
                    onClick={handleSave}
                    className="bg-secd hover:bg-yellow-500 text-black px-4 py-2 rounded flex items-center gap-2 shadow-lg"
                  >
                    Save
                  </button>
                )}
              </div>
            )}
            {!editMode && savedChanges && (
              <div className="flex justify-end gap-4 pt-4 pb-8 w-full">
                <button
                  onClick={handleRequest}
                  className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 shadow-lg"
                >
                  Request
                </button>
                <button
                  onClick={handleDiscardAll}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded flex items-center gap-2 shadow-lg"
                >
                  Discard All Changes
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Existing years: backend-driven content
    return (
      <div className="mt:[15px] py-[10px] min-h-[400px]">
        <div style={{ textAlign: "center" }}>
          <h1 className="yr-title mt-[30px] font-[poppins]">
            {yearData.category}
          </h1>
          <div className="btn-yr text-black flex flex-wrap justify-center gap-2">
            {yearData.content.map((entry, index) => (
              <div key={index} className="relative flex items-center">
                {editMode && (
                  <input
                    type="checkbox"
                    checked={selectedPdfs.includes(index)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelectPdf(index);
                    }}
                    className="custom-checkbox w-3 h-3 absolute top-1 right-1 z-10"
                    style={{ position: "absolute" }}
                  />
                )}
                <button
                  className="button-yr font-[poppins] relative overflow-visible text-md"
                  style={{
                    minWidth: editMode ? "180px" : "150px",
                    minHeight: editMode ? "52px" : "42px",
                    fontSize: editMode ? "1.08rem" : "1rem",
                    padding: editMode ? "12px 18px" : "8px 12px",
                    position: "relative",
                  }}
                  onClick={() => {
                    if (editMode) openPdfModal(yearIdx, index);
                    else window.open(UrlParser(entry.pdf_path), "_blank");
                  }}
                >
                  {entry.name}
                </button>
              </div>
            ))}
          </div>
          {editMode && selectedPdfs.length > 0 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={openPdfDeleteConfirm}
                className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded flex items-center gap-2 shadow-lg"
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>
        <div className="w-full">
          {editMode && (
            <div className="flex justify-end gap-4 p-2 mr-9 mt-20">
              <button
                onClick={handleCancel}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded flex items-center gap-2 shadow-lg"
              >
                Cancel
              </button>
              {changed && (
                <button
                  onClick={handleSave}
                  className="bg-secd hover:bg-yellow-500 text-black px-4 py-2 rounded flex items-center gap-2 shadow-lg"
                >
                  Save
                </button>
              )}
            </div>
          )}
          {!editMode && savedChanges && (
            <div className="flex justify-end gap-4 pt-4 pb-8 w-full">
              <button
                onClick={handleRequest}
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 shadow-lg"
              >
                Request
              </button>
              <button
                onClick={handleDiscardAll}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded flex items-center gap-2 shadow-lg"
              >
                Discard All Changes
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const navData = aboutYearData.reduce((acc, item) => {
    if (item?.category) {
      acc[item.category] = renderYearContent(item.category);
    }
    return acc;
  }, {});

  const sideNavExtra = (
    <div className="flex gap-2 items-center absolute top-4 right-10">
      {!editMode && (
        <button
          onClick={handleEditClick}
          className="p-2 bg-secd hover:bg-yellow-500 font-semibold text-black rounded flex items-center gap-2"
        >
          Edit
        </button>
      )}
    </div>
  );

  return (
    <>
      <Banner
        theme={theme}
        toggle={toggle}
        backgroundImage="./Banners/aboutvec.webp"
        headerText="AISHE"
        subHeaderText="A center for academic excellence and innovation, nurturing minds to create a brighter future through education and empowerment."
      />
      <div className="relative">
        <AisheSideNav
          navData={navData}
          sts={section}
          setSts={setAbtyear}
          backButton={true}
          sidNavEdit={editMode}
          openModel={openYearModal}
          onDeleteYear={openYearDeleteConfirm}
        />
        {sideNavExtra}
      </div>

      {/* Year Modal */}
      {showYearModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96 flex flex-col items-center">
            <h2 className="text-lg font-bold mb-4">Add New Year</h2>
            <input
              type="text"
              placeholder="Year (e.g. 2022-2023)"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              className="w-full border p-2 mb-4 rounded"
            />
            <div className="flex justify-end gap-3 w-full">
              <button
                onClick={closeYearModal}
                className="px-3 py-1 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddYear}
                className="px-3 py-1 bg-secd text-black rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Year Delete Confirm */}
      {showYearDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96 text-center">
            <h2 className="text-lg text-brwn font-bold mb-4">Delete Year</h2>
            <p>Are you sure you want to delete the year {yearToDelete}?</p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setShowYearDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmYearDelete}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Modal */}
      {pdfModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96 flex flex-col items-center">
            <h2 className="text-lg font-bold mb-4">
              {pdfModal.index === null ? "Upload PDF" : "Edit PDF"}
            </h2>
            <input
              type="text"
              placeholder="Name"
              value={pdfModal.name}
              onChange={(e) =>
                setPdfModal((s) => ({ ...s, name: e.target.value }))
              }
              className="w-full border p-2 mb-4 rounded"
              readOnly={pdfModal.name !== ""}
            />
            <div className="flex items-center mb-4 gap-2">
              <label className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded cursor-pointer mb-0 flex-grow flex items-center">
                {pdfModal.index === null ? "Upload PDF" : "Replace PDF"}
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) =>
                    setPdfModal((s) => ({
                      ...s,
                      file: e.target.files[0],
                    }))
                  }
                />
              </label>
              {getPdfPathForModal() && (
                <button
                  className="ml-2 px-2 py-2 rounded text-blue-400  flex items-center"
                  onClick={() => window.open(UrlParser(getPdfPathForModal()), "_blank")}
                  type="button"
                >
                  <Eye size={19} />
                </button>
              )}
            </div>
            {pdfModal.error && (
              <p className="text-red-600 text-sm mb-2">{pdfModal.error}</p>
            )}
            <div className="flex justify-end gap-3 w-full">
              <button
                onClick={closePdfModal}
                className="px-3 py-1 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={savePdfModal}
                className="px-3 py-1 bg-secd text-black rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Delete Confirm */}
      {showPdfDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96 text-center">
            <h2 className="text-lg text-brwn font-bold mb-4">Delete PDFs</h2>
            <p>
              Are you sure you want to delete {selectedPdfs.length} selected
              PDF(s)?
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setShowPdfDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmPdfDelete}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel confirm */}
      {showCancelConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96 text-center">
            <h2 className="text-lg text-orange-600 font-bold mb-4">
              Confirm Cancel
            </h2>
            <p className="mb-6">
              Are you sure you want to cancel? All unsaved changes will be lost.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Continue Editing
              </button>
              <button
                onClick={confirmCancel}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discard all changes confirm */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96 text-center">
            <h2 className="text-lg text-brwn font-bold mb-4">
              Confirm Discard All Changes
            </h2>
            <p className="mb-6">
              Are you sure you want to discard all saved changes? This will
              revert everything to the original state.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDiscardConfirm(false)}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded"
              >
                Keep Changes
              </button>
              <button
                onClick={confirmDiscardAll}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Discard All Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[530px]">
            <h2 className="text-xl font-bold mb-4 dark:text-white text-text">
              Final Request for the Changes
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the
              superior admin. Once approved, will go on live.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Edit Again
              </button>
              <button
                onClick={confirmRequest}
                className="px-4 py-2 rounded bg-secd dark:bg-drks hover:bg-yellow-500 text-text hover:text-black"
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

export default AdminAishe;