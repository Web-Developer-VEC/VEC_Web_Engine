import  { React }  from 'react';
import "./Researchtable.css";
import './Academicresearch.css';

const Researchtable = () => {


    const tableData = [
        {
          name: "Dr. John Doe",
          guidance: "faculty name ",
          university: "MIT",
          dateOfRegistration: "2024-03-10"
        },
        {
          name: "Prof. Jane Smith",
          guidance: "faculty name ",
          university: "Stanford",
          dateOfRegistration: "2023-07-15"
        },
        {
          name: "Dr. Emily Brown",
          guidance: "faculty name ",
          university: "Harvard",
          dateOfRegistration: "2022-11-25"
        }
      ];

  return (
     <>
        <div className="Research-container">
        <div className="Research-content">
        <div className="Research-title-container">
        <h2 className="Research-content font-poppins">
           Adacamic Research 
        </h2>
        </div>
   
     <div className="Research-table-container">
     <table className="Research-table border-collapse border border-black w-full text-left">
         <thead>
           <tr>
             <th className="border border-black p-3">Name of the Faculty</th>
             <th className="border border-black p-3">Guidance</th>
             <th className="border border-black p-3">University</th>
             <th className="border border-black p-3">Date of Registration</th>
           </tr>
         </thead>
         <tbody>
           {tableData.map((faculty, index) => (
             <tr key={index}>
               <td className="border border-black p-3">{faculty.name}</td>
               <td className="border border-black p-3">{faculty.guidance}</td>
               <td className="border border-black p-3">{faculty.university}</td>
               <td className="border border-black p-3">{faculty.dateOfRegistration}</td>
             </tr>
           ))}
         </tbody>
       </table>
     </div>
   
   </div>
   </div>
     </>
  )
}

export default Researchtable