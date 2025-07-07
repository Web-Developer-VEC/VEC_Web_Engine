import React, { useState } from 'react'
import Naac from './naac'
import NBA_F from './NBA_F'
import NIRF from './nirf'
import Banner from '../../Banner'
import SideNav from '../SideNav'
import LoadComp from '../../LoadComp'
import { useEffect } from 'react'

const Accredation = ({toggle,theme}) => {

    const [naac,setNaac] = useState("NAAC")

    const navData = {
        "NAAC": <Naac/>,
        "NBA": <NBA_F/>,
        "NIRF":<NIRF/>
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
                backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
                headerText="Accredation"
                subHeaderText="Accredation"
            />

             <div className="">
                 {/* <SideNav sts={iqa} setSts={setIqa} navData={navData} cls={""}/> */}
                            <SideNav  sts={naac} setSts={setNaac} navData={navData} cls={""}/>
                        </div>


  </>
}



export default Accredation