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
      const response = await fetch("/api/get_grevience", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name , email , contact_number , query_about , category , content , original_captcha: captcha, entered_captcha: userCaptcha }),
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
          backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
          headerText="Grievance Form"
          subHeaderText="Raise your concerns here"
        />
      </div>

      <div className="flex justify-center p-6">
        <div className="bg-prim dark:bg-drkts p-8 shadow-lg rounded-lg w-full max-w-2xl h-fit">
          <h2 className="text-[20px] font-bold text-[#800000] dark:text-drkt">Query/Grievances</h2>
          <p className="text-[16px] text-prim dark:text-drkt">Please fill the form.</p>

          <form className="mt-2 space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Name"
                className="p-2 border border-gray-300 dark:bg-gray-300 placeholder-text text-text rounded w-full"
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Contact Number"
                className="p-2 border border-gray-300 dark:bg-gray-300 placeholder-text text-text rounded w-full"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select className="p-2 border border-gray-300 dark:bg-gray-300 text-text rounded w-full" onChange={(e) => setQueryAbout(e.target.value)} required>
                <option>-- Query about --</option>
                <option>Admission</option>
                <option>Hostel</option>
                <option>Department</option>
                <option>Controller of examination</option>
                <option>Others</option>
              </select>
              <select className="p-2 border border-gray-300 dark:bg-gray-300 text-text rounded w-full" onChange={(e) => setCategory(e.target.value)} required>
                <option>-- Select Category --</option>
                <option>Alumni</option>
                <option>Student</option>
                <option>Parent</option>
                <option>Industry partner</option>
                <option>Others</option>
              </select>
            </div>
            <textarea
              placeholder="Query/Grievences"
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
            <button type="submit" className="bg-[#800000] text-white p-2 rounded w-full">
              Submit
            </button>
          </form>
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

