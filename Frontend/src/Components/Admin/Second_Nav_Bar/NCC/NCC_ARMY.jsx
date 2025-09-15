import React, { useEffect, useState } from "react";
import "./NCC_ARMY.css";
import NCCACarousel from "./NCC_ARMY comps/NCCACarousel";
import axios from "axios";
import NCCAMembers from "./NCC_ARMY comps/NCCAMembers";
import SideNav from "../SideNav";
import AlumniSlider from "./NCC_ARMY comps/DisguishedAlumini";
import LoadComp from "../../LoadComp";
import logo from '../../../Assets/NccArmy.png';
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
    <section className="NCC_ARMY-section bg-prim dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-6 mt-4">
      <h2 className="NCC_ARMY-section-title text-accn dark:text-drkt border-b-2 border-secd dark:border-drks w-fit">
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

/* ------------ NCC Motto Component ------------ */
function NCCMotto({ data, isEditing, onChange, onAdd, onDelete }) {
  return (
    <div className="NCC_ARMY-motto-pledge-container">
      {/* MOTTO OF NCC */}
      <div className="NCC_ARMY-motto bg-prim dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-6 mb-4">
        <h2 className="NCC_ARMY-heading text-accn dark:text-drkt border-b-2 border-secd dark:border-drks w-fit">
          MOTTO OF NCC
        </h2>
        {isEditing ? (
          <AutoResizeTextarea
            value={data?.[0]?.motto || ""}
            onChange={(e) => onChange("motto", 0, null, e.target.value)}
            className="w-full border p-2 rounded"
          />
        ) : (
          <p className="NCC_ARMY-content-1">{data?.[0]?.motto}</p>
        )}
      </div>

      {/* CARDINALS OF NCC */}
      <div className="NCC_ARMY-pledge bg-prim dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-6">
        <h2 className="NCC_ARMY-heading text-accn dark:text-drkt border-b-2 border-secd dark:border-drks w-fit">
          CARDINALS OF NCC
        </h2>
        <ul className="Ncc_Army-list marker:text-accn dark:marker:text-drka">
          {data?.map((item, i) =>
            item?.cardinals?.map((content, j) => (
              <li key={j} className="flex items-start gap-2">
                {isEditing ? (
                  <>
                    <AutoResizeTextarea
                      value={content}
                      onChange={(e) => onChange("cardinals", i, j, e.target.value)}
                      className="w-full border p-2 rounded"
                    />
                    <button
                      onClick={() => onDelete("cardinals", i, j)}
                      className="text-red-500"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </>
                ) : (
                  <li>{content}</li>
                )}
              </li>
            ))
          )}
          {isEditing && (
            <button
              onClick={() => onAdd("cardinals")}
              className="mt-2 text-green-600 flex items-center gap-1"
            >
              <FontAwesomeIcon icon={faPlusCircle} /> Add New
            </button>
          )}
        </ul>
      </div>
    </div>
  );
}

/* ------------ NCC Pledge Component ------------ */
function NCCPledge({ data, isEditing, onChange, onAdd, onDelete }) {
  return (
    <div className="NCC_ARMY-row mt-4">
      <section className="NCC_ARMY-section bg-prim dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-6">
        <h2 className="NCC_ARMY-section-title text-accn dark:text-drkt border-b-2 border-secd dark:border-drks w-fit">
          Pledge of NCC
        </h2>
        <ul className="Ncc_Army-list marker:text-accn dark:marker:text-drka">
          {data?.map((item, i) =>
            item?.pledge?.map((content, j) => (
              <li key={j} className="flex items-start gap-2">
                {isEditing ? (
                  <>
                    <AutoResizeTextarea
                      value={content}
                      onChange={(e) => onChange("pledge", i, j, e.target.value)}
                      className="w-full border p-2 rounded"
                    />
                    <button
                      onClick={() => onDelete("pledge", i, j)}
                      className="text-red-500"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </>
                ) : (
                  <li>{content}</li>
                )}
              </li>
            ))
          )}
          {isEditing && (
            <button
              onClick={() => onAdd("pledge")}
              className="mt-2 text-green-600 flex items-center gap-1"
            >
              <FontAwesomeIcon icon={faPlusCircle} /> Add New
            </button>
          )}
        </ul>
      </section>
    </div>
  );
}

