import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Forms.css";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router";

const Forms = ({ theme, toggle }) => {
  const studentTailRef = useRef(null);
  const [studentResources, setStudentResources] = useState([]);
  const [facultyResources, setFacultyResources] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  // ✅ Fetch API Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const response = await axios.post(`/api/main-backend/exam`, {
          type: "all_forms",
        });

        const data = response?.data?.data?.[0];

        if (data) {
          const students = data?.students?.[0] || { name: [], link: [] };
          const faculty = data?.faculty?.[0] || { name: [], link: [] };

          const formattedStudentResources = (students.name || []).map(
            (name, index) => ({
              name,
              url: UrlParser(students.link?.[index] || "#"),
            })
          );

          const formattedFacultyResources = (faculty.name || []).map(
            (name, index) => ({
              name,
              url: UrlParser(faculty.link?.[index] || "#"),
            })
          );

          setStudentResources(formattedStudentResources);
          setFacultyResources(formattedFacultyResources);
        }
      } catch (error) {
        console.error("Error fetching data:", error);

        if (error?.response?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
          return;
        }

        setErrorMsg("Failed to load resources. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // ✅ Online/Offline Handling
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

  // ✅ Handle Offline
  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt="You are offline" />
      </div>
    );
  }

  // ✅ Handle PDF open in new tab
  const handleViewClick = (pdfUrl) => {
    if (!pdfUrl || pdfUrl === "#") return;
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  // ✅ Render Each Resource
  const renderResourceLinks = (resources) =>
    resources.length > 0 ? (
      resources.map((resource, index) => (
        <div
          key={index}
          className="resource-item dark:bg-drkts font-[Poppins]"
        >
          <div className="form-content dark:bg-drkts">
            <div className="form-regulation bg-[#f8f9fa] dark:bg-black">
              <div className="w-[65%]">
                <p className="text-text dark:text-drkt break-words whitespace-normal sm:text-left text-center text-sm">
                  {resource.name || "Untitled Document"}
                </p>
              </div>
              <div className="form-buttons">
                <button
                  className="form-button view-button bg-secd text-text dark:bg-drks dark:text-drkt
                    hover:bg-accn hover:text-prim dark:hover:bg-drka"
                  onClick={() => handleViewClick(resource.url)}
                >
                  <FontAwesomeIcon icon={faEye} style={{ marginRight: "5px" }} />
                  View
                </button>
              </div>
            </div>
          </div>
        </div>
      ))
    ) : (
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        No resources available
      </p>
    );

  return (
    <>
      {/* Banner Section */}
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/examsbanner.webp"
        headerText="Downloads"
        subHeaderText="Streamlining processes with easy access to forms, empowering smooth academic and administrative workflows."
      />

      {/* Loading / Error */}
      {isLoading ? (
        <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
          <LoadComp txt="Loading resources..." />
        </div>
      ) : errorMsg ? (
        <div className="h-screen flex items-center justify-center text-red-600 dark:text-red-400 font-semibold">
          {errorMsg}
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-8 px-4 py-2 sm:py-4">
          {/* Student Resources */}
          <div
            className="tail student-tail dark:bg-black"
            ref={studentTailRef}
          >
            <div className="tail-content flex flex-col h-full">
              <h2 className="font-[24px] font-bold mb-2 text-brwn dark:text-drkt">
                Student Resources
              </h2>
              <div className="flex-grow overflow-y-auto overflow-x-hidden pr-2 h-full dark:bg-drkts">
                {renderResourceLinks(studentResources)}
              </div>
            </div>
          </div>

          {/* Faculty Resources */}
          <div className="tail faculty-tail dark:bg-black">
            <div className="tail-content flex flex-col h-full relative">
              <h2 className="font-bold mb-2 z-10 sticky top-0 block sm:static text-brwn dark:text-drkt">
                Faculty Resources
              </h2>
              <div className="download-links-container overflow-y-auto overflow-x-hidden dark:bg-drkts">
                {renderResourceLinks(facultyResources)}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Forms;
