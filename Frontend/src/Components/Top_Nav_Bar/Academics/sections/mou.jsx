import React from "react";
import "./mou.css";

const MOU = ({ data }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  return (
    <div className="mou-page">
      <div className="mou-header">
        <h1 className="text-accn dark:text-drka">
          Memorandum of Understanding (MOU)
        </h1>
      </div>

      <div className="mou-details">
        {data?.MOUs?.map((detail, index) => (
          <div
            key={index}
            className="mou-detail-box border-2 border-secd dark:border-drks
              bg-prim dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]"
          >
            <div className="mou-logo bg-prim dark:bg-drkp">
              <img
                src={UrlParser(detail.LOGO_PATH)}
                alt={detail.ORGANISATION_NAME}
                className="mou-logo-image"
              />
            </div>
            <h3 className="text-accn dark:text-drka">{detail.ORGANISATION_NAME}</h3>
            <p>
              <strong>Duration:</strong> {detail.MONTH_AND_YEAR}
            </p>
            <p>
              <strong>Validity:</strong> {detail.VALIDITY}
            </p>

            {/* Open PDF in a new tab if the document exists */}
            {detail.PDF_PATH && (
              <a
                href={UrlParser(detail.PDF_PATH)}
                target="_blank"
                rel="noopener noreferrer"
                className="mou-pdf-link bg-accn text-white px-3 py-1 rounded-md mt-2 inline-block"
              >
                View PDF
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MOU;
