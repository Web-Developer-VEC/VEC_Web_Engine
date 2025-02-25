import React, { useEffect, useState } from "react";
import NSSCarousel from "./NSSCarousel";
import NSSContent from "./NSSContent";
import Banner from "../../Banner";
import NSSManual from "./NSSManual";
import Coordinators from "./NSSCoordinatiors";
import axios from "axios";

const NSS = () => {
  const [NssData, setNssData] = useState(null);
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
    <div>
      <Banner
        backgroundImage="./nssbanner.jpg"
        headerText="NATIONAL SERVICE SCHEME (NSS)"
        subHeaderText="NOT ME BUT YOU."
      />

      <NSSCarousel data={NssData && NssData.length > 2 ? NssData[2] : null} />
      <NSSContent />
      <NSSManual />
      <Coordinators 
        faculty={NssData && NssData.length > 0 ? NssData[0] : null} 
        students={NssData && NssData.length > 1 ? NssData[1] : null} 
      />
    </div>
  );
};

export default NSS;
