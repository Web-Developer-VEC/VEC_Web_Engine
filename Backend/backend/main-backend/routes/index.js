const express = require('express');

const router = express.Router();

const about_us = require('./about_us_routes');
const acadamic = require('./academic_routes');
const administration = require('./administration_routes');
const admission = require('./admission_routes');
const exam = require('./exam_routes');
const placement = require('./placement_routes');
const department = require('./department_routes');
const extra_curricular_club = require('./extra_curricular_club_routes');
const gallery = require('./gallery_routes');
const grievance = require('./grievance_routes');
const hostel = require('./hostel_routes');
const landing = require('./landing_routes');
const library = require('./library_routes');
const second_navbar = require('./second_navbar_routes');
const sport = require('./sport_routes');
const web_team = require('./web_team_routes')
const log = require('./log_routes')
const feedback = require('./feedback_routes');
const research = require('./research_routes')

router.use('', about_us);
router.use('', acadamic);
router.use('', administration);
router.use('', admission);
router.use('', exam);
router.use('', placement);
router.use('', department);
router.use('', extra_curricular_club);
router.use('', gallery);
router.use('', grievance);
router.use('', hostel);
router.use('', landing);
router.use('', library);
router.use('', second_navbar);
router.use('', sport);
router.use('', web_team);
router.use('', log);
router.use('', feedback);
router.use('', research )

module.exports = router;
