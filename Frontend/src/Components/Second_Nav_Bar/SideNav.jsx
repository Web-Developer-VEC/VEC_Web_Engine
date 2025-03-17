import React from "react";

const SideNav = ({sts, setSts, navData, cls}) => {
    return (
        <div className={cls + " grid grid-cols-10 -mt-10 lg:-mt-2"}>
            <nav className="bg-black pt-4 pb-12 flex gap-y-2 gap-x-2 flex-wrap justify-center
                lg:grid text-xl h-full content-start col-start-0 col-span-10 lg:col-span-2
                transition-all duration-300 ease-in-out">
                {Object.keys(navData).map((itm, ind) => (
                    (Object.keys(navData[itm]).length <= 6) ?
                        <label className={`px-4 py-2 border-secd dark:border-drks min-w-1/2 
                            text-prim hover:bg-secd dark:hover:bg-drks hover:text-text dark:hover:text-drkt 
                            has-[:checked]:bg-secd/20 rounded-lg 
                            has-[:checked]:dark:bg-drks has-[:checked]:text-prim has-[:checked]:dark:text-drkp
                            overflow-hidden transition-all duration-300 ease-in-out
                            ${(ind + 1 === Object.keys(navData).length) ? "" : "lg:border-b-transparent"}`}
                           key={ind}
                        >{itm}<input type={"checkbox"} className="peer size-0 checked:mb-3"/>
                            {/*<ul className="hidden lg:grid w-fit lg:max-w-[15vw] text-xl border-2">*/}
                                {Object.keys(navData[itm]).map((obj, inx) => (
                                    <li className={`px-4 py-2 rounded-lg
                                        transition-all duration-300 ease-in-out animate-[fadIn_0.5s_ease_forwards]
                                        dark:hover:bg-drka hidden peer-checked:block hover:text-text dark:hover:text-drkt
                                        ${(sts[1] === obj) ? "bg-secd dark:bg-drks text-text dark:text-drkt font-semibold " +
                                            "hover:bg-secd dark:hover:bg-drks" : "hover:bg-secd dark:hover:bg-drks"}
                                        ${(inx + 1 === Object.keys(navData[itm]).length) ? "" : "lg:border-b-transparent"}
                                        `}
                                        key={inx} type={"button"} onClick={(e) =>
                                    {setSts([itm,obj]);e.target.parentElement.children[0].checked = false}}
                                        style={{animationDelay: `${inx * 100}ms`}}>{obj}</li>
                                ))}
                            {/*</ul>*/}
                        </label>
                        :
                        <button className={`px-4 py-2 border-secd dark:border-drks rounded-lg text-start h-fit 
                            text-prim transition-all duration-300 ease-in-out hover:text-text dark:hover:text-drkt 
                            ${(sts === itm) ? "bg-secd dark:bg-drks text-text dark:text-drkt font-semibold " +
                            "hover:bg-secd dark:hover:bg-drks" : "hover:bg-secd dark:hover:bg-drks"}
                            `
                        } key={ind}
                                type={"button"} onClick={() => setSts(itm)}>{itm}</button>
                            // ${(ind + 1 !== Object.keys(navData).length) ? "" : "lg:border-b-transparent"}
                ))}
            </nav>
            <div className="col-span-10 lg:col-span-8 overflow-hidden">
                {(Array.isArray(sts))? navData[sts[0]][sts[1]]: navData[sts]}
            </div>
        </div>
    )
}

export default SideNav