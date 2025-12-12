import React, { useState } from "react";
import "./Details.css";
import { useNavigate } from "react-router-dom";
import loginImg from "../../Assets/login.jpg"; 

export default function DetailsPage() {
  const navigate = useNavigate();
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
