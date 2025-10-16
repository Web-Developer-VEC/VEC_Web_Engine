// roleAccess.js
const roleAccessMap = {
  //main Pages
  landing_page_details: ["super_admin"],

  //Top Nav Bar
  research: ["research_admin", "super_admin"],
  exams: ["super_admin", "exam_admin"],
  about_us: ["super_admin"],
  placement: ["super_admin"],
  admissions: ["super_admin"],
  administration: ["super_admin"],
  academics: ["super_admin"],

  //Second Nav Bar
  gallery: ["super_admin", "gallery_admin"],
  help_desk: ["super_admin"],
  hostel_details: ["hostel_admin", "super_admin"],
  other_facilities: ["super_admin"],
  library: ["library_admin", "super_admin"],
  iic: ["iic_admin", "super_admin"],
  transport: ["super_admin"],
  ecell: ["incubation_admin", "super_admin"],
  ncc_navy: ["ncc_navy_admin", "super_admin"],
  ncc_army: ["ncc_army_admin", "super_admin"],
  nss: ["nss_admin", "super_admin"],
  yrc: ["yrc_admin", "super_admin"],
  incubation: ["incubation_admin", "super_admin"],
  iqac: ["iqac_admin", "super_admin"],
  accreditations_and_ranking: ["super_admin"],
  sports: ["super_admin"],
};

module.exports = roleAccessMap;
