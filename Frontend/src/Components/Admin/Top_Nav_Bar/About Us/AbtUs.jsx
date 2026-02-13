import React, { useEffect, useMemo, useState } from "react";
import { Plus, Eye, X } from "lucide-react";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import axios from "axios";
import ScrollToTopButton from "../../ScrollToTopButton";
import "./AbtUs.css";
import { useNavigate } from "react-router";
import { useAdminRequest } from "../../../hooks/useAdminRequest";
import { toast, ToastContainer } from "react-toastify";

const AdminAbtUs = ({ theme, toggle }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();

  const [loading, setLoading] = useState({ img1: true, img2: true, img3: true });
  const [abtUsData, setAbtUsData] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Editable fields
  const [editedContent, setEditedContent] = useState("");
  const [editedImages, setEditedImages] = useState({ 0: null, 1: null, 2: null }); // File replacements only
  const [pdfLinks, setPdfLinks] = useState([]); // objects {name,url,file?}

  // Change tracking
  const [changed, setChanged] = useState(false);
  const [savedChanges, setSavedChanges] = useState(false);

  // Modal states
  const [showPdfModal, setShowPdfModal] = useState({
    open: false,
    index: null,
    name: "",
    file: null,
    error: "",
  });
  const [selectedPdfs, setSelectedPdfs] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Snapshots
  const [editSessionSnapshot, setEditSessionSnapshot] = useState(null);
  const [postSaveSnapshot, setPostSaveSnapshot] = useState(null);

  // Baseline snapshot for a pending request cycle
  const [pendingBaselineSnapshot, setPendingBaselineSnapshot] = useState(null);

  const secTtl = "Velammal Engineering College";
  const secSub = "An Autonomous Institution";
  const secCnt =
    "We stand for innovation, with our diverse community of scholars and engineers dedicated to making a positive impact at local, national, and global levels.";

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) => (path?.startsWith("http") ? path : `${BASE_URL}${path}`);

  const { sendRequest, loading: reqLoading } = useAdminRequest();

  // -------------------- helpers --------------------
  const deepClone = (value) => {
    if (typeof structuredClone === "function") {
      try {
        return structuredClone(value);
      } catch {
        // fall through
      }
    }
    const seen = new WeakMap();
    const cloneRec = (v) => {
      if (v === null || typeof v !== "object") return v;
      if (v instanceof File) return v;
      if (v instanceof Date) return new Date(v.getTime());
      if (v instanceof Blob) return v;

      if (seen.has(v)) return seen.get(v);

      if (Array.isArray(v)) {
        const arr = [];
        seen.set(v, arr);
        v.forEach((item, i) => (arr[i] = cloneRec(item)));
        return arr;
      }

      const obj = {};
      seen.set(v, obj);
      Object.keys(v).forEach((k) => (obj[k] = cloneRec(v[k])));
      return obj;
    };
    return cloneRec(value);
  };

  // Prevent "fake" content diffs from newline/space differences
  const normalizeText = (s) => {
    if (s == null) return "";
    return String(s)
      .replace(/\r\n/g, "\n")
      .replace(/\u00A0/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/[ \t]+\n/g, "\n")
      .trim();
  };

  // NEW: Normalize/convert content between backend array <-> UI string
  const contentArrayToString = (content) => {
    if (Array.isArray(content)) return content.filter((x) => x != null).map(String).join("\n");
    if (content == null) return "";
    return String(content);
  };

  const contentStringToArray = (content) => {
    if (Array.isArray(content)) return content;
    const s = normalizeText(content);
    if (!s) return [];
    // Split into array items like Mongo: one paragraph per non-empty line
    return s
      .split("\n")
      .map((line) => normalizeText(line))
      .filter(Boolean);
  };

  const makeSafeFileName = (file) => {
    if (!file) return "";
    const ts = Date.now();
    const name = file.name.replace(/\s+/g, "_");
    return `${ts}_${name}`;
  };

  const normalizePdfLinksFromBackend = (data) => {
    const pdfSource = data?.about_us_pdf || data?.links || data?.about_us || data?.pdfs || [];
    let initialPdfLinks = [];

    if (Array.isArray(pdfSource) && pdfSource.length > 0) {
      if (
        typeof pdfSource[0] === "object" &&
        (pdfSource[0].name || pdfSource[0].pdf_path || pdfSource[0].url)
      ) {
        initialPdfLinks = pdfSource.map((item, idx) => ({
          name: item.name || `Document ${idx + 1}`,
          url: item.pdf_path || item.pdf || item.url || "",
          file: null,
        }));
      } else {
        initialPdfLinks = pdfSource.map((url, idx) => ({
          name: `Document ${idx + 1}`,
          url: url || "",
          file: null,
        }));
      }
    } else {
      const linksArray = data?.links || [];
      initialPdfLinks = [
        { name: "Document 1", url: linksArray?.[0] || "", file: null },
        { name: "Document 2", url: linksArray?.[1] || "", file: null },
        { name: "Document 3", url: linksArray?.[2] || "", file: null },
        { name: "Document 4", url: linksArray?.[3] || "", file: null },
      ];
    }

    return initialPdfLinks;
  };

  const getCurrentSnapshot = () => ({
    content: editedContent,
    images: { ...editedImages }, // Files only
    pdfLinks: pdfLinks.map((p) => ({ ...p })),
  });

  // Baseline that represents current backend values
  const baselineFromBackend = useMemo(() => {
    return {
      content: contentArrayToString(abtUsData?.content),
      images: { 0: null, 1: null, 2: null },
      pdfLinks: normalizePdfLinksFromBackend(abtUsData || {}).map((p) => ({ ...p })),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abtUsData]);

  const pdfIdentity = (p) => {
    if (!p) return "empty";
    if (p.file instanceof File) {
      return `file:${p.file.name}|${p.file.size}|${p.file.type}|${p.file.lastModified}|name:${p.name || ""}`;
    }
    return `url:${p.url || ""}|name:${p.name || ""}`;
  };

  // -------------------- PDF modal --------------------
  const openPdfModal = (index = null) => {
    if (index === null) {
      setShowPdfModal({ open: true, index: null, name: "", file: null, error: "" });
    } else {
      const item = pdfLinks[index] || { name: "", url: "" };
      setShowPdfModal({ open: true, index, name: item.name || "", file: null, error: "" });
    }
  };

  const closePdfModal = () =>
    setShowPdfModal({ open: false, index: null, name: "", file: null, error: "" });

  const savePdfModal = () => {
    const { index, name, file } = showPdfModal;

    if (!name) {
      setShowPdfModal((s) => ({ ...s, error: "Please enter a PDF name." }));
      return;
    }

    if (index === null && !(file instanceof File)) {
      setShowPdfModal((s) => ({ ...s, error: "Please upload a PDF file." }));
      return;
    }

    if (index === null) {
      setPdfLinks((prev) => [...prev, { name, url: "", file }]);
    } else {
      setPdfLinks((prev) =>
        prev.map((pdf, i) => (i === index ? { ...pdf, name, file: file || pdf.file || null } : pdf))
      );
    }

    setChanged(true);
    setSavedChanges(false);
    closePdfModal();
  };

  const openModalPdfInNewTab = () => {
    if (showPdfModal.file instanceof File) {
      const blobUrl = URL.createObjectURL(showPdfModal.file);
      window.open(blobUrl, "_blank");
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      return;
    }
    if (showPdfModal.index !== null && pdfLinks[showPdfModal.index]?.url) {
      window.open(UrlParser(pdfLinks[showPdfModal.index].url), "_blank");
    }
  };

  // selection delete
  const toggleSelectPdf = (index) => {
    setSelectedPdfs((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  };

  const handleDeleteSelected = () => setShowDeleteConfirm(true);

  const confirmDeleteSelected = () => {
    // Defensive: stable deletion regardless of order
    const selectedSet = new Set(selectedPdfs);
    setPdfLinks((prev) => prev.filter((_, idx) => !selectedSet.has(idx)));

    setSelectedPdfs([]);
    setChanged(true);
    setSavedChanges(false);
    setShowDeleteConfirm(false);
  };

  // -------------------- request rows (only changes) --------------------
  const requestRows = useMemo(() => {
    const baseline = pendingBaselineSnapshot || baselineFromBackend;
    const current = postSaveSnapshot || getCurrentSnapshot();

    const rows = [];

    // content (normalized to avoid false positives)
    if (normalizeText(baseline.content) !== normalizeText(current.content)) {
      rows.push({
        key: "content",
        action: "update",
        section: "About VEC Content",
        changes: "Content modified",
        applyUndo: (curr) => ({ ...curr, content: baseline.content || "" }),
      });
    }

    // images - only if File exists
    [0, 1, 2].forEach((i) => {
      if (current.images?.[i]) {
        rows.push({
          key: `img-${i}`,
          action: "update",
          section: `About VEC Image ${i + 1}`,
          changes: "Image replaced",
          applyUndo: (curr) => ({ ...curr, images: { ...curr.images, [i]: null } }),
        });
      }
    });

    // pdfs - by index
    const basePdfs = Array.isArray(baseline.pdfLinks) ? baseline.pdfLinks : [];
    const currPdfs = Array.isArray(current.pdfLinks) ? current.pdfLinks : [];
    const maxLen = Math.max(basePdfs.length, currPdfs.length);

    for (let i = 0; i < maxLen; i++) {
      const b = basePdfs[i] || null;
      const c = currPdfs[i] || null;

      if (!b && c) {
        rows.push({
          key: `pdf-add-${i}-${c?.name || ""}`,
          action: "insert",
          section: "PDF Document",
          changes: c?.name || `Document ${i + 1}`,
          applyUndo: (curr) => {
            const next = deepClone(curr);
            next.pdfLinks = (next.pdfLinks || []).filter((_, idx) => idx !== i);
            return next;
          },
        });
      } else if (b && !c) {
        rows.push({
          key: `pdf-del-${i}-${b?.name || ""}`,
          action: "delete",
          section: "PDF Document",
          changes: b?.name || `Document ${i + 1}`,
          applyUndo: (curr) => {
            const next = deepClone(curr);
            const arr = Array.isArray(next.pdfLinks) ? [...next.pdfLinks] : [];
            arr.splice(i, 0, deepClone(b));
            next.pdfLinks = arr;
            return next;
          },
        });
      } else if (b && c) {
        if (pdfIdentity(b) !== pdfIdentity(c)) {
          rows.push({
            key: `pdf-upd-${i}-${c?.name || ""}`,
            action: "update",
            section: "PDF Document",
            changes: c?.name || b?.name || `Document ${i + 1}`,
            applyUndo: (curr) => {
              const next = deepClone(curr);
              const arr = Array.isArray(next.pdfLinks) ? [...next.pdfLinks] : [];
              arr[i] = deepClone(b);
              next.pdfLinks = arr;
              return next;
            },
          });
        }
      }
    }

    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingBaselineSnapshot, baselineFromBackend, postSaveSnapshot, editedContent, editedImages, pdfLinks]);

  // NEW: when request modal has no changes, return to original page state
  const resetPendingUiState = () => {
    setShowRequestModal(false);
    setSavedChanges(false);
    setChanged(false);
    setPostSaveSnapshot(null);
    setPendingBaselineSnapshot(null);
  };

  // Auto close modal + hide Request/Discard if empty
  useEffect(() => {
    if (showRequestModal && requestRows.length === 0) {
      resetPendingUiState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRequestModal, requestRows.length]);

  const undoRow = (row) => {
    const current = postSaveSnapshot || getCurrentSnapshot();
    const updated = row.applyUndo ? row.applyUndo(deepClone(current)) : current;

    setEditedContent(updated.content || "");
    setEditedImages({ ...(updated.images || { 0: null, 1: null, 2: null }) });
    setPdfLinks(Array.isArray(updated.pdfLinks) ? updated.pdfLinks.map((p) => ({ ...p })) : []);

    setPostSaveSnapshot(deepClone(updated));
    setSavedChanges(true);
    setChanged(true);
  };

  // -------------------- backend request build/send --------------------
  const buildBackendRepresentation = (oldData, newSnapshot) => {
    const oldImagePaths = oldData?.image_path || [];
    const oldPdfArray = oldData?.about_us_pdf || oldData?.links || oldData?.pdfs || [];

    const newImagePaths = [];
    for (let i = 0; i < 3; i++) {
      const newFile = newSnapshot?.images?.[i];
      if (newFile) {
        const safeName = makeSafeFileName(newFile);
        newImagePaths[i] = `/static/images/about_us/${safeName}`;
      } else {
        newImagePaths[i] = oldImagePaths?.[i] || "";
      }
    }

    const newPdfArray = (newSnapshot?.pdfLinks || []).map((pdf) => {
      if (pdf?.file instanceof File) {
        const safeName = makeSafeFileName(pdf.file);
        return { name: pdf.name || "", pdf_path: `/static/pdfs/about_us/${safeName}` };
      }
      return { name: pdf.name || "", pdf_path: pdf.url || "" };
    });

    const originalPdfArrayNormalized = [];
    if (Array.isArray(oldPdfArray)) {
      oldPdfArray.forEach((item) => {
        if (typeof item === "string") originalPdfArrayNormalized.push({ name: "", pdf_path: item });
        else if (item && typeof item === "object") {
          originalPdfArrayNormalized.push({
            name: item.name || "",
            pdf_path: item.pdf_path || item.pdf || item.url || "",
          });
        } else originalPdfArrayNormalized.push({ name: "", pdf_path: "" });
      });
    }

    return {
      newBackend: {
        content: contentStringToArray(newSnapshot?.content || ""),
        image_path: newImagePaths,
        about_us_pdf: newPdfArray,
      },
      oldBackend: {
        content: Array.isArray(oldData?.content) ? oldData.content : contentStringToArray(oldData?.content || ""),
        image_path: oldImagePaths,
        about_us_pdf: originalPdfArrayNormalized,
      },
    };
  };

  const buildEntriesAndFiles = (oldData, newSnapshot) => {
    const { newBackend, oldBackend } = buildBackendRepresentation(oldData, newSnapshot);
    const entries = [];
    const filesToSend = [];

    if (JSON.stringify(oldBackend.content || []) !== JSON.stringify(newBackend.content || [])) {
      entries.push({
        collectionName: "about_us",
        collection_type: "about_vec",
        action: "update",
        title: "Update About VEC Content",
        category: "content",
        meta_data: { content: newBackend.content },
        original_data: { content: oldBackend.content },
      });
    }

    for (let i = 0; i < 3; i++) {
      const newFile = newSnapshot.images?.[i];
      const oldPath = oldBackend.image_path?.[i] || "";
      const newPath = newBackend.image_path?.[i] || "";
      if (newFile) {
        const safeName = makeSafeFileName(newFile);
        const renamed = new File([newFile], safeName, { type: newFile.type });
        filesToSend.push(renamed);

        entries.push({
          collectionName: "about_us",
          collection_type: "about_vec",
          action: "update",
          title: `Update About VEC Image ${i + 1}`,
          category: "about_us",
          meta_data: { image_path: newPath },
          original_data: { image_path: oldPath },
        });
      }
    }

    const oldPdfList = oldBackend.about_us_pdf || [];
    const newPdfList = newBackend.about_us_pdf || [];
    const maxLen = Math.max(oldPdfList.length, newPdfList.length);

    for (let i = 0; i < maxLen; i++) {
      const oldItem = oldPdfList[i] || null;
      const newItem = newPdfList[i] || null;
      const snapPdf = (newSnapshot.pdfLinks || [])[i] || null;

      if (oldItem && !newItem) {
        entries.push({
          collectionName: "about_us",
          collection_type: "about_vec",
          action: "delete",
          title: `Delete About VEC PDF ${oldItem.name || i + 1}`,
          category: "about_us_pdf",
          meta_data: { name: oldItem.name || "", pdf_path: "" },
          original_data: { name: oldItem.name || "", pdf_path: oldItem.pdf_path || "" },
        });
      } else if (!oldItem && newItem) {
        entries.push({
          collectionName: "about_us",
          collection_type: "about_vec",
          action: "insert",
          title: `Add About VEC PDF ${newItem.name || i + 1}`,
          category: "about_us_pdf",
          meta_data: { name: newItem.name || "", pdf_path: newItem.pdf_path || "" },
          original_data: {},
        });

        if (snapPdf?.file instanceof File) {
          const safeName = makeSafeFileName(snapPdf.file);
          const renamed = new File([snapPdf.file], safeName, { type: snapPdf.file.type });
          filesToSend.push(renamed);
        }
      } else if (oldItem && newItem) {
        const nameChanged = (oldItem.name || "") !== (newItem.name || "");
        const pathChanged = (oldItem.pdf_path || "") !== (newItem.pdf_path || "");
        const fileUploaded = snapPdf?.file instanceof File;

        if (nameChanged || pathChanged || fileUploaded) {
          entries.push({
            collectionName: "about_us",
            collection_type: "about_vec",
            action: "update",
            title: `Update About VEC PDF ${newItem.name || i + 1}`,
            category: "about_us_pdf",
            meta_data: { name: newItem.name || "", pdf_path: newItem.pdf_path || "" },
            original_data: { name: oldItem.name || "", pdf_path: oldItem.pdf_path || "" },
          });

          if (fileUploaded) {
            const safeName = makeSafeFileName(snapPdf.file);
            const renamed = new File([snapPdf.file], safeName, { type: snapPdf.file.type });
            filesToSend.push(renamed);
          }
        }
      }
    }

    return { entries, filesToSend };
  };

  const confirmRequest = async () => {
    const oldData = abtUsData || {};
    const newSnapshot = postSaveSnapshot || getCurrentSnapshot();

    const { entries, filesToSend } = buildEntriesAndFiles(oldData, newSnapshot);

    if (!entries.length) {
      toast.info("No changes detected to request.");
      resetPendingUiState();
      return;
    }

    try {
      const result = await sendRequest(entries, filesToSend.length ? filesToSend : null);

      if (result?.success) {
        const { newBackend } = buildBackendRepresentation(oldData, newSnapshot);

        const updatedBackend = {
          ...oldData,
          content: newBackend.content,
          image_path: newBackend.image_path,
          about_us_pdf: newBackend.about_us_pdf,
        };

        setAbtUsData(updatedBackend);

        resetPendingUiState();
      } else {
        if (result?.status === 429 || result?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: result?.message || result?.data?.message || "Rate limit exceeded" },
          });
          return;
        }
        toast.error(result?.message || "Failed to submit request.");
      }
    } catch (err) {
      console.error("Error sending admin request", err);
      toast.error("Request failed.");
    }
  };

  // -------------------- fetch + online --------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const responce = await axios.post("/api/main-backend/about_us", { type: "about_vec" });
        const data = responce.data.data;

        setAbtUsData(data);
        setEditedContent(contentArrayToString(data.content));

        const initialPdfLinks = normalizePdfLinksFromBackend(data);
        setPdfLinks(initialPdfLinks.map((p) => ({ ...p })));

        setEditSessionSnapshot(null);
        setPostSaveSnapshot(null);
        setPendingBaselineSnapshot(null);

        setChanged(false);
        setSavedChanges(false);
      } catch (error) {
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", { state: { msg: error.response.data.message } });
        } else {
          console.error(error);
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

  // -------------------- edit flow --------------------
  const handleEditClick = () => {
    setEditSessionSnapshot(getCurrentSnapshot());
    setEditMode(true);
    setChanged(false);
    setSelectedPdfs([]);
  };

  const handleCancel = () => {
    if (changed) setShowCancelConfirm(true);
    else {
      setEditMode(false);
      setChanged(false);
    }
  };

  const handleSave = () => {
    if (!pendingBaselineSnapshot) {
      setPendingBaselineSnapshot(deepClone(baselineFromBackend));
    }

    const snap = getCurrentSnapshot();
    setPostSaveSnapshot(deepClone(snap));
    setSavedChanges(true);
    setChanged(false);
    setEditMode(false);
    setSelectedPdfs([]);
  };

  const handleDiscardAll = () => setShowDiscardConfirm(true);

  // -------------------- render --------------------
  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
  }

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/aboutvec.webp"
        headerText="About VEC"
        subHeaderText="A center for academic excellence and innovation, nurturing minds to create a brighter future through education and empowerment."
      />
      <ToastContainer position="bottom-right" />

      {abtUsData ? (
        <>
          <div className="relative">
            {!editMode && (
              <button
                onClick={handleEditClick}
                className="absolute top-4 right-12 bg-secd hover:bg-yellow-500 font-semibold text-black px-3 py-2 rounded flex items-center gap-2"
              >
                Edit
              </button>
            )}
          </div>

          <div className="flex m-8">
            <div className="flex relative w-full max-h-[100vh]">
              <div className="relative grow p-4 font-[Poppins] mt-14 basis-3/4 z-10 bg-[#ffffffa] backdrop-blur-[16px] lg:bg-none lg:backdrop-blur-0 rounded-xl">
                <p className="text-[32px] text-center font-[Poppins]">{secTtl}</p>
                <p className="text-[24px] font-bold text-accn dark:text-drkt text-center font-[Poppins]">
                  {secSub}
                </p>
                <p className="text-[16px] text-center mt-4 text-justify font-[Poppins]">{secCnt}</p>
              </div>

              <div className="absolute lg:relative w-[110vw] h-[40vh] left-[-16vw] top-[20%] lg:left-0 lg:top-10 md:opacity-0 opacity-30 lg:opacity-100">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`absolute ${
                      i === 0
                        ? "w-[40%] h-[60%] right-[15%] rounded-tl-[3rem] rounded-br-[3rem]"
                        : i === 1
                        ? "w-[40%] h-[90%] left-[15%] top-[10%] rounded-bl-[3rem]"
                        : "w-[25%] h-[40%] left-[40%] top-[45%] rounded-tl-[3rem] rounded-br-[3rem]"
                    } border-[2vmin] border-white overflow-hidden`}
                  >
                    {loading[`img${i + 1}`] && (
                      <div className="absolute inset-0 flex justify-center items-center">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}

                    <img
                      className={`absolute w-full h-full object-cover transition-opacity duration-500 ${
                        loading[`img${i + 1}`] ? "opacity-0" : "opacity-100"
                      }`}
                      src={
                        editedImages[i]
                          ? URL.createObjectURL(editedImages[i])
                          : UrlParser(abtUsData?.image_path?.[i])
                      }
                      alt={`Banner Image${i}`}
                      onLoad={() => setLoading((prev) => ({ ...prev, [`img${i + 1}`]: false }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-8 p-10 transition-all duration-300 ease-in-out">
            <div className="flex mt-4 flex-col justify-center px-2 lg:px-12 w-full">
              {editMode ? (
                <textarea
                  value={editedContent}
                  onChange={(e) => {
                    setEditedContent(e.target.value);
                    setChanged(true);
                    setSavedChanges(false);
                  }}
                  className="w-full h-40 p-2 border border-black rounded"
                />
              ) : (
                <p className="text-[16px] lg:text-[16px] text-justify font-[Poppins] leading-relaxed tracking-wide">
                  {Array.isArray(abtUsData?.content) ? abtUsData?.content?.join("\n") : abtUsData?.content}
                </p>
              )}
            </div>
          </div>

          {/* PDF Links */}
          <div className="m-2 p-2 font-[Poppins]">
            <div className="pdf-links grid grid-cols-1 md:grid-cols-1 md:flex flex-wrap justify-center gap-6 w-fit mx-auto text-left">
              {pdfLinks.map((pdf, index) => {
                const hasSelection = selectedPdfs.length > 0;
                const isSelected = selectedPdfs.includes(index);

                return (
                  // pdf conrtainer 
                  <div
                    key={index}
                    className={`relative md:px-1 md:py-1 md:text-[16px] flex items-center justify-center px-3 py-3 rounded-xl bg-secd text-text hover:bg-accn hover:text-white ${
                      editMode ? "scale-110" : ""
                    } ${editMode ? "cursor-pointer" : "cursor-pointer"} ${
                      editMode && isSelected ? "ring-2 ring-red-500" : ""
                    }`}
                    // IMPORTANT: Only allow opening edit modal when not in "multi-select" mode
                    onClick={
                      editMode && !hasSelection
                        ? () => openPdfModal(index)
                        : undefined
                    }
                    style={{ position: "relative" }}
                  >
                    {pdf.name}

                    {editMode && (
                      // Stop propagation on wrapper too
                      <div
                        className="absolute top-1 right-2 flex items-center gap-1 z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleSelectPdf(index);
                          }}
                          className="custom-checkbox w-4 h-3"
                        />
                      </div>
                    )}

                    {!editMode && (
                      <div
                        className="absolute left-0 top-0 w-full h-full"
                        onClick={() => window.open(UrlParser(pdf.url), "_blank")}
                      />
                    )}
                  </div>
                );
              })}

              {editMode && (
                <div
                  className="relative cursor-pointer flex items-center justify-center w-32 h-16 border-2 border-dashed border-gray-400 rounded-xl"
                  onClick={() => openPdfModal(null)}
                >
                  <Plus size={20} />
                </div>
              )}

              {/* AISHE link */}
              <div
                className={`relative cursor-pointer md:px-1 md:py-1 md:text-[16px] flex items-center justify-center px-3 py-3 rounded-xl bg-secd text-text hover:bg-accn hover:text-white ${
                  editMode ? "scale-110" : ""
                }`}
                onClick={() => {
                  if (!editMode) navigate("/abt-yr");
                }}
              >
                AISHE
              </div>
            </div>

            {editMode && selectedPdfs.length > 0 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleDeleteSelected}
                  className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded flex items-center gap-2 shadow-lg"
                >
                  Delete Selected
                </button>
              </div>
            )}
          </div>

          <div className="w-full">
            {editMode && (
              <div className="flex justify-end gap-4 p-4 mr-5">
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
              <div className="flex justify-end gap-4 p-4 mr-5">
                <button
                  onClick={handleDiscardAll}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                  disabled={reqLoading}
                >
                  Discard All Changes
                </button>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="bg-secd hover:bg-yellow-500 text-black px-4 py-2 rounded"
                  disabled={reqLoading}
                >
                  Request
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
          <LoadComp txt={""} />
        </div>
      )}

      {/* PDF Modal */}
      {showPdfModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96 flex flex-col items-center">
            <h2 className="text-lg font-bold mb-4">{showPdfModal.index === null ? "Add PDF" : "Edit PDF"}</h2>

            <input
              type="text"
              placeholder="Name"
              value={showPdfModal.name}
              onChange={(e) => setShowPdfModal((s) => ({ ...s, name: e.target.value }))}
              className="w-full border p-2 mb-4 rounded"
            />

            <div className="flex items-center gap-2 mb-4">
              <label className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded cursor-pointer">
                {showPdfModal.index === null ? "Upload PDF" : "Replace PDF"}
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => setShowPdfModal((s) => ({ ...s, file: e.target.files?.[0] || null }))}
                />
              </label>

              <button title="Preview PDF" className="p-1 text-blue-400" onClick={openModalPdfInNewTab}>
                <Eye size={20} />
              </button>
            </div>

            {showPdfModal.error && <p className="text-red-600 text-sm mb-2">{showPdfModal.error}</p>}

            <div className="flex justify-end gap-3 w-full">
              <button onClick={closePdfModal} className="px-3 py-1 bg-gray-400 text-white rounded">
                Cancel
              </button>
              <button onClick={savePdfModal} className="px-3 py-1 bg-secd text-black rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[450px]">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">Final Request for the Changes</h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin. Once approved, they will be applied
              automatically to the live site.
            </p>

            <div className="max-h-[200px] overflow-y-auto mb-4">
              <table className="w-full text-left text-text dark:text-drkt">
                <thead>
                  <tr>
                    <th className="py-1">Action</th>
                    <th className="py-1">Section</th>
                    <th className="py-1">Changes</th>
                    <th className="py-1">Undo</th>
                  </tr>
                </thead>
                <tbody>
                  {requestRows.map((r) => (
                    <tr key={r.key}>
                      <td className="py-1">
                        {r.action === "insert" && <span className="text-green-600">+ Added</span>}
                        {r.action === "update" && <span className="text-blue-600">✎ Edited</span>}
                        {r.action === "delete" && <span className="text-red-600">– Deleted</span>}
                      </td>
                      <td className="py-1">{r.section}</td>
                      <td className="py-1">{r.changes}</td>
                      <td className="py-1">
                        <button type="button" onClick={() => undoRow(r)} disabled={reqLoading} title="Undo this change">
                          <X />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRequestModal(false)}
                className={`px-4 py-2 rounded bg-gray-400 text-white ${reqLoading ? "cursor-not-allowed" : ""}`}
                disabled={reqLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmRequest}
                className={`px-4 py-2 rounded bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt ${
                  reqLoading ? "cursor-progress" : "hover:bg-[#800000]"
                }`}
                disabled={reqLoading}
              >
                {reqLoading ? "Processing..." : "Final Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal (you already had states; add UI if you want) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[1100]">
          <div className="bg-white p-6 rounded shadow-lg w-[380px]">
            <h3 className="text-lg font-bold mb-2">Delete selected PDFs?</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will remove {selectedPdfs.length} item(s) from the list (pending until Request).
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-400 text-white"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white"
                onClick={confirmDeleteSelected}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ScrollToTopButton />
    </>
  );
};

export default AdminAbtUs;