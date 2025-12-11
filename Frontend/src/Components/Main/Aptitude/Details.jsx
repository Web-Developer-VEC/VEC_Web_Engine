import React from "react";
import { useState } from "react";
import "./Details.css";

export default function DetailsPage() {
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
    <div className="QAEXAM">
    <div className="form-container">
      <h2 className="title_of_Aptitude font-bold">Aptitude Examination</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Enter Name*"
          value={formData.name}
          onChange={handleChange}
        />

        <input
          type="text"
          name="regNo"
          placeholder="Enter Registration No:*"
          value={formData.regNo}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Enter Email*"
          value={formData.email}
          onChange={handleChange}
        />

        {/* <input
          type="password"
          name="password"
          placeholder="Enter Password *"
          value={formData.password}
          onChange={handleChange}
        /> */}

        <input
          type="text"
          name="phone"
          placeholder="Enter Phone Number (Optional)"
          value={formData.phone}
          onChange={handleChange}
        />

        <button type="submit">Enter into Exam</button>
      </form>
    </div>
    </div>
  );
}
