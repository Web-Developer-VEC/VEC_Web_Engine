import { useEffect, useState } from "react";
import "./Academicresearch.css";
import Banner from "../../Banner";
import axios from "axios";
import "./Journal_publica.css"
import { useNavigate } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

export default function Journal({ theme, toggle }) {
  const [journal, setJournal] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const navigate = useNavigate();

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const closeModal = () => {
    setSelectedPdf(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("/api/main-backend/research", {
          type: "Journal Publication",
        });

        const data = response.data.data;
        setJournal(data);
      } catch (error) {
        console.error("Error fetching Data", error);
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
        }
      }
    };
    fetchData();
  }, []);

  const handlePdfClick = (course) => {
    const url = UrlParser(course?.pdf_path);
    if (!url) return;

    // Check screen size — if desktop, open modal; else open in new tab
    if (window.innerWidth >= 1024) {
      setSelectedPdf({
        name: course?.year || "PDF Document",
        url: url,
      });
    } else {
      window.open(url, "_blank");
    }
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
        <h1 className="research-academicresearch-title text-4xl text-brwn dark:text-drkt dark:border-drks">
          Journal Publications
        </h1>

        <div className="course-selection-container p-12">
          {journal?.map((course, index) => (
            <div
              key={index}
              className="px-4 py-3 font-semibold text-center rounded-xl bg-secd hover:bg-accn hover:text-prim dark:hover:bg-brwn cursor-pointer"
              onClick={() => handlePdfClick(course)}
            >
              {course?.year}
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
