import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./admin_UgAdmission.css";
import { FaLink } from "react-icons/fa";
import Banner from "../../../Banner";
import LoadComp from "../../../LoadComp";
import { useNavigate } from "react-router";
import { SaveAll, SquarePen, PlusCircle, Trash2, CircleX, Send } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Editable Title Component
const EditableTitle = ({ title, setTitle, isEdit, section }) => {
  const [tempTitle, setTempTitle] = useState(title);

  useEffect(() => {
    setTempTitle(title);
  }, [title]);

  const handleBlur = () => {
    if (tempTitle.trim() === "") {
      toast.error("Title cannot be empty!");
      setTempTitle(title); // Revert to the original title
      return;
    }
    setTitle(tempTitle);
  };

  return (
    <div className="text-center">
      {isEdit ? (
        <input
          type="text"
          className="admin-ugtit"
          value={tempTitle}
          onChange={(e) => setTempTitle(e.target.value)}
          onBlur={handleBlur}
          autoFocus
          required
        />
      ) : (
        <h4 className="text-accn dark:text-drka Eligibility">{title}</h4>
      )}
    </div>
  );
};

// Final Request Modal Component
const FinalRequestModal = ({ changeList, onClose, onSubmit, handleUndoChange, isRequesting }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
      <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[600px] max-h-[90vh] overflow-y-auto shadow-lg">
        <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
          Final Request for the Changes
        </h2>

        <p className="text-sm text-red-500 mb-4">
          Note: Your changes will stay pending until approved by the superior admin. Once approved, they will be applied automatically to the live site.
        </p>

        {changeList.length > 0 ? (
          <>
            <table className="w-full text-center text-text dark:text-drkt mb-4 text-sm">
              <thead>
                <tr>
                  <th className="py-1">Action</th>
                  <th className="py-1">Section</th>
                  <th className="py-1">Details</th>
                  <th className="py-1">Undo</th>
                </tr>
              </thead>
              <tbody>
                {changeList.map((change, idx) => (
                  <tr key={idx}>
                    <td className="py-1 capitalize text-blue-600">{change.type}</td>
                    <td className="py-1">{change.section}</td>
                    <td className="py-1 text-left px-2">
                      {change.type === "title-edited" && <>Title changed: <b>{change.from}</b> → <b>{change.to}</b></>}
                      {change.type === "renamed" && <>Renamed <b>{change.from}</b> → <b>{change.to}</b></>}
                      {change.type === "edited-values" && <>Updated values for <b>{Object.keys(change.row)[0]}</b></>}
                      {change.type === "added" && <>Added row: <b>{Object.keys(change.row)[0]}</b></>}
                      {change.type === "deleted" && <>Deleted row: <b>{Object.keys(change.row)[0]}</b></>}
                      {change.type === "pdf-name-edited" && <>PDF name changed in <b>{change.section}</b>: <b>{change.from}</b> → <b>{change.to}</b></>}
                      {change.type === "pdf-file-replaced" && <>PDF file replaced in <b>{change.section}</b>: {change.from} → {change.to}{change.fileName && <> (File: {change.fileName})</>}</>}
                    </td>
                    <td>
                      <button onClick={() => handleUndoChange(idx)} title="Undo">
                        <CircleX size={16} className="text-red-500 hover:text-red-700" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={onClose} className="px-4 py-2 rounded bg-gray-400 text-white">
                Cancel
              </button>
              <button
                onClick={onSubmit}
                disabled={changeList.length === 0 || isRequesting}
                className={`px-4 py-2 rounded ${changeList.length === 0 || isRequesting ? "bg-gray-300 cursor-not-allowed" : "bg-secd dark:bg-drks hover:bg-[#800000]"} text-white`}
              >
                {isRequesting ? "Submitting..." : "Final Request"}
              </button>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500">No changes to submit.</p>
        )}
      </div>
    </div>
  );
};

// Main Component
const AdminUgAdmission = ({ theme, toggle }) => {
  const [ugData, setUgData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();

  const [editUG, setEditUG] = useState(false);
  const [editLateral, setEditLateral] = useState(false);

  const [ugTitle, setUgTitle] = useState("");
  const [lateralTitle, setLateralTitle] = useState("");

  const [govLinkName, setGovLinkName] = useState("");
  const [govLinkFile, setGovLinkFile] = useState(null);

  const [mgmtLinkName, setMgmtLinkName] = useState("");
  const [mgmtLinkFile, setMgmtLinkFile] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [changeList, setChangeList] = useState([]);
  const [isRequesting, setIsRequesting] = useState(false);
  const [tempCourseNames, setTempCourseNames] = useState({});

  const [hasSavedUG, setHasSavedUG] = useState(false);
  const [hasSavedLateral, setHasSavedLateral] = useState(false);

  const ugTableRef = useRef(null);
  const latTableRef = useRef(null);

  const ug = ugData?.UG || [];
  const ug_lateral = ugData?.UG_Lateral || [];
  const BE_Government = ugData?.BE_Government || {};
  const BE_Management = ugData?.BE_Management || {};
  const year = ugData?.year;

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => path?.startsWith("http") ? path : `${BASE_URL}${path}`;

  // Deduplicate changes and update existing ones
  const addChange = (change) => {
    setChangeList((prev) => {
      let updatedList = [...prev];
      const existingIndex = updatedList.findIndex(c => {
        if (c.type === change.type && c.section === change.section) {
          if (change.type === "renamed" || change.type === "deleted" || change.type === "added" || change.type === "edited-values") {
            const newRowKey = change.row ? Object.keys(change.row)[0] : null;
            const existingRowKey = c.row ? Object.keys(c.row)[0] : null;
            if (newRowKey && existingRowKey && newRowKey === existingRowKey) {
              return true;
            }
          }
          if (change.type === "renamed") return c.from === change.from;
          if (change.type === "pdf-name-edited" || change.type === "pdf-file-replaced") return true;
        }
        return false;
      });

      if (existingIndex !== -1) {
        updatedList[existingIndex] = change;
      } else {
        updatedList.push(change);
      }
      return updatedList;
    });
  };

  const handleUndoChange = (idx) => {
    setChangeList((prev) => prev.filter((_, i) => i !== idx));
    toast.info("Change undone.");
  };

  const scrollTo = (ref) => setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);

const handleChange = (section, idx, field, value) => {
  const updatedData = { ...ugData };
  const sectionArray = [...updatedData[section]];

  // Retrieve the course object
  const courseEntry = sectionArray[idx];
  const courseName = Object.keys(courseEntry)[0];
  const details = courseEntry[courseName];

  // Keep value as empty string if input is cleared, else convert to number
  const parsedValue = value === "" ? "" : Number(value);
  const updatedDetails = { ...details, [field]: parsedValue };

  // Calculate totals only if values are numbers, else default to 0
  const gov = Number(updatedDetails["Government Quota Intakes"]) || 0;
  const man = Number(updatedDetails["Management Quota Intakes"]) || 0;
  updatedDetails["Total Intakes"] =
    updatedDetails["Government Quota Intakes"] === "" &&
    updatedDetails["Management Quota Intakes"] === ""
      ? ""
      : gov + man;

  // Update the array
  sectionArray[idx] = { [courseName]: updatedDetails };
  updatedData[section] = sectionArray;

  setUgData(updatedData);

  // Log changes
  addChange({
    type: "edited-values",
    section,
    row: { [courseName]: updatedDetails },
  });
};

  
  const handleNameChange = (section, idx, newName) => {
    setTempCourseNames(prev => ({ ...prev, [`${section}-${idx}`]: newName }));
  };

  const handleNameBlur = (section, idx, oldName) => {
    const newName = tempCourseNames[`${section}-${idx}`];
    if (newName && newName.trim() === "") {
        toast.error("Course name cannot be empty!");
        setTempCourseNames(prev => ({ ...prev, [`${section}-${idx}`]: oldName }));
        return;
    }
    if (newName && newName !== oldName) {
      const data = [...ugData[section]];
      const details = Object.entries(data[idx])[0][1];
      data[idx] = { [newName]: details };
      setUgData({ ...ugData, [section]: data });
      addChange({ type: "renamed", section, from: oldName, to: newName });
    }
    setTempCourseNames(prev => {
      const newTemp = { ...prev };
      delete newTemp[`${section}-${idx}`];
      return newTemp;
    });
  };

  const handleTitleChange = (section, newTitle) => {
    const oldTitle = section === "UG" ? ugTitle : lateralTitle;
    if (oldTitle === newTitle) return; // Avoid adding change if title is the same
    if (section === "UG") setUgTitle(newTitle);
    else setLateralTitle(newTitle);
    addChange({ type: "title-edited", section, from: oldTitle, to: newTitle });
  };

  const addRow = (section) => {
    const newRow = { "": { "Government Quota Intakes": 0, "Management Quota Intakes": 0, "Total Intakes": 0 } };
    setUgData({ ...ugData, [section]: [...ugData[section], newRow] });
    addChange({ type: "added", section, row: newRow });
  };

  const deleteRow = (section, idx) => {
    if (window.confirm("Are you sure you want to delete this row?")) {
      const updated = [...ugData[section]];
      const removedRow = updated[idx];
      updated.splice(idx, 1);
      setUgData({ ...ugData, [section]: updated });
      addChange({ type: "deleted", section, row: removedRow });
      toast.info("Row deleted. It will be removed on final request.");
    }
  };

const validateSectionData = (section) => {
  const data = ugData[section];
  return data.every(row => {
    const [name, details] = Object.entries(row)[0];
    return (
      name.trim() !== "" &&
      details["Government Quota Intakes"] !== "" &&
      details["Management Quota Intakes"] !== "" &&
      Number(details["Government Quota Intakes"]) >= 0 &&
      Number(details["Management Quota Intakes"]) >= 0
    );
  });
};


  const saveSection = (section) => {
    if (validateSectionData(section)) {
      if (section === "UG") { setEditUG(false); setHasSavedUG(true); }
      else { setEditLateral(false); setHasSavedLateral(true); }
      toast.success("Changes saved successfully!");
    } else {
      toast.error("All courses must have a name and non-negative intakes!");
    }
  };

  const handlePdfChange = (section, type, oldName, newNameOrFile) => {
    const sectionName = section === "UG" ? "UG PDF Links" : "Lateral PDF Links";
    if (type === "name") {
      addChange({ type: "pdf-name-edited", section: sectionName, from: oldName, to: newNameOrFile });
    } else if (type === "file") {
      addChange({ type: "pdf-file-replaced", section: sectionName, from: oldName, to: oldName, fileName: newNameOrFile?.name || null });
    }
  };

  const handlePdfClick = (_name, url) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      toast.info("No file available to display.");
    }
  };

  const handleFinalRequest = async () => {
    if (changeList.length === 0) {
      toast.info("No changes to submit.");
      setShowPopup(false);
      return;
    }

    setIsRequesting(true);
    try {
      // Create a FormData object to handle file uploads
      const formData = new FormData();
      formData.append("changes", JSON.stringify(changeList));
      formData.append("data", JSON.stringify(ugData));
      if (govLinkFile) {
        formData.append("govPdf", govLinkFile);
      }
      if (mgmtLinkFile) {
        formData.append("mgmtPdf", mgmtLinkFile);
      }

      const response = await axios.post("/api/admin/request-changes", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        toast.success("Request submitted for approval!");
        setChangeList([]);
        setShowPopup(false);
        setHasSavedUG(false);
        setHasSavedLateral(false);
        setGovLinkFile(null);
        setMgmtLinkFile(null);
      } else {
        throw new Error("Failed to submit request.");
      }
    } catch (error) {
      toast.error("Failed to submit request!");
      console.error("Submission error:", error);
    } finally {
      setIsRequesting(false);
    }
  };

  const renderTable = (data, section, title, subtitle, isEdit, ref) => (
    <div className="table-container mt-5" ref={ref}>
      <EditableTitle title={title} setTitle={(t) => handleTitleChange(section, t)} isEdit={isEdit} section={section} />
      <h6 className="text-accn dark:text-drkt Eligibility font-thin text-center">{subtitle}</h6>

      <div className="table-card overflow-x">
        <table className="styled-table min-w-[800px]">
          <thead>
            <tr>
              <th className="ugHeader">UG COURSES</th>
              <th className="ugHeader">GOVERNMENT QUOTA INTAKE</th>
              <th className="ugHeader">MANAGEMENT QUOTA INTAKE</th>
              <th className="ugHeader">TOTAL INTAKE</th>
              {isEdit && <th className="ugHeader">ACTIONS</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => {
              const [courseName, courseDetails] = Object.entries(item)[0];
              const tempName = tempCourseNames[`${section}-${idx}`] ?? courseName;
              return (
                <tr key={idx} className="bg-prim dark:bg-text">
                  <td className="text-start text-center">
                    {isEdit ? <input value={tempName} onChange={(e) => handleNameChange(section, idx, e.target.value)} onBlur={() => handleNameBlur(section, idx, courseName)} className="admin-nlugin" placeholder="Course Name" required /> : courseName}
                  </td>
                  <td className="font-light text-center">
                    {isEdit ? <input type="number" className="admin-ugin" value={courseDetails["Government Quota Intakes"] ?? 0} onChange={(e) => handleChange(section, idx, "Government Quota Intakes", e.target.value)} required /> : courseDetails["Government Quota Intakes"]}
                  </td>
                  <td className="font-light text-center">
                    {isEdit ? <input type="number" className="admin-ugin" value={courseDetails["Management Quota Intakes"] ?? 0} onChange={(e) => handleChange(section, idx, "Management Quota Intakes", e.target.value)} required /> : courseDetails["Management Quota Intakes"]}
                  </td>
                  <td className="font-light text-center">{courseDetails["Total Intakes"]}</td>
                  {isEdit && (
                    <td className="text-center">
                      <button className="text-red-600 hover:text-red-800" onClick={() => deleteRow(section, idx)}><Trash2 size={18} /></button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
   {isEdit && (
  <div className="table-controls flex justify-end gap-2 mt-2">
    <button
      onClick={() => { addRow(section); }}
      className="admin-edit-ug active flex gap-1"
    >
      <PlusCircle size={16} /> Add
    </button>
        {validateSectionData(section) && (
              <button
                onClick={() => { saveSection(section); }}
                className="admin-edit-ug active flex gap-1"
              >
                <SaveAll size={16} /> Save
              </button>
            )}
          </div>
        )}
    </div>
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`/api/main-backend/admission`, { type: "ug" });
        const data = response.data.data;
        setUgData(data);
        setUgTitle(`UG COURSES - TOTAL INTAKE ${data.year}`);
        setLateralTitle(`UG COURSES - TOTAL INTAKE ${data.year}`);
        setGovLinkName(data.BE_Government?.BE_Government_link_name || "");
        setMgmtLinkName(data.BE_Management?.BE_Management_link_name || "");
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setLoading(true);
        if (error.response?.data?.status === 429) navigate("/ratelimit", { state: { msg: error.response.data.message } });
      }
    };
    fetchData();
  }, [navigate]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => { window.removeEventListener("online", handleOnline); window.removeEventListener("offline", handleOffline); };
  }, []);

  if (!isOnline) return <div className="h-screen flex items-center justify-center md:mt-[10%] md:block"><LoadComp txt={"You are offline"} /></div>;

  return (
    <>
      <Banner toggle={toggle} theme={theme} backgroundImage="./Banners/admissionbanner.webp" headerText="UG Admission" subHeaderText="Empowering the next generation of leaders through access to world-class education and opportunities." />
      {isLoading ? <div className="h-screen flex items-center justify-center md:mt-[10%] md:block"><LoadComp txt={""} /></div> : (
        <div className="Admission">
          {/* UG Section */}
          <div className="B-E">
            <h3 className="text-accn dark:text-drkt border-b-2 pb-2 w-fit border-[#fdcc03] dark:border-drks">B.E./B.Tech. Degree Programme</h3>
            <div className="ADM-content bg-[#fffae6] dark:bg-drkb border-l-4 border-secd dark:border-drks">
              <div className="text-start text-accn dark:text-drkt mb-3 Eligibility font-bold border-b-2 pb-2 w-fit border-[#fdcc03] dark:border-drks">Eligibility</div>
              <p className="description-text">Candidates seeking admission should have passed the Higher Secondary Examinations of (10+2) Curriculum (Academic Stream) prescribed by the Government of Tamil Nadu with Mathematics, Physics, and Chemistry as three of the four subjects of study under Part-III or any examination of any other University or authority accepted by the Syndicate of Anna University as equivalent thereto.</p>
              <br /><p className="text-start description-text ">( OR )</p><br />
              <p className="description-text">Should have passed the Higher Secondary Examination of Vocational stream (Vocational groups in Engineering / Technology) as prescribed by the Government of Tamil Nadu.</p>

              <div className="admin-controls-ug flex justify-end mb-2">
                {!editUG && <button className="admin-edit-ug flex gap-1" onClick={() => { setEditUG(true); scrollTo(ugTableRef); }}><SquarePen /> Edit</button>}
              </div>

              {/* Government quota */}
              <div>
                <p className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1 text-[24px] w-fit font-bold mb-2">GOVERNMENT QUOTA</p>
                <p className="text-text dark:text-drkt ml-8">B.E/ B.Tech : Apply through TNEA Counselling</p>
                <div className="flex justify-center mt-4">
                  <p className="text-text dark:text-drkt font-bold mr-8">INFORMATION TO…..</p>
                  {editUG ? (
                    <div className="flex flex-col gap-2">
                      <input type="text" className="admin-govtlugin" value={govLinkName} onChange={(e) => { const newName = e.target.value; handlePdfChange("UG", "name", govLinkName, newName); setGovLinkName(newName); }} placeholder="Enter Link Name" required />
                      <input type="file" accept="application/pdf" onChange={(e) => { const file = e.target.files[0]; setGovLinkFile(file); handlePdfChange("UG", "file", BE_Government?.BE_Government_link_name, file); }} required />
                    </div>
                  ) : (
                    <button className="text-blue-600 dark:text-drka" onClick={() => handlePdfClick(BE_Government?.BE_Government_link_name, UrlParser(BE_Government?.BE_Government_link))}><FaLink className="inline size-5 mr-1 mb-1" />{govLinkName}</button>
                  )}
                </div>

                {/* Management quota */}
                <p className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1 text-[24px] w-fit font-bold mb-2 mt-2">MANAGEMENT QUOTA</p>
                <p className="text-text dark:text-drkt ml-8">B.E/ B.Tech : Apply through Consortium of Self –Financing Professional, Arts and Science Colleges in Tamil Nadu</p>
                <div className="flex justify-center mt-4">
                  <p className="text-text dark:text-drkt font-bold mr-8">INFORMATION TO…..</p>
                  {editUG ? (
                    <div className="flex flex-col gap-2 w-[700px]">
                      <input type="text" className="admin-nlugin" value={mgmtLinkName} onChange={(e) => { const newName = e.target.value; handlePdfChange("UG", "name", mgmtLinkName, newName); setMgmtLinkName(newName); }} placeholder="Enter Link Name" required />
                      <input type="file" accept="application/pdf" onChange={(e) => { const file = e.target.files[0]; setMgmtLinkFile(file); handlePdfChange("UG", "file", BE_Management?.BE_Management_link_name, file); }} required />
                    </div>
                  ) : (
                    <button className="text-blue-600 dark:text-drka" onClick={() => handlePdfClick(BE_Management?.BE_Management_link_name, UrlParser(BE_Management?.BE_Management_link))}><FaLink className="inline size-5 mr-1 mb-1" />{mgmtLinkName}</button>
                  )}
                </div>
              </div>

              {renderTable(ug, "UG", ugTitle, "(For First Year Admissions)", editUG, ugTableRef)}

              {!editUG && hasSavedUG && <div className="flex justify-end mt-2"><button onClick={() => setShowPopup(true)} className="admin-edit-ug flex gap-1"><Send size={16} /> Request Changes</button></div>}
            </div>
          </div>
          {/* Lateral Entry Section */}
          <div className="B-E">
            <h3 className="text-accn dark:text-drkt mt-5 border-b-2 pb-2 w-fit border-[#fdcc03] dark:border-drks">Lateral Entry</h3>
          </div>
          <div className="ADM-content lateral-entry bg-[#fffae6] dark:bg-drkb border-l-4 border-secd dark:border-drks">
            <div className="text-start text-accn dark:text-drkt mb-3 Eligibility font-bold border-b-2 pb-2 w-fit border-[#fdcc03] dark:border-drks">Eligibility</div>
            <p className="description-text">Candidates possessing a Diploma in Engineering/Technology awarded by the State Board of Technical Education, Tamilnadu or its equivalent are eligible for Lateral entry admission to the third semester of B.E./B.Tech. as per the rules fixed by the Govt. of Tamilnadu.</p>
            <br /><p className="description-text">( OR )</p><br />
            <p className="description-text">Candidates possessing a Degree in Science (B.Sc.,) (10+2+3 stream) with Mathematics as a subject at the B.Sc. level are eligible for Lateral entry admission to the third semester of B.E./B.Tech.</p>
            {!editLateral && <div className="admin-controls-ug flex justify-end mb-2"><button className="admin-edit-ug" onClick={() => { setEditLateral(true); scrollTo(latTableRef); }}><SquarePen /> Edit</button></div>}

            {renderTable(ug_lateral, "UG_Lateral", lateralTitle, "(For Lateral Entry Admissions)", editLateral, latTableRef)}

            {!editLateral && hasSavedLateral && <div className="flex justify-end mt-2"><button onClick={() => setShowPopup(true)} className="admin-edit-ug flex gap-1"><Send size={16} /> Request Changes</button></div>}
          </div>

          <ToastContainer position="bottom-right" autoClose={3000} />

          {/* Final Request Modal */}
          {showPopup && changeList.length > 0 && (
            <FinalRequestModal 
              changeList={changeList} 
              onClose={() => setShowPopup(false)} 
              onSubmit={handleFinalRequest} 
              handleUndoChange={handleUndoChange} 
              isRequesting={isRequesting}
            />
          )}
        </div>
      )}
    </>
  );
};

export default AdminUgAdmission;