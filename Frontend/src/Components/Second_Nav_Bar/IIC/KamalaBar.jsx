import React, { useState } from "react";

const pdfData = {
  "KAPILA IMPLEMENTATION COMMITTEE": "$$$$$$$$$.pdf",
  "KAPILA POLICY AND SCHEME DOCUMENTS": "#########.pdf",
  "KAPILA ACTIVITY": "@@@@@@@@.pdf",
};

const KapilaPage = () => {
  const [activeSection, setActiveSection] = useState(null);

  const toggleSection = (section) => {
    setActiveSection(prev => (prev === section ? null : section));
  };

  return (
    <div className="p-4">
      {Object.keys(pdfData).map((title) => (
        <div key={title} className="mb-4">
          {/* Button */}
          <button
            className="w-full flex justify-between items-center text-white font-bold px-4 py-4 bg-[#800000] text-left text-[20px]"
            onClick={() => toggleSection(title)}
          >
            {title}
            <span className="text-white text-2xl">
              {activeSection === title ? "−" : "+"}
            </span>
          </button>

          {/* PDF Viewer */}
          {activeSection === title && (
            <div className="mt-2 border p-4 bg-white shadow">
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <embed
                src={pdfData[title]}
                type="application/pdf"
                width="100%"
                height="600px"
                className="border"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default KapilaPage;
