import React from "react";
import Sun from "./Assets/sun.png";
import Moon from "./Assets/moon.png";

const Toggle = ({ attr, toggle, theme }) => {
  return (
    <div className={`z-[50] ${attr}`}>
      {/* ✅ Desktop version (visible from sm and above) */}
      <div className="flex gap-0 md:gap-2 mt-2 size-12 px-2 py-2 items-center">
        <img className="h-6 md:h-8 w-auto p-1 grayscale-0 dark:grayscale" src={Sun} alt="Dark" />
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            onChange={toggle}
            checked={theme !== "light"}
          />
          <div className="relative h-4 w-8 md:h-6 md:w-12 bg-gray-200 rounded-full peer dark:bg-gray-700 
            peer-checked:after:translate-x-full
            after:content-[''] after:absolute after:top-0.5 after:start-1 after:bg-white
            after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 md:after:h-5 md:after:w-5
            after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600">
          </div>
        </label>
        <img className="h-6 md:h-8 w-auto p-1.5 grayscale dark:grayscale-0" src={Moon} alt="light" />
      </div>
    </div>
  );
};

export default Toggle;
