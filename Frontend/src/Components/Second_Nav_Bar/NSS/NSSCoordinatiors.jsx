import React from "react";
import "./NSSCoordinators.css"; // Import the CSS file
import LoadComp from "../../LoadComp";

const Coordinators = ({ faculty, students }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const parseUrl = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  return (
    <>
      {faculty && students ? (

      <div className="p-6">
        {/* Faculty Coordinator */}
        <h2 className="text-1xl md:text-3xl font-bold text-center text-brwn dark:text-drkt capitalize mb-4">
          FACULTY COORDINATOR
          <div className="w-[360px] h-0.5 bg-[#eab308] mx-auto mt-1 rounded"></div>
        </h2>

        {faculty && (
          <div className="flex flex-col md:flex-row items-center gap-6 bg-gray-20 rounded-xl shadow-md p-6 mb-10 w-[500px] mx-auto dark:bg-text">
            {/* Image */}
            <div className="flex-shrink-0">
              <img
                src={parseUrl(faculty.image_path)}
                alt={faculty.name}
                className="w-32 h-32 rounded border object-cover "
              />
            </div>

            {/* Details */}
            <div className="text-center md:text-left">
              <h3 className="text-xl">{faculty.name}</h3>
              <p className="text-sm text-brwn dark:text-drka">{faculty.designation}</p>
            </div>
          </div>
        )}

        {/* Student Coordinators */}
        <h2 className="text-xl md:text-2xl font-bold text-center text-brwn dark:text-drkt uppercase mb-4">
          STUDENT COORDINATORS
          <div className="w-[300px] h-0.5 bg-[#eab308] mx-auto mt-1 rounded"></div>
        </h2>

        {students?.name?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-6">
            {students.name.map((memberName, index) => (
              <div
                key={index}
                className="dark:bg-text shadow-md rounded-xl p-4 flex flex-col items-center text-center"
              >
                <img
                  src={parseUrl(students.image_path[index])}
                  alt={memberName}
                  className="w-24 h-24 border rounded object-cover mb-3"
                />
                <h3 className="text-lg font-semibold">{memberName}</h3>
                <span className="text-sm text-brwn dark:text-drka">{students.designation[index]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
        ) : (
          <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
            <LoadComp />
          </div>
        )}
    </>
  );
};

export default Coordinators;