import { useState } from "react";

export default function Applynow () {

    const [email, setEmail] = useState('');
    const [content, setContent] = useState('');
    const [message, setMessage] = useState("");
    const [captcha, setCaptcha] = useState(generateCaptcha());
    const [userCaptcha, setUserCaptcha] = useState("");
    const [contact_number, setContactNumber] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

function generateCaptcha() {
    return Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
  }

  // Function to validate phone number
  const phoenCheck = (value) => {
    const phonePattern = /^[0-9]{10}$/; 
    if (!phonePattern.test(value)) {
      setContactNumber(value);
      alert("Please enter a valid phone number.");
      return false;
    }
    return true;
  }

  // Function to validate email
  const emailCheck = (value) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    if (!emailPattern.test(value)) {
      setEmail(value);
      alert("Please enter a valid email address.");
      return false;
    }
    return true;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userCaptcha !== captcha.toString()) {
      alert("Incorrect CAPTCHA, please try again.");
      setCaptcha(generateCaptcha());
      return;
    }

    // validate phone number
    if (contact_number && !phoenCheck(contact_number)) {
      return;
    }
    // validate email
    if (email && !emailCheck(email)) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/main-backend/iic_applynow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name , email , phno: contact_number , content }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Success: ${data.message}`);
        alert("Email sent successfully");
      } else {
        setMessage(`Error: ${data.error || data.message}`);
      }
    } catch (error) {
      setMessage("Error connecting to the server");
      console.error("Submission Error:", error);
    } finally {
      setLoading(false)
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    setContent('');
    setEmail('');
    setUserCaptcha('');
    setName('');
    setContactNumber('');
    setUserCaptcha('');
    setCaptcha(generateCaptcha());
  };
    return (
        <div className="bg-prim dark:bg-drkts p-8 shadow-lg rounded-lg w-full max-w-2xl h-fit m-auto">
          <h2 className="text-[20px] font-bold text-[#800000] dark:text-drkt">Incubation Committe Application</h2>
          <p className="text-[16px] text-prim dark:text-drkt">Please fill the form.</p>

          <form className="mt-2 space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Name"
                className="p-2 border border-gray-300 dark:bg-gray-300 placeholder-text text-text rounded w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Contact Number"
                className="p-2 border border-gray-300 dark:bg-gray-300 placeholder-text text-text rounded w-full"
                value={contact_number}
                onChange={(e) => setContactNumber(e.target.value)}
                required
              />
            </div>
            <input
              type="email"
              placeholder="Email Id"
              className="p-2 border border-gray-300 dark:bg-gray-300 placeholder-text text-text rounded w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <textarea
              placeholder="Type your message here"
              className="p-2 border border-gray-300 dark:bg-gray-300 placeholder-text text-text rounded w-full"
              rows="3"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-2 bg-gray-200 dark:bg-gray-300 text-center text-lg font-bold text-[#800000] rounded">
                {captcha}
              </div>
              <input
                type="text"
                placeholder="Enter the Captcha"
                className="p-2 border border-gray-300 dark:bg-gray-300 placeholder-text text-text rounded w-full"
                value={userCaptcha}
                onChange={(e) => setUserCaptcha(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`p-2 rounded w-full ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#800000] text-white"
              }`}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
    )
}