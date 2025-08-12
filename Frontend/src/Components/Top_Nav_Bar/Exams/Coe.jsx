import React, { useEffect, useState } from "react";
import Banner from "../../Banner";
import axios from "axios";
import { useNavigate } from "react-router";

const Coe = ({ toggle, theme }) => {
  const [coeData, setCoeData] = useState(null);
  const navigate = useNavigate();

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("/api/main-backend/exam", {
          type: "COE",
        });
        const data = response.data.data;
        setCoeData(data);
      } catch (error) {
        console.error("Error fetching coe data", error);
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
        }
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/examsbanner.webp"
        headerText="office of controller of examinations"
        subHeaderText="COE"
      />

      <div className="py-10 px-4 md:px-20 bg-prim dark:bg-drkp justify-center font-[Poppins]">

        {/* --- 🟥 First box (COE) --- */}
        {coeData && coeData.length > 0 && (
          <div
            className="bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)] dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] w-full md:w-fit ml-auto mr-auto shadow-md rounded-lg mb-10 p-6 md:p-10"
          >
            <h2 className="text-2xl font-bold text-[#800000] dark:text-drkt text-center mb-6">
              {coeData[0].title}
            </h2>
            {coeData[0].members.map((member, index) => (
              <div
                key={index}
                className="flex bg-prim dark:bg-text w-[430px] border-[2px] border-yellow-500 rounded-xl p-4 gap-4 items-start mx-auto"
              >
                <img
                  src={UrlParser(member.image_path)}
                  alt={member.name}
                  className="w-[100px] h-[120px] object-cover rounded"
                />
                <div className="flex flex-col justify-center">
                  <p className="font-bold text-sm md:text-[18px] text-text dark:text-drkt">
                    {member.name}
                  </p>
                  <p className="text-sm text-brwn dark:text-drka">
                    {member.qualification}
                  </p>
                  <p className="text-sm text-brwn dark:text-drka">
                    {member.position}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {coeData && coeData.length > 2 && (
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {coeData.slice(1, 3).map((section, idx) => (
              <div
                key={idx}
                className="bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)] dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] w-full md:w-[48%] max-w-[520px] shadow-md rounded-lg p-6 md:p-8"
              >
                <h2 className="text-xl font-bold text-[#800000] dark:text-drkt text-center mb-4 whitespace-nowrap">
                  {section.title}
                </h2>
                {section.members.map((member, index) => (
                  <div
                    key={index}
                    className="flex bg-prim dark:bg-text border-2 border-yellow-500 rounded-xl p-4 gap-4 items-start"
                  >
                    <img
                      src={UrlParser(member.image_path)}
                      alt={member.name}
                      className="w-[100px] h-[120px] object-cover rounded"
                    />
                    <div className="flex flex-col justify-center">
                      <p className="font-bold text-sm md:text-[18px] text-text dark:text-drkt">
                        {member.name}
                      </p>
                      <p className="text-sm text-brwn dark:text-drka">
                        {member.qualification}
                      </p>
                      <p className="text-sm text-brwn dark:text-drka">
                        {member.position}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {coeData?.slice(3).map((section, idx) => (
          <div
            key={idx}
            className="bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)] dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] w-full md:w-fit ml-auto mr-auto shadow-md rounded-lg mb-10 p-6 md:p-10"
          >
            <h2 className="text-2xl font-bold text-[#800000] dark:text-drkt text-center mb-6">
              {section.title}
            </h2>
            {section.members.length > 1 ? (
              <div className="flex flex-wrap justify-center gap-4 md:gap-6 px-2 md:px-0">
                {section.members.map((member, index) => (
                  <div
                    key={index}
                    className="flex flex-row items-start bg-prim dark:bg-text w-full sm:w-[90%] md:w-[45%] lg:w-[430px] border-2 border-yellow-500 rounded-xl p-3 sm:p-4 gap-3"
                  >
                    <img
                      src={UrlParser(member.image_path)}
                      alt={member.name}
                      className="w-[80px] h-[100px] object-cover rounded"
                    />
                    <div>
                      <p className="font-bold text-[15px] sm:text-[16px] md:text-[18px] text-text dark:text-drkt">
                        {member.name}
                      </p>
                      <p className="text-sm text-brwn dark:text-drka">
                        {member.qualification}
                      </p>
                      <p className="text-sm text-brwn dark:text-drka">
                        {member.position}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-6 justify-center">
                {section.members.map((member, index) => (
                  <div
                    key={index}
                    className="flex bg-prim dark:bg-text w-[430px] border-[2px] border-yellow-500 rounded-xl p-4 gap-4 items-start"
                  >
                    <img
                      src={UrlParser(member.image_path)}
                      alt={member.name}
                      className="w-[100px] h-[120px] object-cover rounded"
                    />
                    <div className="flex justify-center flex-col">
                      <p className="font-bold text-sm md:text-[18px] text-text dark:text-drkt">
                        {member.name}
                      </p>
                      <p className="text-sm text-brwn dark:text-drka">
                        {member.qualification}
                      </p>
                      <p className="text-sm text-brwn dark:text-drka">
                        {member.position}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default Coe;
