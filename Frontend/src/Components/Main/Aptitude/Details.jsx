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
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    department: "",
    registerno: "",
    password: "",
    year: ""
  });
  
  const DEPARTMENTS = ["CSE", "ECE", "EEE", "MECH", "IT", "AI&DS", "EIE", "AUTO", "CIVIL", "CSE(CS)"];
  const YEARS = ["2023-2027", "2024-2028", "2025-2029"];

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const loginStudent = async () => {
    const deptMap = {
      "AI&DS": "ARTIFICIAL INTELLIGENCE AND DATA SCIENCE",
      "ECE": "ELECTRONICS AND COMMUNICATION ENGINEERING",
      "CSE": "COMPUTER SCIENCE AND ENGINEERING",
      "EEE": "ELECTRICAL AND ELECTRONICS ENGINEERING",
      "EIE": "ELECTRONICS AND INSTRUMENTATION ENGINEERING",
      "IT": "INFORMATION TECHNOLOGY",
      "MECH": "MECHANICAL ENGINEERING",
      "AUTO": "AUTOMOBILE ENGINEERING",
      "CIVIL": "CIVIL ENGINEERING",
      "CSE(CS)": "CSE(CYBER SECURITY)",
    };

    return axios.post("/api/main-backend/studentlogin", {
      registerno: formData.registerno,
      password: formData.password,
      department: deptMap[formData.department],
      batch: formData.year,
    });
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (
      !formData.department ||
      !formData.registerno ||
      !formData.password ||
      !formData.year
    ) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all mandatory fields.",
        confirmButtonColor: "#800000",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await loginStudent();
      const data = res.data;

      // ✅ PAUSED SESSION
      if (data.code === "SESSION_PAUSED" && data.canResume) {
        const result = await Swal.fire({
          icon: "info",
          title: "Previous Session Found",
          text: "You have a paused exam session. Do you want to resume it?",
          confirmButtonText: "Resume Exam",
          confirmButtonColor: "#800000",
          allowOutsideClick: false,
        });

        if (result.isConfirmed) {

          Swal.close(); // ✅ IMPORTANT

          navigate("/QA/confirm", {
            replace: true,
            state: { student: data.student, canResume: true },
          });
        }

        return;
      }

      await Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "You have successfully logged in.",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/QA/confirm", {
        replace: true,
        state: { student: data.student },
      });

    } catch (error) {
      if (error.response?.data?.code === "ALREADY_LOGGED_IN") {
        Swal.fire({
          icon: "warning",
          title: "Already Logged In",
          text:
            "You are already attending the exam on another device or tab. Please continue there.",
          confirmButtonColor: "#800000",
        });
        return;
      }

      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text:
          error?.response?.data?.message ||
          "Invalid credentials. Please try again.",
        confirmButtonColor: "#800000",
      });
    } finally {
      setLoading(false)
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
        document.documentElement.requestFullscreen().catch(() => { });
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
          document.documentElement.requestFullscreen().catch(() => { });
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
            onClick={() => navigate("/QA/qaexam")}
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
            onClick={() => navigate("/QA/qaexam")}
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

          <div className={`input-group ${formData.department ? "has-value" : ""}`}>
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

          <div className={`input-group ${formData.year ? "has-value" : ""}`}>
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
            <label>Batch*</label>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Entering..." : "Enter into Exam"}
          </button>
        </form>
      </div>
    </div>
  );
}