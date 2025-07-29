import React, { useState } from 'react'
import Naac from './naac'
import NBA_F from './NBA_F'
import NIRF from './nirf'
import Banner from '../../Banner'
import SideNav from '../SideNav'
import LoadComp from '../../LoadComp'
import { useEffect } from 'react'
import IQauge from './igauge'
import axios from 'axios'


const Accredation = ({toggle,theme}) => {

    const [naac,setNaac] = useState("NAAC");
    const [accdata, setAccData] = useState(null);

    useEffect(() => {
      const fetchData = async () => {
        const typeMatch = {
          "NAAC": "naac",
          "NBA": "nba",
          "NIRF": "nirf",
          "QS Rating": "qs_rating"
        }
        try {
          const response = await axios.post('/api/main-backend/accreditation',
            {
              type: typeMatch[naac]
            }
          )

          const data = response.data.data;

          setAccData(data);
          
        } catch (error) {
          console.error("Error Fetching Accredation Data",error);
        }
      }
      fetchData();
    }, [naac])

    const navData = {
        "NAAC": <Naac data={accdata}/>,
        "NBA": <NBA_F data={accdata}/>,
        "NIRF":<NIRF  data={accdata}/>,
        "QS Rating": <IQauge data={accdata}/>
    };

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



    if (!isOnline) {
        return (
          <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
            <LoadComp txt={"You are offline"} />
          </div>
        );
     }

  return <>

   <Banner
        toggle={toggle} theme={theme}
        backgroundImage="./Banners/Accreditations_Ranking.webp"
        headerText="Accreditations & Ranking"
        subHeaderText="Accreditations"
    />

    <div className="">
      <SideNav  sts={naac} setSts={setNaac} navData={navData} cls={""}/>
    </div>
  </>
}



export default Accredation