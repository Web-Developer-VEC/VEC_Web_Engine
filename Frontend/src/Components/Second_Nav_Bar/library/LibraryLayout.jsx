import React, { useEffect, useState } from "react";
import LibraryIntro from "./LibraryIntro";
import LibrarySections from "./Libraryinfra";
import Banner from '../../Banner';
import axios from "axios";

const LibraryLayout = () => {
  const [libraryData, setLibraryData] = useState(null);
  
  console.log("Library Data:", libraryData); // Debugging log

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
      <Banner
        backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
        headerText="Library"
        subHeaderText="The only thing that you absolutely have to know, is the location of the library."
      />

      <div className="min-h-screen p-10 bg-white flex flex-col gap-10">
        <LibraryIntro about={libraryData ? libraryData["about_the_library"] : null} />
        <LibrarySections
          faculty={libraryData ? libraryData["faculty & Staff"] : null}
          collection={libraryData ? libraryData["collection"] : null}
          membership={libraryData ? libraryData["membership_details"] : null}
        />
      </div>
    </>
  );
};

export default LibraryLayout;