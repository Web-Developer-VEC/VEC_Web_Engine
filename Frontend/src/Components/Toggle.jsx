import React from "react";
import Sun from "./Assets/sun.png";
import Moon from "./Assets/moon.png";

const Toggle = ({ attr, toggle, theme }) => {
  return (
    <div className={`z-[50] ${attr}`}>
      {/* ✅ Desktop version (visible from sm and above) */}
      <div className="hidden sm:flex gap-2 mt-2 size-12 px-2 py-2">
        <img className="h-8 w-auto p-1 grayscale-0 dark:grayscale" src={Sun} alt="Dark" />
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            onChange={toggle}
            checked={theme !== "light"}
          />
          <div className="relative h-6 w-12 bg-gray-200 rounded-full peer dark:bg-gray-700 
            peer-checked:after:translate-x-full
            after:content-[''] after:absolute after:top-0.5 after:start-1 after:bg-white
            after:border-gray-300 after:border after:rounded-full after:size-5
            after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600">
          </div>
        </label>
        <img className="h-8 w-auto p-1.5 grayscale dark:grayscale-0" src={Moon} alt="light" />
      </div>

<div className="sm:hidden absolute top-11 right-4 z-[1000]">
  <button onClick={toggle}>
    <img
      src={theme === "light" ? Sun : Moon}
      alt="Toggle Theme"
      className="h-10 w-10 z-[100000]"
    />
  </button>
</div>

    </div>
  );
};

export default Toggle;
