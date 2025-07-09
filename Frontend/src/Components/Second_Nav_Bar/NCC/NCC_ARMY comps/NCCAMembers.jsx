import React from "react";
import "./NCCAMenbers.css";
import { useEffect } from "react";
import axios from "axios";
import { useState } from "react";
import LoadComp from "../../../LoadComp";

function NCCAMembers({armyFacultyData,armyStudentData}) {

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };
  

// console.log(coordinatorName)

  return (
  <>
    {(armyFacultyData && armyStudentData) ? (
      
      <div className="yrc-coordinators-container">
        <h2 className="yrc-h2 text-brwn dark:text-drkt">
          FACULTY COORDINATOR
          <div className="yrc-underline2"></div>
        </h2>
      
        <div className="yrc-member-card-1 dark:bg-text">
          <img
          src={armyFacultyData?.image_path}
          alt={armyFacultyData?.name}
          className="yrc-member-image1"
          />
          
          <div className="yrc-member-info1">
            {/* <span className="yrc-platoon">Programme Officer</span> */}
            <h3> {armyFacultyData?.name} </h3>
            <p className="yrc-title text-brwn dark:text-drka">{armyFacultyData?.designation}</p>
          </div>
        </div>
        
        <h2 className="yrc-h3 text-brwn dark:text-drkt">
            STUDENT COORDINATORS
        <div className="yrc-underline3"></div>
        </h2>
        <div className="yrc-members-grid">
            {armyStudentData?.map((member, index) => (
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
