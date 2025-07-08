import React from "react";
import "./NCCAMenbers.css";
import { useEffect } from "react";
import axios from "axios";
import { useState } from "react";
import LoadComp from "../../../LoadComp";
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

function NCCAMembers({data , studentdata}) {

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };
  
  return (
  <>
    {data ? (
      
      <div className="yrc-coordinators-container">
      <h2 className="yrc-h2">
      FACULTY COORDINATOR
      <div className="yrc-underline2"></div>
      </h2>
      
      <div className="yrc-member-card-1">
      <img
      src={data?.image_path}
      alt={data?.image_path}
      className="yrc-member-image1"
      />
      
      <div className="yrc-member-info1">
      {/* <span className="yrc-platoon">Programme Officer</span> */}
      <h3> {data?.name} </h3>
      <p className="yrc-title">{data?.designation}</p>
      <p className="yrc-degree">
      {data?.message}
      </p>
      </div>
      </div>
        
        <h2 className="yrc-h3">
        STUDENT COORDINATORS
        <div className="yrc-underline3"></div>
        </h2>
        <div className="yrc-members-grid">
        {studentdata.map((member, index) => (
          <div className="student-card" key={index}>
      <img src={UrlParser(member.image)} alt={member.name} />
      <h3>{member.name}</h3>
      <h6>{member.regiment_no}</h6>
      <p>{member.year}</p>
      <p>{member.rank} - {member.department}</p>
    </div>
  ))}
  </div>
  
  
    </div>
  ):(
    <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
     <LoadComp />
    </div>
  )}
  </>
  );
}

export default NCCAMembers;
