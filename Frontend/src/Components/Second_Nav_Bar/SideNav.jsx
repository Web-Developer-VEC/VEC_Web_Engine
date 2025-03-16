import React from "react";

const SideNav = ({sts, setSts, navData, cls}) => {
    return (
        <div className={cls + " flex flex-wrap"}>
            <nav className="basis-full h-fit lg:basis-1/5 flex gap-y-2 lg:gap-y-0 gap-x-2 flex-wrap justify-center
                lg:grid lg:float-left w-screen lg:w-fit lg:max-w-[20vw] text-xl my-8 self-start
                transition-all duration-300 ease-in-out">
                {Object.keys(navData).map((itm, ind) => (
                    (Object.keys(navData[itm]).length !== Object.keys(navData).length - 1) ?
                        <label className={`px-2 py-2 border-2 border-text dark:border-drkt min-w-1/2
                            hover:bg-accn/50 dark:hover:bg-drka/50 text-center has-[:checked]:bg-accn/50 
                            has-[:checked]:dark:bg-drka has-[:checked]:text-prim has-[:checked]:dark:text-drkp
                            transition-all duration-300 ease-in-out
                            ${(ind + 1 === Object.keys(navData).length) ? "" : "lg:border-b-transparent"}`}
                           key={ind}
                        >{itm}<input type={"checkbox"} className="peer size-0 checked:mb-3"/>
                            {/*<ul className="hidden lg:grid w-fit lg:max-w-[15vw] text-xl border-2">*/}
                                {Object.keys(navData[itm]).map((obj, inx) => (
                                    <li className={`px-4 py-2 border-2 border-text dark:border-drkt
                                        transition-all duration-300 ease-in-out animate-[fadIn_0.5s_ease_forwards]
                                        dark:hover:bg-drka/50 hidden peer-checked:block
                                        ${(sts[1] === obj) ? "bg-accn dark:bg-drka text-prim dark:text-drkp font-semibold" 
                                        : "hover:bg-accn/0 bg-prim dark:bg-drkp text-text dark:text-drkt"}
                                        ${(inx + 1 === Object.keys(navData[itm]).length) ? "" : "lg:border-b-transparent"}`}
                                        key={inx} type={"button"} onClick={(e) =>
                                    {setSts([itm,obj]);e.target.parentElement.children[0].checked = false}}
                                        style={{animationDelay: `${inx * 100}ms`}}>{obj}</li>
                                ))}
                            {/*</ul>*/}
                        </label>
                        :
                        <button className={`px-4 py-2 border-2 border-text dark:border-drkt 
                            hover:bg-accn/50 dark:hover:bg-drka/50 transition-all duration-300 ease-in-out  
                            ${(sts === itm) ? "bg-accn dark:bg-drka text-prim dark:text-drkp font-semibold" : ""}
                            ${(ind + 1 === Object.keys(navData).length) ? "" : "lg:border-b-transparent"}`} key={ind}
                                type={"button"} onClick={() => setSts(itm)}>{itm}</button>

                ))}
            </nav>
            <div className="basis-full lg:basis-9/12 overflow-hidden">
                {(Array.isArray(sts))? navData[sts[0]][sts[1]]: navData[sts]}
            </div>
        </div>
    )
}

export default SideNav