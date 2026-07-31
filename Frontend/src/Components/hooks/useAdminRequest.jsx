import axios from "axios";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/api";

/* -------------------------------- helpers -------------------------------- */

const extractFileNames = (meta = {}) => {
  const paths = [];

  const extractPathsRecursively = (obj) => {
    if (!obj || typeof obj !== "object") return;

    // Check for pdf_path and image_path at current level
    if (obj.pdf_path) {
      if (Array.isArray(obj.pdf_path)) {
        paths.push(...obj.pdf_path);
      } else if (typeof obj.pdf_path === "string") {
        paths.push(obj.pdf_path);
      }
    }

    if (obj.image_path) {
      if (Array.isArray(obj.image_path)) {
        paths.push(...obj.image_path);
      } else if (typeof obj.image_path === "string") {
        paths.push(obj.image_path);
      }
    }

    // Recursively check arrays and nested objects
    if (Array.isArray(obj)) {
      obj.forEach(item => extractPathsRecursively(item));
    } else {
      Object.values(obj).forEach(value => {
        if (typeof value === "object" && value !== null) {
          extractPathsRecursively(value);
        }
      });
    }
  };

  extractPathsRecursively(meta);

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

        await api.post(
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
