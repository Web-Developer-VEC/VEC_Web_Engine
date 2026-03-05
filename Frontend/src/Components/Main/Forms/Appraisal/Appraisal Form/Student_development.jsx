import React, { useState, useRef } from "react";
import "./AppraisalForm.css";
import { Eye } from "lucide-react";

const Student_development = ({ selectedYear, newAcadamicYear, data, setData }) => {
  const fileRefs = useRef({});

  // -------------------- State --------------------
  // ================= FULL STATE FOR PAGE3 =================
  const defaultState = {
    student_development_parameters: {
      value_added_courses_conducted: {
        year1: "",
        year2: "",
        year3: "",
        year4: "",
        total: "",
        undertaking: "",
        pdf_path: null,
      },
      paid_internships: {
        year1: "",
        year2: "",
        year3: "",
        year4: "",
        total: "",
        undertaking: "",
        pdf_path: null,
      },
    },

    professional_associations: {
      faculty_professional_membership: {
        odd_sem: "",
        even_sem: "",
        consolidated: "",
        undertaking: "",
        pdf_path: null,
      },
      student_chapters_available: {
        odd_sem: "",
        even_sem: "",
        consolidated: "",
        undertaking: "",
        pdf_path: null,
      },
      total_student_members: {
        odd_sem: "",
        even_sem: "",
        consolidated: "",
        undertaking: "",
        pdf_path: null,
      },
      student_chapter_activities: {
        odd_sem: "",
        even_sem: "",
        consolidated: "",
        undertaking: "",
        pdf_path: null,
      },
    },

    competitions_participated_won: {
      competitions_participated: {
        odd_sem: "",
        even_sem: "",
        consolidated: "",
        undertaking: "",
        pdf_path: null,
      },
      awards_won: {
        odd_sem: "",
        even_sem: "",
        consolidated: "",
        undertaking: "",
        pdf_path: null,
      },
      prize_money_received: {
        odd_sem: "",
        even_sem: "",
        consolidated: "",
        undertaking: "",
        pdf_path: null,
      },
    },

    mou_centre_of_excellence: {
      mous_signed: {
        odd_sem: "",
        even_sem: "",
        consolidated: "",
        undertaking: "",
        pdf_path: null,
      },
      mou_activities: {
        odd_sem: "",
        even_sem: "",
        consolidated: "",
        undertaking: "",
        pdf_path: null,
      },
    },

    placements_higher_studies_entrepreneurship: {
      companies_visited: {
        companies_visited_value: "",
        undertaking: "",
        pdf_path: null,
      },
      median_salary: {
        median_salary_value: "",
        undertaking: "",
        pdf_path: null,
      },
      students_placed_core_companies: {
        number: "",
        percentage: "",
        undertaking: "",
        pdf_path: null,
      },
      students_admitted_higher_studies: {
        number: "",
        percentage: "",
        undertaking: "",
        pdf_path: null,
      },
      entrepreneurs_evolved: {
        number: "",
        percentage: "",
        undertaking: "",
        pdf_path: null,
      },
    },
  };

  const [page3Data, setPage3Data] = useState(() => ({
    ...defaultState,
    ...data,

    student_development_parameters: {
      ...defaultState.student_development_parameters,
      ...(data?.student_development_parameters || {}),
    },

    professional_associations: {
      ...defaultState.professional_associations,
      ...(data?.professional_associations || {}),
    },

    competitions_participated_won: {
      ...defaultState.competitions_participated_won,
      ...(data?.competitions_participated_won || {}),
    },

    mou_centre_of_excellence: {
      ...defaultState.mou_centre_of_excellence,
      ...(data?.mou_centre_of_excellence || {}),
    },

    placements_higher_studies_entrepreneurship: {
      ...defaultState.placements_higher_studies_entrepreneurship,
      ...(data?.placements_higher_studies_entrepreneurship || {}),
    },
  }));

  React.useEffect(() => {
    if (setData) {
      setData(page3Data);
    }
  }, [page3Data]);

  // -------------------- Handlers --------------------
  const handleInputChange = (section, key, subKey, value) => {
    setPage3Data((prev) => {
      const updated = { ...prev };
      if (subKey) updated[section][key][subKey] = value;
      else updated[section][key] = value;
      return updated;
    });
  };

  const handleFileChange = (section, key, file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed!");
      return;
    }

    setPage3Data((prev) => {
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

  // -------------------- Render Sections --------------------
  return (
    <>
      {/* ================= SECTION X ================= */}
      <div className="section">
        <div className="section-title">X. STUDENT DEVELOPMENT PARAMETERS</div>

        {/* ✅ TOP HEADER — YEARS */}
        <div className="section-subheader grid-sdp-header">
          <div className="col-year-group">AY {selectedYear}</div>

          <div className="col-commit">
            Commitment / Undertakings for {newAcadamicYear}
          </div>
        </div>

        {/* ✅ SUB HEADER — I, II, III, IV, TOTAL */}
        <div className="section-subheader grid-sdp-sub">
          <div></div>
          <>
            <div>I yr</div>
            <div>II yr</div>
            <div>III yr</div>
            <div>IV yr</div>
            <div>Total</div>
          </>
          <div></div>
        </div>

        {/* ✅ ROWS */}
        {["value_added_courses_conducted", "paid_internships"].map(
          (key, rowIndex) => (
            <div className="form-input form-grid grid-sdp-row" key={rowIndex}>
              <label className="form-label">
                {rowIndex + 1}. {key.replace(/_/g, " ")}
              </label>

              {["year1", "year2", "year3", "year4", "total", "undertaking"].map(
                (subKey, i) => (
                  <input
                    key={i}
                    type="text"
                    value={
                      page3Data.student_development_parameters[key][subKey] ||
                      ""
                    }
                    onChange={(e) =>
                      handleInputChange(
                        "student_development_parameters",
                        key,
                        subKey,
                        e.target.value,
                      )
                    }
                  />
                ),
              )}

              {/* ✅ Upload */}
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  id={`upload-sdp-${key}`}
                  style={{ display: "none" }}
                  onChange={(e) =>
                    handleFileChange(
                      "student_development_parameters",
                      key,
                      e.target.files[0],
                    )
                  }
                />

                {/* Upload / Update Button */}
                <label htmlFor={`upload-sdp-${key}`} className="upload-btn">
                  {page3Data.student_development_parameters[key].pdf_path
                    ? "Update"
                    : "Upload"}
                </label>

                {/* Eye Icon */}
                {page3Data.student_development_parameters[key].pdf_path && (
                  <Eye
                    style={{ cursor: "pointer", width: "18px" }}
                    onClick={() => {
                      const file =
                        page3Data.student_development_parameters[key].pdf_path;
                      const fileURL = URL.createObjectURL(file);
                      window.open(fileURL, "_blank");
                    }}
                  />
                )}
              </div>
            </div>
          ),
        )}
      </div>

      {/* ================= SECTION XI ================= */}
      <div className="section">
        <div className="section-title">XI. PROFESSIONAL ASSOCIATIONS</div>

        <div className="section-subheader grid-6">
          <div></div>
          <div>Odd Sem</div>
          <div>Even Sem</div>
          <div>Consolidated</div>
          <div>Commitment</div>
          <div>Upload</div>
        </div>

        {Object.keys(page3Data.professional_associations).map((key, index) => (
          <div className="form-input form-grid grid-6" key={index}>
            <label className="form-label">
              {index + 1}. {key.replace(/_/g, " ")}
            </label>

            {["odd_sem", "even_sem", "consolidated", "undertaking"].map(
              (subKey, i) => (
                <input
                  key={i}
                  type="text"
                  value={page3Data.professional_associations[key][subKey]}
                  onChange={(e) =>
                    handleInputChange(
                      "professional_associations",
                      key,
                      subKey,
                      e.target.value,
                    )
                  }
                />
              ),
            )}

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="file"
                accept="application/pdf"
                id={`upload-pa-${key}`}
                style={{ display: "none" }}
                onChange={(e) =>
                  handleFileChange(
                    "professional_associations",
                    key,
                    e.target.files[0],
                  )
                }
              />

              {/* Upload / Update Button */}
              <label htmlFor={`upload-pa-${key}`} className="upload-btn">
                {page3Data.professional_associations[key].pdf_path
                  ? "Update"
                  : "Upload"}
              </label>

              {/* Eye Icon */}
              {page3Data.professional_associations[key].pdf_path && (
                <Eye
                  style={{ cursor: "pointer", width: "18px" }}
                  onClick={() => {
                    const file =
                      page3Data.professional_associations[key].pdf_path;
                    const fileURL = URL.createObjectURL(file);
                    window.open(fileURL, "_blank");
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ================= SECTION XII ================= */}
      <div className="section">
        <div className="section-title">XII. COMPETITIONS</div>

        <div className="section-subheader grid-6">
          <div></div>
          <div>Odd Sem</div>
          <div>Even Sem</div>
          <div>Consolidated</div>
          <div>Commitment</div>
          <div>Upload</div>
        </div>

        {Object.keys(page3Data.competitions_participated_won).map(
          (key, index) => (
            <div className="form-input form-grid grid-6" key={index}>
              <label className="form-label">
                {index + 1}. {key.replace(/_/g, " ")}
              </label>

              {["odd_sem", "even_sem", "consolidated", "undertaking"].map(
                (subKey, i) => (
                  <input
                    key={i}
                    type="text"
                    value={page3Data.competitions_participated_won[key][subKey]}
                    onChange={(e) =>
                      handleInputChange(
                        "competitions_participated_won",
                        key,
                        subKey,
                        e.target.value,
                      )
                    }
                  />
                ),
              )}

              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  id={`upload-competition-${key}`}
                  style={{ display: "none" }}
                  onChange={(e) =>
                    handleFileChange(
                      "competitions_participated_won",
                      key,
                      e.target.files[0],
                    )
                  }
                />

                {/* Upload / Update Button */}
                <label
                  htmlFor={`upload-competition-${key}`}
                  className="upload-btn"
                >
                  {page3Data.competitions_participated_won[key].pdf_path
                    ? "Update"
                    : "Upload"}
                </label>

                {/* Eye Icon */}
                {page3Data.competitions_participated_won[key].pdf_path && (
                  <Eye
                    style={{ cursor: "pointer", width: "18px" }}
                    onClick={() => {
                      const file =
                        page3Data.competitions_participated_won[key].pdf_path;
                      const fileURL = URL.createObjectURL(file);
                      window.open(fileURL, "_blank");
                    }}
                  />
                )}
              </div>
            </div>
          ),
        )}
      </div>

      {/* ================= SECTION XIII ================= */}
      <div className="section">
        <div className="section-title">XIII. MoU / CENTRE OF EXCELLENCE</div>

        <div className="section-subheader grid-6">
          <div></div>
          <div>Odd Sem</div>
          <div>Even Sem</div>
          <div>Consolidated</div>
          <div>Commitment</div>
          <div>Upload</div>
        </div>

        {Object.keys(page3Data.mou_centre_of_excellence).map((key, index) => (
          <div className="form-input form-grid grid-6" key={index}>
            <label className="form-label">
              {index + 1}. {key.replace(/_/g, " ")}
            </label>

            {["odd_sem", "even_sem", "consolidated", "undertaking"].map(
              (subKey, i) => (
                <input
                  key={i}
                  type="text"
                  value={page3Data.mou_centre_of_excellence[key][subKey]}
                  onChange={(e) =>
                    handleInputChange(
                      "mou_centre_of_excellence",
                      key,
                      subKey,
                      e.target.value,
                    )
                  }
                />
              ),
            )}

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="file"
                accept="application/pdf"
                id={`upload-mou-${key}`}
                style={{ display: "none" }}
                onChange={(e) =>
                  handleFileChange(
                    "mou_centre_of_excellence",
                    key,
                    e.target.files[0],
                  )
                }
              />

              {/* Upload / Update Button */}
              <label htmlFor={`upload-mou-${key}`} className="upload-btn">
                {page3Data.mou_centre_of_excellence[key].pdf_path
                  ? "Update"
                  : "Upload"}
              </label>

              {/* Eye Icon */}
              {page3Data.mou_centre_of_excellence[key].pdf_path && (
                <Eye
                  style={{ cursor: "pointer", width: "18px" }}
                  onClick={() => {
                    const file =
                      page3Data.mou_centre_of_excellence[key].pdf_path;
                    const fileURL = URL.createObjectURL(file);
                    window.open(fileURL, "_blank");
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ================= SECTION XIV ================= */}
      <div className="section">
        <div className="section-title">
          XIV. PLACEMENTS, HIGHER STUDIES, ENTREPRENEURSHIP
        </div>

        {/* ===== HEADER ROW 1 ===== */}
        <div className="naac-grid header-main">
          <div></div>
          <div></div>

          {/* Dynamic Year */}
          {Array.from({ length: 1 }).map((_, i) => (
            <div key={i} className="center span-2">
              AY 2021-22
            </div>
          ))}

          <div className="center">Commitment</div>
          <div className="center">Upload</div>
        </div>

        {/* ===== HEADER ROW 2 ===== */}
        <div className="naac-grid header-sub">
          <div></div>
          <div></div>

          {Array.from({ length: 1 }).map((_, i) => (
            <React.Fragment key={i}>
              <div className="center"></div>
              <div className="center"></div>
            </React.Fragment>
          ))}

          <div></div>
          <div></div>
        </div>

        {/* ===== DATA ROWS ===== */}
        {Object.keys(page3Data.placements_higher_studies_entrepreneurship).map(
          (key, index) => {
            const row =
              page3Data.placements_higher_studies_entrepreneurship[key];

            const isSingleValue =
              "companies_visited_value" in row || "median_salary_value" in row;

            return (
              <div className="naac-grid data-row" key={index}>
                {/* S.NO */}
                <div>{index + 1}</div>

                {/* LABEL */}
                <div className="form-label">{key.replace(/_/g, " ")}</div>

                {/* ===== YEAR DATA ===== */}
                {isSingleValue ? (
                  <>
                    <input
                      type="text"
                      value={
                        row.companies_visited_value ??
                        row.median_salary_value ??
                        ""
                      }
                      onChange={(e) => {
                        const valueKey =
                          "companies_visited_value" in row
                            ? "companies_visited_value"
                            : "median_salary_value";

                        handleInputChange(
                          "placements_higher_studies_entrepreneurship",
                          key,
                          valueKey,
                          e.target.value,
                        );
                      }}
                    />
                    <div></div>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      value={row.number || ""}
                      placeholder="Number"
                      onChange={(e) =>
                        handleInputChange(
                          "placements_higher_studies_entrepreneurship",
                          key,
                          "number",

                          e.target.value,
                        )
                      }
                    />
                    <input
                      type="text"
                      value={row.percentage || ""}
                      placeholder="%"
                      onChange={(e) =>
                        handleInputChange(
                          "placements_higher_studies_entrepreneurship",
                          key,
                          "percentage",
                          e.target.value,
                        )
                      }
                    />
                  </>
                )}

                {/* ===== COMMITMENT ===== */}
                <input
                  type="text"
                  value={row.undertaking || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "placements_higher_studies_entrepreneurship",
                      key,
                      "undertaking",
                      e.target.value,
                    )
                  }
                />

                {/* ===== UPLOAD ===== */}
                <div
                  className="upload-cell"
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  <input
                    type="file"
                    accept="application/pdf"
                    id={`upload-placement-${key}`}
                    style={{ display: "none" }}
                    onChange={(e) =>
                      handleFileChange(
                        "placements_higher_studies_entrepreneurship",
                        key,
                        e.target.files[0],
                      )
                    }
                  />

                  {/* Upload / Update Button */}
                  <label
                    htmlFor={`upload-placement-${key}`}
                    className="upload-btn"
                  >
                    {row.pdf_path ? "Update" : "Upload"}
                  </label>

                  {/* Eye Icon */}
                  {row.pdf_path && (
                    <Eye
                      style={{ cursor: "pointer", width: "18px" }}
                      onClick={() => {
                        const fileURL = URL.createObjectURL(row.pdf_path);
                        window.open(fileURL, "_blank");
                      }}
                    />
                  )}
                </div>
              </div>
            );
          },
        )}
      </div>
    </>
  );
};

export default Student_development;
