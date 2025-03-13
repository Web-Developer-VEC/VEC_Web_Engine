import React from "react";
import "./mou.css";

const MOU = ({ data }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  return (
    <div className="mou-page">
      <div className="mou-header">
        <h1 className="text-accn dark:text-drka">Memorandum of Understanding (MOU)</h1>
      </div>

      <div className="mou-details">
        <div className="mou-table-container">
          <table className="mou-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name of Organisation</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Activities Planned</th>
              </tr>
            </thead>
            <tbody>
              {data?.MOUs?.map((detail, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{detail.ORGANISATION_NAME}</td>
                  <td>{detail.MONTH_AND_YEAR}</td>
                  <td>{detail.VALIDITY}</td>
                  <td>
                    {detail.ACTIVITIES_PLANNED.join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MOU;
