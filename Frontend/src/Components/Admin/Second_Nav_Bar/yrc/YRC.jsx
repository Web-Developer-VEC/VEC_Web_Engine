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
import {
  faEdit,
  faTimes,
  faPaperPlane,
  faEye,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";
import useBlockNavigation from "../useBlockNavigation";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const UrlParser = (path) => {
  return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
};

const AdminYrc = ({ toggle, theme }) => {
  const [yrcData, setYrcData] = useState(null);
  const [yrc, setYrc] = useState("About YRC");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();

  const navData = {
    "About YRC": <YRCAbout data={yrcData} />,
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
        setYrcData(response.data.data);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", { state: { msg: error.response.data.message } });
        }
      }
    };

    fetchData();
  }, [yrc, navigate]);

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

      {yrcData ? (
        <SideNav sts={yrc} setSts={setYrc} navData={navData} cls={"w-screen"} />
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp />
        </div>
      )}
    </div>
  );
};

// ---------------- YRCAbout Component ----------------
function YRCAbout({ data }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [aboutText, setAboutText] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [changes, setChanges] = useState([]);
const [originalAbout, setOriginalAbout] = useState("");
useBlockNavigation(isEditing);
useEffect(() => {
  if (data && data[0]?.about_us) {
    setAboutText(data[0].about_us);
    setOriginalAbout(data[0].about_us);
  }
}, [data]);

  // useEffect(() => {
  //   if (data && data[0]?.about_us) {
  //     setAboutText(data[0].about_us);
  //   }
  // }, [data]);

  const handleEdit = () => setIsEditing(true);

const handleCancel = () => {
  // Restore original text
  setAboutText(originalAbout);

  // Clear changes
  setChanges([]);

  // Exit edit/preview modes
  setIsEditing(false);
  setIsPreviewing(false);

  // Show toast
  toast.info("Changes discarded");
};


  const handlePreviewClick = () => {
    setIsPreviewing(true);
    setChanges([
      {
        action: "edit",
        target: "About YRC",
        details: aboutText,
      },
    ]);
  };
const hasChanges = changes.length > 0;
const validateaboutData = () => {
    return aboutText.trim() !== "";
  }


  const handleBackToEdit = () => setIsPreviewing(false);

  const handleRequest = () => {
    setShowPopup(true);
  };



  const handleFinalRequest = () => {
    console.log("Submitting request:", changes);
    toast.success("Request submitted Successfully");
    setShowPopup(false);
    setIsEditing(false);
    setIsPreviewing(false);
  };
const handleUndo = (index) => {
  const undoneChange = changes[index];

  // If undoing about_us, restore original
  if (undoneChange?.target === "About YRC" || undoneChange?.target === "about_us") {
    setAboutText(originalAbout);
  }

  const updatedChanges = [...changes];
  updatedChanges.splice(index, 1);
  setChanges(updatedChanges);
};


  return (
    <div className="YRC-about mt-4">
      <ToastContainer position="bottom-right" autoClose={3000} />
      {/* Top Right Buttons */}
      {!isPreviewing && (
        <div className="flex justify-end gap-3 mt-4 p-3">
          {!isEditing ? (
            <button className="nss-btn nss-btn-edit" onClick={handleEdit}>
              <FontAwesomeIcon icon={faEdit} /> Edit
            </button>
          ) : (
            <button className="nss-btn nss-btn-cancel" onClick={handleCancel}>
              <FontAwesomeIcon icon={faTimes} /> Cancel
            </button>
          )}
        </div>
      )}

      {/* Main Content */}
      {isPreviewing ? (
        <div className="YRC-Aboutus border-l-4 border-secd mx-auto dark:border-drks dark:bg-drkb p-6">
          <h2 className="YRC-heading text-brwn dark:text-drkt text-2xl font-bold mb-4">
            ABOUT US
          </h2>
          <p className="YRC-content text-gray-700 dark:text-gray-300">
            {aboutText}
          </p>
        </div>
      ) : isEditing ? (
<textarea
  value={aboutText}
  onChange={(e) => {
    const newVal = e.target.value;
    setAboutText(newVal);

    if (newVal !== originalAbout) {
      setChanges([{ action: "edit", target: "about_us", details: newVal }]);
    } else {
      setChanges([]); // reset if back to original
    }
  }}
  className="w-full p-3 border rounded min-h-[200px] text-gray-700"
/>


      ) : (
        <div className="YRC-Aboutus border-l-4 border-secd mx-auto dark:border-drks dark:bg-drkb p-6">
          <h2 className="YRC-heading text-brwn dark:text-drkt text-2xl font-bold mb-4">
            ABOUT US
          </h2>
          <p className="YRC-content text-gray-700 dark:text-gray-300">
            {aboutText}
          </p>
        </div>
      )}

      {/* Preview Mode Buttons */}
      {isEditing && !isPreviewing && (
        <div className="flex justify-end gap-3 mt-4 p-3 bottom-4 right-4 flex gap-2">


          <button
            className={`nss-btn nss-btn-request ${!hasChanges ? "opacity-50 cursor-not-allowed" : ""}`}
             onClick={() => {
                if (validateaboutData()) {
                  handlePreviewClick();
                } else {
                  toast.error("Please fill all required fields before previewing.");
                }
              }}
            disabled={!hasChanges}
          >
           
            <FontAwesomeIcon icon={faEye} /> Preview
          </button>

        </div>
      )}

      {isPreviewing && (
        <div className="flex justify-end gap-3 mt-4 p-2">
          <button
            className="nss-btn nss-btn-back flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={handleBackToEdit}
          >
            <FontAwesomeIcon icon={faTimes} /> Back to Edit
          </button>
          <button
            className="nss-btn nss-btn-request flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={handleRequest}
          >
            <FontAwesomeIcon icon={faPaperPlane} /> Request Changes
          </button>
        </div>
      )}

      {/* Popup for Review */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-auto">
            <h3 className="text-xl font-bold mb-4">Review Changes</h3>
            <div className="max-h-64 overflow-auto mb-4">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-2">Action</th>
                    <th className="pb-2">Target</th>
                    {/* <th className="pb-2">Details</th> */}
                    <th className="pb-2">Undo</th>
                  </tr>
                </thead>
                <tbody>
                  {changes.map((change, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 capitalize">{change.action}</td>
                      <td className="py-2 capitalize">{change.target}</td>
                      {/* <td className="py-2">{change.details || "-"}</td> */}
                      <td className="py-2">
                        <button
                          onClick={() => handleUndo(index)}
                          className="text-red-500 hover:text-red-700 px-2 py-1 bg-red-100 rounded"
                        >
                          <FontAwesomeIcon icon={faUndo} /> Undo
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              These changes will be submitted for review before being published.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
              <button
  className={`px-4 py-2 rounded flex items-center gap-2 ${
    changes.length === 0
      ? "bg-gray-300 cursor-not-allowed"
      : "bg-green-500 text-white hover:bg-green-600"
  }`}
  onClick={handleFinalRequest}
  disabled={changes.length === 0}
>
  <FontAwesomeIcon icon={faPaperPlane} /> Submit Request
</button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminYrc;
