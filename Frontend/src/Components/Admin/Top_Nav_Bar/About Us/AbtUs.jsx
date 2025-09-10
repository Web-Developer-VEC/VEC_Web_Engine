import React, { useEffect, useState, useRef } from 'react';
import { FaLink, FaUserEdit, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { ArrowBigLeftDash, CircleCheck, FileDiff, Pencil, Trash2, Upload } from 'lucide-react';
import Banner from '../../../Banner';
import LoadComp from '../../../LoadComp';
import styles from './AbtUs.css';

const AbtUs = ({ theme, toggle }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAdminEditing, setIsAdminEditing] = useState(false);
  const [editedTexts, setEditedTexts] = useState([
    "We stand for innovation, with our diverse community of scholars and engineers dedicated to making a positive impact at local, national, and global levels.",
    "Velammal Engineering College (Autonomous) is affiliated to Anna University and is approved by the All India Council for Technical Education (AICTE). The institution was certified ISO 9001:2015 by M/s. TUV, India in just 5 years of its inception. The college is accredited by NAAC and all eligible programmes are accredited by NBA. Based in Chennai city, VEC, the safe campus, offers a truly unrivalled study experience with various courses, outstanding facilities, comprehensive support, and highly disciplined life.Velammal Engineering College achieved its autonomous status in the year 2019. Autonomy can be found in the choice of curriculum, pedagogy, and evaluation systems. It helps students to carve a niche for themselves as they have greater flexibility towards academic development for improvement of academic standards and excellence."
  ]);
  const originalTextsRef = useRef([...editedTexts]); 

  const [selectedImages, setSelectedImages] = useState([null, null, null]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState({ img1: true, img2: true, img3: true });
  const [centerParaButton, setCenterParaButton] = useState(false);
  const [abtUsButton, setAbtUsButton] = useState(false);
  const [pdfFiles, setPdfFiles] = useState([
    "AICTE_EOA_2024-2025.pdf",
    "AU_Grant_of_Affiliation_2024-25.pdf",
    "4th_Governing_Body_Members.pdf",
    "VEC_Mandatory_Disclosure-2024-2025.pdf"
  ]);
  const [showPdfUpload, setShowPdfUpload] = useState(false);
  const [newPdfFile, setNewPdfFile] = useState(null);

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) => (path?.startsWith("http") ? path : `${BASE_URL}${path}`);

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

  const secTtl = "Velammal Engineering College";
  const secSub = "An Autonomous Institution";

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const updatedImages = [...selectedImages];
      updatedImages[selectedImageIndex] = URL.createObjectURL(file);
      setSelectedImages(updatedImages);
    }
  };

  const handleLoad = (imgKey) => {
    setLoading((prev) => ({ ...prev, [imgKey]: false }));
  };

  const handleEditTextChange = (e, index) => {
    const updatedTexts = [...editedTexts];
    updatedTexts[index] = e.target.value;
    setEditedTexts(updatedTexts);
  };

  const abtButtonTextSubmit = () => {
    alert("Submitted new About content:\n" + editedTexts[0]);
    setAbtUsButton(false);
  };

  const centerParaTextSubmit = () => {
    alert("Submitted new Center Paragraph:\n" + editedTexts[1]);
    setCenterParaButton(false);
  };

  const pdfEditButton = () => {
    alert("PDF edit clicked");
  };

  const handleDeletePdf = (index) => {
    const updated = [...pdfFiles];
    updated.splice(index, 1);
    setPdfFiles(updated);
  };

  const handlePdfFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setNewPdfFile(file.name);
    } else {
      alert("Only PDF files are allowed.");
    }
  };

  const handleAddPdf = () => {
    if (newPdfFile) {
      setPdfFiles([...pdfFiles, newPdfFile]);
      setNewPdfFile(null);
      setShowPdfUpload(false);
    } else {
      alert("Please select a valid PDF file.");
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

      <div>
      
        <div className="flex gap-4 justify-end pr-8 mt-2">
          <button className="flex items-center bg-[#fdcc03] px-3 py-2 rounded text-black" onClick={() => setIsAdminEditing(true)}>
            <FaUserEdit className="mr-2" /> Edit
          </button>
          <button className="flex items-center bg-green-500 text-black px-3 py-2 rounded" onClick={() => { setIsAdminEditing(false); setAbtUsButton(false); setCenterParaButton(false); }}>
           <CircleCheck className="mr-2" />
            Confirm 
          </button>
        </div>

    
        <div className="flex m-8 p-8">
          <div className="flex relative w-full max-h-[100vh]">
            <div className="relative grow p-12 mt-8 basis-3/4 z-10 bg-[#ffffffa] backdrop-blur-[16px] rounded-xl">
              <p className='text-3xl text-center font-[Poppins]'>{secTtl}</p>
              <p className='text-[20px] font-bold text-accn dark:text-drkt text-center font-[Poppins]'>{secSub}</p>

              {!isAdminEditing || !abtUsButton ? (
                <>
                  <p className="text-[16px] text-center mt-4 text-justify">{editedTexts[0]}</p>
                  {isAdminEditing && (
                    <div className="flex gap-4 justify-end pt-4 pr-8 absolute bottom-0 right-0 mt-4">
                      <button className="flex items-center bg-[#fdcc03] px-3 py-2 rounded text-black" onClick={() => {
                        originalTextsRef.current[0] = editedTexts[0];
                        setAbtUsButton(true);
                      }}>
                        <Pencil className="mr-2" /> Edit
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <textarea className="w-full p-2 border border-gray-300 rounded" value={editedTexts[0]} rows={8} onChange={(e) => handleEditTextChange(e, 0)} />
                  <div className="flex gap-4 justify-end pt-4 pr-16">
                    <button className="bg-green-500 px-3 py-2 rounded text-white" onClick={abtButtonTextSubmit}>
                      <FaCheckCircle className="mr-2 inline" /> Submit
                    </button>
                    <button className="bg-red-500 px-3 py-2 rounded text-white" onClick={() => {
                      setEditedTexts((prev) => {
                        const updated = [...prev];
                        updated[0] = originalTextsRef.current[0];
                        return updated;
                      });
                      setAbtUsButton(false);
                    }}>
                      <FaTimesCircle className="mr-2 inline" /> Cancel
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Image Gallery */}
            <div className="absolute lg:relative w-[110vw] h-[40vh] left-[-20vw] top-[20%] lg:left-0 lg:top-10 opacity-30 lg:opacity-100">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="absolute" style={{
                  width: idx === 2 ? '25%' : '40%',
                  height: idx === 0 ? '65%' : idx === 2 ? '40%' : '90%',
                  left: idx === 1 ? '15%' : idx === 2 ? '40%' : undefined,
                  right: idx === 0 ? '15%' : undefined,
                  top: idx === 1 ? '10%' : idx === 2 ? '45%' : undefined,
                  border: idx !== 0 ? '2vmin solid var(--tw-border-color)' : undefined,
                  borderColor: 'var(--color-prim)'
                }}>
                  {loading[`img${idx + 1}`] && (
                    <div className="absolute inset-0 flex justify-center items-center">
                      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <img
                    className={`absolute w-full h-full rounded-[3rem] transition-opacity duration-500 ${loading[`img${idx + 1}`] ? 'opacity-0' : 'opacity-100'}`}
                    src={selectedImages[idx] || UrlParser(`/static/images/aboutvec/aboutvec${idx + 1}.webp`)}
                    alt={`Banner Image ${idx}`}
                    onLoad={() => handleLoad(`img${idx + 1}`)}
                  />
                </div>
              ))}
              {isAdminEditing && (
                <div className="flex flex-col gap-4 justify-end pr-8 absolute bottom-0 right-0 bg-white bg-opacity-80 p-4 rounded">
                  <label htmlFor="imageSelect" className="text-sm font-semibold">Choose image number (1-3):</label>
                  <select id="imageSelect" value={selectedImageIndex} onChange={(e) => setSelectedImageIndex(Number(e.target.value))} className="border px-2 py-1 rounded">
                    {[0, 1, 2].map(i => <option key={i} value={i}>Image {i + 1}</option>)}
                  </select>
                  <input type="file" accept="image/*" onChange={handleImageSelect} className="border px-2 py-1 rounded" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Second Paragraph Section */}
        <div className="flex flex-col justify-between gap-8 my-14 p-10 bg-white">
          <div className="flex flex-col justify-center px-2 lg:px-12">
            {!isAdminEditing || !centerParaButton ? (
              <>
                <p className="text-[16px] lg:text-[16px] text-justify leading-relaxed tracking-wide">{editedTexts[1]}</p>
                {isAdminEditing && (
                  <div className="flex gap-4 justify-end pt-4 pr-16">
                    <button className="flex items-center bg-[#fdcc03] px-3 py-2 rounded text-black" onClick={() => {
                      originalTextsRef.current[1] = editedTexts[1];
                      setCenterParaButton(true);
                    }}>
                      <Pencil className="mr-2" /> Edit
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <textarea className="w-full p-2 border border-gray-300 rounded" value={editedTexts[1]} rows={6} onChange={(e) => handleEditTextChange(e, 1)} />
                <div className="flex gap-4 justify-end pt-4 pr-16">
                  <button className="bg-green-500 px-3 py-2 rounded text-white" onClick={centerParaTextSubmit}>
                    <FaCheckCircle className="mr-2 inline" /> Submit
                  </button>
                  <button className="bg-red-500 px-3 py-2 rounded text-white" onClick={() => {
                    setEditedTexts((prev) => {
                      const updated = [...prev];
                      updated[1] = originalTextsRef.current[1];
                      return updated;
                    });
                    setCenterParaButton(false);
                  }}>
                    <FaTimesCircle className="mr-2 inline" /> Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* PDF Section */}
        <div className="w-[80%] m-auto p-4">
          <div className="m-4 p-2">
            <ul className="pdf-links flex flex-wrap justify-center gap-8">
              {pdfFiles.map((file, idx) => (
                <li key={idx} className="text-lg flex items-center justify-between gap-2 border-b pb-2">
                  <div className="flex flex-row gap-2">
                    <FaLink className="text-prim dark:text-drkp" />
                    <a
                      href={UrlParser(`/static/pdfs/about_vec/${file}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      🔗{file.replace(/_/g, ' ').replace('.pdf', '')}
                    </a>
                  </div>
                  {isAdminEditing && (
                    <button
                      onClick={() => handleDeletePdf(idx)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {isAdminEditing && (
            <>
              <div className="flex justify-center mt-4">
                <button
                  className="flex items-center bg-[#fdcc03] px-3 py-2 rounded text-black"
                  onClick={() => setShowPdfUpload(!showPdfUpload)}
                >
                  <FileDiff className="mr-2" /> {showPdfUpload ? 'Cancel Add' : 'Add PDF'}
                </button>
              </div>

              {showPdfUpload && (
                <div className="mt-6 flex flex-col items-center gap-4">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfFileChange}
                    className="border px-3 py-2 rounded w-full max-w-md"
                  />
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded"
                    onClick={handleAddPdf}
                  >
                    < Upload />
                    Upload PDF
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AbtUs;
