import React from 'react';
import '../yrc/YRC.css';
import './IICFaculty.css'
import LoadComp from '../../LoadComp';

function IICFaculty({data}){
  return (
    <>
    {data ? (
      <div className='p-8'>

        <h2 className="iic-h3 text-brwn dark:text-drkt">Faculty Members</h2>
        <div className="iic-members-grid">
          {data?.map((faculty,i) => (
            <div key={i} className="faculty-card dark:bg-text">
                {/* <img src={faculty.image} className="w-[150px] h-[200px] m-auto" alt={faculty.name} />  */}
                <div className="ncc-n-stu-detail p-2 text-left">
                  <h5 className="text-center  text-[18px-">{faculty.name}</h5>
                  <p className="pl-4 text-brwn dark:text-drka text-sm">{faculty.designation}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    ): (
        <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
        </div>
    )}
    </>
  )
}

function IICExpert({data}){

  return (
    <>
    {data ? (
      <div className='p-8'>

      <h2 className="iic-h3 text-brwn dark:text-drkt">
          Expert Representation 
        
        </h2>
        <div className="iic-members-grid">
      {data?.map(faculty => (
        <div key={faculty.id} className="faculty-card dark:bg-text">
            {/* <img src={faculty.image} className="w-[150px] h-[200px] m-auto" alt={faculty.name} />  */}
            <div className="ncc-n-stu-detail p-2 text-left">
              <h5 className="text-center text-[18px]">{faculty.name}</h5>
              <p className="pl-4 text-brwn dark:text-drka text-sm">{faculty.designation}</p>
            </div>
          </div>
        ))}
      </div>
      </div>
    ) : (
        <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
        </div>
    )}
    </>

  )
}

const IICStudent = ({ data }) => {
  
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <div className="p-2">
      <h2 className="iic-h3 text-brwn dark:text-drkt">Student Representation</h2>
      
      {Array.isArray(data) && data?.map((categoryBlock, idx) => (
        <div key={idx}>
          <h2 className="text-3xl font-bold text-brwn dark:text-drkt text-center my-4">
            {categoryBlock?.category}
          </h2>

          <div className="flex flex-wrap gap-[20px] justify-center">
            {categoryBlock?.members?.map((details, i) => (
              <div key={i} className="iic-faculty-card dark:bg-text">
                <div className="ncc-n-stu-detail p-2 text-left">
                  <h5 className="text-center text-[18px] font-semibold">{details?.name}</h5>
                  <p className="pl-4 text-brwn dark:text-drka text-sm">Responsibility: {details?.responsibility}</p>
                  {/* <p className="pl-4 text-brwn dark:text-drka text-sm">Sex: {details?.sex}</p> */}
                  <p className="pl-4 text-brwn dark:text-drka text-sm">
                    {details?.dept} - {details?.year}
                  </p>
                  {/* <p className="pl-4 text-brwn dark:text-drka text-sm">Phone: {details?.phone}</p> */}
                  {/* <p className="pl-4 text-brwn dark:text-drka text-sm">Email: {details["mail id"]}</p> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export {IICExpert,IICFaculty,IICStudent};