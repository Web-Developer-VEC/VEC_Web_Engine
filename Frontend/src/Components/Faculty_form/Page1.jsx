import React, { useEffect } from "react";
import "./FacultyForm.css";
import { FaEye } from "react-icons/fa";

const Page1 = ({ selectedYear, newAcadamicYear, data, setData }) => {

  // ================= FULL STATE FOR PAGE1 =================
 const defaultState = {
  essential_parameters: {
    research_status: { present_status: "", undertaking: "", pdf_path: null },
    nba_status: { present_status: "", undertaking: "", pdf_path: null },
  },
  student_admitted_details: {
    sanctioned_strength: { sanctioned_value: "", undertaking: "", pdf_path: null },
    students_on_roll: { students_on_roll_value: "", undertaking: "", pdf_path: null },
    vacant_seats: { vacant_seats_value: "", undertaking: "", pdf_path: null },
  },
  end_sem_results: {
    student_appeared: {
      odd_sem: { year1: "", year2: "", year3: "", year4: "" },
      even_sem: { year1: "", year2: "", year3: "", year4: "" },
      undertaking: "",
      pdf_path: null
    },
    student_passed: {
      odd_sem: { year1: "", year2: "", year3: "", year4: "" },
      even_sem: { year1: "", year2: "", year3: "", year4: "" },
      undertaking: "",
      pdf_path: null
    },
    pass_percent: {
      odd_sem: { year1: "", year2: "", year3: "", year4: "" },
      even_sem: { year1: "", year2: "", year3: "", year4: "" },
      undertaking: "",
      pdf_path: null
    },
  },
  graduation_success_rate: {
    total_on_roll: { default: "", undertaking: "", pdf_path: null },
    total_graduated: { default: "", undertaking: "", pdf_path: null },
    percent_graduated: { default: "", undertaking: "", pdf_path: null },
    average_cgpa: { default: "", undertaking: "", pdf_path: null },
    university_ranks: { default: "", undertaking: "", pdf_path: null },
  },
  faculty_learning: {
    total_faculty: { odd_sem: "", even_sem: "", consolidated: "", undertaking: "", pdf_path: null },
    nptel_completed: { odd_sem: "", even_sem: "", consolidated: "", undertaking: "", pdf_path: null },
    fdps_attended: { odd_sem: "", even_sem: "", consolidated: "", undertaking: "", pdf_path: null },
    fdps_organized: { odd_sem: "", even_sem: "", consolidated: "", undertaking: "", pdf_path: null },
  },
};

const [page1Data, setPage1Data] = React.useState(() => ({
  ...defaultState,
  ...data, // merge any incoming data
  essential_parameters: {
    ...defaultState.essential_parameters,
    ...(data?.essential_parameters || {}),
  },
  student_admitted_details: {
    ...defaultState.student_admitted_details,
    ...(data?.student_admitted_details || {}),
  },
  end_sem_results: {
    ...defaultState.end_sem_results,
    ...(data?.end_sem_results || {}),
  },
  graduation_success_rate: {
    ...defaultState.graduation_success_rate,
    ...(data?.graduation_success_rate || {}),
  },
  faculty_learning: {
    ...defaultState.faculty_learning,
    ...(data?.faculty_learning || {}),
  },
}));


  useEffect(() => {
  if (setData) {
    setData(page1Data);
  }
}, [page1Data]); 


// ================= GENERIC TEXT INPUT HANDLER =================
const handleInputChange = (path, value) => {
  setPage1Data((prev) => {
    const newData = structuredClone(prev);
    let current = newData;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    current[path[path.length - 1]] = value;
    return newData;
  });
  };

  // ================= FILE HANDLER WITH VALIDATION =================
  const handleFileChange = (path, file) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed!");
      return;
    }

    setPage1Data((prev) => {
      const newData = structuredClone(prev);
      let current = newData;
      for (let i = 0; i < path.length - 1; i++) current = current[path[i]];
      current[path[path.length - 1]] = file;
      return newData;
    });
  };

  // ================= FILE PREVIEW =================
  const renderPreview = (path) => {
    let current = page1Data;
    for (let i = 0; i < path.length; i++) current = current[path[i]];
    if (!current) return null;
    const fileURL = URL.createObjectURL(current);
    return (
      <a href={fileURL} target="_blank" rel="noopener noreferrer">
        <FaEye style={{ cursor: "pointer", marginLeft: "8px" }} />
      </a>
    );
  };

  // console.log("Page1 Data:", page1Data);

  return (
    <>
      {/* ================= SECTION I ================= */}
      <div className="section">
        <h3 className="section-title">I. ESSENTIAL PARAMETERS</h3>
        <div className="form-row grid-4-upload" style={{ fontWeight: "bold", borderBottom: "2px solid black", paddingBottom: "8px" }}>
          <div></div><div>Present Status</div><div>Commitment Undertakings</div><div>Upload</div>
        </div>

        {/* Row 1: Research Status */}
        <div className="form-row grid-4-upload">
          <label>1. Department Research status</label>
          <input
            type="text"
            value={page1Data.essential_parameters.research_status.present_status || ""}
            onChange={(e) => handleInputChange(["essential_parameters", "research_status", "present_status"], e.target.value)}
          />
          <input
            type="text"
            value={page1Data.essential_parameters.research_status.undertaking || ""}
            onChange={(e) => handleInputChange(["essential_parameters", "research_status", "undertaking"], e.target.value)}
          />
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => handleFileChange(["essential_parameters", "research_status", "pdf_path"], e.target.files[0])}
            />
            {renderPreview(["essential_parameters", "research_status", "pdf_path"])}
          </div>
        </div>

        {/* Row 2: NBA Status */}
        <div className="form-row grid-4-upload">
          <label>2. Department NBA status</label>
          <input
            type="text"
            value={page1Data.essential_parameters.nba_status.present_status}
            onChange={(e) => handleInputChange(["essential_parameters", "nba_status", "present_status"], e.target.value)}
          />
          <input
            type="text"
            value={page1Data.essential_parameters.nba_status.undertaking}
            onChange={(e) => handleInputChange(["essential_parameters", "nba_status", "undertaking"], e.target.value)}
          />
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => handleFileChange(["essential_parameters", "nba_status", "pdf_path"], e.target.files[0])}
            />
            {renderPreview(["essential_parameters", "nba_status", "pdf_path"])}
          </div>
        </div>
      </div>

      {/* ================= SECTION II ================= */}
      <div className="section">
        <h3 className="section-title">II. DEPARTMENT STUDENT ADMITTED DETAILS</h3>
        <div className="form-header">
          <div></div>
          <div>AY {selectedYear}</div>
          <div>Commitment {newAcadamicYear}</div>
        </div>

        <div className="form-row">
          <label>1. Sanctioned strength</label>
          <input
            type="text"
            value={page1Data.student_admitted_details.sanctioned_strength.sanctioned_value}
            onChange={(e) => handleInputChange(["student_admitted_details", "sanctioned_strength", "sanctioned_value"], e.target.value)}
          />
          <input
            type="text"
            value={page1Data.student_admitted_details.sanctioned_strength.undertaking}
            onChange={(e) => handleInputChange(["student_admitted_details", "sanctioned_strength", "undertaking"], e.target.value)}
          />
        </div>

        <div className="form-row">
          <label>2. No of students on roll including LE</label>
          <input
            type="text"
            value={page1Data.student_admitted_details.students_on_roll.students_on_roll_value}
            onChange={(e) => handleInputChange(["student_admitted_details", "students_on_roll", "students_on_roll_value"], e.target.value)}
          />
          <input
            type="text"
            value={page1Data.student_admitted_details.students_on_roll.undertaking}
            onChange={(e) => handleInputChange(["student_admitted_details", "students_on_roll", "undertaking"], e.target.value)}
          />
        </div>

        <div className="form-row">
          <label>3. Vacant seats</label>
          <input
            type="text"
            value={page1Data.student_admitted_details.vacant_seats.vacant_seats_value}
            onChange={(e) => handleInputChange(["student_admitted_details", "vacant_seats", "vacant_seats_value"], e.target.value)}
          />
          <input
            type="text"
            value={page1Data.student_admitted_details.vacant_seats.undertaking}
            onChange={(e) => handleInputChange(["student_admitted_details", "vacant_seats", "undertaking"], e.target.value)}
          />
        </div>
      </div>

       {/* ================= SECTION III: END SEM RESULTS ================= */}
      <div className="section">
        <h3 className="section-title">III. END SEMESTER EXAM RESULTS ANALYSIS</h3>
        <br />
        <div className="section-group-header grid-z">
          <div></div>
          <div className="group-title" style={{ gridColumn: "2 / 6" }}>Odd Sem AY {selectedYear}</div>
          <div className="group-title" style={{ gridColumn: "6 / 10" }}>Even Sem AY {selectedYear}</div>
        
        </div>

        <div className="section-subheader grid-z">
          <div></div>
          <div>I Year</div><div>II Year</div><div>III Year</div><div>IV Year</div>
          <div>I Year</div><div>II Year</div><div>III Year</div><div>IV Year</div>  <div className="group-title">Commitment / Undertakings for {newAcadamicYear}</div>
          <div></div>
        </div>

        {["student_appeared", "student_passed", "pass_percent"].map((key) => (
          <div key={key} className="form-grid grid-z form-input">
            <label className="form-label">{key.replace("_", " ").toUpperCase()}</label>

            {[...Array(8)].map((_, i) => {
              const sem = i < 4 ? "odd_sem" : "even_sem";
              const yearKey = `year${i % 4 + 1}`;
              return (
                <input
                  key={i}
                  type="text"
                  value={page1Data.end_sem_results[key][sem][yearKey]}
                  onChange={(e) =>
                    handleInputChange(["end_sem_results", key, sem, yearKey], e.target.value)
                  }
                />
              );
            })}

            <input
              type="text"
              value={page1Data.end_sem_results[key].undertaking}
              onChange={(e) => handleInputChange(["end_sem_results", key, "undertaking"], e.target.value)}
            />
            <div>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => handleFileChange(["end_sem_results", key, "pdf_path"], e.target.files[0])}
              />
              {renderPreview(["end_sem_results", key, "pdf_path"])}
            </div>
          </div>
        ))}
      </div>

      {/* ================= SECTION IV: GRADUATION SUCCESS ================= */}
      <div className="section">
        <h3 className="section-title">IV. GRADUATION SUCCESS RATE</h3>
        <div className="section-subheader grid-4">
          <div></div>
          <div>{selectedYear}</div>
          <div>Commitment/Undertakings for {newAcadamicYear}</div>
        </div>

        {["total_on_roll","total_graduated","percent_graduated","average_cgpa","university_ranks"].map((key) => (
          <div key={key} className="form-grid grid-4 form-input">
            <label className="form-label">{key.replace("_"," ").toUpperCase()}</label>
            <input
              type="text"
              value={page1Data.graduation_success_rate[key][selectedYear]}
              onChange={(e) => handleInputChange(["graduation_success_rate", key, selectedYear], e.target.value)}
            />
            <input
              type="text"
              value={page1Data.graduation_success_rate[key].undertaking}
              onChange={(e) => handleInputChange(["graduation_success_rate", key, "undertaking"], e.target.value)}
            />
            <div>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => handleFileChange(["graduation_success_rate", key, "pdf_path"], e.target.files[0])}
              />
              {renderPreview(["graduation_success_rate", key, "pdf_path"])}
            </div>
          </div>
        ))}
      </div>

      {/* ================= SECTION V: FACULTY LEARNING ================= */}
      <div className="section">
        <h3 className="section-title">V. FACULTY CONTINUOUS LEARNING</h3>
        <div className="form-grid grid-6-upload" style={{ fontWeight:"bold", borderBottom:"2px solid black", paddingBottom:"8px", marginBottom:"10px" }}>
          <div></div><div>Odd Sem</div><div>Even Sem</div><div>Consolidated</div><div>Commitment</div><div>Upload</div>
        </div>

        {["total_faculty","nptel_completed","fdps_attended","fdps_organized"].map((key, idx) => (
          <div key={key} className="form-grid grid-6-upload form-input">
            <label className="form-label">{idx+1}. {key.replace("_"," ").toUpperCase()}</label>
            {["odd_sem","even_sem","consolidated"].map((sem) => (
              <input
                key={sem}
                type="text"
                value={page1Data.faculty_learning[key][sem]}
                onChange={(e) => handleInputChange(["faculty_learning", key, sem], e.target.value)}
              />
            ))}
            <input
              type="text"
              value={page1Data.faculty_learning[key].undertaking}
              onChange={(e) => handleInputChange(["faculty_learning", key, "undertaking"], e.target.value)}
            />
            <div>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => handleFileChange(["faculty_learning", key, "pdf_path"], e.target.files[0])}
              />
              {renderPreview(["faculty_learning", key, "pdf_path"])}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Page1;