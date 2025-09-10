import React, { useEffect, useRef, useState } from "react";
import './Management.css';
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import { FaUserEdit, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { ArrowBigLeftDash, CircleCheck, Pencil, Trash2, Upload, UserRoundPlus } from "lucide-react";

function Management({ theme, toggle }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAdminEditing, setIsAdminEditing] = useState(false);
  const [messages, setMessages] = useState([
    {
      heading: "FOUNDER MESSAGE",
      text: `At Velammal Engineering College, our vision is to nurture forward-thinking professionals...`,
      image: "/static/images/trust/muthuramalingam.webp",
      editing: false,
    },
    {
      heading: "CEO MESSAGE",
      text: `At Velammal Engineering College, we empower students to innovate, lead, and excel...`,
      image: "/static/images/trust/velmurugan.webp",
      editing: false,
    },
    {
      heading: "DEPUTY CEO MESSAGE",
      text: `Dear Students, Faculty, and Visitors,\n\nIt is my pleasure to welcome you to Velammal Engineering College...`,
      image: "/static/images/trust/deptyceo.webp",
      editing: false,
    },
  ]);

  const originalMessages = useRef([]);

  useEffect(() => {
    originalMessages.current = messages.map(msg => ({ ...msg }));
  }, []);

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
  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const handleEditClick = () => setIsAdminEditing(true);
  const handleBackClick = () => setIsAdminEditing(false);

  const toggleEdit = (index) => {
    const updated = [...messages];
    updated[index].editing = !updated[index].editing;
    setMessages(updated);
  };



    const handleDelete = (index) => {
    alert("")
    const updated = messages.filter((_, i) => i !== index);
    setMessages(updated);
  };


  const handleChange = (index, field, value) => {
    const updated = [...messages];
    updated[index][field] = value;
    setMessages(updated);
  };

  const handleImageUpload = (index, file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange(index, 'image', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (index) => {
    originalMessages.current[index] = { ...messages[index] };
    toggleEdit(index);
  };

  const handleCancel = (index) => {
    const updated = [...messages];
    updated[index] = { ...originalMessages.current[index], editing: false };
    setMessages(updated);
  };

  const handleAdd = () => {
    setMessages([
      ...messages,
      {
        heading: "",
        text: "",
        image: "/static/images/trust/default.webp",
        editing: true,
      },
    ]);
    originalMessages.current.push({ heading: "", text: "", image: "/static/images/trust/default.webp" });
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
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/aboutvec.webp"
        headerText="Management"
        subHeaderText="Leading with vision, fostering innovation, and inspiring integrity at every step."
      />
      <div>
        <div className="flex gap-4 justify-end pr-8 mt-2">
          <button className="flex items-center bg-yellow-500 text-black px-3 py-2 rounded" onClick={handleEditClick}>
            <FaUserEdit className="mr-2" /> Edit
          </button>
          <button className="flex items-center bg-green-500 text-black px-3 py-2 rounded" onClick={handleBackClick}>
          <CircleCheck className="mr-2" />
            Confirm 
          </button>
        </div>

        <div className={`FCP-message-container ${theme === 'dark' ? 'dark-theme' : ''}`}>
          {messages.map((msg, index) => (
            <div key={index} className="FCP-message-section bg-[#f8f9fa] dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]">
              {msg.editing ? (
                <input
                  type="text"
                  className="FCP-section-title text-brwn dark:text-prim"
                  value={msg.heading}
                  onChange={(e) => handleChange(index, 'heading', e.target.value)}
                />
              ) : (
                <h2 className="FCP-section-title text-brwn dark:text-prim">{msg.heading}</h2>
              )}

              <div className="FCP-content-container">
                <div className="FCP-text-container">
                  {msg.editing ? (
                    <textarea
                      rows="8"
                      className="w-full p-2 border border-gray-300 rounded"
                      value={msg.text}
                      onChange={(e) => handleChange(index, 'text', e.target.value)}
                    />
                  ) : (
                    <p>{msg.text}</p>
                  )}

                  {msg.editing && (
                    <div className="flex gap-4 justify-end pt-4 pr-8">
                      <button
                        className="flex items-center bg-green-600 px-3 py-2 rounded text-white"
                        onClick={() => handleSubmit(index)}
                      >
                        <FaCheckCircle className="mr-2" /> Submit
                      </button>
                      <button
                        className="flex items-center bg-red-500 px-3 py-2 rounded text-white"
                        onClick={() => handleCancel(index)}
                      >
                        <FaTimesCircle className="mr-2" /> Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="FCP-image-container flex flex-column">
                  <img src={UrlParser(msg.image)} alt="Message Visual" className="founder" />
                  <div>

                  {msg.editing && (
                    <div className="mt-2">
                      <label className="cursor-pointer flex items-center bg-[#fdcc03] text-black text-sm px-2 py-1 rounded">
                        <Upload className="mr-1 w-4 h-4" /> Upload
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg"
                          onChange={(e) => handleImageUpload(index, e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                  </div>
                </div>
              </div>

              {isAdminEditing && !msg.editing && (
                <div className="flex gap-4 justify-end pt-4 pr-8">
                  <button
                    className="flex items-center bg-[#fdcc03] px-3 py-2 rounded text-black"
                    onClick={() => toggleEdit(index)}
                  >
                    <Pencil className="mr-2" /> Edit
                  </button>
                  <button
                    className="flex items-center w-fit bg-[#fdcc03] px-2 py-2 rounded text-black"
                    onClick={() => handleDelete(index)}
                  >
                    <Trash2 className="mr-1" /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}

          {isAdminEditing && (
            <div className="flex gap-4 justify-end pt-4 pr-8">
              <button
                className="flex items-center bg-[#fdcc03] px-3 py-2 rounded text-black"
                onClick={handleAdd}
              >
                <UserRoundPlus className="mr-1" /> Add
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Management;