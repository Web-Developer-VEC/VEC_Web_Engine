import React, { useState, useMemo, useRef, useEffect } from "react";
import axios from "axios";
import Banner from "../../../Banner";
import "./QP.css";
import { useNavigate } from "react-router-dom";

/*
  QP.jsx
  - Loads questionbank from backend endpoint GET /api/main-backend/questionbank_form (axios).
  - All lists (including departmentOptions) are taken from the returned questionbank.
  - Fixed: branch paper now shows correctly. Degree selection stores an internal key ('BE' | 'BTech')
    while labels are taken from the backend (qb.degree). This ensures branchesByDegree is indexed
    correctly and branch select populates.
  - DepartmentsMultiDropdown supports simple string options or objects { value, label }.
  - No other behavior changed.
*/

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

    const exact = Array.isArray(options) && options.find((o) => (o || "").toString().toLowerCase() === v.trim().toLowerCase());
    if (exact) {
      setTimeout(() => onChange(exact), 0);
    }
  };

  const filterFn = (o) => {
    const q = (inputVal || "").trim().toLowerCase();
    const candidate = (o || "").toString().toLowerCase();
    if (!q) return true;
    if (filterMode === "starts") return candidate.startsWith(q);
    return candidate.includes(q);
  };

  const filtered = Array.isArray(options) ? options.filter(filterFn) : [];

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
                key={typeof opt === "string" ? opt : JSON.stringify(opt)}
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

