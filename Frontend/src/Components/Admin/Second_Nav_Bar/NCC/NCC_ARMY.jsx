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
import { Pencil, X, Trash2, Send, Plus } from "lucide-react";
import AutoResizeTextarea from "../AutoResizeTextarea";
import { useAdminRequest } from "../../../hooks/useAdminRequest";
import { toast, ToastContainer } from "react-toastify";
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
      <section className="NCC_ARMY-section bg-prim dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-6 mt-4">
        <h2 className="NCC_ARMY-section-title text-accn dark:text-drkt border-b-2 border-secd dark:border-drks w-fit">
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
          <ul className="Ncc_Army-list text-justify marker:text-accn dark:marker:text-drka">
            {localData[0]?.about_us?.map((content, i) => (
              <li key={i}>{content}</li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

// NCCObjectives Component with Edit Functionality
function NCCObjectives({ data, isEditing, onUpdate }) {
  const [localData, setLocalData] = useState(data || []);

  useEffect(() => {
    setLocalData(data || []);
  }, [data]);

  const handleChange = (index, value) => {
    const updatedData = [...localData];
    if (updatedData[0]?.objectives) {
      const newObjectives = [...updatedData[0].objectives];
      newObjectives[index] = value;
      updatedData[0].objectives = newObjectives;
      setLocalData(updatedData);
      onUpdate(updatedData);
    }
  };

  const handleAddPoint = () => {
    const updatedData = [...localData];
    if (updatedData[0]?.objectives) {
      updatedData[0].objectives = [...updatedData[0].objectives, ""];
    } else if (updatedData[0]) {
      updatedData[0].objectives = [""];
    }
    setLocalData(updatedData);
    onUpdate(updatedData);
  };

  const handleRemovePoint = (index) => {
    const updatedData = [...localData];
    if (updatedData[0]?.objectives) {
      updatedData[0].objectives = updatedData[0].objectives.filter((_, i) => i !== index);
      setLocalData(updatedData);
      onUpdate(updatedData);
    }
  };

  return (
    <div className="NCC_ARMY-row mt-4">
      <section className="NCC_ARMY-section bg-prim dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-3">
        <h2 className="NCC_ARMY-section-title text-accn dark:text-drkt border-b-2 border-secd dark:border-drks w-fit">
          Objectives of NCC
        </h2>
        {isEditing ? (
          <div className="py-2">
            {localData[0]?.objectives?.map((content, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <AutoResizeTextarea
                  type="text"
                  value={content}
                  onChange={(e) => handleChange(i, e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Objective point"
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
            {localData[0]?.objectives?.map((content, i) => (
              <li key={i}>{content}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// NCCAim Component with Edit Functionality
function NCCAim({ data, isEditing, onUpdate }) {
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
    <div className="NCC_ARMY-aim-container bg-prim dark:bg-drkb border-l-4 border-secd dark:border-drks px-6">
      <div className="NCC_ARMY-aim">
        <h2 className="NCC_ARMY-heading text-accn dark:text-drkt border-b-2 border-secd dark:border-drks w-fit">
          <img src={logo} alt="NCC Logo" className="NCC_ARMY-icon" />
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

  const handleCardinalChange = (index, value) => {
    const updatedData = [...localData];
    if (updatedData[0]?.cardinals) {
      const newCardinals = [...updatedData[0].cardinals];
      newCardinals[index] = value;
      updatedData[0].cardinals = newCardinals;
      setLocalData(updatedData);
      onUpdate(updatedData);
    }
  };

  const handleAddCardinal = () => {
    const updatedData = [...localData];
    if (updatedData[0]?.cardinals) {
      updatedData[0].cardinals = [...updatedData[0].cardinals, ""];
    } else if (updatedData[0]) {
      updatedData[0].cardinals = [""];
    }
    setLocalData(updatedData);
    onUpdate(updatedData);
  };

  const handleRemoveCardinal = (index) => {
    const updatedData = [...localData];
    if (updatedData[0]?.cardinals) {
      updatedData[0].cardinals = updatedData[0].cardinals.filter((_, i) => i !== index);
      setLocalData(updatedData);
      onUpdate(updatedData);
    }
  };

  return (
    <>
      <div className="NCC_ARMY-motto-pledge-container">
        <div className="NCC_ARMY-motto bg-prim dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-6">
          <h2 className="NCC_ARMY-heading text-accn dark:text-drkt border-b-2 border-secd dark:border-drks w-fit">
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
            <p className="NCC_ARMY-content-1">{localData[0]?.motto}</p>
          )}
        </div>

        <div className="NCC_ARMY-pledge bg-prim dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-6">
          <h2 className="NCC_ARMY-heading text-accn dark:text-drkt border-b-2 border-secd dark:border-drks w-fit">
            CARDINALS OF NCC
          </h2>
          {isEditing ? (
            <div className="py-2">
              {localData[0]?.cardinals?.map((content, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <AutoResizeTextarea
                    type="text"
                    value={content}
                    onChange={(e) => handleCardinalChange(i, e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Cardinal point"
                  />
                  <button
                    onClick={() => handleRemoveCardinal(i)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddCardinal}
                className="flex items-center gap-1 mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                <Plus size={16} /> Add Cardinal
              </button>
            </div>
          ) : (
            <ul className="Ncc_Army-list marker:text-accn dark:marker:text-drka">
              {localData[0]?.cardinals?.map((content, i) => (
                <li key={i}>{content}</li>
              ))}
            </ul>
          )}
        </div>
      </div>


    </>
  );
}

// NCCPledge Component with Edit Functionality
function NCCPledge({ data, isEditing, onUpdate }) {
  const [localData, setLocalData] = useState(data || []);

  useEffect(() => {
    setLocalData(data || []);
  }, [data]);

  const handleChange = (index, value) => {
    const updatedData = [...localData];
    if (updatedData[0]?.pledge) {
      const newPledge = [...updatedData[0].pledge];
      newPledge[index] = value;
      updatedData[0].pledge = newPledge;
      setLocalData(updatedData);
      onUpdate(updatedData);
    }
  };

  const handleAddPoint = () => {
    const updatedData = [...localData];
    if (updatedData[0]?.pledge) {
      updatedData[0].pledge = [...updatedData[0].pledge, ""];
    } else if (updatedData[0]) {
      updatedData[0].pledge = [""];
    }
    setLocalData(updatedData);
    onUpdate(updatedData);
  };

  const handleRemovePoint = (index) => {
    const updatedData = [...localData];
    if (updatedData[0]?.pledge) {
      updatedData[0].pledge = updatedData[0].pledge.filter((_, i) => i !== index);
      setLocalData(updatedData);
      onUpdate(updatedData);
    }
  };

  return (
    <div className="NCC_ARMY-row mt-4">
      <section className="NCC_ARMY-section bg-prim dark:bg-drkb border-l-4 border-[#FDB515] dark:border-drks px-6">
        <h2 className="NCC_ARMY-section-title text-accn dark:text-drkt border-b-2 border-secd dark:border-drks w-fit">
          Pledge of NCC
        </h2>
        {isEditing ? (
          <div className="py-2">
            {localData[0]?.pledge?.map((content, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <AutoResizeTextarea
                  type="text"
                  value={content}
                  onChange={(e) => handleChange(i, e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Pledge point"
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
            {localData[0]?.pledge?.map((content, i) => (
              <li key={i}>{content}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// NCCContact Component with Edit Functionality
function NCCContact({ data, isEditing, isDirty, isSaved, onUpdate, onCancel, onSave, onDiscard, onRequest })  {
  const [localData, setLocalData] = useState(data || []);
  // const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setLocalData(data || []);
  }, [data]);

  const handleChange = (value) => {
    const updatedData = [...localData];
    if (updatedData[0]) {
      updatedData[0].contact_address = value;
      setLocalData(updatedData);
      onUpdate(updatedData);
    }
  };

  return (

    <> <div className="max-w-lg mx-auto p-6 mb-4 bg-gray-100 dark:bg-drkb rounded-lg shadow-md text-center">
      <h2 className="text-2xl text-brwn font-bold dark:text-white mb-4">
        Contact Us
      </h2>
      {isEditing ? (
        <textarea
          value={localData[0]?.contact_address || ""}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Contact address"
          rows={3}
        />
      ) : (
        <p className="text-lg font-poppi text-[16px] text-gray-700 dark:text-gray-300">
          {localData[0]?.contact_address}
        </p>
      )}
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

const NCC_ARMY = ({ toggle, theme }) => {
  const [ncc_army, setarmydata] = useState(null);
  const [committedData, setCommittedData] = useState(null);
  const [pendingData, setPendingData] = useState(null);
  const [army, setnccarmy] = useState("About NCC Army");
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const { sendRequest, loading, error } = useAdminRequest();
  const navigate = useNavigate();

  const handleDataUpdate = (newData) => {
    setarmydata(newData);
    setIsDirty(true);
  };

  const handleStartEdit = () => {
    if (pendingData) {
      setarmydata(JSON.parse(JSON.stringify(pendingData)));
    } else {
      setarmydata(JSON.parse(JSON.stringify(committedData)));
    }
    setIsEditing(true);
    setIsDirty(false);
    setIsSaved(!!pendingData);
  };

  const handleCancel = () => {
    if (pendingData) {
      setarmydata(JSON.parse(JSON.stringify(pendingData)));
    } else {
      setarmydata(JSON.parse(JSON.stringify(committedData)));
    }
    setIsEditing(false);
    setIsDirty(false);
    setIsSaved(!!pendingData);
  };

  const handleSave = () => {
    let hasEmptyFields = false;

    if (ncc_army && ncc_army[0]) {
      const data = ncc_army[0];
      const fieldsToCheck = ["about_us", "objectives", "aim", "cardinals", "pledge"];

      for (const field of fieldsToCheck) {
        if (data[field] && data[field].some((item) => !item.trim())) {
          hasEmptyFields = true;
          break;
        }
      }

      if (
        !data.motto?.trim() ||
        !data.contact_address?.trim()
      ) {
        hasEmptyFields = true;
      }
    }

    if (hasEmptyFields) {
      alert("Please fill all fields before saving!");
      return;
    }

    const pending = JSON.parse(JSON.stringify(ncc_army));
    setPendingData(pending);
    setIsSaved(true);
    setIsEditing(false);
    setIsDirty(false);
  };

  const handleDiscard = () => {
    setarmydata(JSON.parse(JSON.stringify(committedData)));
    setPendingData(null);
    setIsSaved(false);
    setIsDirty(false);
  };

  const handleRequest = () => {
    setShowRequestModal(true);
  };


  const handleFinalRequestConfirm = async () => {
  if (!pendingData) return;

  // Prepare payload for the backend
  const payload = [
    {
    collectionName: "ncc_army",
    collection_type: "about",
    action: "update",
    title: "update about ",
      original_data: committedData[0], // data before edit
      meta_data: pendingData[0],       // data after edit
    },
  ];

  try {
    const result = await sendRequest(payload); // Send using the hook
   // toast.success("Request confirmed and sent successfully!");
    if (result) {
      // Update local states after successful request
      setCommittedData(JSON.parse(JSON.stringify(pendingData)));
      setarmydata(JSON.parse(JSON.stringify(pendingData)));
      setPendingData(null);
      setIsSaved(false);
      setShowRequestModal(false);

      // toast.success("Request confirmed and sent successfully!");
    }
  } catch (err) {
    toast.error("Failed to send request!");
  }
};

  const revertChange = (field) => {
    if (!pendingData || !committedData) return;

    const updated = JSON.parse(JSON.stringify(pendingData));
    updated[0][field] = committedData[0][field];

    setPendingData(updated);
    setarmydata(JSON.parse(JSON.stringify(updated)));
  };

  const getChanges = () => {
    if (!pendingData || !committedData) return [];
    const changes = [];

    const fields = ["about_us", "objectives", "aim", "motto", "cardinals", "pledge", "contact_address"];

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
          section: field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " "),
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
        const data = response.data.data;
        setarmydata(data);
        setCommittedData(JSON.parse(JSON.stringify(data)));
        setPendingData(null);
        setIsEditing(false);
        setIsDirty(false);
        setIsSaved(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        if (error.response?.data?.status === 429) {
          navigate('/ratelimit', { state: { msg: error.response.data.message } });
        }
      }
    };
    fetchData();
  }, [army, navigate]);

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

  const navData = {
    "About NCC Army": (
      <>
        <NCCAbout
          data={ncc_army}
          isEditing={isEditing}
          onUpdate={handleDataUpdate}
          onStartEdit={handleStartEdit}
        />
        <NCCObjectives
          data={ncc_army}
          isEditing={isEditing}
          onUpdate={handleDataUpdate}
        />
        <NCCAim
          data={ncc_army}
          isEditing={isEditing}
          onUpdate={handleDataUpdate}
        />
        <NCCMotto
          data={ncc_army}
          isEditing={isEditing}
          onUpdate={handleDataUpdate}
          onCancel={handleCancel}
          onSave={handleSave}
          onDiscard={handleDiscard}
          onRequest={handleRequest}
          isSaved={isSaved}
          isDirty={isDirty}
        />
        <NCCPledge
          data={ncc_army}
          isEditing={isEditing}
          onUpdate={handleDataUpdate}
        />
<NCCContact
  data={ncc_army}
  isEditing={isEditing}
  isDirty={isDirty}       // <-- pass this
  isSaved={isSaved}       // <-- pass this
  onUpdate={handleDataUpdate}
  onCancel={handleCancel}
  onSave={handleSave}
  onDiscard={handleDiscard}
  onRequest={handleRequest}
/>

      </>
    ),
    // "Recent Events": <NCCACarousel data={ncc_army} />,
    "Team & Coordinators": <NCCAMembers data={ncc_army} />,
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
<ToastContainer position="bottom-right" autoClose={2000} />
      <SideNav sts={army} setSts={setnccarmy} navData={navData} cls="" backButton={true} />

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
                    <th className="border p-2">Undo</th>
                  </tr>
                </thead>
                <tbody>
                  {changes.map((change, i) => (
                    <tr key={i}>
                      <td className="border p-2 text-blue-600">Edited</td>
                      <td className="border p-2">{change.section}</td>
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

export default NCC_ARMY;