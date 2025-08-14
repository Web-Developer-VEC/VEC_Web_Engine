import { useEffect, useState } from "react";
import "./Academicresearch.css"; // Your existing CSS including .pdf-modal styles
import Banner from "../../Banner";
import axios from "axios";
import "./Funded.css"
import { useNavigate } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

export default function Funded({ theme, toggle }) {
  const [funded, setFunded] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null); // For modal PDF
  const navigate = useNavigate();

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const closeModal = () => {
    setSelectedPdf(null);
  };

    const handlePdfClick = (course) => {
    if (!course?.pdf_path || course.pdf_path.trim() === "") {
      return; 
    }

    const url = UrlParser(course.pdf_path);
    const pdfData = { url, name: course?.year };

    if (window.innerWidth >= 1024) {
      setSelectedPdf(pdfData);
    } else {
      window.open(url, "_blank");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("/api/main-backend/research", {
          type: "Funded Projects",
        });

        const data = response.data.data;
        setFunded(data);
      } catch (error) {
        console.error("Error fetching Funded data", error);
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
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/researchbanner.webp"
        headerText="Academic Research"
        subHeaderText="Enrich Your Knowledge"
      />

      <div className="">
        <h1 className="research-academicresearch-title text-brwn dark:text-drkt dark:border-drks">
          Funded Projects
        </h1>

        <div className="course-selection-container p-12">
          {funded?.map((course, index) => {
            const pdfUrl = course?.pdf_path ? UrlParser(course?.pdf_path) : '#';
            return (
              <div
                key={index}
                className="px-4 py-3 font-semibold text-center rounded-xl bg-secd hover:bg-accn hover:text-prim dark:hover:bg-brwn cursor-pointer"
                onClick={() => handlePdfClick(course)}
              >
                {course?.year}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
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
}
