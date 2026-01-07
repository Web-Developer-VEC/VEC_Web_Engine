import React, { useEffect, useState } from 'react';
import { Plus, Eye } from 'lucide-react';
import Banner from '../../Banner';
import LoadComp from '../../LoadComp';
import axios from 'axios';
import ScrollToTopButton from '../../ScrollToTopButton';
import "./AbtUs.css";
import { useNavigate } from "react-router";
import { useAdminRequest } from '../../../hooks/useAdminRequest';
import { toast } from 'react-toastify';

const AdminAbtUs = ({ theme, toggle }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();
  const [loading, setLoading] = useState({ img1: true, img2: true, img3: true });
  const [abtUsData, setAbtUsData] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Editable fields
  const [editedContent, setEditedContent] = useState("");
  const [editedImages, setEditedImages] = useState({ 0: null, 1: null, 2: null });
  const [pdfLinks, setPdfLinks] = useState([]);

  // Change tracking
  const [changed, setChanged] = useState(false);
  const [savedChanges, setSavedChanges] = useState(false);

  // Modal states
  const [showPdfModal, setShowPdfModal] = useState({ open: false, index: null, name: "", file: null, error: "" });
  const [selectedPdfs, setSelectedPdfs] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Snapshots
  const [editSessionSnapshot, setEditSessionSnapshot] = useState(null);
  const [postSaveSnapshot, setPostSaveSnapshot] = useState(null);

  // For PDF diff summary
  const [originalPdfLinks, setOriginalPdfLinks] = useState([]);

  const secTtl = "Velammal Engineering College";
  const secSub = "An Autonomous Institution";
  const secCnt = "We stand for innovation, with our diverse community of scholars and engineers dedicated to making a positive impact at local, national, and global levels.";

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) => path?.startsWith("http") ? path : `${BASE_URL}${path}`;

  const { sendRequest, loading: reqLoading } = useAdminRequest();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responce = await axios.post('/api/main-backend/about_us', { type: "about_vec" });
        const data = responce.data.data;
        setAbtUsData(data);
        setEditedContent(data.content);

        const pdfSource = data?.about_us_pdf || data?.links || data?.about_us || data?.pdfs || [];
        let initialPdfLinks = [];

        if (Array.isArray(pdfSource) && pdfSource.length > 0) {
          if (typeof pdfSource[0] === 'object' && (pdfSource[0].name || pdfSource[0].pdf_path || pdfSource[0].url)) {
            // array of objects with name and pdf_path/url
            initialPdfLinks = pdfSource.map((item, idx) => ({
              name: item.name || `Document ${idx + 1}`,
              url: item.pdf_path || item.pdf || item.url || ""
            }));
          } else {
            // array of strings - URLs
            initialPdfLinks = pdfSource.map((url, idx) => ({
              name: `Document ${idx + 1}`,
              url: url || ""
            }));
          }
        } else {
          // no backend pdf data - fallback to any links array fields if present on data
          const linksArray = data?.links || [];
          initialPdfLinks = [
            { name: linksArray[0] ? `Document 1` : "Document 1", url: linksArray?.[0] || "" },
            { name: linksArray[1] ? `Document 2` : "Document 2", url: linksArray?.[1] || "" },
            { name: linksArray[2] ? `Document 3` : "Document 3", url: linksArray?.[2] || "" },
            { name: linksArray[3] ? `Document 4` : "Document 4", url: linksArray?.[3] || "" }
          ];
        }

        setPdfLinks(initialPdfLinks.map(pdf => ({ ...pdf })));
        setOriginalPdfLinks(initialPdfLinks.map(pdf => ({ ...pdf })));
        setEditSessionSnapshot(null);
        setPostSaveSnapshot(null);
        setChanged(false);
        setSavedChanges(false);
      } catch (error) {
        if (error.response?.data?.status === 429) {
          navigate('/ratelimit', { state: { msg: error.response.data.message } });
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

  const handleEditClick = () => {
    setEditSessionSnapshot({
      content: editedContent,
      images: { ...editedImages },
      pdfLinks: pdfLinks.map(pdf => ({ ...pdf }))
    });
    setEditMode(true);
    setChanged(false);
    setSelectedPdfs([]);
  };

  const handleImageChange = (index, file) => {
    setEditedImages(prev => ({ ...prev, [index]: file }));
    setChanged(true);
    setSavedChanges(false);
  };

  const handleCancel = () => {
    if (changed) {
      setShowCancelConfirm(true);
    } else {
      setEditMode(false);
      setChanged(false);
    }
  };
  const confirmCancel = () => {
    if (savedChanges && postSaveSnapshot) {
      setEditedContent(postSaveSnapshot.content);
      setEditedImages({ ...postSaveSnapshot.images });
      setPdfLinks(postSaveSnapshot.pdfLinks.map(pdf => ({ ...pdf })));
      setSavedChanges(true);
    } else if (editSessionSnapshot) {
      setEditedContent(editSessionSnapshot.content);
      setEditedImages({ ...editSessionSnapshot.images });
      setPdfLinks(editSessionSnapshot.pdfLinks.map(pdf => ({ ...pdf })));
      setSavedChanges(true);
    }
    setChanged(false);
    setEditMode(false);
    setShowCancelConfirm(false);
    setSelectedPdfs([]);
  };

  const handleSave = () => {
    setPostSaveSnapshot({
      content: editedContent,
      images: { ...editedImages },
      pdfLinks: pdfLinks.map(pdf => ({ ...pdf }))
    });
    setSavedChanges(true);
    setChanged(false);
    setEditMode(false);
    setSelectedPdfs([]);
  };

  const handleDiscardAll = () => {
    setShowDiscardConfirm(true);
  };
  const confirmDiscardAll = () => {
    setEditedContent(abtUsData?.content || "");
    setEditedImages({ 0: null, 1: null, 2: null });
    setPdfLinks(originalPdfLinks.map(pdf => ({ ...pdf })));
    setChanged(false);
    setSavedChanges(false);
    setEditMode(false);
    setSelectedPdfs([]);
    setShowDiscardConfirm(false);
    setPostSaveSnapshot(null);
  };

  // PDF Modal open/close/save
  const openPdfModal = (index = null) => {
    if (index === null) {
      setShowPdfModal({ open: true, index: null, name: "", file: null, error: "" });
    } else {
      const item = pdfLinks[index] || { name: "", url: "" };
      setShowPdfModal({ open: true, index, name: item.name || "", file: item.file || null, error: "" });
    }
  };
  const closePdfModal = () => setShowPdfModal({ open: false, index: null, name: "", file: null, error: "" });
  const savePdfModal = () => {
    const { index, name, file } = showPdfModal;
    if (!name) {
      setShowPdfModal(s => ({ ...s, error: "Please enter a PDF name." }));
      return;
    }
    if (index === null && !file) {
      setShowPdfModal(s => ({ ...s, error: "Please upload a PDF file." }));
      return;
    }
    setShowPdfModal(s => ({ ...s, error: "" }));
    if (index === null) {
      setPdfLinks(prev => [...prev, { name, url: "", file }]);
    } else {
      setPdfLinks(prev => {
        const updated = prev.map((pdf, i) => i === index ? { ...pdf, name, file: file || pdf.file } : pdf);
        return updated;
      });
    }
    setChanged(true);
    setSavedChanges(false);
    closePdfModal();
  };

  // Eye icon always present: open PDF in new tab (replaced file if present, else url)
  const openPdfInNewTab = (pdf) => {
    if (pdf.file) {
      const blobUrl = URL.createObjectURL(pdf.file);
      window.open(blobUrl, "_blank");
      // Optionally revoke after some delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } else if (pdf.url) {
      window.open(UrlParser(pdf.url), "_blank");
    }
  };

  // Eye icon in modal: show new PDF file if chosen, else current (if url present)
  const openModalPdfInNewTab = () => {
    if (showPdfModal.file) {
      const blobUrl = URL.createObjectURL(showPdfModal.file);
      window.open(blobUrl, "_blank");
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } else if (showPdfModal.index !== null && pdfLinks[showPdfModal.index]?.url) {
      window.open(UrlParser(pdfLinks[showPdfModal.index].url), "_blank");
    }
  };

  const toggleSelectPdf = (index) => {
    setSelectedPdfs(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };
  const handleDeleteSelected = () => setShowDeleteConfirm(true);
  const confirmDeleteSelected = () => {
    setPdfLinks(prev => prev.filter((_, idx) => !selectedPdfs.includes(idx)));
    setSelectedPdfs([]);
    setChanged(true);
    setSavedChanges(false);
    setShowDeleteConfirm(false);
  };

  // helper to create safe filename
  const makeSafeFileName = (file) => {
    if (!file) return "";
    const ts = Date.now();
    // remove spaces, keep extension
    const name = file.name.replace(/\s+/g, "_");
    return `${ts}_${name}`;
  };

  // Build backend arrays/paths based on postSaveSnapshot (new) and abtUsData (old)
  const buildBackendRepresentation = (oldData, newSnapshot) => {
    // oldData may contain image_path (array) and about_us_pdf (array of objects or strings)
    const oldImagePaths = oldData?.image_path || [];
    const oldPdfArray = oldData?.about_us_pdf || oldData?.links || oldData?.pdfs || [];

    // images
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

    // pdfs
    const newPdfArray = (newSnapshot?.pdfLinks || []).map((pdf) => {
      if (pdf.file) {
        const safeName = makeSafeFileName(pdf.file);
        return {
          name: pdf.name || "",
          pdf_path: `/static/pdfs/about_us/${safeName}`
        };
      }
      // if it is a url string (could be full URL or backend path)
      return {
        name: pdf.name || "",
        pdf_path: pdf.url || ""
      };
    });

    const originalPdfArrayNormalized = [];
    if (Array.isArray(oldPdfArray)) {
      oldPdfArray.forEach((item) => {
        if (typeof item === "string") {
          originalPdfArrayNormalized.push({ name: "", pdf_path: item });
        } else if (item && typeof item === "object") {
          originalPdfArrayNormalized.push({
            name: item.name || "",
            pdf_path: item.pdf_path || item.pdf || item.url || ""
          });
        } else {
          originalPdfArrayNormalized.push({ name: "", pdf_path: "" });
        }
      });
    }

    return {
      newBackend: {
        content: newSnapshot?.content || "",
        image_path: newImagePaths,
        about_us_pdf: newPdfArray
      },
      oldBackend: {
        content: oldData?.content || "",
        image_path: oldImagePaths,
        about_us_pdf: originalPdfArrayNormalized
      },
      originalPdfArrayNormalized
    };
  };

  // Build entries (add/update/delete) and files to send based on diffs
  const buildEntriesAndFiles = (oldData, newSnapshot) => {
    const { newBackend, oldBackend, originalPdfArrayNormalized } = buildBackendRepresentation(oldData, newSnapshot);
    const entries = [];
    const filesToSend = [];

    // Content change
    if ((oldBackend.content || "") !== (newBackend.content || "")) {
      entries.push({
        collectionName: "about_us",
        collection_type: "about_vec",
        action: "update",
        title: "Update About VEC Content",
        category: "about_us",
        meta_data: { content: newBackend.content },
        original_data: { content: oldBackend.content }
      });
    }

    // Image changes - per-index
    for (let i = 0; i < 3; i++) {
      const newFile = newSnapshot.images?.[i];
      const oldPath = oldBackend.image_path?.[i] || "";
      const newPath = newBackend.image_path?.[i] || "";
      if (newFile) {
        // include file
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
          original_data: { image_path: oldPath }
        });
      }
    }

    // PDFs - compare by index, produce add/update/delete per item
    const oldPdfList = oldBackend.about_us_pdf || [];
    const newPdfList = newBackend.about_us_pdf || [];
    const maxLen = Math.max(oldPdfList.length, newPdfList.length);

    for (let i = 0; i < maxLen; i++) {
      const oldItem = oldPdfList[i] || null;
      const newItem = newPdfList[i] || null;
      const newSnapshotPdf = (newSnapshot.pdfLinks || [])[i] || null;

      if (oldItem && !newItem) {
        // deleted
        entries.push({
          collectionName: "about_us",
          collection_type: "about_vec",
          action: "delete",
          title: `Delete About VEC PDF ${oldItem.name || i + 1}`,
          category: "about_us",
          meta_data: { name: oldItem.name || "", pdf_path: "" },
          original_data: { name: oldItem.name || "", pdf_path: oldItem.pdf_path || "" }
        });
      } else if (!oldItem && newItem) {
        // newly added
        entries.push({
          collectionName: "about_us",
          collection_type: "about_vec",
          action: "add",
          title: `Add About VEC PDF ${newItem.name || i + 1}`,
          category: "about_us",
          meta_data: { name: newItem.name || "", pdf_path: newItem.pdf_path || "" },
          original_data: {}
        });
        // if this new item corresponds to an uploaded file, include file
        if (newSnapshotPdf?.file) {
          const safeName = makeSafeFileName(newSnapshotPdf.file);
          const renamed = new File([newSnapshotPdf.file], safeName, { type: newSnapshotPdf.file.type });
          filesToSend.push(renamed);
        }
      } else if (oldItem && newItem) {
        // both exist - check if changed (name or path) or file uploaded
        const nameChanged = (oldItem.name || "") !== (newItem.name || "");
        const pathChanged = (oldItem.pdf_path || "") !== (newItem.pdf_path || "");
        const fileUploaded = !!newSnapshotPdf?.file;

        if (nameChanged || pathChanged || fileUploaded) {
          entries.push({
            collectionName: "about_us",
            collection_type: "about_vec",
            action: "update",
            title: `Update About VEC PDF ${newItem.name || i + 1}`,
            category: "about_us",
            meta_data: { name: newItem.name || "", pdf_path: newItem.pdf_path || "" },
            original_data: { name: oldItem.name || "", pdf_path: oldItem.pdf_path || "" }
          });

          if (fileUploaded) {
            const safeName = makeSafeFileName(newSnapshotPdf.file);
            const renamed = new File([newSnapshotPdf.file], safeName, { type: newSnapshotPdf.file.type });
            filesToSend.push(renamed);
          }
        }
      }
    }

    return { entries, filesToSend };
  };

  // Get diff summary for modal
  const getPdfDiffSummary = () => {
    const added = [];
    const modified = [];
    const deleted = [];
    const base = originalPdfLinks;
    const curr = postSaveSnapshot ? postSaveSnapshot.pdfLinks : pdfLinks;
    curr.forEach((pdf, idx) => {
      const orig = base[idx];
      if (!orig) {
        added.push(pdf.name);
      } else if (pdf.name !== orig.name || pdf.url !== orig.url || pdf.file) {
        modified.push(pdf.name);
      }
    });
    base.forEach((pdf, idx) => {
      if (!curr[idx]) deleted.push(pdf.name);
    });
    return { added, modified, deleted };
  };

  // Build and send admin request on final confirm
  const confirmRequest = async () => {
    // Prepare source snapshots
    const oldData = abtUsData || {};
    const newSnapshot = postSaveSnapshot || {
      content: editedContent,
      images: { ...editedImages },
      pdfLinks: pdfLinks.map(pdf => ({ ...pdf }))
    };

    // Determine if any meaningful change exists
    const hasContentChanged = (oldData?.content || "") !== (newSnapshot.content || "");
    const hasImageChanges = [0, 1, 2].some(i => !!newSnapshot.images?.[i]);
    // For PDF changes compare lengths or any file present or name/url changed
    const oldPdfList = originalPdfLinks || [];
    const newPdfList = newSnapshot.pdfLinks || [];
    let pdfChanged = false;
    if (oldPdfList.length !== newPdfList.length) pdfChanged = true;
    else {
      for (let i = 0; i < newPdfList.length; i++) {
        const a = oldPdfList[i] || {};
        const b = newPdfList[i] || {};
        if (b.file || a.name !== b.name || a.url !== b.url) {
          pdfChanged = true;
          break;
        }
      }
    }

    if (!hasContentChanged && !hasImageChanges && !pdfChanged) {
      toast.info("No changes detected to request.");
      setShowRequestModal(false);
      return;
    }

    // Build entries and files to send (this will create add/update/delete per-PDF)
    const { entries, filesToSend } = buildEntriesAndFiles(oldData, newSnapshot);

    if (!entries.length) {
      toast.info("No actionable changes to request.");
      setShowRequestModal(false);
      return;
    }

    try {
      const result = await sendRequest(entries, filesToSend.length ? filesToSend : null);
      if (result?.success) {
        // optimistic update: set abtUsData to reflect submitted changes (use newBackend representation)
        const { newBackend } = buildBackendRepresentation(oldData, newSnapshot);
        const updatedBackend = {
          ...oldData,
          content: newBackend.content,
          image_path: newBackend.image_path,
          about_us_pdf: newBackend.about_us_pdf
        };
        setAbtUsData(updatedBackend);
        setOriginalPdfLinks(newBackend.about_us_pdf.map(p => ({ name: p.name || "", url: p.pdf_path || "" })));
        setPostSaveSnapshot(null);
        setSavedChanges(false);
        setChanged(false);
        setShowRequestModal(false);
        toast.success("Request submitted successfully.");
      } else {
        if (result?.status === 429 || result?.data?.status === 429) {
          navigate('/ratelimit', { state: { msg: result?.message || result?.data?.message || "Rate limit exceeded" }});
          return;
        }
        toast.error(result?.message || "Failed to submit request.");
      }
    } catch (err) {
      console.error("Error sending admin request", err);
      toast.error("Request failed.");
    }
  };

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

          <div className='flex m-8'>
            <div className='flex relative w-full max-h-[100vh]'>
              <div className="relative grow p-4 font-[Poppins] mt-14 basis-3/4 z-10 bg-[#ffffffa] backdrop-blur-[16px] lg:bg-none lg:backdrop-blur-0 rounded-xl">
                <p className='text-[32px] text-center font-[Poppins]'>{secTtl}</p>
                <p className='text-[24px] font-bold text-accn dark:text-drkt text-center font-[Poppins]'>{secSub}</p>
                <p className="text-[16px] text-center mt-4 text-justify font-[Poppins]">{secCnt}</p>
              </div>
              <div className="absolute lg:relative w-[110vw] h-[40vh] left-[-16vw] top-[20%] lg:left-0 lg:top-10 md:opacity-0 opacity-30 lg:opacity-100">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`absolute ${i === 0 ? "w-[40%] h-[60%] right-[15%] rounded-tl-[3rem] rounded-br-[3rem]" : i === 1 ? "w-[40%] h-[90%] left-[15%] top-[10%] rounded-bl-[3rem]" : "w-[25%] h-[40%] left-[40%] top-[45%] rounded-tl-[3rem] rounded-br-[3rem]"} border-[2vmin] border-white overflow-hidden`}
                  >
                    {loading[`img${i + 1}`] && (
                      <div className="absolute inset-0 flex justify-center items-center">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    {editMode && (
                      <span className="absolute top-2 right-2 bg-secd text-black text-xs font-bold px-2 py-1 rounded shadow z-20">
                        {i + 1}
                      </span>
                    )}
                    <img
                      className={`absolute w-full h-full object-cover transition-opacity duration-500 ${loading[`img${i + 1}`] ? "opacity-0" : "opacity-100"}`}
                      src={
                        editedImages[i]
                          ? URL.createObjectURL(editedImages[i])
                          : UrlParser(abtUsData?.image_path?.[i])
                      }
                      alt={`Banner Image${i}`}
                      onLoad={() => setLoading(prev => ({ ...prev, [`img${i + 1}`]: false }))}
                    />
                  </div>
                ))}

                {editMode && (
                  <div className="absolute bottom-[-4rem] left-1/2 -translate-x-1/2 flex justify-center gap-8">
                    {[0, 1, 2].map((index) => (
                      <div key={index} className="flex flex-col items-center">
                        <span className="mb-1 text-sm font-bold">Image {index + 1}</span>
                        <label className="bg-secd hover:bg-yellow-500 text-black px-3 py-1 border-text cursor-pointer">
                          Replace
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageChange(index, e.target.files[0])}
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                )}
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
                  className="w-full h-40 p-2 border border-gray-400 rounded"
                />
              ) : (
                <p className="text-[16px] lg:text-[16px] text-justify font-[Poppins] leading-relaxed tracking-wide">
                  {abtUsData?.content}
                </p>
              )}
            </div>
          </div>

          {/* PDF Links */}
          <div className="m-2 p-2 font-[Poppins]">
            <div className="pdf-links grid grid-cols-1 md:grid-cols-1 md:flex flex-wrap justify-center gap-6 w-fit mx-auto text-left">
              {pdfLinks.map((pdf, index) => (
                <div
                  key={index}
                  className={`relative md:px-1 md:py-1 md:text-[16px] flex items-center justify-center px-3 py-3 rounded-xl bg-secd text-text hover:bg-accn hover:text-white ${editMode ? "scale-110 cursor-pointer" : "cursor-pointer"}`}
                  onClick={editMode && !selectedPdfs.length ? () => openPdfModal(index) : undefined}
                  style={{ position: "relative" }}
                >
                  {pdf.name}
                  {editMode && (
                    <div className="absolute top-1 right-2 flex items-center gap-1 z-10">
                      <input
                        type="checkbox"
                        checked={selectedPdfs.includes(index)}
                        onClick={e => e.stopPropagation()}
                        onChange={(e) => { e.stopPropagation(); toggleSelectPdf(index); }}
                        className="custom-checkbox w-4 h-3"
                      />
                    </div>
                  )}
                  {!editMode &&
                    <div
                      className="absolute left-0 top-0 w-full h-full"
                      onClick={() => window.open(UrlParser(pdf.url), "_blank")}
                    />
                  }
                </div>
              ))}
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
                className={`relative cursor-pointer md:px-1 md:py-1 md:text-[16px] flex items-center justify-center px-3 py-3 rounded-xl bg-secd text-text hover:bg-accn hover:text-white ${editMode ? "scale-110" : ""}`}
                onClick={() => { if (!editMode) navigate("/abt-yr"); }}
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
              <div className="flex justify-end gap-4  p-4 mr-5">
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
                <button onClick={handleDiscardAll} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded">Discard All Changes</button>
                <button onClick={() => setShowRequestModal(true)} className="bg-secd hover:bg-yellow-500 text-black px-4 py-2 rounded">Request</button>
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
            <h2 className="text-lg font-bold mb-4">
              {showPdfModal.index === null ? "Add PDF" : "Edit PDF"}
            </h2>
            <input
              type="text"
              placeholder="Name"
              value={showPdfModal.name}
              onChange={(e) => setShowPdfModal(s => ({ ...s, name: e.target.value }))}
              className="w-full border p-2 mb-4 rounded"
            />
            <div className="flex items-center gap-2 mb-4">
              <label className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded cursor-pointer">
                {showPdfModal.index === null ? "Upload PDF" : "Replace PDF"}
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => setShowPdfModal(s => ({ ...s, file: e.target.files[0] }))}
                />
              </label>
              {/* Eye icon always present, will open current file or url in new tab */}
              <button
                title="Preview PDF"
                className="p-1 text-blue-400"
                onClick={openModalPdfInNewTab}
              >
                <Eye size={20} />
              </button>
            </div>
            {showPdfModal.error && (
              <p className="text-red-600 text-sm mb-2">{showPdfModal.error}</p>
            )}
            <div className="flex justify-end gap-3 w-full">
              <button onClick={closePdfModal} className="px-3 py-1 bg-gray-400 text-white rounded">Cancel</button>
              <button onClick={savePdfModal} className="px-3 py-1 bg-secd text-black rounded">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96 text-center">
            <h2 className="text-lg text-brwn font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete {selectedPdfs.length} selected PDF(s)?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteSelected}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel confirmation modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96 text-center">
            <h2 className="text-lg text-orange-600 font-bold mb-4">Confirm Cancel</h2>
            <p className="mb-6">Are you sure you want to cancel? All unsaved changes will be lost.</p>
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

      {/* Discard all changes confirmation modal */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96 text-center">
            <h2 className="text-lg text-brwn font-bold mb-4">Confirm Discard All Changes</h2>
            <p className="mb-6">Are you sure you want to discard all saved changes? This will revert everything to the original state.</p>
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
              Note: Your changes will stay pending until approved by the superior admin. 
              Once approved, will go on live.
            </p>
            <div className="max-h-[200px] overflow-y-auto mb-4">
              <table className="w-full text-center text-text dark:text-white">
                <thead>
                  <tr>
                    <th className="py-1">Action</th>
                    <th className="py-1">Section</th>
                    <th className="py-1 text-center">Changes</th>
                  </tr>
                </thead>
                <tbody>
                  {postSaveSnapshot && postSaveSnapshot.content !== abtUsData.content && (
                    <tr>
                      <td className="py-1 text-blue-600">✎ Edited</td>
                      <td className="py-1">About VEC Content</td>
                      <td className="py-1 text-[12px]">Content modified</td>
                    </tr>
                  )}
                  {postSaveSnapshot && [0, 1, 2].map((i) => 
                    postSaveSnapshot.images[i] ? (
                      <tr key={i}>
                        <td className="py-1 text-blue-600">✎ Edited</td>
                        <td className="py-1">About VEC Image {i+1}</td>
                        <td className="py-1 text-[12px]">Image replaced</td>
                      </tr>
                    ) : null
                  )}
                  {(() => {
                    const { added, modified, deleted } = getPdfDiffSummary();
                    return (
                      <>
                        {added.map((n, i) => (
                          <tr key={`added-${i}`}>
                            <td className="py-1 text-green-600">+ Added</td>
                            <td className="py-1">PDF Document</td>
                            <td className="py-1 text-[12px]">{n}</td>
                          </tr>
                        ))}
                        {modified.map((n, i) => (
                          <tr key={`mod-${i}`}>
                            <td className="py-1 text-blue-600">✎ Edited</td>
                            <td className="py-1">PDF Document</td>
                            <td className="py-1 text-[12px]">{n}</td>
                          </tr>
                        ))}
                        {deleted.map((n, i) => (
                          <tr key={`del-${i}`}>
                            <td className="py-1 text-red-600">- Deleted</td>
                            <td className="py-1">PDF Document</td>
                            <td className="py-1 text-[12px]">{n}</td>
                          </tr>
                        ))}
                      </>
                    );
                  })()}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
                disabled={reqLoading}
              >
                Edit Again
              </button>
              <button
                onClick={confirmRequest}
                className="px-4 py-2 rounded bg-secd dark:bg-drks hover:bg-yellow-500 text-text hover:text-black"
                disabled={reqLoading}
              >
                {reqLoading ? "Processing..." : "Final Request"}
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