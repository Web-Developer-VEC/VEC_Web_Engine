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
import { Pencil, X, Trash2, Send, Plus } from "lucide-react";
import AutoResizeTextarea from "../AutoResizeTextarea";
import { ToastContainer, toast } from "react-toastify";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

// NCCAbout Component with Edit Functionality
function NCCAbout({ data, isEditing, onUpdate, onStartEdit }) {
  const [localData, setLocalData] = useState(data || []);


  useEffect(() => {
    setLocalData(data || []);
  }, [data]);

  const handleChange = (index, value) => {
    const updatedData = [...localData];
    if (updatedData[0]?.about_us) {
      const newAboutUs = [...updatedData[0].about_us];
      newAboutUs[index] = value;
      updatedData[0].about_us = newAboutUs;
      setLocalData(updatedData);
      onUpdate(updatedData);
    }
  };

  const handleAddPoint = () => {
    const updatedData = [...localData];
    if (updatedData[0]?.about_us) {
      updatedData[0].about_us = [...updatedData[0].about_us, ""];
    } else if (updatedData[0]) {
      updatedData[0].about_us = [""];
    }
    setLocalData(updatedData);
    onUpdate(updatedData);
  };

  const handleRemovePoint = (index) => {
    const updatedData = [...localData];
    if (updatedData[0]?.about_us) {
      updatedData[0].about_us = updatedData[0].about_us.filter((_, i) => i !== index);
      setLocalData(updatedData);
      onUpdate(updatedData);
    }
  };

  return (
    <>
          {!isEditing && (
        <div className="flex justify-end px-6 py-4">
          <button
            onClick={onStartEdit}
            className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
          >
            <Pencil size={18} />
            Edit
          </button>
        </div>
      )}
     <section className="NCC_NAVY-section bg-prim dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-6">
      {/* Edit Button only here */}


      <h2 className="NCC_NAVY-section-title text-brwn text-justify text-accn dark:text-drkt border-b-2 border-secd dark:border-drks w-fit">
        About NCC
      </h2>
      {isEditing ? (
        <div className="py-2">
          {localData[0]?.about_us?.map((content, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <AutoResizeTextarea
                type="text"
                value={content}
                onChange={(e) => handleChange(i, e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="About point"
              />
              <button
                onClick={() => handleRemovePoint(i)}
                className="p-2 text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            onClick={handleAddPoint}
            className="flex items-center gap-1 mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            <Plus size={16} /> Add Point
          </button>
        </div>
      ) : (
        <ul className="Ncc_Army-list marker:text-accn dark:marker:text-drka">
          {localData[0]?.about_us?.map((content, i) => (
            <li key={i}>{content}</li>
          ))}
        </ul>
      )}
    </section></>
   
  );
}


// NCCVisMis Component with Edit Functionality
function NCCVisMis({data, isEditing, onUpdate}) {
  const [localData, setLocalData] = useState(data || []);

  useEffect(() => {
    setLocalData(data || []);
  }, [data]);

  const handleVisionChange = (value) => {
    const updatedData = [...localData];
    if (updatedData[0]) {
      updatedData[0].vision = value;
      setLocalData(updatedData);
      onUpdate(updatedData);
    }
  };

  const handleMissionChange = (value) => {
    const updatedData = [...localData];
    if (updatedData[0]) {
      updatedData[0].mission = value;
      setLocalData(updatedData);
      onUpdate(updatedData);
    }
  };

  return (
    <div className="NCC_NAVY-row">
      <section className="NCC_NAVY-section bg-prim dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-6">
        <h2 className="NCC_NAVY-section-title text-accn dark:text-drkt border-b-2 border-secd dark:border-drks w-fit">
          Vision
        </h2>
        {isEditing ? (
          <textarea
            value={localData[0]?.vision || ""}
            onChange={(e) => handleVisionChange(e.target.value)}
            className="w-full p-2 border rounded min-h-[100px]"
            placeholder="Vision statement"
          />
        ) : (
          <p className="NCC_NAVY-content">{localData[0]?.vision}</p>
        )}
      </section>

      <section className="NCC_NAVY-section bg-prim dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-6">
        <h2 className="NCC_NAVY-section-title text-accn dark:text-drkt border-b-2 border-secd dark:border-drks w-fit">
          Mission
        </h2>
        {isEditing ? (
          <textarea
            value={localData[0]?.mission || ""}
            onChange={(e) => handleMissionChange(e.target.value)}
            className="w-full p-2 border rounded min-h-[100px]"
            placeholder="Mission statement"
          />
        ) : (
          <p className="NCC_NAVY-content">{localData[0]?.mission}</p>
        )}
      </section>
    </div>
  );
}

// NCCAim Component with Edit Functionality
function NCCAim({data, isEditing, onUpdate}) {
  const [localData, setLocalData] = useState(data || []);

  useEffect(() => {
    setLocalData(data || []);
  }, [data]);

  const handleChange = (index, value) => {
    const updatedData = [...localData];
    if (updatedData[0]?.aim) {
      const newAim = [...updatedData[0].aim];
      newAim[index] = value;
      updatedData[0].aim = newAim;
      setLocalData(updatedData);
      onUpdate(updatedData);
    }
  };

  const handleAddPoint = () => {
    const updatedData = [...localData];
    if (updatedData[0]?.aim) {
      updatedData[0].aim = [...updatedData[0].aim, ""];
    } else if (updatedData[0]) {
      updatedData[0].aim = [""];
    }
    setLocalData(updatedData);
    onUpdate(updatedData);
  };

  const handleRemovePoint = (index) => {
    const updatedData = [...localData];
    if (updatedData[0]?.aim) {
      updatedData[0].aim = updatedData[0].aim.filter((_, i) => i !== index);
      setLocalData(updatedData);
      onUpdate(updatedData);
    }
  };

  return (
    <div className="NCC_NAVY-aim-container bg-prim dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-6">
      <div className="NCC_NAVY-aim">
        <h2 className="NCC_NAVY-heading text-accn dark:text-drkt border-b-2 border-secd dark:border-drks w-fit">
          <img src={logo} alt="NCC Logo" className="NCC_NAVY-icon" />
          AIM of NCC
        </h2>
        {isEditing ? (
          <div className="py-2">
            {localData[0]?.aim?.map((content, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <AutoResizeTextarea
                  type="text"
                  value={content}
                  onChange={(e) => handleChange(i, e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Aim point"
                />
                <button
                  onClick={() => handleRemovePoint(i)}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={handleAddPoint}
              className="flex items-center gap-1 mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <Plus size={16} /> Add Point
            </button>
          </div>
        ) : (
          <ul className="Ncc_Army-list marker:text-accn dark:marker:text-drka">
            {localData[0]?.aim?.map((content, i) => (
              <li key={i}>{content}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// NCCMotto Component with Edit Functionality
function NCCMotto({ data, isEditing, isDirty, isSaved, onUpdate, onCancel, onSave, onDiscard, onRequest }) {
  const [localData, setLocalData] = useState(data || []);

  useEffect(() => {
    setLocalData(data || []);
  }, [data]);

  const handleMottoChange = (value) => {
    const updatedData = [...localData];
    if (updatedData[0]) {
      updatedData[0].motto = value;
      setLocalData(updatedData);
      onUpdate(updatedData);
    }
  };

  const handlePledgeChange = (value) => {
    const updatedData = [...localData];
    if (updatedData[0]) {
      updatedData[0].pledge = value;
      setLocalData(updatedData);
      onUpdate(updatedData);
    }
  };

  return (
    <>
      <div className="NCC_NAVY-motto-pledge-container">
        <div className="NCC_NAVY-motto bg-prim dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-6">
          <h2 className="NCC_NAVY-heading text-accn dark:text-drkt border-b-2 border-secd dark:border-drks w-fit">
            MOTTO OF NCC
          </h2>
          {isEditing ? (
            <AutoResizeTextarea
              type="text"
              value={localData[0]?.motto || ""}
              onChange={(e) => handleMottoChange(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Motto"
            />
          ) : (
            <p className="NCC_NAVY-content">{localData[0]?.motto}</p>
          )}
        </div>

        <div className="NCC_NAVY-pledge bg-prim dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-6">
          <h2 className="NCC_NAVY-heading text-accn dark:text-drkt border-b-2 border-secd dark:border-drks w-fit">
            NCC PLEDGE
          </h2>
          {isEditing ? (
            <textarea
              value={localData[0]?.pledge || ""}
              onChange={(e) => handlePledgeChange(e.target.value)}
              className="w-full p-2 border rounded min-h-[100px]"
              placeholder="Pledge"
            />
          ) : (
            <p className="NCC_NAVY-content">{localData[0]?.pledge}</p>
          )}
        </div>
      </div>

      {/* Buttons only here */}
      {isEditing && (
        <div className="flex justify-end gap-3 px-6 py-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500"
          >
            Cancel
          </button>
          {isDirty && (
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
            >
              Save
            </button>
          )}
        </div>
      )}

      {isSaved && !isEditing && (
        <div className="flex justify-end gap-3 px-6 py-4">
          <button
            onClick={onDiscard}
            className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500"
          >
            Discard Changes
          </button>
          <button
            onClick={onRequest}
            className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
          >
            <Send size={18} /> Request
          </button>
        </div>
      )}
    </>
  );
}

const NCC_NAVY = ({ toggle, theme }) => {
  const [ncc_navy, setnavy] = useState("About NCC Navy");
  const [navydata, setnavdata] = useState(null);
  const [committedData, setCommittedData] = useState(null);
  const [pendingData, setPendingData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
    const { sendRequest, loading: loadings , error } = useAdminRequest();
  const navigate = useNavigate();

const handleDataUpdate = (newData) => {
  setnavdata(newData);

  // Check if newData differs from committedData
  const isDifferent = JSON.stringify(newData) !== JSON.stringify(committedData);

  setIsDirty(isDifferent);
};


  const handleStartEdit = () => {
    if (pendingData) {
      setnavdata(JSON.parse(JSON.stringify(pendingData)));
    } else {
      setnavdata(JSON.parse(JSON.stringify(committedData)));
    }
    setIsEditing(true);
    setIsDirty(false);
    setIsSaved(!!pendingData);
  };

  const handleCancel = () => {
    if (pendingData) {
      setnavdata(JSON.parse(JSON.stringify(pendingData)));
    } else {
      setnavdata(JSON.parse(JSON.stringify(committedData)));
    }
    setIsEditing(false);
    setIsDirty(false);
    setIsSaved(!!pendingData);
  };

  const handleSave = () => {
    let hasEmptyFields = false;

    if (navydata && navydata[0]) {
      const data = navydata[0];
      const fieldsToCheck = ["about_us", "aim"];

      for (const field of fieldsToCheck) {
        if (data[field] && data[field].some((item) => !item.trim())) {
          hasEmptyFields = true;
          break;
        }
      }

      if (
        !data.vision?.trim() ||
        !data.mission?.trim() ||
        !data.motto?.trim() ||
        !data.pledge?.trim()
      ) {
        hasEmptyFields = true;
      }
    }

    if (hasEmptyFields) {
      alert("Please fill all fields before saving!");
      return;
    }

    const pending = JSON.parse(JSON.stringify(navydata));
    setPendingData(pending);
    setIsSaved(true);
    setIsEditing(false);
    setIsDirty(false);
  };

  const handleDiscard = () => {
    setnavdata(JSON.parse(JSON.stringify(committedData)));
    setPendingData(null);
    setIsSaved(false);
    setIsDirty(false);
  };

  const handleRequest = () => {
    setShowRequestModal(true);
  };

const handleFinalRequestConfirm = async () => {
  if (!pendingData || !committedData) return;

  const payload = {
    collectionName: "ncc_navy",
    collection_type: "about",
    action: "update",
    title: "update about",
    original_data: committedData[0],
    meta_data: pendingData[0],
  };

  try {
    await sendRequest(payload);

    toast.success("Request sent for admin approval");

    // Update local states AFTER successful request
    setCommittedData(JSON.parse(JSON.stringify(pendingData)));
    setnavdata(JSON.parse(JSON.stringify(pendingData)));
    setPendingData(null);
    setIsSaved(false);
    setShowRequestModal(false);
  } catch (err) {
    console.error(err);
    toast.error("Failed to send request");
  }
};


  const revertChange = (field) => {
    if (!pendingData || !committedData) return;

    const updated = JSON.parse(JSON.stringify(pendingData));
    updated[0][field] = committedData[0][field];

    setPendingData(updated);
    setnavdata(JSON.parse(JSON.stringify(updated)));
  };

  const getChanges = () => {
    if (!pendingData || !committedData) return [];
    const changes = [];

    const fields = ["about_us", "vision", "mission", "aim", "motto", "pledge"];

    fields.forEach((field) => {
      const oldVal = Array.isArray(committedData[0][field])
        ? committedData[0][field].join(", ")
        : committedData[0][field];
      const newVal = Array.isArray(pendingData[0][field])
        ? pendingData[0][field].join(", ")
        : pendingData[0][field];

      if (oldVal !== newVal) {
        changes.push({
          field: field,
          section:
            field.charAt(0).toUpperCase() + field.slice(1).replace("_", " "),
          oldValue: oldVal,
          newValue: newVal,
        });
      }
    });

    return changes;
  };

  const changes = getChanges();

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    const typeMatch = {
      "About NCC Navy": "about",
      "Recent Events": "events",
      "Team & Coordinators": "team",
      "Awards & Recognition": "awards",
    };

    const fetchData = async () => {
      try {
        const response = await axios.post("/api/main-backend/ncc_navy", {
          type: typeMatch[ncc_navy],
        });
        const data = response.data.data;
        setnavdata(data);
        setCommittedData(JSON.parse(JSON.stringify(data)));
        setPendingData(null);
        setIsEditing(false);
        setIsDirty(false);
        setIsSaved(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
        }
      }
    };
    fetchData();
  }, [ncc_navy, navigate]);

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

  function NCCProf() {
    return (
      <div className="NCC_NAVY-profile-container bg-prim dark:bg-drkb border-l-8 border-r-8 border-[#FDB515] px-6">
        <div className="NCC_NAVY-profile-photo">
          <img
            src={UrlParser(navydata?.[0]?.coordinator_image)}
            alt={navydata?.[0]?.coordinator_name}
          />
        </div>
        <div className="NCC_NAVY-profile-content">
          <h2 className="NCC_NAVY-profile-name">
            {navydata?.[0]?.coordinator_name}
          </h2>
          <h4 className="NCC_NAVY-profile-position text-accn dark:text-drkt">
            {navydata?.[0]?.coordinator_designation}
          </h4>
          <p className="NCC_NAVY-profile-bio">
            {navydata?.[0]?.coordinator_description}
          </p>
        </div>
      </div>
    );
  }

  const navData = {
    "About NCC Navy": (
      <>
        <NCCAbout
          data={navydata}
          isEditing={isEditing}
          onUpdate={handleDataUpdate}
          onStartEdit={handleStartEdit} // Edit btn inside About
        />
        <NCCVisMis
          data={navydata}
          isEditing={isEditing}
          onUpdate={handleDataUpdate}
        />
        <NCCAim
          data={navydata}
          isEditing={isEditing}
          onUpdate={handleDataUpdate}
        />
        <NCCMotto
          data={navydata}
          isEditing={isEditing}
          onUpdate={handleDataUpdate}
          onCancel={handleCancel}
          onSave={handleSave}
          onDiscard={handleDiscard}
          onRequest={handleRequest}
          isSaved={isSaved}
          isDirty={isDirty}
        />
      </>
    ),
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

      <SideNav
        sts={ncc_navy}
        setSts={setnavy}
        navData={navData}
        cls=""
        backButton={true}
      />
<ToastContainer position="bottom-right" autoClose={3000} />
      {/* Final Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white p-6 rounded-xl w-[800px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Request</h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin. Once approved will go live.
            </p>

            {changes.length > 0 ? (
              <table className="w-full border border-gray-300 text-sm text-center">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border p-2">Action</th>
                    <th className="border p-2">Section</th>
                    {/* <th className="border p-2">Changes</th> */}
                    <th className="border p-2">Undo</th>
                  </tr>
                </thead>
                <tbody>
                  {changes.map((change, i) => (
                    <tr key={i}>
                      <td className="border p-2 text-blue-600">Edited</td>
                      <td className="border p-2">{change.section}</td>
                      {/* <td className="border p-2">{change.field}</td> */}
                      <td className="border p-2">
                        <button
                          onClick={() => revertChange(change.field)}
                          className="p-1 rounded hover:bg-gray-100"
                          title="Revert this field"
                        >
                          <X size={16} className="text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-600">No changes detected.</p>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 text-prim"
              >
                Cancel
              </button>
              {changes.length > 0 && (
                <button
                  onClick={handleFinalRequestConfirm}
                  className="px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
                >
                  Confirm Request
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NCC_NAVY;