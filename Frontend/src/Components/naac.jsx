import React, { useState } from 'react';
import "./naac.css";
import banner from "./Assets/banner image.jpg";
import Banner from './Banner';

const Naac = () => {
  const [selectedYear, setSelectedYear] = useState("IQAC MoM");
  const [selectedAction, setSelectedAction] = useState(null);

  const yearButtons = {
    "IQAC MoM": {
      actions: {
        "Odd sem 2020-21": "/pdfs/IQAC-MoM-Odd-Sem-2020-21.pdf",
        "Even sem 2020-21": "/pdfs/IQAC-MoM-Even-Sem-2020-21.pdf",
      }
    },
    "AQAR": {
      actions: {
        "AQAR 2018-19": "/pdfs/AQAR-Report-2018-19.pdf",
        "AQAR 2019-20": "/pdfs/AQAR-2019-20.pdf",
        "AQAR 2020-21": "/pdfs/AQAR-2020-2021.pdf",
        "AQAR 2021-22": "/pdfs/AQAR_2021-22.pdf",
        "AQAR 2022-23": "/pdfs/AQAR_2022-23.pdf",
      },
    },
    "Best Practices": {
      actions: {
        "2019-20": "/pdfs/VEC-Best-Practices-final 2019-20.pdf",
        "2020-21": "/pdfs/7.2.1---Best-practices-20-21.pdf",
        "2021-22": "/pdfs/7.2.1-best-practice-2021-22.pdf",
        "2022-23": "/pdfs/best-practice-2022-2023_final.pdf",
        "2023-24": "/pdfs/best_practice_23-24.pdf",
      },
    },
    "Institutional Distinctives": {
      actions: {
        "2019-20": "/pdfs/VEC-Institutional-Distinctivenss 19-20.pdf",
        "2020-21": "/pdfs/7.3.1-VEC-Institutional-Distinctivenss-2020-21.pdf",
        "2021-22": "/pdfs/distinctiveness-2021-22.pdf",
        "2022-23": "/pdfs/Distinctiveness-22-23_final.pdf",
        "2023-24": "/pdfs/distinctiveness_23-24.pdf",
      },
    },
    "Code of Ethics": {
      actions: {
        "View here": "/pdfs/CODE-OF-ETHICS.pdf",
      },
    },
  };

  const openPdf = (action) => setSelectedAction(action);
  const handleYearClick = (year) => {
    setSelectedYear(year);
    setSelectedAction(null);
  };

  return (
    <>
      <Banner
          backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
          headerText="NAAC"
          subHeaderText="NATIONAL ASSESSMENT AND ACCREDITATION COUNCIL (NAAC)"
        />
    <div className="naac-page">
      <div className="about-section">
        <div className="naac-info-panel">
          <h2>About NAAC</h2>
          <p>
          The NAAC conducts assessment and accreditation of Higher Educational Institutions (HEI) such as colleges, universities or other recognised institutions to derive an understanding of the ‘Quality Status’ of the institution. NAAC evaluates the institutions for its conformance to the standards of quality in terms of its performance related to the educational processes and outcomes, curriculum coverage, teaching-learning processes, faculty, research, infrastructure, learning resources, organisation, governance, financial well being and student services.
          </p>
        </div>

        <div className="iqac-info-panel">
          <h2>About IQAC</h2>
          <p>
            The Internal Quality Assurance Cell (IQAC) is a pivotal body established 
            to ensure continuous quality enhancement in academic and administrative 
            performance. Formulated as a post-accreditation quality sustenance measure 
            recommended by NAAC.
          </p>
        </div>
      </div>

      <div className="objectives-section">
        <h2>Key Objectives</h2>
        <ol>
          <li><b>Quality Enhancement:</b> Develop system for consistent improvement</li>
          <li><b>Best Practices:</b> Institutionalize innovative practices</li>
          <li><b>Stakeholder Engagement:</b> Ensure active participation</li>
          <li><b>Documentation:</b> Maintain records effectively</li>
        </ol>
      </div>

      <div className="naac-content">
        <div className="naac-years">
          {Object.keys(yearButtons).map((year) => (
            <button
              key={year}
              className={`naac-year-button ${selectedYear === year ? "active" : ""}`}
              onClick={() => handleYearClick(year)}
            >
              {year}
            </button>
          ))}
        </div>

        <div className="naac-details">
          <div className="naac-year-actions">
            {Object.keys(yearButtons[selectedYear]?.actions || {}).map((action, index) => (
              <div key={index}>
                <button
                  className="naac-action-button"
                  onClick={() => openPdf(action)}
                >
                  {action}
                </button>
              </div>
            ))}
          </div>

          {selectedAction && (
            <div className="naac-pdf-container">
              <h3>{`Viewing: ${selectedAction}`}</h3>
              <embed
                className="embed"
                src={yearButtons[selectedYear]?.actions[selectedAction]}
                type="application/pdf"
                width="100%"
                height="600px"
              />
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default Naac;