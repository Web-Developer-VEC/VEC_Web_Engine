import React, { useEffect, useState } from "react";
import LibraryIntro from "./LibraryIntro";
import LibrarySections from "./Libraryinfra";
import Banner from '../../Banner'
import axios from "axios";
import SideNav from "../SideNav";
import LIBMemb from "./LIBMemb"; // Adjust path if needed
import LIBFacl from "./LIBFacl";
import LIBHod from "./LIBHod";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router";

const LibraryLayout = ({toggle, theme}) => {
  const [libraryData, setLibraryData] = useState(null);
    const [lib, setLib] = useState("About")
    const navigate = useNavigate();
    const navData = {
        "About": <LibraryIntro about={libraryData} />,
        "HOD's message":<LIBHod lib={lib} data={libraryData} />,
        "Staff":<LIBFacl lib={lib} faculty={libraryData}/>,
        "Advisory committee members": <LibrarySections data={libraryData} lib={lib}/>,
        "Membership Details": <LIBMemb lib={lib} data={libraryData} />,
        "Collection": {
          "Books": <LibrarySections faculty={libraryData ? libraryData["faculty & Staff"] : null}
              membership={libraryData ? libraryData["membership_details"] : null} lib={lib}/>,
            "Journals": <LibrarySections faculty={libraryData ? libraryData["faculty & Staff"] : null}
              membership={libraryData ? libraryData["membership_details"] : null} lib={lib}/>,
            "Newspapers": <LibrarySections faculty={libraryData ? libraryData["faculty & Staff"] : null}
              membership={libraryData ? libraryData["membership_details"] : null} lib={lib}/>,
        },
        "Services": <LibrarySections data={libraryData} lib={lib}/>,
        "Digital Library & E-Resources": <LibrarySections data={libraryData} lib={lib}/>,
        "OPAC": <LibrarySections  lib={lib}/>,
        "Library Resources": <LibrarySections data={libraryData} lib={lib}/>,
        "Downloads": <LibrarySections data={libraryData} lib={lib}/>
    };
    
    useEffect(() => {
      const fetchData = async () => {
        
        const typeMap = {
          "About": "about_the_library",
          "HOD's message": "HOD",
          "Staff": "Faculty_Staff",
          "Advisory committee members": "advisors",
          "Membership Details": "membership_details",
          "Services": "library_services",
          "Digital Library & E-Resources": "digital_libraries",
          "Library Resources": "library_resources",
          "Downloads": "Ebook_Sources"
        }
        
        try {
          const response = await axios.post("/api/main-backend/library",
            {
              type: typeMap[lib]
            }
          );
          const data = response.data.data;
          setLibraryData(data);
        } catch (err) {
          console.error("Error Fetching Data:", err.message);
          if (err.response.data.status === 429) {
            navigate('/ratelimit', { state: { msg: err.response.data.message}})
          }
        }
      };
  
      fetchData();
    }, [lib]);

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
    <>
  <Banner theme={theme} toggle={toggle}
    backgroundImage={"./Banners/Vid_banner/Lib.mp4"}
    headerText="Library"
    subHeaderText="The only thing that you absolutely have to know, is the location of the library."
    isVideo = {true}
  />
    {/* <LibraryBanner/> */}
    {libraryData ? (
      <SideNav sts={lib} setSts={setLib} navData={navData} cls={""} />
    ) : (
        <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
        </div>
    )}
    </>
  );
};

export default LibraryLayout;
