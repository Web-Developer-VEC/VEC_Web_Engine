import { useEffect, useState } from "react";
import "./Academicresearch.css";
import Banner from "../../Banner";
import axios from "axios";
import { useNavigate } from "react-router";
import { FaUserEdit } from "react-icons/fa";
import { Send, Trash } from "lucide-react";
import { color } from "framer-motion";

export default function AdminConsultancy({ theme, toggle }) {
  const [acadamicRes, setAcadamicRes] = useState(null);
  const navigate = useNavigate();

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };


  // Admin hooks 
  const [isContentEditable,setIsContentEditable] = useState(true)
  const [isDoneClicked,setIsDoneClicked] = useState(false)

  const [showPopup, setShowPopup] = useState(false);
  const [newYear, setNewYear] = useState("");
  const [newPdf, setNewPdf] = useState("");


  const handleDone = () => {
        setIsDoneClicked(true)
  }

  const handleBackToEdit = () => {
        setIsDoneClicked(false)
  }
  const handleRequestSent = () =>{
        setIsContentEditable(true)
        setIsDoneClicked(false)
  }

  const handleAddNewButton = () => {
    setShowPopup(true)

  }


  const handleDeleteButton = (index) => {
     setAcadamicRes((prev) => prev.filter((_, i) => i !== index));
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("/api/main-backend/research", {
          type: "Consultancy",
        });

        const data = response.data.data;
        setAcadamicRes(data);
      } catch (error) {
        console.error("Error fetching Academic research data", error);
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
        }
      }
    };

    fetchData();
  }, [navigate]);

  const openPdf = (course) => {
    if (!course?.pdf_path || course.pdf_path.trim() === "") return;

    const url = UrlParser(course.pdf_path);
    window.open(url, "_blank"); // Always open in new tab
  };

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/researchbanner.webp"
        headerText="Academic Research"
        subHeaderText="Enrich Your Knowledge"
      />

      <div className="mt-10">

         {isContentEditable && <button className="flex items-center  bg-secd px-3 py-2 z-40 rounded text-text  ml-auto mr-20 my-4"  
            onClick={(e)=>setIsContentEditable(false)}>
                <FaUserEdit className="mr-2"  /> Edit 
          </button>}
        <h1 className="research-academicresearch-title text-brwn dark:text-drkt dark:border-drks">
          Consultancy
        </h1>

        {
          !isContentEditable && isDoneClicked &&  <div className="course-selection-container p-12">
          {acadamicRes?.map((course, index) => (
            <div
              key={index}
              className="px-4 py-3 font-semibold text-center rounded-xl bg-secd hover:bg-accn hover:text-prim dark:hover:bg-brwn cursor-pointer"
              onClick={() => openPdf(course)}
            >
              {course.year}
            </div>
          ))}
        </div>
        }
        {
          !isContentEditable && !isDoneClicked && 
          <div className="course-selection-container p-12">
          {acadamicRes?.map((course, index) => (
            <div className="flex items-center gap-2">
            <div
              key={index}
              className="px-4 py-3 font-semibold text-center rounded-xl bg-secd hover:bg-accn hover:text-prim dark:hover:bg-brwn cursor-pointer"
              onClick={() => openPdf(course)}
              >
              {course.year}

            </div>
            <Trash style={{color:"red",cursor:"pointer"}}  onClick={(e)=>handleDeleteButton(index)} />
            </div>
          ))}
          <button className="px-4 py-3 bg-gray-200 rounded-xl" onClick={(e)=>handleAddNewButton()}>
            Add new 
          </button>
        </div>
        }
      
        {
          isContentEditable &&  <div className="course-selection-container p-12">
          {acadamicRes?.map((course, index) => (
            <div
              key={index}
              className="px-4 py-3 font-semibold text-center rounded-xl bg-secd hover:bg-accn hover:text-prim dark:hover:bg-brwn cursor-pointer"
              onClick={() => openPdf(course)}
            >
              {course.year}
            </div>
          ))}
        </div>
        }
       
          {!isContentEditable && !isDoneClicked &&<button
            className="flex items-center ml-auto mr-20 mb-10 border-4 border-secd hover:bg-gray-300 hover:border-brwn text-text px-3 py-2 rounded-lg"
            onClick={()=>handleDone()}
          >
            <FaUserEdit className="mr-2" /> Done
          </button>}

         { !isContentEditable && isDoneClicked && <div className="flex gap-4 justify-end pr-8 my-8 mr-10">
          <button className="flex items-center bg-secd hover:bg-brwn text-text hover:text-prim px-3 py-2 rounded " onClick={()=>handleBackToEdit()} >
            <FaUserEdit className="mr-2" /> Back to edit 
          </button>
          <button className="flex items-center bg-green-500 text-text hover:text-prim hover:bg-green-600 px-3 py-2 rounded" onClick={()=>handleRequestSent()}   >
           <Send   className="mr-2"/>
           Request     
          </button>
        </div>}

        {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[2147483647]">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4 text-center">Add New Consultancy</h2>

            {/* Year input */}
            <input
              type="text"
              maxLength={9}
              placeholder="Enter Year (e.g., 2024-2027)"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
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
              className="px-4 bg-green-500 text-white py-2 rounded hover:bg-green-600"
              onClick={() => {
                if(!newYear || !newPdf){
                  alert("Submit all the value");
                  return;
                }
                setAcadamicRes((prev) => [...prev, { year: newYear, pdf_path: newPdf }]);
                setShowPopup(false);
                setNewYear("");
                setNewPdf("");
              }}
              >
              Submit
            </button>
            <button className="px-4 bg-secd text-text rounded"
               onClick={() => {
                setAcadamicRes((prev) => [...prev]);
                setShowPopup(false);
                setNewYear("");
                setNewPdf("");
              }}>
              Back
            </button>
            </div>
          </div>
        </div>
      )}

      
      </div>


    </>
  );
}
