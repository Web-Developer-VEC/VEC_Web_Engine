import React, { useState, useMemo, useRef, useEffect } from "react";
import Banner from "../../../Banner";
import "./QP.css";
import { useNavigate } from "react-router-dom";

/* --- existing data structures --- */
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
  BTech: ["Artificial Intelligence and Data Science", "Information Technology"],
};

const departmentOptions = [
  "CSE",
  "AI&DS",
  "AME",
  "Civil",
  "IT",
  "EEE",
  "ECE",
  "EIE",
  "CSE(CS)",
];

function yearToSemestersLookup(y) {
  const map = {
    I: ["1st Semester", "2nd Semester"],
    II: ["3rd Semester", "4th Semester"],
    III: ["5th Semester", "6th Semester"],
    IV: ["7th Semester", "8th Semester"],
  };
  return map[y] || [];
}

/* --- Subjects list (15 items) and mapping to subject codes --- */
const SUBJECTS = [
  "Engineering Mathematics",
  "Physics for Engineers",
  "Chemistry for Engineers",
  "Programming Fundamentals",
  "Data Structures",
  "Discrete Mathematics",
  "Database Management Systems",
  "Operating Systems",
  "Computer Networks",
  "Design and Analysis of Algorithms",
  "Machine Learning",
  "Artificial Intelligence",
  "Microprocessors and Interfacing",
  "Embedded Systems",
  "Software Engineering",
];

const SUBJECT_CODE_MAP = {
  "Engineering Mathematics": "MTH101",
  "Physics for Engineers": "PHY101",
  "Chemistry for Engineers": "CHE101",
  "Programming Fundamentals": "CS101",
  "Data Structures": "CS201",
  "Discrete Mathematics": "CS202",
  "Database Management Systems": "DBMS301",
  "Operating Systems": "OS302",
  "Computer Networks": "CN303",
  "Design and Analysis of Algorithms": "ALGO304",
  "Machine Learning": "ML401",
  "Artificial Intelligence": "AI402",
  "Microprocessors and Interfacing": "MPU350",
  "Embedded Systems": "EMB450",
  "Software Engineering": "SE305",
};

/* reverse map for code -> subject */
const CODE_TO_SUBJECT = Object.keys(SUBJECT_CODE_MAP).reduce((acc, subj) => {
  acc[SUBJECT_CODE_MAP[subj]] = subj;
  return acc;
}, {});

