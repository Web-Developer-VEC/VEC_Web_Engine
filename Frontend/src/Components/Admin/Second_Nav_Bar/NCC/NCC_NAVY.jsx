import React, { useEffect, useState } from "react";
import "./NCC_NAVY.css"; 
import NCCNCarousel from "./NCC_NAvY comps/NCCNCarousel";
import axios from "axios";
import NCCNMembers from "./NCC_NAvY comps/NCCNMembers";
import logo from '../../../Assets/NccNavy.png'
import SideNav from "../SideNav";
import AlumniSlider1 from "./NCC_NAvY comps/DisguishedAluminiN";
import LoadComp from "../../LoadComp";
import Banner from "../../Banner";
import { useNavigate } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTimes,
  faPaperPlane,
  faPlusCircle,
  faTrash,
  faUndo,
  faEye
} from "@fortawesome/free-solid-svg-icons";
import AutoResizeTextarea from "../AutoResizeTextarea";
import { Trash2, PlusCircle, SquarePen } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useBlockNavigation from "../useBlockNavigation";

/* ------------ Editable List Component ------------ */
function EditableList({ title, data, field, isEditing, onChange, onAdd, onDelete }) {
  return (
    <section className="NCC_NAVY-section bg-prim dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-6 mt-4">
      <h2 className="NCC_NAVY-section-title text-accn dark:text-drkt border-b-2 border-secd dark:border-drks w-fit">
        {title}
      </h2>
      <ul className="Ncc_Army-list text-justify marker:text-accn dark:marker:text-drka">
        {data?.map((item, i) => (
          <React.Fragment key={i}>
            {item?.[field]?.map((content, j) => (
              <li key={j} className="flex items-start gap-2">
                {isEditing ? (
                  <>
                    <AutoResizeTextarea
                      value={content}
                      onChange={(e) => onChange(field, i, j, e.target.value)}
                      className="w-full border p-2 rounded"
                    />
                    <button onClick={() => onDelete(field, i, j)} className="text-red-500">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </>
                ) : (
                  <li>{content}</li>
                )}
              </li>
            ))}
          </React.Fragment>
        ))}
      </ul>
      {isEditing && (
        <button
          onClick={() => onAdd(field)}
          className="mt-2 text-green-600 flex items-center gap-1"
        >
          <FontAwesomeIcon icon={faPlusCircle} /> Add New
        </button>
      )}
    </section>
  );
}

/* ------------ NCC Vision & Mission Component ------------ */
function NCCVisMis({ data, isEditing, onChange }) {
  return (
    <div className="NCC_NAVY-row">
      <section className="NCC_NAVY-section bg-prim dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-6">
        <h2 className="NCC_NAVY-section-title text-accn dark:text-drkt border-b-2 border-secd dark:border-drks w-fit">
          Vision
        </h2>
        {isEditing ? (
          <AutoResizeTextarea
            value={data?.[0]?.vision || ""}
            onChange={(e) => onChange("vision", 0, null, e.target.value)}
            className="w-full border p-2 rounded"
          />
        ) : (
          <p className="NCC_NAVY-content">{data?.[0]?.vision}</p>
        )}
      </section>

      <section className="NCC_NAVY-section bg-prim dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-6">
        <h2 className="NCC_NAVY-section-title text-accn dark:text-drkt border-b-2 border-secd dark:border-drks w-fit">
          Mission
        </h2>
        {isEditing ? (
          <AutoResizeTextarea
            value={data?.[0]?.mission || ""}
            onChange={(e) => onChange("mission", 0, null, e.target.value)}
            className="w-full border p-2 rounded"
          />
        ) : (
          <p className="NCC_NAVY-content">{data?.[0]?.mission}</p>
        )}
      </section>
    </div>
  );
}

