import React from "react"
import LoadComp from "../../LoadComp"




function Home ({home}) {
    let data
    if (home) {
        data = home[0]
    }
    return(
        <>
            {home ? (
            <div className="ic-home-container">
                <div className="ic-about-section dark:bg-drkb border-l-4 border-secd dark:border-drks">
                    <h3 className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1">About Us</h3>
                    <p className="ic-centered-text text-text dark:text-drkt">
                        {data?.about}
                    </p>    
                </div>

                <div className="ic-vision-mission-grid">
                    <div className="ic-vm-card dark:bg-drkb border-l-4 border-secd dark:border-drks">
                        <h3 className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1">Our Vision</h3>
                        <p>{data?.vision}</p>
                    </div>

                    <div className="ic-vm-card dark:bg-drkb border-l-4 border-secd dark:border-drks">
                        <h3 className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1">Our Mission</h3>
                            {/* <p>{home.mission[0]}</p> */}
                            {data?.mission?.map((mission,index)=>(
                                <ol key={index}>
                                    <li>{mission}</li>
                                </ol>
                            ))}
                        
                    </div>
                </div>
            </div>
            ) : (
                <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
                    <LoadComp />
                </div>
            )}
        </>
    )
}

export default Home