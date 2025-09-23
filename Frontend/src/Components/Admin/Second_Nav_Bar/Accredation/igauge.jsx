import React, { useState } from "react";
import { Pencil, ArrowDown, X } from "lucide-react";
import { FaLink } from "react-icons/fa";
import "./admin_igauge.css";
import LoadComp from "../../LoadComp";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function IQGauge({ data }) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const [uploadedFile, setUploadedFile] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [changes, setChanges] = useState([]);

  const UrlParser = (path) => {
    if (typeof path === "string") {
      return path.startsWith("http") ? path : `${BASE_URL}${path}`;
    }
    return "";
  };

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

  const handleRequestConfirm = () => {
    if (changes.length === 0) {
      toast.info("No changes to submit");
      return;
    }
    toast.success("Request submitted successfully!");
    setShowRequestModal(false);
    setIsEditing(false);
    setChanges([]);
    setUploadedFile(null);
  };

  const handleRevertChange = (change) => {
    setChanges((prev) => prev.filter((c) => c.id !== change.id));
    if (uploadedFile?.fileURL === change.fileURL) {
      setUploadedFile(null);
    }
  };

  const getChanges = () => changes;

  const describeChange = (change) => {
    return (
      <div className="flex flex-col items-center">
        <span className="text-xs">{change.oldValue}</span>
        <ArrowDown size={14} />
        <a
          href={change.fileURL}
          className="cursor-pointer text-blue-600 text-xs"
          target="_blank"
          rel="noreferrer"
        >
          {change.newValue}
        </a>
      </div>
    );
  };

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
            className="bg-secd text-text px-4 py-2 rounded-[10px] cursor-pointer hover:bg-[#800000] hover:text-drkt flex"
            onClick={() => setIsEditing(true)}
          >
            <Pencil /> Edit
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
          <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[650px] max-w-[95vw]">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Request
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin. Once approved will go live.
            </p>

            <div className="max-h-[320px] overflow-y-auto mb-4">
              <table className="w-full text-center text-text dark:text-drkt border">
                <thead>
                  <tr className="bg-gray-200 dark:bg-drka">
                    <th className="py-2">Action</th>
                    <th className="py-2">Section</th>
                    <th className="py-2 text-center">Changes</th>
                    <th className="py-2">Undo</th>
                  </tr>
                </thead>
                <tbody>
                  {getChanges().map((change) => (
                    <tr key={change.id} className="border-t">
                      <td
                        className={`py-2 ${
                          change.action === "Added"
                            ? "text-green-600"
                            : change.action === "Deleted"
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      >
                        {change.action}
                      </td>

                      <td className="py-2">{change.section}</td>

                      <td className="py-2 text-[13px]">
                        <div className="flex items-center justify-center gap-2">
                          <span>{describeChange(change)}</span>
                        </div>
                      </td>

                      <td className="py-2">
                        <button
                          onClick={() => handleRevertChange(change)}
                          className="text-red-500 hover:text-red-700 font-bold"
                          title="Revert this change"
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

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestConfirm}
                className="px-4 py-2 rounded bg-[#fdcc03] dark:drks hover:bg-[#800000] text-text hover:text-prim"
              >
                Final Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
