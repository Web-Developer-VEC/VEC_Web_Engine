import React from 'react';
import '../YRC.css';
import './IICFaculty.css'

function IICFaculty(){

    const iccFacultyData = [
  {
    id: 1,
    name: "Dr. R. Meenakshi",
    designation: "Head of Department",
    image: "https://via.placeholder.com/150?text=Faculty+1",
    position:"IIC Convener",
    Affiliation:"Assistant Professor,Department of Automobile, VEC"
  },
  {
    id: 2,
    name: "Mr. S. Karthik",
    designation: "Assistant Professor",
    image: "https://via.placeholder.com/150?text=Faculty+2",
    position:"IIC Convener",
    Affiliation:"Assistant Professor,Department of Automobile, VEC"
  },
  {
    id: 3,
    name: "Ms. P. Divya",
    designation: "Associate Professor",
    image: "https://via.placeholder.com/150?text=Faculty+3",
    position:"IIC Convener",
    Affiliation:"Assistant Professor,Department of Automobile, VEC"
  },
  {
    id: 4,
    name: "Dr. A. Venkatesh",
    designation: "Professor",
    image: "https://via.placeholder.com/150?text=Faculty+4",
    position:"IIC Convener",
    Affiliation:"Assistant Professor,Department of Automobile, VEC"
  }
];


  return (
    <>
    <div className='p-8'>

    <h2 className="iic-h3">
        FACULTY MEMBERS
      
      </h2>
      <div className="iic-members-grid">
     {iccFacultyData.map(faculty => (
       <div key={faculty.id} className="faculty-card dark:bg-text">
          {/* <img src={faculty.image} className="w-[150px] h-[200px] m-auto" alt={faculty.name} />  */}
          <div className="ncc-n-stu-detail p-2 text-left">
            <h5 className="text-center  ">{faculty.name}</h5>
            <p className="pl-4 text-brwn dark:text-drka text-[16px]">Designation : {faculty.designation}</p>
         
            <p className="pl-4 text-brwn dark:text-drka text-[16px]">Position : {faculty.position}</p>
            <p className="pl-4 text-brwn dark:text-drka  text-[16px]">Affiliation: {faculty.Affiliation}</p>
          </div>
        </div>
      ))}
    </div>
    </div>
    </>

  )
}






function IICExpert(){

    const iccFacultyData = [
  {
    id: 1,
    name: "Dr. R. Meenakshi",
    designation: "Head of Department",
    image: "https://via.placeholder.com/150?text=Faculty+1",
    position:"IIC Convener",
    Affiliation:"Assistant Professor,Department of Automobile, VEC"
  },
  {
    id: 2,
    name: "Mr. S. Karthik",
    designation: "Assistant Professor",
    image: "https://via.placeholder.com/150?text=Faculty+2",
    position:"IIC Convener",
    Affiliation:"Assistant Professor,Department of Automobile, VEC"
  },
  {
    id: 3,
    name: "Ms. P. Divya",
    designation: "Associate Professor",
    image: "https://via.placeholder.com/150?text=Faculty+3",
    position:"IIC Convener",
    Affiliation:"Assistant Professor,Department of Automobile, VEC"
  },
  {
    id: 4,
    name: "Dr. A. Venkatesh",
    designation: "Professor",
    image: "https://via.placeholder.com/150?text=Faculty+4",
    position:"IIC Convener",
    Affiliation:"Assistant Professor,Department of Automobile, VEC"
  }
];


  return (
    <>
    <div className='p-8'>

    <h2 className="iic-h3">
        EXPERT REPRESENTATION
      
      </h2>
      <div className="iic-members-grid">
     {iccFacultyData.map(faculty => (
       <div key={faculty.id} className="faculty-card dark:bg-text">
          {/* <img src={faculty.image} className="w-[150px] h-[200px] m-auto" alt={faculty.name} />  */}
          <div className="ncc-n-stu-detail p-2 text-left">
            <h5 className="text-center">{faculty.name}</h5>
            <p className="pl-4 text-brwn dark:text-drka text-[16px]">Designation : {faculty.designation}</p>
         
            <p className="pl-4 text-brwn dark:text-drka text-[16px]">Position : {faculty.position}</p>
            <p className="pl-4 text-brwn dark:text-drka text-[16px]">Affiliation: {faculty.Affiliation}</p>
          </div>
        </div>
      ))}
    </div>
    </div>
    </>

  )
}




const IICStudent=()=> {

    const iccFacultyData = [
  {
    id: 1,
    name: "Dr. R. Meenakshi",
    designation: "Head of Department",
    image: "https://via.placeholder.com/150?text=Faculty+1",
    position:"IIC Convener",
    Affiliation:"Assistant Professor,Department of Automobile, VEC"
  },
  {
    id: 2,
    name: "Mr. S. Karthik",
    designation: "Assistant Professor",
    image: "https://via.placeholder.com/150?text=Faculty+2",
    position:"IIC Convener",
    Affiliation:"Assistant Professor,Department of Automobile, VEC"
  },
  {
    id: 3,
    name: "Ms. P. Divya",
    designation: "Associate Professor",
    image: "https://via.placeholder.com/150?text=Faculty+3",
    position:"IIC Convener",
    Affiliation:"Assistant Professor,Department of Automobile, VEC"
  },
  {
    id: 4,
    name: "Dr. A. Venkatesh",
    designation: "Professor",
    image: "https://via.placeholder.com/150?text=Faculty+4",
    position:"IIC Convener",
    Affiliation:"Assistant Professor,Department of Automobile, VEC"
  }
];


  return (
    <>
    <div className='p-8'>

    <h2 className="iic-h3">
       STUDENT REPRESENTATION
      
      </h2>
      <div className="iic-members-grid">
     {iccFacultyData.map(faculty => (
       <div key={faculty.id} className="faculty-card dark:bg-text">
          {/* <img src={faculty.image} className="w-[150px] h-[200px] m-auto" alt={faculty.name} />  */}
          <div className="ncc-n-stu-detail p-2 text-left">
            <h5 className="text-center">{faculty.name}</h5>
            <p className="pl-4 text-brwn dark:text-drka text-[16px]">Designation : {faculty.designation}</p>
         
            <p className="pl-4 text-brwn dark:text-drkab text-[16px]">Position : {faculty.position}</p>
            <p className="pl-4 text-brwn dark:text-drka text-[16px]">Affiliation: {faculty.Affiliation}</p>
          </div>
        </div>
      ))}
    </div>
    </div>
    </>

  )
}

export {IICExpert,IICFaculty,IICStudent};