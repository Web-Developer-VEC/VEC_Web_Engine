const express = require('express');
const { getVisionMission, getHODDetails, getStaffDetails, getSyllabus, getInfrastructure, getDeptActivities, getStuActivities, getSupportStaff, getMou, getRD, getRDyear, getslidebar, getNewsLetters } = require('../controllers/department_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

// Define department routes
router.get('/:deptId/vision&mission', limiter, getVisionMission);
router.get('/:deptId/headdepartment', limiter, getHODDetails);
router.get('/:deptId/faculties', limiter, getStaffDetails);
router.get('/:deptId/syllabus', limiter, getSyllabus);
router.get('/:deptId/infrastructure', limiter, getInfrastructure);
router.get('/:deptId/activities', limiter, getDeptActivities);
router.get('/:deptId/studentachievments', limiter, getStuActivities);
router.get('/:deptId/mous', limiter, getMou);
router.get('/:deptId/research/:year', limiter, getRDyear);
router.get('/:deptId/research', limiter, getRD);
router.get('/:deptId/sidebar' ,limiter, getslidebar);
router.get('/:deptId/newsletter', limiter, getNewsLetters);


module.exports = router;
