import React, { useEffect, useState } from "react";
// import React, { useState } from "react";
import Banner from "../../Banner";
import LoadComp from '../../LoadComp'
import { useNavigate } from "react-router";
import axios from "axios";

const GrievanceForm = ({ theme, toggle }) => {
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();

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

  const [grievanceData, setGrievanceData] = useState(null); 

  useEffect(() => {
    const fetchGrievanceData = async () => {
      try {
        const res = await axios.post("/api/main-backend/help_desk", {
          type: "Help desk"
        });
        const data = res.data.data;
        console.log(res.data);
        
        setGrievanceData(data);
      } catch (err) {
        console.error("Error fetching grievance table:", err);
      }
    };
    fetchGrievanceData();
  }, []);

  const section = grievanceData?.find((item) => item.category === "section & level")?.content || [];
  const level1  = grievanceData?.find((item) => item.category === "level1")?.content || [];
  const level2  = grievanceData?.find((item) => item.category === "level2")?.content || [];
  const level3  = grievanceData?.find((item) => item.category === "level3")?.content || [];
  const level4  = grievanceData?.find((item) => item.category === "level4")?.content || [];
  const level5  = grievanceData?.find((item) => item.category === "level5")?.content || [];
  const another = grievanceData?.find((item) => item.category === "another")?.content || [];

  if (!grievanceData || grievanceData.length === 0) {
  return <p>Loading grievance table...</p>;
}

  function generateCaptcha() {
    return Math.floor(1000 + Math.random() * 9000); 
  }

  const phoenCheck = (value) => {
    const phonePattern = /^[0-9]{10}$/; 
    if (!phonePattern.test(value)) {
      setContactNumber(value);
      alert("Please enter a valid phone number.");
      return false;
    }
    return true;
  }

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

    if (contact_number && !phoenCheck(contact_number)) {
      return;
    }
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
      if (error.response?.data?.status === 429) {
        navigate('/ratelimit', { state: { msg: error.response.data.message}})
      }
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

      <div className="flex justify-center p-6 font-[poppins]">
        <div className="w-full bg-prim dark:bg-drkts py-12 px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-start">
            {/* Left side */}
            <div className="flex flex-col items-start justify-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-extrabold text-brwn dark:text-drkt leading-tight">
                Have a Query or Grievance?
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                We value your feedback and concerns. Please fill in your details and our
                team will reach out to you shortly.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-prim dark:bg-drkp shadow-xl rounded-3xl px-8 py-10 space-y-6 border-t-8 border-brwn dark:border-drks"
            >
              
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Full Name</label>
                <input type="text" className="bg-transparent border-b-2 border-gray-300 focus:border-[#800000] dark:border-gray-600 dark:focus:border-[#800000] focus:outline-none py-2 px-1 text-text dark:text-prim" onChange={(e) => setName(e.target.value)} value={name} required />
              </div>

              
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Contact Number</label>
                <input type="number" className="bg-transparent border-b-2 border-gray-300 focus:border-[#800000] dark:border-gray-600 dark:focus:border-[#800000] focus:outline-none py-2 px-1 text-text dark:text-prim" onChange={(e) => setContactNumber(e.target.value)} value={contact_number} required />
              </div>

              
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Email Address</label>
                <input type="email" className="bg-transparent border-b-2 border-gray-300 focus:border-[#800000] dark:border-gray-600 dark:focus:border-[#800000] focus:outline-none py-2 px-1 text-text dark:text-prim" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Query About</label>
                  <select className="p-3 rounded-lg border-b-2 border-gray-300 focus:border-[#800000] dark:border-gray-600 dark:focus:border-[#800000] focus:outline-none bg-prim dark:bg-drkp text-text dark:text-prim appearance-none" onChange={(e) => setQueryAbout(e.target.value)} value={query_about} required>
                    <option>Select Query About</option>
                    <option>Admission</option>
                    <option>Hostel</option>
                    <option>Department</option>
                    <option>Controller of Examination</option>
                    <option>Others</option>
                  </select>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Category</label>
                  <select className="p-3 rounded-lg border-b-2 border-gray-300 focus:border-[#800000] dark:border-gray-600 dark:focus:border-[#800000] focus:outline-none bg-prim dark:bg-drkp text-text dark:text-prim appearance-none" onChange={(e) => setCategory(e.target.value)} value={category} required>
                    <option value="">Select category</option>
                    <option>Alumni</option>
                    <option>Student</option>
                    <option>Parent</option>
                    <option>Industry Partner</option>
                    <option>Others</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Your Message</label>
                <textarea className="bg-transparent border-b-2 border-gray-300 focus:border-[#800000] dark:border-gray-600 dark:focus:border-[#800000] focus:outline-none py-2 px-1 text-text dark:text-prim" rows="4" value={content} onChange={(e) => setContent(e.target.value)} required></textarea>
              </div>

              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div className="bg-prim dark:bg-drkts rounded-lg py-3 text-center font-extrabold text-xl tracking-widest text-[#800000]">{captcha}</div>
                <input type="text" className="bg-transparent border-b-2 border-gray-300 focus:border-[#800000] dark:border-gray-600 dark:focus:border-[#800000] focus:outline-none py-2 px-1 text-text dark:text-prim" placeholder="Enter Captcha" value={userCaptcha} onChange={(e) => setUserCaptcha(e.target.value)} required />
              </div>

              <button type="submit" disabled={loading} className={`p-2 rounded w-full ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#800000] text-white"}`}>{loading ? "Submitting..." : "Submit"}</button>
            </form>
          </div>
        </div>
      </div>

      <div className="p-6">
  <h2 className="text-center text-xl font-bold text-[#800000] dark:text-drkt mb-4">
    Grievance Contact Levels
  </h2>
  <div className="overflow-x-auto">
    {grievanceData && grievanceData.length > 0 ? (
      <table className="w-full border border-gray-300 text-center">
        <thead className="bg-[#808080] text-white">
          <tr>
            <th className="p-2 border">Section & Level</th>
            {section.map((header, idx) => (
              <th key={idx} className="p-2 border">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          
          {level1 && (
            <tr>
              <td className="p-2 border">Level 1</td>
              <td colSpan={section.length} className="p-2 border">
                {level1.Administrative_Officer} <br />
                ph: {level1.ph || "-"} <br />
                <a
                  href={`mailto:${level1.email_id || ""}`}
                  className="dark:text-drka"
                >
                  Email ID: {level1.email_id}
                </a>
                , Online Help desk:{" "}
                <a
                  href={`https://${level1.Online_Help_desk || ""}`}
                  className="dark:text-drka"
                >
                  {level1.Online_Help_desk}
                </a>
              </td>
            </tr>
          )}

          {[level2, level3, level4].map((level, idx) => (
            <tr key={idx}>
              <td className="p-2 border">Level {idx + 2}</td>
              {section.map((sec, i) => {
                const key = sec.toLowerCase().replace(/\s|&/g, '');
                return (
                  <td key={i} className="p-2 border">
                    {level[key] || "-"}
                  </td>
                );
              })}
            </tr>
          ))}

          {level5 && level5.length > 0 && (
            <tr>
              <td className="p-2 border">Level 5</td>
              <td colSpan={section.length} className="p-2 border">
                {level5[0]}
              </td>
            </tr>
          )}

          {another && another.length > 0 && (
            <tr>
              <td
                className="p-3 border"
                colSpan={Math.ceil(section.length / 2) + 1}
              >
                {another[0]}
              </td>
              <td
                colSpan={Math.floor(section.length / 2)}
                className="p-3 border"
              >
                {another[1]}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    ) : (
      <p className="text-center text-gray-500">Loading grievance table...</p>
    )}
  </div>
</div>

    </>
  );
};

export default GrievanceForm;
