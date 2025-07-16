const express = require('express');
const { getVisionMission, getHODDetails, getStaffDetails, getSyllabus, getInfrastructure, getDeptActivities, getStuActivities, getSupportStaff, getMou, getRD, getRDyear, getslidebar, getNewsLetters } = require('../controllers/departmentController');

const router = express.Router();

// Define department routes
router.get('/:deptId/vision&mission', getVisionMission);
router.get('/:deptId/headdepartment', getHODDetails);
router.get('/:deptId/faculties', getStaffDetails);
router.get('/:deptId/syllabus', getSyllabus);
router.get('/:deptId/infrastructure', getInfrastructure);
router.get('/:deptId/activities', getDeptActivities);
router.get('/:deptId/studentachievments', getStuActivities);
router.get('/:deptId/mous', getMou);
router.get('/:deptId/research/:year', getRDyear);
router.get('/:deptId/research', getRD);
router.get('/:deptId/sidebar' ,getslidebar);
router.get('/:deptId/newsletter', getNewsLetters);


module.exports = router;
