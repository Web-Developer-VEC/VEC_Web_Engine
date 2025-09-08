import Admingallerydetails from "./Components/Admin/Second_Nav_Bar/Gallery/detailpage";
import Admingallery from "./Components/Admin/Second_Nav_Bar/Gallery/gallery";
import AdminTransport from "./Components/Admin/Second_Nav_Bar/Transport/Transport";
import AdminDashboard from "./Components/Admin/Superier/adminDash";
import Gallerydetails from "./Components/Main/Second_Nav_Bar/Gallery/detailpage";
import Gallery from "./Components/Main/Second_Nav_Bar/Gallery/gallery";
import Transport from "./Components/Main/Second_Nav_Bar/Transport/Transport";
import AdminIQAC from "./Components/Admin/Second_Nav_Bar/IQAC/IQAC.jsx";
import IQAC from "./Components/Main/Second_Nav_Bar/IQAC/IQAC.jsx";
import LandingPage from "./Landing";
import NotFound from "./NotFound";

export const routeConfig = {
  "/gallery": { normal: Gallery, admin: Admingallery },
  "/transport": { normal: Transport, admin: AdminTransport },
  "/gallery_details": { normal: Gallerydetails, admin: Admingallerydetails},
  "/admin_dash": { normal: NotFound, admin: AdminDashboard},
  "/iqac": { normal: IQAC, admin: AdminIQAC },
  "/": {normal: LandingPage, admin: LandingPage}
};