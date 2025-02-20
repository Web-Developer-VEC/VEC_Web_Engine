import React, { useState } from "react";
import "./Grievences.css";
import Banner from "../Banner";

const GrievanceForm = ({toggle, theme}) => {
  const [formData, setFormData] = useState({
    email: "",
    subject: "",
    content: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Grievance submitted successfully!");
    setFormData({ email: "", subject: "", content: "" });
  };

  return (
    <>
      <div>
        <Banner toggle={toggle} theme={theme}
          backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
          headerText="Grievance Form"
          subHeaderText="Raise your concerns here"
        />
      </div>

      <div className="grievances-form-container bg-[color-mix(in_srgb,theme(colors.secd),transparent_80%)]
        dark:bg-[color-mix(in_srgb,theme(colors.drks),transparent_80%)]">
        <h2 className="grievances-heading text-secd dark:text-drks">Grievance Form</h2>
        <p className="grievances-description">
          If you have any concerns regarding college facilities, faculty,
          administration, or any other issue affecting your academic experience,
          please fill out the form below. Your feedback is valuable and will be
          addressed accordingly.
        </p>
        <form className="grievances-form" onSubmit={handleSubmit}>
          <label className="grievances-label-email">Email:</label>
          <input
            className="grievances-input-email bg-prim dark:bg-drkp"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label className="grievances-label-subject">Subject:</label>
          <input
            className="grievances-input-subject bg-prim dark:bg-drkp"
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
          />

          <label className="grievances-label-content">Content:</label>
          <textarea
            className="grievances-textarea-content bg-prim dark:bg-drkp"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
          ></textarea>

          <button className="grievances-button-submit bg-secd dark:bg-drks
            hover:bg-accn hover:text-prim dark:hover:bg-drka shadow-lg" type="submit">
            Submit
          </button>
        </form>
      </div>
    </>
  );
};

export default GrievanceForm;
