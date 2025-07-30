import React, { useEffect, useState } from "react";
// import React, { useState } from "react";
import Banner from "../Banner";
import LoadComp from '../LoadComp'

const GrievanceForm = ({ theme, toggle }) => {

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
          window.removeEventListener("online", handleOnline);
          window.removeEventListener("offline", handleOffline);
      };
  }, []);
  
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState("");
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [userCaptcha, setUserCaptcha] = useState("");
  const [contact_number, setContactNumber] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [query_about, setQueryAbout] = useState("");
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
      const response = await fetch("/api/main-backend/get_grievance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name , email , contact_number , query_about , category , content , original_captcha: captcha.toString(), entered_captcha: userCaptcha.toString() }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Success: ${data.message}`);
        alert("Email sent successfully");
      } else {
        setMessage(`Error: ${data.error || data.message}`);
        alert(data.message);
      }
    } catch (error) {
      setMessage("Error connecting to the server");
      console.error("Submission Error:", error);
    } finally {
      setLoading(false);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    setContent('');
    setEmail('');
    setUserCaptcha('');
    setName('');
    setContactNumber('');
    setQueryAbout('');
    setCategory('');
    setUserCaptcha('');
    setCaptcha(generateCaptcha());
  };
  

    if (!isOnline) {
        return (
          <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
            <LoadComp txt={"You are offline"} />
          </div>
        );
    }

  return (
    <>
      <div>
        <Banner
          toggle={toggle}
          theme={theme}
          backgroundImage="./Banners/Grievances_Banner.webp"
          headerText="Help Desk"
          subHeaderText="Raise your concerns here"
        />
      </div>

      <div className="flex justify-center p-6">
        <div className="w-full bg-prim dark:bg-drkts py-12 px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-start">
            {/* Left side: heading + illustration */}
            <div className="flex flex-col items-start justify-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-extrabold text-brwn dark:text-drkt leading-tight">
                Have a Query or Grievance?
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                We value your feedback and concerns. Please fill in your details and our
                team will reach out to you shortly.
              </p>
              {/* <img
                src="/assets/query-illustration.svg"
                alt="Query Illustration"
                className="w-64 md:w-80 opacity-90"
              /> */}
            </div>

            {/* Right side: the form */}
            <form
              onSubmit={handleSubmit}
              className="bg-prim dark:bg-drkp shadow-xl rounded-3xl px-8 py-10 space-y-6 border-t-8 border-brwn dark:border-drks"
            >
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  className="bg-transparent border-b-2 border-gray-300 focus:border-[#800000] dark:border-gray-600 dark:focus:border-[#800000] focus:outline-none py-2 px-1 text-text dark:text-prim"
                  placeholder=""
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  required
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Contact Number
                </label>
                <input
                  type="number"
                  className="bg-transparent border-b-2 border-gray-300 focus:border-[#800000] dark:border-gray-600 dark:focus:border-[#800000] focus:outline-none py-2 px-1 text-text dark:text-prim"
                  placeholder=""
                  onChange={(e) => setContactNumber(e.target.value)}
                  value={contact_number}
                  required
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  className="bg-transparent border-b-2 border-gray-300 focus:border-[#800000] dark:border-gray-600 dark:focus:border-[#800000] focus:outline-none py-2 px-1 text-text dark:text-prim"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Query About
                  </label>
                  <select
                    className="
                      p-3 rounded-lg
                      border-b-2 border-gray-300 focus:border-[#800000] dark:border-gray-600 dark:focus:border-[#800000] focus:outline-none
                      bg-prim dark:bg-drkp
                      text-text dark:text-prim
                      appearance-none
                    "
                    onChange={(e) => setQueryAbout(e.target.value)}
                    value={query_about}
                    required
                  >
                    <option className="bg-prim dark:bg-drkts text-text dark:text-prim">Select Query About</option>
                    <option className="bg-prim dark:bg-drkts text-text dark:text-prim">Admission</option>
                    <option className="bg-prim dark:bg-drkts text-text dark:text-prim">Hostel</option>
                    <option className="bg-prim dark:bg-drkts text-text dark:text-prim">Department</option>
                    <option className="bg-prim dark:bg-drkts text-text dark:text-prim">Controller of Examination</option>
                    <option className="bg-prim dark:bg-drkts text-text dark:text-prim">Others</option>
                  </select>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Category
                  </label>
                  <select
                    className="
                    p-3 rounded-lg
                    border-b-2 border-gray-300 focus:border-[#800000] dark:border-gray-600 dark:focus:border-[#800000] focus:outline-none
                    bg-prim dark:bg-drkp
                    text-text dark:text-prim
                    appearance-none
                    "
                    onChange={(e) => setCategory(e.target.value)}
                    value={category}
                    required
                  >
                    <option value="" className="bg-prim dark:bg-drkts text-text dark:text-prim">Select category</option>
                    <option className="bg-prim dark:bg-drkts text-text dark:text-prim">Alumni</option>
                    <option className="bg-prim dark:bg-drkts text-text dark:text-prim">Student</option>
                    <option className="bg-prim dark:bg-drkts text-text dark:text-prim">Parent</option>
                    <option className="bg-prim dark:bg-drkts text-text dark:text-prim">Industry Partner</option>
                    <option className="bg-prim dark:bg-drkts text-text dark:text-prim">Others</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Your Message
                </label>
                <textarea
                  className="bg-transparent border-b-2 border-gray-300 focus:border-[#800000] dark:border-gray-600 dark:focus:border-[#800000] focus:outline-none py-2 px-1 text-text dark:text-prim"
                  rows="4"
                  placeholder="Type your query or grievance..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                ></textarea>
              </div>

              {/* Captcha */}
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div className="bg-prim dark:bg-drkts rounded-lg py-3 text-center font-extrabold text-xl tracking-widest text-[#800000]">
                  {captcha}
                </div>
                <input
                  type="text"
                  className="bg-transparent border-b-2 border-gray-300 focus:border-[#800000] dark:border-gray-600 dark:focus:border-[#800000] focus:outline-none py-2 px-1 text-text dark:text-prim"
                  placeholder="Enter Captcha"
                  value={userCaptcha}
                  onChange={(e) => setUserCaptcha(e.target.value)}
                  required
                />
              </div>

              {/* Submit */}
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
        </div>
      </div>

      {/* Grievance Table */}
      <div className="p-6">
        <h2 className="text-center text-xl font-bold text-[#800000] dark:text-drkt mb-4">Grievance Contact Levels</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-center">
            <thead className="bg-[#808080] text-white">
              <tr>
                <th className="p-2 border">Section & Level</th>
                <th className="p-2 border">Admission</th>
                <th className="p-2 border">Hostel</th>
                <th className="p-2 border">Department</th>
                <th className="p-2 border">Controller of Examinations</th>
                <th className="p-2 border">Scholarship</th>
              </tr>
            </thead>
            <tbody>
            <tr>
                <td className="p-2 border">Level 1</td>
                <td colSpan="5" className="p-2 border">
Administrative Officer: Dr. V. Jeyabalraja <br></br>Professor, Department of Computer Science and Engineering , ph: 9444464865<br></br> 

<a href="grievance@velammal.edu.in" className="dark:text-drka">Email ID: grievence@velammal.edu.in </a>, Online Help desk :<a href="www.velammal.edu.in" className="dark:text-drka"> www.velammal.edu.in </a>
</td>
              </tr>
              <tr>
                <td className="p-2 border">Level 2</td>
                <td className="p-2 border">	Ms. Jenefer Asha Jeyarani<br></br>
                Admission Counsellor</td>
                <td className="p-2 border">Ms. Menaka<br></br>
                Dy. Warden<br></br> Girls Hostel</td>
                <td className="p-2 border">Class Advisor of<br></br> Department<br></br> Concerned</td>
                <td className="p-2 border">	Dr. P. Gurusamy<br></br>
                Asst. Professor, Maths & <br></br>Exam Cell Coordinator</td>
                <td className="p-2 border">Ms. N. Niveditha<br></br>
                Scholarship Office</td>
              </tr>
              <tr>
                <td className="p-2 border">Level 3</td>
                <td className="p-2 border">Dr. S. Shahil Kirupavathy<br></br>
                Professor & Head, Physics & <br></br>Nodal Officer - TNEA</td>
                <td className="p-2 border">Mr. Mathivanan<br></br>
                Dy. Warden<br></br> Boys Hostel</td>
                <td className="p-2 border">Academic <br></br>Coordinator of<br></br> Department<br></br> Concerned</td>
                <td className="p-2 border">Dr. A. Angala Parameswari<br></br>
                Asst. Professor, EEE & <br></br>Dy. COE</td>
                <td className="p-2 border">
	Mr. B. Prakash Kumar<br></br>
Nodal Officer - Scholarship</td>
              </tr>
              <tr>
                <td className="p-2 border">Level 4</td>
                <td className="p-2 border">Ms. S. Kalyani<br></br>
                PA to Principal</td>
                <td className="p-2 border">Mr. Theivanathan<br></br>
                Asst. Professor, ECE & <br></br>Dy.Chief Warden (Hostels)</td>
                <td className="p-2 border">	HoD of <br></br>Department<br></br> Concerned</td>
                <td className="p-2 border">	Dr. S. Srinath<br></br>
                Professor, EEE & COE</td>
                <td className="p-2 border">Ms. S. Kalyani<br></br>
                PA to Principal</td>
              </tr>
              <tr>
                <td className="p-2 border">Level 5</td>
                <td colSpan="5" className="p-2 border">Principal</td>
              </tr>
              <tr>
                <td className="p-3 border" colSpan={4}>Grievance related to PoSH(Prevention of sexual harrassment),<br />Gender issues or  any complaint raised by student</td>
                <td colSpan="5" className="p-3 border">Dr. Geetha R <br />Asst. Professor, EEE</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default GrievanceForm;

