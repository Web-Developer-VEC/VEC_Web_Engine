import React from "react";
import "./NCCAMenbers.css";
import { useEffect } from "react";
import axios from "axios";
import { useState } from "react";
import LoadComp from "../../../LoadComp";

function NCCAMembers() {

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };
  

  const [coordinaterImage, setCoordinaterImage] = useState(null)
  const [coordinaterName , setCoordinaterName] = useState("")
  const [coordinaterMessage ,setCoordinaterMessage] =useState("")
  const [coordinaterDesignation, setCoordinaterDesignation] = useState("")
  // student coordinater 
  const [studentMembers, setStudentMembers] = useState([]);
  const [data , setData] = useState("")
useEffect(()=>{
  const fetchFacultyCoordinatorData = async () => {
    try{
       const responce = await axios.get('/api/ncc_army');
       const data = responce.data[0];
       setData(data);
       setCoordinaterImage(data.coordinater.image_path)
       setCoordinaterName(data.coordinater.name)
       setCoordinaterMessage(data.coordinater.message)
       setCoordinaterDesignation(data.coordinater.designation)
    }catch(error){
         console.error("Error fetching data", error);

    }
  
  }

   fetchFacultyCoordinatorData(); 
}

,[])


useEffect(()=> {
  const fetchMemberCoordinaterData = async () => {

    try{

      const responce = await axios.get('/api/ncc_army');
       const data = responce.data[0];
     
       const members = data.members;
     
      const combinedMembers = members.name.map((name, i) => ({
               name: name,
               rank: members.rank[i],
               regiment_no:members.regiment_no[i],
               year: members.year[i],
               department: members.department[i],
               image: members.image_path[i]
             }));
     
             setStudentMembers(combinedMembers)
    }catch(error){
      console.error("Error fetching data ",error)
    }
  };

  fetchMemberCoordinaterData();

},[])

// console.log(coordinatorName)

  return (
  <>
    {data ? (
      
      <div className="yrc-coordinators-container">
        <h2 className="yrc-h2 text-brwn dark:text-drkt">
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
            <h3> {coordinaterName} </h3>
            <p className="yrc-title">{coordinaterDesignation}</p>
            <p className="yrc-degree">
            {coordinaterMessage}
          </p>
          </div>
        </div>
        
        <h2 className="yrc-h3 text-brwn dark:text-drkt">
            STUDENT COORDINATORS
        <div className="yrc-underline3"></div>
        </h2>
        <div className="yrc-members-grid">
            {studentMembers.map((member, index) => (
            <div className="student-card dark:bg-text" key={index}>
              <img src={UrlParser(member.image)} className="w-[150px] h-[200px] m-auto" alt={member.name} />
              <h5 className="text-text dark:text-drkt font-sm mt-4">{member.name}</h5>
              <p className="text-brwn dark:text-drka">{member.regiment_no}</p>
              <p className="text-brwn dark:text-drka">{member.year}</p>
              <p className="text-brwn dark:text-drka">{member.rank} - {member.department}</p>
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
