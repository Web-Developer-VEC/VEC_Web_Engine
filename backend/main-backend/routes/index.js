const express = require('express');

const router = express.Router();

const about_us = require('./about_us_routes');
const acadamic = require('./academic_routes');
const administration = require('./administration_routes');
const admission = require('./admission_routes');
const allform = require('./allform_routes');
const announcement = require('./announcement_routes');
const banner = require('./banner_routes');
const coe = require('./coe_routes');
const department = require('./department_routes');
const event = require('./event_routes');
const extra_curricular_club = require('./extra_curricular_club_routes');
const gallery = require('./gallery_routes');
const grievance = require('./grievance_routes');
const hostel = require('./hostel_routes');
const incubation = require('./incubation_routes');
const intake = require('./intake_routes');
const landing = require('./landing_routes');
const library = require('./library_routes');
const overall_research = require('./overall_research_routes');
const placement = require('./placement_routes');
const regulation = require('./regulation_routes');
const second_navbar = require('./second_navbar_routes');
const sport = require('./sport_routes');
const staff_profile = require('./staff_profile_routes');
const warden = require('./warden_routes');
const web_team = require('./web_team_routes')
const log = require('./log_routes')

router.use('', about_us);
router.use('', acadamic);
router.use('', administration);
router.use('', admission);
router.use('', allform);
router.use('', announcement);
router.use('', banner);
router.use('', coe);
router.use('', department);
router.use('', event);
router.use('', extra_curricular_club);
router.use('', gallery);
router.use('', grievance);
router.use('', hostel);
router.use('', incubation);
router.use('', intake);
router.use('', landing);
router.use('', library);
router.use('', overall_research);
router.use('', placement);
router.use('', regulation);
router.use('', second_navbar);
router.use('', sport);
router.use('', staff_profile);
router.use('', warden);
router.use('', web_team);
router.use('', log);

module.exports = router;
