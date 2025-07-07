import React from "react";
import "./NCCNMembers.css";
import { useEffect } from "react";
import axios from "axios";
import { useState } from "react";
// const NCCNMembers = () => {
//   const members = Array.from({ length: 60 }, (_, index) => ({
//     id: index + 1,
//     name: `Cadet ${index + 1}`,
//     degree: "Dept. of Mechanical Engineering, Velammal Engineering college",
//     image: "https://via.placeholder.com/150",
//     description:
//       "A dedicated cadet committed to leadership, discipline, and service to the nation.",
//     platoon: "EME Platoon",
//   }));

//   return (
//     <div className="membersnavy-ncca-members-container">
//       <h2 className="membersnavy-h2">
//         Meet Our Officer
//         <div className="membersnavy-underline"></div>
//       </h2>
//       <div className="membersnavy-member-card-1">
//         <img
//           src="https://via.placeholder.com/150"
//           alt="Officer"
//           className="membersnavy-member-image"
//         />
//         <div className="membersnavy-member-info">
//           <span className="membersnavy-platoon">Commanding Officer</span>
//           <h3>John Doe</h3>
//           <p className="membersnavy-title">Bachelor of Defense Studies</p>
//           <p className="membersnavy-degree">
//             A highly skilled and disciplined officer leading the cadets with
//             excellence.
//           </p>
//         </div>
//       </div>

//       <h2 className="membersnavy-h2">
//         Cadet Leaders
//         <div className="membersnavy-underline"></div>
//       </h2>
//       <div className="membersnavy-members-grid">
//         {members.map((member) => (
//           <div key={member.id} className="membersnavy-member-card">
//             <img
//               src={member.image}
//               alt={member.name}
//               className="membersnavy-member-image"
//             />
//             <div className="membersnavy-member-info">
//               <span className="membersnavy-platoon">{member.platoon}</span>
//               <h3>{member.name}</h3>
//               <p className="membersnavy-title">Student</p>
//               <p className="membersnavy-degree">{member.degree}</p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

const  NCCNMembers = () => {

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };
  
  // const studentCoordinators1 = [
  //   {
  //     id: 1,
  //     role: "Assitant",
  //     image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
  //     name: "Ajay",
  //     department: "AI&DS",
  //     year: 2
  //   },
  //   {
  //     id: 2,
  //     role: "Assitant",
  //     image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
  //     name: "Ajith",
  //     department: "AI&DS",
  //     year: 2
  //   },
  //   {
  //     id: 3,
  //     role: "Assitant",
  //     image: "",
  //     name: "Sudha",
  //     department: "AI&DS",
  //     year: 2
  //   },
  //   {
  //     id: 4,
  //     role: "Assitant",
  //     image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
  //     name: "Sri",
  //     department: "AI&DS",
  //     year: 2
  //   }
  // ]


  const [coordinaterImage,setCoordinaterImage]= useState("")
  const [coordinaterName , setCoordinaterName] = useState("")
  const [coordinaterMessage ,setCoordinaterMessage] =useState("")
  const [coordinaterDesignation, setCoordinaterDesignation] = useState("")
  const [studentCoordinaters,setStudentCoordinaters] = useState([])
  const [data , setData] = useState()
  useEffect(()=> {
    const fetchFacultyCoordinaterData = async () => {
try{

    const response = await axios.get('/api/ncc_navy');

  if (Array.isArray(response.data) && response.data.length > 0) {
        const data = response.data[0]; 
      setCoordinaterImage(data.coordinater.image_path)
       setCoordinaterName(data.coordinater.name)
       setCoordinaterMessage(data.coordinater.message)
       setCoordinaterDesignation(data.coordinater.designation)
      } else {
        console.warn("API returned no data or unexpected format", response.data);
      }
}catch(error){
  console.error("Error data fetching ",error)
}
    


    }
fetchFacultyCoordinaterData();


const fetchStudentCoordinaterData = async() => {

    try{

    const response = await axios.get('/api/ncc_navy');

  if (Array.isArray(response.data) && response.data.length > 0) {
      const data = response.data[0]; 
      const members = data.members


      const formatted = members.name.map((name, index) => ({
        id: index + 1,
        role: members.rank?.[index] ,
        regiment_no: members.regiment_no?.[index],
        image: members.image_path?.[index] ,
        rank: members.rank?.[index],
        universityno: members.universityno[index],
        name: name || "",
        department: members.department?.[index] ,
      
      }));


    setStudentCoordinaters(formatted)

      } else {
        console.warn("API returned no data or unexpected format", response.data);
      }
}catch(error){
  console.error("Error data fetching ",error)
}
    
    }
fetchStudentCoordinaterData();
  },[])



  return (
    
    <div className="yrc-coordinators-container">
      <h2 className="yrc-h2">
        FACULTY COORDINATOR
        <div className="yrc-underline2"></div>
      </h2>
      
      <div className="yrc-member-card-1">
        <img
          src={coordinaterImage}
          alt={coordinaterImage}
          className="yrc-member-image1"
        />

        <div className="yrc-member-info1">
          {/* <span className="yrc-platoon">Programme Officer</span> */}
          <h3>{coordinaterName}</h3>
          <p className="yrc-title">{coordinaterDesignation}</p>
          <p className="yrc-degree">
         {coordinaterMessage}
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
     {studentCoordinaters.map(student => (
  <div key={student.id} className="student-card">
    <img src={student.image} alt={student.name} />
    <h3>{student.name}</h3>
    <p>Role: {student.role}</p>
    <p>regiment no: {student.regiment_no}</p>
    <p>Rank : {student.rank}</p>
    <p>University No : {student.universityno}</p>
    <p>Department: {student.department}</p>
    <p>Year: {student.year}</p>
  </div>
))}
    </div>

    </div>
  );
}

export default NCCNMembers;
