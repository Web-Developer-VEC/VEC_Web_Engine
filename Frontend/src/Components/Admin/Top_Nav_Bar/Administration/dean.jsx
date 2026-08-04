import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dean.css";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import {
  Pencil,
  Trash2,
  Plus,
  Save,
  Send,
  X,
  PlusCircle,
  XCircle,
  Edit2,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

const deepCopy = (v) => structuredClone(v);

const Dean = ({ theme, toggle }) => {
  const [deanData, setDeanData] = useState([]);
  const [committedData, setCommittedData] = useState([]);
  const [pendingData, setPendingData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [previewImgs, setPreviewImgs] = useState({});
  const [loading, setLoading] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});

  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { sendRequest, loading: requestLoading, error } = useAdminRequest();

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    if (!path) return "/placeholder.jpg";
    return path?.startsWith("http") ||
      path?.startsWith("blob") ||
      path?.startsWith("data:")
      ? path
      : `${BASE_URL}${path}`;
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`/api/main-backend/administration`, {
          type: "dean_and_association",
        });

        const data = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        // Add stable IDs to each member
        const dataWithIds = data.map((category, idx) => ({
          ...category,
          id: category.id ?? `cat-${idx}`,
          selected: false,
          members:
            category.members?.map((member, midx) => ({
              ...member,
              id: member?.id ?? `mem-${Date.now()}-${midx}`,
              selected: false,
            })) || [],
        }));

        setDeanData(deepCopy(dataWithIds));
        setCommittedData(deepCopy(dataWithIds));
        setLoading(false);
      } catch (error) {
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
        }
        setLoading(true);
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

  const validateBeforeRequest = () => {
    const errors = {};
    let hasError = false;

    deanData.forEach((category, catIdx) => {
      // ✅ CATEGORY NAME REQUIRED
      if (!category.category?.trim()) {
        errors[`category_${catIdx}`] = "Category name is required";
        hasError = true;
      }

      category.members.forEach((member, memIdx) => {
        // Name
        if (!member.name?.trim()) {
          errors[`name_${catIdx}_${memIdx}`] = "Name is required";
          hasError = true;
        }

        // Type
        if (!member.type?.trim()) {
          errors[`type_${catIdx}_${memIdx}`] = "Type is required";
          hasError = true;
        }

        // Designation
        if (!member.designation?.trim()) {
          errors[`designation_${catIdx}_${memIdx}`] = "Designation is required";
          hasError = true;
        }

        // ✅ IMAGE (new OR existing)
        const hasExistingImage =
          typeof member.image_path === "string" &&
          member.image_path.trim() !== "" &&
          !member.image_path.startsWith("blob:");

        const hasNewImage = member.image_file instanceof File;

        if (!hasExistingImage && !hasNewImage) {
          errors[`image_${catIdx}_${memIdx}`] = "Image is required";
          hasError = true;
        }
      });
    });

    setFieldErrors(errors);

    // If there are errors, show toast and scroll to first error
    if (hasError) {
      toast.error(
        "Please fill all required fields (marked in red) include category name",
      );

      // Scroll to first error field after a short delay
      setTimeout(() => {
        const firstErrorKey = Object.keys(errors)[0];
        if (firstErrorKey) {
          const [_, catIdx, memIdx] = firstErrorKey.split("_");
          const element = document.querySelector(
            `[data-error-field="${firstErrorKey}"]`,
          );
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.focus();
          }
        }
      }, 100);
    }

    return !hasError;
  };

  const handleSave = () => {
    const changes = getChanges();

    if (changes.length === 0) {
      toast.info("No changes to save");
      return;
    }

    // Validate before saving
    const isValid = validateBeforeRequest();
    if (!isValid) {
      return;
    }

    setPendingData(deepCopy(deanData));
    setIsSaved(true);
    setIsEditing(false);
    setIsDirty(false);
    setSelectedItems({});
    setFieldErrors({});
  };

  const handleStartEdit = () => {
    const baseData =
      pendingData.length > 0 ? deepCopy(pendingData) : deepCopy(committedData);
    setDeanData(deepCopy(baseData));
    setIsEditing(true);
    setIsDirty(false);
    setIsSaved(false);
    setSelectedItems({});
    setPreviewImgs({});
    setFieldErrors({});
  };

  const handleChangeMember = (categoryIndex, memberIndex, key, value) => {
    const updatedData = deanData.map((category, catIdx) => {
      if (catIdx !== categoryIndex) return category;

      return {
        ...category,
        members: category.members.map((member, memIdx) => {
          if (memIdx !== memberIndex) return member;
          return { ...member, [key]: value };
        }),
      };
    });

    setDeanData(updatedData);
    setIsDirty(true);

    // Clear error for this field when user starts typing
    const errorKey = `${key}_${categoryIndex}_${memberIndex}`;
    if (fieldErrors[errorKey]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleImageChange = (categoryIndex, memberIndex, file) => {
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    const category = deanData[categoryIndex];
    const member = category.members[memberIndex];
    const key = `${category.id}-${member.id}`;

    setPreviewImgs((prev) => ({ ...prev, [key]: previewUrl }));

    const updatedData = deanData.map((category, catIdx) => {
      if (catIdx !== categoryIndex) return category;

      return {
        ...category,
        members: category.members.map((member, memIdx) => {
          if (memIdx !== memberIndex) return member;
          return {
            ...member,
            image_file: file,
            image_path: `/static/images/deans/${file.name}`,
          };
        }),
      };
    });

    setDeanData(updatedData);
    setIsDirty(true);
  };

  const handleAddMember = (categoryIndex) => {
    const category = deanData[categoryIndex];

    // 🚫 Limit reached
    if (category.members.length >= 2) {
      toast.warning("Only 2 members are allowed per category");
      return;
    }

    const newMember = {
      id: `temp-${Date.now()}-${Math.random()}`,
      name: "",
      type: "",
      designation: "",
      image_path: "",
      image_file: null,
      selected: false,
      isTemp: true, // Add this flag to identify temporary empty members
    };

    const updatedData = deanData.map((cat, idx) => {
      if (idx !== categoryIndex) return cat;
      return {
        ...cat,
        members: [...cat.members, newMember],
      };
    });

    setDeanData(updatedData);
    setIsDirty(true);
  };
  const handleItemSelect = (categoryIndex, memberIndex) => {
    
    const category = deanData[categoryIndex];

    if (category.members.length === 1) {
        toast.warning("At least one member must remain in this category.");
        return;
    }
    const key = `${categoryIndex}-${memberIndex}`;

    const updatedData = deanData.map((category, catIdx) => {
      if (catIdx !== categoryIndex) return category;

      return {
        ...category,
        members: category.members.map((member, memIdx) => {
          if (memIdx !== memberIndex) {
            return { ...member, selected: member.selected };
          }
          return { ...member, selected: !member.selected };
        }),
      };
    });

    setDeanData(updatedData);

    setSelectedItems((prev) => {
      const newSelected = { ...prev };
      if (newSelected[key]) {
        delete newSelected[key];
      } else {
        newSelected[key] = { categoryIndex, memberIndex };
      }
      return newSelected;
    });
  };

  const confirmDelete = () => {
    let updatedData = [...deanData];

    // First, remove selected members from categories
    updatedData = updatedData.map((category) => ({
      ...category,
      members: category.members.filter((member) => !member.selected),
    }));

    // Then remove empty categories AND categories that are selected
    updatedData = updatedData.filter(
      (category) => !category.selected && category.members.length > 0,
    );

    setDeanData(updatedData);
    setSelectedItems({});
    setShowDeleteModal(false);
    setIsDirty(true);
  };

  const handleCancel = () => {
    if (pendingData.length > 0) {
      setDeanData(deepCopy(pendingData));
      setIsSaved(true);
    } else {
      setDeanData(deepCopy(committedData));
      setIsSaved(false);
    }

    setIsEditing(false);
    setIsDirty(false);
    setSelectedItems({});
    setPreviewImgs({});
    setFieldErrors({});
  };

  const handleDiscard = () => {
    setDeanData(deepCopy(committedData));
    setPendingData([]);
    setIsSaved(false);
    setIsDirty(false);
    setSelectedItems({});
    setPreviewImgs({});
    setFieldErrors({});
  };

  const handleRequest = () => {
    setShowRequestModal(true);
  };

  const cleanImageFields = (obj) => {
    if (!obj) return obj;
    const cleaned = { ...obj };
    delete cleaned.image_file;
    delete cleaned.selected;

    if (cleaned.image_path?.startsWith("blob:")) {
      cleaned.image_path = undefined;
    }

    return cleaned;
  };

  const getChanges = () => {
    const changes = [];

    // Create maps for easier lookup
    const committedCategoryMap = new Map();
    committedData.forEach((cat) => {
      committedCategoryMap.set(cat.id, cat);
    });

    const currentCategoryMap = new Map();
    (pendingData.length ? pendingData : deanData).forEach((cat) => {
      currentCategoryMap.set(cat.id, cat);
    });

    // Find deleted categories (in committed but not in current)
    committedData.forEach((committedCategory) => {
      if (!currentCategoryMap.has(committedCategory.id)) {
        changes.push({
          action: "delete",
          section: committedCategory.category,
          changes: `Deleted category ${committedCategory.category}`,
          categoryName: committedCategory.category,
          deleteType: "container",
        });
      }
    });

    // Find added categories and modified categories
    (pendingData.length ? pendingData : deanData).forEach(
      (currentCategory, catIdx) => {
        const committedCategory = committedCategoryMap.get(currentCategory.id);

        if (!committedCategory) {
          // Entire category was added - only add if it has non-empty members
          const hasValidMembers = currentCategory.members.some(
            (member) =>
              member.name?.trim() ||
              member.type?.trim() ||
              member.designation?.trim() ||
              member.image_path,
          );

          if (hasValidMembers) {
            currentCategory.members.forEach((member, memIdx) => {
              // Only add if member has some data
              if (
                member.name?.trim() ||
                member.type?.trim() ||
                member.designation?.trim() ||
                member.image_path
              ) {
                changes.push({
                  action: "insert",
                  section: currentCategory.category,
                  changes: `${member.type || "Member"}: ${member.name || "New Member"}`,
                  itemId: member.id,
                  categoryIndex: catIdx,
                  memberIndex: memIdx,
                });
              }
            });
          }
        } else {
          // Compare members within existing category
          const committedMemberMap = new Map(
            committedCategory.members.map((m) => [m.id, m]),
          );
          const currentMemberMap = new Map(
            currentCategory.members.map((m) => [m.id, m]),
          );

          // Find deleted members (in committed but not in current)
          committedCategory.members.forEach((member, memIdx) => {
            if (!currentMemberMap.has(member.id)) {
              changes.push({
                action: "delete",
                section: currentCategory.category,
                changes: `${member.type}: ${member.name || "Member"}`,
                itemId: member.id,
                categoryIndex: catIdx,
                memberIndex: memIdx,
              });
            }
          });

          // Find added and edited members
          currentCategory.members.forEach((member, memIdx) => {
            const committedMember = committedMemberMap.get(member.id);

            if (!committedMember) {
              // New member - only add if it has data
              if (
                member.name?.trim() ||
                member.type?.trim() ||
                member.designation?.trim() ||
                member.image_path
              ) {
                changes.push({
                  action: "insert",
                  section: currentCategory.category,
                  changes: `${member.type || "Member"}: ${member.name || "New Member"}`,
                  itemId: member.id,
                  categoryIndex: catIdx,
                  memberIndex: memIdx,
                });
              }
            } else {
              // Check if member was edited (only if it has actual changes)
              const isEdited =
                committedMember.name !== member.name ||
                committedMember.designation !== member.designation ||
                committedMember.type !== member.type ||
                committedMember.image_path !== member.image_path;

              // Only count as edit if there are actual changes AND member has data
              const hasData =
                member.name?.trim() ||
                member.type?.trim() ||
                member.designation?.trim() ||
                member.image_path;

              if (isEdited && hasData) {
                changes.push({
                  action: "update",
                  section: currentCategory.category,
                  changes: `${member.type || "Member"}: ${member.name || "Member"}`,
                  itemId: member.id,
                  categoryIndex: catIdx,
                  memberIndex: memIdx,
                });
              }

              // Check if category name was changed
              if (committedCategory.category !== currentCategory.category) {
                changes.push({
                  action: "update",
                  section: committedCategory.category,
                  changes: `Category renamed to ${currentCategory.category}`,
                  categoryId: currentCategory.id,
                });
              }
            }
          });
        }
      },
    );

    return changes;
  };
  const buildPayload = () => {
    const changes = getChanges();

    const resolveImagePath = (m) => {
      if (!m) return "";
      if (m.image_file instanceof File) {
        return `/static/images/dean_and_associates/${m.image_file.name}`;
      }
      return m.image_path || "";
    };

    return changes
      .map((change) => {
        /* =========================
       🟢 INSERT
    ========================== */
        if (change.action === "insert") {
          const category = deanData[change.categoryIndex];
          if (!category) return null;

          const member = category.members?.[change.memberIndex];
          if (!member) return null;

          return {
            collectionName: "administration",
            collection_type: "dean_and_association",
            action: "insert",
            title: "insert dean_and_association",
            category: change.section,
            meta_data: {
              name: member.name,
              type: member.type,
              designation: member.designation,
              image_path: resolveImagePath(member),
              unique_id: member.unique_id,
            },
          };
        }

        /* =========================
       🟡 UPDATE
    ========================== */
        if (change.action === "update") {
          // Changed from "Edited" to "update"
          const category = deanData[change.categoryIndex];
          const committedCategory = committedData[change.categoryIndex];

          if (!category || !committedCategory) return null;

          const member = category.members?.[change.memberIndex];
          const committedMember = committedCategory.members?.find(
            (m) => m.id === change.itemId,
          );

          if (!member || !committedMember) return null;

          return {
            collectionName: "administration",
            collection_type: "dean_and_association",
            action: "update",
            title: "update dean_and_association",
            category: change.section,
            original_data: {
              name: committedMember.name,
              type: committedMember.type,
              designation: committedMember.designation,
              image_path: committedMember.image_path,
              unique_id: committedMember.unique_id,
            },
            meta_data: {
              name: member.name,
              type: member.type,
              designation: member.designation,
              image_path: resolveImagePath(member),
              unique_id: member.unique_id,
            },
          };
        }

        /* =========================
       🔴 DELETE
    ========================== */
        if (change.action === "delete") {
          // ALWAYS read from committedData
          const committedCategory = committedData.find(
            (c) => c.category === change.section,
          );

          if (!committedCategory) return null;

          // 🔴 DELETE ENTIRE CATEGORY
          if (change.deleteType === "container") {
            return {
              collectionName: "administration",
              collection_type: "dean_and_association",
              action: "delete",
              title: "delete dean_and_association",
              category: change.section,
              meta_data: {
                category: committedCategory.category,
                members: committedCategory.members.map((m) => ({
                  name: m.name,
                  type: m.type,
                  designation: m.designation,
                  image_path: m.image_path || "",
                  unique_id: m.unique_id,
                })),
              },
            };
          }

          // 🔴 DELETE SINGLE MEMBER
          const committedMember = committedCategory.members.find(
            (m) => m.id === change.itemId,
          );

          if (!committedMember) return null;

          return {
            collectionName: "administration",
            collection_type: "dean_and_association",
            action: "delete",
            title: "delete dean_and_association",
            category: change.section,
            meta_data: {
              name: committedMember.name,
              type: committedMember.type,
              designation: committedMember.designation,
              image_path: committedMember.image_path || "",
              unique_id: committedMember.unique_id,
            },
          };
        }

        return null;
      })
      .filter(Boolean);
  };

  const handleFinalRequestConfirm = async () => {
    if (pendingData.length === 0) return;

    // 🚫 validate again
    const isValid = validateBeforeRequest();
    if (!isValid) {
      toast.error("Fix validation errors before submitting");
      return;
    }

    const payload = buildPayload();
    const files = [];

    deanData.forEach((category) => {
      category.members.forEach((member) => {
        if (
          member.image_file &&
          member.image_file.name &&
          member.image_file.size
        ) {
          files.push(member.image_file);
        }
      });
    });

    console.log(payload);

    try {
      await sendRequest(payload, files);
      toast.success("Request sent successfully!");

      setCommittedData(deepCopy(pendingData));
      setPendingData([]);
      setIsSaved(false);
      setShowRequestModal(false);
      setFieldErrors({});
    } catch (err) {
      toast.error("Failed to submit request");
    }
  };

  const revertChange = (itemId) => {
    // Find and revert the specific change
    const changes = getChanges();
    const changeToRevert = changes.find((c) => c.itemId === itemId);

    if (!changeToRevert) return;

    if (changeToRevert.action === "insert") {
      // Remove added member
      const updatedPendingData = pendingData.map((category, catIdx) => {
        if (catIdx !== changeToRevert.categoryIndex) return category;
        return {
          ...category,
          members: category.members.filter((m) => m.id !== itemId),
        };
      });
      setPendingData(updatedPendingData);
      setDeanData(updatedPendingData);
    } else if (changeToRevert.action === "delete") {
      // Restore deleted member from committed
      const committedMember = committedData[
        changeToRevert.categoryIndex
      ]?.members?.find((m) => m.id === itemId);

      if (committedMember) {
        const updatedPendingData = pendingData.map((category, catIdx) => {
          if (catIdx !== changeToRevert.categoryIndex) return category;

          // Check if already exists
          if (category.members.some((m) => m.id === itemId)) return category;

          return {
            ...category,
            members: [...category.members, deepCopy(committedMember)],
          };
        });
        setPendingData(updatedPendingData);
        setDeanData(updatedPendingData);
      }
    } else if (changeToRevert.action === "update") {
      // Revert to original
      const committedMember = committedData[
        changeToRevert.categoryIndex
      ]?.members?.find((m) => m.id === itemId);

      if (committedMember) {
        const updatedPendingData = pendingData.map((category, catIdx) => {
          if (catIdx !== changeToRevert.categoryIndex) return category;

          return {
            ...category,
            members: category.members.map((m) =>
              m.id === itemId ? deepCopy(committedMember) : m,
            ),
          };
        });
        setPendingData(updatedPendingData);
        setDeanData(updatedPendingData);
      }
    }

    // If no changes left, clear pending data
    const remainingChanges = getChanges();
    if (remainingChanges.length === 0) {
      setPendingData([]);
      setIsSaved(false);
    }

    // Clear any errors related to this item
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((key) => {
        if (key.includes(itemId)) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };
  const changes = getChanges();

  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={""} />
      </div>
    );
  }

  const handleAddCategory = () => {
    const newCategory = {
      id: `cat-${Date.now()}`,
      category: "",
      selected: false,
      isNew: true,
      members: [],
    };

    setDeanData((prev) => [...prev, newCategory]);
    setIsDirty(true);
  };

  const handleCategorySelect = (categoryIndex) => {
    setDeanData((prev) =>
      prev.map((cat, idx) => {
        if (idx !== categoryIndex) return cat;

        const newSelected = !cat.selected;

        return {
          ...cat,
          selected: newSelected,
          members: cat.members.map((m) => ({
            ...m,
            selected: newSelected,
          })),
        };
      }),
    );

    // Update selectedItems to reflect the change
    setSelectedItems((prev) => {
      const newSelected = { ...prev };
      const category = deanData[categoryIndex];

      // Remove all members of this category if category is being deselected
      // Or add all members if category is being selected
      category.members.forEach((_, memIdx) => {
        const key = `${categoryIndex}-${memIdx}`;
        if (category.selected) {
          // Category was already selected, now deselecting
          delete newSelected[key];
        } else {
          // Category wasn't selected, now selecting
          newSelected[key] = { categoryIndex, memberIndex: memIdx };
        }
      });

      return newSelected;
    });
  };

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/administrationbanner.webp"
        headerText="Deans & Associate Deans"
        subHeaderText="Shaping the future through leadership, collaboration, and academic excellence."
      />

      <ToastContainer position="bottom-right" autoClose={3000} />

      <div className="deancontainer">
        {/* Edit Button (only when not editing) */}
        {!isEditing && (
          <div className="flex justify-end gap-3 pt-4 pr-10">
            <button
              onClick={handleStartEdit}
              className="flex items-center gap-2 px-4 py-2 bg-secd dark:bg-drks text-text dark:text-prim rounded hover:bg-accn hover:text-prim dark:hover:bg-brwn"
            >
              <Pencil size={18} /> Edit
            </button>
          </div>
        )}

        <div className="de-container font-[poppins]">
          {deanData.map((categoryBlock, categoryIndex) => (
            <div
              key={categoryBlock.id}
              className={`
                de-box min-w-[20vw] relative
                bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]
                ${Object.keys(fieldErrors).some((key) => key.includes(`_${categoryIndex}_`)) ? "border-2 border-red-500 shake" : ""}
              `}
            >
              {/* {isEditing && (
                <input
                  type="checkbox"
                  checked={categoryBlock.selected || false}
                  onChange={() => handleCategorySelect(categoryIndex)}
                  className="absolute top-3 left-3 w-5 h-5 z-10"
                />
              )} */}

              {isEditing && categoryBlock.isNew ? (
                <input
                  type="text"
                  value={categoryBlock.category}
                  onChange={(e) =>
                    setDeanData((prev) =>
                      prev.map((cat, idx) =>
                        idx === categoryIndex
                          ? { ...cat, category: e.target.value }
                          : cat,
                      ),
                    )
                  }
                  className={`de-heading w-full bg-transparent border-b outline-none
                    ${
                      fieldErrors[`category_${categoryIndex}`]
                        ? "border-red-500 bg-red-50"
                        : "border-gray-400"
                    }`}
                  placeholder="Category name"
                  data-error-field={`category_${categoryIndex}`}
                />
              ) : (
                <h1 className="de-heading text-accn dark:text-drkt font-[poppins]">
                  {categoryBlock.category}
                </h1>
              )}

              {/* Add Member Button (only in edit mode) */}
              {isEditing && (
                <button
                  onClick={() => handleAddMember(categoryIndex)}
                  disabled={categoryBlock.members.length >= 2}
                  className={`
                    absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded
                    ${
                      categoryBlock.members.length >= 2
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-secd dark:bg-drks text-text dark:text-prim hover:bg-accn hover:text-prim dark:hover:bg-brwn"
                    }
                  `}
                >
                  <Plus size={16} />
                  Add
                </button>
              )}

              {/* Profiles Section */}
              <div className="de-content">
                {categoryBlock.members?.length > 0 && (
                  <div className="de-profiles-section flex flex-wrap lg:flex-nowrap justify-center gap-4 w-full font-[poppins]">
                    {categoryBlock.members.map((member, memberIndex) => (
                      <div
                        key={member.id}
                        className="relative font-[poppins] de-profile bg-prim dark:bg-drkp w-full lg:w-[26vw] border-2 border-secd dark:border-drks"
                      >
                        {/* Selection Checkbox (only in edit mode) */}
                        {isEditing && (
                          <input
                            type="checkbox"
                            checked={member.selected || false}
                            onChange={() =>
                              handleItemSelect(categoryIndex, memberIndex)
                            }
                            className="absolute top-2 left-2 z-10 w-5 h-5"
                          />
                        )}

                        <div className="">
                          <div className="">
                            <img
                              src={
                                previewImgs[`${categoryBlock.id}-${member.id}`]
                                  ? previewImgs[
                                      `${categoryBlock.id}-${member.id}`
                                    ]
                                  : member?.image_path
                                    ? UrlParser(member.image_path)
                                    : "/placeholder-image.jpg"
                              }
                              alt={member.name || "Dean"}
                            />
                          </div>

                          {/* Image Upload (only in edit mode) */}
                          {isEditing && (
                            <label className="gap-1 px-3 py-1 bg-secd dark:bg-drks text-text dark:text-prim rounded hover:bg-accn hover:text-prim dark:hover:bg-brwn mt-2 cursor-pointer inline-block">
                              {member?.image_path ? "Replace" : "Upload"}
                              <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp"
                                className="hidden"
                                onChange={(e) =>
                                  handleImageChange(
                                    categoryIndex,
                                    memberIndex,
                                    e.target.files?.[0],
                                  )
                                }
                              />
                            </label>
                          )}
                        </div>

                        {/* Member Details */}
                        <div className="de-profile-details font-[poppins]">
                          {isEditing ? (
                            <>
                              <input
                                type="text"
                                value={member.name || ""}
                                onChange={(e) =>
                                  handleChangeMember(
                                    categoryIndex,
                                    memberIndex,
                                    "name",
                                    e.target.value,
                                  )
                                }
                                className={`w-full p-1 mb-1 border rounded ${fieldErrors[`name_${categoryIndex}_${memberIndex}`] ? "border-red-500 bg-red-50" : ""}`}
                                placeholder="Name"
                                data-error-field={`name_${categoryIndex}_${memberIndex}`}
                              />
                              {fieldErrors[
                                `name_${categoryIndex}_${memberIndex}`
                              ] && (
                                <p className="text-red-500 text-xs mb-1">
                                  {
                                    fieldErrors[
                                      `name_${categoryIndex}_${memberIndex}`
                                    ]
                                  }
                                </p>
                              )}

                              <input
                                type="text"
                                value={member.type || ""}
                                onChange={(e) =>
                                  handleChangeMember(
                                    categoryIndex,
                                    memberIndex,
                                    "type",
                                    e.target.value,
                                  )
                                }
                                className={`w-full p-1 mb-1 border rounded ${fieldErrors[`type_${categoryIndex}_${memberIndex}`] ? "border-red-500 bg-red-50" : ""}`}
                                placeholder="Type (e.g., Dean, Associate Dean)"
                                data-error-field={`type_${categoryIndex}_${memberIndex}`}
                              />
                              {fieldErrors[
                                `type_${categoryIndex}_${memberIndex}`
                              ] && (
                                <p className="text-red-500 text-xs mb-1">
                                  {
                                    fieldErrors[
                                      `type_${categoryIndex}_${memberIndex}`
                                    ]
                                  }
                                </p>
                              )}

                              <input
                                type="text"
                                value={member.designation || ""}
                                onChange={(e) =>
                                  handleChangeMember(
                                    categoryIndex,
                                    memberIndex,
                                    "designation",
                                    e.target.value,
                                  )
                                }
                                className={`w-full p-1 border rounded ${fieldErrors[`designation_${categoryIndex}_${memberIndex}`] ? "border-red-500 bg-red-50" : ""}`}
                                placeholder="Designation"
                                data-error-field={`designation_${categoryIndex}_${memberIndex}`}
                              />
                              {fieldErrors[
                                `designation_${categoryIndex}_${memberIndex}`
                              ] && (
                                <p className="text-red-500 text-xs mt-1">
                                  {
                                    fieldErrors[
                                      `designation_${categoryIndex}_${memberIndex}`
                                    ]
                                  }
                                </p>
                              )}
                            </>
                          ) : (
                            <>
                              <strong>{member.name}</strong>
                              <br />
                              <span>{member.type}</span>
                              <br />
                              <span className="text-text dark:text-drka">
                                {member.designation}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isEditing && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleAddCategory}
                className="
                  flex items-center gap-2
                  px-5 py-2
                  rounded-lg
                  bg-secd dark:bg-drks
                  text-text dark:text-prim
                  hover:bg-accn hover:text-prim
                  dark:hover:bg-brwn
                  transition
                "
              >
                <PlusCircle size={18} />
                Add New Category
              </button>
            </div>
          )}
        </div>

        {/* Action Delete Buttons */}
        {isEditing && (
          <div className="flex justify-center gap-4 mt-8">
            {deanData.reduce(
              (count, cat) =>
                count +
                (cat.selected
                  ? 1
                  : cat.members.filter((m) => m.selected).length),
              0,
            ) > 0 && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 size={18} />
                Delete Selected (
                {deanData.reduce(
                  (count, cat) =>
                    count +
                    (cat.selected
                      ? 1
                      : cat.members.filter((m) => m.selected).length),
                  0,
                )}
                )
              </button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end gap-4 m-8 pr-9">
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            {getChanges().length > 0 && (
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim flex items-center gap-2"
              >
                <Save size={18} />
                Save
              </button>
            )}
          </div>
        )}

        {isSaved && !isEditing && (
          <div className="flex justify-end gap-4 m-8 pr-9">
            <button
              onClick={handleDiscard}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Discard Changes
            </button>

            {changes.length > 0 && (
              <button
                onClick={handleRequest}
                className="px-6 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim flex items-center gap-2"
              >
                <Send size={18} />
                Request
              </button>
            )}
          </div>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white p-6 rounded-xl w-[600px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Final Request
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the
              superior admin. Once approved will go live.
            </p>
            {changes.length > 0 ? (
              <table className="w-full text-center text-sm border">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border p-2">Action</th>
                    <th className="border p-2">Section</th>
                    <th className="border p-2">Changes</th>
                    <th className="border p-2">Undo</th>
                  </tr>
                </thead>
                <tbody>
                  {changes.map((ch, i) => (
                    <tr key={i}>
                      <td className="border p-2 text-blue-600">{ch.action}</td>
                      <td className="border p-2">{ch.section}</td>
                      <td className="border p-2">{ch.changes}</td>
                      <td className="border p-2">
                        <button
                          onClick={() => revertChange(ch.itemId)}
                          className="p-1 rounded hover:bg-gray-100"
                          title="Revert this change"
                        >
                          <X size={16} className="text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-600">No changes detected.</p>
            )}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-600 text-white"
              >
                Cancel
              </button>
              {changes.length > 0 && (
                <button
                  onClick={handleFinalRequestConfirm}
                  className="px-6 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim flex items-center gap-2"
                  disabled={requestLoading}
                >
                  <Send size={18} />{" "}
                  {requestLoading ? "Sending..." : "Final Request"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg border w-[90%] max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              {deanData.reduce(
                (count, cat) =>
                  count +
                  (cat.selected
                    ? 1
                    : cat.members.filter((m) => m.selected).length),
                0,
              )}{" "}
              selected member
              {deanData.reduce(
                (count, cat) =>
                  count +
                  (cat.selected
                    ? 1
                    : cat.members.filter((m) => m.selected).length),
                0,
              ) > 1
                ? "s"
                : ""}
              ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dean;
