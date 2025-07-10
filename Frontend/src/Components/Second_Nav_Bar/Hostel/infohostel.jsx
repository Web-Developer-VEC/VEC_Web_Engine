import React from "react";
import "./InfoHostel.css";

const InfoHostel = () => {
  return (
    <div className="infohostel-container bg-prim dark:bg-drkp">
      <h1 className="infohostel-title text-brwn dark:text-drkt">Timing Information</h1>

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
        <tr>
          <td>Monday</td>
          <td>Pongal, Coconut chutney, Sambar, Vada, Coffee / Milk </td>
          <td>White Rice, Sambar, Rasam, Poriyal, Pickle, Butter Milk & Appalam </td>
          <td>Masala Vada, Tea & Milk</td>
          <td>Parotta, Chicken Curry, Veg Kurma, Cut Fruits,White Rice, Rasam, Milk & Banana</td>
        </tr>
        <tr>
          <td>Tuesday</td>
          <td>Idly, Kara Chutney, Vada Curry, Coffee / Milk </td>
          <td>White Rice, Egg Kuzhambu, Rasam, Kootu, Pickle, Curd, Appalam </td>
          <td>Cream Bun, Tea & Milk</td>
          <td>Poori, Chana Masala, Curd Rice, Milk & Banana </td>
        </tr>
        <tr>
          <td>Wednesday</td>
          <td>Onion Utthappam, Coconut Chutney, Sambar, Coffee / Milk </td>
          <td>Varity Rice, Boiled Egg, Rasam, Poriyal, Pickle, Curd Rice, Appalam & Sweet</td>
          <td>Mini Samosa, Tea & Milk </td>
          <td>Rice Kushka, Chicken Thokku, Gobi 65, Milk & Banana</td>
        </tr>
        <tr>
          <td>Thursday</td>
          <td>Rava Kitchedi, Sambar, Coconut Chutney, Bread, Jam , Butter ,Omelet & Coffee / Milk </td>
          <td>White Rice, Veg Pappu, Poriyal, Pickle, Butter Milk & Appalam</td>
          <td>Veg Puff, Tea & Milk</td>
          <td>Veg Pulao, Meal Maker Masala, Curd Rice,Milk & Banana</td>
        </tr>
        <tr>
          <td>Friday</td>
          <td>Veg Dosa, Peanut Chuttney, Sambar, Coffee / milk</td>
          <td>White Rice, Sambar, Rasam, Poriyal, Pickle, Butter milk, Appalam & Payasam</td>
          <td>Valaka bajji, Tea & Coffee</td>
          <td>Chappathi, Egg Curry, White Rice, Rasam, Milk & Banana</td>
        </tr>
        <tr>
          <td>Saturday</td>
          <td>Poori, Chana Masala, Coffee / Milk </td>
          <td>White Rice, Vathakuzhambu, Rasam, Kootu, Pickle, Curd & Appalam</td>
          <td>Banana Cake, Tea & Milk</td>
          <td>Kal Dosa, Sambar, Kara Chutney, Milk & Banana</td>
        </tr>
        <tr>
          <td>Sunday</td>
          <td>Bread, Jam, Butter, Omelet, Cucumber Salad, Coffee / Milk</td>
          <td>Chicken Briyani, Veg Briyani, Onion Raitha, Brinjal Salna, Boiled Egg, Panner Gravy & Ice Cream </td>
          <td>Veg Cutlet, Tea & Milk</td>
          <td>Chappathi, Veg Kurma, Milk & Banana</td>
        </tr>
      </tbody>
    </table>
  </section>
    </div>
  );
};

export default InfoHostel;
