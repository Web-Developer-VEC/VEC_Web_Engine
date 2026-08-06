import React, { useRef, useState, useEffect } from "react";
import "slick-carousel/slick/slick.scss";
import "slick-carousel/slick/slick-theme.scss";
import styles from "./admin_Achievements1.module.css";
import ZonalResults from "./admin_ZonalResults";
import WinnerSlider from "./admin_winners_sld";
import Others from "./admin_others";
import InterZone from "./admin_InterZone";
import Slider from "react-slick";
import LoadComp from "../../LoadComp";
import {
  Pencil,
  Plus,
  Trash2,
  Send,
  Save,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

const Achievements1 = ({ data }) => {
  const sectionRef = useRef(null);
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) =>
    path?.startsWith("http") ? path : `${BASE_URL}${path}`;

  const [showZone, setShowZone] = useState("");

  // Coordinator & carousel data
  const coordinator = data?.find(
    (item) => item.category === "coordinator",
  )?.content;
  const zonalTableData =
    data?.find((item) => item.category === "zonal_table")?.content || [];
  const zonalTableYear =
    data?.find((item) => item.category === "zonal_table")?.year || "";
  const zoneWinnerData =
    data?.find((item) => item.category === "zone_winner")?.content || [];
  const interZonalData =
    data?.find((item) => item.category === "interzonal_achievements")
      ?.content || [];
  const othersData =
    data?.find((item) => item.category === "others")?.content || [];

  const [editMode, setEditMode] = useState(false);
  const [tempData, setTempData] = useState([]);
  const [savedData, setSavedData] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showRequestButtons, setShowRequestButtons] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { sendRequest, loading: loadings, error } = useAdminRequest();

  const [zone, setZone] = useState(coordinator?.zone || "");
  const [year, setYear] = useState(coordinator?.year || "");
  const [savedZone, setSavedZone] = useState(coordinator?.zone || "");
  const [savedYear, setSavedYear] = useState(coordinator?.year || "");
  const [showAddZone, setShowAddZone] = useState(false);

  const [zones, setZones] = useState([]);
  const [currentZoneIndex, setCurrentZoneIndex] = useState(0);
  const [originalZones, setOriginalZones] = useState([]);

  // State for Zonal Results changes
  const [zonalResultsData, setZonalResultsData] = useState(zonalTableData);
  const [originalZonalResults, setOriginalZonalResults] = useState(zonalTableData);
  const [zonalResultsYear, setZonalResultsYear] = useState(zonalTableYear);
  const [originalZonalResultsYear, setOriginalZonalResultsYear] = useState(zonalTableYear);

  const [changes, setChanges] = useState([]);
  const [originalData, setOriginalData] = useState({
    zone: coordinator?.zone,
    year: coordinator?.year,
  });
  const hasChanges = changes.length > 0;

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    if (!coordinator) return;

    const formatted = (coordinator.image_path || []).map((img, idx) => ({
      id: idx + 1,
      image: UrlParser(img),
      text: `Coordinator Image ${idx + 1}`,
      newFile: null,
    }));

    setZones([
      {
        zone: coordinator.zone || "",
        year: coordinator.year || "",
        images: formatted,
      },
    ]);
    setTempData(formatted);
    setSavedData(formatted);
    setZone(coordinator?.zone || "");
    setYear(coordinator?.year || "");
    setSavedZone(coordinator?.zone || "");
    setSavedYear(coordinator?.year || "");
    setOriginalData({ zone: coordinator?.zone, year: coordinator?.year });
    setCurrentZoneIndex(0);
  }, [coordinator]);

  useEffect(() => {
    if (!coordinator) return;

    const formatted = (coordinator.image_path || []).map((img, idx) => ({
      id: idx + 1,
      image: UrlParser(img),
      newFile: null,
    }));

    const initialZones = [
      {
        zone: coordinator.zone || "",
        year: coordinator.year || "",
        images: formatted,
      },
    ];

    setZones(initialZones);
    setOriginalZones(JSON.parse(JSON.stringify(initialZones))); // ✅ snapshot
    setCurrentZoneIndex(0);
  }, [coordinator]);

  // Initialize Zonal Results data
  useEffect(() => {
    setZonalResultsData(zonalTableData);
    setOriginalZonalResults(zonalTableData);
    setZonalResultsYear(zonalTableYear);
    setOriginalZonalResultsYear(zonalTableYear);
  }, [zonalTableData, zonalTableYear]);

  useEffect(() => {
    const z = zones[currentZoneIndex];
    if (!z) {
      // empty state
      setTempData([]);
      setSavedData([]);
      setZone("");
      setYear("");
      setSavedZone("");
      setSavedYear("");
      return;
    }

    // build formatted arrays same as earlier shape
    const formatted = (z.images || []).map((img, idx) => ({
      id: img.id ?? idx + 1,
      image: img.image ?? "",
      text: `Coordinator Image ${idx + 1}`,
      newFile: img.newFile ?? null,
      isNew: img.isNew ?? false
    }));
    setTempData(formatted);
    setSavedData(formatted);
    setZone(z.zone ?? "");
    setYear(z.year ?? "");
    setSavedZone(z.zone ?? "");
    setSavedYear(z.year ?? "");
    // reset selection & pagination for the newly selected zone
    setSelected([]);
    setCurrentPage(1);
  }, [zones, currentZoneIndex]);

  const handleInputChange = (id, field, value) => {
    setTempData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );

    setChanges((prev) => {
      const existing = prev.find(
        (ch) => ch.type === "coordinator" && ch.id === id && ch.field === field,
      );
      if (existing) return prev;
      return [
        ...prev,
        { type: "coordinator", id, action: "Edited", field, value },
      ];
    });
  };

  const handleImageUpload = (id, file) => {
    const imageUrl = URL.createObjectURL(file);

    const currentImg = zones[currentZoneIndex]?.images?.find((i) => i.id === id);
    const isNew = currentImg?.isNew;

    setTempData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, image: imageUrl, newFile: file } : item
      )
    );

    setZones((prev) =>
      prev.map((z, zIdx) =>
        zIdx === currentZoneIndex
          ? {
            ...z,
            images: z.images.map((img) =>
              img.id === id
                ? { ...img, image: imageUrl, newFile: file }
                : img
            ),
          }
          : z
      )
    );

    upsertChange({
      action: isNew ? "add" : "update",
      section: `ANNA UNIVERSITY ZONE-${zone}`,
      field: "image",
      imageIndex: id,
      newValue: file.name,
      oldValue: isNew ? null : "existing image",
    });
  };

  // Handler for Zonal Results changes
  const handleZonalResultsChange = (newData, newYear) => {
    // Check if data changed
    if (JSON.stringify(newData) !== JSON.stringify(originalZonalResults)) {
      upsertChange({
        action: "update",
        section: "Zonal Results",
        field: "data",
        oldValue: "Previous data",
        newValue: "Updated data"
      });
    }

    // Check if year changed
    if (newYear !== originalZonalResultsYear) {
      upsertChange({
        action: "update",
        section: "Zonal Results",
        field: "year",
        oldValue: originalZonalResultsYear,
        newValue: newYear
      });
    }

    setZonalResultsData(newData);
    setZonalResultsYear(newYear);
  };

  const buildAchievementsPayload = ({ action, newData, oldData, isNewZone = false }) => {

    // 🟢 INSERT (New Zone OR New Image)
    if (action === "add") {
      if (!newData) return null;

      return {
        collectionName: "sports",
        collection_type: "achivements",
        action: "insert",
        title: isNewZone
          ? "Insertion of New Zone Achievements"
          : "Insertion of Achievements",
        category: "coordinator",
        meta_data: {
          zone: newData.zone,
          year: newData.year,
          image_path: newData.image_path || [],
        },
        original_data: null,
      };
    }

    // 🔵 UPDATE
    if (action === "update") {
      if (!newData || !oldData) return null;

      return {
        collectionName: "sports",
        collection_type: "achivements",
        action: "update",
        title: "Updation of Achievements",
        category: "coordinator",
        meta_data: {
          zone: newData.zone,
          year: newData.year,
          image_path: newData.image_path || [],
        },
        original_data: {
          zone: oldData.zone,
          year: oldData.year,
          image_path: oldData.image_path || [],
        },
      };
    }

    // 🔴 DELETE (Image or Whole Zone)
    if (action === "delete") {
      if (!oldData) return null;

      return {
        collectionName: "sports",
        collection_type: "achivements",
        action: "delete",
        title: "Deletion of Achievements",
        category: "coordinator",
        meta_data: {
          zone: oldData.zone,
          year: oldData.year,
          image_path: oldData.image_path || [],
        },
        original_data: null,
      };
    }

    return null;
  };

  const handleAddRow = () => {
    // Use timestamp to guarantee uniqueness even after deletions
    const newId = Date.now();

    const newImage = { id: newId, image: "", newFile: null, isNew: true };

    setTempData((prev) => [...prev, newImage]);

    setZones((prev) =>
      prev.map((z, idx) =>
        idx === currentZoneIndex
          ? { ...z, images: [...z.images, newImage] }
          : z,
      ),
    );

    upsertChange({
      action: "add",
      section: `ANNA UNIVERSITY ZONE-${zone}`,
      field: "image",
      imageIndex: newId,   // unique per new image
      newValue: "New Image",
      oldValue: null,
    });
  };

  const upsertChange = (newChange) => {
    setChanges((prev) => {
      const existingIndex = prev.findIndex(
        (ch) =>
          ch.section === newChange.section &&
          ch.field === newChange.field &&
          ch.imageIndex === newChange.imageIndex  // always compare imageIndex for images
      );

      // add → delete: cancel each other out (same image ID)
      if (
        existingIndex !== -1 &&
        prev[existingIndex]?.action === "add" &&
        newChange.action === "delete"
      ) {
        return prev.filter((_, i) => i !== existingIndex);
      }

      // update → replace with latest
      if (existingIndex !== -1 && newChange.action === "update") {
        const updated = [...prev];
        updated[existingIndex] = newChange;
        return updated;
      }

      // new change (including new "add" with a brand new imageIndex)
      if (existingIndex === -1) {
        return [...prev, newChange];
      }

      return prev;
    });
  };

  const handleDeleteSelected = () => {
    setZones((prevZones) =>
      prevZones.map((z, idx) => {
        if (idx !== currentZoneIndex) return z;

        const remainingImages = z.images.filter(
          (img) => !selected.includes(img.id)
        );

        return { ...z, images: remainingImages };
      })
    );

    setTempData((prev) => prev.filter((item) => !selected.includes(item.id)));

    selected.forEach((id) => {
      const item = tempData.find((i) => i.id === id);

      if (item?.isNew) {
        setChanges((changes) =>
          changes.filter(
            (ch) =>
              !(ch.field === "image" && ch.imageIndex === id && ch.action === "add")
          )
        );
      } else {
        upsertChange({
          action: "delete",
          section: `ANNA UNIVERSITY ZONE-${zone}`,
          field: "image",
          imageIndex: id,
          newValue: null,
          oldValue: `Image ${id}`,
        });
      }
    });

    setSelected([]);
    setShowDeleteModal(false);
  };

  const handleDiscardChanges = () => {
    setChanges([]);
    setSelected([]);

    // Restore coordinator data
    const restoredZones = JSON.parse(JSON.stringify(originalZones));
    setZones(restoredZones);
    const resetIndex = 0;
    setCurrentZoneIndex(resetIndex);

    const restoredZone = restoredZones[resetIndex];
    setZone(restoredZone?.zone || "");
    setYear(restoredZone?.year || "");

    const formattedImages = (restoredZone?.images || []).map((img, idx) => ({
      id: img.id ?? idx + 1,
      image: img.image,
      newFile: null,
    }));
    setTempData(formattedImages);
    setSavedData(formattedImages);
    setSavedZone(restoredZone?.zone || "");
    setSavedYear(restoredZone?.year || "");

    // Restore Zonal Results data
    setZonalResultsData(originalZonalResults);
    setZonalResultsYear(originalZonalResultsYear);

    setEditMode(false);
    setShowRequestButtons(false);
    setShowRequestModal(false);
    setShowDeleteModal(false);

  };

  const handleRevertChange = (change, index) => {
    // Remove change from list
    setChanges((prev) => prev.filter((_, i) => i !== index));

    /* ---------- ZONAL RESULTS ---------- */
    if (change.section === "Zonal Results") {
      if (change.field === "data") {
        setZonalResultsData(originalZonalResults);
      }
      if (change.field === "year") {
        setZonalResultsYear(originalZonalResultsYear);
      }
      return;
    }

    /* ---------- FIND ZONE ---------- */
    const zoneNumber = change.section?.split("ZONE-")[1];

    // Search in CURRENT zones first, fallback to originalZones
    const zoneIndex = zones.findIndex(
      (z) => String(z.zone) === String(zoneNumber)
    );

    // Also find in originalZones
    const originalZoneIndex = originalZones.findIndex(
      (z) => String(z.zone) === String(zoneNumber)
    );

    if (zoneIndex === -1 && change.field !== "new_zone") return;

    const originalZone = originalZones[originalZoneIndex];

    setZones((prevZones) => {
      const updatedZones = [...prevZones];

      switch (change.field) {

        /* ---------- ZONE NAME REVERT ---------- */
        case "zone": {
          updatedZones[zoneIndex] = {
            ...updatedZones[zoneIndex],
            zone: originalZone?.zone ?? change.oldValue,
          };

          // Update UI inputs only if this is the currently viewed zone
          if (zoneIndex === currentZoneIndex) {
            setZone(originalZone?.zone ?? change.oldValue);
            setSavedZone(originalZone?.zone ?? change.oldValue);
          }
          break;
        }

        /* ---------- YEAR REVERT ---------- */
        case "year": {
          updatedZones[zoneIndex] = {
            ...updatedZones[zoneIndex],
            year: originalZone?.year ?? change.oldValue,
          };

          // Update UI inputs only if this is the currently viewed zone
          if (zoneIndex === currentZoneIndex) {
            setYear(originalZone?.year ?? change.oldValue);
            setSavedYear(originalZone?.year ?? change.oldValue);
          }
          break;
        }

        /* ---------- IMAGE REVERT ---------- */
        case "image": {
          if (!originalZone) break;

          setZones((prevZones) => {
            const updatedZones = prevZones.map((z, i) => ({ ...z, images: [...z.images] }));

            if (change.action === "delete") {
              // Find the specific original image and restore ONLY that one
              const originalImg = originalZone.images.find(
                (img) => img.id === change.imageIndex
              );

              if (originalImg) {
                const alreadyExists = updatedZones[zoneIndex].images.find(
                  (img) => img.id === change.imageIndex
                );

                if (!alreadyExists) {
                  // Re-insert at original position
                  const originalPos = originalZone.images.findIndex(
                    (img) => img.id === change.imageIndex
                  );
                  updatedZones[zoneIndex].images.splice(originalPos, 0, {
                    ...originalImg,
                    newFile: null,
                  });
                }
              }
            } else if (change.action === "add") {
              // Undo an add: remove that specific new image
              updatedZones[zoneIndex].images = updatedZones[zoneIndex].images.filter(
                (img) => img.id !== change.imageIndex
              );
            } else if (change.action === "update") {
              // Undo an update: restore original image at that index
              const originalImg = originalZone.images.find(
                (img) => img.id === change.imageIndex
              );
              if (originalImg) {
                updatedZones[zoneIndex].images = updatedZones[zoneIndex].images.map(
                  (img) => img.id === change.imageIndex
                    ? { ...originalImg, newFile: null }
                    : img
                );
              }
            }

            // Sync tempData and savedData if viewing this zone
            if (zoneIndex === currentZoneIndex) {
              setTempData([...updatedZones[zoneIndex].images]);
              setSavedData([...updatedZones[zoneIndex].images]);
            }

            return updatedZones;
          });

          break; // break here, outside setZones
        }

        /* ---------- NEW ZONE REVERT ---------- */
        case "new_zone": {
          // Remove the newly added zone (it's always at the end)
          updatedZones.pop();

          // Navigate back to zone index 0 safely
          const safeIndex = 0;
          setCurrentZoneIndex(safeIndex);

          // Sync inputs to zone at safeIndex
          const fallbackZone = updatedZones[safeIndex];
          if (fallbackZone) {
            setZone(fallbackZone.zone ?? "");
            setYear(fallbackZone.year ?? "");
            setSavedZone(fallbackZone.zone ?? "");
            setSavedYear(fallbackZone.year ?? "");

            const restoredImages = (fallbackZone.images || []).map((img, idx) => ({
              id: img.id ?? idx + 1,
              image: img.image ?? "",
              newFile: null,
              isNew: img.isNew ?? false,
            }));

            setTempData(restoredImages);
            setSavedData(restoredImages);
          }
          break;
        }

        default:
          break;
      }

      return updatedZones;
    });
  };
  const handleCancel = () => {
    setEditMode(false);
    setSelected([]);
    setShowDiscardModal(false);
    setShowDeleteModal(false);
  };

  // Fixed: Added zone changes with actual values
  const handleZoneChange = (e) => {
    const value = e.target.value;

    setZone(value);
    updateCurrentZone({ zone: value });

    setChanges((prev) => {
      const sectionName = `ANNA UNIVERSITY ZONE-${savedZone}`;

      const existingIndex = prev.findIndex(
        (ch) => ch.field === "zone"
      );

      // If zone change already exists → update it
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          newValue: value,
        };
        return updated;
      }

      // Otherwise add new change
      return [
        ...prev,
        {
          action: "update",
          section: sectionName,
          field: "zone",
          oldValue: savedZone,
          newValue: value,
        },
      ];
    });
  };

  // Fixed: Added year changes with actual values
  const handleYearChange = (e) => {
    const value = e.target.value;

    setYear(value);
    updateCurrentZone({ year: value });

    setChanges((prev) => {
      const existing = prev.find(
        (ch) =>
          ch.field === "year" &&
          ch.section === `ANNA UNIVERSITY ZONE-${zone}`
      );

      if (existing) {
        return prev.map((ch) =>
          ch.field === "year" &&
            ch.section === `ANNA UNIVERSITY ZONE-${zone}`
            ? { ...ch, newValue: value }
            : ch
        );
      }

      return [
        ...prev,
        {
          action: "update",
          section: `ANNA UNIVERSITY ZONE-${zone}`,
          field: "year",
          oldValue: savedYear,   // always original value
          newValue: value,
        },
      ];
    });
  };

  // Fixed: Updated handleSave to include actual values
  const handleSave = () => {
    if (!zone || !year) {

      return;
    }

    const newChanges = [];
    const sectionName = `ANNA UNIVERSITY ZONE-${zone}`;

    const isNewZone = !savedZone || savedZone === "" || savedYear === "";
    if (!isNewZone) {
      if (zone !== savedZone) {
        newChanges.push({
          action: "update",
          section: sectionName,
          field: "zone",
          oldValue: savedZone,
          newValue: zone
        });
      }

      if (year !== savedYear) {
        newChanges.push({
          action: "update",
          section: sectionName,
          field: "year",
          oldValue: savedYear,
          newValue: year
        });
      }
    }

    // Check for Zonal Results changes
    if (JSON.stringify(zonalResultsData) !== JSON.stringify(originalZonalResults)) {
      newChanges.push({
        action: "update",
        section: "Zonal Results",
        field: "data",
        oldValue: "Previous data",
        newValue: "Updated data"
      });
    }

    if (zonalResultsYear !== originalZonalResultsYear) {
      newChanges.push({
        action: "update",
        section: "Zonal Results",
        field: "year",
        oldValue: originalZonalResultsYear,
        newValue: zonalResultsYear
      });
    }

    setSavedZone(zone);
    setSavedYear(year);
    setSavedData(tempData);

    setChanges((prev) => [...newChanges, ...prev]);
    setEditMode(false);
    setShowRequestButtons(true);
  };

  const handleFinalRequestConfirm = async () => {
    if (!changes.length) {

      return;
    }

    const payload = [];
    const files = [];

    changes.forEach((change) => {
      if (change.section === "Zonal Results") {
        console.log("Zonal Results change:", change);
        return;
      }

      const zoneNumber = change.section?.split("ZONE-")[1];

      const zoneIndex = zones.findIndex(
        (z) => String(z.zone) === String(zoneNumber)
      );

      const currentZone = zones[zoneIndex];
      const originalZone = originalZones[zoneIndex];

      if (!currentZone) return;

      /* ---------------- NEW ZONE ---------------- */

      if (change.field === "new_zone") {
        const imagePaths = [];

        currentZone.images.forEach((img) => {
          if (img.newFile) {
            const path = `/static/images/sports/coordinates/${img.newFile.name}`;
            imagePaths.push(path);
            files.push(img.newFile);
          } else if (img.image) {
            imagePaths.push(img.image);
          }
        });

        const req = buildAchievementsPayload({
          action: "add",
          isNewZone: true,
          newData: {
            zone: currentZone.zone,
            year: currentZone.year,
            image_path: imagePaths,
          },
        });

        if (req) payload.push(req);
        return;
      }

      /* ---------------- IMAGE CHANGES ---------------- */

      if (change.field === "image") {
        const imagePaths = currentZone.images.map((img) => {
          if (img.newFile) {
            return `/static/images/sports/coordinates/${img.newFile.name}`;
          }

          // remove S3 base url if present
          return img.image.replace(BASE_URL, "");
        });

        const oldPaths =
          originalZone?.images?.map((img) =>
            img.image.replace(BASE_URL, "")
          ) || [];

        const req = buildAchievementsPayload({
          action: change.action,
          newData: {
            zone: currentZone.zone,
            year: currentZone.year,
            image_path: imagePaths,
          },
          oldData: {
            zone: originalZone?.zone,
            year: originalZone?.year,
            image_path: oldPaths,
          },
        });

        if (req) payload.push(req);

        currentZone.images.forEach((img) => {
          if (img.newFile) files.push(img.newFile);
        });

        return;
      }

      /* ---------------- ZONE / YEAR UPDATE ---------------- */

      if (change.field === "zone" || change.field === "year") {
        const req = buildAchievementsPayload({
          action: "update",
          newData: {
            zone: currentZone.zone,
            year: currentZone.year,
            image_path:
              currentZone.images?.map((img) => img.image) || [],
          },
          oldData: {
            zone: originalZone?.zone,
            year: originalZone?.year,
            image_path:
              originalZone?.images?.map((img) => img.image) || [],
          },
        });

        if (req) payload.push(req);
      }
    });

    console.log("📦 ACHIEVEMENTS PAYLOAD:", payload);
    console.log("🖼 FILES:", files);
    const result = await sendRequest(payload, files);

    if (result) {
      // Close modal
      setShowRequestModal(false);

      // Exit edit mode
      setEditMode(false);

      // Hide request buttons
      setShowRequestButtons(false);

      // Clear pending changes
      setChanges([]);
      setSelected([]);

      // Save current state as the new original state
      setOriginalZones(JSON.parse(JSON.stringify(zones)));

      setSavedData([...tempData]);
      setSavedZone(zone);
      setSavedYear(year);

      setOriginalZonalResults(
        JSON.parse(JSON.stringify(zonalResultsData))
      );
      setOriginalZonalResultsYear(zonalResultsYear);
    }
  };

  const updateCurrentZone = (updates) => {
    setZones((prev) =>
      prev.map((z, idx) =>
        idx === currentZoneIndex ? { ...z, ...updates } : z,
      ),
    );
  };

  const handleZoneClick = (zoneType) => {
    setShowZone(zoneType);
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = tempData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.max(1, Math.ceil(tempData.length / rowsPerPage));

  // Fixed: Removed duplicate infinite property
  const sliderSettings = {
    dots: true,
    infinite: savedData.length > 1,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    arrows: true,
  };

  const addNewZoneAndSwitch = () => {
    const newZoneNumber = zones.length + 1;

    setZones((prev) => [
      ...prev,
      { zone: newZoneNumber, year: "", images: [] },
    ]);

    setChanges((prev) => [
      ...prev,
      {
        action: "add",
        section: `ANNA UNIVERSITY ZONE-${newZoneNumber}`,
        field: "new_zone",
        newValue: `Zone ${newZoneNumber}`,
        oldValue: null
      },
    ]);

    setCurrentZoneIndex(zones.length);
    setZone(newZoneNumber);
    setYear("");
    setTempData([]);
  };

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />
      <div className="admin-controls-ug flex justify-end mb-2 mr-8">
        {!editMode && (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg mr-20 mt-4"
            onClick={() => {
              setEditMode(true);
            }}
          >
            <Pencil size={16} /> Edit
          </button>
        )}
      </div>

      {data ? (
        <>
          {!editMode && (
            <div className={`${styles.achievementsContainer} relative`}>
              <h2 className={styles.sportscoordinator}>
                Anna University Zone {savedZone}
              </h2>
              <p className={styles.coordinatordes}>
                Co-ordinating Centre {savedYear}
              </p>
              <div className="relative w-[700px] m-auto">
                {savedData.length > 0 && (
                  <Slider {...sliderSettings}>
                    {savedData.map((item, index) => (
                      <div key={item.id ?? index}>
                        <img src={item.image} className="m-auto" alt={`Coordinator ${index + 1}`} />
                      </div>
                    ))}
                  </Slider>
                )}
              </div>
            </div>
          )}

          <div className="relative mr-8 ml-8 justify-center mb-7">
            {/* Zone navigation buttons commented out */}
          </div>

          {editMode && (
            <div className="overflow-x-auto border rounded-lg shadow-md p-4 bg-white dark:bg-gray-800">
              <div className="flex flex-col gap-3 mb-6">
                {/* <div>
                  <button
                    onClick={addNewZoneAndSwitch}
                    className="inline-flex items-center gap-1 px-3 py-1 font-semibold rounded-md  ml-70 bg-secd text-text hover:bg-brwn hover:text-prim"
                  >
                    <Plus size={14} />
                    Add new zone
                  </button>
                </div> */}
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Anna University Zone
                  </label>
                  <input
                    type="number"
                    value={zone}
                    onChange={handleZoneChange} // Fixed: Using the new handler
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
                    onChange={handleYearChange} // Fixed: Using the new handler
                    className="border p-2 rounded w-full"
                  />
                </div>
              </div>

              <table className="w-full justify-items-center m-auto border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="p-2 border">Image</th>
                    <th className="p-2 border">Select</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((item) => (
                    <tr key={item.id} className="border ml-4">
                      <td className="p-2 flex border items-center gap-2">
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
                      <td className="p-2 text-center border">
                        <input
                          type="checkbox"
                          checked={selected.includes(item.id)}
                          onChange={() =>
                            setSelected((prev) =>
                              prev.includes(item.id)
                                ? prev.filter((s) => s !== item.id)
                                : [...prev, item.id],
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-center mt-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="px-3 text-white py-1 bg-yellow-500 rounded "
                >
                  Prev
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="px-3 text-white py-1 bg-yellow-500 rounded"
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

          {editMode && (
            <div className="flex justify-end gap-2 mt-4 mr-12">
              <button
                onClick={handleCancel}
                className="px-4 py-1 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>

              {/* Save button now shows when ANY changes exist */}
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg"
              >
                <Save size={16} /> Save
              </button>
            </div>
          )}

          {!editMode && hasChanges && showRequestButtons && (
            <div className="flex justify-end gap-3 mt-6 mb-4 mr-12">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
                onClick={() => {
                  setShowDiscardModal(true)
                }}
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

          <div className="flex flex-wrap gap-6 justify-center items-center mb-6">
            <button
              className={`font-bold rounded-md px-4 py-2 ${showZone === "zone"
                  ? "bg-brwn text-white"
                  : "bg-secd text-black"
                }`}
              onClick={() => handleZoneClick("zone")}
            >
              Zone
            </button>
            <button
              className={`font-bold rounded-md px-4 py-2 ${showZone === "interzone"
                  ? "bg-brwn text-white"
                  : "bg-secd text-black"
                }`}
              onClick={() => handleZoneClick("interzone")}
            >
              Inter Zone
            </button>
            <button
              className={`font-bold rounded-md px-4 py-2 ${showZone === "others"
                  ? "bg-brwn text-white"
                  : "bg-secd text-black"
                }`}
              onClick={() => handleZoneClick("others")}
            >
              Others
            </button>
          </div>

          <div ref={sectionRef}>
            {showZone === "zone" ? (
              <div className="sport-zone-container mb-10">
                <ZonalResults
                  data={zonalResultsData}
                  year={zonalResultsYear}
                  onDataChange={handleZonalResultsChange}
                  editMode={editMode}
                />
                <WinnerSlider data={zoneWinnerData} />
              </div>
            ) : showZone === "interzone" ? (
              <div className="sport-zone-container mb-10">
                <InterZone data={interZonalData} />
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

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
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

      {showDiscardModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white p-6 rounded-xl w-[400px]">
            <h2 className="text-lg font-semibold mb-4">Discard Changes?</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to discard all your changes? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDiscardModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDiscardChanges();
                  setShowDiscardModal(false);
                }}
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[750px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 dark:text-white text-black">
              Request Changes
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the
              superior admin. Once approved, they will go live.
            </p>

            <table className="w-full text-sm text-black dark:text-white border">
              <thead className="bg-gray-100 dark:bg-gray-700 text-center">
                <tr>
                  <th className="py-2 border">Action</th>
                  <th className="py-2 border">Section</th>
                  <th className="py-2 border">Changes</th>
                  <th className="py-2 border">Undo</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((change, index) => (
                  <tr key={index} className="border text-center">
                    <td className="py-2 border text-blue-600 font-semibold">
                      {change.action === "add" && "Added"}
                      {change.action === "delete" && "Deleted"}
                      {change.action === "update" && "Updated"}
                    </td>
                    <td className="py-2 border">{change.section}</td>
                    <td className="py-2 border">
                      {change.field === "zone" && (
                        <span className="px-2 py-1 bg-yellow-100 text-black rounded-md block">
                          Zone: {change.oldValue} → {change.newValue}
                        </span>
                      )}
                      {change.field === "year" && change.section !== "Zonal Results" && (
                        <span className="px-2 py-1 bg-yellow-100 text-black rounded-md block">
                          Year: {change.oldValue} → {change.newValue}
                        </span>
                      )}
                      {change.field === "year" && change.section === "Zonal Results" && (
                        <span className="px-2 py-1 bg-yellow-100 text-black rounded-md block">
                          Zonal Results Year: {change.oldValue} → {change.newValue}
                        </span>
                      )}
                      {change.field === "data" && (
                        <span className="px-2 py-1 bg-yellow-100 text-black rounded-md block">
                          Zonal Results Data Updated
                        </span>
                      )}
                      {change.field === "new_zone" && (
                        <span className="px-2 py-1 bg-yellow-100 text-black rounded-md block">
                          New Zone Added: {change.newValue}
                        </span>
                      )}
                      {change.field === "image" && (
                        <span className="px-2 py-1 bg-yellow-100 text-black rounded-md block">
                          Image - {change.imageIndex} {change.action === "delete" ? "🗑️ Deleted" : change.action === "add" ? "➕ Added" : "✏️ Updated"}
                        </span>
                      )}
                    </td>
                    <td className="py-2 border">
                      <button
                        onClick={() => handleRevertChange(change, index)}
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
                onClick={handleFinalRequestConfirm}
                disabled={loadings}
                className={`flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg ${loadings ? "cursor-progress" : ""
                  }`}
              >
                {loadings ? "Processing..." : "Final Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Achievements1;