import React, { useEffect, useState } from "react";
import axios from "axios";
import "./policy.css";
import Banner from "../../Banner";
import { useNavigate } from "react-router-dom";
import { FaUserEdit } from "react-icons/fa";
import { Send, Trash, Undo2 } from "lucide-react";

export default function AdminPolicies({ theme, toggle }) {
  const [policies, setPolicies] = useState(null);
  const navigate = useNavigate();

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const handlePdfClick = (name) => {
    if (!name?.pdf_path || name.pdf_path.trim() === "") return;

    const url = UrlParser(name.pdf_path);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Admin hooks
  const [isContentEditable, setIsContentEditable] = useState(true);
  const [isDoneClicked, setIsDoneClicked] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPdf, setNewPdf] = useState("");

  const handleDone = () => {
    setIsDoneClicked(true);
  };

  const handleBackToEdit = () => {
    setIsDoneClicked(false);
  };

  const handleRequestSent = () => {
    setIsContentEditable(true);
    setIsDoneClicked(false);
  };

  const handleAddNewButton = () => {
    setShowPopup(true);
  };

  const handleDeleteButton = (index) => {
    setPolicies((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("/api/main-backend/research", {
          type: "Policy",
        });

        const data = response.data.data;
        setPolicies(data);
      } catch (error) {
        console.error("Error fetching Policy data", error);
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
        }
      }
    };
    fetchData();
  }, [navigate]);

  return (
    <>
      <Banner
        theme={theme}
        toggle={toggle}
        backgroundImage="./Banners/researchbanner.webp"
        headerText="Academic Research"
        subHeaderText="Enrich Your Knowledge"
      />

      <div className="mt-10">
        {/* Edit button */}
        {isContentEditable && (
          <button
            className="flex items-center bg-secd px-3 py-2 z-40 rounded text-text ml-auto mr-20 my-4"
            onClick={() => setIsContentEditable(false)}
          >
            <FaUserEdit className="mr-2" /> Edit
          </button>
        )}

        <h1 className="research-academicresearch-title text-brwn dark:text-drkt dark:border-drks">
          Policy
        </h1>

        {/* Done view */}
        {!isContentEditable && isDoneClicked && (
          <div className="course-selection-container p-12">
            {policies?.map((name, index) => (
              <div
                key={index}
                className="px-4 py-3 font-semibold text-center rounded-xl bg-secd hover:bg-accn hover:text-prim dark:hover:bg-brwn cursor-pointer"
                onClick={() => handlePdfClick(name)}
              >
                {name?.name}
              </div>
            ))}
          </div>
        )}

        {/* Edit view */}
        {!isContentEditable && !isDoneClicked && (
          <div className="course-selection-container p-12">
            {policies?.map((name, index) => (
              <div className="flex items-center gap-2" key={index}>
                <div
                  className="px-4 py-3 font-semibold text-center rounded-xl bg-secd hover:bg-accn hover:text-prim dark:hover:bg-brwn cursor-pointer"
                  onClick={() => handlePdfClick(name)}
                >
                  {name?.name}
                </div>
                <Trash
                  style={{ color: "red", cursor: "pointer" }}
                  onClick={() => handleDeleteButton(index)}
                />
              </div>
            ))}
            <button
              className="px-4 py-3 bg-gray-200 rounded-xl"
              onClick={handleAddNewButton}
            >
              Add new
            </button>
          </div>
        )}

        {/* Normal view */}
        {isContentEditable && (
          <div className="course-selection-container p-12">
            {policies?.map((name, index) => (
              <div
                key={index}
                className="px-4 py-3 font-semibold text-center rounded-xl bg-secd hover:bg-accn hover:text-prim dark:hover:bg-brwn cursor-pointer"
                onClick={() => handlePdfClick(name)}
              >
                {name?.name}
              </div>
            ))}
          </div>
        )}

        {/* Done button */}
        {!isContentEditable && !isDoneClicked && (
          <button
            className="flex items-center ml-auto mr-20 mb-10 border-4 border-secd hover:bg-gray-300 hover:border-brwn text-text px-3 py-2 rounded-lg"
            onClick={handleDone}
          >
            <FaUserEdit className="mr-2" /> Done
          </button>
        )}

        {/* Back + Request */}
        {!isContentEditable && isDoneClicked && (
          <div className="flex gap-4 justify-end pr-8 my-8 mr-10">
            <button
              className="flex items-center bg-secd hover:bg-brwn text-text hover:text-prim px-3 py-2 rounded"
              onClick={handleBackToEdit}
            >
              <FaUserEdit className="mr-2" /> Back to edit
            </button>
            <button
              className="flex items-center bg-green-500 text-text hover:text-prim hover:bg-green-600 px-3 py-2 rounded"
              onClick={handleRequestSent}
            >
              <Send className="mr-2" />
              Request
            </button>
          </div>
        )}

        {/* Add New Popup */}
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[2147483647]">
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-96">
              <h2 className="text-lg font-semibold mb-4 text-center">
                Add New Policy
              </h2>

              {/* Name input */}
              <input
                type="text"
                placeholder="Enter Policy Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full mb-3 p-2 border rounded"
              />

              {/* PDF Path input */}
              <input
                type="text"
                placeholder="Enter PDF Path"
                value={newPdf}
                onChange={(e) => setNewPdf(e.target.value)}
                className="w-full mb-4 p-2 border rounded"
              />

              {/* Submit button */}
              <div className="flex flex-row gap-4 justify-end">

              <button
                className=" px-4 bg-green-500 text-prim py-2 rounded hover:bg-green-600"
                onClick={() => {
                  if(!newName || !newPdf){
                    alert("Submit all the field");
                    return;
                  }
                  setPolicies((prev) => [
                    ...prev,
                    { name: newName, pdf_path: newPdf },
                  ]);
                  setShowPopup(false);
                  setNewName("");
                  setNewPdf("");
                }}
                >
                Submit
              </button>
              <button className="px-4 bg-secd text-text rounded " onClick={()=>{setPolicies((prev) => [
                    ...prev
                  ]);
                  setShowPopup(false);
                  setNewName("");
                  setNewPdf("");}}>
                back
              </button>
                </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
