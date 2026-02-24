const galleryHandler = require("../controllers/second_navbar/gallery_controllers/gallery_busboy");
const transportHandler = require("../controllers/second_navbar/transport_controllers/transport_busboy");
const iqacHandler = require("../controllers/second_navbar/iqac_controller/iqac_busboy");
const aboutusHandler = require("../controllers/top_navbar/about_us_controllers/about_us_busboy");
const administrationHandler = require("../controllers/top_navbar/administration_controllers/administration_busboy");
const landingpageHandler = require("../controllers/landing_page_controllers/landing_page_busboy");
const accreditations_and_rankingHandler = require("../controllers/second_navbar/accreditations_and_ranking_controllers/accreditations_and_ranking_busboy");
const ecellHandler = require("../controllers/second_navbar/ecell_controller/e_cell_busboy");
const hostelHandler = require("../controllers/second_navbar/hostel_controllers/hostel_busboy");
const incubationHandler = require("../controllers/second_navbar/incubation_controllers/incubation_busboy");
const sportsHandler = require("../controllers/second_navbar/sports_controllers/sports_busboy");
const iicHandler = require("../controllers/second_navbar/iic_controllers/iic_busboy");
const libraryHandler = require("../controllers/second_navbar/library_controllers/library_busboy");
const yrcHandler = require("../controllers/second_navbar/yrc_controllers/yrc_busboy");
const armyHandler = require("../controllers/second_navbar/ncc_army_controllers/army_busboy");
const navyHandler = require("../controllers/second_navbar/ncc_navy_controllers/navy_busboy");
const nssHandler = require("../controllers/second_navbar/nss_controllers/nss_busboy");
const researchHandler = require("../controllers/top_navbar/research_controllers/research_busboy");
const placementHandler = require("../controllers/top_navbar/placement_controllers/placement_busboy");
const examHandler = require("../controllers/top_navbar/exams_controllers/exams_busboy");
const facultyHandler = require("../controllers/top_navbar/academics_controllers/faculty_controllers/faculties_busboy");
const hodHandler = require("../controllers/top_navbar/academics_controllers/hod_controllers/hod_busboy");
const admissionsHandler = require("../controllers/top_navbar/admission_controllers/admission_busboy")
const otherFacilitiesHandler = require("../controllers/second_navbar/other_facilities_controllers/other_facilties_busboy")
const academiccalendarHandler = require("../controllers/top_navbar/academics_controllers/academic_calendar_controllers/calendar_busboy")
const newsletterHandler = require("../controllers/top_navbar/academics_controllers/newsletter_controllers/newsletterbusboy");
const studentAchievementsHandler = require("../controllers/top_navbar/academics_controllers/student_achievments_controllers/achivementsbusboy");
const syllabusHandler = require("../controllers/top_navbar/academics_controllers/syllabus_controllers/syllabus_busboy");
const pedagogyHandler = require("../controllers/top_navbar/academics_controllers/pedagogy_controllers/pedagogy_busboy");
const activitiesHandler = require("../controllers/top_navbar/academics_controllers/activities_controllers/activities_busboy");
const infrastructureHandler = require("../controllers/top_navbar/academics_controllers/infrastructure_controllers/infrastructure_busboy");
const deptresearchHandler = require("../controllers/top_navbar/academics_controllers/research_controllers/research_busboy");

