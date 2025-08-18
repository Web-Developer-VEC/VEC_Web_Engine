import React from "react";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const UrlParser = (path) => {
  return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
};

const PdfOpener = ({ pdfRoute }) => {
  const openPdf = () => {
    const url = UrlParser(pdfRoute);
    window.open(url, "_blank");
  };

  return (
    <div style={styles.container}>
      <button
        className="bg-secd dark:bg-drks p-3 mt-6 mb-2 rounded-xl hover:bg-accn text-text hover:text-white"
        onClick={openPdf}
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
};

export default PdfOpener;
