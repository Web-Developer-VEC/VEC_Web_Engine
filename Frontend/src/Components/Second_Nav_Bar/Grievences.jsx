import React, { useState } from "react";
import "./Grievences.css";
import Banner from "../Banner";

const GrievanceForm = ({theme, toggle}) => {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page refresh

    try {
      const response = await fetch("/api/get_grevience", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", 
        body: JSON.stringify({ email, subject, content }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Success: ${data.message}`);
        console.log("User Info:", data.message); 
        alert("email send successfully")
      } else {
        setMessage(`Error: ${data.error || data.message}`);
        alert(data.message);
      }
    } catch (error) {
      setMessage("Error connecting to the server");
      console.error("Login Error:", error);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    setContent('');
    setSubject('');
    setEmail('');
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

      <div className="grievances-form-container border-4 border-secd dark:border-drks
        bg-[color-mix(in_srgb,theme(colors.accn)_10%,white)]
        dark:bg-[color-mix(in_srgb,theme(colors.drka)_10%,black)]">
        <h2 className="grievances-heading text-accn dark:text-drka">Grievance Form</h2>
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
            value={email}
            onChange={(e)=> setEmail(e.target.value)}
            required
          />

          <label className="grievances-label-subject">Subject:</label>
          <input
            className="grievances-input-subject bg-prim dark:bg-drkp"
            type="text"
            name="subject"
            value={subject}
            onChange={(e)=> setSubject(e.target.value)}
            required
          />

          <label className="grievances-label-content">Content:</label>
          <textarea
            className="grievances-textarea-content bg-prim dark:bg-drkp"
            name="content"
            value={content}
            onChange={(e)=> setContent(e.target.value)}
            required
          ></textarea>

          <button className="grievances-button-submit" type="submit">
            Submit
          </button>
        </form>
        {message && (
          <>
            <br />
            <p>{message}</p>
          </>
        )}
      </div>
    </>
  );
};

export default GrievanceForm;
