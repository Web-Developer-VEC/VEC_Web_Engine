import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Rename the parameter to avoid conflict with the prop
function downloadExcelFile(studentData) {
  
  const transformedStudents = studentData.map((student) => ({
    Name: student.name,
    AdmissionNumber: student.admissionNumber,
    Year: student.year,
    Department: student.department,
    "Room Number": student.roomNumber,
    FoodType: student.foodType,
    "Student Mobile": student.studentMobile,
    "Parent Mobile": student.parentMobile,
    Area: student.area
  }));

  const ws = XLSX.utils.json_to_sheet(transformedStudents);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Students");

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

  saveAs(data, "students.xlsx");
};

const DownloadExcel = ({ data }) => {
  return <button onClick={() => downloadExcelFile(data)}>Download Excel</button>;
};

export default DownloadExcel;