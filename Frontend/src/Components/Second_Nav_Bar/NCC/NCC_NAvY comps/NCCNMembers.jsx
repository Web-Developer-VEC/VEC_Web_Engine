import React from "react";
import "./NCCNMembers.css";
import { useEffect } from "react";
import axios from "axios";
import { useState } from "react";

const  NCCNMembers = () => {

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };
  
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
      
      <div className="yrc-member-card-1 dark:bg-text">
        <img
          src={coordinaterImage}
          alt={coordinaterImage}
          className="yrc-member-image1"
        />

        <div className="yrc-member-info1">
          {/* <span className="yrc-platoon">Programme Officer</span> */}
          <h3>{coordinaterName}</h3>
          <p className="yrc-title text-brwn dark:text-drka">{coordinaterDesignation}</p>
          <p className="yrc-degree">
         {coordinaterMessage}
          </p>
        </div>
      </div>

      <h2 className="yrc-h3">
        STUDENT COORDINATORS
        <div className="yrc-underline3"></div>
      </h2>
      <div className="yrc-members-grid">
     {studentCoordinaters.map(student => (
        <div key={student.id} className="student-card dark:bg-text">
          <img src={UrlParser(student.image)} className="w-[150px] h-[200px] m-auto" alt={student.name} />
          <div className="ncc-n-stu-detail p-2 text-left">
            <h5 className="text-center">{student.name}</h5>
            <p className="pl-4 text-brwn dark:text-drka">Role: {student.role}</p>
            <p className="pl-4 text-brwn dark:text-drka">regiment no: {student.regiment_no}</p>
            <p className="pl-4 text-brwn dark:text-drka">Rank : {student.rank}</p>
            <p className="pl-4 text-brwn dark:text-drka">University No : {student.universityno}</p>
            <p className="pl-4 text-brwn dark:text-drka">Department: {student.department}</p>
          </div>
        </div>
      ))}
    </div>

    </div>
  );
}

export default NCCNMembers;
