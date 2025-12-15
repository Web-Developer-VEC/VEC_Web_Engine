import React from "react";
import { useState,useEffect} from "react";
import "./Details.css";
import { useNavigate } from "react-router-dom";
import loginImg from "../../Assets/login.jpg"; 

export default function DetailsPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle'); 
  const [formData, setFormData] = useState({
    name: "",
    regNo: "",
    email: "",
    password: "",
    phone: ""
  });

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();

  if (
    formData.name.trim() === "" ||
    formData.regNo.trim() === "" ||
    formData.email.trim() === "" 
    // ||
    // formData.password.trim() === ""
  ) {
    alert("Please fill all mandatory fields.");
    return;
  }

  console.log("Submitted:", formData);
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
   // ✅ INVALID DEVICE POPUP
  if (status === "invalid_device") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 px-4">
        <div className="bg-white shadow-xl rounded-xl p-6 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-3">⚠️ DESKTOP REQUIRED</h2>
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

  // ✅ BLOCKED POPUP
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
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder=""
            />
            <label>Name*</label>
          </div>

          <div className="input-group">
            <input
              type="text"
              name="regNo"
              value={formData.regNo}
              onChange={handleChange}
              required
              placeholder=""
            />
            <label>Registration No*</label>
          </div>

          <div className="input-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder=""
            />
            <label>Email*</label>
          </div>

          {/*
          <div className="input-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder=""
            />
            <label>Password*</label>
          </div>
          */}

          <div className="input-group">
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder=""
            />
            <label>Phone Number (Optional)</label>
          </div>

          <button type="submit" onClick={() => navigate("/QA/confirm")}>
            Enter into Exam
          </button>
        </form>
      </div>
    </div>
  );
}