const busboyModels = {
  // Testing Complete
  about_us: aboutusHandler,
  administration: administrationHandler,
  transport: transportHandler,
  admissions: admissionsHandler,

  // Testing Incomplete


  gallery: galleryHandler,
  iqac: iqacHandler,
  landing_page_details: landingpageHandler,
  accreditations_and_ranking: accreditations_and_rankingHandler,
  ecell: ecellHandler,
  hostel_details: hostelHandler,
  incubation: incubationHandler,
  sports: sportsHandler,
  iic: iicHandler,
  library: libraryHandler,
  yrc: yrcHandler,
  ncc_army: armyHandler,
  ncc_navy: navyHandler,
  nss: nssHandler,
  research: researchHandler,
  placement: placementHandler,
  exams: examHandler,
  other_facilities: otherFacilitiesHandler,
  
 
  // ACADEMICS 
  academics: academiccalendarHandler,
  //AIDS
  AIDS_001: {
  newsletter: newsletterHandler,
  faculty: facultyHandler,
  hod: hodHandler,
  achievements: studentAchievementsHandler,
  curriculum_and_syllabus:syllabusHandler,
  activities: activitiesHandler,
  pedagogy:pedagogyHandler,
  infrastructure:infrastructureHandler,
  research:deptresearchHandler
},

  //IT
  IT_011: {
  newsletter: newsletterHandler,
  faculty: facultyHandler,
  hod: hodHandler,
  achievements: studentAchievementsHandler,
  curriculum_and_syllabus:syllabusHandler,
  activities: activitiesHandler,
  pedagogy:pedagogyHandler,
  infrastructure:infrastructureHandler,
  research:deptresearchHandler
},
  //AUTO
  AUTO_002:{
  newsletter: newsletterHandler,
  faculty: facultyHandler,
  hod: hodHandler,
  achievements: studentAchievementsHandler,
  curriculum_and_syllabus:syllabusHandler,
  activities: activitiesHandler,
  pedagogy:pedagogyHandler,
  infrastructure:infrastructureHandler,
  research:deptresearchHandler
},
  //CHEMISTRY
  CHEMISTRY_003: {
  newsletter: newsletterHandler,
  faculty: facultyHandler,
  hod: hodHandler,
  achievements: studentAchievementsHandler,
  curriculum_and_syllabus:syllabusHandler,
  activities: activitiesHandler,
  pedagogy:pedagogyHandler,
  infrastructure:infrastructureHandler,
  research:deptresearchHandler
},
  //CIVIL
  CIVIL_004: {
  newsletter: newsletterHandler,
  faculty: facultyHandler,
  hod: hodHandler,
  achievements: studentAchievementsHandler,
  curriculum_and_syllabus:syllabusHandler,
  activities: activitiesHandler,
  pedagogy:pedagogyHandler,
  infrastructure:infrastructureHandler,
  research:deptresearchHandler
},
  
   //CSE
  CSE_005: {
  newsletter: newsletterHandler,
  faculty: facultyHandler,
  hod: hodHandler,
  achievements: studentAchievementsHandler,
  curriculum_and_syllabus:syllabusHandler,
  activities: activitiesHandler,
  pedagogy:pedagogyHandler,
  infrastructure:infrastructureHandler,
  research:deptresearchHandler
},
   //CSECS
  CSECS_006: {
  newsletter: newsletterHandler,
  faculty: facultyHandler,
  hod: hodHandler,
  achievements: studentAchievementsHandler,
  curriculum_and_syllabus:syllabusHandler,
  activities: activitiesHandler,
  pedagogy:pedagogyHandler,
  infrastructure:infrastructureHandler,
  research:deptresearchHandler
},
   //EEE
  EEE_007:{
  newsletter: newsletterHandler,
  faculty: facultyHandler,
  hod: hodHandler,
  achievements: studentAchievementsHandler,
  curriculum_and_syllabus:syllabusHandler,
  activities: activitiesHandler,
  pedagogy:pedagogyHandler,
  infrastructure:infrastructureHandler,
  research:deptresearchHandler
},
  //EIE
  EIE_008:{
  newsletter: newsletterHandler,
  faculty: facultyHandler,
  hod: hodHandler,
  achievements: studentAchievementsHandler,
  curriculum_and_syllabus:syllabusHandler,
  activities: activitiesHandler,
  pedagogy:pedagogyHandler,
  infrastructure:infrastructureHandler,
  research:deptresearchHandler
},
  //ECE
  ECE_009:{
  newsletter: newsletterHandler,
  faculty: facultyHandler,
  hod: hodHandler,
  achievements: studentAchievementsHandler,
  curriculum_and_syllabus:syllabusHandler,
  activities: activitiesHandler,
  pedagogy:pedagogyHandler,
  infrastructure:infrastructureHandler,
  research:deptresearchHandler
},
  //ENGLISH
  ENGLISH_010:{
  newsletter: newsletterHandler,
  faculty: facultyHandler,
  hod: hodHandler,
  achievements: studentAchievementsHandler,
  curriculum_and_syllabus:syllabusHandler,
  activities: activitiesHandler,
  pedagogy:pedagogyHandler,
  infrastructure:infrastructureHandler,
  research:deptresearchHandler
},
  //MATH
  MATHS_012: {
  newsletter: newsletterHandler,
  faculty: facultyHandler,
  hod: hodHandler,
  achievements: studentAchievementsHandler,
  curriculum_and_syllabus:syllabusHandler,
  activities: activitiesHandler,
  pedagogy:pedagogyHandler,
  infrastructure:infrastructureHandler,
  research:deptresearchHandler
},
  //MECH
  MECH_013:{
  newsletter: newsletterHandler,
  faculty: facultyHandler,
  hod: hodHandler,
  achievements: studentAchievementsHandler,
  curriculum_and_syllabus:syllabusHandler,
  activities: activitiesHandler,
  pedagogy:pedagogyHandler,
  infrastructure:infrastructureHandler,
  research:deptresearchHandler
},
   //TAMIL
  TAMIL_014:{
  newsletter: newsletterHandler,
  faculty: facultyHandler,
  hod: hodHandler,
  achievements: studentAchievementsHandler,
  curriculum_and_syllabus:syllabusHandler,
  activities: activitiesHandler,
  pedagogy:pedagogyHandler,
  infrastructure:infrastructureHandler,
  research:deptresearchHandler
},
   //PHYSICS
  PHYSICS_015: {
  newsletter: newsletterHandler,
  faculty: facultyHandler,
  hod: hodHandler,
  achievements: studentAchievementsHandler,
  curriculum_and_syllabus:syllabusHandler,
  activities: activitiesHandler,
  pedagogy:pedagogyHandler,
  infrastructure:infrastructureHandler,
  research:deptresearchHandler
},
   //MECSE
  MECSE_016:{
  newsletter: newsletterHandler,
  faculty: facultyHandler,
  hod: hodHandler,
  achievements: studentAchievementsHandler,
  curriculum_and_syllabus:syllabusHandler,
  activities: activitiesHandler,
  pedagogy:pedagogyHandler,
  infrastructure:infrastructureHandler,
  research:deptresearchHandler
},
   //MBA
  MBA_017:{
  newsletter: newsletterHandler,
  faculty: facultyHandler,
  hod: hodHandler,
  achievements: studentAchievementsHandler,
  curriculum_and_syllabus:syllabusHandler,
  activities: activitiesHandler,
  pedagogy:pedagogyHandler,
  infrastructure:infrastructureHandler,
  research:deptresearchHandler
},
   //PS
  PS_018:{
  newsletter: newsletterHandler,
  faculty: facultyHandler,
  hod: hodHandler,
  achievements: studentAchievementsHandler,
  curriculum_and_syllabus:syllabusHandler,
  activities: activitiesHandler,
  pedagogy:pedagogyHandler,
  infrastructure:infrastructureHandler,
  research:deptresearchHandler
}}

module.exports = busboyModels;