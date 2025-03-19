import React, {useEffect, useState} from "react";
import NSSCarousel from "./NSSCarousel";
import NSSContent from "./NSSContent";
import Banner from "../../Banner";
import NSSManual from "./NSSManual";
import Coordinators from "./NSSCoordinatiors";
import axios from "axios";
import SideNav from "../SideNav";
import CarouselNSS from "./Couroselnss";
import Awardsrec from "./AwardsRecognition";
import NotificationBox from "./NewsUpdates";

function NSSAwd() {
    return (
        <h2 className="text-2xl text-accn">Awards</h2>
    );
}

const NSS = () => {
    const [nss, setNss] = useState("About NSS");
    const [NssData, setNssData] = useState(null);
    const navData = {
        "About NSS": (<><NSSCarousel data={NssData && NssData.length > 2 ? NssData[2] : null}/><NSSContent /></>),
        "News & Updates": <NotificationBox />,
        "Recent Events": <CarouselNSS/>,
        "Team & Coordinators": <Coordinators
            faculty={NssData && NssData.length > 0 ? NssData[0] : null}
            students={NssData && NssData.length > 1 ? NssData[1] : null}
        />,
        "Awards & Recognition": <Awardsrec />
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("/api/nss");
                setNssData(response.data);
            } catch (err) {
                console.error("Error Fetching Data:", err.message);
            }
        };

        fetchData();
    }, []);

    return (
        <main className="">
            <Banner
                backgroundImage="./nssbanner.jpg"
                headerText="NATIONAL SERVICE SCHEME (NSS)"
                subHeaderText="NOT ME BUT YOU."
            />
            {/*<nav className="flex flex-wrap gap-y-2 gap-x-2 lg:gap-y-0 justify-center lg:grid lg:float-left*/}
            {/*    w-screen lg:w-fit lg:max-w-[20vw] text-xl ml-6 my-8">*/}
            {/*    {Object.keys(navData).map((itm, ind) => (*/}
            {/*        <button className={`px-4 py-2 border-2 border-text dark:border-drkt */}
            {/*        hover:bg-accn/50 dark:hover:bg-drka/50   */}
            {/*        ${(nss === itm)? "bg-accn dark:bg-drka text-prim dark:text-drkp font-semibold": ""}*/}
            {/*      ${(ind + 1 === Object.keys(navData).length) ? "" : "lg:border-b-transparent"}`} key={ind}*/}
            {/*        type={"button"} onClick={() => setNss(itm)}>{itm}</button>*/}
            {/*    ))}*/}
            {/*</nav>*/}
            {/*{navData[nss]}*/}
            <SideNav sts={nss} setSts={setNss} navData={navData} cls={""} />
        </main>
    );
};

export default NSS;
