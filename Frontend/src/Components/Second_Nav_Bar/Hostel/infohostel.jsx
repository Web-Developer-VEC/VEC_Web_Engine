import React from "react";
import "./InfoHostel.css";

const InfoHostel = () => {
  return (
    <div className="infohostel-container bg-prim dark:bg-drkp">
      <h1 className="infohostel-title text-brwn dark:text-drkt">Hostel Information</h1>

      <section className="HI-grid">
        <div className="HI-card bg-prim dark:bg-drkb border-l-4 border-secd dark:border-drks">
            <h2 className="HI-card-title text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks">Mess Timing</h2>
            <p className="HI-card-text text-text dark:text-drkt">
            Breakfast: 7:00 AM - 9:00 AM <br />
            Lunch: 12:00 PM - 2:00 PM <br />
            Dinner: 7:00 PM - 9:00 PM
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
    <h2 className="infohostel-title text-brwn dark:text-drkt">Weekly Food Timetable</h2>
    <table className="food-table">
      <thead>
        <tr>
          <th>Day</th>
          <th>Breakfast</th>
          <th>Lunch</th>
          <th>Dinner</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Monday</td>
          <td>Idli & Sambar</td>
          <td>Rice, Dal, Paneer Curry</td>
          <td>Chapati, Mixed Veg Curry</td>
        </tr>
        <tr>
          <td>Tuesday</td>
          <td>Poori & Aloo Masala</td>
          <td>Rice, Sambar, Cabbage Fry</td>
          <td>Roti, Dal Tadka</td>
        </tr>
        <tr>
          <td>Wednesday</td>
          <td>Dosa & Chutney</td>
          <td>Rice, Rajma, Curd</td>
          <td>Pulao, Mixed Curry</td>
        </tr>
        <tr>
          <td>Thursday</td>
          <td>Uttapam & Chutney</td>
          <td>Rice, Sambhar, Aloo Fry</td>
          <td>Chapati, Chana Masala</td>
        </tr>
        <tr>
          <td>Friday</td>
          <td>Vada & Sambar</td>
          <td>Rice, Dal, Gobi Fry</td>
          <td>Jeera Rice, Kurma</td>
        </tr>
        <tr>
          <td>Saturday</td>
          <td>Upma & Chutney</td>
          <td>Rice, Rasam, Bhindi Fry</td>
          <td>Chapati, Mushroom Curry</td>
        </tr>
        <tr>
          <td>Sunday</td>
          <td>Masala Dosa & Chutney</td>
          <td>Rice, Dal Makhani, Sweet</td>
          <td>Fried Rice, Manchurian</td>
        </tr>
      </tbody>
    </table>
  </section>
    </div>
  );
};

export default InfoHostel;