/* ------------ Contact Component ------------ */
function NCCContact({ data, isEditing, onChange }) {
  return (
    <div className="max-w-lg mx-auto p-6 mb-4 bg-gray-100 dark:bg-drkb rounded-lg shadow-md text-center">
      <h2 className="text-2xl text-brwn font-bold dark:text-white mb-4">
        Contact Us
      </h2>
      {isEditing ? (
        <AutoResizeTextarea
          value={data?.[0]?.contact_address || ""}
          onChange={(e) => onChange("contact_address", 0, null, e.target.value)}
          className="w-full border p-2 rounded"
        />
      ) : (
        <p className="text-lg font-poppi text-[16px] text-gray-700 dark:text-gray-300">
          {Array.isArray(data) && data[0]?.contact_address}
        </p>
      )}
    </div>
  );
}

/* ------------ Main Admin Component ------------ */
const AdminNCC_ARMY = ({ toggle, theme }) => {
  const [ncc_army, setarmydata] = useState(null);
  const [army, setnccarmy] = useState("About NCC Army");
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [changes, setChanges] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [backupData, setBackupData] = useState(null);
  const navigate = useNavigate();

  useBlockNavigation(isEditing);

  /* ------------ Change Handler ------------ */
  const handleChange = (field, i, j, value) => {
    const updated = [...ncc_army];
    if (j !== null) updated[i][field][j] = value;
    else updated[i][field] = value;
    setarmydata(updated);

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

  const validateNCCData = () => {
  let hasEmpty = false;

  ncc_army.forEach(item => {
    // Check about_us, objectives, aim
    ["about_us", "objectives", "aim"].forEach(field => {
      if (item[field]?.some(text => !text.trim())) hasEmpty = true;
    });

    // Check motto
    if (!item.motto?.trim()) hasEmpty = true;

    // Check cardinals
    if (item.cardinals?.some(text => !text.trim())) hasEmpty = true;

    // Check pledge
    if (item.pledge?.some(text => !text.trim())) hasEmpty = true;

    // Check contact
    if (!item.contact_address?.trim()) hasEmpty = true;
  });

  return !hasEmpty; // true if everything is filled
};


  /* ------------ Add Handler ------------ */
  const handleAdd = (field) => {
    const updated = [...ncc_army];
    updated[0][field].push("");
    const newIndex = updated[0][field].length - 1;
    setarmydata(updated);
    setChanges(prev => [...prev, { action: "added", target: field, i: 0, j: newIndex, new: { value: "" } }]);
  };

  /* ------------ Delete Handler ------------ */
  const handleDelete = (field, i, j) => {
    const updated = [...ncc_army];
    const deleted = updated[i][field][j];
    updated[i][field].splice(j, 1);
    setarmydata(updated);
    setChanges(prev => [...prev, { action: "deleted", target: field, i, j, old: { value: deleted } }]);
  };

  /* ------------ Undo Handler ------------ */
  const handleUndo = (idx) => {
    const change = changes[idx];
    const updated = [...ncc_army];

    if (change.action === "added") {
      updated[change.i][change.target].splice(change.j, 1);
    } else if (change.action === "deleted") {
      updated[change.i][change.target].splice(change.j, 0, change.old.value);
    } else if (change.action === "edited") {
      if (change.j !== null) updated[change.i][change.target][change.j] = change.old.value;
      else updated[change.i][change.target] = change.old.value;
    }

    setarmydata(updated);
    setChanges(prev => prev.filter((_, i) => i !== idx));
  };

  /* ------------ Fetch Data ------------ */
  useEffect(() => {
    const typeMatch = {
      "About NCC Army": "about",
      "Recent Events": "events",
      "Team & Coordinators": "team",
      "Awards & Recognition": "awards"
    };

    const fetchData = async () => {
      try {
        const response = await axios.post('/api/main-backend/ncc_army', {
          type: typeMatch[army]
        });
        setarmydata(response.data.data);
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
  }, [army, navigate]);

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

  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
  }

  if (!ncc_army) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  /* ------------ Render About Content ------------ */
  const renderAboutContent = () => {
    if (isPreviewing) {
      return (
        <div className="relative">
          <ToastContainer position="bottom-right" autoClose={3000} />
          
          
          <div className="pt-5">
            <EditableList 
              title="About NCC" 
              data={ncc_army} 
              field="about_us" 
              isEditing={false} 
              onChange={handleChange} 
              onAdd={handleAdd} 
              onDelete={handleDelete} 
            />
            <EditableList 
              title="Objectives of NCC" 
              data={ncc_army} 
              field="objectives" 
              isEditing={false} 
              onChange={handleChange} 
              onAdd={handleAdd} 
              onDelete={handleDelete} 
            />
            <EditableList 
              title="AIM of NCC" 
              data={ncc_army} 
              field="aim" 
              isEditing={false} 
              onChange={handleChange} 
              onAdd={handleAdd} 
              onDelete={handleDelete} 
            />
            <NCCMotto 
              data={ncc_army} 
              isEditing={false} 
              onChange={handleChange} 
              onAdd={handleAdd} 
              onDelete={handleDelete} 
            />
            <NCCPledge 
              data={ncc_army} 
              isEditing={false} 
              onChange={handleChange} 
              onAdd={handleAdd} 
              onDelete={handleDelete} 
            />
            <NCCContact 
              data={ncc_army} 
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
                if (backupData) setarmydata(backupData);
                setChanges([]);
                setIsEditing(false);
              }}
            >
              <FontAwesomeIcon icon={faTimes} /> Cancel
            </button>
          </div>
          
          <div className="pt-5">
            <EditableList 
              title="About NCC" 
              data={ncc_army} 
              field="about_us" 
              isEditing={true} 
              onChange={handleChange} 
              onAdd={handleAdd} 
              onDelete={handleDelete} 
            />
            <EditableList 
              title="Objectives of NCC" 
              data={ncc_army} 
              field="objectives" 
              isEditing={true} 
              onChange={handleChange} 
              onAdd={handleAdd} 
              onDelete={handleDelete} 
            />
            <EditableList 
              title="AIM of NCC" 
              data={ncc_army} 
              field="aim" 
              isEditing={true} 
              onChange={handleChange} 
              onAdd={handleAdd} 
              onDelete={handleDelete} 
            />
            <NCCMotto 
              data={ncc_army} 
              isEditing={true} 
              onChange={handleChange} 
              onAdd={handleAdd} 
              onDelete={handleDelete} 
            />
            <NCCPledge 
              data={ncc_army} 
              isEditing={true} 
              onChange={handleChange} 
              onAdd={handleAdd} 
              onDelete={handleDelete} 
            />
            <NCCContact 
              data={ncc_army} 
              isEditing={true} 
              onChange={handleChange} 
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 p-3">
            <button
              className={`nss-btn nss-btn-request flex items-center gap-1 ${
                changes.length === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              // onClick={() => changes.length > 0 && setIsPreviewing(true)}
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
                setBackupData(JSON.parse(JSON.stringify(ncc_army)));
                setIsEditing(true);
              }}
            >
              <FontAwesomeIcon icon={faEdit} /> Edit
            </button>
          </div>
          
          <div className="pt-5">
            <EditableList 
              title="About NCC" 
              data={ncc_army} 
              field="about_us" 
              isEditing={false} 
              onChange={handleChange} 
              onAdd={handleAdd} 
              onDelete={handleDelete} 
            />
            <EditableList 
              title="Objectives of NCC" 
              data={ncc_army} 
              field="objectives" 
              isEditing={false} 
              onChange={handleChange} 
              onAdd={handleAdd} 
              onDelete={handleDelete} 
            />
            <EditableList 
              title="AIM of NCC" 
              data={ncc_army} 
              field="aim" 
              isEditing={false} 
              onChange={handleChange} 
              onAdd={handleAdd} 
              onDelete={handleDelete} 
            />
            <NCCMotto 
              data={ncc_army} 
              isEditing={false} 
              onChange={handleChange} 
              onAdd={handleAdd} 
              onDelete={handleDelete} 
            />
            <NCCPledge 
              data={ncc_army} 
              isEditing={false} 
              onChange={handleChange} 
              onAdd={handleAdd} 
              onDelete={handleDelete} 
            />
            <NCCContact 
              data={ncc_army} 
              isEditing={false} 
              onChange={handleChange} 
            />
          </div>
        </div>
      );
    }
  };

  const navData = {
    "About NCC Army": renderAboutContent(),
    // "Recent Events": <NCCACarousel data={ncc_army} />,
    "Team & Coordinators": <NCCAMembers data={ncc_army} />
    // "Awards & Recognition": <AlumniSlider data={ncc_army} />,
  };

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/Vid_banner/NCC_Army_Banner.mp4"
        headerText="National Cadet Corps (Army)"
        subHeaderText="Fostering excellence in sports, fitness, and holistic development for students."
        isVideo={true}
      />
      
      <SideNav sts={army} setSts={setnccarmy} navData={navData} cls="" backButton={true} />

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
              
              <button className={`nss-btn nss-btn-request flex items-center gap-1 ${changes.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
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

export default AdminNCC_ARMY;