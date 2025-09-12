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
import AdminApprovalPage from "./Components/Admin/Superier/admin-approval-page.jsx";
import Consultancy from "./Components/Main/Top_Nav_Bar/Research/Academicresearch.jsx";
import AdminConsultancy from "./Components/Admin/Top_Nav_Bar/Research/Academicresearch.jsx";
import Journal from "./Components/Main/Top_Nav_Bar/Research/Journal_publica.jsx";
import AdminJournal from "./Components/Admin/Top_Nav_Bar/Research/Journal_publica.jsx";
import Policies from "./Components/Main/Top_Nav_Bar/Research/policy.jsx";
import AdminPolicies from "./Components/Admin/Top_Nav_Bar/Research/policy.jsx";
import Funded from "./Components/Main/Top_Nav_Bar/Research/Funded.jsx";
import AdminFunded from "./Components/Admin/Top_Nav_Bar/Research/Funded.jsx";
import BookChapter from "./Components/Main/Top_Nav_Bar/Research/BookChapter.jsx";
import AdminBookChapter from "./Components/Admin/Top_Nav_Bar/Research/BookChapter.jsx";
import REGULATION from "./Components/Main/Top_Nav_Bar/Exams/Regulation.jsx";
import AdminREGULATION from "./Components/Admin/Top_Nav_Bar/Exams/Regulation.jsx";
import Syllabus from "./Components/Main/Top_Nav_Bar/Exams/Syllabus.jsx";
import AdminSyllabus from "./Components/Admin/Top_Nav_Bar/Exams/Syllabus.jsx";
import Forms from "./Components/Main/Top_Nav_Bar/Exams/forms.jsx";
import AdminForms from "./Components/Admin/Top_Nav_Bar/Exams/forms.jsx";
import Coe from "./Components/Main/Top_Nav_Bar/Exams/Coe.jsx";
import AdminCoe from "./Components/Admin/Top_Nav_Bar/Exams/Coe.jsx";
import UgAdmission from "./Components/Main/Top_Nav_Bar/Admission/UgAdmission.jsx";
import AdminUgAdmission from "./Components/Admin/Top_Nav_Bar/Admission/admin_UgAdmission.jsx";
import ME from "./Components/Main/Top_Nav_Bar/Admission/ADM-M.E.jsx";
import AdminME from "./Components/Admin/Top_Nav_Bar/Admission/admin_ADM-M.E.jsx";
import MBA from "./Components/Main/Top_Nav_Bar/Admission/ADM-MBA.jsx";
import AdminMBA from "./Components/Admin/Top_Nav_Bar/Admission/admin_ADM-MBA.jsx";
import ADMteam from "./Components/Main/Top_Nav_Bar/Admission/ADM-Team.jsx";
import AdminADMteam from "./Components/Admin/Top_Nav_Bar/Admission/admin_ADM-Team.jsx";
import PhdAdmission from "./Components/Main/Top_Nav_Bar/Admission/PhdAdmission.jsx";
import AdminPhdAdmission from "./Components/Admin/Top_Nav_Bar/Admission/admin_PhdAdmission.jsx";
import Aboutplacement from "./Components/Main/Top_Nav_Bar/Placements/Aboutplacement.jsx";
import AdminAboutplacement from "./Components/Admin/Top_Nav_Bar/Placements/Aboutplacement.jsx";
import { PlacementTeam } from "./Components/Main/Top_Nav_Bar/Placements/PlacementTeam.jsx";
import { AdminPlacementDetails } from "./Components/Admin/Top_Nav_Bar/Placements/PlacementDetails.jsx";
import { PlacementDetails } from "./Components/Main/Top_Nav_Bar/Placements/PlacementDetails.jsx";
import { AdminPlacementTeam } from "./Components/Admin/Top_Nav_Bar/Placements/PlacementTeam.jsx";
import HostelPage from "./Components/Main/Second_Nav_Bar/Hostel/Hostel.jsx";
import AdminHostelPage from "./Components/Admin/Second_Nav_Bar/Hostel/Hostel.jsx";
import GrievanceForm from "./Components/Main/Second_Nav_Bar/Helpdesk/Grievences.jsx";
import AdminGrievanceForm from "./Components/Admin/Second_Nav_Bar/Helpdesk/admin_Grievences.jsx";
import LibraryLayout from "./Components/Main/Second_Nav_Bar/library/LibraryLayout.jsx";
import AdminLibraryLayout from "./Components/Admin/Second_Nav_Bar/library/LibraryLayout.jsx";

export const routeConfig = {

  // Landing Page Route
  "/": { normal: LandingPage, admin: LandingPage },

  // Top Nav Bar

  // About us Routes
  // Administrator Routes
  // Academics Routes

  // Admission Routes
  "/ug": { normal: UgAdmission, admin: AdminUgAdmission },
  "/m_e": { normal: ME, admin: AdminME },
  "/mba": { normal: MBA, admin: AdminMBA },
  "/phd": { normal: PhdAdmission, admin: AdminPhdAdmission },
  "/admission-team": { normal: ADMteam, admin: AdminADMteam },

  // Exams Routes
  "/reg": { normal: REGULATION, admin: AdminREGULATION },
  "/Syllabus": { normal: Syllabus, admin: AdminSyllabus },
  "/form": { normal: Forms, admin: AdminForms },
  "/coe": { normal: Coe, admin: AdminCoe },

  // Research Routes
  "/Consultancy": { normal: Consultancy, admin: AdminConsultancy },
  "/Journal": { normal: Journal, admin: AdminJournal },
  "/Funded": { normal: Funded, admin: AdminFunded },
  "/policies": { normal: Policies, admin: AdminPolicies },
  "/Book_Chapter": { normal: BookChapter, admin: AdminBookChapter },

  // Placements Routes
  "/abtplace": { normal: Aboutplacement, admin: AdminAboutplacement },
  "/place-team": { normal: PlacementTeam, admin: AdminPlacementTeam },
  "/place-dep": { normal: PlacementDetails, admin: AdminPlacementDetails },

  // Second Nav Bar Routes
  "/library": { normal: LibraryLayout, admin: AdminLibraryLayout },
  "/iqac": { normal: IQAC, admin: AdminIQAC },
  "/transport": { normal: Transport, admin: AdminTransport },
  "/hosLanding": { normal: HostelPage, admin: AdminHostelPage },
  "/grievances": { normal: GrievanceForm, admin: AdminGrievanceForm },
  "/gallery": { normal: Gallery, admin: Admingallery },
  "/gallery_details": { normal: Gallerydetails, admin: Admingallerydetails },
  
  // Superior Admin Routes
  "/admin_dash": { normal: NotFound, admin: AdminDashboard },
  "/admin_approval": { normal: NotFound, admin: AdminApprovalPage },
};