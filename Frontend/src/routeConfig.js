import { lazy } from 'react';
import DepartmentRoute from "./deptRoute.js"; // Keep this eager if it's not a component or used differently? It's used as 'admin: DepartmentRoute'. Let's check.

// Lazy load components
const Admingallerydetails = lazy(() => import("./Components/Admin/Second_Nav_Bar/Gallery/detailpage"));
const Admingallery = lazy(() => import("./Components/Admin/Second_Nav_Bar/Gallery/gallery"));
const AdminTransport = lazy(() => import("./Components/Admin/Second_Nav_Bar/Transport/Transport"));
const AdminDashboard = lazy(() => import("./Components/Admin/Superier/adminDash"));
const Gallerydetails = lazy(() => import("./Components/Main/Second_Nav_Bar/Gallery/detailpage"));
const Gallery = lazy(() => import("./Components/Main/Second_Nav_Bar/Gallery/gallery"));
const Transport = lazy(() => import("./Components/Main/Second_Nav_Bar/Transport/Transport"));
const AdminIQAC = lazy(() => import("./Components/Admin/Second_Nav_Bar/IQAC/IQAC.jsx"));
const IQAC = lazy(() => import("./Components/Main/Second_Nav_Bar/IQAC/IQAC.jsx"));
const NotFound = lazy(() => import("./NotFound"));
const AdminApprovalPage = lazy(() => import("./Components/Admin/Superier/admin-approval-page.jsx"));
const Consultancy = lazy(() => import("./Components/Main/Top_Nav_Bar/Research/Academicresearch.jsx"));
const AdminConsultancy = lazy(() => import("./Components/Admin/Top_Nav_Bar/Research/Academicresearch.jsx"));
const Journal = lazy(() => import("./Components/Main/Top_Nav_Bar/Research/Journal_publica.jsx"));
const AdminJournal = lazy(() => import("./Components/Admin/Top_Nav_Bar/Research/Journal_publica.jsx"));
const Policies = lazy(() => import("./Components/Main/Top_Nav_Bar/Research/policy.jsx"));
const AdminPolicies = lazy(() => import("./Components/Admin/Top_Nav_Bar/Research/policy.jsx"));
const Funded = lazy(() => import("./Components/Main/Top_Nav_Bar/Research/Funded.jsx"));
const AdminFunded = lazy(() => import("./Components/Admin/Top_Nav_Bar/Research/Funded.jsx"));
const BookChapter = lazy(() => import("./Components/Main/Top_Nav_Bar/Research/BookChapter.jsx"));
const AdminBookChapter = lazy(() => import("./Components/Admin/Top_Nav_Bar/Research/BookChapter.jsx"));
const REGULATION = lazy(() => import("./Components/Main/Top_Nav_Bar/Exams/Regulation.jsx"));
const AdminREGULATION = lazy(() => import("./Components/Admin/Top_Nav_Bar/Exams/Regulation.jsx"));
const Syllabus = lazy(() => import("./Components/Main/Top_Nav_Bar/Exams/Syllabus.jsx"));
const AdminSyllabus = lazy(() => import("./Components/Admin/Top_Nav_Bar/Exams/Syllabus.jsx"));
const Forms = lazy(() => import("./Components/Main/Top_Nav_Bar/Exams/forms.jsx"));
const AdminForms = lazy(() => import("./Components/Admin/Top_Nav_Bar/Exams/forms.jsx"));
const Coe = lazy(() => import("./Components/Main/Top_Nav_Bar/Exams/Coe.jsx"));
const AdminCoe = lazy(() => import("./Components/Admin/Top_Nav_Bar/Exams/Coe.jsx"));
const UgAdmission = lazy(() => import("./Components/Main/Top_Nav_Bar/Admission/UgAdmission.jsx"));
const AdminUgAdmission = lazy(() => import("./Components/Admin/Top_Nav_Bar/Admission/admin_UgAdmission.jsx"));
const ME = lazy(() => import("./Components/Main/Top_Nav_Bar/Admission/ADM-M.E.jsx"));
const AdminME = lazy(() => import("./Components/Admin/Top_Nav_Bar/Admission/admin_ADM-M.E.jsx"));
const MBA = lazy(() => import("./Components/Main/Top_Nav_Bar/Admission/ADM-MBA.jsx"));
const AdminMBA = lazy(() => import("./Components/Admin/Top_Nav_Bar/Admission/admin_ADM-MBA.jsx"));
const ADMteam = lazy(() => import("./Components/Main/Top_Nav_Bar/Admission/ADM-Team.jsx"));
const AdminADMteam = lazy(() => import("./Components/Admin/Top_Nav_Bar/Admission/admin_ADM-Team.jsx"));
const PhdAdmission = lazy(() => import("./Components/Main/Top_Nav_Bar/Admission/PhdAdmission.jsx"));
const AdminPhdAdmission = lazy(() => import("./Components/Admin/Top_Nav_Bar/Admission/admin_PhdAdmission.jsx"));
const Aboutplacement = lazy(() => import("./Components/Main/Top_Nav_Bar/Placements/Aboutplacement.jsx"));
const AdminAboutplacement = lazy(() => import("./Components/Admin/Top_Nav_Bar/Placements/Aboutplacement.jsx"));
const AdminAbtUs = lazy(() => import("./Components/Admin/Top_Nav_Bar/About Us/AbtUs.jsx"))
const AbtUs = lazy(() => import("./Components/Main/Top_Nav_Bar/About Us/AbtUs.jsx"))
const AdminAishe = lazy(() => import("./Components/Admin/Top_Nav_Bar/About Us/Aishe.jsx"))
const Aishe = lazy(() => import("./Components/Main/Top_Nav_Bar/About Us/Aishe.jsx"))

