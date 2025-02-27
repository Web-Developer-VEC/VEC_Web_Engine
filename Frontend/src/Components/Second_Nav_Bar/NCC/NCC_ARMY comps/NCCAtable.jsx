import React from "react";
import "./NCCAtable.css"; // Import external CSS

const NCCAtable = () => {
  const students = [
    
      { id: "01", "regNo": "TN21SDA614501", "registerNo": "113221031023", "rank": "SGT", "name": "BALA SHANMUGAM S", "yrDeptSec": "III/CSE/A" },
      { "id": "02", "regNo": "TN21SDA614504", "registerNo": "113221031052", "rank": "CQMS", "name": "GIRIDHARAN S", "yrDeptSec": "III/CSE/B" },
      { "id": "03", "regNo": "TN21SDA614505", "registerNo": "113221081031", "rank": "CPL", "name": "JOHNBRIGHTSON J S", "yrDeptSec": "III/CSE/A" },
      { "id": "04", "regNo": "TN21SDA614506", "registerNo": "113221031127", "rank": "SGT", "name": "SANIDHYA VARDHAN SINGH", "yrDeptSec": "III/CSE/A" },
      { "id": "05", "regNo": "TN21SDA614509", "registerNo": "113221081072", "rank": "SGT", "name": "SRIRAM R", "yrDeptSec": "III/MECH/B" },
      { "id": "06", "regNo": "TN21SDA614510", "registerNo": "113221041151", "rank": "CPL", "name": "UKESHRAJ V", "yrDeptSec": "III/ECE/B" },
      { "id": "07", "regNo": "TN21SWA614515", "registerNo": "113221031126", "rank": "CSM", "name": "SADHANADEVI G", "yrDeptSec": "III/CSE/A" },
      { "id": "08", "regNo": "TN21SWA614516", "registerNo": "113221041132", "rank": "SCUO", "name": "SHARMILAMANGAI E", "yrDeptSec": "III/ECE/A" },
      { "id": "09", "regNo": "TN21SWA614517", "registerNo": "113221051046", "rank": "CPL", "name": "SIBI T", "yrDeptSec": "III/EEE" },
      { "id": "10", "regNo": "TN21SWA614520", "registerNo": "113220041149", "rank": "CPL", "name": "VARSHA D", "yrDeptSec": "IV/ECE/C" },
      { "id": "11", "regNo": "TN22SDA614501", "registerNo": "113222041003", "rank": "CPL", "name": "AKASH G", "yrDeptSec": "III/ECE/C" },
      { "id": "12", "regNo": "TN22SDA614503", "registerNo": "113222051013", "rank": "SGT", "name": "GOKULA KRISHNAN M", "yrDeptSec": "III/EEE" },
      { "id": "13", "regNo": "TN22SDA614505", "registerNo": "113222081024", "rank": "SCUO", "name": "JACOB GIDEON RAJ R", "yrDeptSec": "III/MECH/A" },
      { "id": "14", "regNo": "TN22SDA614506", "registerNo": "113222041070", "rank": "CPL", "name": "JITVAN S", "yrDeptSec": "III/ECE/C" },
      { "id": "15", "regNo": "TN22SDA614507", "registerNo": "113222071062", "rank": "CPL", "name": "MUTHU KUMARAN A", "yrDeptSec": "III/IT/B" },
      { "id": "16", "regNo": "TN22SDA614508", "registerNo": "113222081041", "rank": "CPL", "name": "NAVEN A", "yrDeptSec": "III/MECH/B" },
      { "id": "17", "regNo": "TN22SDA614509", "registerNo": "113222041098", "rank": "CQMS", "name": "NAVEEN KUMAR T", "yrDeptSec": "III/ECE/C" },
      { "id": "18", "regNo": "TN22SDA614510", "registerNo": "113222011012", "rank": "CSM", "name": "SURYADEVU V", "yrDeptSec": "III/AUTO" },
      { "id": "19", "regNo": "TN22SDA614511", "registerNo": "113222081061", "rank": "CPL", "name": "THARUN P", "yrDeptSec": "III/CSE/B" },
      { "id": "20", "regNo": "TN23SDA614501", "registerNo": "113223021002", "rank": "L/CPL", "name": "AKASHBABU K", "yrDeptSec": "I/CIVIL/A" },
      { "id": "21", "regNo": "TN23SDA614502", "registerNo": "113223081010", "rank": "L/CPL", "name": "CHARLES S", "yrDeptSec": "I/MECH/A" },
      { "id": "22", "regNo": "TN23SDA614503", "registerNo": "113223011005", "rank": "L/CPL", "name": "CHITHIRAISELVAN G", "yrDeptSec": "I/AUTO" },
      { "id": "23", "regNo": "TN23SDA032153", "registerNo": "113223081013", "rank": "L/CPL", "name": "ESAKKIRAJAN G", "yrDeptSec": "I/MECH/A" },
      { "id": "24", "regNo": "TN23SDA032164", "registerNo": "113223031071", "rank": "L/CPL", "name": "INNDHAR M", "yrDeptSec": "I/CSE/C" },
      { "id": "25", "regNo": "TN23SDA614507", "registerNo": "113223041058", "rank": "L/CPL", "name": "KATHIRVEL S", "yrDeptSec": "I/ECE/A" },
      { "id": "26", "regNo": "TN23SDA614508", "registerNo": "113223081027", "rank": "L/CPL", "name": "LOKESH THAMBIRAN R", "yrDeptSec": "I/MECH/A" },
      { "id": "27", "regNo": "TN23SDA614509", "registerNo": "113223081030", "rank": "L/CPL", "name": "NISHANTH V", "yrDeptSec": "I/MECH/A" },
      { "id": "28", "regNo": "TN23SDA614511", "registerNo": "113223072084", "rank": "L/CPL", "name": "SADIKALI K", "yrDeptSec": "I/AIDS/A" },
      { "id": "29", "regNo": "TN23SDA614512", "registerNo": "113223081046", "rank": "L/CPL", "name": "UTHAYAKUMAR S", "yrDeptSec": "I/MECH/A" },
      { "id": "30", "regNo": "TN23SDA614516", "registerNo": "113223072004", "rank": "L/CPL", "name": "ABINAYA V", "yrDeptSec": "I/AIDS/B" },
      { "id": "31", "regNo": "TN23SDA614523", "registerNo": "113223061021", "rank": "L/CPL", "name": "RUTHRA S", "yrDeptSec": "I/EIE/A" },
      { "id": "32", "regNo": "TN23SDA614524", "registerNo": "113223021121", "rank": "L/CPL", "name": "SAIDHARSHINI D", "yrDeptSec": "I/ECE/C" }
  
   
  ];

  return (
    <div className="NCC-A-table-container">
      <h2 className="NCC-A-table-title">List of Students Enrolled in NCC - Army (2023-24)</h2>
      <div className="NCC-A-table-wrapper">
        <table className="NCC-A-ncc-table">
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
        dark:from-drks dark:to-[color-mix(in_srgb,theme(colors.drks)_50%,black)]">BRANCH</th>
              <th className="bg-gradient-to-r
        from-secd to-[color-mix(in_srgb,theme(colors.secd)_75%,black)]
        dark:from-drks dark:to-[color-mix(in_srgb,theme(colors.drks)_50%,black)]">REGISTER NO</th>

            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr className="even:bg-[color-mix(in_srgb,theme(colors.secd),transparent_70%)]
                    dark:even:bg-[color-mix(in_srgb,theme(colors.drks),transparent_70%)] bg-prim dark:bg-drkp"
                  key={student.id}>
                <td>{student.id}</td>
                <td>{student.rank}</td>
                <td>{student.name}</td>
                <td>{student.regNo}</td>
                <td>{student.yrDeptSec}</td>
                <td>{student.registerNo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NCCAtable;