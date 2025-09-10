import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import LoadComp from "../../LoadComp";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const UrlParser = (path) => {
    // Return empty string if path is not a string
    if (typeof path !== 'string') return '';
    
    // Handle cases where path might be empty or undefined
    if (!path) return '';
    
    return path.startsWith("http") ? path : `${BASE_URL}${path}`;
};

export default function IqaGal({ iqacData}) {
  const [galleryData, setGalleryData] = useState([]);

    useEffect(() => {
    if (iqacData) {
        setGalleryData(Array.isArray(iqacData) ? iqacData : [iqacData]);
    }
    }, [iqacData]);

  // Create the "OVERALL" category dynamically
  const overallPaths = Array.isArray(galleryData)
  ? galleryData.flatMap(item => item?.paths || [])
  : [];

  const galleryWithOverall = [
    { category: "OVERALL", paths: overallPaths },
    ...galleryData
  ];

  // State
  const [selectedCategory, setSelectedCategory] = useState("OVERALL");
  const [newGallery, setNewGallery] = useState([]);
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type, category, path? }
  const [addPopup, setAddPopup] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newFiles, setNewFiles] = useState([]);

  // Extract all categories
  const categories = galleryWithOverall.map(item => item?.category);

  // Find the object matching the selectedCategory
  const selectedItem = galleryWithOverall.find(item => item?.category === selectedCategory);

  console.log("Selected images",selectedItem);
  

  // Handle delete
// Handle delete
const handleDelete = () => {
  if (deleteConfirm?.type === "category") {
    // Remove category from UI
    setGalleryData(prev => prev.filter(item => item.category !== deleteConfirm.category));

    // Track in newGallery
    setNewGallery(prev => [
      ...prev,
      { action: "delete", category: deleteConfirm.category, files: [], links: [] }
    ]);
  }

  if (deleteConfirm?.type === "image") {
    // Remove image from UI
    setGalleryData(prev =>
      prev.map(item =>
        item.category === deleteConfirm.category
          ? { ...item, paths: item.paths.filter(path => path !== deleteConfirm.path) }
          : item
      )
    );

    // Track in newGallery
    setNewGallery(prev => [
      ...prev,
      { action: "delete", category: deleteConfirm.category, files: [deleteConfirm.path], links: [] }
    ]);
  }

  setDeleteConfirm(null);
};

  // Handle adding new category with images
const handleAddCategory = () => {
  if (!newCategory || newFiles.length === 0) return;

  const fileArray = Array.from(newFiles);

  // Update UI (optimistic update)
  setGalleryData(prev => [
    ...prev,
    { category: newCategory, paths: fileArray.map(f => URL.createObjectURL(f)) }
  ]);

  // Track change for backend
  setNewGallery(prev => [
    ...prev,
    { action: "insert", category: newCategory, files: fileArray, links: [] }
  ]);

  setNewCategory("");
  setNewFiles([]);
  setAddPopup(false);
};

  // Handle adding images to an existing category
