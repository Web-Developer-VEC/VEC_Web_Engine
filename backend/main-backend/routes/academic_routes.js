const express = require('express');

const { getAcademicCalender, getDepartment, getProgrammes } = require('../controllers/academic_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();


router.get('/academic-calender', limiter, getAcademicCalender);
router.get('/departments_list', limiter, getDepartment);
router.get('/programmes_list', limiter, getProgrammes);

module.exports = router; 