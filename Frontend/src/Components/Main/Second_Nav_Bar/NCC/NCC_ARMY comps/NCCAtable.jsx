import React from "react";
import "./NCCAtable.css"; // Import external CSS

const NCCAtable = ({data}) => {
  return (
    <div className="NCC-A-table-container">
      <h2 className="NCC-A-table-title">
        List of Students Enrolled in NCC - Army (2023-24)
      </h2>
      <div className="NCC-A-table-wrapper">
        <table className="NCC-A-ncc-table">
          <thead>
            <tr>
              <th className="bg-gray-500 dark:bg-drks">S.NO</th>
              <th className="bg-gray-500 dark:bg-drks">RANK</th>
              <th className="bg-gray-500 dark:bg-drks">NAME OF THE CADET</th>
              <th className="bg-gray-500 dark:bg-drks">REGIMENTAL NO</th>
              <th className="bg-gray-500 dark:bg-drks">BRANCH</th>
              <th className="bg-gray-500 dark:bg-drks">REGISTER NO</th>
            </tr>
          </thead>
          <tbody>
            {data?.rank?.map((rank,index) => (
              <tr
                className="
                    dark:even:bg-[color-mix(in_srgb,theme(colors.drks),transparent_70%)] bg-prim dark:bg-drkp"
                key={data["s.no"][index]}
              >
                <td>{data["s.no"][index]}</td>
                <td>{rank}</td>
                <td>{data.name[index]}</td>
                <td>{data.regimental_number[index]}</td>
                <td>{data.branch[index]}</td>
                <td>{data.register_number[index]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NCCAtable;