import React, { useState, useMemo, useRef, useEffect } from "react";
import Banner from "../../../Banner";
import "./QP.css";
import { useNavigate } from "react-router-dom";


const branchesByDegree = {
  BE: [
    "Automobile Engineering",
    "Civil Engineering",
    "Computer Science Engineering",
    "Cyber Security Engineering",
    "Electrical and Electronic Engineering",
    "Electronics and Communication Engineering",
    "Electronics and Instrumentation Engineering",
    "Mechanical Engineering",
  ],
  BTech: [
    "Artificial Intelligence and Data Science",
    "Information Technology",
  ],
};

const departmentOptions = [
  "Computer Science (CSE)",
  "Electronics (ECE)",
  "Mechanical (ME)",
  "Civil (CE)",
  "Information Technology (IT)",
  "Aerospace (AE)",
];

const subjectsMap = {
  "Automobile Engineering": {
    I: {
      "1st Semester": ["Maths I (Auto)", "Physics I (Auto)"],
      "2nd Semester": ["Maths II (Auto)", "Chemistry (Auto)"],
    },
    II: {
      "3rd Semester": ["Vehicle Dynamics", "Thermodynamics"],
      "4th Semester": ["Manufacturing", "Fluid Mechanics"],
    },
    III: {
      "5th Semester": ["Automobile Engines", "CAD"],
      "6th Semester": ["Automotive Electronics", "Strength of Materials"],
    },
    IV: {
      "7th Semester": ["Automotive Design", "Elective"],
      "8th Semester": ["Project", "Seminar"],
    },
  },

  "Civil Engineering": {
    I: {
      "1st Semester": ["Maths I (Civil)", "Physics I (Civil)"],
      "2nd Semester": ["Maths II (Civil)", "Chemistry (Civil)"],
    },
    II: {
      "3rd Semester": ["Building Materials", "Surveying"],
      "4th Semester": ["Strength of Materials", "Geotech"],
    },
    III: {
      "5th Semester": ["Structural Analysis", "Design of Steel"],
      "6th Semester": ["Design of Concrete", "Transportation Engineering"],
    },
    IV: {
      "7th Semester": ["Environment Engineering", "Elective"],
      "8th Semester": ["Project", "Seminar"],
    },
  },

  "Computer Science Engineering": {
    I: {
      "1st Semester": ["Maths I (CS)", "Physics I (CS)"],
      "2nd Semester": ["Maths II (CS)", "Chemistry (CS)"],
    },
    II: {
      "3rd Semester": ["Data Structures", "Discrete Maths"],
      "4th Semester": ["DBMS", "Operating Systems"],
    },
    III: {
      "5th Semester": ["Algorithms", "Software Engineering"],
      "6th Semester": ["Machine Learning", "Compiler Design"],
    },
    IV: {
      "7th Semester": ["Distributed Systems", "Cloud Computing"],
      "8th Semester": ["Project Work", "Elective"],
    },
  },

  "Cyber Security Engineering": {
    I: {
      "1st Semester": ["Maths I (CSec)", "Physics I (CSec)"],
      "2nd Semester": ["Maths II (CSec)", "Chemistry (CSec)"],
    },
    II: {
      "3rd Semester": ["Network Fundamentals", "Discrete Maths"],
      "4th Semester": ["Security Basics", "DBMS"],
    },
    III: {
      "5th Semester": ["Cryptography", "Ethical Hacking"],
      "6th Semester": ["Secure Programming", "Forensics"],
    },
    IV: {
      "7th Semester": ["Advanced Security", "Elective"],
      "8th Semester": ["Project", "Seminar"],
    },
  },

  "Electrical and Electronic Engineering": {
    I: {
      "1st Semester": ["Maths I (EE)", "Physics I (EE)"],
      "2nd Semester": ["Maths II (EE)", "Chemistry (EE)"],
    },
    II: {
      "3rd Semester": ["Circuit Theory", "Digital Logic"],
      "4th Semester": ["Signals", "Electromagnetics"],
    },
    III: {
      "5th Semester": ["Power Systems", "Control Systems"],
      "6th Semester": ["Power Electronics", "Measurements"],
    },
    IV: {
      "7th Semester": ["Renewable Energy", "Elective"],
      "8th Semester": ["Project", "Seminar"],
    },
  },

  "Electronics and Communication Engineering": {
    I: {
      "1st Semester": ["Maths I (ECE)", "Physics I (ECE)"],
      "2nd Semester": ["Maths II (ECE)", "Chemistry (ECE)"],
    },
    II: {
      "3rd Semester": ["Electronic Devices", "Digital Logic"],
      "4th Semester": ["Analog Circuits", "Signals"],
    },
    III: {
      "5th Semester": ["Communication Systems", "Microprocessors"],
      "6th Semester": ["VLSI", "Embedded Systems"],
    },
    IV: {
      "7th Semester": ["Wireless Comm", "Elective"],
      "8th Semester": ["Project", "Seminar"],
    },
  },

  "Electronics and Instrumentation Engineering": {
    I: {
      "1st Semester": ["Maths I (EIE)", "Physics I (EIE)"],
      "2nd Semester": ["Maths II (EIE)", "Chemistry (EIE)"],
    },
    II: {
      "3rd Semester": ["Instrumentation I", "Signals"],
      "4th Semester": ["Sensors", "Control Systems"],
    },
    III: {
      "5th Semester": ["Process Control", "Measurement Systems"],
      "6th Semester": ["Advanced Instrumentation", "Embedded Systems"],
    },
    IV: {
      "7th Semester": ["Industrial Instrumentation", "Elective"],
      "8th Semester": ["Project", "Seminar"],
    },
  },

  "Mechanical Engineering": {
    I: {
      "1st Semester": ["Maths I (Mech)", "Physics I (Mech)"],
      "2nd Semester": ["Maths II (Mech)", "Chemistry (Mech)"],
    },
    II: {
      "3rd Semester": ["Thermodynamics I", "Mechanics"],
      "4th Semester": ["Manufacturing Processes", "Material Science"],
    },
    III: {
      "5th Semester": ["Machine Design", "Fluid Mechanics"],
      "6th Semester": ["Heat Transfer", "CAD"],
    },
    IV: {
      "7th Semester": ["Automations", "Elective"],
      "8th Semester": ["Project", "Seminar"],
    },
  },

  "Artificial Intelligence and Data Science": {
    I: {
      "1st Semester": ["Maths I (AI)", "Physics I (AI)"],
      "2nd Semester": ["Maths II (AI)", "Chemistry (AI)"],
    },
    II: {
      "3rd Semester": ["Programming", "Discrete Maths"],
      "4th Semester": ["Data Structures", "Statistics"],
    },
    III: {
      "5th Semester": ["ML Basics", "DBMS"],
      "6th Semester": ["Deep Learning", "Data Mining"],
    },
    IV: {
      "7th Semester": ["AI Elective", "Project"],
      "8th Semester": ["Project", "Seminar"],
    },
  },

  "Information Technology": {
    I: {
      "1st Semester": ["Maths I (IT)", "Physics I (IT)"],
      "2nd Semester": ["Maths II (IT)", "Chemistry (IT)"],
    },
    II: {
      "3rd Semester": ["Programming", "Digital Logic"],
      "4th Semester": ["DBMS", "Networks"],
    },
    III: {
      "5th Semester": ["Web Tech", "Software Eng"],
      "6th Semester": ["Security", "Cloud"],
    },
    IV: {
      "7th Semester": ["Elective", "Project"],
      "8th Semester": ["Project", "Seminar"],
    },
  },
};

