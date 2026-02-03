import { useState, useRef } from "react";
import { toast } from "react-toastify";
import api from "../api/api";

/* -------------------------------- helpers -------------------------------- */

const getFileNameFromPath = (path = "") => {
  if (!path) return null;
  return path.split("/").pop();
};

const normalizeRequests = (payload, files) => {
  const docs = Array.isArray(payload) ? payload : [payload];
  const fileList = Array.isArray(files) ? files : files ? [files] : [];

  return docs.map((doc) => {
    const fileName = getFileNameFromPath(doc.meta_data?.path);
    const matchedFile = fileList.find((f) => f.name === fileName);

    return {
      doc,
      file: matchedFile || null,
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

      for (const { doc, file } of normalized) {
        const formData = new FormData();
        formData.append("docs", JSON.stringify([doc]));

        if (file) {
          formData.append("files", file);
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
      return true;
    } catch (err) {
      if (api.isCancel(err)) {
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
