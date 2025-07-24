import React from "react";
import "./InfoHostel.css";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";

const InfoHostel = () => {

    const [HostelData, setHostelUcData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responce = await axios.get('/api/hostel_menu');
                const data = responce.data[0];
                setHostelUcData(data.menu)
            } catch (error) {
                console.error("Error fetching about us data",error);
            }
        }
        fetchData();
    }, [])

  return (
    <div className="infohostel-container bg-prim dark:bg-drkp">
      <h1 className="infohostel-title text-brwn dark:text-drkt">Timing Information</h1>

      <section className="HI-grid">
        <div className="HI-card bg-prim dark:bg-drkb border-l-4 border-secd dark:border-drks">
            <h2 className="HI-card-title text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks">Mess Timing</h2>
            <p className="HI-card-text text-text dark:text-drkt">
            Breakfast: 7:00 AM - 9:00 AM <br />
            Lunch: 12:00 PM - 2:00 PM <br />
            {/* Dinner: 7:00 PM - 9:00 PM */}
            </p>
        </div>
        <div className="HI-card bg-prim dark:bg-drkb border-l-4 border-secd dark:border-drks">
            <h2 className="HI-card-title text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks">Study Timing</h2>
            <p className="HI-card-text">
            Morning Study: 6:00 AM - 8:00 AM <br />
            Evening Study: 6:00 PM - 10:00 PM <br />
            Night Study: 10:30 PM - 12:00 AM
            </p>
        </div>
        </section>

        {/* Food Timetable */}
  <section className="food-timetable">
    <h2 className="infohostel-title text-brwn dark:text-drkt">Menu</h2>
    <table className="food-table">
      <thead>
        <tr>
          <th>Day</th>
          <th>Breakfast</th>
          <th>Lunch</th>
          <th>Snacks</th>
          <th>Dinner</th>
        </tr>
      </thead>
      <tbody>
          {HostelData?.day?.map((day,i) => (
            <>
            <tr>
              <td>{day}</td>
              <td>{HostelData?.Breakfast[i]}</td>
              <td>{HostelData?.lunch[i]}</td>
              <td>{HostelData?.snacks[i]}</td>
              <td>{HostelData?.dinner[i]}</td>
            </tr>
            </>
          ))}
      </tbody>
    </table>
  </section>
    </div>
  );
};

export default InfoHostel;
