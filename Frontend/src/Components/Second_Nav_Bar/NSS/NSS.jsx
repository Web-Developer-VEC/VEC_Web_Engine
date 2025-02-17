import React from "react";
import NSSCarousel from "./NSSCarousel";
import NSSContent from "./NSSContent";
import Banner from "../../Banner";
import NSSManual from "./NSSManual";
import Coordinators from "./NSSCoordinatiors";

const NSS = () => {
    return (
       <div>
        <Banner
        backgroundImage="./nssbanner.jpg"
        headerText="NATIONAL SERVICE SCHEME(NSS)"
        subHeaderText="NOT ME BUT YOU."
      />

            <NSSCarousel /> 
            <NSSContent/>
            <NSSManual/>
            <Coordinators/>
            </div>
            
    );
};

export default NSS;
