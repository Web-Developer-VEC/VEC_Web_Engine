import React, { useEffect, useState } from "react";

import Transportcarousel from "./Transportcarousel";
import PDF from "./PDF";
import Transportvideo from "./TransportVideo";
import LoadComp from '../../LoadComp'

const Transport = () => {
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
    }, []);

    if (!isOnline) {
        return (
          <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
            <LoadComp txt={"You are offline"} />
          </div>
        );
    }

    return (
        <div style={{ paddingBottom: "40px"
            // backgroundColor: "#f8f9fa"
        }}>
            <div style={{ position: "relative" }}>
                <Transportvideo />
            </div>
            
            <div>
                <PDF/>
            </div>
            
            {/* Styled Transport Facilities Paragraph */}
            <div className="transport-wrapper" style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <div className="border-l-4 border-secd dark:border-drks ml-2 md:m-0 rounded-md" style={{
                    maxWidth: "900px", 
                    // margin: "auto",
                    textAlign: "justify",
                    marginRight:"20px",
                    padding: "20px",
                    fontSize: "18px", 
                    lineHeight: "1.8", 
                    // color: "#333",
                    fontWeight: "400",
                    // backgroundColor: "#f8f9fa",
                    // borderLeft: "5px solid #fdb515",  // Yellow highlight border
                    paddingLeft: "20px",
                }}>
                    <h2 className="text-secd dark:text-drks border-b-2 border-secd dark:border-drks" style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        color: "#800000",
                        display: "inline-block",
                        paddingBottom: "5px",
                        marginBottom: "10px"
                    }}>
                        TRANSPORT FACILITIES
                    </h2>
                    <p>
                        Our college provides top-notch transport facilities with a fleet of renowned and brand-new buses, ensuring safe, comfortable, and efficient travel for students and staff.  
                        The buses are well-maintained, air-conditioned, and equipped with modern amenities. Covering multiple routes across the city and nearby areas, our transport system guarantees punctuality and convenience.  
                        With experienced drivers and regular maintenance checks, we prioritize the safety and ease of commuting for all.
                    </p>
                </div>
            </div>

            {/* Centered SportsInfra Section */}
            <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                marginTop: "40px" 
            }}>
                <Transportcarousel/>
            </div>

        </div>
    );
};

export default Transport;
