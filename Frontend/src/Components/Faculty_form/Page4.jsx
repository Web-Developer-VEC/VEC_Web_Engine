import React, { useState, useRef } from "react";
import "./FacultyForm.css";
import { Eye } from "lucide-react";

const Page4 = ({ selectedYear, newAcadamicYear, data, setData }) => {
  const fileRefs = useRef({});

  const defaultState = {
  brand_building_admission: {
    prospective_students_covered: {
      odd_sem: { target: "", achieved: "" },
      even_sem: { target: "", achieved: "" },
      consolidated: { target: "", achieved: "" },
      undertaking: "",
      pdf_path: null,
    },
    students_converted_admissions: {
      odd_sem: { target: "", achieved: "" },
      even_sem: { target: "", achieved: "" },
      consolidated: { target: "", achieved: "" },
      undertaking: "",
      pdf_path: null,
    },
  },
  innovation_entrepreneurship_activities: {
    trained_innovation_ambassadors: { value: "", undertaking: "", pdf_path: null },
    teams_participated_sih: { value: "", undertaking: "", pdf_path: null },
    innovations_trl_4_9_yukti: { value: "", undertaking: "", pdf_path: null },
    student_ventures_yukti: { value: "", undertaking: "", pdf_path: null },
    innovative_ideas_final_year_projects: { value: "", undertaking: "", pdf_path: null },
    patents_filed: { value: "", undertaking: "", pdf_path: null },
    patents_published: { value: "", undertaking: "", pdf_path: null },
    patents_granted: { value: "", undertaking: "", pdf_path: null },
    patents_filed_kapila_scheme: { value: "", undertaking: "", pdf_path: null },
    patents_commercialized: { value: "", undertaking: "", pdf_path: null },
  },
};

const [page4Data, setPage4Data] = useState(() => ({
  ...defaultState,
  ...data,

  brand_building_admission: {
    ...defaultState.brand_building_admission,
    ...(data?.brand_building_admission || {}),
  },

  innovation_entrepreneurship_activities: {
    ...defaultState.innovation_entrepreneurship_activities,
    ...(data?.innovation_entrepreneurship_activities || {}),
  },
}));


  // console.log("helo sathish", page4Data);
  
const handleInputChange = (section, key, subKey, value) => {
  setPage4Data((prev) => {
    const updated = { ...prev };

    // 🔥 handle nested sem.target case
    if (subKey.includes(".")) {
      const [sem, field] = subKey.split(".");
      updated[section][key][sem][field] = value;
    } else {
      updated[section][key][subKey] = value;
    }

    return updated;
  });
};

React.useEffect(() => {
  if (setData) {
    setData(page4Data);
  }
}, [page4Data]);

  const handleFileChange = (section, key, file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed!");
      return;
    }
    setPage4Data((prev) => {
      const updated = { ...prev };
      updated[section][key].pdf_path = file;
      return updated;
    });
  };

  const viewFile = (file) => {
    if (file) window.open(URL.createObjectURL(file), "_blank");
  };

  const handleUploadClick = (key) => {
    if (fileRefs.current[key]) fileRefs.current[key].click();
  };

  return (
    <>
      {/* ================= SECTION XV ================= */}
      <div className="section">
        <div className="section-title">XV. BRAND BUILDING FOR ADMISSION</div>

        <div className="section-subheader grid-8c">
          <div></div>
          <div>Odd Sem {selectedYear}</div>
          <div>Even Sem {selectedYear}</div>
          <div>Consolidated {selectedYear}</div>
          <div>Commitment / Undertakings for {newAcadamicYear}</div>
        </div>

        {Object.keys(page4Data.brand_building_admission).map(
          (key, rowIndex) => (
            <div className="form-grid grid-9 form-input" key={rowIndex}>
              <label className="form-label">
                {rowIndex + 1}. {key.replace(/_/g, " ")}
              </label>

              {["odd_sem", "even_sem", "consolidated"].map((sem, i) => (
                <>
                  <input
                    key={`${sem}-target`}
                    type="text"
                    placeholder="Target"
                    value={page4Data.brand_building_admission[key][sem].target}
                    onChange={(e) =>
                      handleInputChange(
                        "brand_building_admission",
                        key,
                        `${sem}.target`,
                        e.target.value,
                      )
                    }
                  />
                  <input
                    key={`${sem}-achieved`}
                    type="text"
                    placeholder="Achieved"
                    value={
                      page4Data.brand_building_admission[key][sem].achieved
                    }
                    onChange={(e) =>
                      handleInputChange(
                        "brand_building_admission",
                        key,
                        `${sem}.achieved`,
                        e.target.value,
                      )
                    }
                  />
                </>
              ))}

              <input
                type="text"
                placeholder="Undertaking"
                value={page4Data.brand_building_admission[key].undertaking}
                onChange={(e) =>
                  handleInputChange(
                    "brand_building_admission",
                    key,
                    "undertaking",
                    e.target.value,
                  )
                }
              />

              <div
                style={{ display: "flex", gap: "4px", alignItems: "center" }}
              >
                <input
                  type="file"
                  style={{ display: "none" }}
                  ref={(el) =>
                    (fileRefs.current[`brand_building_admission_${key}`] = el)
                  }
                  onChange={(e) =>
                    handleFileChange(
                      "brand_building_admission",
                      key,
                      e.target.files[0],
                    )
                  }
                />
                <Eye
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    viewFile(page4Data.brand_building_admission[key].pdf_path)
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    handleUploadClick(`brand_building_admission_${key}`)
                  }
                >
                  Upload
                </button>
              </div>
            </div>
          ),
        )}
      </div>

      {/* ================= SECTION XVI ================= */}
    <div className="section">
  <div className="section-title">
    XVI. INNOVATION AND ENTREPRENEURSHIP ACTIVITIES
  </div>

  {/* ✅ HEADER */}
  <div className="section-subheader grid-innov-header">
    <div></div>
    <div>AY {selectedYear}</div>
    <div>
      Commitment / Undertakings <br />
      AY {newAcadamicYear}
    </div>
    <div>Upload</div>
  </div>

  {Object.keys(page4Data.innovation_entrepreneurship_activities).map(
    (key, index) => (
      <div className="form-grid grid-innov-row form-input" key={index}>
        <label className="form-label">
          {index + 1}. {key.replace(/_/g, " ")}
        </label>

        <input
          type="text"
          value={
            page4Data.innovation_entrepreneurship_activities[key].value || ""
          }
          onChange={(e) =>
            handleInputChange(
              "innovation_entrepreneurship_activities",
              key,
              "value",
              e.target.value
            )
          }
        />

        <input
          type="text"
          value={
            page4Data.innovation_entrepreneurship_activities[key]
              .undertaking || ""
          }
          onChange={(e) =>
            handleInputChange(
              "innovation_entrepreneurship_activities",
              key,
              "undertaking",
              e.target.value
            )
          }
        />

        {/* upload */}
        <div className="upload-cell">
          <input
            type="file"
            style={{ display: "none" }}
            ref={(el) =>
              (fileRefs.current[
                `innovation_entrepreneurship_activities_${key}`
              ] = el)
            }
            onChange={(e) =>
              handleFileChange(
                "innovation_entrepreneurship_activities",
                key,
                e.target.files[0]
              )
            }
          />
          <Eye
            style={{ cursor: "pointer" }}
            onClick={() =>
              viewFile(
                page4Data.innovation_entrepreneurship_activities[key]
                  .pdf_path
              )
            }
          />
          <button
            type="button"
            onClick={() =>
              handleUploadClick(
                `innovation_entrepreneurship_activities_${key}`
              )
            }
          >
            Upload
          </button>
        </div>
      </div>
    )
  )}
</div>
    </>
  );
};

export default Page4;
