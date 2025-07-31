import React from "react";
import "./InfoHostel.css";
import LoadComp from "../../LoadComp";

const InfoHostel = ({ hostelData }) => {
  const data = hostelData?.[0];
  const data2 = hostelData?.[1];

  if (!data || !data2 || !data.content || !data2.content) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    ) 
  }

  return (
    <div className="infohostel-container bg-prim dark:bg-drkp">
      <h1 className="infohostel-title text-brwn dark:text-drkt">{data.category}</h1>

      <section className="HI-grid">
        {data.content.map((item, index) => (
          <div
            key={index}
            className="HI-card bg-prim dark:bg-drkb border-l-4 border-secd dark:border-drks"
          >
            <h2 className="HI-card-title text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks">
              {item.section}
            </h2>
            <p className="HI-card-text text-text dark:text-drkt">

              {item.breakfast}<br />
              {item.lunch}<br />
              {item.dinner}
            </p>
          </div>
        ))}
      </section>

      <section className="food-timetable">
        <h2 className="infohostel-title text-brwn dark:text-drkt">{data2.category}</h2>


        <table className="food-table">
          <thead>
            <tr>
              <th>Day</th>
              {Object.keys(data2.content[0]?.hostel_menu[0] || {})
                .filter(key => key !== "day")
                .map((mealKey, index) => (
                  <th key={index}>
                    {mealKey.charAt(0).toUpperCase() + mealKey.slice(1)}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {data2.content[0]?.hostel_menu[0]?.day?.map((day, i) => (
              <tr key={i}>
                <td>{day}</td>
                {Object.keys(data2.content[0].hostel_menu[0])
                  .filter(key => key !== "day")
                  .map((mealKey, j) => (
                    <td key={j}>
                      {data2.content[0].hostel_menu[0][mealKey][i]}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};


export default InfoHostel;
