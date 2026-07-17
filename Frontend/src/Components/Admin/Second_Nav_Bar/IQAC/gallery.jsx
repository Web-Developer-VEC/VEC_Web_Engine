import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import LoadComp from "../../LoadComp";
import { useAdminRequest } from "../../../hooks/useAdminRequest";
import { ToastContainer, toast } from "react-toastify";
const BASE_URL = process.env.REACT_APP_BASE_URL;

const UrlParser = (path) => {
  if (typeof path !== "string") return "";
  if (!path) return "";
  // keep absolute urls and blob preview urls
  if (path.startsWith("http")) return path;
  if (path.startsWith("blob:")) return path;
  return `${BASE_URL}${path}`;
};

export default function IqaGal({ iqacData, onRefresh }) {
  const { sendRequest, loading } = useAdminRequest();

  const deepClone = (data) =>
    (Array.isArray(data) ? data : []).map((item) => ({
      ...item,
      image_path: Array.isArray(item.image_path)
        ? [...item.image_path]
        : [],
      _files: item._files ? [...item._files] : [],
      _newFiles: item._newFiles ? [...item._newFiles] : [],
    }));

  // Local editing state
  const [galleryData, setGalleryData] = useState([]);
  // last saved locally (after hitting Save)
  const [savedData, setSavedData] = useState([]);
  // last version coming from server props (source of truth)
  const [originalData, setOriginalData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // Popups/state
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [changes, setChanges] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type, category, path? }
  const [addPopup, setAddPopup] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newFiles, setNewFiles] = useState([]);

  // Selection
  const [selectedCategory, setSelectedCategory] = useState("OVERALL");

  // Re-hydrate when props change (this is why your UI snaps back to "original")
  useEffect(() => {
    if (!iqacData) return;
    const normalized = Array.isArray(iqacData) ? iqacData : [iqacData];
    const cloned = deepClone(normalized);

    setGalleryData(cloned);
    setSavedData(cloned);
    setOriginalData(cloned);

    // keep selection valid
    setSelectedCategory((prev) => {
      const categories = cloned.map((x) => x.category);
      if (prev === "OVERALL") return "OVERALL";
      return categories.includes(prev) ? prev : "OVERALL";
    });
  }, [iqacData]);

  // When NOT editing, we display savedData; when editing, we display galleryData
  const displayData = isEditing ? galleryData : savedData;

  // Build overall virtual category
  const overallPaths = useMemo(() => {
    if (!Array.isArray(displayData)) return [];
    return displayData.flatMap((item) => item?.image_path || []);
  }, [displayData]);

  const galleryWithOverall = useMemo(() => {
    return [{ category: "OVERALL", image_path: overallPaths }, ...displayData];
  }, [displayData, overallPaths]);

  const categories = useMemo(
    () => galleryWithOverall.map((item) => item?.category).filter(Boolean),
    [galleryWithOverall]
  );

  const selectedItem = useMemo(
    () => galleryWithOverall.find((item) => item?.category === selectedCategory),
    [galleryWithOverall, selectedCategory]
  );

  // Unsaved edits (Edit mode)
  const hasUnsavedEdits = useMemo(() => {
    return JSON.stringify(galleryData) !== JSON.stringify(savedData);
  }, [galleryData, savedData]);

  // Saved locally but not yet requested/approved vs original from server
  const hasPendingApprovalChanges = useMemo(() => {
    return JSON.stringify(savedData) !== JSON.stringify(originalData);
  }, [savedData, originalData]);

  // Delete (only affects galleryData, i.e. edit buffer)
  const handleDelete = () => {
    if (deleteConfirm?.type === "category") {
      setGalleryData((prev) =>
        prev.filter((item) => item.category !== deleteConfirm.category)
      );
    }

    if (deleteConfirm?.type === "image") {
      setGalleryData((prev) =>
        prev.map((item) =>
          item.category === deleteConfirm.category
            ? {
              ...item,
              image_path: (item.image_path || []).filter(
                (path) => path !== deleteConfirm.path
              ),
            }
            : item
        )
      );
    }

    setDeleteConfirm(null);
  };

  // Add new category (edit buffer)
  const handleAddCategory = () => {
    if (!newCategory || newFiles.length === 0) return;
    const fileArray = Array.from(newFiles);

    setGalleryData((prev) => [
      ...prev,
      {
        category: newCategory,
        image_path: fileArray.map((f) => URL.createObjectURL(f)), // preview only
        _files: fileArray, // transient files to upload
      },
    ]);

    setNewCategory("");
    setNewFiles([]);
    setAddPopup(false);
  };

  // Add images to existing category (edit buffer)
  const handleAddImagesToCategory = (category, files) => {
    if (!files?.length) return;
    const fileArray = Array.from(files);

    setGalleryData((prev) =>
      prev.map((item) =>
        item.category === category
          ? {
            ...item,
            image_path: [
              ...(item.image_path || []),
              ...fileArray.map((f) => URL.createObjectURL(f)), // preview only
            ],
            _newFiles: [...(item._newFiles || []), ...fileArray], // transient
          }
          : item
      )
    );
  };

  // Save edits locally (still not sent for approval)
  const handleSave = () => {
    const { payload } = buildPayload(galleryData, originalData);

    setChanges(payload);
    console.log(galleryData);
    setSavedData(deepClone(galleryData));
    console.log(deepClone(galleryData));
    setIsEditing(false);
  };

  // Cancel edit session
  const handleCancel = () => {
    setGalleryData(deepClone(savedData));
    setIsEditing(false);
    setNewCategory("");
    setNewFiles([]);
  };

  // Discard saved local changes back to server original
  const handleDiscard = () => {
    setSavedData(deepClone(originalData));
    setGalleryData(deepClone(originalData));
  };

  const buildPayload = (saved, originals) => {
    const payload = [];
    const files = [];

    const savedByCategory = new Map(saved.map((item) => [item.category, item]));

    // Deletions: category or individual image deletions (server paths only)
    originals.forEach((orig) => {
      const savedItem = savedByCategory.get(orig.category);

      if (!savedItem) {
        payload.push({
          collectionName: "iqac",
          collection_type: "gallery",
          action: "delete",
          title: "deletion of gallery images",
          category: orig.category,
          meta_data: { image_path: orig.image_path || [] },
          original_data: null,
        });
        return;
      }

      const deletedImages = (orig.image_path || []).filter(
        (path) => !(savedItem.image_path || []).includes(path)
      );

      if (deletedImages.length > 0) {
        payload.push({
          collectionName: "iqac",
          collection_type: "gallery",
          action: "delete_category",
          title: "deletion of gallery category",
          category: orig.category,
          meta_data: {
            image_path: orig.image_path || [],
          },
          original_data: null,
        });
      }
    });

    // Insertions/Updates: send file names, attach real File objects
    saved.forEach((savedItem) => {
      const originalItem = originals.find((o) => o.category === savedItem.category);

      // new category
      if (!originalItem) {
        const newCatFiles = savedItem._files || [];
        if (newCatFiles.length) {
          payload.push({
            collectionName: "iqac",
            collection_type: "gallery",
            action: "insert",
            title: "insertion of gallery images",
            category: savedItem.category,
            meta_data: { image_path: newCatFiles.map((f) => f.name) },
            original_data: null,
          });
          files.push(...newCatFiles);
        }
        return;
      }

      // new images in existing category
      const newFiles = savedItem._newFiles || [];
      if (newFiles.length) {
        payload.push({
          collectionName: "iqac",
          collection_type: "gallery",
          action: "update",
          title: "updation of gallery images",
          category: savedItem.category,
          meta_data: { image_path: newFiles.map((f) => f.name) },
          original_data: { image_path: originalItem.image_path || [] },
        });
        files.push(...newFiles);
      }
    });


    return { payload, files };
  };

  // Send final request
  const handleConfirmRequest = async () => {
    try {
      const { payload, files } = buildPayload(savedData, originalData);
      console.log("Payload Length:", payload.length);
      console.log(payload);
      console.log("Payload:", payload);
      console.log("Files:", files);
      console.log("Payload:", payload);
      console.log("Files:", files);

      if (payload.length === 0) {
        console.log("No payload generated");
        toast.info("No changes found.");
        return;
      }

      console.log("Calling sendRequest...");

      const response = await sendRequest(payload, files);
      console.log("Response from sendRequest:", response);
      console.log("Response:", response);


      if (response) {
        console.log("SUCCESS");

        // toast.success("Request submitted successfully.");

        // Reset the baseline
        const updatedData = deepClone(savedData);

        setOriginalData(updatedData);
        setSavedData(updatedData);

        setConfirmPopup(false);
        setChanges([]);


        // if (typeof onRefresh === "function") {
        //   await onRefresh();
        // }
      } else {
        console.log("sendRequest returned null");
        toast.error("sendRequest returned null");
      }
    } catch (err) {
      console.error("handleConfirmRequest Error:", err);
      toast.error(err?.message || "Request failed");
    }
  };

  return (
    <>
      {!iqacData ? (
        <div className="flex justify-center items-center min-h-screen">
          <LoadComp />
        </div>
      ) : (
        <div className="mr-4">
          <div className="flex justify-between items-center mt-[15px] px-6">
            <h2 className="basis-full text-brwn dark:text-drkt text-center text-[24px]">
              Gallery
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 px-3 py-1 bg-secd text-text hover:bg-brwn hover:text-prim rounded"
              >
                Edit
              </button>
            )}
          </div>

          {/* Category Buttons */}
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {categories.map((category) => (
              <div key={category} className="flex items-center gap-1">
                <button
                  className={`px-4 py-1 text-lg font-semibold rounded-lg transition-colors duration-300 ${selectedCategory === category
                    ? "bg-accn text-white"
                    : "bg-secd dark:bg-drks"
                    }`}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
                {category !== "OVERALL" && isEditing && (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm({ type: "category", category })}
                    className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Images */}
          <div className="columns-xs mb-12 relative">
            {selectedItem?.image_path?.map((imagePath, index) => (
              <div key={`${imagePath}-${index}`} className="relative inline-block m-2">
                <img
                  src={UrlParser(imagePath)}
                  alt={`Gallery Image ${index + 1}`}
                  className="size-0 block box-border animate-[fadBorn_1s_ease_forwards]"
                  style={{ animationDelay: `${100 * index}ms` }}
                />
                {selectedCategory !== "OVERALL" && isEditing && (
                  <button
                    onClick={() =>
                      setDeleteConfirm({
                        type: "image",
                        category: selectedCategory,
                        path: imagePath,
                      })
                    }
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}

            {/* Add new images (for specific category) */}
            {selectedCategory !== "OVERALL" && isEditing && (
              <label className="m-2 w-40 h-40 border-2 border-dashed border-gray-400 flex items-center justify-center cursor-pointer rounded-lg">
                <Plus size={32} />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) =>
                    handleAddImagesToCategory(selectedCategory, e.target.files)
                  }
                />
              </label>
            )}

            {/* Add new category (only in OVERALL) */}
            {selectedCategory === "OVERALL" && isEditing && (
              <label
                className="m-2 w-40 h-40 border-2 border-dashed border-gray-400 flex items-center justify-center cursor-pointer rounded-lg"
                onClick={() => setAddPopup(true)}
              >
                <Plus size={32} />
              </label>
            )}
          </div>

          {/* Save + Cancel Buttons */}
          {isEditing && (
            <div className="flex justify-end gap-4 mb-6">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!hasUnsavedEdits}
                className="px-4 py-2 rounded bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt disabled:opacity-60"
              >
                Save
              </button>
            </div>
          )}

          {/* Discard + Request Buttons */}
          {!isEditing && hasPendingApprovalChanges && (
            <div className="flex justify-end gap-4 mb-6">
              <button
                onClick={handleDiscard}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Discard Changes
              </button>
              <button
                onClick={() => setConfirmPopup(true)}
                className="flex items-center gap-2 px-4 py-2 bg-secd text-text rounded hover:bg-[#800000] hover:text-drkt"
              >
                Request
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[400px] text-center">
            <h3 className="text-lg font-bold mb-4 text-text dark:text-drkt">
              Confirm Delete
            </h3>
            <p className="mb-4 text-text dark:text-drkt">
              {deleteConfirm.type === "category"
                ? `Are you sure you want to delete category "${deleteConfirm.category}"?`
                : `Are you sure you want to delete this image from "${deleteConfirm.category}"?`}
            </p>

            {deleteConfirm.type === "image" && (
              <img
                src={UrlParser(deleteConfirm.path)}
                alt="Delete preview"
                className="w-40 h-40 object-cover mx-auto rounded mb-4"
              />
            )}

            <div className="flex justify-center gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Popup */}
      {addPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] backdrop-blur-sm">
          <div className="bg-prim dark:bg-drkp p-8 rounded-2xl w-[520px] shadow-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold mb-6 text-brwn dark:text-drkt text-center">
              Add New Gallery Category
            </h3>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-text dark:text-drkt">
                Category Name
              </label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g., 24-25 FIRST MEETING"
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-text dark:text-drkt placeholder-gray-400 focus:border-accn focus:ring-2 focus:ring-accn/20 transition-all outline-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-text dark:text-drkt">
                Upload Images
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setNewFiles(e.target.files)}
                  className="hidden"
                  id="gallery-file-input"
                />
                <label
                  htmlFor="gallery-file-input"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-accn hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  <Plus size={32} className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {newFiles.length > 0
                      ? `${newFiles.length} image${newFiles.length > 1 ? "s" : ""
                      } selected`
                      : "Click to select images"}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    Supports multiple images
                  </span>
                </label>
              </div>
            </div>

            {newFiles.length > 0 && (
              <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Selected Files:
                </p>
                <div className="max-h-24 overflow-y-auto space-y-1">
                  {Array.from(newFiles).map((file, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-gray-700 dark:text-gray-300 truncate"
                    >
                      • {file.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setAddPopup(false);
                  setNewCategory("");
                  setNewFiles([]);
                }}
                className="px-5 py-2.5 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                disabled={!newCategory || newFiles.length === 0}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all ${newCategory && newFiles.length > 0
                  ? "bg-secd text-text hover:bg-[#800000] hover:text-drkt shadow-md hover:shadow-lg"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Request Confirmation Popup */}
      {confirmPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[450px]">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Final Request for the Changes
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin.
              Once approved, they will be applied automatically to the live site.
            </p>

            <div className="max-h-[300px] overflow-y-auto mb-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Action</th>
                    <th className="text-left py-2">Category</th>
                    <th className="text-left py-2">Images</th>
                  </tr>
                </thead>

                <tbody>
                  {changes.map((change, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">
                        {change.action === "insert"
                          ? "➕ Added"
                          : change.action === "update"
                            ? "✏ Updated"
                            : "🗑 Deleted"}
                      </td>

                      <td>{change.category}</td>

                      <td>
                        {change.meta_data?.image_path?.length || 0} image(s)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmPopup(false)}
                className={`px-4 py-2 rounded bg-gray-400 text-white ${loading ? "cursor-not-allowed" : ""
                  }`}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRequest}
                className={`px-4 py-2 rounded bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt ${loading ? "cursor-progress" : ""
                  }`}
                disabled={loading}
              >
                {loading ? "Processing..." : "Final Request"}
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
      />
    </>
  );
}