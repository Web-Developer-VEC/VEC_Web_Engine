import "react-responsive-carousel/lib/styles/carousel.min.css";
import LIBHod from "./LIBHod";
import { LIBCommitteMembers } from "./committeMembers";
import { LIBServices } from "./services";
import LIBDownloads from "./downloads";
import { LIBResources } from "./resources";
import { LIBMultimedia } from "./multimedia";
import { LIBEresources } from "./e-resources";
import { LIBbookdetails, LIBjournalsdetails } from "./collections";
import LIBMembership from "./LIBMembership";
import LIBFaculty from "./LIBFaculty";

const LibrarySections = ({ data, lib }) => {
  const navData = {
    Collection: {
      Books: <LIBbookdetails data={data} />,
      Journals: <LIBjournalsdetails data={data} />,
    },
    "HOD's message": <LIBHod />,
    Staff: <LIBFaculty />,
    Services: <LIBServices data={data} />,
    "Advisory committee members": <LIBCommitteMembers data={data} />,
    "Membership Details": <LIBMembership data={data} />,
    Downloads: <LIBDownloads data={data} />,
    "Library Resources": <LIBResources data={data} />,
    Multimedia: <LIBMultimedia />,
    "Digital Library & E-Resources": <LIBEresources data={data} />,
  };

  return (
    <>
      <div className="h-auto p-3 md:p-6 lg:p-10 space-y-8 md:space-y-12 lg:space-y-16">
        {Array.isArray(lib) ? navData[lib[0]][lib[1]] : navData[lib]}
      </div>
    </>
  );
};

export default LibrarySections;
