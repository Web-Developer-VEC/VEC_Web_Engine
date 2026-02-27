import { useState, useRef, useEffect } from "react"

export function SearchableInput({
  label,
  icon: Icon,
  options,
  value,
  onChange,
  placeholder,
  multiple = false,
}) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  /* Close dropdown on outside click */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  /* Filter options */
  const filteredOptions = options
    .filter((opt) => {
      if (multiple) return !value.includes(opt)
      return true
    })
    .filter((opt) =>
      opt.toLowerCase().includes(query?.toLowerCase())
    )

  const handleSelect = (item) => {
    if (multiple) {
      onChange([...value, item])
      setQuery("")
    } else {
      onChange(item)
      setQuery(item)
      setOpen(false)
    }
  }

  const removeItem = (item) => {
    onChange(value.filter((v) => v !== item))
  }

  /* Sync single value into input */
  useEffect(() => {
    if (!multiple && value) {
      setQuery(value)
    }
  }, [value, multiple])

  return (
    <div ref={wrapperRef} className="relative space-y-2">
      <label className="text-slate-700 font-medium text-sm">{label}</label>

      <div
        className="relative border border-slate-300 rounded-md min-h-[48px]
        flex flex-wrap items-center gap-2 px-3 focus-within:ring-2
        focus-within:ring-[#fdcc03]/20"
        onClick={() => setOpen(true)}
      >
        <Icon className="text-slate-400 w-4 h-4" />

        {multiple &&
          value.map((v) => (
            <span
              key={v}
              className="bg-[#fdcc03]/20 px-2 py-1 rounded text-xs"
            >
              {v}
              <button
                type="button"
                className="ml-1"
                onClick={() => removeItem(v)}
              >
                ✕
              </button>
            </span>
          ))}

        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          placeholder={placeholder}
          className="flex-1 outline-none text-sm bg-transparent"
        />
      </div>

      {open && filteredOptions.length > 0 && (
        <div
          className="absolute z-10 w-full bg-white border rounded-md shadow-md
          max-h-40 overflow-auto"
        >
          {filteredOptions.map((item) => (
            <div
              key={item}
              onClick={() => handleSelect(item)}
              className="px-3 py-2 hover:bg-slate-100 cursor-pointer text-sm"
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function MultiSearchDropdown({
  label,
  icon: Icon,
  options,
  value,
  onChange,
  placeholder,
}) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutside)
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [])

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(query.toLowerCase())
  )

  const selectItem = (item) => {
    if (!value.includes(item)) {
      onChange([...value, item])
    }
    setQuery("")
  }

  const removeItem = (item) => {
    onChange(value.filter((v) => v !== item))
  }

  return (
    <div ref={ref} className="relative space-y-2">
      <label className="text-slate-700 font-medium text-sm">{label}</label>

      <div className="relative border rounded-md min-h-[48px]
        flex flex-wrap items-center gap-2 px-3">
        <Icon className="w-4 h-4 text-slate-400" />

        {value.map((v) => (
          <span key={v} className="bg-[#fdcc03]/20 px-2 py-1 rounded text-xs">
            {v}
            <button
              type="button"
              className="ml-1 text-[#800000]"
              onClick={() => removeItem(v)}
            >
              ✕
            </button>
          </span>
        ))}

        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          placeholder={placeholder}
          className="flex-1 outline-none text-sm"
        />
      </div>

      {open && (
        <div className="absolute z-20 w-full bg-white border
          rounded-md shadow-md max-h-40 overflow-auto">
          {filtered.map((item) => (
            <div
              key={item}
              onClick={() => selectItem(item)}
              className="px-3 py-2 hover:bg-slate-100 cursor-pointer text-sm"
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const TIME_SLOTS = {
  model: [
    "08:40 AM - 12:10 PM",
    "12:40 PM - 04:00 PM"
  ],
  internal: [
    "08:40 AM - 10:20 AM",
    "10:30 AM - 12:10 PM",
    "12:40 PM - 02:20 PM",
    "02:30 PM - 04:00 PM"
  ]
}

const EXAM_TYPE = [
  "I", "II", "III"
]

const typeMap = {
  I: "internal",
  II: "internal",
  III: "model"
}

export function Dropdown({ label, icon: Icon, value, onChange, type }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={label === "Exam Time" && !type}
          className="pl-10 h-12 w-full border border-slate-300 rounded-md
          focus:ring-2 focus:ring-[#fdcc03]/20 bg-white"
        >
          <option value="">{label === "Exam Time" ? "Select Time" : "Select Exam Type"}</option>
          {label === "Exam Time"
            ? (TIME_SLOTS[typeMap[type]] || []).map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))
            : EXAM_TYPE.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
        </select>
      </div>
    </div>
  )
}