// Named imports handling
const PlacementTeam = lazy(() => import("./Components/Main/Top_Nav_Bar/Placements/PlacementTeam.jsx").then(module => ({ default: module.PlacementTeam })));
const AdminPlacementDetails = lazy(() => import("./Components/Admin/Top_Nav_Bar/Placements/PlacementDetails.jsx").then(module => ({ default: module.AdminPlacementDetails })));
const PlacementDetails = lazy(() => import("./Components/Main/Top_Nav_Bar/Placements/PlacementDetails.jsx").then(module => ({ default: module.PlacementDetails })));
const AdminPlacementTeam = lazy(() => import("./Components/Admin/Top_Nav_Bar/Placements/PlacementTeam.jsx").then(module => ({ default: module.AdminPlacementTeam })));

const HostelPage = lazy(() => import("./Components/Main/Second_Nav_Bar/Hostel/Hostel.jsx"));
const AdminHostelPage = lazy(() => import("./Components/Admin/Second_Nav_Bar/Hostel/Hostel.jsx"));
const GrievanceForm = lazy(() => import("./Components/Main/Second_Nav_Bar/Helpdesk/Grievences.jsx"));
const AdminGrievanceForm = lazy(() => import("./Components/Admin/Second_Nav_Bar/Helpdesk/admin_Grievences.jsx"));
const LibraryLayout = lazy(() => import("./Components/Main/Second_Nav_Bar/library/LibraryLayout.jsx"));
const AdminLibraryLayout = lazy(() => import("./Components/Admin/Second_Nav_Bar/library/LibraryLayout.jsx"));
const AdminPrinc = lazy(() => import("./Components/Admin/Top_Nav_Bar/Administration/Princ.jsx"));
const AdminDean = lazy(() => import("./Components/Admin/Top_Nav_Bar/Administration/dean.jsx"));
const AdminCardPage = lazy(() => import("./Components/Admin/Top_Nav_Bar/Administration/admin.jsx"));
const AdminHandbook = lazy(() => import("./Components/Admin/Top_Nav_Bar/Administration/Handbook.jsx"));
const Princ = lazy(() => import("./Components/Main/Top_Nav_Bar/Administration/Princ.jsx"));
const Dean = lazy(() => import("./Components/Main/Top_Nav_Bar/Administration/dean.jsx"));
const CardPage = lazy(() => import("./Components/Main/Top_Nav_Bar/Administration/admin.jsx"));
const Handbook = lazy(() => import("./Components/Main/Top_Nav_Bar/Administration/Handbook.jsx"));
const NCCMAIN = lazy(() => import("./Components/Main/Second_Nav_Bar/NCC/NCC_MAIN.jsx"));
const AdminNSS = lazy(() => import("./Components/Admin/Second_Nav_Bar/NSS/NSS.jsx"));
const NSS = lazy(() => import("./Components/Main/Second_Nav_Bar/NSS/NSS.jsx"));
const AdminNCCMAIN = lazy(() => import("./Components/Admin/Second_Nav_Bar/NCC/NCC_MAIN.jsx"));
const NCC_NAVY = lazy(() => import("./Components/Main/Second_Nav_Bar/NCC/NCC_NAVY.jsx"));
const AdminNCC_NAVY = lazy(() => import("./Components/Admin/Second_Nav_Bar/NCC/NCC_NAVY.jsx"));
const NCC_ARMY = lazy(() => import("./Components/Main/Second_Nav_Bar/NCC/NCC_ARMY.jsx"));
const AdminNCC_ARMY = lazy(() => import("./Components/Admin/Second_Nav_Bar/NCC/NCC_ARMY.jsx"));
const YRC = lazy(() => import("./Components/Main/Second_Nav_Bar/yrc/YRC.jsx"));
const AdminYrc = lazy(() => import("./Components/Admin/Second_Nav_Bar/yrc/YRC.jsx"));
const AdminProfilePage = lazy(() => import("./Components/Admin/Admin/adminProfile.jsx"));
const Acadamiccal = lazy(() => import("./Components/Main/Top_Nav_Bar/Academics/academicscalendar.jsx"));
const AdminAcadamiccal = lazy(() => import("./Components/Admin/Top_Nav_Bar/Academics/academicscalendar.jsx"));
const Accredation = lazy(() => import("./Components/Main/Second_Nav_Bar/Accredation/Accredation.jsx"));
const AdminAccredation = lazy(() => import("./Components/Admin/Second_Nav_Bar/Accredation/Accredation.jsx"));
const Iic = lazy(() => import("./Components/Main/Second_Nav_Bar/IIC/iic.jsx"));
const AdminIic = lazy(() => import("./Components/Admin/Second_Nav_Bar/IIC/iic.jsx"));
const Incub = lazy(() => import("./Components/Main/Second_Nav_Bar/Incubation/InCub.jsx"));
const AdminIncub = lazy(() => import("./Components/Admin/Second_Nav_Bar/Incubation/InCub.jsx"));
const Ecell = lazy(() => import("./Components/Main/Second_Nav_Bar/E-cell/aboutEcell.jsx"));
const AdminEcell = lazy(() => import("./Components/Admin/Second_Nav_Bar/E-cell/aboutEcell.jsx"));
const DepartmentPage = lazy(() => import("./Components/Main/Top_Nav_Bar/Academics/DepartmentPage.jsx"));
const AcademicDepartments = lazy(() => import("./Components/Main/Top_Nav_Bar/Academics/Department.jsx"));
const AdminAcademicDepartments = lazy(() => import("./Components/Admin/Top_Nav_Bar/Academics/Department.jsx"));
const Programmes = lazy(() => import("./Components/Main/Top_Nav_Bar/Academics/Programmes.jsx"));
const AdminProgrammes = lazy(() => import("./Components/Admin/Top_Nav_Bar/Academics/Programmes.jsx"));
const AdminSportsPage = lazy(() => import("./Components/Admin/Second_Nav_Bar/sports/admin_SportsPage.jsx"));
const SportsPage = lazy(() => import("./Components/Main/Second_Nav_Bar/sports/SportsPage.jsx"));


