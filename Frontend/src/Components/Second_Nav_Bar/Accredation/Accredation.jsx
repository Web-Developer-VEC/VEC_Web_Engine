import React, { useState } from 'react'
import Naac from './naac'
import NBA_F from './NBA_F'
import NIRF from './nirf'
import Banner from '../../Banner'
import SideNav from '../SideNav'
import LoadComp from '../../LoadComp'
import { useEffect } from 'react'
import IQauge from './igauge'


const Accredation = ({toggle,theme}) => {

    const [naac,setNaac] = useState("NAAC")

    const navData = {
        "NAAC": <Naac />,
        "NBA": <NBA_F />,
        "NIRF":<NIRF />,
        "QS Rating": <IQauge />
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