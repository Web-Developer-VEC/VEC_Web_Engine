import React from "react";
import NSSCarousel from "./NSSCarousel";
import NSSContent from "./NSSContent";
import Banner from "../../Banner";
import NSSManual from "./NSSManual";
import Coordinators from "./NSSCoordinatiors";

const NSS = ({toggle, theme}) => {
    return (
       <div>
        <Banner theme={theme} toggle={toggle}
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
