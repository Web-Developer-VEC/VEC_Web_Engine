const express = require('express');
const { getVisionMission, getHODDetails, getStaffDetails, getSyllabus, getInfrastructure, getDeptActivities, getStuActivities, getSupportStaff, getMou, getRD, getRDyear, getslidebar, getNewsLetters } = require('../controllers/department_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');

const xss = require('../middlewares/xss');
const sanitize = require('../middlewares/sanitize_department');


const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

// Define department routes
router.get('/:deptId/vision&mission', limiter, xss, sanitize, getVisionMission);
router.get('/:deptId/headdepartment', limiter, xss, sanitize, getHODDetails);
router.get('/:deptId/faculties', limiter, xss, sanitize, getStaffDetails);
router.get('/:deptId/syllabus', limiter, xss, sanitize, getSyllabus);
router.get('/:deptId/infrastructure', limiter, xss, sanitize, getInfrastructure);
router.get('/:deptId/activities', limiter, xss, sanitize, getDeptActivities);
router.get('/:deptId/studentachievments', limiter, xss, sanitize, getStuActivities);
router.get('/:deptId/mous', limiter, xss, sanitize, getMou);
router.get('/:deptId/research/:year', limiter, xss, sanitize, getRDyear);
router.get('/:deptId/research', limiter, xss, sanitize, getRD);
router.get('/:deptId/sidebar' ,limiter, xss, sanitize, getslidebar);
router.get('/:deptId/newsletter', limiter, xss, sanitize, getNewsLetters);


module.exports = router;