export const routeConfig = {

  // Landing Page Route
  // "/": { normal: LandingPage, admin: AdminLandingPage },

  // --------------------------------------------------
  //                     Top Nav Bar
  // --------------------------------------------------

  // About us Routes
  "/abt-us": { normal: AbtUs, admin: AdminAbtUs },
  "/abt-yr": { normal: Aishe, admin: AdminAishe},
  // Administrator Routes
  "/principal": { normal: Princ, admin: AdminPrinc },
  "/dean": { normal: Dean, admin: AdminDean },
  "/admin": { normal: CardPage, admin: AdminCardPage },
  "/handbook": { normal: Handbook, admin: AdminHandbook },

  // Academics Routes
  "/dept/:deptID": { normal: DepartmentPage, admin: DepartmentRoute },
  "/departments": { normal: AcademicDepartments, admin: AdminAcademicDepartments },
  "/programs": { normal: Programmes, admin: AdminProgrammes },
  "/acadamiccal": { normal: Acadamiccal, admin: AdminAcadamiccal },

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

  // --------------------------------------------------
  //                     Second Nav Bar
  // --------------------------------------------------

  "/library": { normal: LibraryLayout, admin: AdminLibraryLayout },
  "/iqac": { normal: IQAC, admin: AdminIQAC },
  '/incubation': { normal: Incub, admin: AdminIncub },
  "/ecell": { normal: Ecell, admin: AdminEcell },
  "/Accredation": { normal: Accredation, admin: AdminAccredation },
  "/iic": { normal: Iic, admin: AdminIic },
  "/NSS": { normal: NSS, admin: AdminNSS },
  "/NCC": { normal: NCCMAIN, admin: AdminNCCMAIN },
  "/nccnavy": { normal: NCC_NAVY, admin: AdminNCC_NAVY },
  "/nccarmy": { normal: NCC_ARMY, admin: AdminNCC_ARMY },
  "/YRC": { normal: YRC, admin: AdminYrc },
  "/sports": { normal: SportsPage, admin: AdminSportsPage },
  "/transport": { normal: Transport, admin: AdminTransport },
  "/hosLanding": { normal: HostelPage, admin: AdminHostelPage },
  "/grievances": { normal: GrievanceForm, admin: AdminGrievanceForm },
  "/gallery": { normal: Gallery, admin: Admingallery },
  "/gallery_details": { normal: Gallerydetails, admin: Admingallerydetails },

  // Superior Admin Routes
  "/admin_dash": { normal: NotFound, admin: AdminDashboard },
  "/admin_approval": { normal: NotFound, admin: AdminApprovalPage },
  "/admin_profile": { normal: NotFound, admin: AdminProfilePage }
};