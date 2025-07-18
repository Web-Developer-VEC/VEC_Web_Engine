import React from "react";
import "./Ecommite.css";

const iccFacultyData = [
  {
    id: 1,
    name: "Dr. R. Meenakshi",
    designation: "Head of Department",
    image: "https://via.placeholder.com/150?text=Faculty+1",
    position: "IIC Convener",
    Affiliation: "Assistant Professor, Department of Automobile, VEC",
  },
  {
    id: 2,
    name: "Mr. S. Karthik",
    designation: "Assistant Professor",
    image: "https://via.placeholder.com/150?text=Faculty+2",
    position: "IIC Convener",
    Affiliation: "Assistant Professor, Department of Automobile, VEC",
  },
  {
    id: 3,
    name: "Ms. P. Divya",
    designation: "Associate Professor",
    image: "https://via.placeholder.com/150?text=Faculty+3",
    position: "IIC Convener",
    Affiliation: "Assistant Professor, Department of Automobile, VEC",
  },
  {
    id: 4,
    name: "Dr. A. Venkatesh",
    designation: "Professor",
    image: "https://via.placeholder.com/150?text=Faculty+4",
    position: "IIC Convener",
    Affiliation: "Assistant Professor, Department of Automobile, VEC",
  },
];

export default function COMMITE() {
  return (
    <div className="p-8">
      <h2 className="title-h3">COMMITEE MEMBERS</h2>
      <div className="ecell-members-grid">
        {iccFacultyData.map((faculty) => (
          <div key={faculty.id} className="faculty-card dark:bg-text">
            <img
              src={faculty.image}
              className="w-[150px] h-[200px] m-auto"
              alt={faculty.name}
            />
            <div className="ncc-n-stu-detail p-2 text-left">
              <h5 className="text-center">{faculty.name}</h5>
              <p className="pl-4 text-brwn dark:text-drka">
                Designation: {faculty.designation}
              </p>
              <p className="pl-4 text-brwn dark:text-drka">
                Position: {faculty.position}
              </p>
              <p className="pl-4 text-brwn dark:text-drka">
                Affiliation: {faculty.Affiliation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
