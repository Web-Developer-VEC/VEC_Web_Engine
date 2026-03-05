const allowedtypes = new Set([
  'vision_and_mission',
  'hod',
  'faculty',
  'curriculum_and_syllabus',
  'newsletter',
  'activities',
  'pedagogy',
  'student_achievements',
  'infrastructure',
  'mous',
  'research'
]);

const ALLOWED_DEPARTMENTS = [
    "AIDS_001",
    "AUTO_002",
    "CHEMISTRY_003",
    "CIVIL_004",
    "CSE_005",
    "CSECS_006",
    "EEE_007",
    "EIE_008",
    "ECE_009",
    "ENGLISH_010",
    "IT_011",
    "MATHS_012",
    "MECH_013",
    "TAMIL_014",
    "PHYSICS_015",
    "MECSE_016",
    "MBA_017",
    "PS_018"
];

const deptIdMap = {
  "AIDS_001": "001",
  "AUTO_002": "002",
  "CHEMISTRY_003": "003",
  "CIVIL_004": "004",
  "CSE_005": "005",
  "CSECS_006": "006",
  "EEE_007": "007",
  "EIE_008": "008",
  "ECE_009": "009",
  "ENGLISH_010": "010",
  "IT_011": "011",
  "MATHS_012": "012",
  "MECH_013": "013",
  "TAMIL_014": "014",
  "PHYSICS_015": "015",
  "MECSE_016": "016",
  "MBA_017": "017",
  "PS_018": "018"
}

const deptMap = {
  "AIDS_001": "Artificial Intelligence and Data Science (AI&DS)",
  "AUTO_002": "Automobile Engineering (AUTO)",
  "CHEMISTRY_003": "Chemistry",
  "CIVIL_004": "Civil Engineering (CIVIL)",
  "CSE_005": "Computer Science and Engineering (CSE)",
  "CSECS_006": "Computer Science and Engineering (Cyber Security)",
  "EEE_007": "Electrical and Electronics Engineering (EEE)",
  "EIE_008": "Electronics and Instrumentation Engineering (EIE)",
  "ECE_009": "Electronics and Communication Engineering (ECE)",
  "ENGLISH_010": "English",
  "IT_011": "Information Technology (IT)",
  "MATHS_012": "Mathematics",
  "MECH_013": "Mechanical Engineering (MECH)",
  "TAMIL_014": "Tamil",
  "PHYSICS_015": "Physics",
  "MECSE_016": "M.E. COMPUTER SCIENCE ENGINEERING",
  "MBA_017": "Master of Business Administration",
  "PS_018": "Physical Sciences"
}


const DEPARTMENT_CODE_MAP = ALLOWED_DEPARTMENTS.reduce((acc, dept) => {
    const code = dept.split("_")[1];
    acc[code] = dept;
    return acc;
}, {});

module.exports = {
    allowedtypes,
    ALLOWED_DEPARTMENTS,
    DEPARTMENT_CODE_MAP,
    deptIdMap,
    deptMap
};