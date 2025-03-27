import { useEffect, useState } from "react";
import Banner from "../../Banner";
import "./Patent.css";

export default function PatentConsolidation({theme, toggle}) {
  const [pdfUrl, setPdfUrl] = useState(null); 
  const [activeYear, setActiveYear] = useState(null); 
  const [patent, setPatent] = useState(null);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
  return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/get_research_data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ category: "patents" }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          setPatent(data);
          setPdfUrl(data?.pdf_path[0]);
          setActiveYear(data?.year[0]);
        }
      } catch (error) {
        console.error("Fetching Error:", error);
      }
    }

    fetchData();
  }, []);


  const tableData = [
    {
      department: "AI & DS",
      processOwners: [
        {
          name: "John Doe",
          patents: [
            { title: "AI Model Optimization", status: "Approved", date: "2024-01-01" },
            { title: "Deep Learning Framework", status: "Pending", date: "2024-02-15" }
          ]
        },
        {
          name: "Jane Smith",
          patents: [
            { title: "Neural Network Acceleration", status: "Approved", date: "2024-03-20" }
          ]
        }
      ]
    },
    {
      department: "CSE",
      processOwners: [
        {
          name: "Alice Johnson",
          patents: [
            { title: "Blockchain Security", status: "Filed", date: "2024-04-05" }
          ]
        }
      ]
    }
  ];
  

  return (

<>

<div className="Patent-container">
<div className="Patent-content">
  <div className="Patent-title-container">
    <h2 className="Patent-content">
      Patent - Department wise Consolidation
    </h2>

  </div>

  <div className="Patent-table-container">
  <table className="Patent-table  border-2 border-black border-separate border-spacing-0 rounded-lg">
      <thead>
        <tr>
          <th className="border border-black p-3">Department</th>
          <th className="border border-black p-3">Process Owner</th>
          <th className="border border-black p-3">Patent Title</th>
          <th className="border border-black p-3">Process Status</th>
          <th className="border border-black p-3">Process Date</th>
        </tr>
      </thead>
      <tbody>
        {tableData.map((department, deptIndex) => {
          const departmentRowSpan = department.processOwners.reduce(
            (acc, owner) => acc + owner.patents.length,
            0
          );

          return department.processOwners.map((owner, ownerIndex) => {
            return owner.patents.map((patent, patentIndex) => (
              <tr key={`${deptIndex}-${ownerIndex}-${patentIndex}`}>
                {ownerIndex === 0 && patentIndex === 0 && (
                  <td rowSpan={departmentRowSpan} className="border border-black p-3">{department.department}</td>
                )}
                {patentIndex === 0 && (
                  <td rowSpan={owner.patents.length} className="border border-black p-3">{owner.name}</td>
                )}
                <td className="border border-black p-3">{patent.title}</td>
                <td className="border border-black p-3">{patent.status}</td>
                <td className="border border-black p-3"> {patent.date}</td>
              </tr>
            ));
          });
        })}
      </tbody>
    </table>
  </div>

</div>
</div>
 
</>
 
  );
}
