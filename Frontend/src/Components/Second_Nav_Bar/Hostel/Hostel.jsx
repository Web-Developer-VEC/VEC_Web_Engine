import Banner from "../../Banner";
import AboutHostel from "./aboutHost";
import HostelFacilities from "./hostalfacilities";
import Warden from "./warden";
import HostelLogin from "./LoginHost";
import Admissions from "./AdmissionHost";

export default function HostelPage({toggle, theme}) {
  return (
    <>
          <Banner toggle={toggle} theme={theme}
        backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
        headerText="VEC Hostel"
        subHeaderText="A home away from home, where comfort meets community and learning thrives in a peaceful, secure environment"
        />
    <div className="min-h-screen flex flex-col items-center p-6">

      {/* About Hostel  */}

      <AboutHostel />
      <HostelFacilities />
      {/* <HostelLogin/> */}
      <Warden />
      {/* <Admissions/> */}
    </div>
    </>
  );
}
