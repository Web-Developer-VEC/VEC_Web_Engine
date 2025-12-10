import { useEffect, useState } from "react";
import "./Other-Facilities.css";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import axios from "axios";
import { useNavigate } from "react-router";
import { Pencil, Send, X, Plus, Trash2 } from "lucide-react";

export default function AdminOtherFacilities({ theme, toggle }) {
  const [activeTab, setActiveTab] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [otherFacilities, setOtherFacilities] = useState(null);

  // editing states
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [changeList, setChangeList] = useState([]);

  // image table related
  const [currentRows, setCurrentRows] = useState([]); // rows for the currently edited facility
  const [selectedRows, setSelectedRows] = useState([]); // selected row ids
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const [showDeleteRowsModal, setShowDeleteRowsModal] = useState(false);

  // category (button) management
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showDeleteCategoriesModal, setShowDeleteCategoriesModal] = useState(false);

  const [prevFacilitiesSnapshot, setPrevFacilitiesSnapshot] = useState(null); // for discard
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const getSafe = (value, index) => {
    return Array.isArray(value) ? value[index] || value[0] : value;
  };

  const currentFacility = otherFacilities?.find(
    (facility) => facility?.category === activeTab
  );

  const nextImage = () => {
    if (!currentFacility) return;
    const images = Array.isArray(currentFacility.image_path)
      ? currentFacility.image_path
      : [currentFacility.image_path];
    setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    if (!currentFacility) return;
    const images = Array.isArray(currentFacility.image_path)
      ? currentFacility.image_path
      : [currentFacility.image_path];
    setImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("/api/main-backend/other_facilities", {
          type: "other_facilities",
        });
        const data = response.data.data;
        setOtherFacilities(data);
        setActiveTab(data[0]?.category || null);
      } catch (error) {
        console.error("Error fetching Other facilities", error);
        if (error?.response?.data?.status === 429) {
          navigate('/ratelimit', { state: { msg: error.response.data.message }});
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

  // whenever activeTab changes while editing, re-init rows for that facility
  useEffect(() => {
    if (isEditing && currentFacility) {
      initRowsFromFacility(currentFacility);
    }
    // reset image index when tab changes
    setImageIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
  }

  if (!otherFacilities || !currentFacility) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={""} />
      </div>
    );
  }

  const images = Array.isArray(currentFacility.image_path)
    ? currentFacility.image_path
    : [currentFacility.image_path];

  // ========== Helper: initialize rows from facility ==========
  function uid() {
    // simple unique id generator for rows/checkboxes
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function initRowsFromFacility(facility) {
    const imgs = Array.isArray(facility.image_path)
      ? facility.image_path
      : [facility.image_path];

    // try to pair descriptions/names if they are arrays
    const descs = Array.isArray(facility.description)
      ? facility.description
      : [facility.description || ""];
    const names = Array.isArray(facility.name)
      ? facility.name
      : [facility.name || ""];

    const rows = imgs.map((img, idx) => {
      return {
        id: uid(),
        text: descs[idx] || names[idx] || "",
        image: img ? UrlParser(img) : null,
        origImagePath: img || null // keep for saving back
      };
    });

    if (rows.length === 0) {
      rows.push({
        id: uid(),
        text: names[0] || "",
        image: null,
        origImagePath: null
      });
    }

    setCurrentRows(rows);
    setSelectedRows([]);
    setCurrentPage(1);
  }

  const handleStartEditing = () => {
    // snapshot previous state (deep-ish copy)
    setPrevFacilitiesSnapshot(JSON.parse(JSON.stringify(otherFacilities)));
    setIsEditing(true);
    setIsSaved(false);
    setChangeList([]);
    if (currentFacility) initRowsFromFacility(currentFacility);
  };

  const handleCancel = () => {
    // cancel editing mode without saving -> restore snapshot
    if (prevFacilitiesSnapshot) {
      setOtherFacilities(prevFacilitiesSnapshot);
      setPrevFacilitiesSnapshot(null);
    }
    setIsEditing(false);
    setIsSaved(false);
    setChangeList([]);
    setSelectedRows([]);
    setSelectedCategories([]);
  };

  // ======= Category (button) management =======
  const handleCategoryFieldChange = (categoryKey, field, value) => {
    // categoryKey here is original category string used to find the facility
    setOtherFacilities((prev) =>
      prev.map((fac) => {
        if (fac.category !== categoryKey) return fac;
        // update the requested field (category or name)
        return { ...fac, [field]: value };
      })
    );

    // if category (button label) changed and it is the activeTab, keep activeTab in sync
    if (field === "category" && activeTab === categoryKey) {
      setActiveTab(value);
    }

    // record change
    setChangeList((prev) => [...prev, { type: "edit", section: "Other-Facilities", changes: `${field} changed to "${value}"` }]);
  };

const handleAddNewCategory = () => {
  const newCategoryKey = `New-${uid()}`;
  const newFacility = {
    category: `New Button`,
    name: `New Heading`,
    description: [""],
    image_path: [],
  };

  setOtherFacilities((prev) => [...(prev || []), newFacility]); // ⬅️ at end
  setActiveTab(newFacility.category);
  setIsEditing(true);
  setChangeList((prev) => [
    ...prev,
    { type: "add", section: "Other-Facilities", changes: `Added "${newFacility.category}"` }
  ]);

  setTimeout(() => initRowsFromFacility(newFacility), 0);
};


  const handleToggleSelectCategory = (categoryKey) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryKey) ? prev.filter((c) => c !== categoryKey) : [...prev, categoryKey]
    );
  };

  const handleDeleteSelectedCategories = () => {
    if (selectedCategories.length === 0) return;
    setOtherFacilities((prev) => prev.filter((fac) => !selectedCategories.includes(fac.category)));
    // if activeTab was deleted, pick first remaining
    setTimeout(() => {
      setSelectedCategories([]);
      setActiveTab((prevActive) => {
        const remaining = (otherFacilities || []).filter((f) => !selectedCategories.includes(f));
        return remaining[0]?.category || null;
      });
    }, 0);

    setChangeList((prev) => [...prev, { type: "delete", section: "Other Facilities", changes: `${selectedCategories.length} button(s) deleted` }]);
    setShowDeleteCategoriesModal(false);
  };

  // ======= Image table handlers =======
  const handleInputChange = (rowId, field, value) => {
    setCurrentRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: value } : r))
    );
    // record change
    setChangeList((prev) => {
      const entry = { type: "edit", section: "Image/Description", changes: `${field} updated` };
      return [...prev, entry];
    });
  };

  const handleImageUpload = (rowId, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setCurrentRows((prev) =>
        prev.map((r) => (r.id === rowId ? { ...r, image: dataUrl, origImagePath: null } : r))
      );
      setChangeList((prev) => [...prev, { type: "edit", section: "Image", changes: "image replaced/added" }]);
    };
    reader.readAsDataURL(file);
  };
