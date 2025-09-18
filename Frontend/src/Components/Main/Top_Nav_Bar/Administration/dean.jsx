import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import "./Dean.css";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";

const Dean = ({ theme, toggle }) => {
  const [deanData, setDeanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`/api/main-backend/administration`, {
          type: "dean_and_association"
        });

        setDeanData(response.data.data); // API already returns categories
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        if (error.response?.data?.status === 429) {
          navigate('/ratelimit', { state: { msg: error.response.data.message } });
        }
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

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
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
            {deanData.map((categoryBlock, index) => (
              <div
                key={index}
                className="de-box min-w-[20vw] bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)] dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]"
              >
                {/* Category Heading */}
                <h1 className="de-heading text-accn dark:text-drkt font-[poppins]">
                  {categoryBlock.category}
                </h1>

                {/* Profiles Section */}
                <div className="de-content">
                  {categoryBlock.members?.length > 0 && (
                    <div className="de-profiles-section flex flex-wrap lg:flex-nowrap justify-center gap-4 w-full font-[poppins]">
                      {categoryBlock.members.map((member, i) => (
                        <div
                          key={i}
                          className="font-[poppins] de-profile bg-prim dark:bg-drkp w-full lg:w-[26vw] border-2 border-secd dark:border-drks"
                          // onClick={() => navigate(`/facultyprofile/${member.unique_id}`)}
                        >
                          <img
                            src={UrlParser(member.image_path)}
                            alt={member.name}
                          />
                          <div className="de-profile-details font-[poppins]">
                            <strong>{member.name}</strong>
                            <br />
                            <span>{member.type}</span>
                            <br />
                            <span className="text-text dark:text-drka">
                              {member.designation}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Dean;