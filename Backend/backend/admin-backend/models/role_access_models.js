// roleAccess.js
const roleAccessMap = {
  //main Pages
  landing_page_details: ["super_admin"],

  //Top Nav Bar
  research: ["research_admin", "super_admin"],
  exams: ["super_admin", "exam_admin"],
  about_us: ["super_admin", "about_us_admin"],
  placement: ["super_admin", "placement_admin"],
  admissions: ["super_admin", "admissions_admin"],
  administration: ["super_admin", "administration_admin"],
  academics: ["super_admin", "academics_admin"],

  // dept
  AIDS_001: ["super_admin", "dept_001_admin"],
  AUTO_002: ["super_admin", "dept_002_admin"],
  CHEMISTRY_003: ["super_admin", "dept_003_admin"],
  CIVIL_004: ["super_admin", "dept_004_admin"],
  CSE_005: ["super_admin", "dept_005_admin"],
  CSECS_006: ["super_admin", "dept_006_admin"],
  EEE_007: ["super_admin", "dept_007_admin"],
  EIE_008: ["super_admin", "dept_008_admin"],
  ECE_009: ["super_admin", "dept_009_admin"],
  ENGLISH_010: ["super_admin", "dept_010_admin"],
  IT_011: ["super_admin", "dept_011_admin"],
  MATHS_012: ["super_admin", "dept_012_admin"],
  MECH_013: ["super_admin", "dept_013_admin"],
  TAMIL_014: ["super_admin", "dept_014_admin"],
  PHYSICS_015: ["super_admin", "dept_015_admin"],
  MECSE_016: ["super_admin", "dept_016_admin"],
  MBA_017: ["super_admin", "dept_017_admin"],
  PS_018: ["super_admin", "dept_018_admin"],

  //Second Nav Bar
  gallery: ["super_admin", "gallery_admin"],
  help_desk: ["super_admin","help_desk_admin"],
  hostel_details: ["hostel_admin", "super_admin"],
  other_facilities: ["super_admin","other_facilities_admin"],
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
  accreditations_and_ranking: ["super_admin","accreditation_admin"],
  sports: ["super_admin"],
};

module.exports = roleAccessMap;
