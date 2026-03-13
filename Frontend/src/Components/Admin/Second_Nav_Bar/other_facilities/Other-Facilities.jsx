import { useEffect, useState, useRef } from "react";
import "./Other-Facilities.css";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router";
import { Pencil, Send, X, Plus, Trash2 } from "lucide-react";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

export default function AdminOtherFacilities({ theme, toggle }) {
  const [activeTab, setActiveTab] = useState(null); // stable key (__origKey or category)
  const [imageIndex, setImageIndex] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [otherFacilities, setOtherFacilities] = useState(null);
  const { sendRequest, loading, error } = useAdminRequest();
  // editing states
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [changeList, setChangeList] = useState([]);

  // image table related
  const [currentRows, setCurrentRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const [showDeleteRowsModal, setShowDeleteRowsModal] = useState(false);

  // category (button) management
  const [selectedCategories, setSelectedCategories] = useState([]); // stores stable keys
  const [showDeleteCategoriesModal, setShowDeleteCategoriesModal] =
    useState(false);

  const [prevFacilitiesSnapshot, setPrevFacilitiesSnapshot] = useState(null); // for discard
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL || "";

  // NEW: track whether any edit/add/delete action happened (controls Save visibility)
  const [hasEdits, setHasEdits] = useState(false);
  // NEW: keep track of created blob URLs to revoke later
  const uploadedUrlsRef = useRef([]);

  // helper: unique id
  function uid() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  }

  // robust join and url parsing
  const joinBase = (base, path) => {
    if (!path) return "";
    if (!base) return path;
    return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  };

  const UrlParser = (path) => {
    if (!path) return null;
    if (typeof path !== "string") return path;
    if (path.startsWith("http") || path.startsWith("blob:")) return path;
    return joinBase(BASE_URL, path);
  };

  const resolveImageSrc = (src) => {
    if (!src) return "";
    if (typeof src !== "string") return src;
    if (src.startsWith("blob:")) return src; // blob preview ok
    if (src.startsWith("http")) return src;
    return joinBase(BASE_URL, src);
  };

  const getSafe = (value, index) => {
    return Array.isArray(value) ? value[index] || value[0] : value;
  };

  const buildOtherFacilityImagePath = (category, fileName) => {
    const safeCategory = String(category || "").trim();
    const safeFileName = String(fileName || "").trim();
    if (!safeFileName) return "";
    if (safeCategory) {
      return `/static/images/other_facilities/${safeCategory}/${safeFileName}`;
    }
    return `/static/images/other_facilities/${safeFileName}`;
  };

  const persistCurrentRowsToFacility = () => {
    if (!isEditing || !currentFacility) return;
    const stableKey = getStableKeyForCurrent();
    if (!stableKey) return;

    setOtherFacilities((prev = []) =>
      prev.map((fac) => {
        const facKey = fac.__origKey || fac.category;
        if (facKey !== stableKey) return fac;

        const categoryFolder = fac.category || "";
        const image_path = currentRows.map((r) =>
          r.imageFile ? r.image : r.origImagePath,
        );
        const image_path_server = currentRows.map((r) =>
          r.imageFile
            ? buildOtherFacilityImagePath(categoryFolder, r.imageFile.name)
            : r.origImagePath,
        );
        const newFiles = currentRows
          .filter((r) => r.imageFile)
          .map((r) => ({
            path: buildOtherFacilityImagePath(categoryFolder, r.imageFile.name),
            file: r.imageFile,
          }));

        return {
          ...fac,
          description: currentRows.map((r) => r.text),
          image_path,
          image_path_server,
          __newFiles: newFiles,
        };
      }),
    );
  };

  // currentFacility lookup by stable key (activeTab) OR fallback to category string
  const currentFacility = otherFacilities?.find(
    (facility) =>
      facility?.__origKey === activeTab || facility?.category === activeTab,
  );

  // compute images for the non-editing carousel
  // This runs — images comes from currentFacility.image_path
  const images = currentFacility
    ? Array.isArray(currentFacility.image_path)
      ? currentFacility.image_path
      : [currentFacility.image_path]
    : [];

  const nextImage = () => {
    if (!currentFacility) return;
    const imgs = isEditing
      ? currentRows.map((r) => r.image).filter(Boolean)
      : Array.isArray(currentFacility.image_path)
        ? currentFacility.image_path
        : [currentFacility.image_path];
    if (imgs.length === 0) return;
    setImageIndex((prevIndex) => (prevIndex + 1) % imgs.length);
  };
  const buildOtherFacilitiesPayload = ({ action, newData, oldData }) => {
    const normalize = (val) => (Array.isArray(val) ? val : val ? [val] : []);
    const cleanPaths = (arr = []) =>
      normalize(arr).filter(
        (p) => typeof p === "string" && !p.startsWith("blob:"),
      );

    if (action === "add") {
      return {
        collectionName: "other_facilities",
        collection_type: "other_facilities",
        action: "insert",
        title: "insertion of other facility",
        category: newData.category,
        meta_data: {
          name: newData.name,
          description: normalize(newData.description),
          image_path: cleanPaths(
            newData?.image_path_server || newData?.image_path,
          ),
        },
        original_data: null,
      };
    }
    if (action === "edit") {
      // ✅ FIXED — use server paths, not blob URLs
      const newImagePaths = cleanPaths(
        newData?.image_path_server || newData?.image_path,
      );
      const oldImagePaths = cleanPaths(
        oldData?.image_path || oldData?.meta_data?.image_path,
      );

      // Find deleted image paths = paths in old but NOT in new
      const deletedImagePaths = oldImagePaths.filter(
        (p) => !newImagePaths.includes(p),
      );
      const isImageDelete = deletedImagePaths.length > 0;

      return {
        collectionName: "other_facilities",
        collection_type: "other_facilities",
        action: "update",
        title: "updation of other facility",
        category: newData?.category,
        meta_data: isImageDelete
          ? {
              // ✅ Only the deleted image path
              image_path: deletedImagePaths,
            }
          : {
              // Normal edit — send full updated data
              name: newData?.name,
              description: normalize(newData?.description),
              image_path: newImagePaths,
            },
        original_data: isImageDelete
          ? {}
          : {
              name: oldData?.name,
              description: normalize(oldData?.description),
              image_path: oldImagePaths,
            },
      };
    }

    if (action === "delete") {
      const normalize = (val) => (Array.isArray(val) ? val : val ? [val] : []);
      const cleanPaths = (arr) =>
        normalize(arr).filter(
          (p) => typeof p === "string" && !p.startsWith("blob:"),
        );
      return {
        collectionName: "other_facilities",
        collection_type: "other_facilities",
        action: "delete",
        title: "deletion of other facility",
        category: oldData?.category,
        meta_data: {},
        original_data: null,
      };
    }
    return null;
  };

  const prevImage = () => {
    if (!currentFacility) return;
    const imgs = isEditing
      ? currentRows.map((r) => r.image).filter(Boolean)
      : Array.isArray(currentFacility.image_path)
        ? currentFacility.image_path
        : [currentFacility.image_path];
    if (imgs.length === 0) return;
    setImageIndex((prevIndex) => (prevIndex - 1 + imgs.length) % imgs.length);
  };

  // fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          "/api/main-backend/other_facilities",
          {
            type: "other_facilities",
          },
        );
        const data = response.data.data || [];
        // ensure each item has a stable __origKey (use category if present, else generate)
        const normalized = data.map((f) => ({
          ...f,
          __origKey: f.__origKey || f.category || uid(),
        }));
        setOtherFacilities(normalized);
        setActiveTab(
          normalized[0]?.__origKey || normalized[0]?.category || null,
        );
      } catch (error) {
        console.error("Error fetching Other facilities", error);
        if (error?.response?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
        }
      }
    };
    fetchData();
  }, [navigate]);

  // online/offline listener
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

  // cleanup blob urls on unmount
  useEffect(() => {
    return () => {
      uploadedUrlsRef.current.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch (e) {}
      });
      uploadedUrlsRef.current = [];
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

  // change tracking helper
  const pushFacilityChange = (type, latestName, stableKey, data = {}) => {
    if (!stableKey) return; // stable key required
    if (!latestName) latestName = stableKey;

    setChangeList((prev) => {
      // find facility (if still present) to see if it's a newly created item
      const fac = (otherFacilities || []).find(
        (f) => f.__origKey === stableKey || f.category === stableKey,
      );
      const isNewFac = fac?.__isNew === true;

      // If deleting a facility that was just created locally, remove the "add" entry
      if (type === "delete" && isNewFac) {
        return prev.filter((item) => item._key !== stableKey);
      }

      const desiredType = type === "edit" && isNewFac ? "add" : type;

      const existingIndex = prev.findIndex(
        (item) =>
          item.section === "Other-Facilities" &&
          item.type === desiredType &&
          item._key === stableKey,
      );

      // ✅ FIXED - also updates `data` so latest image_path is preserved
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          changes: latestName,
          data:
            Object.keys(data).length > 0 ? data : updated[existingIndex].data,
        };
        return updated;
      }

      const anyAddIndex = prev.findIndex(
        (item) =>
          item.section === "Other-Facilities" &&
          item.type === "add" &&
          item._key === stableKey,
      );
      if (anyAddIndex !== -1 && desiredType === "edit") {
        const updated = [...prev];
        updated[anyAddIndex] = { ...updated[anyAddIndex], changes: latestName };
        return updated;
      }

      return [
        ...prev,
        {
          type: desiredType,
          section: "Other-Facilities",
          changes: latestName,
          _key: stableKey,
          data,
        },
      ];
    });
  };

  // init table rows for a facility
  function initRowsFromFacility(facility) {
    const imgs = Array.isArray(facility.image_path)
      ? facility.image_path
      : [facility.image_path];
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
        // display existing paths through UrlParser; newly uploaded files will be blob URLs stored in `image`
        image: img ? UrlParser(img) : null,
        origImagePath: img || null,
      };
    });

    if (rows.length === 0) {
      rows.push({
        id: uid(),
        text: names[0] || "",
        image: null,
        origImagePath: null,
      });
    }

    setCurrentRows(rows);
    setSelectedRows([]);
    setCurrentPage(1);
  }

  const handleStartEditing = () => {
    // snapshot previous state (deep-ish copy)
    const snapshot = JSON.parse(JSON.stringify(otherFacilities || []));
    setPrevFacilitiesSnapshot(snapshot);

    // add stable __origKey to each facility (only in working copy) if missing
    setOtherFacilities((prev) =>
      (prev || []).map((f) => ({
        ...f,
        __origKey: f.__origKey || f.category || uid(),
      })),
    );

    setIsEditing(true);
    setIsSaved(false);
    setChangeList([]);
    setHasEdits(false);
    if (currentFacility) initRowsFromFacility(currentFacility);
  };

  const handleCancel = () => {
    // cancel editing mode without saving -> restore snapshot
    if (prevFacilitiesSnapshot) {
      setOtherFacilities(prevFacilitiesSnapshot);
      setPrevFacilitiesSnapshot(null);
      setActiveTab(
        prevFacilitiesSnapshot[0]?.__origKey ||
          prevFacilitiesSnapshot[0]?.category ||
          null,
      );
    }
    // revoke uploaded blob urls created during this edit session
    uploadedUrlsRef.current.forEach((u) => {
      try {
        URL.revokeObjectURL(u);
      } catch (e) {}
    });
    uploadedUrlsRef.current = [];
    setIsEditing(false);
    setIsSaved(false);
    setChangeList([]);
    setSelectedRows([]);
    setSelectedCategories([]);
    setHasEdits(false);
  };

  // Helper to get stable key for the currently active facility
  const getStableKeyForCurrent = () =>
    currentFacility?.__origKey || currentFacility?.category;

  // handle category/name field updates by stable key
  const handleCategoryFieldChange = (stableKey, field, value) => {
    setOtherFacilities((prev = []) => {
      // find facility by stable key
      const fac = prev.find(
        (f) => f.__origKey === stableKey || f.category === stableKey,
      );
      const stable = fac?.__origKey || fac?.category || stableKey;

      const updated = prev.map((f) => {
        if (f.__origKey !== stable && f.category !== stable) return f;
        // keep __origKey stable (do not change it when user edits category)
        return { ...f, [field]: value, __origKey: f.__origKey || stable };
      });

      pushFacilityChange("edit", value, stable);
      return updated;
    });

    // if category name was changed and activeTab referenced category string, switch to stable key
    if (field === "category" && activeTab === stableKey) {
      // find the facility after update to get its __origKey
      const fac = otherFacilities?.find(
        (f) => f.__origKey === stableKey || f.category === stableKey,
      );
      setActiveTab(fac?.__origKey || value);
    }

    setHasEdits(true);
  };

  const handleAddNewCategory = () => {
      if (isEditing && currentFacility) {
      persistCurrentRowsToFacility();
    }
    const newKey = uid();
    const newFacility = {
      category: "",
      name: "",
      description: [""],
      image_path: [],
      __origKey: newKey, // stable unique key
      __isNew: true, // mark as newly added
    };

    setOtherFacilities((prev) => [...(prev || []), newFacility]);
    // set active tab to stable key so editor targets this new facility
    setActiveTab(newKey);
    setIsEditing(true);
    setHasEdits(true);
    pushFacilityChange("add", newFacility.category || "(new)", newKey);

    // init rows for the new facility
    setTimeout(() => initRowsFromFacility(newFacility), 0);
  };

  const handleToggleSelectCategory = (stableKey) => {
    setSelectedCategories((prev) =>
      prev.includes(stableKey)
        ? prev.filter((c) => c !== stableKey)
        : [...prev, stableKey],
    );
    setHasEdits(true);
  };

  const handleDeleteSelectedCategories = () => {
    if (selectedCategories.length === 0) return;

    // Revoke any blob URLs that belong to the categories being deleted
    selectedCategories.forEach((stableKey) => {
      const fac = otherFacilities?.find(
        (f) => f.__origKey === stableKey || f.category === stableKey,
      );
      // Revoke any blob URLs present in fac.image_path (if any)
      const imgs = Array.isArray(fac?.image_path)
        ? fac.image_path
        : fac?.image_path
          ? [fac.image_path]
          : [];
      imgs.forEach((src) => {
        if (src && typeof src === "string" && src.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(src);
            uploadedUrlsRef.current = uploadedUrlsRef.current.filter(
              (u) => u !== src,
            );
          } catch (e) {}
        }
      });

      // ✅ REPLACE WITH
      pushFacilityChange("delete", fac?.category || "(deleted)", stableKey, {
        name: fac?.name,
        description: fac?.description,
        image_path: fac?.image_path,
        category: fac?.category,
      });
    });

    setOtherFacilities((prev) => {
      const remaining = prev.filter(
        (fac) => !selectedCategories.includes(fac.__origKey),
      );
      // if activeTab was among deleted, switch to first remaining
      if (selectedCategories.includes(activeTab)) {
        setActiveTab(remaining[0]?.__origKey || remaining[0]?.category || null);
      }
      return remaining;
    });

    setSelectedCategories([]);
    setShowDeleteCategoriesModal(false);
    setHasEdits(true);
  };
  const handleRevertChange = (index) => {
    const change = changeList[index];
    if (!change || !prevFacilitiesSnapshot) return;

    const stableKey = change._key;

    setOtherFacilities((current) => {
      let updated = [...current];

      // -------- ADD REVERT --------
      if (change.type === "add") {
        updated = updated.filter((f) => f.__origKey !== stableKey);
      }

      // -------- DELETE REVERT --------
      if (change.type === "delete") {
        const restored = prevFacilitiesSnapshot.find(
          (f) => f.__origKey === stableKey || f.category === stableKey,
        );
        if (restored) {
          updated.push(restored);
        }
      }

      if (change.type === "edit") {
        const original = prevFacilitiesSnapshot.find(
          (f) => f.__origKey === stableKey || f.category === stableKey,
        );
        if (original) {
          updated = updated.map((f) =>
            f.__origKey === stableKey ? original : f,
          );
        }
      }

      // 🔑 CRITICAL FIX: ensure activeTab is valid
      setTimeout(() => {
        setActiveTab((prevTab) => {
          const stillExists = updated.some((f) => f.__origKey === prevTab);
          return stillExists ? prevTab : updated[0]?.__origKey || null;
        });
      }, 0);

      return updated;
    });

    // remove log entry
    setChangeList((prev) => prev.filter((_, i) => i !== index));

    setHasEdits(true);
  };

  // ======= Image table handlers =======
  const handleInputChange = (rowId, field, value) => {
    setCurrentRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: value } : r)),
    );
    pushFacilityChange(
      "edit",
      currentFacility?.category || currentFacility?.name || "(edit)",
      getStableKeyForCurrent(),
    );
    setHasEdits(true);
  };

  const handleImageUpload = (rowId, file) => {
    if (!file) return;

    const blobUrl = URL.createObjectURL(file);
    uploadedUrlsRef.current.push(blobUrl);
    const imagePath = buildOtherFacilityImagePath(
      currentFacility?.category,
      file.name,
    );

    setCurrentRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? {
              ...r,
              image: blobUrl, // preview (blob)
              imageFile: file, // actual File for upload
              image_path: imagePath, // intended backend path (string)
              origImagePath: null, // marks as NEW image
            }
          : r,
      ),
    );
    setHasEdits(true);

    pushFacilityChange(
      "edit",
      currentFacility?.category || "(image upload)",
      getStableKeyForCurrent(),
      { imageFile: file },
    );
  };

  const handleAddRow = () => {
    const newRow = {
      id: uid(),
      text: "",
      image: null,
      origImagePath: null,
    };
    setCurrentRows((prev) => [...prev, newRow]);
    pushFacilityChange(
      "edit",
      currentFacility?.category || "(edit)",
      getStableKeyForCurrent(),
    );
    setHasEdits(true);
  };

  const handleToggleSelectRow = (rowId) => {
    setSelectedRows((prev) =>
      prev.includes(rowId) ? prev.filter((r) => r !== rowId) : [...prev, rowId],
    );
  };

  const handleDeleteSelectedRows = () => {
    // ✅ Compute remaining rows BEFORE state update
    const remainingRows = currentRows.filter(
      (r) => !selectedRows.includes(r.id),
    );
    const rowsToDelete = currentRows.filter((r) => selectedRows.includes(r.id));

    // Revoke blob URLs for deleted rows
    rowsToDelete.forEach((r) => {
      if (r.image && r.origImagePath === null) {
        try {
          if (uploadedUrlsRef.current.includes(r.image)) {
            URL.revokeObjectURL(r.image);
            uploadedUrlsRef.current = uploadedUrlsRef.current.filter(
              (u) => u !== r.image,
            );
          }
        } catch (e) {}
      }
    });

    setCurrentRows(remainingRows);

    // ✅ Push change with only the REMAINING image paths and descriptions
    pushFacilityChange(
      "edit",
      currentFacility?.category || "(image delete)",
      getStableKeyForCurrent(),
      {
        name: currentFacility?.name,
        description: remainingRows.map((r) => r.text),
        image_path: remainingRows
          .map((r) => r.image_path || r.origImagePath)
          .filter(Boolean),
      },
    );

    setSelectedRows([]);
    setShowDeleteRowsModal(false);
    setHasEdits(true);
  };

  const validateCurrentFacility = () => {
    if (!currentFacility) return false;

    const toStr = (val) => {
      if (Array.isArray(val)) return val[0] || "";
      return String(val || "");
    };

    const categoryValid = toStr(currentFacility.category).trim().length > 0;
    const nameValid = toStr(currentFacility.name).trim().length > 0;

    if (!categoryValid || !nameValid) return false;

    if (!currentRows || currentRows.length === 0) return false;

    for (const r of currentRows) {
      const imageOk = !!(r.image || r.origImagePath);
      if (!imageOk) return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateCurrentFacility()) {
      alert("All fields are mandatory");
      return;
    }

    setOtherFacilities((prev) =>
      prev.map((fac) => {
        const facKey = fac.__origKey || fac.category;
        if (facKey !== activeTab) return fac;

        const categoryFolder = fac.category || "";

        const image_path = currentRows.map((r) =>
          r.imageFile ? r.image : r.origImagePath,
        );

        const image_path_server = currentRows.map((r) =>
          r.imageFile
            ? buildOtherFacilityImagePath(categoryFolder, r.imageFile.name)
            : r.origImagePath,
        );

        const newFiles = currentRows
          .filter((r) => r.imageFile)
          .map((r) => ({
            path: buildOtherFacilityImagePath(categoryFolder, r.imageFile.name),
            file: r.imageFile,
          }));

        return {
          ...fac,
          image_path,
          image_path_server,
          description: currentRows.map((r) => r.text),
          __origKey: fac.__origKey || fac.category || uid(),
          __isNew: fac.__isNew || false,
          __newFiles: newFiles,
        };
      }),
    );

    setIsEditing(false);
    setIsSaved(true);
    setHasEdits(false);
    setImageIndex(0); // ✅ reset so carousel starts at first image
  };

  const handleDiscardChanges = () => {
    if (prevFacilitiesSnapshot) {
      setOtherFacilities(prevFacilitiesSnapshot);
      setActiveTab(
        prevFacilitiesSnapshot[0]?.__origKey ||
          prevFacilitiesSnapshot[0]?.category ||
          null,
      );
      setPrevFacilitiesSnapshot(null);
    }
    setIsSaved(false);
    setChangeList([]);
    setSelectedRows([]);
    setSelectedCategories([]);
    setHasEdits(false);
    // Also revoke created blob URLs
    uploadedUrlsRef.current.forEach((u) => {
      try {
        URL.revokeObjectURL(u);
      } catch (e) {}
    });
    uploadedUrlsRef.current = [];
  };

  const handleRequest = () => {
    setShowPopup(true);
  };
  // ✅ REPLACE WITH - delete uses change.data (saved at push time)
  const buildOtherFacilitiesRequestPayload = (
    changeList,
    currentData,
    prevSnapshot,
  ) => {
    return changeList
      .map((change) => {
        const newData = currentData.find((f) => f.__origKey === change._key);
        const oldData =
          change.type === "delete"
            ? change.data // ← use stored data
            : prevSnapshot?.find((f) => f.__origKey === change._key);
        return buildOtherFacilitiesPayload({
          action: change.type,
          newData,
          oldData,
        });
      })
      .filter(Boolean);
  };
  // ✅ Add this line right before the carousel img tag

  const safeIndex = Math.min(imageIndex, images.length - 1);

  <img
    src={resolveImageSrc(images[safeIndex])}
    alt={currentFacility?.category || currentFacility?.name || ""}
    className="carousel-img"
    onError={(e) => {
      e.currentTarget.style.display = "none";
    }}
  />;
  const handleFinalRequest = async () => {
    if (!changeList.length) {
      alert("No changes to submit");
      return;
    }

    // 1) Build request payload (uses otherFacilities which now have server image_path)
    const payload = buildOtherFacilitiesRequestPayload(
      changeList,
      otherFacilities,
      prevFacilitiesSnapshot,
    );

    // 2) Collect files (from __newFiles) — these are File objects that we must upload
    const filesToUpload = changeList
      .map((change) => change.data?.imageFile)
      .filter(Boolean);

    console.log("PAYLOAD:", payload);
    console.log("FILES :", filesToUpload);

    await sendRequest(payload, filesToUpload);

    toast.success("Request submitted successfully!");
    setShowPopup(false);
    setChangeList([]);
    setPrevFacilitiesSnapshot(null);

    // cleanup created blob urls now that everything's submitted
    uploadedUrlsRef.current.forEach((u) => {
      try {
        URL.revokeObjectURL(u);
      } catch (e) {}
    });
    uploadedUrlsRef.current = [];
  };

  // Pagination helpers
  const totalPages = Math.max(1, Math.ceil(currentRows.length / rowsPerPage));
  const paginatedRows = currentRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
  }

  if (!otherFacilities) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={""} />
      </div>
    );
  }
  if (!currentFacility && otherFacilities.length > 0) {
    setActiveTab(otherFacilities[0].__origKey);
    return null;
  }
  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/Others.webp"
        headerText="OTHER FACILITES"
        subHeaderText="Fostering excellence in social service and community well-being."
      />
      <ToastContainer position="bottom-right" autoClose={3000} />
      <div className="flex justify-end mt-4">
        {!isEditing && currentFacility && (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg mt-4 mr-10"
            onClick={handleStartEditing}
          >
            <Pencil size={16} /> Edit
          </button>
        )}
      </div>

      <div className="facilities-container bg-prim dark:bg-drkp">
        {/* Tabs: when editing each tab has a checkbox; Add New Button is at end */}
        <div className="tabs-container mt-4">
          {otherFacilities?.map((facility) => {
            const stableKey = facility.__origKey || facility.category;
            return (
              <div key={stableKey} className={`inline-block mr-2`}>
                <button
                  className={`tab-button ${activeTab === stableKey ? "active-tab" : ""} bg-secd dark:bg-drks text-text flex items-center`}
                  onClick={() => {
                    if (isEditing && currentFacility && stableKey !== activeTab) {
                      persistCurrentRowsToFacility();
                    }
                    setActiveTab(stableKey);
                    setImageIndex(0);
                    if (isEditing) initRowsFromFacility(facility);
                  }}
                >
                  {/* when editing, show a checkbox on the tab */}
                  {isEditing && (
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(stableKey)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleToggleSelectCategory(stableKey);
                      }}
                      className="mr-2"
                    />
                  )}
                  <span>{facility?.category || "(no label)"}</span>
                </button>
              </div>
            );
          })}

          {/* Add New Button placed at end of tabs */}
          {isEditing && (
            <button
              onClick={handleAddNewCategory}
              className="tab-button  bg-secd dark:bg-drks text-text flex items-center"
            >
              <Plus size={14} /> Add New
            </button>
          )}
        </div>

        {!isEditing && currentFacility && (
          <div className="content-container">
            <h2 className="current-facility text-brwn dark:text-drkt">
              {getSafe(currentFacility.name, imageIndex)}
            </h2>
            <p>{getSafe(currentFacility.description, imageIndex)}</p>

            {/* Image Carousel */}
            <div className="carousel">
              {images.length > 1 && (
                <button className="prev" onClick={prevImage}></button>
              )}
              <img
                src={resolveImageSrc(images[imageIndex])}
                alt={currentFacility?.category || currentFacility?.name || ""}
                className="carousel-img"
                onError={(e) => {
                  // optional: hide broken image or replace with placeholder
                  e.currentTarget.style.display = "none";
                }}
              />
              {images.length > 1 && (
                <button className="next" onClick={nextImage}>
                  ❯
                </button>
              )}
            </div>
          </div>
        )}

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
                <span className="font-medium">Note:</span> Your changes will
                stay pending until approved by the superior admin. Once
                approved, they will be applied automatically to the live site.
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
                          <span style={{ textTransform: "capitalize" }}>
                            {req.type}
                          </span>
                        </td>
                        <td className="border p-2">Other-Facilities</td>
                        <td className="p-2 border">{req.changes}</td>
                        <td className="p-2 border">
                          <button onClick={() => handleRevertChange(idx)}>
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
                  <Send size={16} />{" "}
                  {loading ? "Processing..." : "Final Request"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========== IMAGE TABLE EDITOR (shown only when editing) ========== */}
        {isEditing && (
          <div className="overflow-x-auto border rounded-lg shadow-md p-4 bg-white dark:bg-gray-800 mt-6 mx-6">
            {currentFacility && (
              <div className="mb-4 p-3 border rounded bg-gray-50 dark:bg-gray-900">
                <div className="flex gap-3 items-center">
                  {/* <div className="flex flex-col">
                    <label className="text-sm">Button Label (category)</label>
                    <input
                      type="text"
                      value={currentFacility.category}
                      onChange={(e) =>
                        handleCategoryFieldChange(
                          getStableKeyForCurrent(),
                          "category",
                          e.target.value,
                        )
                      }
                      className="border p-1 rounded w-64"
                    />
                  </div> */}
                  <div className=" flex flex-col">
                    <label className="text-sm">Heading (name)</label>
                    <input
                      type="text"
                      value={currentFacility.name || ""}
                      onChange={(e) =>
                        handleCategoryFieldChange(
                          getStableKeyForCurrent(),
                          "name",
                          e.target.value,
                        )
                      }
                      className="border p-1 rounded w-64"
                    />
                  </div>
                </div>
              </div>
            )}

            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className=" border p-2">Description / Subheading</th>
                  <th className=" border p-2">Image</th>
                  <th className=" border p-2">Select</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="border p-2">
                      <textarea
                        value={item.text}
                        onChange={(e) => {
                          e.target.style.height = "auto";
                          e.target.style.height = `${e.target.scrollHeight}px`;
                          handleInputChange(item.id, "text", e.target.value);
                        }}
                        className="border p-2 w-full rounded overflow-hidden resize-none min-h-[80px] mb-2"
                      />
                    </td>
                    <td className="  p-2 flex items-center gap-2">
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
                    <td className="border p-2 text-center">
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

            {/* Table Bottom Controls (Add Row / Delete selected rows) */}
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
              <p className="mb-4">
                Are you sure you want to delete the selected row(s)? This action
                cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteRowsModal(false)}
                  className="px-3 py-1 bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSelectedRows}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
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
              <h3 className="text-lg font-semibold mb-3">
                Confirm Delete Buttons
              </h3>
              <p className="mb-4">
                Are you sure you want to delete the selected button(s)? This
                will remove their data (images/descriptions) as well.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteCategoriesModal(false)}
                  className="px-3 py-1 bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSelectedCategories}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
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

            {/* SHOW Save only when edits happened (hasEdits) and the current facility passes validation */}
            {hasEdits && (
              <button
                onClick={handleSave}
                disabled={!validateCurrentFacility()}
                className={`flex items-center gap-2 px-4 py-2 ${
                  validateCurrentFacility()
                    ? "bg-[#FDCC03] text-black"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                } rounded-lg shadow-md hover:bg-yellow-500 transition `}
              >
                Save
              </button>
            )}
          </div>
        )}
      </div>

      <div>
        {selectedCategories.length > 0 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setShowDeleteCategoriesModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded"
            >
              <Trash2 size={16} /> Delete Selected Buttons (
              {selectedCategories.length})
            </button>
          </div>
        )}
      </div>
    </>
  );
}
