import React, { useEffect, useState } from "react";
import {useNavigate} from 'react-router-dom';
import axios from "axios";
import "./Dean.css";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";

const data = [
  {
    heading: "Academics",
  },
  {
    heading: "Planning and Development",
  },
  {
    heading: "Student Development and Welfare",
  },
  {
    heading: "Faculty Development and Welfare",
  },
  {
    heading: "Research and Development",
  },
  {
    heading: "Accreditations and Ranking",
  },
  {
    heading: "Corporate Relations and Higher Studies",
  },
];

const Dean = ({theme, toggle}) => {
  
  const [deanData, setDeanData] = useState([]);
  const [loading ,setloading] = useState(true);
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);


  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
  return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`/api/main-backend/administration`,
          {
            type: "dean_and_association"
          }
        );

        setDeanData(response.data.data);
        setloading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
         if (error.response.data.status === 429) {
          navigate('/ratelimit', { state: { msg: error.response.data.message}})
        } 
        setloading(true);
      } 
    };
    fetchData();
  },[]);


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

  return (
    <>
    <Banner toggle={toggle} theme={theme}
    backgroundImage="./Banners/administrationbanner.webp"
    headerText="Deans & Associate Deans"
    subHeaderText="Shaping the future through leadership, collaboration, and academic excellence."
  />
    {loading ? (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={""} />
      </div>
    ) : (
      <div className="deancontainer">
        <div className="de-container font-[poppins]">
          {data.map((section, index) => {
            const responsibleDean = deanData.find(
              (dean) => dean.Position === section.heading
            );

            return (
              <div className="de-box min-w-[20vw] bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)] dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]" key={index}>
                <h1 className="de-heading text-accn dark:text-drkt font-[poppins]">{section.heading}</h1>
                <div className="de-content">
                  {/* Profiles Section */}
                  {(responsibleDean?.Dean || responsibleDean?.Associate_Dean) && (
                    <div className="de-profiles-section flex flex-wrap lg:flex-nowrap justify-center gap-4 w-full font-[poppins]">
                      {/* Dean Profile */}
                      {responsibleDean?.Dean && (
                        <div className="font-[poppins] de-profile bg-prim dark:bg-drkp w-full lg:w-[26vw] border-2 border-secd dark:border-drks"
                        //  onClick={() => navigate(`/facultyprofile/${responsibleDean?.Dean_unique_id}`)}
                         >
                          <img
                            src={UrlParser(responsibleDean.Dean_Image)} 
                            alt={responsibleDean.Dean}
                          />
                          <div className="de-profile-details font-[poppins]">
                            <strong>{responsibleDean.Dean}</strong>
                            <br />
                            <span>{responsibleDean.Dean_Type}</span><br />
                            <span className="text-text dark:text-drka">{responsibleDean.Dean_Designation}</span>
                          </div>
                        </div>
                      )}

                      {/* Associate Dean Profile */}
                      {responsibleDean?.Associate_Dean && (
                        <div className="de-profile bg-prim dark:bg-drkp w-full lg:w-[26vw] border-2 border-secd dark:border-drks" 
                        // onClick={() => navigate(`/facultyprofile/${responsibleDean?.Associate_dean_unique_id}`)}
                        >
                          <img
                            src={UrlParser(responsibleDean.Associate_Dean_Image)}
                            alt={responsibleDean.Associate_Dean}
                          />
                          <div className="de-profile-details">
                            <strong>{responsibleDean.Associate_Dean}</strong>
                            <br />
                            <span>{responsibleDean.Ass_Dean_Type}</span><br />
                            <span className="text-text dark:text-drka">{responsibleDean.Associate_Dean_Designation}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )}
    </>
  );
};

export default Dean;