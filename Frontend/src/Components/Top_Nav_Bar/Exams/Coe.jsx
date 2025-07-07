import React from "react";
import Banner from "../../Banner";

const sections = [
  {
    title: "Exam cell",
    members: [
      {
        name: "Dr. A. Coe",
        title: "Coe",
        position: "Prof and Head - Civil Engineering",
        img: "/images/Coer.jpg",
      },
    ],
  },
  {
    title: "Planning Q-Paper",
    members: [
      {
        name: "Dr. Coe",
        title: "Coe",
        position: "Prof and Head - Information Technology",
        img: "/images/Coe.jpg",
      },
    ],
  },
  {
    title: "Develope Q-Paper",
    members: [
      {
        name: "Dr. Coe",
        title: "Coe",
        position: "Prof and Head - Information Technology",
        img: "/images/Coe.jpg",
      },
      {
        name: "Dr. S. Coe",
        title: "Associate Coe",
        position: "Asst Prof and Head - Cyber Security",
        img: "/images/Coe.jpg",
      },
      {
        name: "Dr. Coe",
        title: "Coe",
        position: "Prof and Head - Information Technology",
        img: "/images/Coe.jpg",
      },
      {
        name: "Dr. S. Coe",
        title: "Associate Coe",
        position: "Asst Prof and Head - Cyber Security",
        img: "/images/Coe.jpg",
      },
      {
        name: "Dr. Coe",
        title: "Coe",
        position: "Prof and Head - Information Technology",
        img: "/images/Coe.jpg",
      },
      {
        name: "Dr. S. Coe",
        title: "Associate Coe",
        position: "Asst Prof and Head - Cyber Security",
        img: "/images/Coe.jpg",
      },
    ],
  },
];

const Coe = ({ toggle, theme }) => {
  return (
    <>
      <Banner toggle={toggle} theme={theme}
        backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
        headerText="Controller Of Exam"
        subHeaderText="COE"
      />

      <div className="py-10 px-4 md:px-20 bg-gray-50 justify-center">
        {sections.map((section, idx) => (
          <div
            key={idx}
            className="bg-gray-200 w-full md:w-fit  ml-auto mr-auto shadow-md rounded-lg mb-10 p-6 md:p-10"
          >
            <h2 className="text-2xl font-bold text-[#800000] text-center mb-6">
              {section.title}
            </h2>
            {section.members.length > 1 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-center">
                {section.members.map((member, index) => (
                  <div
                    key={index}
                    className="flex bg-white border-[2px] border-yellow-500 rounded-xl p-4 w-[320px] gap-4 items-start"
                  >
                    <img
                      src={member.img}
                      alt={member.name}
                      className="w-[100px] h-[120px] object-cover rounded"
                    />
                    <div>
                      <p className="font-bold text-[17px] text-[#222]">{member.name}</p>
                      <p className="text-sm text-gray-800">{member.title}</p>
                      <p className="text-sm text-gray-800">{member.position}</p>
                    </div>
                  </div>
                ))}
              </div>
              
            ) : (
              <div className="flex gap-6 justify-center">
                {section.members.map((member, index) => (
                  <div
                    key={index}
                    className="flex bg-white border-[2px] border-yellow-500 rounded-xl p-4 w-[320px] gap-4 items-start"
                  >
                    <img
                      src={member.img}
                      alt={member.name}
                      className="w-[100px] h-[120px] object-cover rounded"
                    />
                    <div>
                      <p className="font-bold text-[17px] text-[#222]">{member.name}</p>
                      <p className="text-sm text-gray-800">{member.title}</p>
                      <p className="text-sm text-gray-800">{member.position}</p>
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