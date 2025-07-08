import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { faEye, faDownload, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Forms.css";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";

const Forms = ({theme, toggle}) => {
  const studentTailRef = useRef(null);
  const [studentResources, setStudentResources] = useState([]);
  const [facultyResources, setFacultyResources] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState(null); // State for modal
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
  return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/allforms`);
        const data = response.data[0]; // Assuming API returns an array with one object

        if (data) {
          const students = data.students[0];
          const faculty = data.faculty[0];

          const formattedStudentResources = students.name.map((name, index) => ({
            name,
            url: UrlParser(students.link[index] || "#"),
            download: students.link[index] // Default to "#" if no link is provided
          }));

          const formattedFacultyResources = faculty.name.map((name, index) => ({
            name,
            url: UrlParser(faculty.link[index] || "#"),
            download: faculty.link[index]
          }));

          setStudentResources(formattedStudentResources);
          setFacultyResources(formattedFacultyResources);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setLoading(true);
      }
    };

    fetchData();
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

if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
}

  const handleViewClick = (pdfUrl, name) => {
    setSelectedPdf({ url: pdfUrl, name });
  };

  const closeModal = () => {
    setSelectedPdf(null);
  };

  const renderResourceLinks = (resources) => {
    return resources.map((resource, index) => (
      <div key={index} className="resource-item dark:bg-drkts">
        <center>
          <div className="form-content dark:bg-drkts">
            <div className="form-regulation bg-[#f8f9fa] dark:bg-black">
              <span className="text-text dark:text-drkt">{resource.name}</span>
              <div className="form-buttons">
                <button
                  className="form-button view-button bg-secd text-text dark:bg-drks dark:text-drkt
                    hover:bg-accn hover:text-prim dark:hover:bg-drka"
                  onClick={() => handleViewClick(resource.url, resource.name)}
                >
                  <FontAwesomeIcon icon={faEye} style={{ marginRight: "5px" }} />
                  
                </button>
                <a
                  className="form-button download-button bg-secd text-text dark:bg-drks dark:text-drkt
                    hover:bg-accn hover:text-prim dark:hover:bg-drka"
                  href={resource.download}
                  download={resource.name} // Ensures file downloads instead of opening
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FontAwesomeIcon icon={faDownload} style={{ marginRight: "5px" }} />
                 
                </a>
              </div>
            </div>
          </div>

        </center>
      </div>
    ));
  };

  return (
    <>
      <Banner toggle={toggle} theme={theme}
        backgroundImage="./Banners/examsbanner.webp"
        headerText="Downloads"
        subHeaderText="Streamlining processes with easy access to forms, empowering smooth academic and administrative workflows."
      />

    {isLoading ? (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={""} />
      </div>
    ) : (
      <div className="tails-container ">
        <div className="tail student-tail dark:bg-black" ref={studentTailRef}>
          <div className="tail-content flex flex-col h-full">
            <h2 className="font-bold mb-2 text-brwn dark:text-drkt">Student Resources</h2>
            <div className="flex-grow overflow-y-auto overflow-x-hidden pr-2 h-full dark:bg-drkts">
              {renderResourceLinks(studentResources)}
            </div>
          </div>
        </div>

        <div className="tail faculty-tail dark:bg-black">
          <div className="tail-content flex flex-col h-full relative">
            <h2 className="font-bold mb-2  z-10 sticky top-0 block sm:static">
              Faculty Resources
            </h2>
            <div className="download-links-container overflow-y-auto overflow-x-hidden dark:bg-drkts">
              {renderResourceLinks(facultyResources)}
            </div>
          </div>
        </div>
      </div>
    )}

      {selectedPdf && (
        <div className="pdf-modal">
          <div className="pdf-modal-content">
            <button className="pdf-close-button" onClick={closeModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2>{selectedPdf.name}</h2>
            <iframe
              src={selectedPdf.url}
              title={selectedPdf.name}
              className="pdf-iframe"
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
};

export default Forms;
