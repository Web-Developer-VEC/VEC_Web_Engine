import React, { useEffect, useState } from "react";
import LibraryIntro from "./LibraryIntro";
import LibrarySections from "./Libraryinfra";
import Banner from '../../Banner'
import axios from "axios";
import NCCACarousel from "../NCC/NCC_ARMY comps/NCCACarousel";
import NCCAtable from "../NCC/NCC_ARMY comps/NCCAtable";
import SideNav from "../SideNav";

const LibraryLayout = ({toggle, theme}) => {
    const [libraryData, setLibraryData] = useState(null);
    const [lib, setLib] = useState("About")
    const navData = {
        "About": <LibraryIntro about={libraryData ? libraryData["about_the_library"] : null} />,
        "HOD's message": <LibrarySections faculty={libraryData ? libraryData["faculty & Staff"] : null}
              membership={libraryData ? libraryData["membership_details"] : null} lib={lib}/>,
        "Staff": <LibrarySections faculty={libraryData ? libraryData["faculty & Staff"] : null}
              membership={libraryData ? libraryData["membership_details"] : null} lib={lib}/>,
        "Advisory committee members": <LibrarySections faculty={libraryData ? libraryData["faculty & Staff"] : null}
              membership={libraryData ? libraryData["membership_details"] : null} lib={lib}/>,
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
        "Activities": <LibrarySections faculty={libraryData ? libraryData["faculty & Staff"] : null}
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
  return (
    <>
  <Banner theme={theme} toggle={toggle}
    backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
    headerText="Library"
    subHeaderText="The only thing that you absolutely have to know, is the location of the library."
  />
        <SideNav sts={lib} setSts={setLib} navData={navData} cls={""} />
    </>
  );
};

export default LibraryLayout;
