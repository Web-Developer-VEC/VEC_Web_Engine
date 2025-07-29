import { div, h1 } from "framer-motion/m";
import SideNav from '../SideNav.jsx'
import React from "react";
import { useState,useEffect } from "react";
import Banner from "../../Banner";
import Home from "./Ehome.jsx";
import COMMITE from "./Ecommite.jsx";
import Gall from "./Egalary.jsx";
import style from "./Egalary.css";
import EnterpreN from "./Enterpreneur.jsx";
import Activ from "./Eactivity.jsx";
import axios from "axios";
import LoadComp from "../../LoadComp.jsx";



const Ecell = ({toggle,theme}) => {
    const [section, setEcell] = useState("About E-cell");
    const [ecell,setEcellData] = useState(null);

    useEffect(()=> {
        const typeMap = {
            "About E-cell": "about",
            "Committee": "committee",
            "Enterpreneur": "enterpreneur",
            "Activity": "activity",
            "Gallery": "gallery"
        }
        const fetchData = async () =>{

            const response = await axios.post('/api/main-backend/ecell',
                {
                    type: typeMap[section]
                }
            );
            const data = response.data.data

            setEcellData(data)
        }
      fetchData()
    },[section])

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

    
   const navData = {
        "About E-cell": <Home home={ecell}/>,
        "Committee":<COMMITE committee={ecell}/>,
        "Enterpreneur":<EnterpreN enterpreneur={ecell}/>,
        "Activity":<Activ activity={ecell}/>,
        "Gallery":<Gall gallery={ecell}/>
    }


    return (
        <>
            <Banner theme={theme} toggle={toggle}
            backgroundImage="./Banners/IIC.webp"
            headerText="E - Cell"
            subHeaderText="Turning Ideas into Action and Dreams into Enterprises."
        />
            <SideNav navData={navData} sts={section} setSts={setEcell} backButton={true}/>
        </>
    )
}



export default Ecell;

        