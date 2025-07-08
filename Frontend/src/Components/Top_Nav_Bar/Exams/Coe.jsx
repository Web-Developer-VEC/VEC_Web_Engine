import React, { useEffect, useState } from "react";
import Banner from "../../Banner";
import axios from "axios";

const Coe = ({ toggle, theme }) => {

  const [coeData, setCoeData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/coe');
        const data = response.data;
        setCoeData(data);
      } catch (error) {
        console.error("Error fetching coe data", error);
      }
    }

    fetchData();
  }, []);

  return (
    <>
      <Banner toggle={toggle} theme={theme}
        backgroundImage="./Banners/examsbanner.webp"
        headerText="office of controller of examinations"
        subHeaderText="COE"
      />

      <div className="py-10 px-4 md:px-20 bg-prim dark:bg-drkp justify-center">
        {coeData?.map((section, idx) => (
          <div
            key={idx}
            className="bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)] dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] w-full md:w-fit  ml-auto mr-auto shadow-md rounded-lg mb-10 p-6 md:p-10"
          >
            <h2 className="text-2xl font-bold text-[#800000] dark:text-drkt text-center mb-6">
              {section.title}
            </h2>
            {section.members.length > 1 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                {section.members.map((member, index) => (
                  <div
                    key={index}
                    className="flex bg-prim dark:bg-text w-[430px] border-[2px] border-yellow-500 rounded-xl p-4 gap-4 items-start"
                  >
                    <img
                      src={member.image_path}
                      alt={member.name}
                      className="w-[100px] h-[120px] object-cover rounded"
                    />
                    <div>
                      <p className="font-bold text-[16px] text-text dark:text-drkt">{member.name}</p>
                      <p className="text-sm text-brwn dark:text-drka">{member.qualification}</p>
                      <p className="text-sm text-brwn dark:text-drka">{member.position}</p>
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
                      src={member.img}
                      alt={member.name}
                      className="w-[100px] h-[120px] object-cover rounded"
                    />
                    <div className="flex justify-center flex-col">
                      <p className="font-bold text-[16px] text-text dark:text-drkt">{member.name}</p>
                      <p className="text-sm text-brwn dark:text-drka">{member.qualification}</p>
                      <p className="text-sm text-brwn dark:text-drka">{member.position}</p>
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