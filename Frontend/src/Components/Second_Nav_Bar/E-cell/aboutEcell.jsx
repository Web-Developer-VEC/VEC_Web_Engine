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



const Ecell = ({toggle,theme}) => {
    

    const [section, setEcell] = useState("About E-cell")
    
   const navData = {
        "About E-cell": <Home/>,
        "Committee":<COMMITE/>,
        "Enterpreneur":<EnterpreN/>,
        "Activity":<Activ/>,
        "Gallery":<Gall/>
        
    }


    return (
        <>
            <Banner theme={theme} toggle={toggle}
            backgroundImage={"./Banners/placementbanner.webp"}
            headerText="E - Cell"
            subHeaderText="Turning Ideas into Action, and Dreams into Enterprises."
        />
                <SideNav navData={navData} sts={section} setSts={setEcell}/>
      {/* <SideNav sts={lib} setSts={setLib} navData={navData} cls={""} /> */}

                
                </>

                

    )
    

}



export default Ecell;

        