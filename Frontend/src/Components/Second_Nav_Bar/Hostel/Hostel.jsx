import React, { useEffect, useState } from "react";
import Banner from "../../Banner";
import AboutHostel from "./aboutHost";
import HostelFacilities from "./hostalfacilities";
import Warden from "./warden";
import HostelLogin from "./LoginHost";
import Admissions from "./AdmissionHost";
import axios from "axios";
// import {useState} from "react";
import SideNav from "../SideNav";
import InfoHostel from "./infohostel";
import LoadComp from '../../LoadComp'
import DigiHostal from "./DigiHostel";

export default function HostelPage({toggle, theme}) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hostelData,setHostelData] = useState();
  const [loading,setLoading] = useState(true);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);
    const navData = {
       "About Hostel": <AboutHostel hostelData={hostelData}/>,
        "Hostel Facilities": <HostelFacilities hostelData={hostelData} />,
        "Warden details": <Warden  hostelData={hostelData}/>,
        // "Mess Timings": <AboutHostel/>,
        // "Study Hours": <AboutHostel />,
        "General info": <InfoHostel hostelData={hostelData}/>,
        // "Digital Hostel ": <DigiHostel/>
        // "Leave": <AboutHostel />
    }
  const [hos, setHos] = useState(Object.keys(navData)[0])

useEffect(() => {
  const typeMatch = {
    "About Hostel":"about",
    "Hostel Facilities":"hostel_facilities",
    "Warden details":"warden",
    "General info":"general_info",
  }
  const fetchData = async () => {
    try {
      const response = await axios.post('/api/main-backend/hostel_menu', {
        type: typeMatch[hos]
      });

      const data = response.data.data;
      setHostelData(data);
      console.log(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error.message);
      setLoading(true);
    }
  };

  fetchData()
}, [hos]);

   
     if (!isOnline) {
        return (
          <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
            <LoadComp txt={"You are offline"} />
          </div>
        );
    }


  return (
    <>
          <Banner toggle={toggle} theme={theme}
        backgroundImage="./Banners/Hostel.webp"
        headerText="VEC Hostel"
        subHeaderText="A home away from home, where comfort meets community and learning thrives in a peaceful, secure environment"
        />
        <SideNav sts={hos} setSts={setHos} navData={navData} />
    </>
  );
}
