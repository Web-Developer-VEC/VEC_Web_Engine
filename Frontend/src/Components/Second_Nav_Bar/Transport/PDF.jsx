import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const UrlParser = (path) => {
  return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
};

const PdfOpener = ({ pdfRoute }) => {
  const [selectedPdf, setSelectedPdf] = useState(null);

  const openPdf = () => {
    const url = UrlParser(pdfRoute) + "#toolbar=0";
    if (window.innerWidth >= 1024) {
      setSelectedPdf({ url, name: "Transport Routes" });
    } else {
      window.open(url, "_blank");
    }
  };

  const closeModal = () => setSelectedPdf(null);

  return (
    <div style={styles.container}>
      <button
        className="bg-secd dark:bg-drks p-3 mt-6 mb-2 rounded-xl hover:bg-accn text-text hover:text-white"
        onClick={openPdf}
      >
        View Transport Routes
      </button>

      {/* Modal */}
      {selectedPdf && (
        <div className="pdf-modal">
          <div className="pdf-modal-content">
            <button className="pdf-close-button" onClick={closeModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2>{selectedPdf.name}</h2>
            <iframe
              src={selectedPdf.url}
              title={selectedPdf.name}
              className="pdf-iframe"
            />
          </div>
        </div>
      )}
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
