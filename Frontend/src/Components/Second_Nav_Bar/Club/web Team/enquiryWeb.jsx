import { useState } from "react";

export default function EnquiryWeb() {
  // State variables for form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare data
    const enquiryData = {
      fullName,
      email,
      phone,
      message,
    };

    console.log("Submitting enquiry:", enquiryData);

    try {
      // Example POST API call
      const res = await fetch("/api/webTeamForm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(enquiryData),
      });

      if (res.ok) {
        // Handle success
        alert("Enquiry submitted successfully!");
        // Optionally clear form
        setFullName("");
        setEmail("");
        setPhone("");
        setMessage("");
      } else {
        // Handle error
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
          Have a question or need more information about Velammal Engineering College?  
          Fill out this form and our team will get back to you.
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brwn transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brwn transition-all"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brwn transition-all"
            />
          </div>


          {/* Message */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Your Message / Enquiry</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
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