const handleAddRow = () => {
  const newRow = {
    id: uid(),
    text: "",
    image: null,
    origImagePath: null,
  };
  setCurrentRows((prev) => [...prev, newRow]); // ⬅️ at end
  setChangeList((prev) => [
    ...prev,
    { type: "add", section: "Image Table", changes: "row added" }
  ]);
};


  const handleToggleSelectRow = (rowId) => {
    setSelectedRows((prev) => (prev.includes(rowId) ? prev.filter((r) => r !== rowId) : [...prev, rowId]));
  };

  const handleDeleteSelectedRows = () => {
    setCurrentRows((prev) => prev.filter((r) => !selectedRows.includes(r.id)));
    setChangeList((prev) => [...prev, { type: "delete", section: "Image Table", changes: `${selectedRows.length} row(s) deleted` }]);
    setSelectedRows([]);
    setShowDeleteRowsModal(false);
  };

  const handleSave = () => {
    // update otherFacilities by replacing currentFacility's image_path & description/name based on currentRows
    setOtherFacilities((prev) =>
      prev.map((fac) => {
        if (fac.category !== activeTab) return fac;
        const updatedImagePaths = currentRows.map((r) => {
          // keep original path if user didn't change image (origImagePath), otherwise use dataURL
          return r.origImagePath ? r.origImagePath : r.image;
        });

        const updatedDescriptions = currentRows.map((r) => r.text || "");

        return {
          ...fac,
          image_path: updatedImagePaths,
          description: updatedDescriptions,
          name: fac.name // unchanged unless user edited it in buttons panel
        };
      })
    );

    setIsEditing(false);
    setIsSaved(true); // show Request & Discard controls
    // keep changeList for request popup
  };

  const handleDiscardChanges = () => {
    // restore previously saved (before edit) snapshot if exists
    if (prevFacilitiesSnapshot) {
      setOtherFacilities(prevFacilitiesSnapshot);
      // reset activeTab if its category changed in the snapshot
      setActiveTab(prevFacilitiesSnapshot[0]?.category || null);
      setPrevFacilitiesSnapshot(null);
    }
    setIsSaved(false);
    setChangeList([]);
    setSelectedRows([]);
    setSelectedCategories([]);
  };

  const handleRequest = () => {
    setShowPopup(true);
  };

  const handleFinalRequest = () => {
    // placeholder for API call to send request to admin/superior
    // For now simulate success:
    console.log("Submitting request:", changeList);
    setShowPopup(false);
    setIsSaved(false);
    setChangeList([]);
    setPrevFacilitiesSnapshot(null);
  };

  // Pagination helpers
  const totalPages = Math.max(1, Math.ceil(currentRows.length / rowsPerPage));
  const paginatedRows = currentRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/Others.webp"
        headerText="OTHER FACILITES"
        subHeaderText="Fostering excellence in social service and community well-being."
      />

      <div className="flex justify-end mt-4">
        {!isEditing && (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg mt-4 mr-10"
            onClick={handleStartEditing}
          >
            <Pencil size={16} /> Edit
          </button>
        )}
      </div>

      <div className="facilities-container bg-prim dark:bg-drkp">
        {/* If editing: show Manage Buttons panel */}
        {isEditing && (
          <div className="overflow-x-auto border rounded-lg shadow-md p-4 bg-white dark:bg-gray-800 mt-4 mx-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Manage Buttons</h3>
             
            </div>

            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="p-2">Button Label (category)</th>
                  <th className="p-2">Heading (name)</th>
                  <th className="p-2">Select</th>
                </tr>
              </thead>
              <tbody>
                {otherFacilities.map((fac) => (
                  <tr key={fac.category} className="border-b">
                   
                    <td className="p-2">
                      <input
                        type="text"
                        value={fac.category}
                        onChange={(e) => {
                          // Keep originalCategory to find it in array, because category string may change - so we search by unique fallback
                          const original = fac.category;
                          // update the category label in state
                          setOtherFacilities((prev) =>
                            prev.map((f) =>
                              f === fac ? { ...f, category: e.target.value } : f
                            )
                          );
                          // If this row is the active tab, keep activeTab updated
                          if (activeTab === original) setActiveTab(e.target.value);
                          setChangeList((prev) => [...prev, { type: "edit", section: "Button", changes: `category changed to "${e.target.value}"` }]);
                        }}
                        className="border p-1 w-full rounded"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={fac.name || ""}
                        onChange={(e) => {
                          setOtherFacilities((prev) =>
                            prev.map((f) => (f === fac ? { ...f, name: e.target.value } : f))
                          );
                          setChangeList((prev) => [...prev, { type: "edit", section: "Button", changes: `name changed to "${e.target.value}"` }]);
                        }}
                        className="border p-1 w-full rounded"
                      />
                    </td>
                     <td className="p-2 text-center">
                      <input
                        id={`btnchk-${fac.category}`}
                        type="checkbox"
                        checked={selectedCategories.includes(fac.category)}
                        onChange={() => handleToggleSelectCategory(fac.category)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
               <div className="flex gap-2 mt-2 flex items-center">
                <button
                  onClick={handleAddNewCategory}
                  className="flex items-center gap-2 px-3 py-1 bg-yellow-500 text-white rounded"
                >
                  <Plus size={14} /> Add New Button
                </button>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => setShowDeleteCategoriesModal(true)}
                    className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded"
                  >
                    <Trash2 size={14} /> Delete Selected ({selectedCategories.length})
                  </button>
                )}
              </div>
            </table>
          </div>
        )}

        {/* Tabs */}
        <div className="tabs-container mt-4">
          {otherFacilities?.map((facility) => (
            <button
              key={facility?.category}
              className={`tab-button ${
                activeTab === facility?.category ? "active-tab" : ""
              } bg-secd dark:bg-drks text-text`}
              onClick={() => {
                setActiveTab(facility?.category);
                setImageIndex(0);
                // if editing, also initialize rows for this facility
                if (isEditing) initRowsFromFacility(facility);
              }}
            >
              {facility?.category}
            </button>
          ))}
        </div>

        {/* Content Section */}
        <div className="content-container">
          <h2 className="current-facility text-brwn dark:text-drkt">
            {getSafe(currentFacility.name, imageIndex)}
          </h2>
          <p>{getSafe(currentFacility.description, imageIndex)}</p>

          {/* show a delete button in the middle area when editing AND rows selected */}
          {isEditing && selectedRows.length > 0 && (
            <div className="flex justify-center my-2">
              <button
                onClick={() => setShowDeleteRowsModal(true)}
                className="flex items-center gap-2 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                <Trash2 size={14} /> Delete Selected ({selectedRows.length})
              </button>
            </div>
          )}

          {/* Image Carousel */}
          <div className="carousel">
            {images.length > 1 && (
              <button className="prev" onClick={prevImage}>
                ❮
              </button>
            )}
            <img
              src={UrlParser(images[imageIndex])}
              alt={activeTab}
              className="carousel-img"
            />
            {images.length > 1 && (
              <button className="next" onClick={nextImage}>
                ❯
              </button>
            )}
          </div>
        </div>

        {/* Edit Save/Cancel row */}
       

        {/* After saving (local) show Request + Discard */}
        {!isEditing && isSaved && (
          <div className="flex justify-end gap-3 mt-6 mb-4 mr-12">
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded"
              onClick={handleDiscardChanges}
            >
              Discard Changes
            </button>
            <button
              className="px-4 py-2 bg-[#FDCC03] text-white rounded flex items-center gap-2"
              onClick={handleRequest}
            >
              <Send size={16} /> Request
            </button>
          </div>
        )}

        {/* Popup modal (Final Request) */}
        {showPopup && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
            <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[750px] max-h-[80vh] overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4">Final Request</h2>
              <p className="text-red-600 mb-4">
                <span className="font-medium">Note:</span> Your changes will stay pending until approved by the superior admin. Once approved, they will be applied automatically to the live site.
              </p>

              <table className="w-full text-sm border">
                <thead>
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
                          <span style={{ textTransform: "capitalize" }}>{req.type}</span>
                        </td>
                        <td className="border p-2">Other-Facilities</td>
                        <td className="p-2 border">{req.changes}</td>
                        <td className="p-2 border">
                          <button
                            onClick={() => {
                              // simple undo: remove this change entry
                              setChangeList((prev) => prev.filter((_, i) => i !== idx));
                            }}
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
                <button onClick={() => setShowPopup(false)} className="px-4 py-2 bg-gray-300 rounded-md">
                  Cancel
                </button>
                <button
                  onClick={handleFinalRequest}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
                >
                  <Send size={16} /> Final Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========== IMAGE TABLE EDITOR ========== */}
        {isEditing && (
          <div className="overflow-x-auto border rounded-lg shadow-md p-4 bg-white dark:bg-gray-800 mt-6 mx-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="p-2">Description</th>
                  <th className="p-2">Image</th>
                  <th className="p-2">Select</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) =>
                          handleInputChange(item.id, "text", e.target.value)
                        }
                        className="border p-1 w-full rounded"
                      />
                    </td>
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
                          onChange={(e) =>
                            handleImageUpload(item.id, e.target.files[0])
                          }
                        />
                      </label>
                    </td>
                    <td className="p-2 text-center">
                      <input
                        id={`chk-${item.id}`}
                        type="checkbox"
                        checked={selectedRows.includes(item.id)}
                        onChange={() => handleToggleSelectRow(item.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>

            {/* Table Bottom Controls */}
            <div className="flex justify-center items-center mt-4">
              <div className="flex gap-2">
                <button
                  onClick={handleAddRow}
                  className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded"
                >
                  <Plus size={16} /> Add New
                </button>
                {selectedRows.length > 0 && (
                  <button
                    onClick={() => setShowDeleteRowsModal(true)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete confirmation modal for rows */}
        {showDeleteRowsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-drkp p-6 rounded-lg w-[480px]">
              <h3 className="text-lg font-semibold mb-3">Confirm Delete</h3>
              <p className="mb-4">Are you sure you want to delete the selected row(s)? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowDeleteRowsModal(false)} className="px-3 py-1 bg-gray-200 rounded">
                  Cancel
                </button>
                <button onClick={handleDeleteSelectedRows} className="px-3 py-1 bg-red-600 text-white rounded">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirmation modal for categories */}
        {showDeleteCategoriesModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-drkp p-6 rounded-lg w-[480px]">
              <h3 className="text-lg font-semibold mb-3">Confirm Delete Buttons</h3>
              <p className="mb-4">Are you sure you want to delete the selected button(s)? This will remove their data (images/descriptions) as well.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowDeleteCategoriesModal(false)} className="px-3 py-1 bg-gray-200 rounded">
                  Cancel
                </button>
                <button onClick={handleDeleteSelectedCategories} className="px-3 py-1 bg-red-600 text-white rounded">
                  Delete
                </button>
              </div>
            </div>
            
          </div>
        )}
      </div>
      <div className="mb-4">
       {isEditing && (
          <div className="flex gap-2 mt-4 justify-end mr-12">
            <button
              onClick={handleCancel}
              className="px-4 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-[#FDCC03] text-black rounded-lg shadow-md hover:bg-yellow-500 transition "
            >
              Save
            </button>
          </div>
        )}
      </div>
    </>
  );
}
