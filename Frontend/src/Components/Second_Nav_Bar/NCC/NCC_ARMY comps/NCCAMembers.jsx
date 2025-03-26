import React from "react";
import "./NCCAMenbers.css";

// const NCCAMembers = () => {
//   const members = Array.from({ length: 60 }, (_, index) => ({
//     id: index + 1,
//     name: `Cadet ${index + 1}`,
//     degree: "Dept. of Mechanical Engineering",
//     image: "https://via.placeholder.com/150",
//     description:
//       "A dedicated cadet committed to leadership, discipline, and service to the nation.",
//     platoon: "EME Platoon",
//   }));

//   return (
//     <div className="membersarmy-ncca-members-container">
//       <h2 className="membersarmy-h2">
//         Meet Our Officer
//         <div className="membersarmy-underline"></div>
//       </h2>
//       <div className="membersarmy-member-card-1">
//         <img
//           src="https://via.placeholder.com/150"
//           alt="Officer"
//           className="membersarmy-member-image"
//         />
//         <div className="membersarmy-member-info">
//           <span className="membersarmy-platoon">Commanding Officer</span>
//           <h3>John Doe</h3>
//           <p className="membersarmy-title">Bachelor of Defense Studies</p>
//           <p className="membersarmy-degree">
//             A highly skilled and disciplined officer leading the cadets with
//             excellence.
//           </p>
//         </div>
//       </div>

//       <h2 className="membersarmy-h2">
//         Cadet Leaders
//         <div className="membersarmy-underline"></div>
//       </h2>
//       <div className="membersarmy-members-grid">
//         {members.map((member) => (
//           <div key={member.id} className="membersarmy-member-card">
//             <img
//               src={member.image}
//               alt={member.name}
//               className="membersarmy-member-image"
//             />
//             <div className="membersarmy-member-info">
//               <span className="membersarmy-platoon">{member.platoon}</span>
//               <h3>{member.name}</h3>
//               <p className="membersarmy-title">Student</p>
//               <p className="membersarmy-degree">{member.degree}</p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

function NCCAMembers() {

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };
  
  const studentCoordinators1 = [
    {
      id: 1,
      role: "Assitant",
      image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
      name: "Ajay",
      department: "AI&DS",
      year: 2
    },
    {
      id: 2,
      role: "Assitant",
      image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
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
      image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
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

export default NCCAMembers;
