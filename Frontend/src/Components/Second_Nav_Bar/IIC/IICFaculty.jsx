import React from 'react';
import '../YRC.css';
import './IICFaculty.css'

function IICFaculty({data}){

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
     {data?.map((faculty,i) => (
       <div key={i} className="faculty-card dark:bg-text">
          {/* <img src={faculty.image} className="w-[150px] h-[200px] m-auto" alt={faculty.name} />  */}
          <div className="ncc-n-stu-detail p-2 text-left">
            <h5 className="text-center  text-[18px-">{faculty.name}</h5>
            <p className="pl-4 text-brwn dark:text-drka text-sm">Designation : {faculty.designation}</p>
          </div>
        </div>
      ))}
    </div>
    </div>
    </>

  )
}






function IICExpert({data}){
  console.log("expert",data)

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
     {data?.map(faculty => (
       <div key={faculty.id} className="faculty-card dark:bg-text">
          {/* <img src={faculty.image} className="w-[150px] h-[200px] m-auto" alt={faculty.name} />  */}
          <div className="ncc-n-stu-detail p-2 text-left">
            <h5 className="text-center text-[18px]">{faculty.name}</h5>
            <p className="pl-4 text-brwn dark:text-drka text-sm">Designation : {faculty.designation}</p>
         
          </div>
        </div>
      ))}
    </div>
    </div>
    </>

  )
}




const IICStudent=({data})=> {
  console.log("stu",data);


  const obj = Object.keys(data);
  console.log("Obj" , obj)
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

    <h2 className="iic-h3 text-brwn dark:drkt">
       STUDENT REPRESENTATION
      
      </h2>
      <div className="iic-stud-grid">
        {obj?.map((obj,i) => (
          <>
            <h2 className='text-3xl font-bold text-brwn dark:text-drkt text-center'>{obj}</h2>
            <div className='flex flex-wrap gap-[20px]'>
              {data[obj].map((details,i) => (
                  <div key={i} className="iic-faculty-card dark:bg-text">
                      <div className="ncc-n-stu-detail p-2 text-left">
                        <h5 className="text-center text-[18px]">{details.name}</h5>
                        <p className="pl-4 text-brwn dark:text-drka text-sm">Responsibility: {details.responsibility}</p>
                    
                        <p className="pl-4 text-brwn dark:text-drkab text-sm">Sex: {details.sex}</p>
                        <p className="pl-4 text-brwn dark:text-drkab text-sm"><span>{details.dept}</span><span>{details.year}</span></p>
                        <p className="pl-4 text-brwn dark:text-drka text-sm">Phone: {details.phone}</p>
                        <p className="pl-4 text-brwn dark:text-drka text-sm">Email: {details["mail id"]}</p>
                      </div>
                  </div> 
              ))}
            </div>
          </>
          ))}
        </div>
    </div>
    </>

  )
}

export {IICExpert,IICFaculty,IICStudent};