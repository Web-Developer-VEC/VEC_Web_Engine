const express = require('express');
const { getAcademicCalender, getDepartment, getProgrammes } = require('../controllers/acadamicsController');

const router = express.Router();

router.get('/academic-calender', getAcademicCalender);
router.get('/departments_list', getDepartment);
router.get('/programmes_list', getProgrammes);

module.exports = router; 