/* --- Helper: format 24-hour "HH:MM" -> 12-hour "h:MM AM/PM" --- */
function formatTime12(t) {
  if (!t) return "";
  
  const parts = t.split(":");
  if (parts.length < 2) return t;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const suffix = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes} ${suffix}`;
}

/* --- Generic Autocomplete component --- */
const Autocomplete = ({
  options,
  value,
  onChange,
  disabled,
  placeholder,
  filterMode = "contains",
  ariaLabel = "autocomplete",
}) => {
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState(value || "");
  const rootRef = useRef(null);

  useEffect(() => {
    setInputVal(value || "");
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOpen = () => {
    if (disabled) return;
    setOpen((v) => !v);
  };

  const handleInput = (v) => {
    if (disabled) return;
    setInputVal(v);
    setOpen(true);

    const exact = options.find((o) => o.toLowerCase() === v.trim().toLowerCase());
    if (exact) {
      setTimeout(() => onChange(exact), 0);
    }
  };

  const filterFn = (o) => {
    const q = (inputVal || "").trim().toLowerCase();
    if (!q) return true;
    if (filterMode === "starts") return o.toLowerCase().startsWith(q);
    return o.toLowerCase().includes(q);
  };

  const filtered = options.filter(filterFn);

  const select = (opt) => {
    onChange(opt);
    setInputVal(opt);
    setOpen(false);
  };

  const clear = (e) => {
    e.stopPropagation();
    setInputVal("");
    onChange("");
  };

  return (
    <div className={`gt-autowrap ${disabled ? "disabled" : ""}`} ref={rootRef} style={{ minWidth: 320 }}>
      <div className="gt-autobox" style={{ display: "flex", alignItems: "center" }}>
        <input
          type="text"
          className="gt-input"
          value={inputVal}
          onChange={(e) => handleInput(e.target.value)}
          onClick={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          aria-disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={ariaLabel}
          style={{ flex: 1 }}
        />
        <div className="gt-multi-actions" style={{ display: "flex", alignItems: "center" }}>
          {inputVal && !disabled && (
            <button className="gt-clear" onClick={clear} aria-label="Clear" type="button">
              ×
            </button>
          )}
          <button
            type="button"
            className={`gt-caret ${open ? "open" : ""}`}
            onClick={toggleOpen}
            aria-hidden
            style={{ marginLeft: 6 }}
          >
            ▾
          </button>
        </div>
      </div>

      {open && (
        <ul className="gt-dropdown" role="listbox" style={{ maxHeight: 200, overflowY: "auto" }}>
          {filtered.length === 0 ? (
            <li className="gt-option gt-option-muted">No results</li>
          ) : (
            filtered.map((opt) => (
              <li
                key={opt}
                className="gt-option"
                onClick={() => select(opt)}
                role="option"
                aria-selected={value === opt}
                style={{ cursor: "pointer" }}
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

/* --- DepartmentsMultiDropdown (fixed & improved) --- */
const DepartmentsMultiDropdown = ({ options, value, onChange, disabled, placeholder }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  // Defensive: ensure value is an array
  const selected = Array.isArray(value) ? value : [];

  useEffect(() => {
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const availableOptions = options.filter((o) => !selected.includes(o));

  const toggleOpen = () => {
    if (disabled) return;
    setOpen((v) => !v);
  };

  const addOption = (opt) => {
    onChange([...selected, opt]);
  };

  const removeOption = (opt, e) => {
    if (e) e.stopPropagation();
    onChange(selected.filter((v) => v !== opt));
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div className={`gt-multiwrap ${disabled ? "disabled" : ""}`} ref={rootRef}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        className="gt-multitoggle"
        onClick={toggleOpen}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleOpen();
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-disabled={disabled}
      >
        <div className="gt-multitags">
          {selected.length === 0 ? (
            <span className="gt-placeholder">{placeholder}</span>
          ) : (
            selected.map((v) => (
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

        <div className="gt-multi-actions" style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
          {selected.length > 0 && (
            <button className="gt-clear" onClick={clearAll} aria-label="Clear selection" type="button">
              ×
            </button>
          )}
          <span className={`gt-caret ${open ? "open" : ""}`} aria-hidden>
            ▾
          </span>
        </div>
      </div>

      {open && (
        <ul className="gt-dropdown" role="listbox" aria-multiselectable="true" style={{ maxHeight: 200 }}>
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
                style={{ cursor: "pointer" }}
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

/* --- Main GenerateTable component --- */
const GenerateTable = () => {
  const navigate = useNavigate();

  const [degree, setDegree] = useState("");
  const [regulation, setRegulation] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [setGroup, setSetGroup] = useState("");
  const [departments, setDepartments] = useState([]);
  const [exam, setExam] = useState("");
  const [previewData, setPreviewData] = useState(null);

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const branchOptions = useMemo(() => {
    if (!degree) return [];
    return branchesByDegree[degree] || [];
  }, [degree]);

  // Subjects are NO LONGER dependent on branch paper — they always show the 15 subjects
  const subjectOptions = SUBJECTS;

  const subjectCodes = useMemo(() => Object.values(SUBJECT_CODE_MAP), []);

  /* --- Sync subject <-> subjectCode --- */
  useEffect(() => {
    const mappedCode = SUBJECT_CODE_MAP[subject] || "";
    if (mappedCode !== subjectCode) {
      setSubjectCode(mappedCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject]);

  useEffect(() => {
    const mappedSubject = CODE_TO_SUBJECT[subjectCode] || "";
    if (mappedSubject !== subject) {
      setSubject(mappedSubject);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectCode]);

  // Clear date/time when section cleared
  useEffect(() => {
    if (!section) {
      setDate("");
      setStartTime("");
      setEndTime("");
    }
  }, [section]);

  /* --- Handlers (these also clear dependent selections where appropriate) --- */
  const handleDegreeChange = (val) => {
    setDegree(val);
    setRegulation("");
    setYear("");
    setSection("");
    setBranch("");
    setSemester("");
    setSubject("");
    setSubjectCode("");
    setSetGroup("");
    setDepartments([]);
    setExam("");
    setPreviewData(null);
  };

  const handleRegulationChange = (val) => {
    setRegulation(val);
    setYear("");
    setSection("");
    setBranch("");
    setSemester("");
    setSubject("");
    setSubjectCode("");
    setSetGroup("");
    setDepartments([]);
    setExam("");
    setPreviewData(null);
  };

  const handleYearChange = (val) => {
    setYear(val);
    setSection("");
    setBranch("");
    setSemester("");
    setSubject("");
    setSubjectCode("");
    setSetGroup("");
    setDepartments([]);
    setExam("");
    setPreviewData(null);
  };

  const handleSectionChange = (val) => {
    setSection(val);
    setBranch("");
    setSemester("");
    setSubject("");
    setSubjectCode("");
    setSetGroup("");
    setDepartments([]);
    setExam("");
    setPreviewData(null);
    setDate("");
    setStartTime("");
    setEndTime("");
  };

  const handleBranchChange = (val) => {
    setBranch(val);
    setSemester("");
    setSubject("");
    setSubjectCode("");
    setSetGroup("");
    setDepartments([]);
    setExam("");
    setPreviewData(null);
  };

  const handleSemesterChange = (val) => {
    setSemester(val);
    setSubject("");
    setSubjectCode("");
    setSetGroup("");
    setDepartments([]);
    setExam("");
    setPreviewData(null);
  };

  const handleSubjectSelect = (val) => {
    setSubject(val);
    setSetGroup("");
    setDepartments([]);
    setExam("");
    setPreviewData(null);
  };

  const handleSubjectCodeSelect = (val) => {
    setSubjectCode(val);
    setSetGroup("");
    setDepartments([]);
    setExam("");
    setPreviewData(null);
  };

  // Keep exam when switching set
  const handleSetChange = (val) => {
    setSetGroup(val);
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

  const handleStartTimeChange = (val) => {
    setStartTime(val);
    setPreviewData(null);
  };

  const handleEndTimeChange = (val) => {
    setEndTime(val);
    setPreviewData(null);
  };

  const handleDateChange = (val) => {
    setDate(val);
    setPreviewData(null);
  };

  const allFilled =
    degree &&
    regulation &&
    year &&
    section &&
    date &&
    startTime &&
    endTime &&
    branch &&
    semester &&
    subject &&
    subjectCode &&
    setGroup &&
    departments.length > 0 &&
    exam;

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!allFilled) {
      alert("Please complete all fields before generating.");
      return;
    }

    if (startTime >= endTime) {
      const ok = window.confirm("Start time is not earlier than end time. Do you want to continue?");
      if (!ok) return;
    }

    const data = {
      degree: degree === "BE" ? "B.E" : "B.Tech",
      regulation: regulation === "19" ? "19 Regulation" : "23 Regulation",
      year,
      section,
      date,
      startTime, // raw "HH:MM" 24-hour value
      endTime,
      startTime12: formatTime12(startTime),
      endTime12: formatTime12(endTime),
      timeRange: `${startTime} - ${endTime}`,
      timeRange12: `${formatTime12(startTime)} - ${formatTime12(endTime)}`,
      branch,
      semester,
      subject,
      subjectCode,
      set: setGroup,
      departments,
      exam,
    };

    setPreviewData(data);
    navigate("/preview", { state: data });
  };

  return (
    <>
      <Banner backgroundImage="./Banners/examsbanner.webp" headerText="Question Paper Generator" subHeaderText="QPG" />

      <div className="gt-page">
        <form className="gt-form" onSubmit={handleGenerate}>
          <h2 className="gt-title">Question Paper Generator</h2>

          {/* Degree */}
          <div className="gt-row">
            <label className="gt-label">Degree:</label>
            <div className="gt-radio-group">
              <label className="gt-radio-label">
                <input type="radio" name="degree" value="BE" checked={degree === "BE"} onChange={() => handleDegreeChange("BE")} /> B.E
              </label>
              <label className="gt-radio-label">
                <input type="radio" name="degree" value="BTech" checked={degree === "BTech"} onChange={() => handleDegreeChange("BTech")} /> B.Tech
              </label>
            </div>
          </div>

          {/* Regulation */}
          <div className="gt-row">
            <label className="gt-label">Regulation:</label>
            <div className="gt-radio-group">
              <label className="gt-radio-label">
                <input type="radio" name="regulation" value="19" checked={regulation === "19"} onChange={() => handleRegulationChange("19")} disabled={!degree} /> 19 Regulation
              </label>
              <label className="gt-radio-label">
                <input type="radio" name="regulation" value="23" checked={regulation === "23"} onChange={() => handleRegulationChange("23")} disabled={!degree} /> 23 Regulation
              </label>
            </div>
          </div>

          {/* Year */}
          <div className="gt-row">
            <label className="gt-label">Year:</label>
            <div className="gt-radio-group">
              {["I", "II", "III", "IV"].map((y) => (
                <label key={y} className="gt-radio-label">
                  <input type="radio" name="year" value={y} checked={year === y} onChange={() => handleYearChange(y)} disabled={!regulation} /> {y}
                </label>
              ))}
            </div>
          </div>

          {/* Section */}
          <div className="gt-row">
            <label className="gt-label">Section:</label>
            <div className="gt-radio-group">
              {["A", "B", "C", "D"].map((sec) => (
                <label key={sec} className="gt-radio-label">
                  <input type="radio" name="section" value={sec} checked={section === sec} onChange={() => handleSectionChange(sec)} disabled={!year} /> {sec}
                </label>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="gt-row" style={{ alignItems: "center", gap: 12 }}>
            <label className="gt-label">Date:</label>
            <input className="gt-input" type="date" value={date} onChange={(e) => handleDateChange(e.target.value)} disabled={!section} aria-disabled={!section} aria-label="Select exam date" style={{ width: 160 }} />

            <label className="gt-label-time" style={{ marginLeft: 12 }}>Time:</label>

            <input className="gt-input" type="time" value={startTime} onChange={(e) => handleStartTimeChange(e.target.value)} disabled={!section} aria-disabled={!section} aria-label="Start time" style={{ width: 70 }} />

            <span aria-hidden style={{ margin: "0 6px" }}>-</span>

            <input className="gt-input" type="time" value={endTime} onChange={(e) => handleEndTimeChange(e.target.value)} disabled={!section} aria-disabled={!section} aria-label="End time" style={{ width: 60 }} />

            <div className="gt-hint" style={{ marginLeft: 170 }}>
              {!section
                ? "Select a section first"
                : date
                ? `Selected: ${date}${startTime && endTime ? `, ${formatTime12(startTime)} - ${formatTime12(endTime)}` : ""}`
                : "Choose date & time"}
            </div>
          </div>

          {/* Branch */}
          <div className="gt-row">
            <label className="gt-label">Branch Paper:</label>
            <select className="gt-select" value={branch} onChange={(e) => handleBranchChange(e.target.value)} disabled={!year || !degree || !section} style={{ minWidth: 320 }}>
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

          {/* Semester */}
          <div className="gt-row">
            <label className="gt-label">Semester:</label>
            <div className="gt-radio-group">
              {year ? (
                yearToSemestersLookup(year).map((s) => (
                  <label key={s} className="gt-radio-label">
                    <input type="radio" name="semester" value={s} checked={semester === s} onChange={() => handleSemesterChange(s)} disabled={!year} /> {s}
                  </label>
                ))
              ) : (
                <div className="gt-muted">Select Year first</div>
              )}
            </div>
          </div>

          {/* Subject Code */}
          <div className="gt-row">
            <label className="gt-label">Subject Code:</label>
            <Autocomplete options={subjectCodes} value={subjectCode} onChange={handleSubjectCodeSelect} disabled={!semester} placeholder="Type or pick subject code (e.g. CS201)" filterMode="starts" ariaLabel="Subject code" />
            <div className="gt-hint" style={{ marginLeft: 170 }}>{!semester ? "Select semester first" : subjectCode ? `Selected: ${subjectCode}` : "Pick or type code"}</div>
          </div>

          {/* Subjects */}
          <div className="gt-row">
            <label className="gt-label">Subjects:</label>
            <Autocomplete options={subjectOptions} value={subject} onChange={handleSubjectSelect} disabled={!semester} placeholder="Type to search subjects" filterMode="contains" ariaLabel="Subject" />
          </div>

          {/* Departments (multi-select) */}
          <div className="gt-row">
            <label className="gt-label">Departments:</label>
            <DepartmentsMultiDropdown
              options={departmentOptions}
              value={departments}
              onChange={handleDepartmentsChange}
              disabled={!subject}
              placeholder="-- Select Departments --"
            />
            <div className="gt-hint" style={{ marginLeft: 170 }}>{departments.length === 0 ? "Select one or more" : `${departments.length} selected`}</div>
          </div>

          {/* Exam */}
          <div className="gt-row">
            <label className="gt-label">Exam:</label>
            <div className="gt-radio-group">
              {["CIE1", "CIE2", "Model"].map((ex) => (
                <label key={ex} className="gt-radio-label">
                  <input type="radio" name="exam" value={ex} checked={exam === ex} onChange={() => handleExamChange(ex)} disabled={departments.length === 0} /> {ex}
                </label>
              ))}
            </div>
          </div>

          {/* Set */}
          <div className="gt-row">
            <label className="gt-label">Set:</label>
            <div className="gt-radio-group">
              {["A", "B", "C"].map((st) => (
                <label key={st} className="gt-radio-label">
                  <input type="radio" name="setGroup" value={st} checked={setGroup === st} onChange={() => handleSetChange(st)} disabled={!subject} /> {st}
                </label>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <div className="gt-row gt-center">
            <button className="gt-btn" type="submit" disabled={!allFilled}>
              Generate
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default GenerateTable; 