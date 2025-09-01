import React from "react";
import "./NSSCoordinators.css";
import LoadComp from "../../LoadComp";

const Coordinators = ({data}) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const parseUrl = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };
  let stud = [];
  let coor = null;
 if (Array.isArray(data) && data.length >= 2) {
  coor = data[0]?.members?.[0] || null;
  stud = Array.isArray(data[1]?.members) ? data[1].members : [];
}
  return (
    <>
      {stud?.length > 0 && coor ? (
        <div className="p-6">
          {/* Faculty Coordinator */}
          <h2 className="text-lg md:text-3xl font-bold text-center text-brwn dark:text-drkt capitalize mb-1">
            FACULTY COORDINATOR
          </h2>


          <div className="nss-member-card-1 dark:bg-text flex flex-col md:flex-row items-center gap-6 mt-4">
            <div className="flex-shrink-0">
              <img
                src={parseUrl(coor?.image_path)}
                alt={coor?.name}
                className="w-32 h-32 rounded border object-cover"
              />
            </div>

            <div className="text-center md:text-left ">
              <h3 className="text-text dark:text-drkt text-xl font-semibold">
                {coor?.name}
              </h3>
              <p className="text- center text-sm text-brwn dark:text-drka">
                {coor?.designation}
              </p>
            </div>
          </div>

          {/* Student Coordinators */}
          <h2 className="text-xl md:text-2xl font-bold text-center text-brwn dark:text-drkt uppercase mb-1">
            STUDENT COORDINATORS
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-6">
            {stud?.map((member, index) => (
              <div
                key={index}
                className="dark:bg-text shadow-md rounded-xl p-4 flex flex-col items-center text-center"
              >
                <img
                  src={parseUrl(member?.image_path)}
                  alt={member?.name}
                  className="w-24 h-24 border rounded object-cover mb-3"
                />
                <h3 className="text-lg font-semibold">{member?.name}</h3>
                <span className="text-sm text-brwn dark:text-drka">
                  {member?.designation}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp />
        </div>
      )}
    </>
  );
};

export default Coordinators;
