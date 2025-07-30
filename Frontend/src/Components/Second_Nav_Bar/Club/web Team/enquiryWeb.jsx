import { useState } from "react";

export default function EnquiryWeb() {
  const [err_page, setPage] = useState("");
  const [err_sub, setErrSub] = useState("");
  const [err_descrp, setErrDescrp] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const enquiryData = {
      err_page,
      err_sub,
      err_descrp,
    };

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
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-950 py-10 px-4 sm:px-6">
      <div className="w-full max-w-2xl bg-prine dark:bg-gray-800 shadow-2xl rounded-2xl p-6 sm:p-8 md:p-12 transition-all duration-300">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white mb-4 sm:mb-6 text-center leading-tight">
          Enquiry Now
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-6 sm:mb-8 px-2">
          Have a question or need more information about the recent issue you faced?
          Fill out this form and our team will get back to you.
        </p>

        <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
          {/* Error Subject Dropdown */}
          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2 text-sm sm:text-base">
              Error Subject
            </label>
            <select
              value={err_sub}
              onChange={(e) => setErrSub(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-brwn text-sm sm:text-base"
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

          {/* Error Page Input */}
          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2 text-sm sm:text-base">
              Page Error Happened
            </label>
            <input
              type="text"
              value={err_page}
              onChange={(e) => setPage(e.target.value)}
              placeholder="Type the error details here..."
              className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-brwn text-sm sm:text-base"
              required
            />
          </div>

          {/* Error Description */}
          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2 text-sm sm:text-base">
              Error Description
            </label>
            <textarea
              value={err_descrp}
              onChange={(e) => setErrDescrp(e.target.value)}
              placeholder="Type your message here..."
              rows="4"
              className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-brwn text-sm sm:text-base"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-brwn to-secd text-white font-bold py-3 px-6 rounded-xl shadow-md hover:from-brwn hover:to-brwn focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all text-sm sm:text-base"
          >
            Submit Enquiry
          </button>
        </form>
      </div>
    </div>
  );
}
