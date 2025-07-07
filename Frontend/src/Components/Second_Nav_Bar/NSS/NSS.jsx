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

const NSS = () => {
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
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/nss");
        const data = res.data[0]; 
        const parsedData = {
          faculty: data.coordinater,
          students: data.members,
          events: data.events,
          awards: data.awards,
          news: data.news
        };
        console.log("Ajay",parsedData);
        
        setNssData(parsedData);
      } catch (err) {
        console.error("Error fetching NSS data:", err.message);
      }
    };

    fetchData();
  }, []);

  if (!isOnline) {
        return (
          <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
            <LoadComp txt={"You are offline"} />
          </div>
        );
    }

  const navData = {
    "About NSS": <NSSContent />,
    "News & Updates": <NotificationBox data={nssData?.news} />,
    "Recent Events": <CarouselNSS data={nssData?.events || null} />,
    "Team & Coordinators": (<Coordinators faculty={nssData?.faculty} 
        students={nssData?.students}
      />
    ),
    "Awards & Recognition": <Awardsrec data={nssData?.awards} />
  };

  return (
    <main>
      <Banner
        backgroundImage="./nssbanner.jpg"
        headerText="NATIONAL SERVICE SCHEME (NSS)"
        subHeaderText="NOT ME BUT YOU."
      />
      <SideNav sts={nss} setSts={setNss} navData={navData} cls={""} />
    </main>
  );
};

export default NSS;
