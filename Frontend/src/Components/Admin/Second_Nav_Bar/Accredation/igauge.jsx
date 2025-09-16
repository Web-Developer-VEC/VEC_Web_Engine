import React, { useState } from "react";
import { Pencil } from "lucide-react";
import { FaLink } from "react-icons/fa";
import "./admin_igauge.css";
import LoadComp from "../../LoadComp";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArrowDown } from "lucide-react";

export default function IQGauge({ data }) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const [uploadedFile, setUploadedFile] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const UrlParser = (path) => {
    let paths;
    if (typeof path === "string") {
      paths = path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    }
    return paths;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setUploadedFile({ file, fileURL });
    }
  };

  const handleRequestConfirm = () => {
    console.log("Request confirmed for:", uploadedFile);
    toast.success("Request submitted successfully!");
    setShowRequestModal(false);
    setIsEditing(false);
  };

  if (!data || !Array.isArray(data)) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={""} />
      </div>
    );
  }

  const oldpath =
    Array.isArray(data) && data[0]?.pdf_path?.split("/");

  return (
    <div className="text-center py-10 dark:bg-drkp">
      <h1 className="text-2xl font-bold text-brwn dark:text-drkt mb-8">
        QS I QUAGE
      </h1>

      {/* Edit Button */}
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

      {/* Replace PDF / Request Button */}
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

      {/* PDF Viewer */}
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

      {/* Optional External Link */}
      {/* <a
        href={UrlParser(data[0]?.link)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-6 dark:text-drka text-lg underline"
      >
        <FaLink className="inline size-5 mr-1 mb-1" />
        I QUAGE Score
      </a> */}

      <ToastContainer position="bottom-right" autoClose={3000} />

      {/* Request Confirmation Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[530px]">
            {/* Title */}
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Final Request for the Changes
            </h2>

            {/* Note */}
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the
              superior admin. Once approved, they will be applied automatically
              to the live site.
            </p>

            {/* Summary */}
            <div className="max-h-[200px] overflow-y-auto mb-4">
              <table className="w-full text-center text-text dark:text-drkt">
                <thead>
                  <tr>
                    <th className="py-1">Action</th>
                    <th className="py-1">Section</th>
                    <th className="py-1 text-center">Changes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-1 text-blue-600">✎ Edited</td>
                    <td className="py-1">IQ Gauge</td>
                    <td className="py-1 text-[12px] flex flex-col items-center">
                      {oldpath && oldpath[4]} <ArrowDown />{" "}
                      <a
                        href={uploadedFile?.fileURL}
                        className="cursor-pointer"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {uploadedFile?.file.name}
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestConfirm}
                className="px-4 py-2 rounded bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt"
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
