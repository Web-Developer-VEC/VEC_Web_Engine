import { useState, useMemo, useEffect, useRef } from "react"
import {
  GraduationCap,
  Building2,
  Hash,
  BookOpen,
  Calendar,
  Clock,
} from "lucide-react"
import { SearchableInput } from "./searchableInput"
import Banner from "../../../../Banner"
import { useNavigate } from "react-router"

const YEARS = ["I", "II", "III", "IV"]

const DEPARTMENTS = ["CSE", "ECE", "EEE", "AI&DS"]

const SUBJECTS = [
  { code: "QA204", name: "QA/VR" },
  { code: "QA301", name: "QA/BS" },
  { code: "QA210", name: "QA" },
]

const STUDENTS = [
  { reg: "113223072040", dept: "AI&DS" },
  { reg: "113223072041", dept: "AI&DS" },
  { reg: "113223072101", dept: "AI&DS" },
  { reg: "113223062001", dept: "CSE" },
  { reg: "113223062002", dept: "CSE" },
  { reg: "113223052001", dept: "IT" },
  { reg: "113223052002", dept: "IT" },
  { reg: "113223042001", dept: "ECE" }
]


const Schedule = ({ toggle, theme }) => {
  const [year, setYear] = useState("")
  const [departments, setDepartments] = useState([])
  const [registerState, setRegisterState] = useState({
    mode: "none", // none | partial | all
    values: [],
  })
  const [regDropdownOpen, setRegDropdownOpen] = useState(false);
  const regRef = useRef(null)
  const [subject, setSubject] = useState("")
  const [subjectCode, setSubjectCode] = useState("")
  const [date, setDate] = useState("")
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const navigate = useNavigate();

  const filteredRegs = useMemo(() => {
    return STUDENTS
      .filter((s) => departments.includes(s.dept))
      .map((s) => s.reg)
  }, [departments])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (regRef.current && !regRef.current.contains(e.target)) {
        setRegDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Dept changed → reset registers
  useEffect(() => {
    setRegisterState({ mode: "none", values: [] })
    setRegDropdownOpen(false);
  }, [departments])

  // Year changed → reset dept + register
  useEffect(() => {
    setDepartments([])
    setRegDropdownOpen(false);
    setRegisterState({ mode: "none", values: [] })
  }, [year])

  const handleSubjectSelect = (name) => {
    const sub = SUBJECTS.find((s) => s.name === name)
    setSubject(name)
    setSubjectCode(sub.code)
  }

  const handleCodeSelect = (code) => {
    const sub = SUBJECTS.find((s) => s.code === code)
    setSubjectCode(code)
    setSubject(sub.name)
  }

  const selectAllStudents = () => {
    setRegisterState({
      mode: "all",
      values: filteredRegs,
    })
    setRegDropdownOpen(false);
  }

  const handleRegisterSelect = (reg) => {
    setRegisterState((prev) => ({
      mode: "partial",
      values: prev.values.includes(reg)
        ? prev.values.filter((r) => r !== reg)
        : [...prev.values, reg],
    }))
    setRegDropdownOpen(false);
  }

  const submitExamSchedule = async () => {
    if (!year || departments.length === 0 || registerState.values.length === 0) {
      alert("Please fill all required fields")
      return
    }

    const payload = {
      year,
      department: departments,
      registerNo: registerState.values,
      cie: "CIE", // or "CIE-1", make this dynamic if needed
      subject,
      subjectCode,
      date,
      start,
      end,
    }

    try {
      const res = await fetch("/api/main-backend/exam_schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${token}`  // if using JWT
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Failed to schedule exam")
      }

      alert("Exam scheduled successfully")

      // OPTIONAL: reset form
      setYear("")
      setDepartments([])
      setRegisterState({ mode: "none", values: [] })
      setSubject("")
      setSubjectCode("")
      setDate("")
      setStart("")
      setEnd("")
    } catch (error) {
      console.error("Schedule error:", error)
      alert(error.message)
    }
  }

  return (
    <>
    <Banner
      toggle={toggle}
      theme={theme}
      backgroundImage="./Banners/examsbanner.webp"
      headerText="office of controller of examinations"
      subHeaderText="QA"
    />

    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 mb-4">
      <div className="mt-4 px-4 mb-2 flex justify-end w-full">
        <button
          onClick={() => navigate("/scheduled-exam")}
          className="
            inline-flex items-center gap-2
            px-4 py-2
            rounded-lg
            border border-[#800000]/30
            bg-white
            text-[#800000]
            text-sm font-medium
            shadow-sm
            hover:bg-[#800000]
            hover:text-text
            hover:border-[#800000]
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-[#800000]/30
          "
        >
          View Scheduled Exams
          <span className="text-base">→</span>
        </button>
      </div>
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg border p-8 space-y-6">
        <h2 className="text-2xl font-bold text-brwn text-center">
          CIE Details Entry
        </h2>

        <SearchableInput
          label="Year"
          icon={GraduationCap}
          options={YEARS}
          value={year}
          onChange={setYear}
          placeholder="Select year"
        />

        <SearchableInput
          label="Department"
          icon={Building2}
          options={DEPARTMENTS}
          value={departments}
          onChange={setDepartments}
          multiple
          placeholder="Select department(s)"
        />

        <div ref={regRef} className="space-y-2 relative">
          <label className="text-slate-700 font-medium text-sm">
            Register Numbers
          </label>

          {/* Input box (same style as others) */}
          <div
            className="relative border border-slate-300 rounded-md min-h-[48px]
            flex items-center gap-2 px-3 cursor-pointer
            focus-within:ring-2 focus-within:ring-[#fdcc03]/20"
            onClick={() => setRegDropdownOpen((v) => !v)}
          >
            <Hash className="w-4 h-4 text-slate-400" />

            {registerState.mode === "all" ? (
              <span className="bg-[#fdcc03]/20 px-2 py-1 rounded text-xs">
                All students selected ({registerState.values.length})
              </span>
            ) : registerState.values.length > 0 ? (
              <span className="bg-[#fdcc03]/20 px-2 py-1 rounded text-xs">
                {registerState.values.length} students selected
              </span>
            ) : (
              <span className="text-slate-400 text-sm">
                Select register numbers
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 text-xs">
            <button
              type="button"
              onClick={() => {
                setRegisterState({ mode: "all", values: filteredRegs })
                setRegDropdownOpen(false)
              }}
              className="text-[#800000] font-medium"
            >
              Select all students
            </button>

            {registerState.mode !== "none" && (
              <button
                type="button"
                onClick={() =>
                  setRegisterState({ mode: "none", values: [] })
                }
                className="text-slate-500"
              >
                Clear
              </button>
            )}
          </div>

          {/* DROPDOWN — INSIDE REF */}
          {regDropdownOpen && (
            <div
              className="absolute z-20 w-full bg-white border rounded-md
              shadow-md max-h-60 overflow-auto"
            >
              {filteredRegs.map((reg) => {
                const selected = registerState.values.includes(reg)

                return (
                  <div
                    key={reg}
                    onClick={() => {
                      setRegisterState((prev) => ({
                        mode: "partial",
                        values: selected
                          ? prev.values.filter((r) => r !== reg)
                          : [...prev.values, reg],
                      }))
                    }}
                    className={`px-3 py-2 cursor-pointer text-sm
                      transition-colors
                      ${selected
                        ? "bg-[#fdcc03]/20 font-medium"
                        : "hover:bg-slate-100"
                      }`}
                  >
                    {reg}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SearchableInput
            label="Subject Code"
            icon={Hash}
            options={SUBJECTS.map((s) => s.code)}
            value={subjectCode}
            onChange={handleCodeSelect}
            placeholder="Search code"
          />

          <SearchableInput
            label="Subject"
            icon={BookOpen}
            options={SUBJECTS.map((s) => s.name)}
            value={subject}
            onChange={handleSubjectSelect}
            placeholder="Search subject"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Date"
            icon={Calendar}
            type="date"
            value={date}
            onChange={setDate}
          />
          <Input
            label="Start Time"
            icon={Clock}
            type="time"
            value={start}
            onChange={setStart}
          />
          <Input
            label="End Time"
            icon={Clock}
            type="time"
            value={end}
            onChange={setEnd}
          />
        </div>

        <button
          onClick={submitExamSchedule}
          type="button"
          className="w-full h-12 bg-[#fdcc03] hover:bg-[#800000]
          text-text hover:text-prim font-medium rounded-md transition"
        >
          Submit CIE Details
        </button>
      </div>
    </div>
    </>
  )
}

function Input({ label, icon: Icon, type, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 h-12 w-full border border-slate-300 rounded-md
          focus:ring-2 focus:ring-[#fdcc03]/20"
        />
      </div>
    </div>
  )
}

export default Schedule;