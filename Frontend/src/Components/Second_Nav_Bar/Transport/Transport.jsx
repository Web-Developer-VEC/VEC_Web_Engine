import React, { useEffect, useState } from "react";
import axios from "axios"; 
import Transportcarousel from "./Transportcarousel";
import PDF from "./PDF";
import Transportvideo from "./TransportVideo";
import LoadComp from '../../LoadComp'
import Toggle from "../../Toggle";

const Transport = ({ theme, toggle }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [transportData, settransportData] = useState([]);
    const [loading, setLoading] = useState(true);

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
    
      useEffect(() => {
        const fetchData = async () => {
          try{
            const response = await axios.post('/api/main-backend/transport',
              {
                type: "transport"
              }
            ) 
            settransportData(response.data.data);
            setLoading(false)
          }  catch (error) {
                    console.error("Error fetching data:", error.message)
                    setLoading(false)
          }
        };
        
      fetchData();
    
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
       <div className="relative w-full h-[200px] overflow-hidden flex items-center justify-center md:h-[400px] h-[250px]">
            <Transportvideo/>
            <Toggle toggle={toggle} theme={theme}
                attr="absolute top-[10%] lg:top-[1%] left-[0.3%] lg:left-[0.3%] h-12 w-[11%] bg-[#0000001a] backdrop-blur-[4px]
                rounded-br-xl"/>
            <div class="hidden md:block absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded">VEC Transport Facilities</div>
        </div>
            
            <div>
                {transportData?.[0]?.route && ( <PDF pdfRoute={transportData[0].route} /> )}
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
                    fontWeight: "400",
                    paddingLeft: "20px",
                }}>
                    <h2 className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks" style={{
                        fontSize: "24px",
                        fontWeight: "bold",
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
                <Transportcarousel items={transportData} loading={loading}/>
            </div>

        </div>
    );
};

export default Transport;
