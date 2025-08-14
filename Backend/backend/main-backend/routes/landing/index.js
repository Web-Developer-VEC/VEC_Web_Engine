const express = require('express');

const router = express.Router();

const about_us = require('../top_navbar/about_us_routes');
const acadamic = require('../top_navbar/academic_routes');
const accrediation = require ('../second_navbar/accreditation_routes');
const administration = require('../top_navbar/administration_routes');
const admission = require('../top_navbar/admission_routes');
const ecell = require('../second_navbar/ecell_routes');
const iic_form = require('../second_navbar/iic_form_routes');
const iic = require('../second_navbar/iic_routes');
const incubation = require('../second_navbar/incubation_routes');
const iqac = require('../second_navbar/iqac_routes');
const ncc_army = require('../second_navbar/ncc_army_routes');
const ncc_navy = require('../second_navbar/ncc_navy_routes');
const nss = require('../second_navbar/nss_routes');
const other_faculties = require('../second_navbar/other_facilities');
const transport = require('../second_navbar/transport_routes');
const yrc = require('../second_navbar/yrc_routes');
const exam = require('../top_navbar/exam_routes');
const placement = require('../top_navbar/placement_routes');
const department = require('../top_navbar/department_routes');
const gallery = require('../second_navbar/gallery_routes');
const grievance = require('../second_navbar/grievance_routes');
const hostel = require('../second_navbar/hostel_routes');
const landing = require('./landing_routes');
const library = require('../second_navbar/library_routes');
const sport = require('../second_navbar/sport_routes');
const web_team = require('./web_team_routes')
const log = require('./log_routes')
const feedback = require('../second_navbar/feedback_routes');
const research = require('../top_navbar/research_routes')

router.use('', about_us);
router.use('', acadamic);
router.use('',accrediation);
router.use('', administration);
router.use('', admission);
router.use('',iic),
router.use('',iic_form),
router.use('',incubation),
router.use('',iqac),
router.use('',ncc_army),
router.use('',nss),
router.use('',ncc_navy),
router.use('',other_faculties),
router.use('',yrc),
router.use('',transport),
router.use('',ecell);
router.use('', exam);
router.use('', placement);
router.use('', department);
router.use('', gallery);
router.use('', grievance);
router.use('', hostel);
router.use('', landing);
router.use('', library);
router.use('', sport);
router.use('', web_team);
router.use('', log);
router.use('', feedback);
router.use('', research )

module.exports = router;
