import React from "react";

const PdfOpener = () => {

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
      return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  return (
    <div style={styles.container}>
      <button
        className="bg-secd dark:bg-drks p-3 mt-6 mb-2 rounded-xl hover:bg-accn dark:hover:bg-blue-700 hover:text-white"
        onClick={() => window.open(UrlParser('static/pdfs/transport/VELAMMAL_BUS_ROUTES 2024 - 25.pdf'), "_blank")}
      >
        View Transport Routes
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    padding: "12px 24px",
    fontSize: "16px",
    backgroundColor: "#ffeb3b", // Yellow color
    color: "#000", // Black text for better contrast
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginBottom: "20px",
    transition: "background-color 0.3s",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    ":hover": {
      backgroundColor: "#fdd835", // Darker yellow on hover
    },
  },
  pdfContainer: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    backgroundColor: "white",
    width: "90%",
    maxWidth: "800px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    borderBottom: "1px solid #eee",
  },
  title: {
    margin: 0,
    fontSize: "18px",
    color: "#333",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#666",
    padding: "0 8px",
    ":hover": {
      color: "#333",
    },
  },
  embed: {
    width: "100%",
    height: "75vh",
    minHeight: "500px",
    border: "none",
    borderRadius: "0 0 8px 8px",
  },
};

export default PdfOpener;
