const express = require('express');
const { getAcademicCalender } = require('../controllers/acadamicsController');

const router = express.Router();

router.get('/academic-calender', getAcademicCalender);

module.exports = router; 