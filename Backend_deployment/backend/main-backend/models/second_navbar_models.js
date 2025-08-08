const ALLOWED_IQAC_TYPES = [
  'objectives',
  'coordinator',
  'members',
  'minutes_of_meetings',
  'academic_admin_audit',
  'gallery',
  'strategic_plan',
  'best_practices',
  'institutional_distinctiveness',
  'code_of_ethics',
  'aqar',
  'iso_certificate'
];

const ALLOWED_ACCREDITATION_TYPES = [
  'naac',
  'nba',
  'qs_rating',
  'nirf'
];

const ALLOWED_IIC_TYPES = [
  'home', 
  'establishment',
  'faculty',
  'expert_representation',
  'student_representation',
  'iic3',
  'iic4',
  'iic5',
  'iic6',
  'iic7',
  'kapila',
  'mentee',
  'yukti',
  'certificate',
  'policy',
  'contact'
];

const ALLOWED_INCUBATION_TYPES = [
  'home',
  'start_up',
  'incubation_committee',
  'facilities',
  'projects',
  'patent',
  'seed_money'
];

const ALLOWED_ECELL_TYPES = [
  'about',
  'committee',
  'enterpreneur',
  'activity',
  'gallery'
];

const ALLOWED_TRANSPORT_TYPES = [
  'transport'
];

const ALLOWED_OTHER_FACILITIES_TYPES = [
  'other_facilities'
];

// ✅ Export all allowed types
module.exports = {
  ALLOWED_IQAC_TYPES,
  ALLOWED_ACCREDITATION_TYPES,
  ALLOWED_IIC_TYPES,
  ALLOWED_INCUBATION_TYPES,
  ALLOWED_ECELL_TYPES,
  ALLOWED_TRANSPORT_TYPES,
  ALLOWED_OTHER_FACILITIES_TYPES
};
