import React, { useRef, useState, useEffect } from "react";
import "slick-carousel/slick/slick.scss";
import "slick-carousel/slick/slick-theme.scss";
import styles from "./admin_Achievements1.module.css";
import ZonalResults from "./admin_ZonalResults";
import WinnerSlider from "./admin_winners_sld";
import Achievements from "./admin_achivements";
import Others from "./admin_others";
import Slider from "react-slick";
import LoadComp from "../../LoadComp";
import { Pencil, Plus, Trash2, Send, Save } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Achievements1 = ({ data }) => {
  const sectionRef = useRef(null);
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) =>
    path?.startsWith("http") ? path : `${BASE_URL}${path}`;

  const [showZone, setShowZone] = useState("");

  // Coordinator & carousel data
  const coordinator = data?.find((item) => item.category === "coordinator")?.content;
  const zonalTableData = data?.find((item) => item.category === "zonal_table")?.content || [];
  const zonalTableYear = data?.find((item) => item.category === "zonal_table")?.year || "";
  const zoneWinnerData = data?.find((item) => item.category === "zone_winner")?.content || [];
  const interZonalData = data?.find((item) => item.category === "interzonal_achievements")?.content || [];
  const othersData = data?.find((item) => item.category === "others")?.content || [];

  // Edit / request states
  const [editMode, setEditMode] = useState(false);
  const [tempData, setTempData] = useState([]);
  const [savedData, setSavedData] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showRequestButtons, setShowRequestButtons] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [zone, setZone] = useState(coordinator?.zone || "");
  const [year, setYear] = useState(coordinator?.year || "");
  const [savedZone, setSavedZone] = useState(coordinator?.zone || "");
  const [savedYear, setSavedYear] = useState(coordinator?.year || "");

  // Track changes for Request Modal
  const [changes, setChanges] = useState([]);
  const [originalData, setOriginalData] = useState({ zone: coordinator?.zone, year: coordinator?.year });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Initialize coordinator carousel
  useEffect(() => {
    if (!coordinator?.image_path) return;
    const formatted = coordinator.image_path.map((img, idx) => ({
      id: idx + 1,
      image: UrlParser(img),
      text: `Coordinator Image ${idx + 1}`,
    }));
    setTempData(formatted);
    setSavedData(formatted);
    setZone(coordinator?.zone || "");
    setYear(coordinator?.year || "");
    setSavedZone(coordinator?.zone || "");
    setSavedYear(coordinator?.year || "");
    setOriginalData({ zone: coordinator?.zone, year: coordinator?.year });
  }, [coordinator]);

  // Input & image handlers
  const handleInputChange = (id, field, value) => {
    setTempData(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );

    // Track as updated
    setChanges(prev => {
      const existing = prev.find(
        ch => ch.type === "coordinator" && ch.id === id && ch.field === field
      );
      if (existing) return prev;
      return [...prev, { type: "coordinator", id, action: "Edited", field, value }];
    });
  };

  const handleImageUpload = (id, file) => {
    const imageUrl = URL.createObjectURL(file);
    setTempData(prev =>
      prev.map(item => (item.id === id ? { ...item, image: imageUrl, newFile: file } : item))
    );

    // Track as updated
    setChanges(prev => {
      const existing = prev.find(
        ch => ch.type === "coordinator" && ch.id === id && ch.field === "image"
      );
      if (existing) return prev;
      return [...prev, { type: "coordinator", id, action: "update", field: "image" }];
    });
  };

  const handleAddRow = () => {
    const newId = tempData.length ? Math.max(...tempData.map(a => a.id)) + 1 : 1;
    const newRow = { id: newId, text: "", image: "", newFile: null };
    setTempData(prev => [...prev, newRow]);

    // Track as added
    setChanges(prev => [...prev, { type: "coordinator", id: newId, action: "add" ,field:"image"}]);
  };

  const handleDeleteSelected = () => {
    // Track deleted items
    const deletedChanges = tempData
      .filter(item => selected.includes(item.id))
      .map(item => ({ type: "coordinator", id: item.id, action: "delete" }));

    setChanges(prev => [...prev, ...deletedChanges]);

    setTempData(prev => prev.filter(item => !selected.includes(item.id)));
    setSelected([]);
    setShowDeleteModal(false);
    toast.info("Selected items deleted");
  };

  // Save / Discard
  const handleDiscardChanges = () => {
    setTempData(savedData);
    setZone(savedZone);
    setYear(savedYear);
    setEditMode(false);
    setSelected([]);
    setShowRequestButtons(false);
    setChanges([]);
    toast.info("Changes discarded");
  };

  const handleSave = () => {
    if (!zone.trim() || !year.trim()) {
      toast.error("Zone and Year are mandatory!");
      return;
    }
    if (isNaN(zone)) {
      toast.error("Zone must be a number!");
      return;
    }
    const yearPattern = /^\d{4}-\d{2}$/;
    if (!yearPattern.test(year)) {
      toast.error("Year must be in format YYYY-YYYY (e.g. 2024-2025)!");
      return;
    }
    const invalid = tempData.some(item => !item.text.trim() || !item.image);
    if (invalid) {
      toast.error("All fields (Description and Image) are mandatory!");
      return;
    }

    setSavedData(tempData);
    setSavedZone(zone);
    setSavedYear(year);
    setEditMode(false);
    setShowRequestButtons(true);

    // Track zone/year changes
    const newChanges = [];
    if (zone !== savedZone) newChanges.push({ type: "zoneYear", field: "zone", value: zone, action: "update" });
    if (year !== savedYear) newChanges.push({ type: "zoneYear", field: "year", value: year, action: "update" });

    setChanges([...newChanges, ...changes]);
    toast.success("Changes saved successfully!");
  };

  const handleRequestConfirm = () => {
    setShowRequestModal(false);
    setShowRequestButtons(false);
    setChanges([]);
    toast.success("Request submitted successfully!");
  };

  const handleZoneClick = zoneType => {
    setShowZone(zoneType);
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = tempData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(tempData.length / rowsPerPage);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    arrows: true,
  };

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />

      {/* Edit Button */}
      <div className="admin-controls-ug flex justify-end mb-2 mr-8">
        {!editMode && (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg mr-20"
            onClick={() => {setEditMode(true);
              setShowRequestButtons(true); 
            }}
          >
            <Pencil size={16} /> Edit
          </button>
        )}
      </div>

      {data ? (
        <>
          {/* Coordinator Section */}
          {!editMode && (
            <div className={styles.achievementsContainer}>
              <h2 className={styles.sportscoordinator}>
                Anna University Zone {savedZone}
              </h2>
              <p className={styles.coordinatordes}>Co-ordinating Centre {savedYear}</p>
              <Slider {...sliderSettings}>
                {savedData.map((item, index) => (
                  <div key={index} className={styles.slide}>
                    <img src={item.image} alt={`Coordinator ${index + 1}`} className="m-auto"/>
                  </div>
                ))}
              </Slider>
            </div>
          )}

          {/* Edit Mode */}
          {editMode && (
            <div className="overflow-x-auto border rounded-lg shadow-md p-4 bg-white dark:bg-gray-800">
              <div className="flex flex-col gap-3 mb-6">
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Anna University Zone
                  </label>
                  <input
                    type="number"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Co-ordinating Centre
                  </label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                </div>
              </div>

              {/* Coordinator Images Table */}
              <table className="w-[700px] justify-items-center m-auto border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="p-2">Image</th>
                    <th className="p-2">Select</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((item) => (
                    <tr key={item.id} className="border-b">

                      <td className="p-2 flex items-center gap-2">
                        {item.image && (
                          <img
                            src={item.image}
                            alt="preview"
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                        <label className="bg-yellow-500 text-white px-3 py-1 rounded cursor-pointer">
                          <span>{item.image ? "Replace" : "Upload"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(item.id, e.target.files[0])}
                          />
                        </label>
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={selected.includes(item.id)}
                          onChange={() =>
                            setSelected(prev =>
                              prev.includes(item.id)
                                ? prev.filter(s => s !== item.id)
                                : [...prev, item.id]
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>

              <div className="flex gap-2 mt-4 justify-center">
                <button
                  onClick={handleAddRow}
                  className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded"
                >
                  <Plus size={16} /> Add New
                </button>
                {selected.length > 0 && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Save/Cancel Buttons */}
          {editMode && (
            <div className="flex justify-end gap-2 mt-4 mr-12">
              <button
                onClick={() => setShowDiscardModal(true)}
                className="px-4 py-1 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg"
              >
                Save
              </button>
            </div>
          )}

          {/* Request Buttons */}
          {showRequestButtons && !editMode && (
            <div className="flex justify-end gap-3 mt-6 mb-4 mr-12">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
                onClick={() => {handleDiscardChanges(true)}}
              >
                Discard Changes
              </button>
              <button
                className="px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded flex items-center gap-2"
                onClick={() => setShowRequestModal(true)}
              >
                <Send size={16} /> Request 
              </button>
            </div>
          )}

          {/* Zone Buttons */}
          <div className="flex flex-wrap gap-6 justify-center items-center mb-6">
            <button
              className={`font-bold rounded-md px-4 py-2 ${showZone === "zone" ? "bg-brwn text-white" : "bg-secd text-black"}`}
              onClick={() => handleZoneClick("zone")}
            >
              Zone
            </button>
            <button
              className={`font-bold rounded-md px-4 py-2 ${showZone === "interzone" ? "bg-brwn text-white" : "bg-secd text-black"}`}
              onClick={() => handleZoneClick("interzone")}
            >
              Inter Zone
            </button>
            <button
              className={`font-bold rounded-md px-4 py-2 ${showZone === "others" ? "bg-brwn text-white" : "bg-secd text-black"}`}
              onClick={() => handleZoneClick("others")}
            >
              Others
            </button>
          </div>

          {/* Zone Section */}
          <div ref={sectionRef}>
            {showZone === "zone" ? (
              <div className="sport-zone-container mb-10">
                <ZonalResults data={zonalTableData} year={zonalTableYear} />
                <WinnerSlider data={zoneWinnerData} />
              </div>
            ) : showZone === "interzone" ? (
              <div className="sport-zone-container mb-10">
                <Achievements data={interZonalData} />
              </div>
            ) : showZone === "others" ? (
              <div className="sport-zone-container mb-10">
                <Others data={othersData} />
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp />
        </div>
      )}

      {/* Modals */}
      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[350px]">
            <h2 className="font-semibold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete the selected items?</p>
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
      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[750px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 dark:text-white text-black">
              Request Changes
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin.
            </p>

            <table className="w-full text-sm text-black dark:text-white border">
              <thead className="bg-gray-100 dark:bg-gray-700 text-center">
                <tr>
                  <th className="py-2 border">Action</th>
                  <th className="py-2 border">Section</th>
                  <th className="py-2 border">Changes</th>
                  <th className="py-2 border">undo</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((change, index) => (
                  <tr key={index} className="border text-center">
                    <td className="py-2  border text-blue-600 font-semibold">
                      {change.action === "add" && "Added"}
                      {change.action === "delete" && "Deleted"}
                      {change.action === "update" && "Updated"}
                    </td>
                    <td className="py-2 border">
                      ANNA UNIVERSITY ZONE
                    </td>
                    <td className="py-2 flex items-center justify-center border  gap-2">
                      {change.field && (
                        <span className="px-2 py-1 bg-yellow-100 text-black rounded-md">
                          {change.field.charAt(0).toUpperCase()  + change.field.slice(1)}
                        </span>
                      )}
                        </td>
                      <td className="py-2 border">
                      <button
                        onClick={() => {
                          setChanges(prev => prev.filter((_, i) => i !== index));
                          if (change.type === "zoneYear") {
                            if (change.field === "zone") setZone(savedZone);
                            if (change.field === "year") setYear(savedYear);
                          }
                          if (change.action === "add") {
                            setTempData(prev => prev.filter(item => item.id !== change.id));
                          }
                        }}
                        className="text-red-500 hover:text-red-700 font-bold"
                      >
                        ✕
                      </button>
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestConfirm}
                className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
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

export default Achievements1;
