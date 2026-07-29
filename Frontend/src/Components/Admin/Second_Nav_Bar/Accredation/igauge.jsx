import React, { useState } from "react";
import { Pencil, ArrowDown, X } from "lucide-react";
import { FaLink } from "react-icons/fa";
import { useEffect }  from "react";
import "./admin_igauge.css";
import LoadComp from "../../LoadComp";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

export default function IQGauge({ data }) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const [uploadedFile, setUploadedFile] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [changes, setChanges] = useState([]);
  const { sendRequest, loading: loadings , error } = useAdminRequest();
  const UrlParser = (path) => {
    if (typeof path === "string") {
      return path.startsWith("http") ? path : `${BASE_URL}${path}`;
    }
    return "";
  };

  console.log(loadings);
  

  const oldpath = Array.isArray(data) && data[0]?.pdf_path?.split("/");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fileURL = URL.createObjectURL(file);
    setUploadedFile({ file, fileURL });
    const change = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      action: "Edited",
      section: "IQ Gauge",
      oldValue: oldpath?.[4] || "current.pdf",
      newValue: file.name,
      fileURL,
    };
    setChanges((prev) => [...prev, change]);
  };

  const handleRequestConfirm = async () => {
  if (!uploadedFile) {
   
    return;
  }

  const oldPdfPath = Array.isArray(data) ? data[0]?.pdf_path : null;
  const newPdfPath = `/static/pdfs/qs rating/${uploadedFile.file.name}`;

  const payload = [
    {
      collectionName: "accreditations_and_ranking",
      collection_type: "qs_rating",
      action: oldPdfPath ? "update" : "insert",
      title: oldPdfPath
        ? "Update QS I-GAUGE Certificate"
        : "Insert QS I-GAUGE Certificate",
      meta_data: {
        pdf_path: [newPdfPath],
      },
      ...(oldPdfPath && {
        original_data: {
          pdf_path: [oldPdfPath],
        },
      }),
    },
  ];

  // ✅ SEND FILE AS ARRAY
  const files = [uploadedFile.file];

  const result = await sendRequest(payload, files);
 console.log("appu",files);
 
  if (result) {

    setShowRequestModal(false);
    setIsEditing(false);
    setChanges([]);
    setUploadedFile(null);
  }
};



  const handleRevertChange = (change) => {
    setChanges((prev) => prev.filter((c) => c.id !== change.id));
    if (uploadedFile?.fileURL === change.fileURL) {
      setUploadedFile(null);
    }
  };

  const getChanges = () => changes;
  
  useEffect(() => {
  document.body.scrollTo({
    top: 0,
    behavior: "smooth",
  });

  document.documentElement.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}, []);

  if (!data || !Array.isArray(data)) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={""} />
      </div>
    );
  }

  

  return (
    <div className="text-center py-10 dark:bg-drkp">
      <h1 className="text-2xl font-bold text-brwn dark:text-drkt mb-8">
        QS I QUAGE
      </h1>

      {!isEditing && (
        <div className="flex justify-end pt-3 mr-8">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
            onClick={() => setIsEditing(true)}
          >
            <Pencil size={16}/> Edit
          </button>
        </div>
      )}

      {isEditing && (
        <div className="mb-4 flex justify-center gap-4">
          {!uploadedFile ? (
            <>
              <input
                type="file"
                id="uploadFile"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
              <label
                htmlFor="uploadFile"
                className="bg-yellow-400 text-brown px-4 py-2 rounded-[10px] cursor-pointer hover:bg-[#800000] hover:text-white"
              >
                Replace PDF
              </label>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setUploadedFile(null);
                  setChanges([]);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-[10px] cursor-pointer hover:bg-[#800000] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowRequestModal(true)}
                className="bg-yellow-400 text-brown px-4 py-2 rounded-[10px] cursor-pointer hover:bg-[#800000] hover:text-white"
              >
                Request
              </button>
            </>
          )}
        </div>
      )}

      <div className="w-full flex justify-center px-2 overflow-x-auto">
        <div className="iframe-wrapper">
          <iframe
            src={
              uploadedFile?.fileURL
                ? uploadedFile.fileURL
                : UrlParser(Array.isArray(data) && data[0]?.pdf_path)
            }
            title="Main PDF"
            className="responsive-iframe"
            loading="lazy"
          />
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose={3000} />

 {showRequestModal && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
    <div className="bg-white dark:bg-drkp p-6 rounded-2xl w-[700px] max-w-[95vw] shadow-2xl">
      {/* Header */}
      <h2 className="text-xl font-bold mb-2 text-text dark:text-drkt">
        Request
      </h2>

      <p className="text-sm text-red-500 mb-4">
        Note: Your changes will stay pending until approved by the superior admin.
        Once approved they will go live.
      </p>

      {/* Table */}
      <div className="max-h-[320px] overflow-y-auto border rounded-lg">
        <table className="w-full text-sm text-center text-text dark:text-drkt">
          <thead className="sticky top-0 bg-gray-100 dark:bg-drka z-10">
            <tr>
              <th className="py-2 border">Action</th>
              <th className="py-2 border">Section</th>
              <th className="py-2 border">Changes</th>
              <th className="py-2 border w-[80px]">Undo</th>
            </tr>
          </thead>

          <tbody>
            {getChanges().map((change) => (
              <tr
                key={change.id}
                className="border-t hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                {/* Action */}
                <td className="py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${
                        change.action === "Added"
                          ? "bg-green-100 text-green-700"
                          : change.action === "Deleted"
                          ? "bg-red-100 text-red-700"
                          : " text-blue-700"
                      }`}
                  >
                    {change.action}
                  </span>
                </td>

                {/* Section */}
                <td className="py-2 border font-medium">
                  QS Rating
                </td>

                {/* Change Description */}
                <td className="py-2 border text-[13px]">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md ">
                    PDF Replaced
                  </span>
                </td>

                {/* Undo */}
                <td className="py-2 border">
                  <button
                    onClick={() => handleRevertChange(change)}
                    className="inline-flex items-center justify-center p-1 rounded hover:bg-red-100 text-red-500 hover:text-red-700 transition"
                    title="Undo change"
                  >
                    <X size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {getChanges().length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-sm text-gray-500">
                  No pending changes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 mt-5">
        <button
          onClick={() => setShowRequestModal(false)}
          className="px-4 py-2 rounded-md bg-gray-400 hover:bg-gray-500 text-white transition"
        >
          Cancel
        </button>

        <button
          onClick={handleRequestConfirm}
          disabled={loadings}
          className="px-5 py-2 rounded-md bg-[#fdcc03] hover:bg-[#800000] text-text hover:text-prim font-medium transition disabled:opacity-60"
        >
          {loadings ? "Submitting..." : "Final Request"}
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
