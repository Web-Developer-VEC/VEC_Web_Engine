import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import Banner from "../../Banner";
import "slick-carousel/slick/slick.scss";
import "slick-carousel/slick/slick-theme.scss";
import "./YRC.css";
import axios from "axios";
import SideNav from "../SideNav";
import "swiper/css";
import "swiper/css/navigation";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router";
import NotificationBox1 from "../yrc/NotificationBox1";
import CarouselYRC from "../yrc/CarouselYRC";
import YRCCoord from "../yrc/YRCCoord";
import Awardsnss from "../yrc/Awardsnss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast, ToastContainer } from "react-toastify";
import useBlockNavigation from "../useBlockNavigation";
import { Pencil, X, Trash2, Send, Plus } from "lucide-react";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const UrlParser = (path) => {
  return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
};

// ---------------- YRCAbout Component with Edit Functionality ----------------
function YRCAbout({ data, isEditing, onUpdate, onStartEdit }) {
  const [localData, setLocalData] = useState(data || []);

  useEffect(() => {
    setLocalData(data || []);
  }, [data]);

  const handleAboutChange = (value) => {
    const updatedData = [...localData];
    if (updatedData[0]) {
      updatedData[0].about_us = value;
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
      
      <div className="YRC-about mt-4">
        <div className="YRC-Aboutus border-l-4 border-secd mx-auto dark:border-drks dark:bg-drkb px-6">
          <h2 className="YRC-heading text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks w-fit">
            ABOUT US
          </h2>

          {isEditing ? (
            <textarea
              value={localData[0]?.about_us || ""}
              onChange={(e) => handleAboutChange(e.target.value)}
              className="w-full p-2 border rounded min-h-[150px] mt-2"
              placeholder="About YRC"
            />
          ) : (
            <p className="YRC-content mt-2">
              {data[0]?.about_us}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

const AdminYrc = ({ toggle, theme }) => {
  const [yrcData, setYrcData] = useState(null);
  const [committedData, setCommittedData] = useState(null);
  const [pendingData, setPendingData] = useState(null);
  const [yrc, setYrc] = useState("About YRC");
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();
  const { sendRequest, loading, error } = useAdminRequest();

const handleDataUpdate = (newData) => {
  setYrcData(newData);

  // Check if data is actually changed from original committedData
  const originalText = committedData?.[0]?.about_us || "";
  const currentText = newData?.[0]?.about_us || "";

  setIsDirty(currentText.trim() !== originalText.trim());
};


  const handleStartEdit = () => {
    if (pendingData) {
      setYrcData(JSON.parse(JSON.stringify(pendingData)));
    } else {
      setYrcData(JSON.parse(JSON.stringify(committedData)));
    }
    setIsEditing(true);
    setIsDirty(false);
    setIsSaved(!!pendingData);
  };

  const handleCancel = () => {
    if (pendingData) {
      setYrcData(JSON.parse(JSON.stringify(pendingData)));
    } else {
      setYrcData(JSON.parse(JSON.stringify(committedData)));
    }
    setIsEditing(false);
    setIsDirty(false);
    setIsSaved(!!pendingData);
  };

  const handleSave = () => {
    if (!yrcData || !yrcData[0] || !yrcData[0].about_us?.trim()) {
      // alert("Please fill all fields before saving!");
      toast.warning("Please fill all fields before saving!");
      return;
    }

    const pending = JSON.parse(JSON.stringify(yrcData));
    setPendingData(pending);
    setIsSaved(true);
    setIsEditing(false);
    setIsDirty(false);
  };

  const handleDiscard = () => {
    setYrcData(JSON.parse(JSON.stringify(committedData)));
    setPendingData(null);
    setIsSaved(false);
    setIsDirty(false);
  };

  const handleRequest = () => {
    setShowRequestModal(true);
  };

  // const handleFinalRequestConfirm = () => {
  //   if (!pendingData) return;

  //   setCommittedData(JSON.parse(JSON.stringify(pendingData)));
  //   setYrcData(JSON.parse(JSON.stringify(pendingData)));
  //   setPendingData(null);
  //   setIsSaved(false);
  //   setShowRequestModal(false);
  // };


const handleFinalRequestConfirm = async () => {
  if (!pendingData) return;

  // Prepare payload for the backend
  const payload = [
    {
      collectionName: "yrc",
      collection_type: "about",
      action: "update",
      title: "Update About YRC",
      original_data: committedData[0], // data before edit
      meta_data: pendingData[0],       // data after edit
    },
  ];

  try {
    const result = await sendRequest(payload); // Send using the hook

    if (result) {
      // Update local states after successful request
      setCommittedData(JSON.parse(JSON.stringify(pendingData)));
      setYrcData(JSON.parse(JSON.stringify(pendingData)));
      setPendingData(null);
      setIsSaved(false);
      setShowRequestModal(false);

      toast.success("Request confirmed and sent successfully!");
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
    setYrcData(JSON.parse(JSON.stringify(updated)));
  };

  const getChanges = () => {
    if (!pendingData || !committedData) return [];
    const changes = [];

    const fields = ["about_us"];

    fields.forEach((field) => {
      const oldVal = committedData[0][field] || "";
      const newVal = pendingData[0][field] || "";

      if (oldVal !== newVal) {
        changes.push({
          field: field,
          section: "About Us",
          oldValue: oldVal,
          newValue: newVal,
        });
      }
    });

    return changes;
  };

  const changes = getChanges();

  const navData = {
    "About YRC": (
      <>
        <YRCAbout
          data={yrcData}
          isEditing={isEditing}
          onUpdate={handleDataUpdate}
          onStartEdit={handleStartEdit}
        />
        
        {/* Buttons for Save/Cancel/Request */}
        {isEditing && (
          <div className="flex justify-end gap-3 px-6 py-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500"
            >
              Cancel
            </button>
            {isDirty && (
              <button
                onClick={handleSave}
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
              onClick={handleDiscard}
              className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500"
            >
              Discard Changes
            </button>
            <button
              onClick={handleRequest}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
            >
              <Send size={18} /> Request
            </button>
          </div>
        )}
      </>
    ),
    "News & Updates": <NotificationBox1 data={yrcData} />,
    "Recent Events": <CarouselYRC data={yrcData} />,
    "Team & Coordinators": <YRCCoord data={yrcData} />,
    "Awards & Recognition": <Awardsnss data={yrcData} />,
  };

  useEffect(() => {
    const typeMatch = {
      "About YRC": "about",
      "News & Updates": "news_updates",
      "Recent Events": "events",
      "Team & Coordinators": "team",
      "Awards & Recognition": "awards",
    };

    const fetchData = async () => {
      try {
        const response = await axios.post("/api/main-backend/yrc", {
          type: typeMatch[yrc],
        });
        const data = response.data.data;
        setYrcData(data);
        setCommittedData(JSON.parse(JSON.stringify(data)));
        setPendingData(null);
        setIsEditing(false);
        setIsDirty(false);
        setIsSaved(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", { state: { msg: error.response.data.message } });
        }
      }
    };

    fetchData();
  }, [yrc, navigate]);

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

  return (
    <div>
      <Banner
        backgroundImage="./Banners/YRC.webp"
        headerText="Youth Red Cross (YRC)"
        subHeaderText="Fostering excellence in social service and community well-being."
        toggle={toggle}
        theme={theme}
      />
<ToastContainer position="bottom-right" autoClose={2000} />
      {yrcData ? (
        <SideNav sts={yrc} setSts={setYrc} navData={navData} cls={"w-screen"} backButton={true} />
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp />
        </div>
      )}

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
    </div>
  );
};

export default AdminYrc;