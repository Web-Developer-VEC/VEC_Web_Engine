import { useState } from "react";

export default function EnquiryWeb() {
  const [err_page, setPage] = useState("");
  const [err_sub, setErrSub] = useState("");
  const [err_descrp, setErrDescrp] = useState("");

  // const errorDescriptions = {
  //   page_load: "The page failed to load. Please check your network or try again later.",
  //   form_submit: "Form submission failed. Ensure all fields are correctly filled.",
  //   login_problem: "Trouble logging in. Please verify your credentials or reset your password.",
  //   api_error: "API failed to fetch data. Possibly due to server downtime or configuration issues.",
  //   js_error: "A JavaScript error prevented interaction. Try refreshing or checking browser console.",
  //   page_error: "A general page error occurred. Please report this with additional info.",
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const enquiryData = {
     
      err_page,
      err_sub,
      err_descrp,
    };

    console.log("Submitting enquiry:", enquiryData);

    try {
      const res = await fetch("/api/webTeamForm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enquiryData),
      });

      if (res.ok) {
        alert("Enquiry submitted successfully!");
        setPage("");
        setErrSub("");
        setErrDescrp("");
      } else {
        alert("Failed to submit enquiry. Please try again later.");
      }
    } catch (error) {
      console.error("Error submitting enquiry:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-10 px-4">
      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl p-8 md:p-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-6 text-center">
          Enquiry Now
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Have a question or need more information about the recent issue you faced?
          Fill out this form and our team will get back to you.
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
         

          {/* Error Subject Dropdown */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Error Subject</label>
            <select
              value={err_sub}
              onChange={(e) => setErrSub(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brwn transition-all"
              required
            >
              <option value="">-- Select Error --</option>
              <option value="page_load">Page didn’t load</option>
              <option value="form_submit">Can’t submit a form</option>
              <option value="login_problem">Login problem</option>
              <option value="api_error">Something didn’t load (API error)</option>
              <option value="js_error">Button or feature not working (JavaScript error)</option>
            </select>
          </div>


          {/* Textarea for Error Description */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Page Error Happened</label>
          <input
            type="text"
            value={err_page}
            onChange={(e) => setPage(e.target.value)}
            placeholder="Type the error details here..."
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brwn transition-all"
            required
          />
        </div>


          {/* General Message */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Error Description</label>
            <textarea
              value={err_descrp}
              onChange={(e) => setErrDescrp(e.target.value)}
              placeholder="Type your message here..."
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brwn transition-all"
            ></textarea>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-brwn to-secd text-white font-bold py-3 px-6 rounded-xl shadow-md hover:from-brwn hover:to-brwn focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all"
          >
            Submit Enquiry
          </button>
        </form>
      </div>
    </div>
  );
}
