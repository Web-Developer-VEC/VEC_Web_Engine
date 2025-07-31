import React, { useEffect, useState } from "react";
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
import LoadComp from "../../LoadComp"

const NSS = ({ toggle, theme}) => {
  const [nssData, setNssData] = useState(null);
  const [nss, setNss] = useState("About NSS");

  const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);
  useEffect(() => {
    const typeMatch = {
        "About NSS": "about",
        "News & Updates": "news_updates",
        "Recent Events": "events",
        "Team & Coordinators": "team"
    }
    const fetchData = async () => {
        try {
            const response = await axios.post('/api/main-backend/nss',
                {
                    type: typeMatch[nss]
                }
            )
            setNssData(response.data.data)
        } catch (error) {
            console.error("Error fetching data:", error.message)
        }
    }
    fetchData()
}, [nss]);

  if (!isOnline) {
        return (
          <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
            <LoadComp txt={"You are offline"} />
          </div>
        );
    }

  const navData = {
    "About NSS": <NSSContent data={nssData}/>,
    "News & Updates": <NotificationBox data={nssData} />,
    "Recent Events": <CarouselNSS data={nssData} />,
    "Team & Coordinators": (<Coordinators data={nssData} 
        // students={nssData?.students}
      />
    ),
    // "Awards & Recognition": <Awardsrec data={nssData?.awards} />
  };

  return (
    <main>
      <Banner
        backgroundImage="./Banners/NSS.webp"
        headerText="NATIONAL SERVICE SCHEME (NSS)"
        subHeaderText="NOT ME BUT YOU."
        toggle={toggle} theme={theme}
      />
      <SideNav sts={nss} setSts={setNss} navData={navData} cls={""} />
    </main>
  );
};

export default NSS;
