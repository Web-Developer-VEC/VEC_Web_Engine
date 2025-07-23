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



const Ecell = ({toggle,theme}) => {


    const [home,setHome]=useState({})
    const [committee,setCommittee]=useState({})
    const [enterpreneur,setEnterpreneur]=useState({})
    const [activity,setActivity]=useState({})
    const [gallery,setGallery]=useState({})
    useEffect(()=> {
        const fetchData = async () =>{

            const response = await axios.get('/api/ecell');
            const data = response.data[0]

            setHome(data.home)
            setCommittee(data.committee)
            setEnterpreneur(data.entrepreneur)
            setActivity(data.activity)
            setGallery(data.gallery)



        }
      fetchData()}
  ,[])

    

    const [section, setEcell] = useState("About E-cell")
    
   const navData = {
        "About E-cell": <Home home={home}/>,
        "Committee":<COMMITE committee={committee}/>,
        "Enterpreneur":<EnterpreN enterpreneur={enterpreneur}/>,
        "Activity":<Activ activity={activity}/>,
        "Gallery":<Gall gallery={gallery}/>
    }


    return (
        <>
            <Banner theme={theme} toggle={toggle}
            backgroundImage="./Banners/IIC.webp"
            headerText="E - Cell"
            subHeaderText="Turning Ideas into Action, and Dreams into Enterprises."
            />
                <SideNav navData={navData} sts={section} setSts={setEcell} backButton={true}/>

                
        </>
    )
}



export default Ecell;

        