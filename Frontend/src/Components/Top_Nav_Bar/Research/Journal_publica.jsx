import { useEffect, useState } from "react";
import "./Academicresearch.css";
import Banner from "../../Banner";
import axios from "axios";
import { useNavigate } from "react-router";


export default function Journal({ theme, toggle }) {
  const [journal,setJournal] = useState(null);
    const navigate = useNavigate();


  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post('/api/main-backend/research',
          {
            type: "Journal Publication"
          }
        )

        const data = response.data.data;

        setJournal(data);
      } catch (error) {
        console.error("Error fetchong Data",error);
         if (error.response.data.status === 429) {
          navigate('/ratelimit', { state: { msg: error.response.data.message}})
        } 
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
          <h1 className="research-academicresearch-title text-4xl  text-brwn dark:text-drkt dark:border-drks">
            Journal Publications 
          </h1>

          <div className="course-selection-container p-12">
            {journal?.map((course) => (
            
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
