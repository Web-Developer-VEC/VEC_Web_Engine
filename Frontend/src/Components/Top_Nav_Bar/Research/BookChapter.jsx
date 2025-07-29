import { useEffect, useState } from "react";
import "./Academicresearch.css";
import Banner from "../../Banner";
import axios from "axios";

export default function BookChapter({ theme, toggle }) {
  const [bookChapter, setBookChapter] = useState(null);

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post('/api/main-backend/research',
          {
            type: "Books and Book chapters"
          }
        )

        const data = response.data.data;

        setBookChapter(data)
      } catch (error) {
        console.error('Error fetching Books data',error);
      }
    }
    fetchData();
  }, [])

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
           Books and Book chapters
          </h1>

          <div className="course-selection-container p-12">
            {bookChapter?.map((course) => (
            
                 <div
                   
                    className={`px-4 py-3 font-semibold text-center rounded-xl bg-secd hover:bg-accn hover:text-prim dark:hover:bg-brwn`}
                    onClick={() => {
                      const url = course?.pdf_path;
                      if (url) {
                        window.open(UrlParser(url), "_blank");
                      }
                    }}
                  >
                   {course?.year}
                  </div>
          
            ))}
          </div>
        </div>

    </>
  );
}
