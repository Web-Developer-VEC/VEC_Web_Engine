import React from "react";
import "./NCCNMembers.css";
import { useEffect } from "react";
import axios from "axios";
import { useState } from "react";
import LoadComp from "../../../LoadComp";
const  NCCNMembers = ({navyFacultyData,navyStudentData}) => {

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;

  };
  
  return (
    <>
    {(navyFacultyData && navyStudentData )
      
      ?(
        
        <div className="yrc-coordinators-container">
      <h2 className="yrc-h2">
        FACULTY COORDINATOR 
        <div className="yrc-underline2"></div>
      </h2>
      
      <div className="yrc-member-card-1 dark:bg-text">
        <img
          src={UrlParser(navyFacultyData?.image_path)}
          alt={navyFacultyData?.name}
          className="yrc-member-image1"
          />

        <div className="yrc-member-info1">
          {/* <span className="yrc-platoon">Programme Officer</span> */}
          <h3>{navyFacultyData?.name}</h3>
          <p className="yrc-title text-brwn dark:text-drka">{navyFacultyData?.designation}</p>
        </div>
      </div>

      <h2 className="yrc-h3">
        STUDENT COORDINATORS
        <div className="yrc-underline3"></div>
      </h2>
      <div className="yrc-members-grid">
     {navyStudentData.map(student => (
        <div key={student.id} className="student-card dark:bg-text">
          {/* <img src={UrlParser(student.image)} className="w-[150px] h-[200px] m-auto" alt={student.name} /> */}
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


): (<div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
</div>)}
    
        </>
    
  );
}

export default NCCNMembers;
