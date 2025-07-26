const express = require('express');

const { getAcademicCalender, getDepartment, getProgrammes } = require('../controllers/academic_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');


const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();


router.get('/academic-calender', limiter, xss, getAcademicCalender);
router.get('/departments_list', limiter, xss, getDepartment);
router.get('/programmes_list', limiter, xss, getProgrammes);

module.exports = router; 