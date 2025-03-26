import React from "react";
import "./NSSCoordinators.css"; // Import the CSS file

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

const Coordinators = () => {

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const studentCoordinators1 = [
    {
      id: 1,
      role: "Assitant",
      image: "",
      name: "Ajay",
      department: "AI&DS",
      year: 2
    },
    {
      id: 2,
      role: "Assitant",
      image: "",
      name: "Ajith",
      department: "AI&DS",
      year: 2
    },
    {
      id: 3,
      role: "Assitant",
      image: "",
      name: "Sudha",
      department: "AI&DS",
      year: 2
    },
    {
      id: 4,
      role: "Assitant",
      image: "",
      name: "Sri",
      department: "AI&DS",
      year: 2
    }
  ]

  return (
    
    <div className="yrc-coordinators-container">
      <h2 className="yrc-h2">
        FACULTY COORDINATOR
        <div className="yrc-underline2"></div>
      </h2>
      
      <div className="yrc-member-card-1">
        <img
          src="https://www.shutterstock.com/image-vector/man-character-face-avatar-glasses-600nw-542759665.jpg"
          alt="Officer"
          className="yrc-member-image1"
        />

        <div className="yrc-member-info1">
          {/* <span className="yrc-platoon">Programme Officer</span> */}
          <h3>Ramesh Kumar V</h3>
          <p className="yrc-title">Bachelor of Education</p>
          <p className="yrc-degree">
          The Programme Officer for the Youth Red Cross (YRC) is responsible for planning, coordinating, and implementing various YRC activities and initiatives. The role involves engaging with youth volunteers, organizing training sessions, promoting humanitarian values, and ensuring the smooth execution of YRC programs.
          </p>
        </div>
      </div>

      
      {/* {staffCoordinator && (
        <div className="yrc-member-card">
          <img
            src={UrlParser(staffCoordinator.image_path)}
            alt={staffCoordinator.name}
            className="yrc-member-image1"
          />
          <div className="yrc-member-info2">
            <span className="yrc-platoon">Faculty Coordinator</span>
            <h3>{staffCoordinator.name}</h3>
            <p className="yrc-title">{staffCoordinator.designation}</p>
          </div>
        </div>
      )} */}

      <h2 className="yrc-h3">
        STUDENT COORDINATORS
        <div className="yrc-underline3"></div>
      </h2>
      <div className="yrc-members-grid">
      {studentCoordinators1.map((coordinator) => (
        <div key={coordinator.id} className="yrc-member-card">
          <img
            src={coordinator.image}
            alt={coordinator.name}
            className="yrc-member-image"
          />
          <div className="yrc-member-info">
            <h3>{coordinator.name}</h3>
            <span className="yrc-platoon">{coordinator.role}</span>
            <p className="yrc-department"><b>Department:</b> {coordinator.department}</p>
            <p className="yrc-year"><b>Year/Sec:</b> {coordinator.year}</p>
          </div>
        </div>
      ))}
    </div>

    </div>
  );
}

export default Coordinators;
