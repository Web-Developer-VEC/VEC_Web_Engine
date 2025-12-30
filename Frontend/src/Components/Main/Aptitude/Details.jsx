import React from "react";
import { useState, useEffect } from "react";
import "./Details.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import loginImg from "../../Assets/login.jpg";
import axios from "axios";

export default function DetailsPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle'); 
  const [formData, setFormData] = useState({
    department: "",
    registerno: "",
    password: "",
    year: ""
  });

  const DEPARTMENTS = ["CSE", "ECE", "EEE", "MECH", "IT", "AI&DS"];
  const YEARS = ["I", "II", "III", "IV"];

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (
        formData.department.trim() === "" ||
        formData.registerno.trim() === "" ||
        formData.password.trim() === "" ||
        formData.year.trim() === ""
      ) {
        alert("Please fill all mandatory fields.");
        return;
      }

      const deptMap = {
        "AI&DS": "Artificial Intelligence and Data Science"
      }

      const yearMap = {
        "I": 1,
        "II": 2
      }

      const res = await axios.post("/api/main-backend/studentlogin", {
        registerno: formData.registerno,
        password: formData.password,
        department: deptMap[formData.department],
        year: yearMap[formData.year]
      })

      const data = res.data;

      console.log(data);
      

      sessionStorage.setItem(
        "userSession",
        JSON.stringify({
          token: data.token,
          student: data.student
        })
      )

      console.log("Submitted:", formData);

      // Navigate ONLY after successful validation
      setTimeout(() => {
        navigate("/QA/confirm");
      }, 500);
    } catch (error) {
      console.error("Error login the student details");
    }
  }

  useEffect(() => {
    const checkDevice = () => {
      // Logic: If screen width is less than 1024px, it's likely a mobile or tablet
      if (window.innerWidth < 1024) {
        setStatus('invalid_device');
      } else if (localStorage.getItem('exam_status') === 'blocked') {
        setStatus('blocked');
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice); // Re-check if window is resized
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // ---------------- FULLSCREEN ENFORCEMENT WITH WARNING ----------------
  useEffect(() => {
    const enterFullscreenOnce = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      document.removeEventListener("click", enterFullscreenOnce);
    };

    document.addEventListener("click", enterFullscreenOnce);

    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        Swal.fire({
          title: "Fullscreen Required",
          text: "Please stay in fullscreen mode to continue the examination process.",
          icon: "warning",
          confirmButtonText: "Return to Fullscreen",
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then(() => {
          document.documentElement.requestFullscreen().catch(() => {});
        });
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      document.removeEventListener("click", enterFullscreenOnce);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  // INVALID DEVICE POPUP
  if (status === "invalid_device") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 px-4">
        <div className="bg-white shadow-xl rounded-xl p-6 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-3">⚠ DESKTOP REQUIRED</h2>
          <p>This exam cannot be taken on a Mobile or Tablet device.</p>
          <p className="mb-6">
            Please use a <b>Laptop or Desktop</b> with minimum width 1024px.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // BLOCKED POPUP
  if (status === "blocked") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 px-4">
        <div className="bg-white shadow-xl rounded-xl p-6 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-yellow-600 mb-3">⛔ ACCESS BLOCKED</h2>
          <p>Your access to this exam has been blocked.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="QAEXAM"
      style={{
        backgroundImage: `url(${loginImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="form-container">
        <h2 className="title_of_Aptitude font-bold">Aptitude Examination</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              name="registerno"
              value={formData.registerno}
              onChange={handleChange}
              placeholder=""
              required
            />
            <label>Registration No*</label>
          </div>

          <div className="input-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder=""
              required
            />
            <label>Password*</label>
          </div>

          <div className="input-group">
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            >
              <option value="" disabled hidden></option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <label>Department*</label>
          </div>

          <div className="input-group">
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
            >
              <option value="" disabled hidden></option>
              {YEARS.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
            <label>Year*</label>
          </div>

          <button type="submit">
            Enter into Exam
          </button>
        </form>
      </div>
    </div>
  );
}