/* ------------ NCC Motto & Pledge Component ------------ */
function NCCMottoPledge({ data, isEditing, onChange }) {
  return (
    <div className="NCC_NAVY-motto-pledge-container">
      <div className="NCC_NAVY-motto bg-prim dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-6">
        <h2 className="NCC_NAVY-heading text-accn dark:text-drkt border-b-2 border-secd dark:border-drks w-fit">
          MOTTO OF NCC
        </h2>
        {isEditing ? (
          <AutoResizeTextarea
            value={data?.[0]?.motto || ""}
            onChange={(e) => onChange("motto", 0, null, e.target.value)}
            className="w-full border p-2 rounded"
          />
        ) : (
          <p className="NCC_NAVY-content">{data?.[0]?.motto}</p>
        )}
      </div>

      <div className="NCC_NAVY-pledge bg-prim dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-6">
        <h2 className="NCC_NAVY-heading text-accn dark:text-drkt border-b-2 border-secd dark:border-drks w-fit">
          NCC PLEDGE
        </h2>
        {isEditing ? (
          <AutoResizeTextarea
            value={data?.[0]?.pledge || ""}
            onChange={(e) => onChange("pledge", 0, null, e.target.value)}
            className="w-full border p-2 rounded"
          />
        ) : (
          <p className="NCC_NAVY-content">{data?.[0]?.pledge}</p>
        )}
      </div>
    </div>
  );
}