function yearToSemestersLookup(y) {
  const map = {
    I: ["1st Semester", "2nd Semester"],
    II: ["3rd Semester", "4th Semester"],
    III: ["5th Semester", "6th Semester"],
    IV: ["7th Semester", "8th Semester"],
  };
  return map[y] || [];
}

const DepartmentsMultiDropdown = ({ options, value, onChange, disabled, placeholder }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const availableOptions = options.filter((o) => !value.includes(o));

  const toggleOpen = () => {
    if (disabled) return;
    setOpen((v) => !v);
  };

  const addOption = (opt) => {
    onChange([...value, opt]);
  };

  const removeOption = (opt, e) => {
    if (e) e.stopPropagation();
    onChange(value.filter((v) => v !== opt));
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div className={`gt-multiwrap ${disabled ? "disabled" : ""}`} ref={rootRef}>
      <button
        type="button"
        className="gt-multitoggle"
        onClick={toggleOpen}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="gt-multitags">
          {value.length === 0 ? (
            <span className="gt-placeholder">{placeholder}</span>
          ) : (
            value.map((v) => (
              <span key={v} className="gt-tag">
                <span className="gt-tag-text">{v}</span>
                <button
                  type="button"
                  className="gt-tag-close"
                  onClick={(e) => removeOption(v, e)}
                  aria-label={`Remove ${v}`}  
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>

        <div className="gt-multi-actions">
          {value.length > 0 && (
            <button className="gt-clear" onClick={clearAll} aria-label="Clear selection">
              ×
            </button>
          )}
          <span className={`gt-caret ${open ? "open" : ""}`} aria-hidden>
            ▾
          </span>
        </div>
      </button>

      {open && (
        <ul className="gt-dropdown" role="listbox" aria-multiselectable="true">
          {availableOptions.length === 0 ? (
            <li className="gt-option gt-option-muted">No more departments</li>
          ) : (
            availableOptions.map((opt) => (
              <li
                key={opt}
                className="gt-option"
                onClick={() => addOption(opt)}
                role="option"
                aria-selected="false"
              >
                <span className="gt-option-label">{opt}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

const GenerateTable = () => {
  const [degree, setDegree] = useState("");
  const [regulation, setRegulation] = useState("");
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [departments, setDepartments] = useState([]);
  const [exam, setExam] = useState("");
  const [previewData, setPreviewData] = useState(null);
  const navigate = useNavigate();

  const branchOptions = useMemo(() => {
    if (!degree) return [];
    return branchesByDegree[degree] || [];
  }, [degree]);

  const subjectOptions = useMemo(() => {
    if (!branch || !year || !semester) return [];
    const b = subjectsMap[branch];
    if (!b) return [];
    const y = b[year];
    if (!y) return [];
    const s = y[semester];
    return Array.isArray(s) ? s : [];
  }, [branch, year, semester]);

  const handleDegreeChange = (val) => {
    setDegree(val);
    setRegulation("");
    setYear("");
    setBranch("");
    setSemester("");
    setSubject("");
    setDepartments([]);
    setExam("");
    setPreviewData(null);
  };

  const handleRegulationChange = (val) => {
    setRegulation(val);
    setYear("");
    setBranch("");
    setSemester("");
    setSubject("");
    setDepartments([]);
    setExam("");
    setPreviewData(null);
  };

  const handleYearChange = (val) => {
    setYear(val);
    setBranch("");
    setSemester("");
    setSubject("");
    setDepartments([]);
    setExam("");
    setPreviewData(null);
  };

  const handleBranchChange = (val) => {
    setBranch(val);
    setSemester("");
    setSubject("");
    setDepartments([]);
    setExam("");
    setPreviewData(null);
  };

  const handleSemesterChange = (val) => {
    setSemester(val);
    setSubject("");
    setDepartments([]);
    setExam("");
    setPreviewData(null);
  };

  const handleSubjectChange = (val) => {
    setSubject(val);
    setDepartments([]);
    setExam("");
    setPreviewData(null);
  };

  const handleDepartmentsChange = (selected) => {
    setDepartments(selected);
    setExam("");
    setPreviewData(null);
  };

  const handleExamChange = (val) => {
    setExam(val);
    setPreviewData(null);
  };

  const allFilled =
    degree &&
    regulation &&
    year &&
    branch &&
    semester &&
    subject &&
    departments.length > 0 &&
    exam;

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!allFilled) {
      alert("Please complete all fields before generating.");
      return;
    }

    const data = {
      degree: degree === "BE" ? "B.E" : "B.Tech",
      regulation: regulation === "19" ? "19 Regulation" : "23 Regulation",
      year,
      branch,
      semester,
      subject,
      departments,
      exam,
    };

    setPreviewData(data);
    console.log("Generated data:", data);
  };

  return (
    <>
    <Banner
        
        backgroundImage="./Banners/examsbanner.webp"
        headerText="Question Paper Generator"
        subHeaderText="QPG"
      />

    <div className="gt-page">
      <form className="gt-form" onSubmit={handleGenerate}>
        <h2 className="gt-title ">Quesion Paper Generator</h2>

        {/* Degree */}
        <div className="gt-row">
          <label className="gt-label">Degree:</label>
          <div className="gt-radio-group">
            <label className="gt-radio-label">
              <input
                type="radio"
                name="degree"
                value="BE"
                checked={degree === "BE"}
                onChange={() => handleDegreeChange("BE")}
              />{" "}
              B.E
            </label>
            <label className="gt-radio-label">
              <input
                type="radio"
                name="degree"
                value="BTech"
                checked={degree === "BTech"}
                onChange={() => handleDegreeChange("BTech")}
              />{" "}
              B.Tech
            </label>
          </div>
        </div>

        {/* Regulation */}
        <div className="gt-row">
          <label className="gt-label">Regulation:</label>
          <div className="gt-radio-group">
            <label className="gt-radio-label">
              <input
                type="radio"
                name="regulation"
                value="19"
                checked={regulation === "19"}
                onChange={() => handleRegulationChange("19")}
                disabled={!degree}
              />{" "}
              19 Regulation
            </label>
            <label className="gt-radio-label">
              <input
                type="radio"
                name="regulation"
                value="23"
                checked={regulation === "23"}
                onChange={() => handleRegulationChange("23")}
                disabled={!degree}
              />{" "}
              23 Regulation
            </label>
          </div>
        </div>

        {/* Year */}
        <div className="gt-row">
          <label className="gt-label">Year:</label>
          <div className="gt-radio-group">
            {["I", "II", "III", "IV"].map((y) => (
              <label key={y} className="gt-radio-label">
                <input
                  type="radio"
                  name="year"
                  value={y}
                  checked={year === y}
                  onChange={() => handleYearChange(y)}
                  disabled={!regulation}
                />{" "}
                {y}
              </label>
            ))}
          </div>
        </div>

        {/* Branch (depends on selected degree; enabled after Year as before) */}
        <div className="gt-row">
          <label className="gt-label">Branch Paper:</label>
          <select
            className="gt-select"
            value={branch}
            onChange={(e) => handleBranchChange(e.target.value)}
            disabled={!year || !degree}
          >
            <option value="" disabled>
              -- Select Branch --
            </option>
            {branchOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Semester (depends on Year) */}
        <div className="gt-row">
          <label className="gt-label">Semester:</label>
          <div className="gt-radio-group">
            {year ? (
              yearToSemestersLookup(year).map((s) => (
                <label key={s} className="gt-radio-label">
                  <input
                    type="radio"
                    name="semester"
                    value={s}
                    checked={semester === s}
                    onChange={() => handleSemesterChange(s)}
                    disabled={!branch}
                  />{" "}
                  {s}
                </label>
              ))
            ) : (
              <div className="gt-muted">Select Year first</div>
            )}
          </div>
        </div>

        {/* Subjects (depends on Branch + Semester + Year) */}
        <div className="gt-row">
          <label className="gt-label">Subjects:</label>
          <select
            className="gt-select"
            value={subject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            disabled={!semester || subjectOptions.length === 0}
          >
            <option value="" disabled>
              -- Select Subject --
            </option>
            {subjectOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Departments (custom multi-select dropdown) */}
        <div className="gt-row">
          <label className="gt-label">Departments:</label>
          <DepartmentsMultiDropdown
            options={departmentOptions}
            value={departments}
            onChange={handleDepartmentsChange}
            disabled={!subject}
            placeholder="-- Select Departments --"
          />
          <div className="gt-hint">
            {departments.length === 0 ? "Select one or more" : `${departments.length} selected`}
          </div>
        </div>

        {/* Exam */}
        <div className="gt-row">
          <label className="gt-label">Exam:</label>
          <div className="gt-radio-group">
            {["CIE1", "CIE2", "Model"].map((ex) => (
              <label key={ex} className="gt-radio-label">
                <input
                  type="radio"
                  name="exam"
                  value={ex}
                  checked={exam === ex}
                  onChange={() => handleExamChange(ex)}
                  disabled={departments.length === 0}
                />{" "}
                {ex}
              </label>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <div className="gt-row gt-center">
          <button className="gt-btn" type="submit" disabled={!allFilled} onClick={() => navigate("/preview")}>
            Generate
          </button>
        </div>
      </form>
    </div>
    </>
    
  );
};

export default GenerateTable;