import React from "react";
import Sun from "./Assets/sun.png";
import Moon from "./Assets/moon.png";

const Toggle = ({attr, toggle, theme}) => {
    return (
        <div className={`flex gap-2  mt-2 size-12 px-2 py-2 z-[50] ${attr}`}>
            <img className="h-8 w-auto p-1 grayscale-0 dark:grayscale" src={Sun} alt="Dark"/>
            <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" onChange={toggle}
                       checked={(theme !== "light")}/>
                <div className="relative h-6 w-12 bg-gray-200 rounded-full peer
                            dark:bg-gray-700 peer-checked:after:translate-x-full
                            rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white
                            after:content-[''] after:absolute after:top-0.5 after:start-1 after:bg-white
                            after:border-gray-300 after:border after:rounded-full after:size-5
                            after:transition-all dark:border-gray-600 peer-checked:bg-blue-600
                            dark:peer-checked:bg-blue-600"></div>
                {/*<span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Toggle me</span>*/}
            </label>
            <img className="h-8 w-auto p-1.5 grayscale dark:grayscale-0" src={Moon} alt="light"/>
        </div>
    );
};

export default Toggle;
