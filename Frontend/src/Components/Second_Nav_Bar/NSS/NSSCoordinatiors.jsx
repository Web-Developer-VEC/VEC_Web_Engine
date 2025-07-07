import React from "react";
import "./NSSCoordinators.css"; // Import the CSS file
import LoadComp from "../../LoadComp";

const Coordinators = ({ faculty, students }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000/";

  const parseUrl = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  return (
    <>
      {faculty && students ? (

    <div className="p-6 bg-white">
  {/* Faculty Coordinator */}
  <h2 className="text-1xl md:text-3xl font-bold text-center text-brwn capitalize mb-4">
    FACULTY COORDINATOR
    <div className="w-[360px] h-0.5 bg-[#eab308] mx-auto mt-1 rounded"></div>
  </h2>

  {faculty && (
    <div className="flex flex-col md:flex-row items-center gap-6 bg-gray-20 rounded-xl shadow-md p-6 mb-10 w-[500px] mx-auto">
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
        <p className="text-sm text-gray-600">{faculty.designation}</p>

        {faculty.message && faculty.message.trim() !== "" && (
          <p className="mt-2 text-sm text-gray-700 max-w-2xl">
            {faculty.message}
          </p>
        )}
      </div>
    </div>
  )}

      {/* Student Coordinators */}
      <h2 className="text-xl md:text-2xl font-bold text-center text-brwn uppercase mb-4">
        STUDENT COORDINATORS
        <div className="w-[300px] h-0.5 bg-[#eab308] mx-auto mt-1 rounded"></div>
      </h2>

      {students?.name?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-6">
          {students.name.map((memberName, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-xl p-4 flex flex-col items-center text-center"
            >
              <img
                src={parseUrl(students.image_path[index])}
                alt={memberName}
                className="w-24 h-24 border rounded object-cover mb-3"
              />
              <h3 className="text-lg font-semibold">{memberName}</h3>
              <span className="text-sm text-gray-500">{students.designation[index]}</span>
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



// const Coordinators = ({faculty, students}) => {

//   const BASE_URL = process.env.REACT_APP_BASE_URL;

//   const UrlParser = (path) => {
//     return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
//   };
//   return (
//     <div className="NSS-coordinators-section">
//       <h2 className="NSS-section-heading">COORDINATORS</h2>

//       {/* Staff Coordinator (Centered) */}
//       <div className="NSS-staff-container">
//       <div className="NSS-id-card-staff">
//         <img
//           src={UrlParser(faculty?.image_path)}
//           alt="Staff Coordinator"
//           className="NSS-profile-pic-staff"
//         />
//         <div className="NSS-text-container">
//           <h4 className="NSS-name-staff">{faculty?.name}</h4>
//           <p className="NSS-role-staff">{faculty?.designation}</p>
//           <p className="NSS-staff-msg">{faculty?.msg}This is NSS This is NSS This is NSS This is NSS This is NSS This is NSS This is NSS This is NSS This is NSS This is NSS </p>
//       </div>
//       </div>
// </div>


//       {/* Student Coordinators */}
//       <h3 className="NSS-subheading">Student Coordinators</h3>
//       <div className="NSS-student-coordinators">
//         {students?.name?.map((name, index) => (
//           <div key={index} className="NSS-id-card">
//             <img src={UrlParser(students?.image_path[index])} alt={name} className="NSS-profile-pic" />
//             <h4 className="NSS-name">{name}</h4>
//             <p className="NSS-rank">RANK</p>
//             <p className="regement-no">Regement number</p>
//             <p className="NSS-role">{students?.designation[index]}</p>
//             <p className="register-no&depr">113223000000/AI&DS</p>
//             {/* <div className="NSS-social-icons">
//               <a href={"#"} className="NSS-social-link">
//                 <i className="fab fa-facebook"></i>
//               </a>
//               <a href={"#"} className="NSS-social-link">
//                 <i className="fab fa-instagram"></i>
//               </a>
//               <a href={"#"} className="NSS-social-link">
//                 <i className="fab fa-linkedin"></i>
//               </a>
//             </div> */}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };


