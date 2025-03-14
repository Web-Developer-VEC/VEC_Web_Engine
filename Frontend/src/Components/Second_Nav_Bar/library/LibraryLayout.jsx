import React, { useEffect, useState } from "react";
import LibraryIntro from "./LibraryIntro";
import LibrarySections from "./Libraryinfra";
import Banner from '../../Banner'
import axios from "axios";
import NCCACarousel from "../NCC/NCC_ARMY comps/NCCACarousel";
import NCCAtable from "../NCC/NCC_ARMY comps/NCCAtable";

const LibraryLayout = ({toggle, theme}) => {
    const [libraryData, setLibraryData] = useState(null);
    const [lib, setLib] = useState("Overview")
    const navData = {
        "Overview": <LibraryIntro about={libraryData ? libraryData["about_the_library"] : null} />,
        "HOD's message": <LibrarySections faculty={libraryData ? libraryData["faculty & Staff"] : null}
              membership={libraryData ? libraryData["membership_details"] : null} lib={lib}/>,
        "Faculty": <LibrarySections faculty={libraryData ? libraryData["faculty & Staff"] : null}
              membership={libraryData ? libraryData["membership_details"] : null} lib={lib}/>,
        "Floor overview": <LibrarySections faculty={libraryData ? libraryData["faculty & Staff"] : null}
              membership={libraryData ? libraryData["membership_details"] : null} lib={lib}/>,
        "Features": <LibrarySections faculty={libraryData ? libraryData["faculty & Staff"] : null}
              membership={libraryData ? libraryData["membership_details"] : null} lib={lib}/>,
        "General Instructions": <LibrarySections faculty={libraryData ? libraryData["faculty & Staff"] : null}
              membership={libraryData ? libraryData["membership_details"] : null} lib={lib}/>,
        "Membership details": <LibrarySections faculty={libraryData ? libraryData["faculty & Staff"] : null}
              membership={libraryData ? libraryData["membership_details"] : null} lib={lib}/>,
        "Borrowing & Circulation": <LibrarySections faculty={libraryData ? libraryData["faculty & Staff"] : null}
              membership={libraryData ? libraryData["membership_details"] : null} lib={lib}/>,
        "Library Sections": <LibrarySections faculty={libraryData ? libraryData["faculty & Staff"] : null}
              membership={libraryData ? libraryData["membership_details"] : null} lib={lib}/>,
        "Library Highlights": <LibrarySections faculty={libraryData ? libraryData["faculty & Staff"] : null}
              membership={libraryData ? libraryData["membership_details"] : null} lib={lib}/>,
        "Multimedia library": <LibrarySections faculty={libraryData ? libraryData["faculty & Staff"] : null}
              membership={libraryData ? libraryData["membership_details"] : null} lib={lib}/>,
        "New Arrivals": <LibrarySections faculty={libraryData ? libraryData["faculty & Staff"] : null}
              membership={libraryData ? libraryData["membership_details"] : null} lib={lib}/>,
        "Library Resources": <LibrarySections faculty={libraryData ? libraryData["faculty & Staff"] : null}
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

        <div className="min-h-screen flex flex-wrap">
            <nav className="basis-full h-fit lg:basis-1/5 flex gap-y-2 lg:gap-y-0 gap-x-2 flex-wrap justify-center
                lg:grid lg:float-left w-screen lg:w-fit lg:max-w-[20vw] text-xl my-8">
                {Object.keys(navData).map((itm, ind) => (
                    <button className={`px-4 py-2 border-2 border-text dark:border-drkt 
                    hover:bg-brwn hover:text-white dark:hover:bg-drka/50   
                    ${(lib === itm) ? "bg-accn dark:bg-drka text-prim dark:text-drkp font-semibold" : ""}
                  ${(ind + 1 === Object.keys(navData).length) ? "" : "lg:border-b-transparent"}`} key={ind}
                            type={"button"} onClick={() => setLib(itm)}>{itm}</button>
                ))}
            </nav>
            <div className="basis-full lg:basis-9/12 overflow-hidden">
                {navData[lib]}
            </div>
        </div>
    </>
  );
};

export default LibraryLayout;
