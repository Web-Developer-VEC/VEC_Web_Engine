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

const LibraryLayout = ({toggle, theme}) => {
    const [libraryData, setLibraryData] = useState(null);
    const [lib, setLib] = useState("About")
    const navData = {
        "About": <LibraryIntro about={libraryData ? libraryData["about_the_library"] : null} />,
        "HOD's message":<LIBHod lib={lib} />,
        "Staff":<LIBFacl lib={lib} />,
        "Advisory committee members": <LibrarySections faculty={libraryData ? libraryData["faculty & Staff"] : null}
              membership={libraryData ? libraryData["membership_details"] : null} lib={lib}/>,
        "Membership Details": <LIBMemb lib={lib} />,
        "Collection": {
            "Books": <LibrarySections faculty={libraryData ? libraryData["faculty & Staff"] : null}
              membership={libraryData ? libraryData["membership_details"] : null} lib={lib}/>,
            "Journals": <LibrarySections faculty={libraryData ? libraryData["faculty & Staff"] : null}
              membership={libraryData ? libraryData["membership_details"] : null} lib={lib}/>,
            "Newspapers": <LibrarySections faculty={libraryData ? libraryData["faculty & Staff"] : null}
              membership={libraryData ? libraryData["membership_details"] : null} lib={lib}/>,
        },
        "Services": <LibrarySections faculty={libraryData ? libraryData["faculty & Staff"] : null}
              membership={libraryData ? libraryData["membership_details"] : null} lib={lib}/>,
        "Digital Library & E-Resources": <LibrarySections faculty={libraryData ? libraryData["faculty & Staff"] : null}
              membership={libraryData ? libraryData["membership_details"] : null} lib={lib}/>,
        "OPAC": <LibrarySections faculty={libraryData ? libraryData["faculty & Staff"] : null}
              membership={libraryData ? libraryData["membership_details"] : null} lib={lib}/>,
        "Library Resources": <LibrarySections faculty={libraryData ? libraryData["faculty & Staff"] : null}
              membership={libraryData ? libraryData["membership_details"] : null} lib={lib}/>,
        "Downloads": <LibrarySections faculty={libraryData ? libraryData["faculty & Staff"] : null}
              membership={libraryData ? libraryData["membership_details"] : null} lib={lib}/>
    };
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get("/api/library");
          const data = response.data;
          setLibraryData(data[0]); // Assuming the API returns an array
        } catch (err) {
          console.error("Error Fetching Data:", err.message);
        }
      };
  
      fetchData();
    }, []);

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
