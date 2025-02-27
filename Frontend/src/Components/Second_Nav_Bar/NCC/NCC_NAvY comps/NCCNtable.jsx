import React from "react";
import "./NCCNtable.css"; // Import external CSS

const NCCNtable = () => {
  const students = [
    { id: "01", rank: "LC", name: "ADITHYA JAISWAL B", regNo: "TN/SDN/21/928502", branch: "CSE", registerNo: "113221031008", batch: "2021-2024" },
    { id: "02", rank: "CC", name: "MANOJ K", regNo: "TN/SDN/21/928511", branch: "MECH", registerNo: "113221081041", batch: "2021-2024" },
    { id: "03", rank: "POC", name: "PUGAZHENDI B", regNo: "TN/SDN/21/928515", branch: "CSE", registerNo: "113220031101", batch: "2021-2024" },
    { id: "04", rank: "NCI", name: "RAJATH RAJ A", regNo: "TN/SDN/21/928516", branch: "MECH", registerNo: "113221081053", batch: "2021-2024" },
    { id: "05", rank: "LC", name: "ROHAN RAGHAVENDRA G", regNo: "TN/SDN/21/928518", branch: "ECE", registerNo: "113221041107", batch: "2021-2024" },
    { id: "06", rank: "POC", name: "ROSHIN ROBIN", regNo: "TN/SDN/21/928519", branch: "ECE", registerNo: "113221081109", batch: "2021-2024" },
    { id: "07", rank: "NCI", name: "SANJAI D", regNo: "TN/SDN/21/928520", branch: "MECH", registerNo: "113221081059", batch: "2021-2024" },
    { id: "08", rank: "LC", name: "MD SHALIM UDDIN", regNo: "TN/SDN/21/928522", branch: "MECH", registerNo: "113221081066", batch: "2021-2024" },
    { id: "09", rank: "POC", name: "THARUN S", regNo: "TN/SDN/21/928524", branch: "ECE", registerNo: "113221041148", batch: "2021-2024" },
    { id: "10", rank: "LC", name: "BHARATHI S", regNo: "TN/SWN/21/928526", branch: "CSE", registerNo: "113221031027", batch: "2021-2024" },
    { id: "11", rank: "LC", name: "ROSHINI G", regNo: "TN/SWN/21/928529", branch: "EEE", registerNo: "113221051038", batch: "2021-2024" },
    { id: "12", rank: "LC", name: "SRIMATHI G", regNo: "TN/SWN/21/928531", branch: "CIVIL", registerNo: "113221021027", batch: "2021-2024" },
    { id: "13", rank: "LC", name: "DINESHWARAN S", regNo: "TN/SDN/22/928501", branch: "AUTO", registerNo: "113222011004", batch: "2022-2025" },
    { id: "14", rank: "LC", name: "DRAVID A", regNo: "TN/SDN/22/928502", branch: "AIDS", registerNo: "113222072023", batch: "2022-2025" },
    { id: "15", rank: "POC", name: "HARIDEEPAK P", regNo: "TN/SDN/22/928537", branch: "AIDS", registerNo: "113222072023", batch: "2022-2025" },
    { id: "16", rank: "POC", name: "HARISH", regNo: "TN/SDN/22/928527", branch: "AIDS", registerNo: "113222072023", batch: "2022-2025" },
    { id: "17", rank: "POC", name: "MANIKANDAN K", regNo: "TN/SDN/22/928534", branch: "AIDS", registerNo: "113222072023", batch: "2022-2025" },
    { id: "18", rank: "NCI", name: "REONSLY K C", regNo: "TN/SDN/22/928513", branch: "CSE", registerNo: "113222072023", batch: "2022-2025" },
    { id: "19", rank: "LC", name: "AMULYA A S", regNo: "TN/SDN/22/928516", branch: "AIDS", registerNo: "113222072023", batch: "2022-2025" },
    { id: "20", rank: "LC", name: "BHARATHI D", regNo: "TN/SDN/22/928517", branch: "CSE", registerNo: "113222072023", batch: "2022-2025" },
    { id: "21", rank: "LC", name: "GARPAKAVALLI A", regNo: "TN/SDN/22/928519", branch: "AIDS", registerNo: "113222072023", batch: "2022-2025" },
    { id: "22", rank: "LC", name: "MADHUMEETHA D", regNo: "TN/SDN/22/928522", branch: "AIDS", registerNo: "113222072023", batch: "2022-2025" },
    { id: "23", rank: "NCI", name: "ROHINI V", regNo: "TN/SDN/22/928524", branch: "AIDS", registerNo: "113222072023", batch: "2022-2025" },
    { id: "24", rank: "NCI", name: "SANJANA SWATHI D", regNo: "TN/SDN/22/928529", branch: "ECE", registerNo: "113222072023", batch: "2022-2025" },
    { id: "25", rank: "NCI", name: "BALASUBRAMANIYAN S", regNo: "TN/SDN/22/928501", branch: "CYBER", registerNo: "113222072023", batch: "2022-2026" },
    { id: "26", rank: "NCI", name: "HARIHARAN S", regNo: "TN/SDN/22/928529", branch: "ECE", registerNo: "113222072023", batch: "2023-2026" },
    { id: "27", rank: "NCI", name: "MONISH G", regNo: "TN/SDN/22/928505", branch: "EEE", registerNo: "113222072023", batch: "2023-2026" },
    { id: "28", rank: "NCI", name: "PIRAVEEN P", regNo: "TN/SDN/22/928512", branch: "CYBER", registerNo: "113222072023", batch: "2023-2026" },
    { id: "29", rank: "NCI", name: "RUTHRESH D R", regNo: "TN/SDN/22/928513", branch: "MECH", registerNo: "113222072023", batch: "2023-2026" },
    { id: "30", rank: "NCI", name: "UDHAYA KUMAR T", regNo: "TN/SDN/22/928514", branch: "CSE", registerNo: "113222072023", batch: "2023-2026" },
    { id: "31", rank: "NCI", name: "SIVAPATHIEESHWARAN S", regNo: "TN/SDN/22/9285015", branch: "EEE", registerNo: "113222072023", batch: "2023-2026" },
    { id: "32", rank: "NCI", name: "THAMARAISELVAN R", regNo: "TN/SDN/22/928516", branch: "MECH", registerNo: "113222072023", batch: "2023-2026" },
    { id: "33", rank: "NCI", name: "YOGESH RAM M", regNo: "TN/SDN/22/928517", branch: "CSE", registerNo: "113222072023", batch: "2023-2026" },
    { id: "34", rank: "NCI", name: "AKSHAYA KARTHIKAYINI V", regNo: "TN/SDN/22/928518", branch: "AIDS", registerNo: "113222072023", batch: "2023-2026" },
    { id: "35", rank: "NCI", name: "NARMATHA M", regNo: "TN/SDN/22/928521", branch: "EEE", registerNo: "113222072023", batch: "2023-2026" },
    { id: "36", rank: "NCI", name: "PRIYA M", regNo: "TN/SDN/22/928523", branch: "EIE", registerNo: "113222072023", batch: "2023-2026" },
  ];

  return (
    <div className="NCC-N-table-container mt-12 mx-auto">
      <div className="NCC-N-table-wrapper">
        <table className="NCC-N-ncc-table">
          <thead>
            <tr>
              <th className="bg-gradient-to-r
        from-secd to-[color-mix(in_srgb,theme(colors.secd)_75%,black)]
        dark:from-drks dark:to-[color-mix(in_srgb,theme(colors.drks)_50%,black)]">S.NO</th>
              <th className="bg-gradient-to-r
        from-secd to-[color-mix(in_srgb,theme(colors.secd)_75%,black)]
        dark:from-drks dark:to-[color-mix(in_srgb,theme(colors.drks)_50%,black)]">RANK</th>
              <th className="bg-gradient-to-r
        from-secd to-[color-mix(in_srgb,theme(colors.secd)_75%,black)]
        dark:from-drks dark:to-[color-mix(in_srgb,theme(colors.drks)_50%,black)]">NAME OF THE CADET</th>
              <th className="bg-gradient-to-r
        from-secd to-[color-mix(in_srgb,theme(colors.secd)_75%,black)]
        dark:from-drks dark:to-[color-mix(in_srgb,theme(colors.drks)_50%,black)]">REGIMENTAL NO</th>
              <th className="bg-gradient-to-r
        from-secd to-[color-mix(in_srgb,theme(colors.secd)_75%,black)]
        dark:from-drks dark:to-[color-mix(in_srgb,theme(colors.drks)_50%,black)]">BATCH</th> {/* ✅ New column added */}
              <th className="bg-gradient-to-r
        from-secd to-[color-mix(in_srgb,theme(colors.secd)_75%,black)]
        dark:from-drks dark:to-[color-mix(in_srgb,theme(colors.drks)_50%,black)]">BRANCH</th>
              <th className="bg-gradient-to-r
        from-secd to-[color-mix(in_srgb,theme(colors.secd)_75%,black)]
        dark:from-drks dark:to-[color-mix(in_srgb,theme(colors.drks)_50%,black)]">REGISTER NO</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr className="even:bg-[color-mix(in_srgb,theme(colors.secd),transparent_70%)]
                    dark:even:bg-[color-mix(in_srgb,theme(colors.drks),transparent_70%)] bg-prim dark:bg-drkp" key={student.id}>
                <td>{student.id}</td>
                <td>{student.rank}</td>
                <td>{student.name}</td>
                <td>{student.regNo}</td>
                <td>{student.batch}</td> {/* ✅ New data added */}
                <td>{student.branch}</td>
                <td>{student.registerNo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NCCNtable;