// Handle adding images to an existing category
const handleAddImagesToCategory = (category, files) => {
  if (!files.length) return;
  const fileArray = Array.from(files);

  // Update UI
  setGalleryData(prev =>
    prev.map(item =>
      item.category === category
        ? { ...item, paths: [...(item.paths || []), ...fileArray.map(f => URL.createObjectURL(f))] }
        : item
    )
  );

  // Track change for backend
  setNewGallery(prev => [
    ...prev,
    { action: "insert", category, files: fileArray, links: [] }
  ]);
};

  // Confirm final request
  const handleConfirmRequest = () => {
    console.log("Final request changes:", newGallery);
    // TODO: send `newGallery` to backend
    setConfirmPopup(false);
    setNewGallery([]);
  };

  return (
    <>
      {!iqacData ? (
        <div className="flex justify-center items-center min-h-screen">
          <LoadComp />
        </div>
      ) : (
        <div className="mr-4">
          <h2 className="text-2xl text-center text-brwn dark:text-drkt my-4">Gallery</h2>

          {/* Category Buttons */}
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {categories.map(category => (
              <div key={category} className="flex items-center gap-1">
                <button
                  className={`px-4 py-1 text-lg font-semibold rounded-lg transition-colors duration-300 ${
                    selectedCategory === category
                      ? "bg-accn text-white"
                      : "bg-secd dark:bg-drks"
                  }`}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
                {category !== "OVERALL" && (
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
            {selectedItem?.paths?.map((imagePath, index) => (
              <div key={imagePath} className="relative inline-block m-2">
                <img
                  src={UrlParser(imagePath)}
                  alt={`Gallery Image ${index + 1}`}
                  className="size-0 block box-border animate-[fadBorn_1s_ease_forwards]"
                  style={{ animationDelay: `${100 * index}ms` }}
                />
                {selectedCategory !== "OVERALL" && (
                  <button
                    onClick={() =>
                      setDeleteConfirm({ type: "image", category: selectedCategory, path: imagePath })
                    }
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}

            {/* Add new images (for specific category) */}
            {selectedCategory !== "OVERALL" && (
              <label className="m-2 w-40 h-40 border-2 border-dashed border-gray-400 flex items-center justify-center cursor-pointer rounded-lg">
                <Plus size={32} />
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={e => handleAddImagesToCategory(selectedCategory, e.target.files)}
                />
              </label>
            )}

            {/* Add new category (only in OVERALL) */}
            {selectedCategory === "OVERALL" && (
              <label
                className="m-2 w-40 h-40 border-2 border-dashed border-gray-400 flex items-center justify-center cursor-pointer rounded-lg"
                onClick={() => setAddPopup(true)}
              >
                <Plus size={32} />
              </label>
            )}
          </div>

          {/* Request Changes Button */}
          {newGallery.length > 0 && (
            <div className="flex justify-center mb-6">
              <button
                onClick={() => setConfirmPopup(true)}
                className="px-6 py-2 rounded bg-accn text-white hover:bg-[#800000]"
              >
                Request Changes
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
            <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[400px] text-center">
            <h3 className="text-lg font-bold mb-4 text-text dark:text-drkt">Confirm Delete</h3>
            <p className="mb-4 text-text dark:text-drkt">
                {deleteConfirm.type === "category"
                ? `Are you sure you want to delete category "${deleteConfirm.category}"?`
                : `Are you sure you want to delete this image from "${deleteConfirm.category}"?`}
            </p>

            {/* Show image preview if deleting image */}
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[450px]">
            <h3 className="text-lg font-bold mb-4 text-text dark:text-drkt">Add New Category</h3>
            <input
              type="text"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              placeholder="Enter category name"
              className="w-full p-2 rounded mb-4 border"
            />
            <input
              type="file"
              multiple
              onChange={e => setNewFiles(e.target.files)}
              className="mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setAddPopup(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Request Confirmation Popup (your model reused) */}
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

            <div className="max-h-[200px] overflow-y-auto mb-4">
              {newGallery.length > 0 ? (
                <table className="w-full text-left text-text dark:text-drkt">
                  <thead>
                    <tr>
                      <th className="py-1">Action</th>
                      <th className="py-1">Section</th>
                      <th className="py-1">Changes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newGallery.map((g, i) => (
                      <tr key={i}>
                        <td className="py-1">
                          {g.action === "insert" && (
                            <span className="text-green-600">+ Added</span>
                          )}
                          {g.action === "update" && (
                            <span className="text-blue-600">✎ Edited</span>
                          )}
                          {g.action === "delete" && (
                            <span className="text-red-600 flex items-center gap-1">
                              <Trash2 size={14} /> Delete
                            </span>
                          )}
                        </td>
                        <td className="py-1">{g.category}</td>
                        <td className="py-1">
                          {g.files.length > 0 ? `${g.files.length} images` : ""}
                          {g.links.length > 0 ? `, ${g.links.length} links` : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-400">No gallery changes found.</p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmPopup(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRequest}
                className="px-4 py-2 rounded bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt"
              >
                Final Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}