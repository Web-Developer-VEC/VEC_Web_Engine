import { useState, useRef } from "react";
import { toast } from "react-toastify";
import api from "../api/api";
import axios from "axios";
import { m } from "framer-motion";

/* -------------------------------- helpers -------------------------------- */

const extractFileNames = (meta = {}) => {
  const paths = [];

  // PDF paths
  if (Array.isArray(meta.pdf_path)) {
    paths.push(...meta.pdf_path);
  } else if (typeof meta.pdf_path === "string") {
    paths.push(meta.pdf_path);
  }

  // Image paths
  if (Array.isArray(meta.image_path)) {
    paths.push(...meta.image_path);
  } else if (typeof meta.image_path === "string") {
    paths.push(meta.image_path);
  }

  return paths
    .filter(Boolean)
    .map((p) => p.split("/").pop());
};

const normalizeRequests = (payload, files) => {
  const docs = Array.isArray(payload) ? payload : [payload];
  const fileList = Array.isArray(files) ? files : files ? [files] : [];

  return docs.map((doc) => {
    const fileNames = extractFileNames(doc.meta_data);

    const matchedFiles = fileList.filter((f) =>
      fileNames.includes(f.name)
    );

    return {
      doc,
      files: matchedFiles, // 🔥 ARRAY of files for ONE doc
    };
  });
};

/* ----------------------------- main hook ---------------------------------- */

export function useAdminRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // AbortController survives re-renders
  const abortRef = useRef(null);

  const sendRequest = async (payload, files = []) => {
    if (loading) return null; // prevent double submit

    setLoading(true);
    setError(null);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const normalized = normalizeRequests(payload, files);

      for (const { doc, files } of normalized) {
        console.log("Admin Request", doc, files);
        
        const formData = new FormData();
        formData.append("docs", JSON.stringify([doc]));

        if (files) {
          files.forEach((file) => {
            formData.append("files", file);
          });
        }

        const data = await api.post(
          "/admin-backend/temp",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            signal: abortRef.current.signal,
            onUploadProgress: (e) => {
              const percent = Math.round((e.loaded * 100) / e.total);
              console.log(`${doc.title}: ${percent}%`);
            }
          }
        );
      }

      toast.success("Request submitted successfully");
      return { success: true };
    } catch (err) {
      if (axios.isCancel(err)) {
        console.warn("Request cancelled");
      } else {
        console.error("Admin request failed:", err);
        toast.error(
          err?.response?.data?.message || "Request failed"
        );
        setError(err);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const cancelRequest = () => {
    abortRef.current?.abort();
  };

  return {
    sendRequest,
    cancelRequest,
    loading,
    error,
  };
}
