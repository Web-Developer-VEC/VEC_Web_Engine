import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { faEye, faDownload, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Forms.css";
import Banner from "../../Banner";

const Forms = ({theme, toggle}) => {
  const studentTailRef = useRef(null);
  const [studentResources, setStudentResources] = useState([]);
  const [facultyResources, setFacultyResources] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState(null); // State for modal

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
            url: students.link[index] || "#", // Default to "#" if no link is provided
          }));

          const formattedFacultyResources = faculty.name.map((name, index) => ({
            name,
            url: faculty.link[index] || "#",
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

  const handleViewClick = (pdfUrl, name) => {
    setSelectedPdf({ url: pdfUrl, name });
  };

  const closeModal = () => {
    setSelectedPdf(null);
  };

  const renderResourceLinks = (resources) => {
    return resources.map((resource, index) => (
      <div key={index} className="resource-item">
          <a
            className="view-button"
            onClick={() => handleViewClick(resource.url, resource.name)}
          >
            {resource.name}
          </a>
      </div>
    ));
  };

  return (
    <>
      <Banner toggle={toggle} theme={theme}
        backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
        headerText="All Forms"
        subHeaderText="Streamlining processes with easy access to forms, empowering smooth academic and administrative workflows."
      />

      <div className="tails-container">
        <div className="tail student-tail" ref={studentTailRef}>
          <div className="tail-content">
            <h2>Student Resources</h2>
            <div className="download-links-container">
              {isLoading ? (
                <div className="loading-screen">
                  <div className="spinner"></div>
                  Loading...
                </div>
              ) : (
                renderResourceLinks(studentResources)
              )}
            </div>
          </div>
        </div>

        <div className="tail faculty-tail">
          <div className="tail-content">
            <h2>Faculty Resources</h2>
            <div className="download-links-container">
              {isLoading ? (
                <div className="loading-screen">
                  <div className="spinner"></div>
                  Loading...
                </div>
              ) : (
                renderResourceLinks(facultyResources)
              )}
            </div>
          </div>
        </div>
      </div>

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