/* --- DepartmentsMultiDropdown (supports {value,label} or string options) --- */
const DepartmentsMultiDropdown = ({ options, value, onChange, disabled, placeholder }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  // Ensure selected is array of values (strings)
  const selected = Array.isArray(value) ? value : [];

  // Normalize options to array of { value, label }
  const normalizedOptions = useMemo(() => {
    if (!Array.isArray(options)) return [];
    return options.map((o) => {
      if (o && typeof o === "object") {
        return { value: String(o.value), label: o.label != null ? String(o.label) : String(o.value) };
      }
      return { value: String(o), label: String(o) };
    });
  }, [options]);

  // map value -> label for quick lookup
  const labelMap = useMemo(() => {
    const m = {};
    normalizedOptions.forEach((o) => {
      m[o.value] = o.label;
    });
    return m;
  }, [normalizedOptions]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const availableOptions = normalizedOptions.filter((opt) => !selected.includes(opt.value));

  const toggleOpen = () => {
    if (disabled) return;
    setOpen((v) => !v);
  };

  const addOption = (opt) => {
    onChange([...selected, opt.value]);
  };

  const removeOption = (val, e) => {
    if (e) e.stopPropagation();
    onChange(selected.filter((v) => v !== val));
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
            selected.map((val) => (
              <span key={val} className="gt-tag">
                <span className="gt-tag-text">{labelMap[val] || val}</span>
                <button type="button" className="gt-tag-close" onClick={(e) => removeOption(val, e)} aria-label={`Remove ${labelMap[val] || val}`}>
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
              <li key={opt.value} className="gt-option" onClick={() => addOption(opt)} role="option" aria-selected="false" style={{ cursor: "pointer" }}>
                <span className="gt-option-label">{opt.label}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

/* --- Helpers --- */
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

/* --- Main GenerateTable component --- */
const GenerateTable = () => {
  const navigate = useNavigate();

  // form state (degree holds internal key: 'BE' or 'BTech')
  const [degree, setDegree] = useState("");
  const [regulation, setRegulation] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [setGroup, setSetGroup] = useState("");
  const [departments, setDepartments] = useState([]); // array of department values
  const [exam, setExam] = useState("");
  const [previewData, setPreviewData] = useState(null);

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // fetched questionbank
  const [qb, setQb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const res = await axios.get("/api/main-backend/questionbank_form");
        const payload = res && res.data ? res.data : res;
        const qbCandidate =
          (payload && payload.data && Array.isArray(payload.data) && payload.data[0]) ||
          (Array.isArray(payload) && payload[0]) ||
          payload;
        if (mounted) setQb(qbCandidate || null);
      } catch (err) {
        console.error("Error fetching questionbank:", err);
        if (mounted) setFetchError(err.message || "Failed to fetch questionbank");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  /* --- Derived lists from qb --- */

  // degreeOptions: internal keys + backend labels
  const degreeOptions = useMemo(() => {
    const labels = Array.isArray(qb && qb.degree) && qb.degree.length > 0 ? qb.degree.map((d) => (d || "").toString()) : ["B.E", "B.Tech"];
    // find labels containing identifiers
    const beLabel = labels.find((l) => typeof l === "string" && (l.toLowerCase().includes("b.e") || l.toLowerCase().includes("be"))) || labels[0] || "B.E";
    const btechLabel = labels.find((l) => typeof l === "string" && (l.toLowerCase().includes("b.tech") || l.toLowerCase().includes("btech"))) || labels[1] || "B.Tech";
    return [
      { key: "BE", label: beLabel },
      { key: "BTech", label: btechLabel },
    ];
  }, [qb]);

  const regulationOptions = useMemo(() => {
    if (!qb || !Array.isArray(qb.regulations) || qb.regulations.length === 0) return ["19", "23"];
    const regs = qb.regulations.map((r) => (r || "").toString().toLowerCase());
    const out = [];
    if (regs.some((r) => r.includes("2019") || r.includes("19"))) out.push("19");
    if (regs.some((r) => r.includes("2023") || r.includes("23"))) out.push("23");
    return out.length ? out : qb.regulations.map((r) => (r || "").toString());
  }, [qb]);

  const examOptions = useMemo(() => {
    if (!qb || !Array.isArray(qb.cie) || qb.cie.length === 0) return ["CIE1", "CIE2", "Model"];
    return qb.cie.map((c) => {
      const v = (c || "").toString().trim();
      if (v === "I") return "CIE1";
      if (v === "II") return "CIE2";
      if (v === "III" || v === "3") return "Model";
      return v.startsWith("CIE") ? v : `CIE${v}`;
    });
  }, [qb]);

  const branchPaperList = useMemo(() => {
    if (!qb) return [];
    if (Array.isArray(qb.branch_paper) && qb.branch_paper.length > 0) return qb.branch_paper.map((b) => b.toString());
    if (qb.departments && typeof qb.departments === "object") {
      const arr = [];
      if (Array.isArray(qb.departments.BE)) arr.push(...qb.departments.BE.map((n) => `B.E ${n}`));
      if (Array.isArray(qb.departments.BTech)) arr.push(...qb.departments.BTech.map((n) => `B.Tech ${n}`));
      return arr;
    }
    return [];
  }, [qb]);

  const branchesByDegree = useMemo(() => {
    const be = [];
    const bt = [];
    branchPaperList.forEach((b) => {
      const s = (b || "").toString();
      if (s.startsWith("B.E") || s.toLowerCase().includes("b.e")) be.push(s);
      else if (s.startsWith("B.Tech") || s.toLowerCase().includes("b.tech")) bt.push(s);
      else {
        if (s.toLowerCase().includes("technology") || s.toLowerCase().includes("information")) bt.push(s);
        else be.push(s);
      }
    });
    return {
      BE: be.length ? be : [
        "B.E Automobile Engineering",
        "B.E Civil Engineering",
        "B.E Computer Science and Engineering",
        "B.E Computer Science and Engineering (Cyber Security)",
        "B.E Electronics and Communication Engineering",
        "B.E Electrical and Electronics Engineering",
        "B.E Electronics and Instrumentation Engineering",
        "B.E Mechanical Engineering",
      ],
      BTech: bt.length ? bt : ["B.Tech Artificial Intelligence and Data Science", "B.Tech Information Technology"],
    };
  }, [branchPaperList]);

  // departmentOptionsRaw from qb.departmentOptions (preferred) or fallback to flattened qb.departments
  const departmentOptionsRaw = useMemo(() => {
    if (qb && Array.isArray(qb.departmentOptions) && qb.departmentOptions.length > 0) return qb.departmentOptions;
    if (qb && qb.departments && typeof qb.departments === "object") {
      const flat = [];
      Object.values(qb.departments).forEach((arr) => {
        if (Array.isArray(arr)) flat.push(...arr.map((n) => n.toString()));
      });
      return flat;
    }
    return branchPaperList;
  }, [qb, branchPaperList]);

  const SUBJECTS = useMemo(() => {
    if (!qb || !Array.isArray(qb.subject) || qb.subject.length === 0) return [];
    return qb.subject.map((s) => (s && s.name ? s.name.toString() : "")).filter(Boolean);
  }, [qb]);

  const SUBJECT_CODE_MAP = useMemo(() => {
    const map = {};
    if (!qb || !Array.isArray(qb.subject)) return map;
    qb.subject.forEach((s) => {
      if (!s) return;
      const name = (s.name || "").toString();
      const code = (s.code || "").toString();
      map[name] = code || "";
    });
    return map;
  }, [qb]);

  const CODE_TO_SUBJECT = useMemo(() => {
    const rev = {};
    Object.keys(SUBJECT_CODE_MAP).forEach((name) => {
      const code = SUBJECT_CODE_MAP[name];
      if (code) rev[code] = name;
    });
    return rev;
  }, [SUBJECT_CODE_MAP]);

  const subjectCodes = useMemo(() => Object.values(SUBJECT_CODE_MAP).filter(Boolean), [SUBJECT_CODE_MAP]);

  const yearOptions = useMemo(() => (qb && Array.isArray(qb.years) ? qb.years.map((y) => (y || "").toString()) : []), [qb]);
  const semesterList = useMemo(() => (qb && Array.isArray(qb.semesters) ? qb.semesters.map((s) => (s || "").toString()) : []), [qb]);

  function yearToSemestersLookupDynamic(y) {
    const years = yearOptions;
    const sems = semesterList;
    const yearIndex = years.indexOf(y);
    if (yearIndex === -1) return [];
    const idx = yearIndex * 2;
    const out = [];
    if (sems[idx]) out.push(sems[idx]);
    if (sems[idx + 1]) out.push(sems[idx + 1]);
    return out;
  }

  /* --- Sync subject <-> subjectCode --- */
  useEffect(() => {
    const mappedCode = SUBJECT_CODE_MAP[subject] || "";
    if (mappedCode !== subjectCode) setSubjectCode(mappedCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, SUBJECT_CODE_MAP]);

  useEffect(() => {
    const mappedSubject = CODE_TO_SUBJECT[subjectCode] || "";
    if (mappedSubject !== subject) setSubject(mappedSubject);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectCode, CODE_TO_SUBJECT]);

  // Clear dependent fields when section cleared
  useEffect(() => {
    if (!section) {
      setDate("");
      setStartTime("");
      setEndTime("");
    }
  }, [section]);

  /* --- Handlers --- */
  const handleDegreeChange = (val) => {
    setDegree(val); // val is 'BE' or 'BTech'
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

  const handleSetChange = (val) => {
    setSetGroup(val);
    setPreviewData(null);
  };

  const handleDepartmentsChange = (selectedValues) => {
    setDepartments(selectedValues);
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

  // branchOptions now uses internal degree key ('BE'|'BTech')
  const branchOptions = useMemo(() => {
    if (!degree) return [];
    return branchesByDegree[degree] || [];
  }, [degree, branchesByDegree]);

  const subjectOptions = SUBJECTS;

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

  // department label map for preview output
  const departmentLabelMap = useMemo(() => {
    const map = {};
    if (!Array.isArray(departmentOptionsRaw)) return map;
    departmentOptionsRaw.forEach((o) => {
      if (o && typeof o === "object") {
        map[String(o.value)] = o.label != null ? String(o.label) : String(o.value);
      } else {
        map[String(o)] = String(o);
      }
    });
    return map;
  }, [departmentOptionsRaw]);

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

    const departmentsDetail = departments.map((val) => ({
      value: val,
      label: departmentLabelMap[val] || val,
    }));

    const degreeLabel = degreeOptions.find((d) => d.key === degree)?.label || degree;

    const data = {
      degree: degreeLabel,
      regulation,
      year,
      section,
      date,
      startTime,
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
      departments: departmentsDetail,
      exam,
    };

    setPreviewData(data);
    navigate("/preview", { state: data });
  };

  /* --- Render --- */
  return (
    <>
      <Banner backgroundImage="./Banners/examsbanner.webp" headerText="Question Paper Generator" subHeaderText="QPG" />

      <div className="gt-page">
        <form className="gt-form" onSubmit={handleGenerate}>
          <h2 className="gt-title">Question Paper Generator</h2>

          {loading ? (
            <div className="gt-row">
              <div className="gt-hint">Loading configuration from backend...</div>
            </div>
          ) : fetchError ? (
            <div className="gt-row">
              <div className="gt-hint" style={{ color: "red" }}>
                Error loading data: {fetchError}
              </div>
            </div>
          ) : null}

          {/* Degree (internal values 'BE'/'BTech', labels from backend) */}
          <div className="gt-row">
            <label className="gt-label">Degree:</label>
            <div className="gt-radio-group">
              {degreeOptions.map((d) => (
                <label key={d.key} className="gt-radio-label">
                  <input
                    type="radio"
                    name="degree"
                    value={d.key}
                    checked={degree === d.key}
                    onChange={() => handleDegreeChange(d.key)}
                    disabled={loading || !!fetchError}
                  />{" "}
                  {d.label}
                </label>
              ))}
            </div>
          </div>

          {/* Regulation */}
          <div className="gt-row">
            <label className="gt-label">Regulation:</label>
            <div className="gt-radio-group">
              {regulationOptions.map((r) => (
                <label key={r} className="gt-radio-label">
                  <input type="radio" name="regulation" value={r} checked={regulation === r} onChange={() => handleRegulationChange(r)} disabled={!degree || loading || !!fetchError} /> {r}
                </label>
              ))}
            </div>
            <div className="gt-hint" style={{ marginLeft: 12 }}>
              {qb && qb.regulations ? `Available: ${qb.regulations.join(", ")}` : ""}
            </div>
          </div>

          {/* Year */}
          <div className="gt-row">
            <label className="gt-label">Year:</label>
            <div className="gt-radio-group">
              {yearOptions.map((y) => (
                <label key={y} className="gt-radio-label">
                  <input type="radio" name="year" value={y} checked={year === y} onChange={() => handleYearChange(y)} disabled={!regulation || loading || !!fetchError} /> {y}
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
                  <input type="radio" name="section" value={sec} checked={section === sec} onChange={() => handleSectionChange(sec)} disabled={!year || loading || !!fetchError} /> {sec}
                </label>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="gt-row" style={{ alignItems: "center", gap: 12 }}>
            <label className="gt-label">Date:</label>
            <input className="gt-input" type="date" value={date} onChange={(e) => handleDateChange(e.target.value)} disabled={!section || loading || !!fetchError} aria-label="Select exam date" style={{ width: 160 }} />

            <label className="gt-label-time" style={{ marginLeft: 12 }}>Time:</label>

            <input className="gt-input" type="time" value={startTime} onChange={(e) => handleStartTimeChange(e.target.value)} disabled={!section || loading || !!fetchError} aria-label="Start time" style={{ width: 70 }} />

            <span aria-hidden style={{ margin: "0 6px" }}>-</span>

            <input className="gt-input" type="time" value={endTime} onChange={(e) => handleEndTimeChange(e.target.value)} disabled={!section || loading || !!fetchError} aria-label="End time" style={{ width: 60 }} />

            <div className="gt-hint" style={{ marginLeft: 170 }}>
              {!section ? "Select a section first" : date ? `Selected: ${date}${startTime && endTime ? `, ${formatTime12(startTime)} - ${formatTime12(endTime)}` : ""}` : "Choose date & time"}
            </div>
          </div>

          {/* Branch Paper */}
          <div className="gt-row">
            <label className="gt-label">Branch Paper:</label>
            <select className="gt-select" value={branch} onChange={(e) => handleBranchChange(e.target.value)} disabled={!year || !degree || !section || loading || !!fetchError} style={{ minWidth: 320 }}>
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
                yearToSemestersLookupDynamic(year).map((s) => (
                  <label key={s} className="gt-radio-label">
                    <input type="radio" name="semester" value={s} checked={semester === s} onChange={() => handleSemesterChange(s)} disabled={!year || loading || !!fetchError} /> {s}
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
            <Autocomplete options={subjectCodes} value={subjectCode} onChange={handleSubjectCodeSelect} disabled={!semester || loading || !!fetchError} placeholder="Type or pick subject code (e.g. HS8151)" filterMode="starts" ariaLabel="Subject code" />
            <div className="gt-hint" style={{ marginLeft: 170 }}>{!semester ? "Select semester first" : subjectCode ? `Selected: ${subjectCode}` : "Pick or type code"}</div>
          </div>

          {/* Subjects */}
          <div className="gt-row">
            <label className="gt-label">Subjects:</label>
            <Autocomplete options={subjectOptions} value={subject} onChange={handleSubjectSelect} disabled={!semester || loading || !!fetchError} placeholder="Type to search subjects" filterMode="contains" ariaLabel="Subject" />
          </div>

          {/* Departments (multi-select) - uses qb.departmentOptions when present */}
          <div className="gt-row">
            <label className="gt-label">Departments:</label>
            <DepartmentsMultiDropdown
              options={departmentOptionsRaw}
              value={departments}
              onChange={handleDepartmentsChange}
              disabled={!subject || loading || !!fetchError}
              placeholder="-- Select Departments --"
            />
            <div className="gt-hint" style={{ marginLeft: 170 }}>
              {departments.length === 0 ? "Select one or more" : `${departments.length} selected`}
            </div>
          </div>

          {/* Exam */}
          <div className="gt-row">
            <label className="gt-label">Exam:</label>
            <div className="gt-radio-group">
              {examOptions.map((ex) => (
                <label key={ex} className="gt-radio-label">
                  <input type="radio" name="exam" value={ex} checked={exam === ex} onChange={() => handleExamChange(ex)} disabled={departments.length === 0 || loading || !!fetchError} /> {ex}
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
                  <input type="radio" name="setGroup" value={st} checked={setGroup === st} onChange={() => handleSetChange(st)} disabled={!subject || loading || !!fetchError} /> {st}
                </label>
              ))}
            </div>
          </div>

          {/* Generate */}
          <div className="gt-row gt-center">
            <button className="gt-btn" type="submit" disabled={!allFilled || loading || !!fetchError}>
              Generate
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default GenerateTable;