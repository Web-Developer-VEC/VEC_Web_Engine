import React, { useEffect, useState } from "react";
import Banner from "../../../Banner";
import LoadComp from "../../../LoadComp";
import { useNavigate } from "react-router";
import axios from "axios";
import { CircleX, PlusCircle, SquarePen, Trash2, SaveAll } from "lucide-react";

const AdminGrievanceForm = ({ theme, toggle }) => {
  const navigate = useNavigate();

  // connectivity
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

  // page/local ui
  const [loading, setLoading] = useState(false);
  const [editHdesk, setEditHdesk] = useState(false);

  // form state
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [userCaptcha, setUserCaptcha] = useState("");
  const [contact_number, setContactNumber] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [query_about, setQueryAbout] = useState("");

  // grievance data from backend
  const [grievanceData, setGrievanceData] = useState(null);

  // normalized, editable table pieces
  const [section, setSection] = useState([]);          // headers shown as columns
  const [levels, setLevels] = useState([]);            // Level 2..N rows (editable)
  const [level1, setLevel1] = useState(null);          // Level 1 object (separate layout)
  const [showLevel1, setShowLevel1] = useState(true);  // allow deleting level1 visually
  const [another, setAnother] = useState([]);          // extra row content (unchanged here)

  // fetch data
  useEffect(() => {
    const fetchGrievanceData = async () => {
      try {
        const res = await axios.post("/api/main-backend/help_desk", {
          type: "Help desk",
        });
        const data = res.data?.data || [];
        setGrievanceData(data);
      } catch (err) {
        console.error("Error fetching grievance table:", err);
      }
    };
    fetchGrievanceData();
  }, []);

  // when grievanceData is ready, normalize into editable state
  useEffect(() => {
    if (!grievanceData) return;

    const sec =
      grievanceData.find((it) => it.category === "section & level")?.content || [];

    const l1 =
      grievanceData.find((it) => it.category === "level1")?.content || null;

    const l2 =
      grievanceData.find((it) => it.category === "level2")?.content || {};
    const l3 =
      grievanceData.find((it) => it.category === "level3")?.content || {};
    const l4 =
      grievanceData.find((it) => it.category === "level4")?.content || {};
        const l5  = grievanceData?.find((item) => item.category === "level5")?.content || [];

    const an =
      grievanceData.find((it) => it.category === "another")?.content || [];

    const normKey = (h) => h.toLowerCase().replace(/\s|&/g, "");

    const makeRow = (srcObj) => {
      const row = {};
      sec.forEach((h) => {
        const k = normKey(h);
        row[k] = srcObj?.[k] ?? "";
      });
      return row;
    };

    setSection(sec);
    setLevel1(l1);
    setAnother(an);
    // start with level2..4 as editable rows
    setLevels([makeRow(l2), makeRow(l3), makeRow(l4)]);
    setShowLevel1(true);
  }, [grievanceData]);

  function generateCaptcha() {
    return Math.floor(1000 + Math.random() * 9000);
  }

  // validation
  const phoenCheck = (value) => {
    const phonePattern = /^[0-9]{10}$/;
    if (!phonePattern.test(value)) {
      alert("Please enter a valid phone number.");
      return false;
    }
    return true;
  };

  const emailCheck = (value) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      alert("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  // form submit (unchanged backend)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userCaptcha !== captcha.toString()) {
      alert("Incorrect CAPTCHA, please try again.");
      setCaptcha(generateCaptcha());
      return;
    }
    if (contact_number && !phoenCheck(contact_number)) return;
    if (email && !emailCheck(email)) return;

    try {
      setLoading(true);
      const response = await fetch("/api/main-backend/get_grievance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          email,
          contact_number,
          query_about,
          category,
          content,
          original_captcha: captcha.toString(),
          entered_captcha: userCaptcha.toString(),
        }),
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
      if (error?.response?.data?.status === 429) {
        navigate("/ratelimit", { state: { msg: error.response.data.message } });
      }
      console.error("Submission Error:", error);
    } finally {
      setLoading(false);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    setContent("");
    setEmail("");
    setUserCaptcha("");
    setName("");
    setContactNumber("");
    setQueryAbout("");
    setCategory("");
    setUserCaptcha("");
    setCaptcha(generateCaptcha());
  };

  // ====== TABLE EDITING API (FRONTEND ONLY) ======

  // change a specific cell in Level 2..N rows
  const handleChange = (rowIndex, key, value) => {
    setLevels((prev) =>
      prev.map((row, idx) => (idx === rowIndex ? { ...row, [key]: value } : row))
    );
  };

  // add a new row after Level 4 => becomes Level 5 (and so on)
  const handleAddRow = () => {
    const normKey = (h) => h.toLowerCase().replace(/\s|&/g, "");
    const blank = {};
    section.forEach((h) => (blank[normKey(h)] = ""));
    setLevels((prev) => [...prev, blank]);
  };

  // delete full Level 1 row (as requested)
  const handleDeleteLevel1 = () => {
    setShowLevel1(false);
  };

  // delete a Level 2..N row by index in `levels`
  const handleDeleteRow = (rowIndex) => {
    setLevels((prev) => prev.filter((_, idx) => idx !== rowIndex));
  };

  // save (for now just exit edit mode; backend integration later)
  const handleSave = () => {
    setEditHdesk(false);
    // If needed later: map `levels` back into the original grievanceData shape
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

      {/* FORM */}
      <div className="flex justify-center p-6 font-[poppins]">
        <div className="w-full bg-prim dark:bg-drkts py-12 px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-start">
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
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  className="bg-transparent border-b-2 border-gray-300 focus:border-[#800000] dark:border-gray-600 dark:focus:border-[#800000] focus:outline-none py-2 px-1 text-text dark:text-prim"
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
                    className="p-3 rounded-lg border-b-2 border-gray-300 focus:border-[#800000] dark:border-gray-600 dark:focus:border-[#800000] focus:outline-none bg-prim dark:bg-drkp text-text dark:text-prim appearance-none"
                    onChange={(e) => setQueryAbout(e.target.value)}
                    value={query_about}
                    required
                  >
                    <option>Select Query About</option>
                    <option>Admission</option>
                    <option>Hostel</option>
                    <option>Department</option>
                    <option>Controller of Examination</option>
                    <option>Others</option>
                  </select>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Category
                  </label>
                  <select
                    className="p-3 rounded-lg border-b-2 border-gray-300 focus:border-[#800000] dark:border-gray-600 dark:focus:border-[#800000] focus:outline-none bg-prim dark:bg-drkp text-text dark:text-prim appearance-none"
                    onChange={(e) => setCategory(e.target.value)}
                    value={category}
                    required
                  >
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
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Your Message
                </label>
                <textarea
                  className="bg-transparent border-b-2 border-gray-300 focus:border-[#800000] dark:border-gray-600 dark:focus:border-[#800000] focus:outline-none py-2 px-1 text-text dark:text-prim"
                  rows="4"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                ></textarea>
              </div>

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

      {/* ADMIN CONTROLS */}
      <div className="admin-controls-ug flex justify-end mb-2 gap-2">
        <button
          className="admin-edit-ug flex gap-1 items-center"
          onClick={() => setEditHdesk((prev) => !prev)}
        >
          {editHdesk ? (
            <>
              <CircleX /> Cancel
            </>
          ) : (
            <>
              <SquarePen /> Edit
            </>
          )}
        </button>

        
      </div>

      {/* TABLE */}
      <div className="p-6">
        <h2 className="text-center text-xl font-bold text-[#800000] dark:text-drkt mb-4">
          Grievance Contact Levels
        </h2>

        <div className="overflow-x-auto">
          {section.length === 0 && !level1 && levels.length === 0 ? (
            <p className="text-center text-gray-500">Loading grievance table...</p>
          ) : (
            <table className="w-full border border-gray-300 text-center">
              <thead className="bg-[#808080] text-white">
                <tr>
                  <th className="p-2 border">Section & Level</th>
                  {section.map((header, idx) => (
                    <th key={idx} className="p-2 border">
                      {header}
                    </th>
                  ))}
                  {editHdesk && <th className="p-2 border">Actions</th>}
                </tr>
              </thead>

              <tbody>
                {/* Level 1 (special layout) */}
                {showLevel1 && level1 && (
                  <tr>
                    <td className="p-2 border">Level 1</td>
                    <td colSpan={section.length} className="p-2 border">
                      {level1.Administrative_Officer} <br />
                      ph: {level1.ph || "-"} <br />
                      <a
                        href={`mailto:${level1.email_id || ""}`}
                        className="dark:text-drka"
                      >
                        {level1.email_id}
                      </a>
                      <br />
                      Online Help desk:{" "}
                      <a
                        href={`https://${level1.Online_Help_desk || ""}`}
                        className="dark:text-drka"
                      >
                        {level1.Online_Help_desk}
                      </a>
                    </td>
                    {editHdesk && (
                      <td className="p-2 border">
                        <button
                          onClick={handleDeleteLevel1}
                          className="text-red-500"
                          title="Delete Level 1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                )}

                {/* Levels 2..N (editable) */}
                {levels.map((levelRow, idx) => {
                  const labelLevel = idx + 2; // Level numbering starts at 2
                  return (
                    <tr key={`lvl-${idx}`}>
                      <td className="p-2 border">Level {labelLevel}</td>

                      {section.map((sec, i) => {
                        const key = sec.toLowerCase().replace(/\s|&/g, "");
                        return (
                          <td key={i} className="p-2 border">
                            {editHdesk ? (
                              <input
                                type="text"
                                className="w-full p-1 border rounded"
                                value={levelRow[key] ?? ""}
                                onChange={(e) =>
                                  handleChange(idx, key, e.target.value)
                                }
                              />
                            ) : (
                              levelRow[key] || "-"
                            )}
                          </td>
                        );
                      })}

                      {editHdesk && (
                        <td className="p-2 border">
                          <button
                            onClick={() => handleDeleteRow(idx)}
                            title={`Delete Level ${labelLevel}`}
                            className="text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
                

                {/* Optional "another" row preserved */}
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
                    {editHdesk && <td className="p-2 border"></td>}
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="admin-controls-ug flex justify-end mb-2 gap-2">
        {editHdesk && (
          <>
            <button
              className="admin-edit-ug active flex gap-1 items-center jus"
              onClick={handleAddRow}
            >
              <PlusCircle size={16} /> Add
            </button>
            <button
              className="admin-edit-ug active flex gap-1 items-center"
              onClick={handleSave}
            >
              <SaveAll size={16} /> Save
            </button>
          </>
        )}
        </div>
      </div>
    </>
  );
};

export default AdminGrievanceForm;
