import React, { useState, useRef } from "react";
import "./FacultyForm";
import { Eye } from "lucide-react";

const Page2 = ({ selectedYear, newAcadamicYear, data, setData }) => {
  // -------------------- State --------------------
 // ================= FULL STATE FOR PAGE2 =================
const defaultState = {
  phd_scholars: {
    faculty_with_phd: { odd_sem: "", even_sem: "", consolidated: "", undertaking: "", pdf_path: null },
    phd_supervisors_au: { odd_sem: "", even_sem: "", consolidated: "", undertaking: "", pdf_path: null },
    faculty_pursuing_phd: { odd_sem: "", even_sem: "", consolidated: "", undertaking: "", pdf_path: null },
    phd_scholars_pursuing: { odd_sem: "", even_sem: "", consolidated: "", undertaking: "", pdf_path: null },
    phd_scholars_completed: { odd_sem: "", even_sem: "", consolidated: "", undertaking: "", pdf_path: null },
  },

  research_publications: {
    total_faculty: {
      odd_sem: { target: "", achieved: "", percentage: "" },
      even_sem: { target: "", achieved: "", percentage: "" },
      consolidated: { target: "", achieved: "", percentage: "" },
      undertaking: "",
      pdf_path: null,
    },
    journals_sci_wos: {
      odd_sem: { target: "", achieved: "", percentage: "" },
      even_sem: { target: "", achieved: "", percentage: "" },
      consolidated: { target: "", achieved: "", percentage: "" },
      undertaking: "",
      pdf_path: null,
    },
    journals_scopus: {
      odd_sem: { target: "", achieved: "", percentage: "" },
      even_sem: { target: "", achieved: "", percentage: "" },
      consolidated: { target: "", achieved: "", percentage: "" },
      undertaking: "",
      pdf_path: null,
    },
    avg_publications_per_faculty: {
      odd_sem: { target: "", achieved: "", percentage: "" },
      even_sem: { target: "", achieved: "", percentage: "" },
      consolidated: { target: "", achieved: "", percentage: "" },
      undertaking: "",
      pdf_path: null,
    },
  },

  research_funding: {
    funded_projects_sanctioned: { odd_sem: "", even_sem: "", consolidated: "", undertaking: "", pdf_path: null },
    amount_received: { odd_sem: "", even_sem: "", consolidated: "", undertaking: "", pdf_path: null },
    ongoing_projects_sanctioned_previous_years: { odd_sem: "", even_sem: "", consolidated: "", undertaking: "", pdf_path: null },
    modrobs_proposals_and_amount: { odd_sem: "", even_sem: "", consolidated: "", undertaking: "", pdf_path: null },
    sttp_workshops_fdps_entrepreneurship_proposals_and_amount: { odd_sem: "", even_sem: "", consolidated: "", undertaking: "", pdf_path: null },
    other_student_schemes_iedc_tnscst: { odd_sem: "", even_sem: "", consolidated: "", undertaking: "", pdf_path: null },
  },

  consultancy: {
    amount_received: { odd_sem: "", even_sem: "", consolidated: "", undertaking: "", pdf_path: null },
  },
};

const [page2Data, setpage2Data] = useState(() => ({
  ...defaultState,
  ...data,

  phd_scholars: {
    ...defaultState.phd_scholars,
    ...(data?.phd_scholars || {}),
  },

  research_publications: {
    ...defaultState.research_publications,
    ...(data?.research_publications || {}),
  },

  research_funding: {
    ...defaultState.research_funding,
    ...(data?.research_funding || {}),
  },

  consultancy: {
    ...defaultState.consultancy,
    ...(data?.consultancy || {}),
  },
}));


  React.useEffect(() => {
  if (setData) {
    setData(page2Data);
  }
}, [page2Data]);
  // console.log(page2Data);
  

  const fileRefs = useRef({});

  // -------------------- Handlers --------------------
const handleInputChange = (section, key, subKey, value, sem = null) => {
  setpage2Data((prev) => {
    const updated = { ...prev };

    if (sem) {
      // 🔥 Section VII (3-level)
      updated[section] = {
        ...prev[section],
        [key]: {
          ...prev[section][key],
          [sem]: {
            ...prev[section][key][sem],
            [subKey]: value,
          },
        },
      };
    } else {
      // 🔥 Other sections (2-level)
      updated[section] = {
        ...prev[section],
        [key]: {
          ...prev[section][key],
          [subKey]: value,
        },
      };
    }

    return updated;
  });
};
  const handleFileChange = (section, key, file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed!");
      return;
    }

    setpage2Data((prev) => {
      const updated = { ...prev };
      updated[section][key].pdf_path = file;
      return updated;
    });
  };

  const viewFile = (file) => {
    if (file) {
      const url = URL.createObjectURL(file);
      window.open(url, "_blank");
    }
  };

  const handleUploadClick = (key) => {
    if (fileRefs.current[key]) fileRefs.current[key].click();
  };

  // -------------------- Sections --------------------
  return (
    <>
      {/* ================= SECTION VI ================= */}
      <div className="section">
        <div className="section-title">VI. Ph.D SCHOLARS</div>

        <div className="form-grid grid-6-upload" style={{ fontWeight: "bold", borderBottom: "2px solid black", paddingBottom: "8px", marginBottom: "10px" }}>
          <div></div>
          <div>Odd Sem</div>
          <div>Even Sem</div>
          <div>Consolidated</div>
          <div>Commitment</div>
          <div>Upload</div>
        </div>

        {[
          "No. of Faculty with PhD in Department",
          "No. of PhD Supervisors in Department (AU)",
          "No. of Faculty Pursuing PhD",
          "No. of PhD Scholars (Int + Ext)",
          "No. of PhD Scholars Completed",
        ].map((label, index) => {
          const keys = [
            "faculty_with_phd",
            "phd_supervisors_au",
            "faculty_pursuing_phd",
            "phd_scholars_pursuing",
            "phd_scholars_completed",
          ];
          const key = keys[index];

          return (
            <div key={index} className="form-grid grid-6-upload form-input">
              <label className="form-label">{index + 1}. {label}</label>

              {["odd_sem", "even_sem", "consolidated", "undertaking"].map((subKey) => (
                <input
                  key={subKey}
                  type="text"
                  value={page2Data.phd_scholars[key][subKey]}
                  onChange={(e) => handleInputChange("phd_scholars", key, subKey, e.target.value)}
                />
              ))}

              <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                <input
                  type="file"
                  ref={(el) => (fileRefs.current[key] = el)}
                  style={{ display: "none" }}
                  onChange={(e) => handleFileChange("phd_scholars", key, e.target.files[0])}
                />
                <Eye
                  style={{ cursor: "pointer" }}
                  onClick={() => viewFile(page2Data.phd_scholars[key].pdf_path)}
                />
                <button type="button" onClick={() => handleUploadClick(key)}>Upload</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= SECTION VII ================= */}
      <div className="section">
        <div className="section-title">VII. RESEARCH PUBLICATIONS BY FACULTY</div>

        <div className="section-group-header grid-12-upload">
          <div></div>
          <div style={{ gridColumn: "2 / 5" }}>Odd Sem</div>
          <div style={{ gridColumn: "5 / 8" }}>Even Sem</div>
          <div style={{ gridColumn: "8 / 11" }}>Consolidated</div>
          <div>Commitment</div>
          <div>Upload</div>
        </div>

        <div className="section-subheader grid-12-upload">
          <div></div>
          {[...Array(9)].map((_, i) => (
            <div key={i}>{["Target", "Achieved", "%"][i % 3]}</div>
          ))}
          <div></div>
          <div></div>
        </div>

        {["total_faculty", "journals_sci_wos", "journals_scopus", "avg_publications_per_faculty"].map((key, index) => (
          <div key={index} className="form-grid grid-12-upload form-input">
            <label className="form-label">{index + 1}. {["Total Faculty","Publications (SCI / WoS)","Publications (Scopus)","Avg publications per faculty"][index]}</label>

            {["odd_sem","even_sem","consolidated"].map((sem) =>
              ["target","achieved","percentage"].map((subKey) => (
                <input
                  key={`${sem}_${subKey}`}
                  type="text"
                  value={page2Data.research_publications[key][sem][subKey]}
                 onChange={(e) =>
  handleInputChange(
    "research_publications",
    key,
    subKey,
    e.target.value,
    sem
  )
}
                />
              ))
            )}

            <input
              type="text"
              value={page2Data.research_publications[key].undertaking}
              onChange={(e) => handleInputChange("research_publications", key, "undertaking", e.target.value)}
            />

            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <input
                type="file"
                ref={(el) => (fileRefs.current[key] = el)}
                style={{ display: "none" }}
                onChange={(e) => handleFileChange("research_publications", key, e.target.files[0])}
              />
              <Eye style={{ cursor: "pointer" }} onClick={() => viewFile(page2Data.research_publications[key].pdf_path)} />
              <button type="button" onClick={() => handleUploadClick(key)}>Upload</button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= SECTION VIII ================= */}
      <div className="section">
        <div className="section-title">VIII. RESEARCH FUNDING</div>

        <div className="section-subheader grid-6-upload">
          <div></div>
          <div>Odd Sem</div>
          <div>Even Sem</div>
          <div>Consolidated</div>
          <div>Commitment</div>
          <div>Upload</div>
        </div>

        {["funded_projects_sanctioned","amount_received","ongoing_projects_sanctioned_previous_years","modrobs_proposals_and_amount","sttp_workshops_fdps_entrepreneurship_proposals_and_amount","other_student_schemes_iedc_tnscst"].map((key, index) => (
          <div key={index} className="form-input form-grid grid-6-upload">
            <label className="form-label">{index + 1}. {key.replace(/_/g," ")}</label>

            {["odd_sem","even_sem","consolidated","undertaking"].map((subKey) => (
              <input
                key={subKey}
                type="text"
                value={page2Data.research_funding[key][subKey]}
                onChange={(e) => handleInputChange("research_funding", key, subKey, e.target.value)}
              />
            ))}

            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <input
                type="file"
                ref={(el) => (fileRefs.current[key] = el)}
                style={{ display: "none" }}
                onChange={(e) => handleFileChange("research_funding", key, e.target.files[0])}
              />
              <Eye style={{ cursor: "pointer" }} onClick={() => viewFile(page2Data.research_funding[key].pdf_path)} />
              <button type="button" onClick={() => handleUploadClick(key)}>Upload</button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= SECTION IX ================= */}
      <div className="section">
        <div className="section-title">IX. CONSULTANCY</div>

        <div className="section-subheader grid-6">
          <div></div>
          <div>Odd Sem</div>
          <div>Even Sem</div>
          <div>Consolidated</div>
          <div>Commitment</div>
          <div>Upload</div>
        </div>

        <div className="form-input form-grid grid-6">
          <label className="form-label">1. Amount received as Consultancy</label>

          {["odd_sem","even_sem","consolidated","undertaking"].map((subKey) => (
            <input
              key={subKey}
              type="text"
              value={page2Data.consultancy.amount_received[subKey]}
              onChange={(e) => handleInputChange("consultancy","amount_received",subKey,e.target.value)}
            />
          ))}

          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            <input
              type="file"
              ref={(el) => (fileRefs.current["consultancy"] = el)}
              style={{ display: "none" }}
              onChange={(e) => handleFileChange("consultancy","amount_received", e.target.files[0])}
            />
            <Eye style={{ cursor: "pointer" }} onClick={() => viewFile(page2Data.consultancy.amount_received.pdf_path)} />
            <button type="button" onClick={() => handleUploadClick("consultancy")}>Upload</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page2;