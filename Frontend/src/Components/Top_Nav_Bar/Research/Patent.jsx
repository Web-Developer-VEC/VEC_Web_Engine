import { useEffect, useState } from "react";
import Banner from "../../Banner";
import "./Patent.css";

export default function PatentConsolidation({ theme, toggle }) {
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15; 

  const departmentMapping = {
    "000": "Placement Department",
    "001": "Artificial Intelligence and Data Science (AI&DS)",
    "002": "Automobile Engineering (AUTO)",
    "003": "Chemistry",
    "004": "Civil Engineering (CIVIL)",
    "005": "Computer Science & Engineering (CSE)",
    "006": "Computer Science and Engineering (CYBER SECURITY)",
    "007": "Electrical & Electronics Engineering (EEE)",
    "008": "Electronics & Instrumentation Engineering (EIE)",
    "009": "Electronics and Communication Engineering (ECE)",
    "010": "English",
    "011": "Information Technology (IT)",
    "012": "Mathematics",
    "013": "Mechanical Engineering (MECH)",
    "014": "Tamil",
    "015": "Physics",
    "016": "Master Of Computer Science",
    "017": "Master of Business Admin",
    "020": "Physical Education",
    "021": "Placement"
  };

  const departmentMapping1 = {
    "000": "Placement",
    "001": "AI&DS",
    "002": "AUTO",
    "003": "Chemistry",
    "004": "CIVIL",
    "005": "CSE",
    "006": "CYBER SECURITY",
    "007": "EEE",
    "008": "EIE",
    "009": "ECE",
    "010": "English",
    "011": "IT",
    "012": "Mathematics",
    "013": "MECH",
    "014": "Tamil",
    "015": "Physics",
    "016": "MCA",
    "017": "MBA",
    "020": "Physical Ed.",
    "021": "Placement"
  };  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/patent");
        const data = await response.json();

        if (response.ok) {
          const formattedData = data.map((dept) => ({
            department: departmentMapping[dept.dept_id] || `Unknown Dept (${dept.dept_id})`,
            processOwners: dept.patents.map((patent) => ({
              name: patent.name,
              patents: patent.details.nameofpatent.map((title, index) => ({
                title,
                status: patent.details.status[index],
                date: patent.details.date[index],
              })),
            })),
          }));

          setTableData(formattedData);
        }
      } catch (error) {
        console.error("Fetching Error:", error);
      }
    };

    fetchData();
  }, []);

  const flatTableData = [];
  tableData.forEach((department) => {
    department.processOwners.forEach((owner) => {
      owner.patents.forEach((patent) => {
        flatTableData.push({
          department: department.department,
          owner: owner.name,
          title: patent.title,
          status: patent.status,
          date: patent.date,
          ownerPatentsCount: owner.patents.length, 
          departmentPatentsCount: department.processOwners.reduce(
            (acc, owner) => acc + owner.patents.length,
            0
          ), 
        });
      });
    });
  });

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = flatTableData.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <>
      <Banner toggle={toggle} theme={theme}
          backgroundImage="./Banners/researchbanner.webp"
          headerText="Patent"
          subHeaderText="Enrich Your Knowledge"
        />
      <div className="Patent-container">
        <div className="Patent-content">
          <div className="Patent-title-container">
            <h2 className="research-patent-title text-brwn dark:text-drkt border-l-4 border-r-4 border-secd dark:border-drks">
              Patent
            </h2>
          </div>

          <div className="Patent-table-container">
            <table className="Patent-table border-2 border-black border-separate border-spacing-0 rounded-lg">
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
                {currentRows.map((row, index) => {
                  const isFirstDepartmentRow =
                    index === 0 || row.department !== currentRows[index - 1].department;
                  const isFirstOwnerRow =
                    index === 0 || row.owner !== currentRows[index - 1].owner;

                  return (
                    <tr key={index}>
                      {isFirstDepartmentRow && (
                        <td
                          rowSpan={currentRows.filter((r) => r.department === row.department).length}
                          className="border border-black p-3"
                        >
                          {row.department}
                        </td>
                      )}
                      {isFirstOwnerRow && (
                        <td
                          rowSpan={currentRows.filter((r) => r.owner === row.owner).length}
                          className="border border-black p-3"
                        >
                          {row.owner}
                        </td>
                      )}
                      <td className="border border-black p-3">{row.title}</td>
                      <td className="border border-black p-3">{row.status}</td>
                      <td className="border border-black p-3">{row.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="pagination-container mt-4 flex justify-center space-x-4">
            <button
              className="bg-gray-300 px-4 py-2 rounded"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="text-lg font-semibold">
              Page {currentPage} of {Math.ceil(flatTableData.length / rowsPerPage)}
            </span>
            <button
              className="bg-gray-300 px-4 py-2 rounded"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={indexOfLastRow >= flatTableData.length}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
