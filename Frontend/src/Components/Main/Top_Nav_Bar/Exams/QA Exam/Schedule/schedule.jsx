import { useState, useMemo, useEffect, useRef } from "react"
import {
  GraduationCap,
  Building2,
  Hash,
  BookOpen,
  Calendar,
  Clock,
  Power,
} from "lucide-react"
import { Dropdown, SearchableInput } from "./searchableInput"
import Banner from "../../../../Banner"
import { useNavigate } from "react-router"
import Swal from "sweetalert2"
import axios from "axios"

const Schedule = ({ toggle, theme }) => {
  const [year, setYear] = useState("")
  const [departments, setDepartments] = useState("")
  const [registerState, setRegisterState] = useState({
    mode: "none", // none | partial | all
    values: [],
  })
  const [regDropdownOpen, setRegDropdownOpen] = useState(false);
  const regRef = useRef(null)
  const [subject, setSubject] = useState("")
  const [subjectCode, setSubjectCode] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [examType, setExamType] = useState("")
  const [years, setYears] = useState([])
  const [departmentOptions, setDepartmentOptions] = useState([])
  const [subjects, setSubjects] = useState([])
  const [topicOptions, setTopicOptions] = useState([])
  const [studentRegs, setStudentRegs] = useState([])
  const [loadingRegs, setLoadingRegs] = useState(false)
  const [topics, setTopics] = useState({})
  const [subjectTopics, setSubjectTopics] = useState([])
  const navigate = useNavigate();

  useEffect(() => {
    if (!year || !departments) return

    const fetchStudents = async () => {
      setLoadingRegs(true)

      try {
        const payload = {
          department: departments,
          batch: year,
        }

        const res = await axios.post("/api/main-backend/get_register_no", payload)

        setStudentRegs(res.data.students || [])

        // Reset previous selection
        setRegisterState({ mode: "none", values: [] })

      } catch (err) {
        console.error("Failed to fetch students", err)
        setStudentRegs([])
      } finally {
        setLoadingRegs(false)
      }
    }

    fetchStudents()
  }, [year, departments])


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/main-backend/form")
        const data = res.data

        console.log(data);
        

        setYears(data.batch || [])
        setDepartmentOptions(data.departments || "")
        setSubjects(data.subjectList || [])
        setSubjectTopics(data.subjects || [])

      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  const filteredRegs = studentRegs

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
    setDepartments("")
    setRegDropdownOpen(false);
    setRegisterState({ mode: "none", values: [] })
  }, [year])

  useEffect(() => {
    if (!subject) {
      setTopicOptions([])
      setTopics([])
      return
    }

    const selectedSubject = subjectTopics.find(
      (s) => s.subject_name === subject
    )

    setTopicOptions(selectedSubject?.topics || [])
    setTopics([]) 

  }, [subject, subjectTopics])

  const splitSubjects = useMemo(() => {
    if (!subject) return []
    return subject.split("/").map(s => s.trim())
  }, [subject])

  const getTopicsForSubject = (sub) => {
    return subjectTopics.find(s => s.subject_name === sub)?.topics || []
  }

  useEffect(() => {
    if (!splitSubjects.length) {
      setTopics({})
      return
    }

    const initialTopics = {}
    splitSubjects.forEach(sub => {
      initialTopics[sub] = []
    })

    setTopics(initialTopics)
  }, [splitSubjects])

  const handleSubjectSelect = (name) => {
    const sub = subjects.find((s) => s.name === name)
    setSubject(name)
    setSubjectCode(sub?.code || "")
  }

  const handleCodeSelect = (code) => {
    const sub = subjects.find((s) => s.code === code)
    setSubjectCode(code)
    setSubject(sub?.name || "")
  }

  function parseTimeSlot(timeSlot) {
    if (!timeSlot) return { start: "", end: "" }

    const [start, end] = timeSlot.split(" - ")
    return { start, end }
  }

  const submitExamSchedule = async () => {
    if (!year || !departments) {
      await Swal.fire({
        icon: "warning",
        title: "Missing Details",
        text: "Please fill all required fields before submitting.",
        confirmButtonColor: "#800000",
      })
      return
    }

    const { start, end } = parseTimeSlot(time)

    const payload = {
      batch: year,
      department: departments,
      registerNo: registerState.values,
      cie: examType,
      subject,
      subjectCode,
      topics,
      date,
      start,
      end
    }

    // 🔄 Show loading
    Swal.fire({
      title: "Scheduling Exam...",
      text: "Please wait",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      },
    })

    try {
      const res = await fetch("/api/main-backend/exam_schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Failed to schedule exam")
      }

      // ✅ Success popup
      await Swal.fire({
        icon: "success",
        title: "Exam Scheduled",
        text: "The exam has been scheduled successfully.",
        confirmButtonColor: "#800000",
      })

      // 🔁 Reset form
      setYear("")
      setDepartments("")
      setRegisterState({ mode: "none", values: [] })
      setSubject("")
      setSubjectCode("")
      setDate("")
      setTime("")
      setExamType("")
      setTopics([])
    } catch (error) {
      console.error("Schedule error:", error)

      Swal.fire({
        icon: "error",
        title: "Scheduling Failed",
        text: error.message || "Something went wrong",
        confirmButtonColor: "#800000",
      })
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
          <div className="flex gap-1">
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
              Upload Questions
              <span className="text-base">→</span>
            </button>
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
              Download Student Result
              <span className="text-base">→</span>
            </button>
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
            <button
              className="qa-logout-btn"
              onClick={() => {
                sessionStorage.removeItem("userSession");
                navigate("/login");
              }}
              title="Log out"
              type="button"
            >
              <Power size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg border p-8 space-y-6">
          <h2 className="text-2xl font-bold text-brwn text-center">
            CIE Details Entry
          </h2>

          <SearchableInput
            label="Batch"
            icon={GraduationCap}
            options={years}
            value={year}
            onChange={setYear}
            placeholder="Select Batch"
          />

          <SearchableInput
            label="Department"
            icon={Building2}
            options={departmentOptions}
            value={departments}
            onChange={setDepartments}
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
                {loadingRegs ? (
                  <div className="px-3 py-2 text-sm text-slate-400">
                    Loading students...
                  </div>
                ) : filteredRegs.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-slate-400">
                    No students found
                  </div>
                ) : (
                  filteredRegs.map((reg) => {
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
                          ${selected
                            ? "bg-[#fdcc03]/20 font-medium"
                            : "hover:bg-slate-100"
                          }`}
                      >
                        {reg}
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SearchableInput
              label="Subject Code"
              icon={Hash}
              options={subjects.map((s) => s.code)}
              value={subjectCode}
              onChange={handleCodeSelect}
              placeholder="Search code"
            />

            <SearchableInput
              label="Subject"
              icon={BookOpen}
              options={subjects.map((s) => s.name)}
              value={subject}
              onChange={handleSubjectSelect}
              placeholder="Search subject"
            />

          </div>

          <div>
            {splitSubjects.map((sub) => (
              <SearchableInput
                key={sub}
                label={`Topics - ${sub}`}
                icon={Building2}
                options={getTopicsForSubject(sub)}
                value={topics[sub] || []}
                onChange={(selected) =>
                  setTopics(prev => ({
                    ...prev,
                    [sub]: selected
                  }))
                }
                multiple
                placeholder={`Select ${sub} Topic(s)`}
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Date"
              icon={Calendar}
              type="date"
              value={date}
              onChange={setDate}
            />
            
            <Dropdown
              label="Exam Type"
              icon={GraduationCap}
              value={examType}
              onChange={setExamType}
            />

            <Dropdown
              label="Exam Time"
              icon={Clock}
              value={time}
              onChange={setTime}
              type={examType}
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