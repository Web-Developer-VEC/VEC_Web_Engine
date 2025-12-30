import React, { useState, useMemo, useRef, useEffect } from "react";
import Banner from "../../../Banner";
import "./QP.css";
import { useLocation, useNavigate } from "react-router-dom";

function yearToSemestersLookup(y) {
  const map = {
    I: ["1st Semester", "2nd Semester"],
    II: ["3rd Semester", "4th Semester"],
    III: ["5th Semester", "6th Semester"],
    IV: ["7th Semester", "8th Semester"],
  };
  return map[y] || [];
}

/* --- Helper: format 24-hour "HH:MM" -> 12-hour  --- */
function formatTime12(t) {
  if (!t) return "";
  
  const parts = t.split(":");
  if (parts.length < 2) return t;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const suffix = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes}`;
}

const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`;
};


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
const GenerateTable = ({ toggle, theme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const previousData = location.state;
  const [degree, setDegree] = useState("");
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

  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!config || !previousData) return;

    // Degree
    setDegree(previousData.degree === "B.E" ? "BE" : "BTech");

    setYear(previousData.year);
    setSection(previousData.section);
    setBranch(previousData.branch);
    setSemester(previousData.semester);

    setSubject(previousData.subject);
    setSubjectCode(previousData.subjectCode);

    setDepartments(previousData.departments || []);
    setExam(previousData.exam);
    setSetGroup(previousData.set);

    // Date & Time (convert back!)
    const [day, month, year] = previousData.date.split("-");
    setDate(`${year}-${month}-${day}`);

    setStartTime(previousData.startTime);
    setEndTime(previousData.endTime);

    // prevent re-run
    navigate(".", { replace: true, state: null });
  }, [config, previousData, navigate]);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch(
          "/api/main-backend/questionbank_form",
          {
            method: "GET",
            credentials: "include", 
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const json = await res.json();
        setConfig(json.data[0]);
      } catch (err) {
        console.error("Failed to fetch config", err);
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, []);

  const degreeOptions = useMemo(() => {
    if (!config) return [];
    return config.degree;
  }, [config]);

  const yearOptions = useMemo(() => {
    if (!config) return [];
    return config.years;
  }, [config]);

  const branchOptions = useMemo(() => {
    if (!config || !degree) return [];
    if (degree === "BE") return config.departments.BE || [];
    if (degree === "BTech") return config.departments.BTech || [];
    return [];
  }, [config, degree]);

  const subjectOptions = useMemo(() => {
    if (!config) return [];
    return config.subject.map((s) => s.name);
  }, [config]);

  const subjectCodes = useMemo(() => {
    if (!config) return [];
    return config.subject.map((s) => s.code);
  }, [config]);

  const departmentOptions = useMemo(() => {
    if (!config) return [];
    return config.departmentOptions;
  }, [config]);

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
  if (!val) {
    // clear both
    setSubject("");
    setSubjectCode("");
    return;
  }

  const found = config.subject.find((s) => s.name === val);

  setSubject(val);
  setSubjectCode(found ? found.code : "");

  setSetGroup("");
  setDepartments([]);
  setExam("");
  setPreviewData(null);
};


const handleSubjectCodeSelect = (val) => {
  if (!val) {
    // clear both
    setSubjectCode("");
    setSubject("");
    return;
  }

  const found = config.subject.find((s) => s.code === val);

  setSubjectCode(val);
  setSubject(found ? found.name : "");

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

  const examTypeMap = (ex) => {
    const exams = {
      "I": "CIE 1",
      "II": "CIE 2",
      "III": "Model"
    }

    return exams[ex];
  }

  const allFilled =
    degree &&
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
      year,
      section,
      date: formatDateDDMMYYYY(date),
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
      mark: exam === "III" ? 100 : 50
    };

    setPreviewData(data);
    navigate("/preview", { state: data });
  };

  const session = JSON.parse(sessionStorage.getItem("userSession"));

  if (!session) {
    navigate("/login");
  };

  return (
    <>
      <Banner backgroundImage="./Banners/examsbanner.webp" headerText="Question Paper Generator" subHeaderText="" toggle={toggle} theme={theme} />

      <div className="gt-page">
        <form className="gt-form" onSubmit={handleGenerate}>
          <h2 className="gt-title">Question Paper Generator</h2>

          {/* Degree */}
          <div className="gt-row">
            <label className="gt-label">Degree:</label>
            <div className="gt-radio-group">
              {degreeOptions.map((d) => {
                const value = d === "B.E" ? "BE" : "BTech";
                return (
                  <label key={d} className="gt-radio-label">
                    <input
                      type="radio"
                      name="degree"
                      value={value}
                      checked={degree === value}
                      onChange={() => handleDegreeChange(value)}
                    />
                    {d}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Year */}
          <div className="gt-row">
            <label className="gt-label">Year:</label>
            <div className="gt-radio-group">
              {yearOptions.map((y) => (
                <label key={y} className="gt-radio-label">
                  <input
                    type="radio"
                    name="year"
                    value={y}
                    checked={year === y}
                    onChange={() => handleYearChange(y)}
                  />
                  {y}
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
              {config?.cie?.map((ex,i) => (
                <label key={i} className="gt-radio-label">
                  <input type="radio" name="exam" value={ex} checked={exam === ex} onChange={() => handleExamChange(ex)} disabled={departments.length === 0} /> {examTypeMap(ex)}
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