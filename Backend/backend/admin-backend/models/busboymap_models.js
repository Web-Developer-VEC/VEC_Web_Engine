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

const busboyModels = {
  // Testing Complete

  // Testing Incomplete
  about_us: aboutusHandler,
  administration: administrationHandler,
  gallery: galleryHandler,
  transport: transportHandler,
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
  facultyHandler,
  hodHandler,
};

module.exports = busboyModels;
