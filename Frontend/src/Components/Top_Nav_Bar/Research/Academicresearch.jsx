import { useEffect, useState } from "react";
import "./Academicresearch.css";
import Banner from "../../Banner";
import axios from "axios";
import { useNavigate } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

export default function Consultancy({ theme, toggle }) {
  const [acadamicRes, setAcadamicRes] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const navigate = useNavigate();

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

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
  const closeModal = () => {
    setSelectedPdf(null);
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

      <div>
        <h1 className="research-academicresearch-title text-brwn dark:text-drkt dark:border-drks">
          Consultancy
        </h1>

        <div className="course-selection-container p-12">
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
      </div>

      {/* PDF Modal */}
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