/* ------------ Main Admin Component ------------ */
const AdminNCC_NAVY = ({ toggle, theme }) => {
  const [ncc_navy, setnavy] = useState("About NCC Navy");
  const [navydata, setnavdata] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [changes, setChanges] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [backupData, setBackupData] = useState(null);
  const navigate = useNavigate();

  useBlockNavigation(isEditing);

  /* ------------ Change Handler ------------ */
  const handleChange = (field, i, j, value) => {
    const updated = [...navydata];
    if (j !== null) updated[i][field][j] = value;
    else updated[i][field] = value;
    setnavdata(updated);

    setChanges((prev) => {
      const idx = prev.findIndex(ch => ch.target === field && ch.i === i && ch.j === j);
      if (idx !== -1) {
        const newPrev = [...prev];
        newPrev[idx].new = { value };
        return newPrev;
      } else {
        return [...prev, { action: "edited", target: field, i, j, new: { value } }];
      }
    });
  };

  /* ------------ Add Handler ------------ */
  const handleAdd = (field) => {
    const updated = [...navydata];
    updated[0][field].push("");
    const newIndex = updated[0][field].length - 1;
    setnavdata(updated);
    setChanges(prev => [...prev, { action: "added", target: field, i: 0, j: newIndex, new: { value: "" } }]);
  };

  /* ------------ Delete Handler ------------ */
  const handleDelete = (field, i, j) => {
    const updated = [...navydata];
    const deleted = updated[i][field][j];
    updated[i][field].splice(j, 1);
    setnavdata(updated);
    setChanges(prev => [...prev, { action: "deleted", target: field, i, j, old: { value: deleted } }]);
  };

  /* ------------ Undo Handler ------------ */
  const handleUndo = (idx) => {
    const change = changes[idx];
    const updated = [...navydata];

    if (change.action === "added") {
      updated[change.i][change.target].splice(change.j, 1);
    } else if (change.action === "deleted") {
      updated[change.i][change.target].splice(change.j, 0, change.old.value);
    } else if (change.action === "edited") {
      if (change.j !== null) updated[change.i][change.target][change.j] = change.old.value;
      else updated[change.i][change.target] = change.old.value;
    }

    setnavdata(updated);
    setChanges(prev => prev.filter((_, i) => i !== idx));
  };

  /* ------------ Fetch Data ------------ */
  useEffect(() => {
    const typeMatch = {
      "About NCC Navy": "about",
      "Recent Events": "events", 
      "Team & Coordinators": "team",
      "Awards & Recognition": "awards"
    };

    const fetchData = async () => {
      try {
        const response = await axios.post('/api/main-backend/ncc_navy', {
          type: typeMatch[ncc_navy]
        });
        setnavdata(response.data.data);
        setBackupData(JSON.parse(JSON.stringify(response.data.data)));
        setIsEditing(false);
        setIsPreviewing(false);
        setChanges([]);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        if (error.response?.data?.status === 429) {
          navigate('/ratelimit', { state: { msg: error.response.data.message } });
        }
      }
    };
    
    fetchData();
  }, [ncc_navy, navigate]);

  /* ------------ Offline Check ------------ */
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

  const validateNCCData = () => {
  if (!navydata || navydata.length === 0) return false;

  let allFilled = true;

  navydata.forEach(item => {
    // Check array fields
    ["about_us", "aim"].forEach(field => {
      if (!Array.isArray(item[field]) || item[field].some(text => !text?.trim())) {
        allFilled = false;
      }
    });

    // Check string fields
    ["vision", "mission", "motto", "pledge"].forEach(field => {
      if (!item[field]?.trim()) {
        allFilled = false;
      }
    });
  });

  return allFilled;
};

  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
  }

  if (!navydata) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  /* ------------ Navigation Data ------------ */
  const renderAboutContent = () => {
    if (isPreviewing) {
      return (
        <div className="relative">
          <ToastContainer position="bottom-right" autoClose={3000} />
         
          
          <div className="pt-5">
            <EditableList 
              title="About NCC" 
              data={navydata} 
              field="about_us" 
              isEditing={false} 
              onChange={handleChange} 
              onAdd={handleAdd} 
              onDelete={handleDelete} 
            />
            <NCCVisMis 
              data={navydata} 
              isEditing={false} 
              onChange={handleChange} 
            />
            <EditableList 
              title="AIM of NCC" 
              data={navydata} 
              field="aim" 
              isEditing={false} 
              onChange={handleChange} 
              onAdd={handleAdd} 
              onDelete={handleDelete} 
            />
            <NCCMottoPledge 
              data={navydata} 
              isEditing={false} 
              onChange={handleChange} 
            />
          </div>

<div className="flex justify-end gap-3 mt-4 p-3 relative">
  {/* Back Button */}
  <button 
    className="nss-btn nss-btn-edit flex items-center gap-1"
    onClick={() => setIsPreviewing(false)}
  >
    <FontAwesomeIcon icon={faUndo} /> Back to Edit
  </button>

  {/* Request Changes Button */}
  <button
    className="nss-btn nss-btn-request flex items-center gap-1"
    onClick={() => setShowPopup(true)}
  >
    <FontAwesomeIcon icon={faPaperPlane} /> Request Changes
  </button>
</div>

        </div>
      );
    } else if (isEditing) {
      return (
        <div className="relative">
          <ToastContainer position="bottom-right" autoClose={3000} />
          <div className="absolute top-4 right-4 pb-4">
            <button 
              className="nss-btn nss-btn-cancel" 
              onClick={() => {
                if (backupData) setnavdata(backupData);
                setChanges([]);
                setIsEditing(false);
                toast.info("Changes discarded!");
              }}
            >
              <FontAwesomeIcon icon={faTimes} /> Cancel
            </button>
          </div>
          
          <div className="pt-5">
            <EditableList 
              title="About NCC" 
              data={navydata} 
              field="about_us" 
              isEditing={true} 
              onChange={handleChange} 
              onAdd={handleAdd} 
              onDelete={handleDelete} 
            />
            <NCCVisMis 
              data={navydata} 
              isEditing={true} 
              onChange={handleChange} 
            />
            <EditableList 
              title="AIM of NCC" 
              data={navydata} 
              field="aim" 
              isEditing={true} 
              onChange={handleChange} 
              onAdd={handleAdd} 
              onDelete={handleDelete} 
            />
            <NCCMottoPledge 
              data={navydata} 
              isEditing={true} 
              onChange={handleChange} 
            />
          </div>

<div className="flex justify-end gap-3 mt-4 p-3">
  <button
    className={`nss-btn nss-btn-request flex items-center gap-1 ${
      changes.length === 0 ? "opacity-50 cursor-not-allowed" : ""
    }`}
    onClick={() => {
      if (validateNCCData()) {
        setIsPreviewing(true);
      } else {
        toast.error("Please fill all required fields before previewing.");
      }
    }}
    disabled={changes.length === 0}
  >
    <FontAwesomeIcon icon={faEye} /> View Changes
  </button>
</div>


        </div>
      );
    } else {
      return (
        <div className="relative">
          <ToastContainer position="bottom-right" autoClose={3000} />
          <div className="absolute top-4 right-4 pb-4">
            <button 
              className="nss-btn nss-btn-edit" 
              onClick={() => {
                setBackupData(JSON.parse(JSON.stringify(navydata)));
                setIsEditing(true);
              }}
            >
              <FontAwesomeIcon icon={faEdit} /> Edit
            </button>
          </div>
          
          <div className="pt-5">
            <EditableList 
              title="About NCC" 
              data={navydata} 
              field="about_us" 
              isEditing={false} 
              onChange={handleChange} 
              onAdd={handleAdd} 
              onDelete={handleDelete} 
            />
            <NCCVisMis 
              data={navydata} 
              isEditing={false} 
              onChange={handleChange} 
            />
            <EditableList 
              title="AIM of NCC" 
              data={navydata} 
              field="aim" 
              isEditing={false} 
              onChange={handleChange} 
              onAdd={handleAdd} 
              onDelete={handleDelete} 
            />
            <NCCMottoPledge 
              data={navydata} 
              isEditing={false} 
              onChange={handleChange} 
            />
          </div>
        </div>
      );
    }
  };

  const navData = {
    "About NCC Navy": renderAboutContent(),
    "Recent Events": <NCCNCarousel data={navydata} />,
    "Team & Coordinators": <NCCNMembers data={navydata} />,
    "Awards & Recognition": <AlumniSlider1 data={navydata} />,
  };

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/Vid_banner/NCC_Navy_Banner.mp4"
        headerText="National Cadet Corps (Navy)"
        subHeaderText="Fostering excellence in sports, fitness, and holistic development for students."
        isVideo={true}
      />
      
      <SideNav sts={ncc_navy} setSts={setnavy} navData={navData} cls="" backButton={true} />

      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[90%] md:w-[600px]">
            <h3 className="text-lg font-semibold mb-4">Final Request for the Changes</h3>
            <div className="max-h-64 overflow-auto mb-4">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="pb-2">Action</th>
                    <th className="pb-2">Target</th>
                    <th className="pb-2">Undo</th>
                  </tr>
                </thead>
                <tbody>
                  {changes.map((ch, i) => {
                    let IconComponent = null;
                    if (ch.action === "added") IconComponent = PlusCircle;
                    else if (ch.action === "deleted") IconComponent = Trash2;
                    else if (ch.action === "edited") IconComponent = SquarePen;

                    return (
                      <tr key={i} className="border-t">
                        <td className="py-2 flex items-center gap-1">
                          {IconComponent && <IconComponent className="w-5 h-5" />}
                          <span className="capitalize">{ch.action}</span>
                        </td>
                        <td>{ch.target}</td>
                        <td>
                          <button
                            onClick={() => handleUndo(i)}
                            className="px-2 py-1 bg-yellow-400 rounded text-black flex items-center gap-1"
                          >
                            <FontAwesomeIcon icon={faUndo} /> Undo
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-red-600 mb-4">Note: Your changes will stay pending until approved by the superior admin.</p>
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowPopup(false)}>
                Cancel
              </button>

              <button 
                className="nss-btn nss-btn-request flex items-center gap-1" 
                onClick={() => { 
                  toast.success("Request submitted successfully!"); 
                  setChanges([]); 
                  setShowPopup(false); 
                  setIsEditing(false); 
                  setIsPreviewing(false);
                  }}
                  disabled={changes.length === 0}
              >
                <FontAwesomeIcon icon={faPaperPlane} /> Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminNCC_NAVY;