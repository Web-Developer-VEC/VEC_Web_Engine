import { useState } from "react";
import { toast } from "react-toastify";

export function useAdminRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  const sendRequest = async (payload, files = []) => {
    setLoading(true);
    setError(null);

    try {
      // Build FormData
      const formData = new FormData();
      formData.append("docs", JSON.stringify(payload));

      // Attach files (if any)
      if (files) {
        if (Array.isArray(files)) {
          files.forEach((file) => formData.append("files", file));
        } else {
          formData.append("files", files);
        }
      }

      const res = await fetch(`/api/admin-backend/temp`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,  
        },
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();
      toast.success(data.message || "Request successful");

      return data;
    } catch (err) {
      console.error("Admin request failed:", err);
      toast.error("Request failed.");
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { sendRequest, loading, error };
}