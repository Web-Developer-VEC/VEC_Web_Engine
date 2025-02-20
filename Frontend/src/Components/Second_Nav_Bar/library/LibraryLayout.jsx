import React from "react";
import LibraryIntro from "./LibraryIntro";
import LibrarySections from "./Libraryinfra";
import Banner from '../../Banner'

const LibraryLayout = ({toggle, theme}) => {
  return (
    <>
  <Banner theme={theme} toggle={toggle}
    backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
    headerText="Library"
    subHeaderText="The only thing that you absolutely have to know, is the location of the library."
  />
    
    <div className="min-h-screen p-10 flex flex-col gap-10">
      <LibraryIntro />
      <LibrarySections />
    </div>
    </>
  );
};

export default LibraryLayout;
