import React, { useEffect, useState, useRef } from "react";
import styles from "./collegevisionmission.module.css";
import { ArrowBigLeftDash, CircleCheck, Pencil, Upload } from "lucide-react";
import Banner from "../../Banner";
import { FaUserEdit, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import LoadComp from "../../LoadComp";

const Collegevisionmission = ({ theme, toggle }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAdminEditing, setIsAdminEditing] = useState(false);
  const [editingVision, setEditingVision] = useState(false);
  const [editingMission, setEditingMission] = useState(false);
  const [visionText, setVisionText] = useState(
    "To educate the student community both by theory and practice to fit in with society and to conquer tomorrow’s technology at a global level with human values through our dedicated team."
  );
  const [missionText, setMissionText] = useState(
    "To provide world-class education in engineering, technology, and management, to foster research & development, to encourage creativity and promote innovation, to build leadership, intrapreneurship, and entrepreneurship and to nurture teamwork and achieve stakeholders’ delight."
  );
  const [selectedImage, setSelectedImage] = useState(null);

  // ✅ Store original content before editing
  const originalVisionTextRef = useRef(visionText);
  const originalMissionTextRef = useRef(missionText);

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

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) =>
    path?.startsWith("http") ? path : `${BASE_URL}${path}`;

  const mainEdit = () => setIsAdminEditing(true);
  const mainBack = () => {
    setIsAdminEditing(false);
    setEditingVision(false);
    setEditingMission(false);
  };

  const handleVisionEdit = () => {
    originalVisionTextRef.current = visionText;
    setEditingVision(true);
  };

  const handleMissionEdit = () => {
    originalMissionTextRef.current = missionText;
    setEditingMission(true);
  };

  const handleVisionSubmit = () => {
    alert("Updated Vision:\n" + visionText);
    setEditingVision(false);
  };

  const handleMissionSubmit = () => {
    alert("Updated Mission:\n" + missionText);
    setEditingMission(false);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/aboutvec.webp"
        headerText="Vision & Mission"
        subHeaderText="Empowering a better tomorrow through innovation and integrity"
      />

      <div className="flex gap-4 justify-end pr-8 mt-2">
        <button
          className="flex items-center bg-yellow-500 text-black px-3 py-2 rounded"
          onClick={mainEdit}
        >
          <FaUserEdit className="mr-2" /> Edit
        </button>
        <button
          className="flex items-center bg-green-500 text-black px-3 py-2 rounded"
          onClick={mainBack}
        >
          <CircleCheck className="mr-2" />
            Confirm 
        </button>
      </div>

      <div className={styles.visionMissionContainer}>
        {/* VISION */}
        <div className={styles.visionWrapper}>
          <div
            className={`${styles.visionCard} ${styles.card} bg-prim dark:bg-drkb border-l-4 border-secd dark:border-drks`}
          >
            <div className={styles.cardHeader}>
              <h2
                className={`${styles.cardTitle} text-brwn dark:text-prim border-b-2 border-secd dark:border-drks pb-1`}
              >
                Institute Vision
              </h2>
            </div>

            {editingVision ? (
              <>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded"
                  rows={4}
                  value={visionText}
                  onChange={(e) => setVisionText(e.target.value)}
                />
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    className="bg-green-500 px-3 py-1 text-white rounded"
                    onClick={handleVisionSubmit}
                  >
                    <FaCheckCircle className="inline mr-1" /> Submit
                  </button>
                  <button
                    className="bg-red-500 px-3 py-1 text-white rounded"
                    onClick={() => {
                      setVisionText(originalVisionTextRef.current);
                      setEditingVision(false);
                    }}
                  >
                    <FaTimesCircle className="inline mr-1" /> Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="flex justify-between gap-4">
                <p className={`${styles.cardContent} flex-1`}>{visionText}</p>
                {isAdminEditing && (
                  <div className="flex flex-col justify-end">
                    <div className="flex gap-2">
                      <button
                        className="flex items-center bg-[#fdcc03] px-3 py-2 rounded text-black"
                        onClick={handleVisionEdit}
                      >
                        <FaUserEdit className="mr-2" /> Edit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.photo}>
            <img
              src={
                selectedImage ||
                UrlParser("/static/images/visionandmission/VM.webp")
              }
              alt="Vision Photo"
              className={styles.photoImage}
            />
            {isAdminEditing && (
              <div className="flex justify-center mt-2">
                <button
                  className="flex items-center bg-[#fdcc03] px-3 py-2 rounded text-black"
                  onClick={() =>
                    document.getElementById("vision-image-upload").click()
                  }
                >
                  <Upload className="mr-2" /> Upload Image
                </button>
                <input
                  id="vision-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>

        {/* MISSION */}
        <div className={styles.missionWrapper}>
          <div
            className={`${styles.missionCard} ${styles.card} bg-prim dark:bg-drkb border-l-4 border-secd dark:border-drks`}
          >
            <div className={styles.cardHeader}>
              <h2
                className={`${styles.cardTitle} text-brwn dark:text-prim border-b-2 border-secd dark:border-drks pb-1`}
              >
                Institute Mission
              </h2>
            </div>

            {editingMission ? (
              <>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded"
                  rows={5}
                  value={missionText}
                  onChange={(e) => setMissionText(e.target.value)}
                />
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    className="bg-green-500 px-3 py-1 text-white rounded"
                    onClick={handleMissionSubmit}
                  >
                    <FaCheckCircle className="inline mr-1" /> Submit
                  </button>
                  <button
                    className="bg-red-500 px-3 py-1 text-white rounded"
                    onClick={() => {
                      setMissionText(originalMissionTextRef.current);
                      setEditingMission(false);
                    }}
                  >
                    <FaTimesCircle className="inline mr-1" /> Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="flex justify-between gap-4">
                <p
                  className={`${styles.cardContent} flex-1 text-text dark:text-drkt`}
                >
                  {missionText}
                </p>
                {isAdminEditing && (
                  <div className="flex flex-col justify-end">
                    <div className="flex gap-2">
                      <button
                        className="flex items-center bg-[#fdcc03] px-3 py-2 rounded text-black"
                        onClick={handleMissionEdit}
                      >
                        <FaUserEdit className="mr-2" /> Edit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collegevisionmission;
