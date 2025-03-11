import React from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable"; // Import the autoTable plugin

const downloadPdfFile = (students) => {
  if (!Array.isArray(students) || students.length === 0) {
    alert("No student data available for download!");
    return;
  }

  const doc = new jsPDF();
  
  doc.setFontSize(14);
  doc.text("Student Details", 10, 10);

  const columns = [
    "Name", 
    "Admission No.", 
    "Year", 
    "Dept", 
    "Room", 
    "Food Type", 
    "Student Mobile", 
    "Parent Mobile",  
    "Area"            
  ];

  // Define the data rows with the new fields
  const data = students.map((student) => [
    student.Name || "N/A",
    student.AdmissionNumber || "N/A",
    student.Year || "N/A",
    student.Department || "N/A",
    student["Room Number"] ? student["Room Number"].toString() : "N/A",
    student.FoodType || "N/A",
    student["Student Mobile"] ? student["Student Mobile"].toString() : "N/A",  
    student["Parent Mobile"] ? student["Parent Mobile"].toString() : "N/A",   
    student.Area || "N/A"
  ]);

  // Create the table using autoTable with borders
  doc.autoTable({
    head: [columns], 
    body: data,     
    startY: 20,      
    theme: 'grid',  
    margin: { top: 30 },
    columnStyles: {
      0: { cellWidth: 30 }, 
      6: { cellWidth: 25 },
      7: { cellWidth: 25 }, 
      8: { cellWidth: 20 },
    },
    showHead: "everyPage",
  });

  doc.save("Students_Details.pdf");
};

const DownloadPdf = ({ studentData }) => {
  const transformedStudents = studentData?.map((student) => ({
    Name: student.name,
    AdmissionNumber: student.admissionNumber,
    Year: student.year,
    Department: student.department,
    "Room Number": student.roomNumber,
    FoodType: student.foodType,
    "Student Mobile": student.studentMobile,
    "Parent Mobile": student.parentMobile,
    Area: student.area,
  }));

  return (
<a href="#" onClick={(e) => { e.preventDefault(); downloadPdfFile(transformedStudents); }} className="text-xs no-underline text-yellow-300">
  Download PDF
</a>
  );
};

export default DownloadPdf;
