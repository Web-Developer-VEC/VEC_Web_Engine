import Banner from "../../Banner";
import AboutHostel from "./aboutHost";
import HostelFacilities from "./hostalfacilities";
import Warden from "./warden";
import HostelLogin from "./LoginHost";
import Admissions from "./AdmissionHost";
import {useState} from "react";
import SideNav from "../SideNav";
import InfoHostel from "./infohostel";

export default function HostelPage({toggle, theme}) {
    const navData = {
       "About Hostel": <AboutHostel/>,
        "Hostel Facilities": <HostelFacilities />,
        "Warden details": <Warden />,
        // "Mess Timings": <AboutHostel/>,
        // "Study Hours": <AboutHostel />,
        "General info": <InfoHostel/>,
        // "Leave": <AboutHostel />
    }
    const [hos, setHos] = useState(Object.keys(navData)[0])


  return (
    <>
          <Banner toggle={toggle} theme={theme}
        backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
        headerText="VEC Hostel"
        subHeaderText="A home away from home, where comfort meets community and learning thrives in a peaceful, secure environment"
        />
        <SideNav sts={hos} setSts={setHos} navData={navData} />
    </>
  );
}
