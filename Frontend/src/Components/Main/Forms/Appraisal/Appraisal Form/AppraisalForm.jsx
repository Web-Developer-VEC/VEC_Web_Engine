import React, { useEffect, useState } from "react";
import "./AppraisalForm.css";
import Page1 from "./Academic_analytics.jsx";
import Page2 from "./Research_activities.jsx";
import Page3 from "./Student_development.jsx";
import Page4 from "./Outreach_inovation.jsx";
import Page5 from "./Apprasiers_remarks.jsx";
import axios from "axios";
import Academic_analytics from "./Academic_analytics.jsx";
import Research_activities from "./Research_activities.jsx";
import Student_development from "./Student_development.jsx";
import Outreach_inovation from "./Outreach_inovation.jsx";
import Apprasiers_remarks from "./Apprasiers_remarks.jsx";

const AppraisalForm = () => {
  /* ================= MAIN FORM STATE ================= */

  const [mainForm, setMainForm] = useState({
    department: "",
    academic_year: "",
    hod_details: {
      hod_name: "",
      department_name: "",
      date_of_joining_as_hod: "",
    },
  });

  /* ================= PAGE STATES ================= */

  const [formState, setFormState] = useState({
    page1: {},
    page2: {},
    page3: {},
    page4: {},
    page5: {},
  });

  useEffect(() => {
    // console.log("FORM STATE 👉", formState);
  }, [formState]);

  const updatePageData = (pageKey, data) => {
    setFormState((prev) => ({
      ...prev,
      [pageKey]: data,
    }));
  };

  /* ================= YEARS ================= */

  const [years, setYears] = useState([
    "2023-2024",
    "2024-2025",
    "2025-2026",
  ]);

  const [selectedYear, setSelectedYear] = useState("");
  const [newAcadamicYear, setNewAcadamicYear] = useState("");

  useEffect(() => {
    if (selectedYear) {
      const [start, end] = selectedYear.split("-").map(Number);
      const newAcademic = `${start + 1}-${end + 1}`;
      setNewAcadamicYear(newAcademic);

      // ✅ sync with main form
      setMainForm((prev) => ({
        ...prev,
        academic_year: selectedYear,
      }));
    }
  }, [selectedYear]);

  const handleAddYear = () => {
    const lastYear = years[years.length - 1];
    const [start, end] = lastYear.split("-").map(Number);
    const newAcademicYear = `${start + 1}-${end + 1}`;
    setYears([...years, newAcademicYear]);
  };

  /* ================= MAIN FORM HANDLERS ================= */

  const handleDepartmentChange = (e) => {
    const selectedText = e.target.selectedOptions[0]?.text || "";

    setMainForm((prev) => ({
      ...prev,
      department: e.target.value,
      hod_details: {
        ...prev.hod_details,
        department_name: selectedText,
      },
    }));
  };

  const handleHodChange = (e) => {
    setMainForm((prev) => ({
      ...prev,
      hod_details: {
        ...prev.hod_details,
        hod_name: e.target.value,
      },
    }));
  };

  const handleJoiningDateChange = (e) => {
    setMainForm((prev) => ({
      ...prev,
      hod_details: {
        ...prev.hod_details,
        date_of_joining_as_hod: e.target.value,
      },
    }));
  };


const handleSubmit = async (e) => {
  e.preventDefault();

  try {

    const payload = {
      ...mainForm,
      ...formState.page1,
      ...formState.page2,
      ...formState.page3,
      ...formState.page4,
      ...formState.page5,
    };

    const formData = new FormData();

    // JSON Data
    formData.append("data", JSON.stringify(payload));


    // 🔥 Recursive file extractor
    const appendFiles = (obj, parentKey = "") => {

      Object.keys(obj).forEach((key) => {

        const value = obj[key];

        const fieldKey =
          parentKey ? `${parentKey}.${key}` : key;


        // If File → append
        if (value instanceof File) {

          formData.append(fieldKey, value);

        }

        // If Object → go deeper
        else if (
          value &&
          typeof value === "object"
        ) {

          appendFiles(value, fieldKey);

        }

      });

    };

    appendFiles(payload);


    // Debug
    for (let pair of formData.entries()) {

      console.log(pair[0], pair[1]);

    }


    const response = await axios.post(
      "/api/main-backend/appraisal_form",
      formData
    );


    alert("Form Submitted Successfully!");

  } catch (error) {

    console.error(error);
    alert("Something went wrong!");

  }
};

  return (
    <form className="container" onSubmit={handleSubmit}>
      <h2 className="pb-12">Department Appraisal</h2>

  
      <div className="top-info">
       

        <div>
          <label htmlFor="year">Department Appraisal:</label>
          <select
            id="year"
            value={selectedYear}
            onChange={(e) => {
              if (e.target.value === "add") handleAddYear();
              else setSelectedYear(e.target.value);
            }}
          >
            <option value="">Select Academic Year</option>

            {years.map((year, index) => (
              <option key={index} value={year}>
                {year}
              </option>
            ))}

            <option value="add">Add Year</option>
          </select>
        </div>

        {/* DEPARTMENT */}

        <div>
          <label htmlFor="department">Name of the Department:</label>
          <select
            id="department"
            value={mainForm.department}
            onChange={handleDepartmentChange}
          >
            <option value="">Select Department</option>
          <option value="AIDS">Artificial Intelligence and Data Science</option>
          <option value="AUTO">Automobile Engineering</option>
          <option value="CHEMISTRY">Chemistry</option>
          <option value="CIVIL">Civil Engineering</option>
          <option value="CSE">Computer Science and Engineering</option>
          <option value="CSECS">Computer Science and Engineering (Cyber Security)</option>
          <option value="EEE">Electrical and Electronics Engineering</option>
          <option value="EIE">Electronics and Instrumentation Engineering</option>
          <option value="ECE">Electronics and Communication Engineering</option>
          <option value="ENGLISH">English</option>
          <option value="IT">Information Technology</option>
          <option value="MATHS">Mathematics</option>
          <option value="MECH">Mechanical Engineering</option>
          <option value="TAMIL">Tamil</option>
          <option value="PHYSICS">Physics</option>
          <option value="MECSE">Mechanical Engineering (CSE)</option>
          <option value="MBA">Master of Business Administration</option>
          </select>
        </div>

        {/* HOD */}

        <div>
          <label htmlFor="hod">Name of the HoD:</label>
          <input
            type="text"
            value={mainForm.hod_details.hod_name}
            onChange={handleHodChange}
            placeholder="Enter Name"
          />
        </div>

        {/* JOINING DATE */}

        <div>
          <label htmlFor="joiningDate">
            Date of Joining as Head of the Department:
          </label>
          <input
            type="date"
            value={mainForm.hod_details.date_of_joining_as_hod}
            onChange={handleJoiningDateChange}
            max={new Date().toISOString().split("T")[0]}
          />
        </div>
      </div>

      {/* ================= PAGES ================= */}

      <Academic_analytics selectedYear={selectedYear}
        newAcadamicYear={newAcadamicYear}
        data={formState.page1}
        setData={(data) => updatePageData("page1", data)}
      />

      <Research_activities
        selectedYear={selectedYear}
        newAcadamicYear={newAcadamicYear}
        data={formState.page2}
        setData={(data) => updatePageData("page2", data)}
      />

      <Student_development
        selectedYear={selectedYear}
        newAcadamicYear={newAcadamicYear}
        data={formState.page3}
        setData={(data) => updatePageData("page3", data)}
      />

      <Outreach_inovation
        selectedYear={selectedYear}
        newAcadamicYear={newAcadamicYear}
        data={formState.page4}
        setData={(data) => updatePageData("page4", data)}
      />

      <Apprasiers_remarks
        selectedYear={selectedYear}
        newAcadamicYear={newAcadamicYear}
        data={formState.page5}
        setData={(data) => updatePageData("page5", data)}
      />

      {/* ================= SUBMIT ================= */}

      <div className="px-4 py-2 text-text bg-secd border rounded w-fit mt-4 flex mx-auto">
        <button type="submit">Submit</button>
      </div>
    </form>
  );
};

export default AppraisalForm;